// ===== SAVINGS APP - FIXED VERSION =====
class SavingsApp {
    constructor() {
        this.state = {
            savings: [],
            nextId: 1,
            currentAction: null,
            filterCategory: 'all',
            sortBy: 'date-desc',
            theme: 'light',
            ui: {
                openMenuId: null
            }
        };
        
        this.deletedItems = [];
        this.elements = {};
        this.eventListeners = new Map();
        
        // Background customization state
        this.backgroundState = {
            selectedColor: null,
            selectedImage: null,
            currentTab: 'color'
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleSaveSaving = this.handleSaveSaving.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleAddMoney = this.handleAddMoney.bind(this);
        this.saveBackground = this.saveBackground.bind(this);
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.init);
        } else {
            this.init();
        }
    }

    // ===== INITIALIZATION =====
    init() {
        console.log('Initializing Savings App...');
        this.cacheElements();
        this.loadState();
        this.setupEventListeners();
        this.render();
        console.log('App initialized successfully');
    }

    cacheElements() {
        // Core containers
        this.elements.savingsContainer = document.getElementById('savingsContainer');
        this.elements.emptyState = document.getElementById('emptyState');
        
        // Stats
        this.elements.totalGoals = document.getElementById('totalGoals');
        this.elements.totalSaved = document.getElementById('totalSaved');
        this.elements.completedGoals = document.getElementById('completedGoals');
        
        // Buttons
        this.elements.themeToggle = document.getElementById('themeToggle');
        this.elements.newSavingBtn = document.getElementById('newSavingBtn');
        this.elements.createFirstGoalBtn = document.getElementById('createFirstGoalBtn');
        
        // Modals
        this.elements.modalOverlay = document.getElementById('modalOverlay');
        this.elements.savingModal = document.getElementById('savingModal');
        this.elements.deleteModal = document.getElementById('deleteModal');
        this.elements.addMoneyModal = document.getElementById('addMoneyModal');
        this.elements.backgroundModal = document.getElementById('backgroundModal');
        
        // Forms
        this.elements.savingForm = document.getElementById('savingForm');
        this.elements.savingName = document.getElementById('savingName');
        this.elements.targetAmount = document.getElementById('targetAmount');
        this.elements.currentAmount = document.getElementById('currentAmount');
        this.elements.category = document.getElementById('category');
        this.elements.notes = document.getElementById('notes');
        
        // Controls
        this.elements.filterCategory = document.getElementById('filterCategory');
        this.elements.sortBy = document.getElementById('sortBy');
        this.elements.addMoneyAmount = document.getElementById('addMoneyAmount');
        
        // Background elements
        this.elements.colorGrid = document.getElementById('colorGrid');
        this.elements.imageUploadArea = document.getElementById('imageUploadArea');
        this.elements.imageUpload = document.getElementById('imageUpload');
        this.elements.previewImage = document.getElementById('previewImage');
        this.elements.imagePreview = document.getElementById('imagePreview');
    }

    setupEventListeners() {
        // Theme toggle
        this.addClickListener(this.elements.themeToggle, () => this.toggleTheme());
        
        // New saving buttons
        this.addClickListener(this.elements.newSavingBtn, () => this.openSavingModal());
        this.addClickListener(this.elements.createFirstGoalBtn, () => this.openSavingModal());
        
        // Modal controls
        this.addClickListener(this.elements.modalOverlay, () => this.closeAllModals());
        
        // Close buttons
        this.addClickListener(document.getElementById('modalClose'), () => this.closeAllModals());
        this.addClickListener(document.getElementById('cancelBtn'), () => this.closeAllModals());
        this.addClickListener(document.getElementById('deleteModalClose'), () => this.closeAllModals());
        this.addClickListener(document.getElementById('cancelDeleteBtn'), () => this.closeAllModals());
        this.addClickListener(document.getElementById('addMoneyModalClose'), () => this.closeAllModals());
        this.addClickListener(document.getElementById('cancelAddMoneyBtn'), () => this.closeAllModals());
        this.addClickListener(document.getElementById('backgroundModalClose'), () => this.closeAllModals());
        this.addClickListener(document.getElementById('cancelBackgroundBtn'), () => this.closeAllModals());
        
        // Form submissions
        if (this.elements.savingForm) {
            this.elements.savingForm.addEventListener('submit', this.handleSaveSaving);
        }
        
        // Delete confirmation
        this.addClickListener(document.getElementById('confirmDeleteBtn'), this.handleDelete);
        
        // Add money
        this.addClickListener(document.getElementById('confirmAddMoneyBtn'), this.handleAddMoney);
        
        // Quick add buttons - Use event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quick-add button')) {
                const amount = e.target.dataset.amount;
                if (this.elements.addMoneyAmount) {
                    this.elements.addMoneyAmount.value = amount;
                }
            }
        });
        
        // Filter and sort
        if (this.elements.filterCategory) {
            this.elements.filterCategory.addEventListener('change', (e) => {
                this.state.filterCategory = e.target.value;
                this.saveState();
                this.render();
            });
        }
        
        if (this.elements.sortBy) {
            this.elements.sortBy.addEventListener('change', (e) => {
                this.state.sortBy = e.target.value;
                this.saveState();
                this.render();
            });
        }
        
        // Background customization - FIXED: Direct event listeners
        this.setupBackgroundEventListeners();
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.saving-menu') && this.state.ui.openMenuId !== null) {
                this.state.ui.openMenuId = null;
                this.render();
            }
        });
        
        // Event delegation for saving cards
        document.addEventListener('click', (e) => {
            // Handle card menu actions
            if (e.target.closest('[data-action]')) {
                const btn = e.target.closest('[data-action]');
                const action = btn.dataset.action;
                const id = parseInt(btn.dataset.id);
                
                e.stopPropagation();
                
                switch(action) {
                    case 'toggleMenu':
                        this.toggleMenu(id);
                        break;
                    case 'edit':
                        this.openSavingModal(id);
                        break;
                    case 'delete':
                        this.openDeleteModal(id);
                        break;
                    case 'addMoney':
                        this.openAddMoneyModal(id);
                        break;
                    case 'customizeBackground':
                        this.openBackgroundModal(id);
                        break;
                }
            }
        });
    }

    setupBackgroundEventListeners() {
        // Save background - FIXED: Direct event listener
        const saveBackgroundBtn = document.getElementById('saveBackgroundBtn');
        if (saveBackgroundBtn) {
            saveBackgroundBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveBackground();
            });
        }
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.target.dataset.tab;
                this.switchBackgroundTab(tab);
            });
        });
        
        // Color selection
        if (this.elements.colorGrid) {
            this.elements.colorGrid.querySelectorAll('.color-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.selectColor(e.target.dataset.color);
                });
            });
        }
        
        // Image upload
        if (this.elements.imageUpload && this.elements.imageUploadArea) {
            // Click to upload
            this.elements.imageUploadArea.addEventListener('click', () => {
                this.elements.imageUpload.click();
            });
            
            // File selection
            this.elements.imageUpload.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleImageUpload(e.target.files[0]);
                }
            });
            
            // Drag and drop
            this.elements.imageUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.elements.imageUploadArea.style.borderColor = 'var(--primary)';
                this.elements.imageUploadArea.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
            });
            
            this.elements.imageUploadArea.addEventListener('dragleave', () => {
                this.elements.imageUploadArea.style.borderColor = '';
                this.elements.imageUploadArea.style.backgroundColor = '';
            });
            
            this.elements.imageUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                this.elements.imageUploadArea.style.borderColor = '';
                this.elements.imageUploadArea.style.backgroundColor = '';
                
                if (e.dataTransfer.files.length > 0) {
                    this.handleImageUpload(e.dataTransfer.files[0]);
                }
            });
        }
        
        // Remove image
        const removeImageBtn = document.querySelector('.remove-image');
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.removeImage();
            });
        }
    }

    addClickListener(element, handler) {
        if (element) {
            element.addEventListener('click', handler);
        }
    }

    // ===== STATE MANAGEMENT =====
    loadState() {
        try {
            const saved = localStorage.getItem('savingsAppData');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.savings = data.savings || [];
                this.state.nextId = data.nextId || 1;
                this.state.filterCategory = data.filterCategory || 'all';
                this.state.sortBy = data.sortBy || 'date-desc';
                this.state.theme = data.theme || 'light';
                
                // Update UI
                if (this.elements.filterCategory) this.elements.filterCategory.value = this.state.filterCategory;
                if (this.elements.sortBy) this.elements.sortBy.value = this.state.sortBy;
                
                // Apply theme
                document.documentElement.setAttribute('data-theme', this.state.theme);
                this.updateThemeIcon();
            }
        } catch (error) {
            console.error('Error loading state:', error);
            this.state.savings = [];
            this.state.nextId = 1;
        }
    }

    saveState() {
        try {
            const data = {
                savings: this.state.savings,
                nextId: this.state.nextId,
                filterCategory: this.state.filterCategory,
                sortBy: this.state.sortBy,
                theme: this.state.theme
            };
            localStorage.setItem('savingsAppData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    // ===== UI RENDERING =====
    render() {
        if (!this.elements.savingsContainer) return;
        
        const savingsToDisplay = this.getFilteredAndSortedSavings();
        
        // Show/hide empty state
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 
                savingsToDisplay.length === 0 ? 'block' : 'none';
        }
        
        // Render savings cards
        this.elements.savingsContainer.innerHTML = '';
        savingsToDisplay.forEach(saving => {
            const card = this.createSavingCard(saving);
            this.elements.savingsContainer.appendChild(card);
        });
        
        // Update stats
        this.updateStats();
    }

    createSavingCard(saving) {
        const progress = this.calculateProgress(saving);
        const isMenuOpen = this.state.ui.openMenuId === saving.id;
        
        const card = document.createElement('div');
        card.className = 'saving-card';
        card.dataset.id = saving.id;
        
        // Apply background if exists
        if (saving.background) {
            card.classList.add('has-background');
            if (saving.background.startsWith('#')) {
                card.style.background = saving.background;
                // Check if background is light or dark
                const isLight = this.isLightColor(saving.background);
                if (isLight) {
                    card.classList.add('light-bg');
                }
            } else if (saving.background.startsWith('data:image')) {
                card.style.backgroundImage = `url(${saving.background})`;
                card.style.backgroundSize = 'cover';
                card.style.backgroundPosition = 'center';
                card.classList.add('image-bg');
            }
        }
        
        card.innerHTML = `
            <div class="saving-card-header">
                <div>
                    <h3 class="saving-name">${this.escapeHtml(saving.name)}</h3>
                    <span class="saving-category">${saving.category}</span>
                </div>
                <div class="saving-menu">
                    <button class="menu-btn ${isMenuOpen ? 'active' : ''}" 
                            data-action="toggleMenu" 
                            data-id="${saving.id}">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="menu-dropdown ${isMenuOpen ? 'show' : ''}">
                        <button data-action="addMoney" data-id="${saving.id}">
                            <i class="fas fa-plus-circle"></i> Add Money
                        </button>
                        <button data-action="customizeBackground" data-id="${saving.id}">
                            <i class="fas fa-palette"></i> Customize
                        </button>
                        <button data-action="edit" data-id="${saving.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button data-action="delete" data-id="${saving.id}" class="delete">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="saving-progress">
                <div class="progress-info">
                    <div class="progress-amounts">
                        $${saving.currentAmount.toFixed(2)} / $${saving.targetAmount.toFixed(2)}
                    </div>
                    <div class="progress-percentage">${progress}%</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
            
            <div class="saving-details">
                ${saving.notes ? `<p>${this.escapeHtml(saving.notes)}</p>` : ''}
                <small>Created: ${this.formatDate(saving.createdAt)}</small>
            </div>
        `;
        
        return card;
    }

    // ===== CORE LOGIC =====
    toggleMenu(savingId) {
        this.state.ui.openMenuId = 
            this.state.ui.openMenuId === savingId ? null : savingId;
        this.render();
    }

    openSavingModal(savingId = null) {
        this.state.currentAction = savingId ? 
            { type: 'edit', id: savingId } : 
            { type: 'create' };
        
        if (savingId) {
            const saving = this.state.savings.find(s => s.id === savingId);
            if (saving) {
                this.elements.savingName.value = saving.name;
                this.elements.targetAmount.value = saving.targetAmount;
                this.elements.currentAmount.value = saving.currentAmount;
                this.elements.category.value = saving.category;
                this.elements.notes.value = saving.notes || '';
                document.getElementById('modalTitle').textContent = 'Edit Goal';
            }
        } else {
            this.elements.savingForm.reset();
            this.elements.currentAmount.value = '0';
            document.getElementById('modalTitle').textContent = 'Add New Goal';
        }
        
        this.showModal(this.elements.savingModal);
    }

    handleSaveSaving(e) {
        e.preventDefault();
        
        // Validate
        if (!this.elements.savingName.value.trim()) {
            alert('Please enter a goal name');
            return;
        }
        
        const target = parseFloat(this.elements.targetAmount.value);
        const current = parseFloat(this.elements.currentAmount.value) || 0;
        
        if (target <= 0) {
            alert('Target must be greater than 0');
            return;
        }
        
        const savingData = {
            id: this.state.currentAction?.id || this.state.nextId,
            name: this.elements.savingName.value.trim(),
            targetAmount: target,
            currentAmount: Math.min(current, target),
            category: this.elements.category.value,
            notes: this.elements.notes.value.trim(),
            createdAt: new Date().toISOString()
        };
        
        // Preserve background if editing
        if (this.state.currentAction?.type === 'edit') {
            const existing = this.state.savings.find(s => s.id === this.state.currentAction.id);
            if (existing) {
                savingData.background = existing.background;
                savingData.createdAt = existing.createdAt;
                const index = this.state.savings.findIndex(s => s.id === this.state.currentAction.id);
                this.state.savings[index] = savingData;
            }
        } else {
            this.state.savings.push(savingData);
            this.state.nextId++;
        }
        
        this.saveState();
        this.render();
        this.closeAllModals();
        this.showToast('Goal saved successfully!');
    }

    openDeleteModal(savingId) {
        const saving = this.state.savings.find(s => s.id === savingId);
        if (saving) {
            this.state.currentAction = { type: 'delete', id: savingId };
            document.getElementById('deleteMessage').textContent = 
                `Delete "${saving.name}"?`;
            this.showModal(this.elements.deleteModal);
        }
    }

    handleDelete() {
        if (!this.state.currentAction?.id) return;
        
        const index = this.state.savings.findIndex(s => s.id === this.state.currentAction.id);
        if (index !== -1) {
            // Store for possible undo
            this.deletedItems.push({
                item: this.state.savings[index],
                timestamp: Date.now()
            });
            
            // Remove from state
            this.state.savings.splice(index, 1);
            
            this.saveState();
            this.render();
            this.closeAllModals();
            this.showToast('Goal deleted', true);
            
            // Clear undo buffer after 7 seconds
            setTimeout(() => {
                this.deletedItems = this.deletedItems.filter(
                    item => Date.now() - item.timestamp < 7000
                );
            }, 7000);
        }
    }

    openAddMoneyModal(savingId) {
        const saving = this.state.savings.find(s => s.id === savingId);
        if (saving) {
            this.state.currentAction = { type: 'addMoney', id: savingId };
            document.getElementById('addMoneyTitle').textContent = 
                `Add Money to "${saving.name}"`;
            this.elements.addMoneyAmount.value = '';
            this.showModal(this.elements.addMoneyModal);
        }
    }

    handleAddMoney() {
        const amount = parseFloat(this.elements.addMoneyAmount.value);
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        const saving = this.state.savings.find(s => s.id === this.state.currentAction?.id);
        if (saving) {
            saving.currentAmount = Math.min(
                saving.currentAmount + amount,
                saving.targetAmount
            );
            
            this.saveState();
            this.render();
            this.closeAllModals();
            this.showToast(`Added $${amount.toFixed(2)} to ${saving.name}`);
        }
    }

    // ===== BACKGROUND CUSTOMIZATION =====
    openBackgroundModal(savingId) {
        const saving = this.state.savings.find(s => s.id === savingId);
        if (!saving) return;
        
        this.state.currentAction = { type: 'customizeBackground', id: savingId };
        
        // Reset background state
        this.backgroundState.selectedColor = null;
        this.backgroundState.selectedImage = null;
        this.backgroundState.currentTab = 'color';
        
        // Set current background if exists
        if (saving.background) {
            if (saving.background.startsWith('#')) {
                this.backgroundState.selectedColor = saving.background;
                this.selectColor(saving.background);
            } else if (saving.background.startsWith('data:image')) {
                this.backgroundState.selectedImage = saving.background;
                this.backgroundState.currentTab = 'image';
                this.showImagePreview(saving.background);
            }
        }
        
        this.updateBackgroundModalTabs();
        this.showModal(this.elements.backgroundModal);
    }

    updateBackgroundModalTabs() {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const tab = btn.dataset.tab;
            btn.classList.toggle('active', tab === this.backgroundState.currentTab);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            const tab = content.id.replace('Tab', '');
            content.classList.toggle('active', tab === this.backgroundState.currentTab);
        });
        
        // Clear color selection
        if (this.backgroundState.currentTab === 'color') {
            document.querySelectorAll('.color-option').forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.color === this.backgroundState.selectedColor) {
                    option.classList.add('selected');
                }
            });
        }
    }

    switchBackgroundTab(tabName) {
        this.backgroundState.currentTab = tabName;
        this.updateBackgroundModalTabs();
    }

    selectColor(color) {
        this.backgroundState.selectedColor = color;
        this.backgroundState.selectedImage = null;
        
        // Update UI
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.color === color);
        });
        
        // Switch to color tab
        this.switchBackgroundTab('color');
        
        // Clear image preview
        if (this.elements.imagePreview) {
            this.elements.imagePreview.style.display = 'none';
        }
        if (this.elements.imageUploadArea) {
            this.elements.imageUploadArea.style.display = 'block';
        }
        if (this.elements.imageUpload) {
            this.elements.imageUpload.value = '';
        }
    }

    async handleImageUpload(file) {
        try {
            if (!file.type.match('image.*')) {
                throw new Error('Please select an image file (JPG, PNG, etc.)');
            }
            
            if (file.size > 2 * 1024 * 1024) {
                throw new Error('Image must be less than 2MB');
            }
            
            const imageData = await this.readFileAsDataURL(file);
            this.backgroundState.selectedImage = imageData;
            this.backgroundState.selectedColor = null;
            this.showImagePreview(imageData);
            this.switchBackgroundTab('image');
        } catch (error) {
            this.showToast(error.message, false);
        }
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read image'));
            reader.readAsDataURL(file);
        });
    }

    showImagePreview(imageData) {
        if (this.elements.previewImage) {
            this.elements.previewImage.src = imageData;
        }
        if (this.elements.imagePreview) {
            this.elements.imagePreview.style.display = 'block';
        }
        if (this.elements.imageUploadArea) {
            this.elements.imageUploadArea.style.display = 'none';
        }
    }

    removeImage() {
        this.backgroundState.selectedImage = null;
        this.backgroundState.selectedColor = null;
        
        if (this.elements.imagePreview) {
            this.elements.imagePreview.style.display = 'none';
        }
        if (this.elements.imageUploadArea) {
            this.elements.imageUploadArea.style.display = 'block';
        }
        if (this.elements.imageUpload) {
            this.elements.imageUpload.value = '';
        }
    }

    saveBackground() {
        console.log('Save background function called'); // Debug
        
        if (!this.state.currentAction?.id) {
            console.error('No current action');
            return;
        }
        
        const savingIndex = this.state.savings.findIndex(s => s.id === this.state.currentAction.id);
        if (savingIndex === -1) {
            console.error('Saving not found');
            return;
        }
        
        let background = null;
        
        if (this.backgroundState.selectedColor) {
            background = this.backgroundState.selectedColor;
            console.log('Setting color background:', background);
        } else if (this.backgroundState.selectedImage) {
            background = this.backgroundState.selectedImage;
            console.log('Setting image background');
        }
        
        this.state.savings[savingIndex].background = background;
        this.saveState();
        this.render();
        this.closeAllModals();
        
        this.showToast('Background updated!');
    }

    // ===== UTILITIES =====
    getFilteredAndSortedSavings() {
        let filtered = [...this.state.savings];
        
        // Filter
        if (this.state.filterCategory !== 'all') {
            filtered = filtered.filter(s => s.category === this.state.filterCategory);
        }
        
        // Sort
        switch (this.state.sortBy) {
            case 'progress-desc':
                filtered.sort((a, b) => 
                    this.calculateProgress(b) - this.calculateProgress(a));
                break;
            case 'target-desc':
                filtered.sort((a, b) => b.targetAmount - a.targetAmount);
                break;
            case 'date-desc':
            default:
                filtered.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        return filtered;
    }

    calculateProgress(saving) {
        if (saving.targetAmount === 0) return 0;
        return Math.min(100, Math.round((saving.currentAmount / saving.targetAmount) * 100));
    }

    updateStats() {
        const totalGoals = this.state.savings.length;
        const totalSaved = this.state.savings.reduce((sum, s) => sum + s.currentAmount, 0);
        const completedGoals = this.state.savings.filter(s => 
            this.calculateProgress(s) >= 100
        ).length;
        
        if (this.elements.totalGoals) this.elements.totalGoals.textContent = totalGoals;
        if (this.elements.totalSaved) this.elements.totalSaved.textContent = `$${totalSaved.toFixed(2)}`;
        if (this.elements.completedGoals) this.elements.completedGoals.textContent = completedGoals;
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.state.theme);
        this.updateThemeIcon();
        this.saveState();
    }

    updateThemeIcon() {
        if (!this.elements.themeToggle) return;
        const icon = this.elements.themeToggle.querySelector('i');
        if (icon) {
            icon.className = this.state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    showModal(modal) {
        if (this.elements.modalOverlay && modal) {
            this.elements.modalOverlay.style.display = 'block';
            modal.style.display = 'block';
        }
    }

    closeAllModals() {
        if (this.elements.modalOverlay) this.elements.modalOverlay.style.display = 'none';
        [this.elements.savingModal, this.elements.deleteModal, 
         this.elements.addMoneyModal, this.elements.backgroundModal]
            .forEach(modal => {
                if (modal) modal.style.display = 'none';
            });
        this.state.currentAction = null;
    }

    showToast(message, showUndo = false) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span>${message}</span>
            ${showUndo ? '<button class="undo-btn">Undo</button>' : ''}
        `;
        
        document.body.appendChild(toast);
        
        if (showUndo) {
            const undoBtn = toast.querySelector('.undo-btn');
            undoBtn.addEventListener('click', () => {
                if (this.deletedItems.length > 0) {
                    const lastDeleted = this.deletedItems.pop().item;
                    this.state.savings.push(lastDeleted);
                    this.saveState();
                    this.render();
                }
                toast.remove();
            });
        }
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    isLightColor(color) {
        if (!color.startsWith('#')) return false;
        const rgb = this.hexToRgb(color);
        // Calculate brightness
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 150;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
}

// ===== INITIALIZE APP =====
const app = new SavingsApp();