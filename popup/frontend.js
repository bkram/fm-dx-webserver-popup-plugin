(function () {

    console.log('[popup-plugin] Loaded.');
    // Server-side configurable text; edit this string and reload the page.
    var alwaysShopPopup = false; // Set to true to show popup on every visit
    var popupTitle = 'Announcement';
    var popupText = 'Welcome! This server uses a popup plugin for announcements.<br>'
        + 'You can edit this message in popup/frontend.js to share updates or notices with listeners.<br>'
        + 'Click "Okay" to continue.';
    // End of server-side configurable text.
    var storageKey = 'popupAcknowledged';
    var styleId = 'popup-plugin-style';
    var overlayId = 'popup-plugin-overlay';

    var hostname = window.location.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
        console.log('[popup-plugin] Running on localhost, skipping popup.');
        return;
    }

    if (!alwaysShopPopup) {
        if (isPopupAcknowledged()) {
            console.log('[popup-plugin] User already acknowledged, skipping popup.');
            return;
        }
    }

    window.__popupPluginLoaded = true;

    function isPopupAcknowledged() {
        try {
            return Boolean(localStorage.getItem(storageKey));
        } catch (error) {
            console.log('[popup-plugin] Unable to read localStorage, continuing without saved state.');
            return false;
        }
    }

    function acknowledgePopup() {
        try {
            localStorage.setItem(storageKey, '1');
            console.log('[popup-plugin] Popup acknowledged, saved to localStorage.');
        } catch (error) {
            console.log('[popup-plugin] Unable to write localStorage, acknowledgement not persisted.');
        }
    }

    function ensureStyles() {
        if (document.getElementById(styleId)) {
            console.log('[popup-plugin] Styles already present.');
            return;
        }

        var style = document.createElement('style');
        style.id = styleId;
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
        if (document.getElementById(overlayId)) {
            console.log('[popup-plugin] Popup already open, skipping duplicate render.');
            return;
        }

        console.log('[popup-plugin] Creating popup.');
        var overlay = document.createElement('div');
        overlay.id = overlayId;
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
        function closePopup() {
            if (!alwaysShopPopup) {
                console.log('[popup-plugin] alwaysShopPopup is false; saving acknowledgement.');

                acknowledgePopup();
            } else {
                console.log('[popup-plugin] alwaysShopPopup is true; not saving acknowledgement.');
            }
            overlay.remove();
        }
        agreeButton.addEventListener('click', closePopup);

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
        document.addEventListener('DOMContentLoaded', showPopupWhenReady, { once: true });
    } else {
        showPopupWhenReady();
    }
})();
