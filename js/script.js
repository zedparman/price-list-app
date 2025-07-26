// Smartwise Price List - Main JavaScript File

// Global Variables
let products = JSON.parse(localStorage.getItem('smartwise_products')) || [];
let categories = JSON.parse(localStorage.getItem('smartwise_categories')) || ['دسته پیشفرض'];
let currentView = 'grid'; // 'grid' or 'list'
let currentFilter = 'all';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    const currentPage = getCurrentPage();
    
    switch(currentPage) {
        case 'index':
            initializeHomePage();
            break;
        case 'add-product':
            initializeAddProductPage();
            break;
        case 'edit-product':
            initializeEditProductPage();
            break;
        case 'settings':
            initializeSettingsPage();
            break;
        case 'profile':
            initializeProfilePage();
            break;
    }
    
    // Initialize common features
    initializeCommonFeatures();
}

// Get Current Page
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().split('.')[0];
    return filename || 'index';
}

// Initialize Common Features
function initializeCommonFeatures() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Add loading states to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('no-loading')) {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 1000);
            }
        });
    });
}

// Home Page Functions
function initializeHomePage() {
    const searchInput = document.getElementById('searchInput');
    const filterAll = document.getElementById('filterAll');
    const filterDefault = document.getElementById('filterDefault');
    const listView = document.getElementById('listView');
    const gridView = document.getElementById('gridView');
    const qrScanner = document.getElementById('qrScanner');
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter functionality
    if (filterAll) {
        filterAll.addEventListener('click', () => setFilter('all'));
    }
    if (filterDefault) {
        filterDefault.addEventListener('click', () => setFilter('default'));
    }
    
    // View toggle
    if (listView) {
        listView.addEventListener('click', () => setView('list'));
    }
    if (gridView) {
        gridView.addEventListener('click', () => setView('grid'));
    }
    
    // QR Scanner
    if (qrScanner) {
        qrScanner.addEventListener('click', handleQRScan);
    }
    
    // Load products
    loadProducts();
}

// Add Product Page Functions
function initializeAddProductPage() {
    const form = document.getElementById('addProductForm');
    const mainImageInput = document.getElementById('mainImage');
    const galleryImageInput = document.getElementById('galleryImage');
    const categoryModal = document.getElementById('categoryModal');
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleAddProduct);
    }
    
    // Image upload handlers
    if (mainImageInput) {
        mainImageInput.addEventListener('change', handleImageUpload);
    }
    if (galleryImageInput) {
        galleryImageInput.addEventListener('change', handleImageUpload);
    }
    
    // Category management
    initializeCategoryManagement();
}

// Edit Product Page Functions
function initializeEditProductPage() {
    const form = document.getElementById('editProductForm');
    const decreaseQty = document.getElementById('decreaseQty');
    const increaseQty = document.getElementById('increaseQty');
    const decreaseDiscount = document.getElementById('decreaseDiscount');
    const increaseDiscount = document.getElementById('increaseDiscount');
    const quantityInput = document.getElementById('editQuantity');
    const discountInput = document.getElementById('discount');
    const salePriceInputs = document.querySelectorAll('input[name="salePrice"]');
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleEditProduct);
    }
    
    // Quantity controls
    if (decreaseQty) {
        decreaseQty.addEventListener('click', () => adjustQuantity(-1));
    }
    if (increaseQty) {
        increaseQty.addEventListener('click', () => adjustQuantity(1));
    }
    
    // Discount controls
    if (decreaseDiscount) {
        decreaseDiscount.addEventListener('click', () => adjustDiscount(-5));
    }
    if (increaseDiscount) {
        increaseDiscount.addEventListener('click', () => adjustDiscount(5));
    }
    
    // Price calculation
    salePriceInputs.forEach(input => {
        input.addEventListener('change', calculateFinalPrice);
    });
    
    if (discountInput) {
        discountInput.addEventListener('input', calculateFinalPrice);
    }
    
    // Initial calculation
    calculateFinalPrice();
}

// Settings Page Functions
function initializeSettingsPage() {
    const notificationsToggle = document.getElementById('notifications');
    const themeSelect = document.querySelector('select');
    
    // Load settings
    loadSettings();
    
    // Notifications toggle
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', handleNotificationToggle);
    }
    
    // Theme selection
    if (themeSelect) {
        themeSelect.addEventListener('change', handleThemeChange);
    }
}

// Profile Page Functions
function initializeProfilePage() {
    const twoFactorToggle = document.getElementById('twoFactor');
    
    // Load profile settings
    loadProfileSettings();
    
    // Two-factor authentication toggle
    if (twoFactorToggle) {
        twoFactorToggle.addEventListener('change', handleTwoFactorToggle);
    }
}

// Product Management Functions
function loadProducts() {
    const container = document.getElementById('productsContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (!container) return;
    
    let filteredProducts = filterProducts();
    
    if (filteredProducts.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    container.innerHTML = renderProducts(filteredProducts);
}

function filterProducts() {
    let filtered = products;
    
    // Apply category filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(product => product.category === currentFilter);
    }
    
    // Apply search filter
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.serialNumber.toLowerCase().includes(searchTerm)
        );
    }
    
    return filtered;
}

