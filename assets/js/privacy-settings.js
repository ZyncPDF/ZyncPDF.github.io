/**
 * ZyncTools — Privacy Settings Manager
 *
 * Strict opt-in model:
 *  - History/favorites are OFF by default
 *  - IndexedDB is not opened until user explicitly consents
 *  - All DB writes are gated through this module
 *
 * Namespace: window.ZyncPrivacy
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'zync-privacy-settings';

    var DEFAULTS = {
        historyEnabled: false,
        favoritesEnabled: false,
        trackingPaused: false,
        autoExpireDays: null, // null = never, 1 = 24h, 7 = 7 days, 30 = 30 days
        consentTimestamp: null
    };

    var settings = Object.assign({}, DEFAULTS);

    var listeners = [];

    function load() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                settings = Object.assign({}, DEFAULTS, parsed);
            }
        } catch (e) {
            settings = Object.assign({}, DEFAULTS);
        }
        notify();
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.warn('[ZyncPrivacy] Failed to save settings:', e);
        }
    }

    function notify() {
        listeners.forEach(function (cb) {
            try { cb(settings); } catch (e) { /* ignore */ }
        });
    }

    function onChange(cb) {
        if (typeof cb === 'function') listeners.push(cb);
    }

    function getSettings() {
        return Object.assign({}, settings);
    }

    function isHistoryEnabled() {
        return settings.historyEnabled === true;
    }

    function isFavoritesEnabled() {
        return settings.favoritesEnabled === true;
    }

    function isTrackingPaused() {
        return settings.trackingPaused === true;
    }

    function canWriteToDB() {
        return settings.historyEnabled === true && settings.trackingPaused !== true;
    }

    function enableHistory(showConfirm) {
        if (showConfirm !== false) {
            return new Promise(function (resolve) {
                showConfirmModal(function (confirmed) {
                    if (confirmed) {
                        applyEnableHistory();
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            });
        } else {
            applyEnableHistory();
            return Promise.resolve(true);
        }
    }

    function applyEnableHistory() {
        settings.historyEnabled = true;
        settings.favoritesEnabled = true;
        settings.consentTimestamp = Date.now();
        save();
        notify();
    }

    function disableHistory() {
        settings.historyEnabled = false;
        settings.favoritesEnabled = false;
        settings.trackingPaused = false;
        settings.autoExpireDays = null;
        settings.consentTimestamp = null;
        save();
        notify();
    }

    function togglePause(paused) {
        settings.trackingPaused = paused !== false;
        save();
        notify();
    }

    function setAutoExpire(days) {
        settings.autoExpireDays = days;
        save();
        notify();
    }

    function clearAllHistory() {
        return new Promise(function (resolve, reject) {
            if (!isHistoryEnabled()) {
                resolve(false);
                return;
            }
            if (window.ZyncDBManager && typeof window.ZyncDBManager.clearAll === 'function') {
                window.ZyncDBManager.clearAll().then(function () {
                    settings.autoExpireDays = null;
                    save();
                    notify();
                    resolve(true);
                }).catch(function (err) {
                    console.warn('[ZyncPrivacy] Clear failed:', err);
                    reject(err);
                });
            } else {
                resolve(false);
            }
        });
    }

    function showConfirmModal(callback) {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;padding:24px;';

        var isGrass = document.documentElement.getAttribute('data-theme') === 'grass';
        var isLight = document.documentElement.getAttribute('data-theme') === 'light';
        var cardBg = isLight ? '#FFFFFF' : (isGrass ? '#FFFFFF' : '#151921');
        var textColor = isLight ? '#000000' : (isGrass ? '#1A202C' : '#FFFFFF');
        var subColor = isLight ? '#374151' : (isGrass ? '#475569' : '#9CA3AF');
        var btnBg = isLight ? '#2563EB' : (isGrass ? '#00CC00' : '#00FF00');
        var btnText = isGrass ? '#FFFFFF' : (isLight ? '#FFFFFF' : '#0B0C10');

        overlay.innerHTML =
            '<div style="background:' + cardBg + ';border-radius:16px;padding:28px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.5);font-family:Inter,system-ui,sans-serif;">' +
                '<h3 style="margin:0 0 8px;font-size:1.1rem;font-weight:700;color:' + textColor + ';">Enable Local History & Favorites?</h3>' +
                '<p style="margin:0 0 6px;font-size:0.875rem;color:' + subColor + ';line-height:1.6;">This stores your tool usage history and favorites <strong>locally in your browser</strong> (IndexedDB).</p>' +
                '<p style="margin:0 0 20px;font-size:0.8rem;color:' + subColor + ';line-height:1.5;">No data is sent to any server. You can clear it or disable tracking anytime from Settings.</p>' +
                '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
                    '<button id="privacy-modal-cancel" style="padding:9px 18px;border-radius:10px;border:1px solid ' + (isLight ? '#D1D5DB' : (isGrass ? '#CBD5E0' : 'rgba(255,255,255,0.12)')) + ';background:transparent;color:' + textColor + ';font-size:0.875rem;cursor:pointer;font-family:inherit;font-weight:500;">Cancel</button>' +
                    '<button id="privacy-modal-confirm" style="padding:9px 18px;border-radius:10px;border:none;background:' + btnBg + ';color:' + btnText + ';font-size:0.875rem;cursor:pointer;font-family:inherit;font-weight:600;">Confirm & Enable</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        var confirmBtn = overlay.querySelector('#privacy-modal-confirm');
        var cancelBtn = overlay.querySelector('#privacy-modal-cancel');

        function cleanup(result) {
            overlay.remove();
            callback(result);
        }

        confirmBtn.addEventListener('click', function () { cleanup(true); });
        cancelBtn.addEventListener('click', function () { cleanup(false); });
        overlay.addEventListener('click', function (e) { if (e.target === overlay) cleanup(false); });

        // Focus confirm button
        setTimeout(function () { confirmBtn.focus(); }, 50);
    }

    function init() {
        load();

        // Listen for storage events from other tabs
        window.addEventListener('storage', function (e) {
            if (e.key === STORAGE_KEY) {
                load();
            }
        });
    }

    // Public API
    window.ZyncPrivacy = {
        getSettings: getSettings,
        isHistoryEnabled: isHistoryEnabled,
        isFavoritesEnabled: isFavoritesEnabled,
        isTrackingPaused: isTrackingPaused,
        canWriteToDB: canWriteToDB,
        enableHistory: enableHistory,
        disableHistory: disableHistory,
        togglePause: togglePause,
        setAutoExpire: setAutoExpire,
        clearAllHistory: clearAllHistory,
        onChange: onChange
    };

    init();
})();
