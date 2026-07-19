/**
 * ZyncTools — Virtualized Bento Grid
 * Renders only visible tools for 60fps with 1000+ items
 */

class VirtualizedBentoGrid {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) throw new Error(`Container #${containerId} not found`);
        
        this.options = {
            itemHeight: 180,
            gap: 20,
            columns: 12,
            overscan: 5,
            ...options
        };
        
        this.tools = [];
        this.filteredTools = [];
        this.visibleStart = 0;
        this.visibleEnd = 0;
        this.scrollTop = 0;
        this.containerHeight = 0;
        this.rowHeight = this.options.itemHeight + this.options.gap;
        
        this.gridElement = null;
        this.spacerElement = null;
        this.itemElements = new Map();
        
        this.init();
    }
    
    init() {
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflowY = 'auto';
        this.container.style.height = '100%';
        
        // Create spacer for scrollbar
        this.spacerElement = document.createElement('div');
        this.spacerElement.style.position = 'relative';
        this.container.appendChild(this.spacerElement);
        
        // Create grid container
        this.gridElement = document.createElement('div');
        this.gridElement.className = 'bento-grid';
        this.gridElement.style.position = 'absolute';
        this.gridElement.style.top = '0';
        this.gridElement.style.left = '0';
        this.gridElement.style.right = '0';
        this.spacerElement.appendChild(this.gridElement);
        
        // Bind events
        this.container.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
        window.addEventListener('resize', this.onResize.bind(this));
        
        // Initial render
        this.onResize();
    }
    
    setTools(tools) {
        this.tools = tools;
        this.filteredTools = tools;
        this.updateSpacer();
        this.render();
    }
    
    filter(predicate) {
        this.filteredTools = this.tools.filter(predicate);
        this.updateSpacer();
        this.render();
    }
    
    updateSpacer() {
        const rows = Math.ceil(this.filteredTools.length / 4);
        const totalHeight = rows * this.rowHeight;
        this.spacerElement.style.height = `${totalHeight}px`;
    }
    
    onScroll() {
        this.scrollTop = this.container.scrollTop;
        this.render();
    }
    
    onResize() {
        this.containerHeight = this.container.clientHeight;
        this.render();
    }
    
    getVisibleRange() {
        const startRow = Math.floor(this.scrollTop / this.rowHeight);
        const visibleRows = Math.ceil(this.containerHeight / this.rowHeight);
        const endRow = startRow + visibleRows;
        
        const startIndex = Math.max(0, (startRow - this.options.overscan) * 4);
        const endIndex = Math.min(this.filteredTools.length, (endRow + this.options.overscan) * 4);
        
        return { start: startIndex, end: endIndex };
    }
    
    render() {
        const { start, end } = this.getVisibleRange();
        
        // Remove items outside visible range
        this.itemElements.forEach((element, index) => {
            if (index < start || index >= end) {
                element.remove();
                this.itemElements.delete(index);
            }
        });
        
        // Add items in visible range
        for (let i = start; i < end; i++) {
            if (!this.itemElements.has(i) && this.filteredTools[i]) {
                const element = this.createItemElement(this.filteredTools[i], i);
                this.itemElements.set(i, element);
                this.gridElement.appendChild(element);
            }
        }
        
        // Update grid position
        const startRow = Math.floor(start / 4);
        this.gridElement.style.transform = `translate3d(0, ${startRow * this.rowHeight}px, 0)`;
    }
    
    createItemElement(tool, index) {
        const card = document.createElement('a');
        card.href = `/tool.html?id=${tool.id}`;
        card.className = 'bento-card';
        card.dataset.toolId = tool.id;
        
        // Determine span class based on popularity
        let spanClass = 'bento-standard';
        if (tool.popular) spanClass = 'bento-hero';
        
        card.innerHTML = `
            <div class="bento-icon"><i data-lucide="${tool.icon || 'tool'}"></i></div>
            <div>
                <div class="bento-title">${this.escapeHtml(tool.name)}</div>
                <div class="bento-desc">${this.escapeHtml(tool.description || '')}</div>
            </div>
            ${tool.badge ? `<span class="bento-badge">${this.escapeHtml(tool.badge)}</span>` : ''}
        `;
        
        // Animate entrance
        card.style.opacity = '0';
        card.style.transform = 'translate3d(0, 20px, 0)';
        requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translate3d(0, 0, 0)';
        });
        
        return card;
    }
    
    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    
    destroy() {
        this.container.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onResize);
        this.itemElements.clear();
    }
}

// Export for use
window.VirtualizedBentoGrid = VirtualizedBentoGrid;