function renderProducts(products) {
    if (currentView === 'list') {
        return renderProductsList(products);
    } else {
        return renderProductsGrid(products);
    }
}

function renderProductsList(products) {
    return `
        <div class="list-group">
            ${products.map(product => `
                <div class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${product.name}</h6>
                            <p class="mb-1 text-muted small">${product.serialNumber}</p>
                            <small class="text-success">${formatPrice(product.salePrice)} تومان</small>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-primary">${product.quantity}</span>
                            <div class="btn-group btn-group-sm mt-2">
                                <button class="btn btn-outline-primary" onclick="editProduct('${product.id}')">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="deleteProduct('${product.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderProductsGrid(products) {
    return `
        <div class="row g-3">
            ${products.map(product => `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="card product-card">
                        <div class="card-body text-center">
                            <div class="product-image mb-2">
                                <i class="bi bi-box text-muted" style="font-size: 2rem;"></i>
                            </div>
                            <h6 class="card-title small">${product.name}</h6>
                            <p class="card-text text-muted small">${product.serialNumber}</p>
                            <p class="text-success fw-bold">${formatPrice(product.salePrice)} تومان</p>
                            <div class="btn-group btn-group-sm w-100">
                                <button class="btn btn-outline-primary" onclick="editProduct('${product.id}')">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="deleteProduct('${product.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Event Handlers
function handleSearch(event) {
    loadProducts();
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update UI
    document.getElementById('filterAll').classList.toggle('btn-success', filter === 'all');
    document.getElementById('filterAll').classList.toggle('btn-outline-secondary', filter !== 'all');
    document.getElementById('filterDefault').classList.toggle('btn-success', filter === 'default');
    document.getElementById('filterDefault').classList.toggle('btn-outline-secondary', filter !== 'default');
    
    loadProducts();
}

function setView(view) {
    currentView = view;
    
    // Update UI
    document.getElementById('listView').classList.toggle('btn-primary', view === 'list');
    document.getElementById('listView').classList.toggle('btn-outline-primary', view !== 'list');
    document.getElementById('gridView').classList.toggle('btn-primary', view === 'grid');
    document.getElementById('gridView').classList.toggle('btn-outline-primary', view !== 'grid');
    
    loadProducts();
}

function handleQRScan() {
    showToast('قابلیت اسکن QR در نسخه آینده اضافه خواهد شد', 'info');
}

function handleAddProduct(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const product = {
        id: generateId(),
        name: formData.get('productName') || document.getElementById('productName').value,
        serialNumber: document.getElementById('serialNumber').value,
        quantity: parseInt(document.getElementById('quantity').value) || 1,
        purchasePrice: parseFloat(document.getElementById('purchasePrice').value) || 0,
        salePrice: parseFloat(document.getElementById('purchasePrice').value) * 1.2 || 0,
        category: 'دسته پیشفرض',
        createdAt: new Date().toISOString()
    };
    
    products.push(product);
    saveProducts();
    
    showToast('محصول با موفقیت اضافه شد', 'success');
    
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function handleEditProduct(event) {
    event.preventDefault();
    
    // This would normally get the product ID from URL params
    const productId = getUrlParameter('id') || products[0]?.id;
    
    if (!productId) {
        showToast('محصول یافت نشد', 'error');
        return;
    }
    
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
        showToast('محصول یافت نشد', 'error');
        return;
    }
    
    // Update product
    products[productIndex] = {
        ...products[productIndex],
        name: document.getElementById('editProductName').value,
        serialNumber: document.getElementById('editSerialNumber').value,
        quantity: parseInt(document.getElementById('editQuantity').value),
        purchasePrice: parseFloat(document.getElementById('editPurchasePrice').value),
        salePrice: getSelectedSalePrice(),
        discount: parseFloat(document.getElementById('discount').value) || 0,
        description: document.getElementById('description').value,
        updatedAt: new Date().toISOString()
    };
    
    saveProducts();
    showToast('محصول با موفقیت به‌روزرسانی شد', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const label = event.target.nextElementSibling || event.target.previousElementSibling;
            if (label) {
                label.innerHTML = `<img src="${e.target.result}" class="img-fluid rounded" style="max-height: 80px;">`;
            }
        };
        reader.readAsDataURL(file);
    }
}

function adjustQuantity(change) {
    const input = document.getElementById('editQuantity');
    if (input) {
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.max(0, currentValue + change);
        input.value = newValue;
    }
}

function adjustDiscount(change) {
    const input = document.getElementById('discount');
    if (input) {
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.max(0, Math.min(100, currentValue + change));
        input.value = newValue;
        calculateFinalPrice();
    }
}

function calculateFinalPrice() {
    const selectedPriceInput = document.querySelector('input[name="salePrice"]:checked');
    const discountInput = document.getElementById('discount');
    const finalPriceElement = document.getElementById('finalPrice');
    
    if (!selectedPriceInput || !finalPriceElement) return;
    
    const basePrice = parseFloat(selectedPriceInput.value) || 0;
    const discount = parseFloat(discountInput?.value) || 0;
    const finalPrice = basePrice * (1 - discount / 100);
    
    finalPriceElement.textContent = `${formatPrice(finalPrice)} تومان`;
}

