/**
 * ZyncTools — Database Manager (Privacy-Gated)
 *
 * All write operations are rejected if ZyncPrivacy.canWriteToDB() returns false.
 * The DB is only opened lazily on first write request.
 *
 * Object Stores:
 *  - favorites  : { id, toolId, name, category, addedAt }
 *  - history    : { id, toolId, name, category, visitedAt }
 *
 * Namespace: window.ZyncDBManager
 */
(function () {
    'use strict';

    var DB_NAME = 'zync-tools-db';
    var DB_VERSION = 1;
    var db = null;
    var initPromise = null;

    function requirePrivacy() {
        if (typeof window.ZyncPrivacy !== 'undefined' && typeof window.ZyncPrivacy.canWriteToDB === 'function') {
            if (!window.ZyncPrivacy.canWriteToDB()) {
                return false;
            }
        }
        return true;
    }

    function openDB() {
        if (db) return Promise.resolve(db);
        if (initPromise) return initPromise;

        initPromise = new Promise(function (resolve, reject) {
            try {
                var request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onupgradeneeded = function (e) {
                    var database = e.target.result;
                    if (!database.objectStoreNames.contains('favorites')) {
                        var favStore = database.createObjectStore('favorites', { keyPath: 'id' });
                        favStore.createIndex('toolId', 'toolId', { unique: true });
                        favStore.createIndex('addedAt', 'addedAt', { unique: false });
                    }
                    if (!database.objectStoreNames.contains('history')) {
                        var histStore = database.createObjectStore('history', { keyPath: 'id' });
                        histStore.createIndex('toolId', 'toolId', { unique: false });
                        histStore.createIndex('visitedAt', 'visitedAt', { unique: false });
                    }
                };

                request.onsuccess = function (e) {
                    db = e.target.result;
                    resolve(db);
                };

                request.onerror = function () {
                    var err = new Error('IndexedDB unavailable');
                    initPromise = null;
                    reject(err);
                };
            } catch (err) {
                initPromise = null;
                reject(err);
            }
        });

        return initPromise;
    }

    function tx(storeName, mode) {
        return openDB().then(function (database) {
            var transaction = database.transaction(storeName, mode);
            return transaction.objectStore(storeName);
        });
    }

    /* =========================================
       FAVORITES
       ========================================= */

    function addFavorite(tool) {
        if (!requirePrivacy()) return Promise.reject(new Error('Privacy: history is disabled'));
        if (!tool || !tool.id) return Promise.resolve(false);

        var entry = {
            id: 'fav-' + tool.id,
            toolId: tool.id,
            name: tool.name || tool.id,
            category: tool.category || 'unknown',
            icon: tool.icon || 'tool',
            addedAt: Date.now()
        };

        return tx('favorites', 'readwrite').then(function (store) {
            return new Promise(function (resolve, reject) {
                var req = store.put(entry);
                req.onsuccess = function () { resolve(true); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    function removeFavorite(toolId) {
        if (!requirePrivacy()) return Promise.reject(new Error('Privacy: history is disabled'));
        return tx('favorites', 'readwrite').then(function (store) {
            return new Promise(function (resolve, reject) {
                var req = store.delete('fav-' + toolId);
                req.onsuccess = function () { resolve(true); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    function isFavorite(toolId) {
        if (!requirePrivacy()) return Promise.resolve(false);
        return tx('favorites', 'readonly').then(function (store) {
            return new Promise(function (resolve, reject) {
                var req = store.get('fav-' + toolId);
                req.onsuccess = function () { resolve(!!req.result); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    function getAllFavorites() {
        if (!requirePrivacy()) return Promise.resolve([]);
        return tx('favorites', 'readonly').then(function (store) {
            return new Promise(function (resolve, reject) {
                var req = store.getAll();
                req.onsuccess = function () { resolve(req.result || []); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    /* =========================================
       HISTORY
       ========================================= */

    function addHistoryEntry(tool) {
        if (!requirePrivacy()) return Promise.resolve(false);
        if (!tool || !tool.id) return Promise.resolve(false);

        var entry = {
            id: 'hist-' + tool.id + '-' + Date.now(),
            toolId: tool.id,
            name: tool.name || tool.id,
            category: tool.category || 'unknown',
            icon: tool.icon || 'tool',
            visitedAt: Date.now()
        };

        return tx('history', 'readwrite').then(function (store) {
            return new Promise(function (resolve, reject) {
                var req = store.put(entry);
                req.onsuccess = function () { resolve(true); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    function getRecentHistory(limit) {
        limit = limit || 50;
        if (!requirePrivacy()) return Promise.resolve([]);
        return tx('history', 'readonly').then(function (store) {
            return new Promise(function (resolve, reject) {
                var results = [];
                var req = store.openCursor(null, 'prev');
                req.onsuccess = function (e) {
                    var cursor = e.target.result;
                    if (cursor && results.length < limit) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    /* =========================================
       CLEAR / EXPIRE
       ========================================= */

    function clearAll() {
        if (!requirePrivacy()) return Promise.resolve(false);
        return Promise.all([
            tx('favorites', 'readwrite').then(function (store) {
                return new Promise(function (resolve, reject) {
                    var req = store.clear();
                    req.onsuccess = function () { resolve(); };
                    req.onerror = function () { reject(req.error); };
                });
            }),
            tx('history', 'readwrite').then(function (store) {
                return new Promise(function (resolve, reject) {
                    var req = store.clear();
                    req.onsuccess = function () { resolve(); };
                    req.onerror = function () { reject(req.error); };
                });
            })
        ]).then(function () { return true; });
    }

    function expireOldEntries() {
        if (!requirePrivacy()) return Promise.resolve(0);
        return getSettings().then(function (settings) {
            var days = settings.autoExpireDays;
            if (!days) return Promise.resolve(0);

            var cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
            var deleted = 0;

            return tx('history', 'readwrite').then(function (store) {
                return new Promise(function (resolve, reject) {
                    var req = store.openCursor();
                    req.onsuccess = function (e) {
                        var cursor = e.target.result;
                        if (!cursor) {
                            resolve(deleted);
                            return;
                        }
                        if (cursor.value.visitedAt < cutoff) {
                            cursor.delete();
                            deleted++;
                            cursor.continue();
                        } else {
                            cursor.continue();
                        }
                    };
                    req.onerror = function () { reject(req.error); };
                });
            });
        });
    }

    function getSettings() {
        if (typeof window.ZyncPrivacy !== 'undefined' && typeof window.ZyncPrivacy.getSettings === 'function') {
            return Promise.resolve(window.ZyncPrivacy.getSettings());
        }
        return Promise.resolve({ autoExpireDays: null });
    }

    /* =========================================
       PUBLIC API
       ========================================= */
    window.ZyncDBManager = {
        addFavorite: addFavorite,
        removeFavorite: removeFavorite,
        isFavorite: isFavorite,
        getAllFavorites: getAllFavorites,
        addHistoryEntry: addHistoryEntry,
        getRecentHistory: getRecentHistory,
        clearAll: clearAll,
        expireOldEntries: expireOldEntries
    };

})();
