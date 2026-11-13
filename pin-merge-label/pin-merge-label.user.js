// ==UserScript==
// @name         GitHub - Pin Merge Label
// @namespace    local.github.label-sorting
// @version      1.0.1
// @description  Move the merge label to the top of GitHub label selectors
// @match        https://github.com/*
// @match        https://cc-github.bmwgroup.net/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Guard against double injection (e.g. script installed twice).
    if (window.__pinMergeLabelInstalled) return;
    window.__pinMergeLabelInstalled = true;

    const PINNED = 'merge';

    // Only touch PR / issue pages (incl. "new issue" and "compare" PR creation).
    const PATH_RE = /^\/[^/]+\/[^/]+\/(?:pull\/\d+|issues\/(?:\d+|new)|compare\/)/;

    // Entries of a label list: modern select panel, ARIA listbox, legacy select-menu.
    const ITEM_SEL = '[role="option"], [role="menuitemcheckbox"], .select-menu-item, label.select-menu-item';

    // Containers that may hold a label list.
    const SCOPE_SEL = [
        'select-panel', 'anchored-position', 'details-menu', '[role="dialog"]',
        '.select-menu-modal', '.js-discussion-sidebar-item', '[data-testid*="label" i]'
    ].join(',');

    // Elements that carry the bare label name (without description).
    const NAME_SEL = '[data-label-name], .js-label-name, .name, [class*="LabelName"], [data-name]';

    function isLabelScope(scope) {
        if (scope.querySelector('input[name*="label" i], form[action*="/labels"], .IssueLabel, .issue-label')) return true;
        const aria = (scope.getAttribute('aria-label') || '') + ' ' + (scope.getAttribute('aria-labelledby') || '');
        if (/label/i.test(aria)) return true;
        const heading = scope.querySelector('h1, h2, h3, h4, header, .select-menu-title');
        return !!heading && /^\s*(apply )?labels?\b/i.test(heading.textContent);
    }

    function itemName(item) {
        // Best: accessible name (GitHub's select panel uses aria-labelledby for the
        // label name and aria-describedby for the description).
        const ids = (item.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean);
        if (ids.length) {
            const text = ids.map(id => (document.getElementById(id) || {}).textContent || '').join(' ').trim();
            if (text) return text;
        }
        const nameEl = item.querySelector(NAME_SEL);
        if (nameEl) return nameEl.textContent.trim();
        const data = item.getAttribute('data-label-name') || item.getAttribute('data-name');
        if (data) return data.trim();
        // Fallback: first non-empty text node in document order (skips the description).
        const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const t = n.textContent.trim();
            if (t) return t;
        }
        return '';
    }

    function pinIn(scope) {
        if (!isLabelScope(scope)) return;
        const items = scope.querySelectorAll(ITEM_SEL);
        for (const item of items) {
            if (itemName(item) !== PINNED) continue; // exact, case-sensitive match
            const parent = item.parentElement;
            if (!parent || parent.firstElementChild === item) return; // already first
            parent.insertBefore(item, parent.firstElementChild); // move, never clone
            return;
        }
    }

    function run() {
        if (!PATH_RE.test(location.pathname)) return;
        const seen = new Set();
        for (const item of document.querySelectorAll(ITEM_SEL)) {
            const scope = item.closest(SCOPE_SEL);
            if (scope && !seen.has(scope)) {
                seen.add(scope);
                pinIn(scope);
            }
        }
    }

    // Coalesce bursts of mutations into one pass per frame; our own move is
    // idempotent (merge is already first on the next pass), so no loop arises.
    let scheduled = false;
    const observer = new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            observer.disconnect();
            try { run(); } catch (e) { /* never break GitHub */ }
            observer.observe(document.body, { childList: true, subtree: true });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    run();
})();
