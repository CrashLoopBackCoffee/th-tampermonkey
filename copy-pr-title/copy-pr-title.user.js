// ==UserScript==
// @name         Copy PR Title + URL
// @description  Adds a button to GitHub PR pages to copy the PR title and URL to clipboard
// @version      1.1.0
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
        btn.innerHTML = `<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
          <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
        </svg>`;
        btn.style.cssText = 'margin-left:6px;cursor:pointer;background:none;border:none;padding:0;opacity:0.6;vertical-align:middle;color:inherit;line-height:1;position:relative;top:-6px;';

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
