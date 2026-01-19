(function () {
    if (window.__popupPluginLoaded) {
        console.log('[popup-plugin] Already loaded, skipping.');
        return;
    }
    window.__popupPluginLoaded = true;
    console.log('[popup-plugin] Loaded.');

    // Server-side configurable text; edit this string and reload the page.
    var popupTitle = 'Announcement';
    var popupText = 'Welcome! This server uses a popup plugin for announcements.<br>'
        + 'You can edit this message in popup/frontend.js to share updates or notices with listeners.<br>'
        + 'Click "Okay" to continue.';

    function ensureStyles() {
        if (document.getElementById('popup-plugin-style')) {
            console.log('[popup-plugin] Styles already present.');
            return;
        }

        var style = document.createElement('style');
        style.id = 'popup-plugin-style';
        style.type = 'text/css';
        style.textContent = [
            '.popup-plugin-overlay {',
            '  position: fixed;',
            '  inset: 0;',
            '  background: rgba(0, 0, 0, 0.6);',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  z-index: 9999;',
            '  backdrop-filter: blur(8px);',
            '}',
            '.popup-plugin-card {',
            '  max-width: 420px;',
            '  width: calc(100% - 40px);',
            '  max-height: calc(100vh - 60px);',
            '  display: flex;',
            '  flex-direction: column;',
            '  background: var(--color-main);',
            '  color: var(--color-text);',
            '  border: 2px solid var(--color-3);',
            '  border-radius: 15px;',
            '  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);',
            '  padding: 20px 20px 16px;',
            '  font-family: "Titillium Web", sans-serif;',
            '}',
            '.popup-plugin-titlebar {',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  background: var(--color-2);',
            '  border-radius: 12px;',
            '  padding: 8px 12px;',
            '  margin-bottom: 12px;',
            '  font-size: 14px;',
            '  font-weight: 600;',
            '  color: var(--color-text);',
            '}',
            '.popup-plugin-card p {',
            '  margin: 0 0 16px;',
            '  line-height: 1.5;',
            '  font-size: 14px;',
            '  color: var(--color-text-2);',
            '  white-space: pre-line;',
            '}',
            '.popup-plugin-message-box {',
            '  background: var(--color-1);',
            '  border: 2px solid var(--color-3);',
            '  border-radius: 12px;',
            '  padding: 12px;',
            '  margin-bottom: 16px;',
            '  overflow-y: auto;',
            '  max-height: calc(100vh - 260px);',
            '}',
            '.popup-plugin-actions {',
            '  display: flex;',
            '  justify-content: flex-end;',
            '}',
            '.popup-plugin-close {',
            '  background: var(--color-4);',
            '  color: var(--color-main);',
            '  border: none;',
            '  border-radius: 15px;',
            '  padding: 8px 18px;',
            '  font-size: 12px;',
            '  font-weight: 600;',
            '  cursor: pointer;',
            '  transition: background 0.3s ease;',
            '}',
            '.popup-plugin-close:hover {',
            '  background: var(--color-5);',
            '}'
        ].join('\n');

        document.head.appendChild(style);
        console.log('[popup-plugin] Styles injected.');
    }

    function createPopup(text) {
        console.log('[popup-plugin] Creating popup.');
        var overlay = document.createElement('div');
        overlay.className = 'popup-plugin-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        var card = document.createElement('div');
        card.className = 'popup-plugin-card';

        var titleBar = document.createElement('div');
        titleBar.className = 'popup-plugin-titlebar';
        titleBar.textContent = popupTitle || 'Notice';

        var messageBox = document.createElement('div');
        messageBox.className = 'popup-plugin-message-box';

        var message = document.createElement('p');
        var formattedText = text.replace(/<br\s*\/?>/gi, '<br><br>');
        message.innerHTML = formattedText;
        messageBox.appendChild(message);

        var actions = document.createElement('div');
        actions.className = 'popup-plugin-actions';

        var agreeButton = document.createElement('button');
        agreeButton.type = 'button';
        agreeButton.className = 'popup-plugin-close';
        agreeButton.textContent = 'Okay';
        agreeButton.addEventListener('click', function () {
            // Set localStorage so it doesn't show again
            try {
                localStorage.setItem('popup-dismissed', 'true');
                console.log('[popup-plugin] Popup preference saved to localStorage.');
            } catch (e) {
                console.warn('[popup-plugin] Could not save to localStorage:', e);
            }
            overlay.remove();
        });

        actions.appendChild(agreeButton);
        card.appendChild(titleBar);
        card.appendChild(messageBox);
        card.appendChild(actions);
        overlay.appendChild(card);

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                console.log('[popup-plugin] Overlay click, closing.');
                overlay.remove();
            }
        });

        document.body.appendChild(overlay);
        agreeButton.focus();
        console.log('[popup-plugin] Popup displayed.');
    }

    function showPopupWhenReady() {
        // Check if user has already dismissed this popup
        if (localStorage.getItem('popup-dismissed') === 'true') {
            console.log('[popup-plugin] User already dismissed popup, skipping.');
            return;
        }

        var text = (popupText || '').trim();
        if (!text) {
            console.log('[popup-plugin] No popup text configured.');
            return;
        }
        console.log('[popup-plugin] Showing popup.');
        ensureStyles();
        createPopup(text);
    }

    if (document.readyState === 'loading') {
        console.log('[popup-plugin] Waiting for DOMContentLoaded.');
        document.addEventListener('DOMContentLoaded', showPopupWhenReady);
    } else {
        showPopupWhenReady();
    }
})();
