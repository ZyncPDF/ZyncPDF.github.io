(function () {
    'use strict';

    /* ============================================
       ZyncTools — Dashboard Logic
       Advanced Bento Grid rendering with
       intersection observer, spotlight, and
       magnetic hover effects.
       ============================================ */

    const state = {
        tools: [],
        categories: [],
        activeCategory: 'all',
        searchQuery: '',
        loadedScripts: new Set()
    };

    /* --- Utilities --- */
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function highlightText(text, query) {
        if (!query) return escapeHtml(text);
        const escaped = escapeHtml(text);
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return escaped.replace(regex, '<mark>$1</mark>');
    }

    /* --- Icon Resolution --- */
    function getToolIcon(tool) {
        if (window.ZyncToolIcons && window.ZyncToolIcons[tool.id]) {
            return window.ZyncToolIcons[tool.id];
        }
        if (window.ZyncToolIcons && window.ZyncToolIcons[tool.category]) {
            return window.ZyncToolIcons[tool.category];
        }
        return 'tool';
    }

    /* --- Card Sizing Logic --- */
    function getCardSizeClass(tool, index, categoryTools) {
        // Find the most popular tool across ALL categories
        const allPopular = state.tools.filter(t => t.popular);
        const mostPopular = allPopular.length > 0 ? allPopular[0] : null;
        
        // Hero card: the #1 most popular tool overall
        if (mostPopular && tool.id === mostPopular.id) {
            return 'bento-hero';
        }
        
        // Wide cards: other popular tools
        if (tool.popular) {
            return 'bento-wide';
        }
        
        // Mix of standard and large for visual variety
        // Use large for every 4th card to create 3-per-row sections
        if ((index + 1) % 4 === 0) {
            return 'bento-large';
        }
        
        return 'bento-standard';
    }

    /* --- Spotlight Effect --- */
    function initSpotlight() {
        const cards = $$('.bento-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
                card.classList.add('spotlight-active');
            });

            card.addEventListener('mouseleave', () => {
                card.classList.remove('spotlight-active');
            });
        });
    }

    /* --- Magnetic Hover Effect --- */
    function initMagneticHover() {
        const cards = $$('.bento-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;
                
                // Subtle magnetic pull (max 3px)
                const moveX = deltaX * 3;
                const moveY = deltaY * 3;
                
                card.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(1.01)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* --- Intersection Observer for Scroll Animations --- */
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    
                    // Animate cards within this section with stagger
                    const cards = entry.target.querySelectorAll('.bento-animate');
                    cards.forEach((card, index) => {
                        card.style.animationDelay = `${index * 50}ms`;
                        card.classList.add('bento-animate');
                    });
                    
                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all category sections
        const sections = $$('.category-section');
        sections.forEach(section => {
            observer.observe(section);
        });

        // Also observe category headers for blur-in effect
        const headers = $$('.category-header');
        const headerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('category-header-animate');
                    headerObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        headers.forEach(header => {
            headerObserver.observe(header);
        });
    }

    /* --- Render Category Sections --- */
    function renderDashboard() {
        const container = $('#category-sections');
        const noResults = $('#no-results');
        if (!container) return;

        const filtered = state.tools.filter(tool => {
            const matchesCategory = state.activeCategory === 'all' || tool.category === state.activeCategory;
            const matchesSearch = !state.searchQuery ||
                tool.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                tool.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                tool.id.toLowerCase().includes(state.searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            container.innerHTML = '';
            noResults?.classList.remove('hidden');
            return;
        }

        noResults?.classList.add('hidden');

        // Group by category
        const grouped = {};
        filtered.forEach(tool => {
            if (!grouped[tool.category]) grouped[tool.category] = [];
            grouped[tool.category].push(tool);
        });

        let html = '';

        state.categories.forEach(category => {
            const tools = grouped[category.id];
            if (!tools || tools.length === 0) return;

            html += `
                <div class="category-section" data-category="${category.id}">
                    <div class="category-header">
                        <div class="category-icon"><i data-lucide="${category.icon}"></i></div>
                        <h2 class="category-title">${escapeHtml(category.name)}</h2>
                        <span class="category-count">${tools.length} tool${tools.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="bento-grid">
                        ${tools.map((tool, i) => renderCard(tool, i, tools.length)).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Initialize Lucide icons
        if (window.lucide) lucide.createIcons();

        // Initialize animations and effects
        initScrollAnimations();
        initSpotlight();
        initMagneticHover();
    }

    /* --- Render Single Card --- */
    function renderCard(tool, index, totalInCategory) {
        const name = highlightText(tool.name, state.searchQuery);
        const desc = highlightText(tool.description, state.searchQuery);
        const sizeClass = getCardSizeClass(tool, index, totalInCategory);
        const iconName = getToolIcon(tool);
        
        // Determine input icon based on tool type
        const isFileTool = tool.accept && tool.accept.includes('.');
        const inputIcon = isFileTool ? 'upload' : getToolIcon(tool);
        
        // Badge styling
        let badgeClass = 'bento-badge';
        if (tool.badge === 'AI') badgeClass += ' ai';
        if (tool.badge === 'Beta') badgeClass += ' beta';

        return `
            <a href="/tool.html?id=${tool.id}" 
               class="bento-card ${sizeClass} bento-animate" 
               data-tool-id="${tool.id}"
               data-tool-type="${isFileTool ? 'file' : 'text'}">
                <div class="bento-icon">
                    <i data-lucide="${inputIcon}"></i>
                </div>
                <div>
                    <div class="bento-title">${name}</div>
                    <div class="bento-desc">${desc}</div>
                </div>
                ${tool.badge ? `<span class="${badgeClass}">${escapeHtml(tool.badge)}</span>` : ''}
            </a>
        `;
    }

    /* --- Data Loading --- */
    async function loadRegistry() {
        try {
            const res = await fetch('/tools-database.json', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to load tools database');
            const data = await res.json();
            state.tools = data.tools || [];
            state.categories = data.categories || [];
        } catch (err) {
            console.error('Failed to load registry:', err);
            state.tools = [];
            state.categories = [];
        }
    }

    /* --- Search --- */
    function initSearch() {
        const input = $('#search-input');
        if (!input) return;

        let debounce;
        input.addEventListener('input', (e) => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                state.searchQuery = e.target.value.trim();
                renderDashboard();
            }, 150);
        });
    }

    /* --- Category Filters --- */
    function initFilters() {
        const container = $('#category-filters');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.cat-btn');
            if (!btn) return;

            $$('.cat-btn').forEach(b => {
                b.classList.remove('active', 'bg-accent/10', 'text-accent', 'border-accent/20');
                b.classList.add('bg-slate-900', 'text-gray-400', 'border-white/5');
            });

            btn.classList.remove('bg-slate-900', 'text-gray-400', 'border-white/5');
            btn.classList.add('active', 'bg-accent/10', 'text-accent', 'border-accent/20');

            state.activeCategory = btn.dataset.category || 'all';
            renderDashboard();
        });
    }

    /* --- Populate Category Filters --- */
    function populateCategoryFilters() {
        const container = $('#category-filters');
        if (!container) return;

        const allBtn = container.querySelector('[data-category="all"]');
        
        state.categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'cat-btn px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 text-gray-400 border border-white/5 hover:border-white/10 hover:text-white transition-all';
            btn.dataset.category = category.id;
            btn.textContent = category.name;
            container.appendChild(btn);
        });
    }

    /* --- Init --- */
    async function init() {
        await loadRegistry();
        populateCategoryFilters();
        initSearch();
        initFilters();
        renderDashboard();
        initThemeToggle();
    }

    function initThemeToggle() {
        const btn = $('#theme-toggle');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const next = window.ZyncTheme.toggle();
            updateThemeIcon(next);
        });
        updateThemeIcon(window.ZyncTheme.getCurrent());
    }

    function updateThemeIcon(theme) {
        const btn = $('#theme-toggle');
        if (!btn) return;
        const icon = btn.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
            if (window.lucide) lucide.createIcons();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.ZyncApp = { state, renderDashboard, loadRegistry };
})();
