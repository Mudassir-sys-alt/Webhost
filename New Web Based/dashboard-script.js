// Dashboard JavaScript Functionality

// DOM Elements
const dropdowns = document.querySelectorAll('.dropdown');
const modals = document.querySelectorAll('.modal');
const statNumbers = document.querySelectorAll('.stat-number');

// Idle timeout functionality
let idleTimeout;
let idleWarningTimeout;
let isIdleWarningShown = false;
const IDLE_TIMEOUT_MINUTES = 10;
const IDLE_WARNING_MINUTES = 1; // Show warning 1 minute before logout
const IDLE_TIMEOUT_MS = IDLE_TIMEOUT_MINUTES * 60 * 1000;
const IDLE_WARNING_MS = IDLE_WARNING_MINUTES * 60 * 1000;

// Function to reset idle timer
function resetIdleTimer() {
    // Clear existing timeouts
    if (idleTimeout) {
        clearTimeout(idleTimeout);
    }
    if (idleWarningTimeout) {
        clearTimeout(idleWarningTimeout);
    }
    
    // Hide warning modal if it's shown
    if (isIdleWarningShown) {
        hideIdleWarning();
    }
    
    // Set warning timeout (9 minutes)
    idleWarningTimeout = setTimeout(() => {
        showIdleWarning();
    }, IDLE_TIMEOUT_MS - IDLE_WARNING_MS);
    
    // Set logout timeout (10 minutes)
    idleTimeout = setTimeout(() => {
        performIdleLogout();
    }, IDLE_TIMEOUT_MS);
}