function getSelectedSalePrice() {
    const selectedInput = document.querySelector('input[name="salePrice"]:checked');
    return selectedInput ? parseFloat(selectedInput.value) : 0;
}

// Category Management
function initializeCategoryManagement() {
    const addCategoryBtn = document.getElementById('addCategory');
    const categoryButtons = document.querySelectorAll('[data-category]');
    
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', handleAddCategory);
    }
    
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            selectCategory(category);
        });
    });
}

function handleAddCategory() {
    const input = document.getElementById('newCategory');
    const categoryName = input.value.trim();
    
    if (!categoryName) {
        showToast('نام دسته‌بندی را وارد کنید', 'warning');
        return;
    }
    
    if (categories.includes(categoryName)) {
        showToast('این دسته‌بندی قبلاً وجود دارد', 'warning');
        return;
    }
    
    categories.push(categoryName);
    saveCategories();
    
    // Add to UI
    const listGroup = document.querySelector('.list-group');
    const newButton = document.createElement('button');
    newButton.className = 'list-group-item list-group-item-action';
    newButton.dataset.category = categoryName;
    newButton.textContent = categoryName;
    newButton.addEventListener('click', function() {
        selectCategory(categoryName);
    });
    
    listGroup.insertBefore(newButton, listGroup.lastElementChild);
    
    input.value = '';
    showToast('دسته‌بندی جدید اضافه شد', 'success');
}

function selectCategory(category) {
    // Update button text or handle category selection
    showToast(`دسته‌بندی "${category}" انتخاب شد`, 'info');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
    if (modal) {
        modal.hide();
    }
}

// Settings Functions
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('smartwise_settings')) || {};
    
    const notificationsToggle = document.getElementById('notifications');
    if (notificationsToggle) {
        notificationsToggle.checked = settings.notifications !== false;
    }
    
    const themeSelect = document.querySelector('select');
    if (themeSelect && settings.theme) {
        themeSelect.value = settings.theme;
    }
}

function handleNotificationToggle(event) {
    const settings = JSON.parse(localStorage.getItem('smartwise_settings')) || {};
    settings.notifications = event.target.checked;
    localStorage.setItem('smartwise_settings', JSON.stringify(settings));
    
    showToast(
        event.target.checked ? 'اعلان‌ها فعال شد' : 'اعلان‌ها غیرفعال شد',
        'info'
    );
}

function handleThemeChange(event) {
    const settings = JSON.parse(localStorage.getItem('smartwise_settings')) || {};
    settings.theme = event.target.value;
    localStorage.setItem('smartwise_settings', JSON.stringify(settings));
    
    showToast(`تم "${event.target.value}" اعمال شد`, 'info');
}

// Profile Functions
function loadProfileSettings() {
    const profile = JSON.parse(localStorage.getItem('smartwise_profile')) || {};
    
    const twoFactorToggle = document.getElementById('twoFactor');
    if (twoFactorToggle) {
        twoFactorToggle.checked = profile.twoFactor === true;
    }
}

function handleTwoFactorToggle(event) {
    const profile = JSON.parse(localStorage.getItem('smartwise_profile')) || {};
    profile.twoFactor = event.target.checked;
    localStorage.setItem('smartwise_profile', JSON.stringify(profile));
    
    showToast(
        event.target.checked ? 'احراز هویت دو مرحله‌ای فعال شد' : 'احراز هویت دو مرحله‌ای غیرفعال شد',
        'info'
    );
}

// Global Functions
function editProduct(productId) {
    window.location.href = `edit-product.html?id=${productId}`;
}

function deleteProduct(productId) {
    if (confirm('آیا از حذف این محصول اطمینان دارید؟')) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        loadProducts();
        showToast('محصول حذف شد', 'success');
    }
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    // Add to page
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove after hiding
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Storage Functions
function saveProducts() {
    localStorage.setItem('smartwise_products', JSON.stringify(products));
}

function saveCategories() {
    localStorage.setItem('smartwise_categories', JSON.stringify(categories));
}

// Sample Data (for demonstration)
function loadSampleData() {
    if (products.length === 0) {
        products = [
            {
                id: 'sample1',
                name: 'لپ‌تاپ ایسوس',
                serialNumber: 'ASUS001',
                quantity: 5,
                purchasePrice: 15000000,
                salePrice: 18000000,
                category: 'الکترونیک',
                createdAt: new Date().toISOString()
            },
            {
                id: 'sample2',
                name: 'گوشی سامسونگ',
                serialNumber: 'SAM002',
                quantity: 10,
                purchasePrice: 8000000,
                salePrice: 9500000,
                category: 'الکترونیک',
                createdAt: new Date().toISOString()
            }
        ];
        saveProducts();
    }
}

// Load sample data on first visit
if (localStorage.getItem('smartwise_first_visit') === null) {
    loadSampleData();
    localStorage.setItem('smartwise_first_visit', 'false');
}