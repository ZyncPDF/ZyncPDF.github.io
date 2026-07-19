/**
 * ZyncTools — Fixed Main Renderer
 * Renders tool grids with robust grid alignment,
 * Lucide icon migration (fa- → Lucide names),
 * and ensures lucide.createIcons() is called after every render.
 *
 * Usage: include after lucide.js and tools-database.json is loaded.
 * Exposes: window.ZyncMainFixed
 */
(function () {
    'use strict';

    /* =========================================
       FA- → LUCIDE ICON MIGRATION MAP
       (Generated from tools-database.json scan)
       ========================================= */
    var FA_TO_LUCIDE = {
        "address-card": "id-card",
        "adjust": "contrast",
        "align-left": "align-left",
        "arrow-down-a-z": "arrow-down-a-z",
        "arrow-left-right": "arrow-left-right",
        "arrows-alt-h": "move-horizontal",
        "arrows-left-right": "arrows-left-right",
        "asterisk": "asterisk",
        "barcode": "barcode",
        "bezier-curve": "bezier-curve",
        "birthday-cake": "cake",
        "bolt": "zap",
        "book": "book-open",
        "border-all": "border-all",
        "border-none": "border-none",
        "brackets-curly": "braces",
        "brain": "brain",
        "broom": "broom",
        "bullseye": "target",
        "cake": "cake",
        "calculator": "calculator",
        "calendar": "calendar",
        "calendar-alt": "calendar",
        "camera": "camera",
        "camera-retro": "camera",
        "chart-bar": "bar-chart-3",
        "chart-column": "bar-chart-3",
        "chart-line": "line-chart",
        "check-circle": "check-circle-2",
        "circle": "circle",
        "circle-dot": "circle-dot",
        "circle-half-stroke": "half",
        "circle-info": "info",
        "circle-question": "help-circle",
        "clock": "clock",
        "clone": "copy",
        "cloud": "cloud",
        "cloud-rain": "cloud-rain",
        "code": "code",
        "cog": "settings",
        "columns": "columns",
        "compress": "compress",
        "compress-alt": "compress",
        "compress-arrows-alt": "compress",
        "copy": "copy",
        "crop": "crop",
        "crop-alt": "crop",
        "css3-alt": "file-code-2",
        "cube": "box",
        "cut": "scissors",
        "database": "database",
        "desktop": "monitor",
        "diamond": "gem",
        "droplet": "droplets",
        "edit": "pencil",
        "eraser": "eraser",
        "exchange-alt": "arrow-left-right",
        "expand": "maximize",
        "expand-arrows-alt": "maximize",
        "eye": "eye",
        "eye-dropper": "pipette",
        "eye-slash": "eye-off",
        "face-laugh-squint": "smile",
        "face-smile": "smile",
        "file-code": "file-code",
        "file-csv": "file-spreadsheet",
        "file-export": "download",
        "file-image": "image",
        "file-lines": "file-text",
        "file-pdf": "file-text",
        "file-video": "video",
        "file-word": "file-type-2",
        "fill-drip": "paintbrush",
        "film": "film",
        "fingerprint": "fingerprint",
        "flask": "flask-conical",
        "font": "type",
        "gauge": "gauge",
        "gauge-high": "gauge",
        "gear": "settings",
        "glass-water": "glass-water",
        "globe": "globe",
        "hashtag": "hash",
        "heading": "heading",
        "highlighter": "highlighter",
        "history": "history",
        "hourglass-half": "hourglass",
        "html5": "file-code-2",
        "i-cursor": "mouse-pointer-click",
        "image": "image",
        "images": "images",
        "info-circle": "info",
        "js": "file-code-2",
        "js-square": "file-code-2",
        "key": "key",
        "keyboard": "keyboard",
        "language": "languages",
        "layer-group": "layers",
        "link": "link",
        "list-ol": "list-ordered",
        "lock": "lock",
        "lock-open": "lock-open",
        "magic": "wand-2",
        "magnifying-glass-chart": "search",
        "map": "map",
        "map-marker-alt": "map-pin",
        "markdown": "file-type-2",
        "masks-theater": "drama",
        "microchip": "cpu",
        "microphone": "mic",
        "mobile": "smartphone",
        "mobile-screen": "smartphone",
        "monitor": "monitor",
        "mountain": "mountain",
        "music": "music",
        "network-wired": "network",
        "not-equal": "not-equal",
        "note-sticky": "sticky-note",
        "object-group": "layers",
        "paintbrush": "paintbrush",
        "palette": "palette",
        "paragraph": "paragraph",
        "pencil": "pencil",
        "percent": "percent",
        "post": "send",
        "qrcode": "qr-code",
        "robot": "bot",
        "rotate": "rotate-cw",
        "ruler": "ruler",
        "scissors": "scissors",
        "search": "search",
        "share-alt": "share",
        "share-nodes": "share-2",
        "shield": "shield",
        "shield-halved": "shield-half",
        "shuffle": "shuffle",
        "signature": "pen-tool",
        "sitemap": "sitemap",
        "smog": "cloud-fog",
        "snowflake": "snowflake",
        "sort": "arrow-up-down",
        "sort-numeric-down": "arrow-up-narrow-wide",
        "sparkles": "sparkles",
        "square": "square",
        "stamp": "stamp",
        "star": "star",
        "sticky-note": "sticky-note",
        "stopwatch": "timer",
        "sun": "sun",
        "swatchbook": "swatch-book",
        "sync-alt": "refresh-cw",
        "table": "table",
        "table-cells": "table-2",
        "tachometer-alt": "gauge",
        "tag": "tag",
        "tags": "tags",
        "telegraph": "send",
        "temperature-high": "thermometer",
        "terminal": "terminal",
        "text-width": "type",
        "th": "layout-grid",
        "th-large": "layout-grid",
        "tool": "tool",
        "trash-alt": "trash-2",
        "twitter": "twitter",
        "unlock": "unlock",
        "unlock-alt": "unlock",
        "up-right-and-down-left-from-center": "maximize-2",
        "user-xmark": "user-x",
        "vector-square": "vector-square",
        "video": "video",
        "volume-down": "volume-1",
        "volume-high": "volume-2",
        "volume-mute": "volume-x",
        "volume-up": "volume-2",
        "volume-xmark": "volume-x",
        "wand-magic-sparkles": "wand-2",
        "water": "droplets",
        "wave-square": "wave-square",
        "wifi": "wifi",
        "wind": "wind",
        "x-ray": "scan"
    };

    var CATEGORY_ICON_MAP = {
        "images": "image",
        "pdf": "file-text",
        "video": "video",
        "audio": "music",
        "text": "type",
        "code": "code",
        "math": "calculator",
        "security": "shield",
        "ai": "sparkles",
        "media": "film",
        "seo": "search"
    };

    /* =========================================
       HELPERS
       ========================================= */
    function esc(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function resolveIcon(tool) {
        // Priority: per-tool override > fa- migration map > category fallback > tool
        if (window.ZyncToolIcons && window.ZyncToolIcons[tool.id]) {
            return window.ZyncToolIcons[tool.id];
        }
        if (tool.icon) {
            if (/^fa-/.test(tool.icon)) {
                var key = tool.icon.slice(3);
                if (FA_TO_LUCIDE[key]) return FA_TO_LUCIDE[key];
            }
            return tool.icon;
        }
        var catIcon = CATEGORY_ICON_MAP[tool.category];
        if (catIcon) return catIcon;
        return 'tool';
    }

    function refreshLucide() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    /* =========================================
       RENDER ENGINE
       ========================================= */
    var ZyncMainFixed = {
        tools: [],
        categories: [],

        loadData: function (data) {
            this.tools = (data.tools || []).filter(function (t) {
                return t.status === 'active' || t.status === 'coming' || !t.status;
            });
            this.categories = data.categories || [];
        },

        renderCard: function (tool, query) {
            var iconName = resolveIcon(tool);
            var name = query ? this.highlight(tool.name, query) : esc(tool.name);
            var desc = query ? this.highlight(tool.description || '', query) : esc(tool.description || '');

            return '<a href="/tool.html?id=' + esc(tool.id) + '" class="tool-card" data-tool-id="' + esc(tool.id) + '">' +
                '<div class="tool-card-icon"><i data-lucide="' + esc(iconName) + '"></i></div>' +
                '<div class="tool-card-title">' + name + '</div>' +
                '<div class="tool-card-desc">' + desc + '</div>' +
            '</a>';
        },

        highlight: function (text, query) {
            if (!query || !text) return esc(text);
            var s = esc(text);
            var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
            terms.forEach(function (t) {
                var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
                s = s.replace(re, '<mark>$1</mark>');
            });
            return s;
        },

        renderGrid: function (containerSelector, tools, query) {
            var container = document.querySelector(containerSelector);
            if (!container) return;

            var html = '';
            tools.forEach(function (tool) {
                html += this.renderCard(tool, query);
            }.bind(this));

            container.innerHTML = '<div class="tools-grid">' + html + '</div>';

            // FIX #2: always refresh Lucide icons after dynamic render
            refreshLucide();
        },

        renderDashboard: function (containerSelector, query) {
            var container = document.querySelector(containerSelector);
            if (!container) return;

            var tools = this.tools;
            if (query) {
                var q = query.toLowerCase();
                tools = tools.filter(function (t) {
                    var hay = [t.name, t.description, (t.tags || []).join(' ')].join(' ').toLowerCase();
                    return q.split(/\s+/).every(function (term) { return hay.indexOf(term) !== -1; });
                });
            }

            var grouped = {};
            var order = [];
            tools.forEach(function (t) {
                if (!grouped[t.category]) { grouped[t.category] = []; order.push(t.category); }
                grouped[t.category].push(t);
            });

            var html = '';
            order.forEach(function (catId) {
                var catTools = grouped[catId] || [];
                var catName = catId.charAt(0).toUpperCase() + catId.slice(1);
                html += '<div class="panel" data-category="' + esc(catId) + '">' +
                    '<div class="panel-header">' +
                        '<h2 class="panel-title">' + esc(catName) + '</h2>' +
                        '<span class="panel-badge">' + catTools.length + '</span>' +
                    '</div>' +
                    '<div class="panel-body">' +
                        '<div class="tools-grid">' +
                            catTools.map(function (t) { return this.renderCard(t, query); }.bind(this)).join('') +
                        '</div>' +
                    '</div>' +
                '</div>';
            }.bind(this));

            container.innerHTML = html;

            // FIX #2: refresh icons after every dashboard render
            refreshLucide();
        },

        getIconMapping: function () {
            return FA_TO_LUCIDE;
        },

        resolveIcon: resolveIcon
    };

    window.ZyncMainFixed = ZyncMainFixed;
})();