// Function to show idle warning
function showIdleWarning() {
    isIdleWarningShown = true;
    
    // Create warning modal if it doesn't exist
    let warningModal = document.getElementById('idle-warning-modal');
    if (!warningModal) {
        warningModal = document.createElement('div');
        warningModal.id = 'idle-warning-modal';
        warningModal.className = 'modal show';
        warningModal.innerHTML = `
            <div class="modal-content idle-warning-content">
                <div class="modal-header">
                    <h2><i class="fas fa-exclamation-triangle"></i> Session Timeout Warning</h2>
                </div>
                <div class="modal-body">
                    <p>Your session will expire in <span id="countdown-timer">${IDLE_WARNING_MINUTES}:00</span> due to inactivity.</p>
                    <p>Click "Stay Logged In" to continue your session.</p>
                    <div class="warning-actions">
                        <button class="btn btn-primary" onclick="extendSession()">
                            <i class="fas fa-clock"></i> Stay Logged In
                        </button>
                        <button class="btn btn-secondary" onclick="performIdleLogout()">
                            <i class="fas fa-sign-out-alt"></i> Logout Now
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(warningModal);
    } else {
        warningModal.classList.add('show');
    }
    
    // Start countdown timer
    startCountdown();
    
    // Prevent closing by clicking outside
    warningModal.addEventListener('click', function(e) {
        if (e.target === warningModal) {
            e.stopPropagation();
        }
    });
    
    // Prevent closing with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isIdleWarningShown) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
}

// Function to hide idle warning
function hideIdleWarning() {
    isIdleWarningShown = false;
    const warningModal = document.getElementById('idle-warning-modal');
    if (warningModal) {
        warningModal.classList.remove('show');
    }
    stopCountdown();
}

// Function to start countdown timer
function startCountdown() {
    let timeLeft = IDLE_WARNING_MINUTES * 60; // seconds
    
    const countdownInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const countdownElement = document.getElementById('countdown-timer');
        
        if (countdownElement) {
            countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
    
    // Store interval ID for cleanup
    window.countdownInterval = countdownInterval;
}

// Function to stop countdown timer
function stopCountdown() {
    if (window.countdownInterval) {
        clearInterval(window.countdownInterval);
        window.countdownInterval = null;
    }
}

// Function to extend session
function extendSession() {
    hideIdleWarning();
    resetIdleTimer();
    showNotification('Session Extended', 'Your session has been extended. You will remain logged in.', 'success');
}

// Function to perform idle logout
function performIdleLogout() {
    hideIdleWarning();
    showNotification('Session Expired', 'You have been logged out due to inactivity.', 'error');
    
    // Clear all timeouts
    if (idleTimeout) {
        clearTimeout(idleTimeout);
    }
    if (idleWarningTimeout) {
        clearTimeout(idleWarningTimeout);
    }
    
    // Perform logout
    logout();
}

// Function to setup idle timeout
function setupIdleTimeout() {
    // Reset timer on user activity
    const activityEvents = [
        'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
    ];
    
    activityEvents.forEach(event => {
        document.addEventListener(event, resetIdleTimer, true);
    });
    
    // Start the initial timer
    resetIdleTimer();
    
    // Show notification that idle timeout is active
    showNotification('Session Management', `You will be automatically logged out after ${IDLE_TIMEOUT_MINUTES} minutes of inactivity.`, 'info');
}

// Dropdown functionality
function toggleDropdown(dropdownId) {
    const dropdown = document.querySelector(`[onclick="toggleDropdown('${dropdownId}')"]`).parentElement;
    
    // Close all other dropdowns
    dropdowns.forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('active');
        }
    });
    
    // Toggle current dropdown
    dropdown.classList.toggle('active');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-item')) {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
});

         // Modal functionality
         function openInventory(type) {
             const modalId = type === 'bikes' ? 'bikes-inventory-modal' : 'um-inventory-modal';
             const modal = document.getElementById(modalId);

             if (modal) {
                 modal.classList.add('show');
                 document.body.style.overflow = 'hidden';

                 // Close dropdown after opening modal
                 dropdowns.forEach(dropdown => {
                     dropdown.classList.remove('active');
                 });

                 // Load bike data if opening bikes inventory
                 if (type === 'bikes') {
                     loadBikeData();
                 }
             }
         }

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        modals.forEach(modal => {
            if (modal.classList.contains('show')) {
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    }
});

// Dashboard functionality
function openDashboard() {
    // Scroll to top of dashboard
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Add a subtle animation to indicate dashboard is active
    const welcomeSection = document.querySelector('.welcome-section');
    welcomeSection.style.transform = 'scale(1.02)';
    setTimeout(() => {
        welcomeSection.style.transform = 'scale(1)';
    }, 200);
}

function openReports() {
    // Show a placeholder message for reports
    showNotification('Reports', 'Reports functionality will be available soon!', 'info');
}

// Notification system
function showNotification(title, message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-header">
            <h4>${title}</h4>
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <p>${message}</p>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 10px;
        padding: 1rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Animate statistics numbers
function animateNumbers() {
    statNumbers.forEach(stat => {
        const target = parseFloat(stat.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format number based on whether it's a decimal or integer
            if (Number.isInteger(target)) {
                stat.textContent = Math.floor(current);
            } else {
                stat.textContent = current.toFixed(1);
            }
        }, 16);
    });
}

// Logout functionality
function logout() {
    // Use user manager logout if available
    if (userManager) {
        userManager.logout();
    } else {
        // Fallback logout
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userEmail');
        
        // Show logout notification
        showNotification('Logout', 'You have been successfully logged out.', 'success');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// Search functionality for inventory tables
function setupSearch() {
    const searchInputs = document.querySelectorAll('.search-box input');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const table = this.closest('.modal-body').querySelector('table tbody');
            const rows = table.querySelectorAll('tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });
}

// Add click handlers for action buttons
function setupActionButtons() {
    const editButtons = document.querySelectorAll('.btn-icon .fa-edit');
    const deleteButtons = document.querySelectorAll('.btn-icon .fa-trash');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const row = this.closest('tr');
            const id = row.cells[0].textContent;
            showNotification('Edit', `Edit functionality for ${id} will be available soon!`, 'info');
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const row = this.closest('tr');
            const id = row.cells[0].textContent;
            
            if (confirm(`Are you sure you want to delete ${id}?`)) {
                showNotification('Delete', `${id} has been deleted successfully.`, 'success');
                // In a real application, you would make an API call here
            }
        });
    });
}

// Add button functionality
function setupAddButtons() {
    const addButtons = document.querySelectorAll('.btn-primary');
    
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-body');
            const isBikes = modal.querySelector('#bikes-inventory-modal') !== null;
            const type = isBikes ? 'Bike' : 'Vehicle';
            
            showNotification('Add New', `Add new ${type} functionality will be available soon!`, 'info');
        });
    });
}

         // Function to update UI based on user permissions
         function updatePermissionUI() {
             if (!userManager || !userManager.currentUser) return;
             
             const addBikeBtn = document.getElementById('add-bike-btn');
             
             // Update Add Bike button
             if (addBikeBtn) {
                 if (!userManager.canAdd()) {
                     addBikeBtn.disabled = true;
                     addBikeBtn.style.opacity = '0.5';
                     addBikeBtn.style.cursor = 'not-allowed';
                     addBikeBtn.title = 'Add New Bike (Admin/Manager Only)';
                 } else {
                     addBikeBtn.disabled = false;
                     addBikeBtn.style.opacity = '1';
                     addBikeBtn.style.cursor = 'pointer';
                     addBikeBtn.title = 'Add New Bike';
                 }
             }
             
             // Show permission status in header
             const userInfo = document.querySelector('.user-name');
             if (userInfo && userManager.currentUser) {
                 const roleText = userManager.currentUser.role === 'admin' ? 
                     ' (Full Access)' : 
                     userManager.currentUser.role === 'manager' ? 
                     ' (Limited Access)' : 
                     ' (View Only)';
                 
                 userInfo.innerHTML = `Welcome, ${userManager.currentUser.name} <span class="user-role ${userManager.currentUser.role}">${userManager.currentUser.role}</span><span class="text-muted">${roleText}</span>`;
             }
         }

         // Initialize dashboard when DOM is loaded
         document.addEventListener('DOMContentLoaded', function() {
             // Initialize user manager and update UI
             if (userManager && userManager.currentUser) {
                 userManager.updateUI();
                 updatePermissionUI();
             }
             
             // Animate numbers after a short delay
             setTimeout(animateNumbers, 500);

             // Setup search functionality
             setupSearch();

             // Setup action buttons
             setupActionButtons();

             // Setup add buttons
             setupAddButtons();

             // Setup bike search functionality
             setupBikeSearch();

             // Add smooth scrolling
             document.documentElement.style.scrollBehavior = 'smooth';

             // Add loading animation
             const mainContent = document.querySelector('.main-content');
             mainContent.style.opacity = '0';
             mainContent.style.transform = 'translateY(20px)';

             setTimeout(() => {
                 mainContent.style.transition = 'all 0.6s ease';
                 mainContent.style.opacity = '1';
                 mainContent.style.transform = 'translateY(0)';
             }, 100);

             // Setup idle timeout
             setupIdleTimeout();
         });

// Add CSS for notifications and idle warning
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .notification {
        border-left: 4px solid #667eea;
    }
    
    .notification.success {
        border-left-color: #28a745;
    }
    
    .notification.error {
        border-left-color: #dc3545;
    }
    
    .notification.info {
        border-left-color: #17a2b8;
    }
    
    .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .notification-header h4 {
        margin: 0;
        color: #333;
    }
    
    .notification-header button {
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .notification-header button:hover {
        background: #f0f0f0;
        color: #333;
    }
    
    .notification p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
    }
    
    /* Idle Warning Modal Styles */
    .idle-warning-content {
        max-width: 500px;
        border: 2px solid #ffc107;
        box-shadow: 0 10px 30px rgba(255, 193, 7, 0.3);
    }
    
    .idle-warning-content .modal-header {
        background: linear-gradient(135deg, #ffc107, #ff8f00);
        color: white;
        border-bottom: 1px solid #ff8f00;
    }
    
    .idle-warning-content .modal-header h2 {
        color: white;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .idle-warning-content .modal-body {
        padding: 2rem;
        text-align: center;
    }
    
    .idle-warning-content .modal-body p {
        margin-bottom: 1rem;
        font-size: 1.1rem;
        color: #333;
    }
    
    #countdown-timer {
        font-weight: bold;
        color: #dc3545;
        font-size: 1.2rem;
        background: #f8f9fa;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border: 1px solid #dee2e6;
    }
    
    .warning-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1.5rem;
    }
    
    .warning-actions .btn {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        border-radius: 8px;
        transition: all 0.3s ease;
        min-width: 140px;
    }
    
    .warning-actions .btn-primary {
        background: linear-gradient(135deg, #28a745, #20c997);
        border: none;
        color: white;
    }
    
    .warning-actions .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
    }
    
    .warning-actions .btn-secondary {
        background: linear-gradient(135deg, #6c757d, #495057);
        border: none;
        color: white;
    }
    
    .warning-actions .btn-secondary:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(108, 117, 125, 0.4);
    }
    
    /* Animation for countdown timer */
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    #countdown-timer {
        animation: pulse 1s infinite;
    }
`;

document.head.appendChild(notificationStyles);

         // Bike Inventory Variables
         let bikeData = [];
         let filteredBikeData = [];
         let currentPage = 1;
         const itemsPerPage = 20;
         let sortColumn = -1;
         let sortDirection = 1; // 1 for ascending, -1 for descending

         // Load bike data from embedded array
         async function loadBikeData() {
             try {
                 console.log('Loading bike data from embedded array...');
                 
                 // Use the embedded bike data array
                 bikeData = window.bikeDataArray || [];
                 
                 console.log('Bike data loaded from array:', bikeData.length, 'bikes');
                 
                 if (bikeData.length === 0) {
                     throw new Error('No bike data available');
                 }

                 filteredBikeData = [...bikeData];
                 
                 // Update total count
                 document.getElementById('total-bike-count').textContent = bikeData.length;
                 
                 // Populate filter options
                 populateFilters();
                 
                 // Display first page
                 displayBikeData();
                 
                 showNotification('Success', `Loaded ${bikeData.length} bikes successfully from embedded data!`, 'success');
                 
             } catch (error) {
                 console.error('Error loading bike data:', error);
                 showNotification('Error', 'Failed to load bike data. Please check the data file.', 'error');
                 
                 // Load sample data for demonstration
                 console.log('Falling back to sample data...');
                 loadSampleBikeData();
             }
         }

         // Load sample data for demonstration
         function loadSampleBikeData() {
             bikeData = [
                 { chassisNo: 'MD9HAPXF4GR710037', regNo: 'KA01AQ6937', vehicleModel: 'Quantum', receivedDate: '22-Nov-24', city: 'BLR', batch: 'BLR_Batch 2_200', status: 'Received' },
                 { chassisNo: 'MD9HAPXF4GR710059', regNo: 'KA01AQ7030', vehicleModel: 'Quantum', receivedDate: '22-Nov-24', city: 'BLR', batch: 'BLR_Batch 2_200', status: 'Received' },
                 { chassisNo: 'MZTL1P30624001196', regNo: 'KA01AQ5575', vehicleModel: 'Lectrix', receivedDate: '20-Oct-24', city: 'BLR', batch: 'BLR_Batch 1_120', status: 'Received' },
                 { chassisNo: 'P6EBE1FCK24000002', regNo: 'UP16EQ6083', vehicleModel: 'Bounce', receivedDate: '26-Nov-24', city: 'Del', batch: 'Del_Batch 1_100', status: 'Received' },
                 { chassisNo: 'MD9HAPXF4FR710102', regNo: 'TG13T1824', vehicleModel: 'Quantum', receivedDate: '23-Aug-24', city: 'HYD', batch: 'Hyd_Batch 1_180', status: 'Received' }
             ];
             
             filteredBikeData = [...bikeData];
             document.getElementById('total-bike-count').textContent = bikeData.length;
             populateFilters();
             displayBikeData();
             
             console.log('Sample data loaded:', bikeData.length, 'bikes');
         }

         // Populate filter dropdowns
         function populateFilters() {
             const models = [...new Set(bikeData.map(bike => bike.vehicleModel))].sort();
             const cities = [...new Set(bikeData.map(bike => bike.city))].sort();
             const batches = [...new Set(bikeData.map(bike => bike.batch))].sort();
             
             populateSelect('model-filter', models);
             populateSelect('city-filter', cities);
             populateSelect('batch-filter', batches);
         }

         function populateSelect(selectId, options) {
             const select = document.getElementById(selectId);
             const currentValue = select.value;
             
             // Clear existing options except the first one
             select.innerHTML = select.options[0].outerHTML;
             
             options.forEach(option => {
                 const optionElement = document.createElement('option');
                 optionElement.value = option;
                 optionElement.textContent = option;
                 select.appendChild(optionElement);
             });
             
             select.value = currentValue;
         }

         // Display bike data with pagination
         function displayBikeData() {
             const tbody = document.getElementById('bikes-table-body');
             const startIndex = (currentPage - 1) * itemsPerPage;
             const endIndex = startIndex + itemsPerPage;
             const pageData = filteredBikeData.slice(startIndex, endIndex);
             
             tbody.innerHTML = '';
             
             pageData.forEach(bike => {
                 const row = document.createElement('tr');
                 
                 // Create action buttons based on user permissions
                 let actionButtons = '';
                 
                 if (userManager.canEdit()) {
                     actionButtons += `<button class="btn-icon" onclick="editBike('${bike.chassisNo}')" title="Edit"><i class="fas fa-edit"></i></button>`;
                 } else {
                     actionButtons += `<button class="btn-icon permission-denied" title="Edit (Admin Only)"><i class="fas fa-edit"></i></button>`;
                 }
                 
                 if (userManager.canDelete()) {
                     actionButtons += `<button class="btn-icon" onclick="deleteBike('${bike.chassisNo}')" title="Delete"><i class="fas fa-trash"></i></button>`;
                 } else {
                     actionButtons += `<button class="btn-icon permission-denied" title="Delete (Admin Only)"><i class="fas fa-trash"></i></button>`;
                 }
                 
                 row.innerHTML = `
                     <td>${bike.chassisNo}</td>
                     <td>${bike.regNo}</td>
                     <td>${bike.vehicleModel}</td>
                     <td>${bike.receivedDate}</td>
                     <td>${bike.city}</td>
                     <td>${bike.batch}</td>
                     <td><span class="status available">${bike.status}</span></td>
                     <td>
                         ${actionButtons}
                     </td>
                 `;
                 tbody.appendChild(row);
             });
             
             updatePagination();
             
             // Update permission UI after displaying data
             updatePermissionUI();
         }

         // Update pagination controls
         function updatePagination() {
             const totalPages = Math.ceil(filteredBikeData.length / itemsPerPage);
             const pageInfo = document.getElementById('page-info');
             const prevBtn = document.getElementById('prev-btn');
             const nextBtn = document.getElementById('next-btn');
             
             pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
             
             prevBtn.disabled = currentPage === 1;
             nextBtn.disabled = currentPage === totalPages;
             
             // Update total count for filtered results
             document.getElementById('total-bike-count').textContent = filteredBikeData.length;
         }

         // Pagination functions
         function previousPage() {
             if (currentPage > 1) {
                 currentPage--;
                 displayBikeData();
             }
         }

         function nextPage() {
             const totalPages = Math.ceil(filteredBikeData.length / itemsPerPage);
             if (currentPage < totalPages) {
                 currentPage++;
                 displayBikeData();
             }
         }

         // Apply filters
         function applyFilters() {
             const modelFilter = document.getElementById('model-filter').value;
             const cityFilter = document.getElementById('city-filter').value;
             const batchFilter = document.getElementById('batch-filter').value;
             const statusFilter = document.getElementById('status-filter').value;
             const searchTerm = document.getElementById('bike-search').value.toLowerCase();
             
             filteredBikeData = bikeData.filter(bike => {
                 const matchesModel = !modelFilter || bike.vehicleModel === modelFilter;
                 const matchesCity = !cityFilter || bike.city === cityFilter;
                 const matchesBatch = !batchFilter || bike.batch === batchFilter;
                 const matchesStatus = !statusFilter || bike.status === statusFilter;
                 const matchesSearch = !searchTerm || 
                     bike.chassisNo.toLowerCase().includes(searchTerm) ||
                     bike.regNo.toLowerCase().includes(searchTerm) ||
                     bike.vehicleModel.toLowerCase().includes(searchTerm) ||
                     bike.city.toLowerCase().includes(searchTerm) ||
                     bike.batch.toLowerCase().includes(searchTerm);
                 
                 return matchesModel && matchesCity && matchesBatch && matchesStatus && matchesSearch;
             });
             
             currentPage = 1;
             displayBikeData();
         }

         // Clear all filters
         function clearFilters() {
             document.getElementById('model-filter').value = '';
             document.getElementById('city-filter').value = '';
             document.getElementById('batch-filter').value = '';
             document.getElementById('status-filter').value = '';
             document.getElementById('bike-search').value = '';
             
             filteredBikeData = [...bikeData];
             currentPage = 1;
             displayBikeData();
         }

         // Sort table
         function sortTable(columnIndex) {
             if (sortColumn === columnIndex) {
                 sortDirection *= -1;
             } else {
                 sortColumn = columnIndex;
                 sortDirection = 1;
             }
             
             const columnNames = ['chassisNo', 'regNo', 'vehicleModel', 'receivedDate', 'city', 'batch', 'status'];
             const columnName = columnNames[columnIndex];
             
             filteredBikeData.sort((a, b) => {
                 let aVal = a[columnName];
                 let bVal = b[columnName];
                 
                 // Handle date sorting
                 if (columnName === 'receivedDate') {
                     aVal = new Date(aVal);
                     bVal = new Date(bVal);
                 } else {
                     aVal = aVal.toLowerCase();
                     bVal = bVal.toLowerCase();
                 }
                 
                 if (aVal < bVal) return -1 * sortDirection;
                 if (aVal > bVal) return 1 * sortDirection;
                 return 0;
             });
             
             displayBikeData();
         }

         // Bike management functions
         function addNewBike() {
             if (!userManager.canAdd()) {
                 showNotification('Access Denied', 'You do not have permission to add new bikes.', 'error');
                 return;
             }
             showNotification('Add Bike', 'Add new bike functionality will be available soon!', 'info');
         }

         function editBike(chassisNo) {
             if (!userManager.canEdit()) {
                 showNotification('Access Denied', 'You do not have permission to edit bikes.', 'error');
                 return;
             }
             showNotification('Edit Bike', `Edit functionality for ${chassisNo} will be available soon!`, 'info');
         }

         function deleteBike(chassisNo) {
             if (!userManager.canDelete()) {
                 showNotification('Access Denied', 'You do not have permission to delete bikes.', 'error');
                 return;
             }
             if (confirm(`Are you sure you want to delete bike with chassis number ${chassisNo}?`)) {
                 showNotification('Delete Bike', `${chassisNo} has been deleted successfully.`, 'success');
                 // In a real application, you would make an API call here
             }
         }

         function exportBikeData() {
             if (!userManager.canExport()) {
                 showNotification('Access Denied', 'You do not have permission to export data.', 'error');
                 return;
             }
             
             const csvContent = generateCSV();
             const blob = new Blob([csvContent], { type: 'text/csv' });
             const url = window.URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = 'bikes_inventory.csv';
             a.click();
             window.URL.revokeObjectURL(url);
             
             showNotification('Export', 'Bike data exported successfully!', 'success');
         }

         function generateCSV() {
             const headers = ['Chassis No', 'Reg No', 'Vehicle Model', 'Received Date', 'City', 'Batch', 'Status'];
             const csvRows = [headers.join(',')];
             
             filteredBikeData.forEach(bike => {
                 const row = [
                     bike.chassisNo,
                     bike.regNo,
                     bike.vehicleModel,
                     bike.receivedDate,
                     bike.city,
                     bike.batch,
                     bike.status
                 ];
                 csvRows.push(row.join(','));
             });
             
             return csvRows.join('\n');
         }

         // Setup search functionality
         function setupBikeSearch() {
             const searchInput = document.getElementById('bike-search');
             if (searchInput) {
                 searchInput.addEventListener('input', applyFilters);
             }
         }

         // Export functions for global access
         window.toggleDropdown = toggleDropdown;
         window.openInventory = openInventory;
         window.closeModal = closeModal;
         window.openDashboard = openDashboard;
         window.openReports = openReports;
         window.logout = logout;
         window.showNotification = showNotification;
         window.loadBikeData = loadBikeData;
         window.applyFilters = applyFilters;
         window.clearFilters = clearFilters;
         window.sortTable = sortTable;
         window.previousPage = previousPage;
         window.nextPage = nextPage;
         window.addNewBike = addNewBike;
         window.editBike = editBike;
         window.deleteBike = deleteBike;
         window.exportBikeData = exportBikeData;
         
         // Idle timeout functions
         window.extendSession = extendSession;
         window.performIdleLogout = performIdleLogout;
         window.resetIdleTimer = resetIdleTimer; 

// Masters Modal Functions
function openMastersModal() {
    document.getElementById('masters-modal').style.display = 'flex';
    populateCityDropdownForCM();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // Uncheck all checkboxes when closing masters modal
    if (modalId === 'masters-modal') {
        document.getElementById('add-cm-checkbox').checked = false;
        document.getElementById('add-city-checkbox').checked = false;
        document.getElementById('add-parts-checkbox').checked = false;
    }
}

function closeAddModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // Uncheck the corresponding checkbox
    if (modalId === 'add-cm-modal') {
        document.getElementById('add-cm-checkbox').checked = false;
    } else if (modalId === 'add-city-modal') {
        document.getElementById('add-city-checkbox').checked = false;
    } else if (modalId === 'add-parts-modal') {
        document.getElementById('add-parts-checkbox').checked = false;
    }
}

function handleMastersCheckbox(type) {
    const checkbox = document.getElementById(`${type}-checkbox`);
    if (checkbox.checked) {
        if (type === 'add-cm') {
            document.getElementById('add-cm-modal').style.display = 'flex';
        } else if (type === 'add-city') {
            document.getElementById('add-city-modal').style.display = 'flex';
        } else if (type === 'add-parts') {
            document.getElementById('add-parts-modal').style.display = 'flex';
        }
    }
}

function populateCityDropdownForCM() {
    const citySelect = document.getElementById('cm-city-select');
    citySelect.innerHTML = '<option value="">Choose City</option>';
    
    // Get cities from localStorage or use default cities
    const cities = JSON.parse(localStorage.getItem('cities')) || ['BLR', 'Del', 'HYD', 'MUM', 'CHN'];
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = getCityDisplayName(city);
        citySelect.appendChild(option);
    });
}

