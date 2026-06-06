// ==UserScript==
// @name         Copy PR Title + URL
// @description  Adds a button to GitHub PR pages to copy the PR title and URL to clipboard
// @version      1.0.0
// @match        https://github.com/*/pull/*
// @updateURL    https://raw.githubusercontent.com/CrashLoopBackCoffee/th-tampermonkey/main/copy-pr-title/copy-pr-title.user.js
// @downloadURL  https://raw.githubusercontent.com/CrashLoopBackCoffee/th-tampermonkey/main/copy-pr-title/copy-pr-title.user.js
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    function addButton() {
        if (document.getElementById('copy-pr-btn')) return;
        const titleEl = document.querySelector('h1:not(.sr-only):not(.Overlay-title) .markdown-title');
        if (!titleEl) return;

        const btn = document.createElement('button');
        btn.id = 'copy-pr-btn';
        btn.title = 'Copy PR title + URL';
        btn.textContent = '⧉';
        btn.style.cssText = 'margin-left:6px;cursor:pointer;background:none;border:none;font-size:0.9em;opacity:0.6;vertical-align:middle;color:inherit;';

        btn.addEventListener('click', () => {
            const text = titleEl.childNodes[0]?.textContent?.trim() ?? titleEl.textContent.trim();
            GM_setClipboard(text + ' ' + location.href);
            btn.style.opacity = '1';
            setTimeout(() => { btn.style.opacity = '0.6'; }, 1500);
        });

        titleEl.appendChild(btn);
    }

    const observer = new MutationObserver(addButton);
    observer.observe(document.body, { childList: true, subtree: true });
    addButton();
})();