function getCityDisplayName(cityCode) {
    const cityNames = {
        'BLR': 'Bangalore',
        'Del': 'Delhi',
        'HYD': 'Hyderabad',
        'MUM': 'Mumbai',
        'CHN': 'Chennai'
    };
    return cityNames[cityCode] || cityCode;
}

// Form submission handlers
document.addEventListener('DOMContentLoaded', function() {
    // Add CM form
    document.getElementById('add-cm-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const city = document.getElementById('cm-city-select').value;
        const cmName = document.getElementById('new-cm-name').value;
        
        if (!city || !cmName) {
            showNotification('Error', 'Please fill in all fields', 'error');
            return;
        }
        
        // Save CM data
        saveCMData(city, cmName);
        
        // Clear form and close modal
        this.reset();
        closeAddModal('add-cm-modal');
        showNotification('Success', `CM "${cmName}" added to ${getCityDisplayName(city)}`, 'success');
    });
    
    // Add City form
    document.getElementById('add-city-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const cityName = document.getElementById('new-city-name').value;
        
        if (!cityName) {
            showNotification('Error', 'Please enter a city name', 'error');
            return;
        }
        
        // Save city data
        saveCityData(cityName);
        
        // Clear form and close modal
        this.reset();
        closeAddModal('add-city-modal');
        showNotification('Success', `City "${cityName}" added successfully`, 'success');
    });
    
    // Add Parts form
    document.getElementById('add-parts-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const partName = document.getElementById('new-part-name').value;
        const partNumber = document.getElementById('new-part-number').value;
        
        if (!partName || !partNumber) {
            showNotification('Error', 'Please fill in all fields', 'error');
            return;
        }
        
        // Save parts data
        savePartsData(partName, partNumber);
        
        // Clear form and close modal
        this.reset();
        closeAddModal('add-parts-modal');
        showNotification('Success', `Part "${partName}" added successfully`, 'success');
    });
});

function saveCMData(city, cmName) {
    // Get existing CM data
    let cmData = JSON.parse(localStorage.getItem('cmData')) || {};
    
    // Initialize city array if it doesn't exist
    if (!cmData[city]) {
        cmData[city] = [];
    }
    
    // Add new CM if not already exists
    if (!cmData[city].includes(cmName)) {
        cmData[city].push(cmName);
        localStorage.setItem('cmData', JSON.stringify(cmData));
        
        // Trigger update event for maintenance form
        window.dispatchEvent(new CustomEvent('cmDataUpdated', { detail: { city, cmName } }));
    }
}

function saveCityData(cityName) {
    // Get existing cities
    let cities = JSON.parse(localStorage.getItem('cities')) || ['BLR', 'Del', 'HYD', 'MUM', 'CHN'];
    
    // Add new city if not already exists
    if (!cities.includes(cityName)) {
        cities.push(cityName);
        localStorage.setItem('cities', JSON.stringify(cities));
        
        // Trigger update event for maintenance form
        window.dispatchEvent(new CustomEvent('citiesUpdated', { detail: { cityName } }));
    }
}

function savePartsData(partName, partNumber) {
    // Get existing parts
    let parts = JSON.parse(localStorage.getItem('parts')) || [];
    
    // Add new part if not already exists
    const newPart = { name: partName, number: partNumber };
    const exists = parts.some(part => part.name === partName || part.number === partNumber);
    
    if (!exists) {
        parts.push(newPart);
        localStorage.setItem('parts', JSON.stringify(parts));
        
        // Trigger update event for maintenance form
        window.dispatchEvent(new CustomEvent('partsUpdated', { detail: { part: newPart } }));
    }
} 