// UM Inventory Bike Maintenance Form JavaScript

// Global variables
let partRowCounter = 0;
let uploadedFiles = [];
let cmData = []; // Store CM data
let umVehiclesData = []; // Store UM vehicles data

// DOM Elements
const maintenanceForm = document.getElementById('maintenanceForm');
const serviceIdInput = document.getElementById('serviceId');
const laborCostInput = document.getElementById('laborCost');
const partsCostInput = document.getElementById('partsCost');
const totalCostInput = document.getElementById('totalCost');
const photoUploadInput = document.getElementById('photoUpload');
const filePreviewDiv = document.getElementById('filePreview');

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for user management system to initialize
    setTimeout(() => {
        // Check if user is logged in
        checkUserAuthentication();
        
        initializeForm();
        setupEventListeners();
        updateUserInfo();
        checkAndClearDummyData(); // Clear any existing dummy data
    }, 100);
});

// Check user authentication
function checkUserAuthentication() {
    const currentUser = localStorage.getItem('currentUser');
    
    // Check if userManager is available and has a current user
    if (typeof userManager !== 'undefined' && userManager.currentUser) {
        return true;
    }
    
    // Check localStorage for currentUser
    if (currentUser) {
        return true;
    }
    
    // Only redirect if user is not logged in and we're not already on the login page
    if (window.location.pathname !== '/index.html' && !window.location.pathname.includes('index.html')) {
        // User is not logged in, redirect to login page
        showNotification('Authentication Required', 'Please log in to access this page.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return false;
    }
    
    return true;
}

// Initialize form
function initializeForm() {
    // Generate service ID
    generateServiceId();
    
    // Set default date and time
    setDefaultDateTime();
    
    // Populate city dropdown
    populateCityDropdown();
    
    // Load CM data
    loadCMData();
    
    // Add first part row
    addPartRow();
}

// Generate unique service ID
function generateServiceId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const serviceId = `SRV-${timestamp}-${random}`;
    serviceIdInput.value = serviceId;
}

// Set default date and time
function setDefaultDateTime() {
    const now = new Date();
    const dateTimeString = now.toISOString().slice(0, 16);
    document.getElementById('arrivalDateTime').value = dateTimeString;
    
    // Set expected completion to 3 days from now
    const completionDate = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    const completionDateString = completionDate.toISOString().slice(0, 10);
    document.getElementById('expectedCompletion').value = completionDateString;
    
    // Calculate ageing days after setting default dates
    setTimeout(calculateAgeingDays, 100);
}

// Populate city dropdown with unique cities from bike data
function populateCityDropdown() {
    const citySelect = document.getElementById('city');
    
    // Load cities from localStorage if available
    const savedCities = localStorage.getItem('cities');
    let cities = [];
    
    if (savedCities) {
        cities = JSON.parse(savedCities);
    } else {
        // Check if bikeDataArray is available
        if (typeof bikeDataArray !== 'undefined' && bikeDataArray.length > 0) {
            // Extract unique cities from bike data
            cities = [...new Set(bikeDataArray.map(bike => bike.city))].sort();
        } else {
            // Fallback: Add some default cities if bike data is not available
            cities = ['BLR', 'Del', 'HYD', 'MUM', 'CHN'];
        }
    }
    
    // Clear existing options except the first one
    citySelect.innerHTML = '<option value="">Select City</option>';
    
    // Add city options
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = getCityDisplayName(city);
        citySelect.appendChild(option);
    });
}

// Get display name for city codes
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

// Load CM data
function loadCMData() {
    // Load from localStorage if available
    const savedCMData = localStorage.getItem('cmData');
    if (savedCMData) {
        cmData = JSON.parse(savedCMData);
    } else {
        // Default CM data
        cmData = {
            'BLR': [
                'Dinesh',
                'Somashekar',
                'Prajwal S Patil',
                'Prashanth S',
                'Chetan GV',
                'RMP_Bhabhik'
            ],
            'Del': [
                'Akram',
                'Salman Ahmed',
                'Harshit'
            ],
            'HYD': [
                'Shaik Jakir Umar',
                'Mohd Abdul Hakeem',
                'Madhukar Kommu'
            ],
            'MUM': [
                'Mumbai CM 1',
                'Mumbai CM 2',
                'Mumbai CM 3'
            ],
            'CHN': [
                'Chennai CM 1',
                'Chennai CM 2',
                'Chennai CM 3'
            ]
        };
    }
    
    console.log('CM data loaded for all cities');
}

// Populate CM dropdown based on selected city
function populateCMDropdown(selectedCity) {
    const cmSelect = document.getElementById('cmName');
    
    // Clear existing options
    cmSelect.innerHTML = '<option value="">Select CM</option>';
    
    if (!selectedCity) {
        cmSelect.innerHTML = '<option value="">Select City First</option>';
        return;
    }
    
    // Get CM data for selected city
    const cityCMs = cmData[selectedCity] || [];
    
    if (cityCMs.length === 0) {
        cmSelect.innerHTML = '<option value="">No CM found for this city</option>';
        return;
    }
    
    // Add CM options
    cityCMs.forEach(cmName => {
        const option = document.createElement('option');
        option.value = cmName;
        option.textContent = cmName;
        cmSelect.appendChild(option);
    });
    
    // Show notification
    showNotification(`Found ${cityCMs.length} CM(s) for ${getCityDisplayName(selectedCity)}`, 'success');
}

// Populate bike registration numbers based on selected city
function populateBikeRegNumbers(selectedCity) {
    const bikeRegSelect = document.getElementById('bikeRegNumber');
    const bikeBrandModelInput = document.getElementById('bikeBrandModel');
    const chassisNumberInput = document.getElementById('chassisNumber');
    
    // Clear existing options
    bikeRegSelect.innerHTML = '<option value="">Select Bike Registration Number</option>';
    
    // Reset bike brand/model and chassis number fields
    bikeBrandModelInput.value = '';
    chassisNumberInput.value = '';
    
    if (!selectedCity) {
        bikeRegSelect.innerHTML = '<option value="">Select City First</option>';
        return;
    }
    
    // Check if bikeDataArray is available
    if (typeof bikeDataArray !== 'undefined' && bikeDataArray.length > 0) {
        // Filter bikes by selected city
        const cityBikes = bikeDataArray.filter(bike => bike.city === selectedCity);
        
        if (cityBikes.length === 0) {
            bikeRegSelect.innerHTML = '<option value="">No bikes found for this city</option>';
            return;
        }
        
        // Sort bikes by registration number for better UX
        cityBikes.sort((a, b) => a.regNo.localeCompare(b.regNo));
        
        // Add bike options - show only registration number
        cityBikes.forEach(bike => {
            const option = document.createElement('option');
            option.value = bike.regNo;
            option.textContent = bike.regNo; // Only show registration number
            option.setAttribute('data-chassis', bike.chassisNo);
            option.setAttribute('data-model', bike.vehicleModel);
            bikeRegSelect.appendChild(option);
        });
        
        // Show success notification
        showNotification(`Found ${cityBikes.length} bikes in ${getCityDisplayName(selectedCity)}`, 'success');
        
    } else {
        // Fallback: Add sample bikes for demonstration
        const sampleBikes = getSampleBikesForCity(selectedCity);
        
        sampleBikes.forEach(bike => {
            const option = document.createElement('option');
            option.value = bike.regNo;
            option.textContent = bike.regNo; // Only show registration number
            option.setAttribute('data-chassis', bike.chassisNo);
            option.setAttribute('data-model', bike.vehicleModel);
            bikeRegSelect.appendChild(option);
        });
        
        showNotification(`Loaded ${sampleBikes.length} sample bikes for ${getCityDisplayName(selectedCity)}`, 'info');
    }
}

// Auto-fill bike details when registration number is selected
function autoFillBikeDetails(selectedRegNo) {
    const bikeBrandModelInput = document.getElementById('bikeBrandModel');
    const chassisNumberInput = document.getElementById('chassisNumber');
    
    if (!selectedRegNo) {
        bikeBrandModelInput.value = '';
        chassisNumberInput.value = '';
        // Remove auto-filled class
        bikeBrandModelInput.classList.remove('auto-filled');
        chassisNumberInput.classList.remove('auto-filled');
        return;
    }
    
    // Find the selected option
    const bikeRegSelect = document.getElementById('bikeRegNumber');
    const selectedOption = bikeRegSelect.querySelector(`option[value="${selectedRegNo}"]`);
    
    if (selectedOption) {
        const model = selectedOption.getAttribute('data-model');
        const chassisNo = selectedOption.getAttribute('data-chassis');
        
        // Auto-fill bike brand/model
        bikeBrandModelInput.value = model;
        bikeBrandModelInput.classList.add('auto-filled');
        
        // Auto-fill chassis number
        chassisNumberInput.value = chassisNo;
        chassisNumberInput.classList.add('auto-filled');
        
        // Show notification with bike details
        showNotification(`Selected: ${selectedRegNo} (${model})`, 'success');
    }
}

// Get sample bikes for demonstration when bike data is not available
function getSampleBikesForCity(city) {
    const sampleBikes = {
        'BLR': [
            { regNo: 'KA01AQ6937', vehicleModel: 'Quantum', chassisNo: 'MD9HAPXF4GR710037' },
            { regNo: 'KA01AQ7030', vehicleModel: 'Quantum', chassisNo: 'MD9HAPXF4GR710059' },
            { regNo: 'KA01AQ6934', vehicleModel: 'Quantum', chassisNo: 'MD9HAPXF4GR710078' },
            { regNo: 'KA01AQ7027', vehicleModel: 'Quantum', chassisNo: 'MD9HAPXF4GR710089' },
            { regNo: 'KA01AQ6898', vehicleModel: 'Quantum', chassisNo: 'MD9HAPXF4GR710099' }
        ],
        'Del': [
            { regNo: 'UP16EQ6083', vehicleModel: 'Bounce', chassisNo: 'P6EBE1FCK24000002' },
            { regNo: 'DL01AB1234', vehicleModel: 'Hero Splendor', chassisNo: 'MD9HAPXF4GR710001' },
            { regNo: 'DL01CD5678', vehicleModel: 'Honda Activa', chassisNo: 'MD9HAPXF4GR710002' },
            { regNo: 'DL01EF9012', vehicleModel: 'TVS Jupiter', chassisNo: 'MD9HAPXF4GR710003' },
            { regNo: 'DL01GH3456', vehicleModel: 'Bajaj Pulsar', chassisNo: 'MD9HAPXF4GR710004' }
        ],
        'HYD': [
            { regNo: 'TG13T1824', vehicleModel: 'Quantum', chassisNo: 'MD9HAPXF4FR710102' },
            { regNo: 'TS01AB1234', vehicleModel: 'Hero Splendor', chassisNo: 'MD9HAPXF4GR710005' },
            { regNo: 'TS01CD5678', vehicleModel: 'Honda Activa', chassisNo: 'MD9HAPXF4GR710006' },
            { regNo: 'TS01EF9012', vehicleModel: 'TVS Jupiter', chassisNo: 'MD9HAPXF4GR710007' },
            { regNo: 'TS01GH3456', vehicleModel: 'Bajaj Pulsar', chassisNo: 'MD9HAPXF4GR710008' }
        ],
        'MUM': [
            { regNo: 'MH01AB1234', vehicleModel: 'Hero Splendor', chassisNo: 'MD9HAPXF4GR710009' },
            { regNo: 'MH01CD5678', vehicleModel: 'Honda Activa', chassisNo: 'MD9HAPXF4GR710010' },
            { regNo: 'MH01EF9012', vehicleModel: 'TVS Jupiter', chassisNo: 'MD9HAPXF4GR710011' },
            { regNo: 'MH01GH3456', vehicleModel: 'Bajaj Pulsar', chassisNo: 'MD9HAPXF4GR710012' },
            { regNo: 'MH01IJ7890', vehicleModel: 'Yamaha FZ', chassisNo: 'MD9HAPXF4GR710013' }
        ],
        'CHN': [
            { regNo: 'TN01AB1234', vehicleModel: 'Hero Splendor', chassisNo: 'MD9HAPXF4GR710014' },
            { regNo: 'TN01CD5678', vehicleModel: 'Honda Activa', chassisNo: 'MD9HAPXF4GR710015' },
            { regNo: 'TN01EF9012', vehicleModel: 'TVS Jupiter', chassisNo: 'MD9HAPXF4GR710016' },
            { regNo: 'TN01GH3456', vehicleModel: 'Bajaj Pulsar', chassisNo: 'MD9HAPXF4GR710017' },
            { regNo: 'TN01IJ7890', vehicleModel: 'Yamaha FZ', chassisNo: 'MD9HAPXF4GR710018' }
        ]
    };
    
    return sampleBikes[city] || [];
}

// Calculate ageing days between arrival and expected completion
function calculateAgeingDays() {
    const arrivalDateTime = document.getElementById('arrivalDateTime').value;
    const expectedCompletion = document.getElementById('expectedCompletion').value;
    const ageingNumber = document.getElementById('ageingNumber');
    const ageingDisplay = document.getElementById('ageingDisplay');
    
    if (!arrivalDateTime || !expectedCompletion) {
        ageingNumber.textContent = '-';
        ageingDisplay.className = 'ageing-display';
        return;
    }
    
    // Parse dates
    const arrivalDate = new Date(arrivalDateTime);
    const completionDate = new Date(expectedCompletion);
    
    // Calculate difference in days
    const timeDifference = completionDate.getTime() - arrivalDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    
    // Update display - always show positive number for expected duration
    ageingNumber.textContent = Math.abs(daysDifference);
    
    // Update styling based on ageing
    ageingDisplay.className = 'ageing-display';
    
    if (daysDifference <= 3) {
        // Short duration - yellow
        ageingDisplay.classList.add('due-soon');
        ageingDisplay.querySelector('.ageing-label').textContent = 'days';
    } else if (daysDifference <= 7) {
        // Normal - blue
        ageingDisplay.classList.add('normal');
        ageingDisplay.querySelector('.ageing-label').textContent = 'days';
    } else {
        // Long duration - green
        ageingDisplay.classList.add('long-duration');
        ageingDisplay.querySelector('.ageing-label').textContent = 'days';
    }
    
    // Calculate overdue days
    calculateOverdueDays();
}

// Calculate overdue days between expected completion and current date
function calculateOverdueDays() {
    const expectedCompletion = document.getElementById('expectedCompletion').value;
    const overdueTile = document.getElementById('overdueTile');
    const overdueNumber = document.getElementById('overdueNumber');
    const overdueDisplay = document.getElementById('overdueDisplay');
    
    if (!expectedCompletion) {
        overdueTile.style.display = 'none';
        return;
    }
    
    // Check if any parts are not completed
    const partsRows = document.querySelectorAll('#partsTableBody tr');
    let hasIncompleteParts = false;
    
    partsRows.forEach(row => {
        const statusSelect = row.querySelector('select[name="partStatus[]"]');
        if (statusSelect && statusSelect.value !== 'Completed') {
            hasIncompleteParts = true;
        }
    });
    
    // Only show overdue tile if there are incomplete parts
    if (!hasIncompleteParts) {
        overdueTile.style.display = 'none';
        return;
    }
    
    const completionDate = new Date(expectedCompletion);
    const currentDate = new Date();
    
    // Calculate difference in days
    const timeDifference = currentDate.getTime() - completionDate.getTime();
    const daysOverdue = Math.ceil(timeDifference / (1000 * 3600 * 24));
    
    if (daysOverdue > 0) {
        // Show overdue tile
        overdueTile.style.display = 'block';
        overdueNumber.textContent = daysOverdue;
        overdueDisplay.className = 'ageing-display overdue';
        overdueDisplay.querySelector('.ageing-label').textContent = 'days overdue';
    } else {
        // Hide overdue tile if not overdue
        overdueTile.style.display = 'none';
    }
}

// Validate contact number
function validateContactNumber() {
    const contactInput = document.getElementById('contactNumber');
    const contactNumber = contactInput.value.trim();
    
    // Remove any non-digit characters
    const digitsOnly = contactNumber.replace(/\D/g, '');
    
    // Check if it has exactly 10 digits
    if (digitsOnly.length !== 10) {
        // Show error
        contactInput.style.borderColor = '#dc3545';
        
        // Remove existing error message
        const existingError = contactInput.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> Contact number must be exactly 10 digits`;
        errorMessage.style.cssText = `
            color: #dc3545;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        `;
        
        contactInput.parentElement.appendChild(errorMessage);
        return false;
    } else {
        // Valid contact number
        contactInput.style.borderColor = '#28a745';
        
        // Remove existing error message
        const existingError = contactInput.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `<i class="fas fa-check-circle"></i> Valid contact number`;
        successMessage.style.cssText = `
            color: #28a745;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        `;
        
        contactInput.parentElement.appendChild(successMessage);
        return true;
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        max-width: 350px;
        animation: slideInRight 0.3s ease;
        border-left: 4px solid ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Cost calculation
    laborCostInput.addEventListener('input', calculateTotalCost);
    partsCostInput.addEventListener('input', calculateTotalCost);
    
    // File upload
    photoUploadInput.addEventListener('change', handleFileUpload);
    
    // Form submission
    maintenanceForm.addEventListener('submit', handleFormSubmit);
    
    // Priority level change
    document.getElementById('priorityLevel').addEventListener('change', function() {
        updatePriorityIndicator(this.value);
    });
    
    // City selection change - populate bike registration numbers and CM dropdown
    document.getElementById('city').addEventListener('change', function() {
        populateBikeRegNumbers(this.value);
        populateCMDropdown(this.value);
    });
    
    // Bike registration number change - auto-fill bike details
    document.getElementById('bikeRegNumber').addEventListener('change', function() {
        autoFillBikeDetails(this.value);
    });
    
    // Date change events for ageing calculation
    document.getElementById('arrivalDateTime').addEventListener('change', calculateAgeingDays);
    document.getElementById('expectedCompletion').addEventListener('change', calculateAgeingDays);
    
    // Listen for parts status changes
    document.addEventListener('change', function(e) {
        if (e.target.name === 'partStatus[]') {
            calculateOverdueDays();
        }
    });
    
    // Contact number validation
    document.getElementById('contactNumber').addEventListener('blur', validateContactNumber);
    document.getElementById('contactNumber').addEventListener('input', function() {
        // Remove error styling on input
        this.style.borderColor = '#e2e8f0';
        const errorMessage = this.parentElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });
    
    // Setup logout buttons
    setupLogoutButtons();
}



// Setup logout buttons
function setupLogoutButtons() {
    // Find all logout buttons by different selectors
    const logoutButtons = document.querySelectorAll('[onclick*="logout"], .logout-btn, #logout-btn, [data-action="logout"]');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            logout();
        });
    });
    
    // Also check for buttons with text content containing "logout"
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        if (button.textContent.toLowerCase().includes('logout')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                logout();
            });
        }
    });
}

// Calculate total cost
function calculateTotalCost() {
    const laborCost = parseFloat(laborCostInput.value) || 0;
    const partsCost = parseFloat(partsCostInput.value) || 0;
    const totalCost = laborCost + partsCost;
    
    totalCostInput.value = totalCost.toFixed(2);
}

// Add part row to the table
function addPartRow() {
    const tbody = document.getElementById('partsTableBody');
    const row = document.createElement('tr');
    row.id = `part-row-${partRowCounter}`;
    
    row.innerHTML = `
        <td>
            <select name="partName[]" required>
                <option value="">Select Part</option>
                <option value="Chain">Chain</option>
                <option value="Brakes">Brakes</option>
                <option value="Tyres">Tyres</option>
                <option value="Gears">Gears</option>
                <option value="Battery">Battery</option>
                <option value="Engine">Engine</option>
                <option value="Suspension">Suspension</option>
                <option value="Electrical">Electrical</option>
                <option value="Other">Other</option>
            </select>
        </td>
        <td>
            <input type="text" name="damageDescription[]" placeholder="Describe the damage..." required>
        </td>
        <td>
            <select name="repairAction[]" required>
                <option value="">Select Action</option>
                <option value="Replace">Replace</option>
                <option value="Repair">Repair</option>
                <option value="Clean">Clean</option>
                <option value="Adjust">Adjust</option>
                <option value="Service">Service</option>
            </select>
        </td>
        <td>
            <select name="partStatus[]" required>
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
            </select>
        </td>
        <td>
            <button type="button" class="btn btn-danger" onclick="removePartRow(${partRowCounter})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
    
    // Add event listener for status change in new row
    const statusSelect = row.querySelector('select[name="partStatus[]"]');
    statusSelect.addEventListener('change', calculateOverdueDays);
    
    partRowCounter++;
}

// Remove part row from the table
function removePartRow(rowId) {
    const row = document.getElementById(`part-row-${rowId}`);
    if (row) {
        row.remove();
    }
    
    // Ensure at least one row remains
    const tbody = document.getElementById('partsTableBody');
    if (tbody.children.length === 0) {
        addPartRow();
    }
}

// Handle file upload
function handleFileUpload(event) {
    const files = event.target.files;
    uploadedFiles = Array.from(files);
    
    displayFilePreview();
}

// Display file preview
function displayFilePreview() {
    filePreviewDiv.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                img.title = file.name;
                
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.display = 'inline-block';
                
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '×';
                removeBtn.className = 'btn btn-danger';
                removeBtn.style.position = 'absolute';
                removeBtn.style.top = '-5px';
                removeBtn.style.right = '-5px';
                removeBtn.style.width = '20px';
                removeBtn.style.height = '20px';
                removeBtn.style.borderRadius = '50%';
                removeBtn.style.fontSize = '12px';
                removeBtn.style.padding = '0';
                removeBtn.onclick = () => removeFile(index);
                
                container.appendChild(img);
                container.appendChild(removeBtn);
                filePreviewDiv.appendChild(container);
            };
            reader.readAsDataURL(file);
        } else {
            const fileInfo = document.createElement('div');
            fileInfo.innerHTML = `
                <div style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px; margin: 5px;">
                    <i class="fas fa-file"></i> ${file.name}
                    <button class="btn btn-danger" onclick="removeFile(${index})" style="margin-left: 10px; padding: 2px 8px; font-size: 12px;">×</button>
                </div>
            `;
            filePreviewDiv.appendChild(fileInfo);
        }
    });
}

// Remove file from preview
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    displayFilePreview();
    
    // Update file input
    const dt = new DataTransfer();
    uploadedFiles.forEach(file => dt.items.add(file));
    photoUploadInput.files = dt.files;
}

// Update priority indicator
function updatePriorityIndicator(priority) {
    const priorityInput = document.getElementById('priorityLevel');
    const parent = priorityInput.parentElement;
    
    // Remove existing priority classes
    parent.classList.remove('priority-high', 'priority-medium', 'priority-low');
    
    // Add new priority class
    if (priority) {
        parent.classList.add(`priority-${priority.toLowerCase()}`);
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Collect form data
        const formData = collectFormData();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Add the maintenance record to UM Vehicles data
        addMaintenanceRecordToUMVehicles(formData);
        
        // Show success message
        showModal('Success', 'Bike maintenance form submitted successfully! The record has been added to UM Vehicles.', 'success');
        
        // Reset form
        resetForm();
        
    } catch (error) {
        showModal('Error', 'Failed to submit form. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Validate form
function validateForm() {
    const requiredFields = maintenanceForm.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#e53e3e';
            isValid = false;
        } else {
            field.style.borderColor = '#e2e8f0';
        }
    });
    
    // Validate contact number
    if (!validateContactNumber()) {
        showModal('Error', 'Please enter a valid 10-digit contact number.', 'error');
        return false;
    }
    
    // Validate parts table
    const partsRows = document.querySelectorAll('#partsTableBody tr');
    if (partsRows.length === 0) {
        showModal('Error', 'Please add at least one part to the repairs table.', 'error');
        return false;
    }
    
    // Validate expected completion date
    const arrivalDate = new Date(document.getElementById('arrivalDateTime').value);
    const completionDate = new Date(document.getElementById('expectedCompletion').value);
    
    if (completionDate <= arrivalDate) {
        showModal('Error', 'Expected completion date must be after arrival date.', 'error');
        return false;
    }
    
    return isValid;
}

// Collect form data
function collectFormData() {
    const formData = new FormData(maintenanceForm);
    
    // Add parts data
    const parts = [];
    const partRows = document.querySelectorAll('#partsTableBody tr');
    
    partRows.forEach(row => {
        const partName = row.querySelector('select[name="partName[]"]').value;
        const damageDescription = row.querySelector('input[name="damageDescription[]"]').value;
        const repairAction = row.querySelector('select[name="repairAction[]"]').value;
        const status = row.querySelector('select[name="partStatus[]"]').value;
        
        if (partName && damageDescription && repairAction && status) {
            parts.push({
                partName,
                damageDescription,
                repairAction,
                status
            });
        }
    });
    
    formData.append('parts', JSON.stringify(parts));
    formData.append('uploadedFiles', JSON.stringify(uploadedFiles.map(f => f.name)));
    
    return formData;
}

// Add maintenance record to UM Vehicles data
function addMaintenanceRecordToUMVehicles(formData) {
    // Extract data from form
    const serviceId = formData.get('serviceId');
    const arrivalDateTime = formData.get('arrivalDateTime');
    const expectedCompletion = formData.get('expectedCompletion');
    const priorityLevel = formData.get('priorityLevel');
    const city = formData.get('city');
    const bikeRegNumber = formData.get('bikeRegNumber');
    const bikeBrandModel = formData.get('bikeBrandModel');
    const bikeType = formData.get('bikeType');
    const chassisNumber = formData.get('chassisNumber');
    const riderName = formData.get('riderName');
    const contactNumber = formData.get('contactNumber');
    const requestId = formData.get('requestId');
    const cmName = formData.get('cmName');
    const tlName = formData.get('tlName');
    const riderAddress = formData.get('riderAddress');
    const laborCost = formData.get('laborCost');
    const partsCost = formData.get('partsCost');
    const totalCost = formData.get('totalCost');
    const paymentStatus = formData.get('paymentStatus');
    const mechanicComments = formData.get('mechanicComments');
    const parts = JSON.parse(formData.get('parts') || '[]');
    
    // Create UM vehicle record
    const umVehicleRecord = {
        id: `UM-${serviceId}`,
        type: 'Bike Maintenance',
        capacity: bikeBrandModel,
        status: getOverallStatus(parts),
        location: getCityDisplayName(city),
        lastUpdated: new Date().toISOString().split('T')[0],
        // Additional maintenance details
        maintenanceDetails: {
            serviceId: serviceId,
            arrivalDateTime: arrivalDateTime,
            expectedCompletion: expectedCompletion,
            priorityLevel: priorityLevel,
            bikeRegNumber: bikeRegNumber,
            bikeType: bikeType,
            chassisNumber: chassisNumber,
            riderName: riderName,
            contactNumber: contactNumber,
            requestId: requestId,
            cmName: cmName,
            tlName: tlName,
            riderAddress: riderAddress,
            laborCost: laborCost,
            partsCost: partsCost,
            totalCost: totalCost,
            paymentStatus: paymentStatus,
            mechanicComments: mechanicComments,
            parts: parts,
            submittedDate: new Date().toISOString()
        }
    };
    
    // Load existing data from localStorage to ensure we have the latest
    const savedData = localStorage.getItem('umVehiclesData');
    if (savedData) {
        umVehiclesData = JSON.parse(savedData);
    } else {
        umVehiclesData = [];
    }
    
    // Add new record to the beginning of the array
    umVehiclesData.unshift(umVehicleRecord);
    
    // Save updated data to localStorage
    localStorage.setItem('umVehiclesData', JSON.stringify(umVehiclesData));
    
    // Refresh the display if UM Vehicles modal is open
    const modal = document.getElementById('um-vehicles-modal');
    if (modal && modal.classList.contains('show')) {
        loadUMVehiclesData();
    }
}

// Get overall status based on parts status
function getOverallStatus(parts) {
    if (parts.length === 0) return 'Pending';
    
    const statuses = parts.map(part => part.status);
    
    if (statuses.every(status => status === 'Completed')) {
        return 'Completed';
    } else if (statuses.some(status => status === 'In Progress')) {
        return 'In Progress';
    } else {
        return 'Pending';
    }
}

// Save draft
function saveDraft() {
    const formData = collectFormData();
    const draftData = {
        timestamp: new Date().toISOString(),
        formData: Object.fromEntries(formData),
        parts: JSON.parse(formData.get('parts') || '[]')
    };
    
    // Save to localStorage
    const drafts = JSON.parse(localStorage.getItem('maintenanceDrafts') || '[]');
    drafts.push(draftData);
    localStorage.setItem('maintenanceDrafts', JSON.stringify(drafts));
    
    showModal('Draft Saved', 'Form draft has been saved successfully!', 'success');
}

// Cancel form
function cancelForm() {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
        resetForm();
        window.location.href = 'dashboard.html';
    }
}

// Reset form
function resetForm() {
    maintenanceForm.reset();
    generateServiceId();
    setDefaultDateTime();
    
    // Repopulate city dropdown
    populateCityDropdown();
    
    // Reset bike registration dropdown
    const bikeRegSelect = document.getElementById('bikeRegNumber');
    bikeRegSelect.innerHTML = '<option value="">Select City First</option>';
    
    // Reset bike brand/model and chassis number fields
    const bikeBrandModelInput = document.getElementById('bikeBrandModel');
    const chassisNumberInput = document.getElementById('chassisNumber');
    bikeBrandModelInput.value = '';
    chassisNumberInput.value = '';
    bikeBrandModelInput.classList.remove('auto-filled');
    chassisNumberInput.classList.remove('auto-filled');
    
    // Reset CM dropdown
    const cmSelect = document.getElementById('cmName');
    cmSelect.innerHTML = '<option value="">Select City First</option>';
    
    // Reset TL field
    document.getElementById('tlName').value = '';
    
    // Reset contact number validation
    const contactInput = document.getElementById('contactNumber');
    contactInput.style.borderColor = '#e2e8f0';
    const contactError = contactInput.parentElement.querySelector('.error-message');
    const contactSuccess = contactInput.parentElement.querySelector('.success-message');
    if (contactError) contactError.remove();
    if (contactSuccess) contactSuccess.remove();
    
    // Reset ageing display
    const ageingDisplay = document.getElementById('ageingDisplay');
    const ageingNumber = document.getElementById('ageingNumber');
    ageingNumber.textContent = '-';
    ageingDisplay.className = 'ageing-display';
    ageingDisplay.querySelector('.ageing-label').textContent = 'days';
    
    // Reset overdue tile
    const overdueTile = document.getElementById('overdueTile');
    const overdueNumber = document.getElementById('overdueNumber');
    overdueTile.style.display = 'none';
    overdueNumber.textContent = '-';
    
    // Clear parts table
    document.getElementById('partsTableBody').innerHTML = '';
    addPartRow();
    
    // Clear file preview
    filePreviewDiv.innerHTML = '';
    uploadedFiles = [];
    
    // Reset priority indicator
    updatePriorityIndicator('');
}

// Show modal
function showModal(title, message, type = 'info') {
    const modal = document.getElementById('messageModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Add type-specific styling
    modal.className = `modal show ${type}`;
    
    // Auto-close after 3 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            closeModal();
        }, 3000);
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('messageModal');
    modal.classList.remove('show');
}

// Update user info
function updateUserInfo() {
    if (userManager && userManager.currentUser) {
        const userInfo = document.querySelector('.user-name');
        if (userInfo) {
            userInfo.innerHTML = `Welcome, ${userManager.currentUser.name} <span class="user-role ${userManager.currentUser.role}">${userManager.currentUser.role}</span>`;
        }
    }
}

// Logout function
function logout() {
    // Clear all session data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('userEmail');
    
    // Clear any maintenance form drafts
    localStorage.removeItem('maintenanceDrafts');
    
    // Clear any UM vehicles data (optional - you can keep this if you want data to persist)
    // localStorage.removeItem('umVehiclesData');
    
    // Clear any idle timeout timers
    if (window.loginIdleTimeout) {
        clearTimeout(window.loginIdleTimeout);
    }
    if (window.loginIdleWarningTimeout) {
        clearTimeout(window.loginIdleWarningTimeout);
    }
    if (window.loginCountdownInterval) {
        clearInterval(window.loginCountdownInterval);
    }
    
    // Show logout notification
    showNotification('Logout', 'You have been successfully logged out. Redirecting to login page...', 'success');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Force logout function (for debugging)
function forceLogout() {
    // Clear everything
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all timers
    if (window.loginIdleTimeout) clearTimeout(window.loginIdleTimeout);
    if (window.loginIdleWarningTimeout) clearTimeout(window.loginIdleWarningTimeout);
    if (window.loginCountdownInterval) clearInterval(window.loginCountdownInterval);
    
    // Show notification
    showNotification('Force Logout', 'All session data cleared. Redirecting to login page...', 'info');
    
    // Redirect immediately
    window.location.href = 'index.html';
}

// Open inventory function
function openInventory(type) {
    if (type === 'bikes') {
        window.location.href = 'dashboard.html';
    }
}

// Toggle UM dropdown
function toggleUMDropdown() {
    const dropdown = document.getElementById('um-dropdown');
    const allDropdowns = document.querySelectorAll('.dropdown-menu');
    
    // Close all other dropdowns
    allDropdowns.forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('show');
        }
    });
    
    // Toggle current dropdown
    dropdown.classList.toggle('show');
}

// Open UM Vehicles page
function openUMVehicles() {
    // Create and show UM Vehicles modal
    showUMVehiclesModal();
}

// Add UM Vehicle
function addUMVehicle() {
    showNotification('Add UM Vehicle', 'Add UM Vehicle functionality will be available soon!', 'info');
}

// Go back to Bike Maintenance Form
function goBackToBikeMaintenanceForm() {
    // Close the UM Vehicles modal
    closeUMVehiclesModal();
    
    // Show notification
    showNotification('Navigation', 'Returning to Bike Maintenance Form', 'info');
    
    // Smooth scroll to the maintenance form
    setTimeout(() => {
        const maintenanceForm = document.getElementById('maintenanceForm');
        if (maintenanceForm) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            maintenanceForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 500);
}

// UM Maintenance
function umMaintenance() {
    showNotification('UM Maintenance', 'UM Maintenance functionality will be available soon!', 'info');
}

// Show UM Vehicles modal
function showUMVehiclesModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('um-vehicles-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'um-vehicles-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content um-vehicles-content">
                <div class="modal-header">
                    <h2><i class="fas fa-truck"></i> View UM Vehicles</h2>
                    <button class="close-btn" id="um-close-btn" title="Return to Bike Maintenance Form (ESC)">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                </div>
                <div class="modal-body" style="height: calc(100vh - 80px); overflow-y: auto; padding: 1rem;">
                    <div class="um-controls">
                        <div class="controls-left">
                            <button class="btn btn-primary" onclick="goBackToBikeMaintenanceForm()">
                                <i class="fas fa-arrow-left"></i> Go Back to Bike Maintenance Form
                            </button>
                            <div class="export-dropdown">
                                <button class="btn btn-secondary dropdown-toggle" onclick="toggleExportDropdown()" title="Export options">
                                    <i class="fas fa-download"></i> Export
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                                <div class="export-dropdown-menu" id="export-dropdown-menu">
                                    <button onclick="exportUMData()" class="export-option">
                                        <i class="fas fa-file-csv"></i> Export All to CSV
                                    </button>
                                    <button onclick="exportFilteredData()" class="export-option">
                                        <i class="fas fa-filter"></i> Export Filtered Data
                                    </button>
                                    <button onclick="exportSummaryReport()" class="export-option">
                                        <i class="fas fa-chart-bar"></i> Export Summary Report
                                    </button>
                                </div>
                            </div>
                            <button class="btn btn-danger" onclick="clearAllUMVehiclesData()" title="Clear all data for testing">
                                <i class="fas fa-trash"></i> Clear All
                            </button>
                        </div>
                        <div class="controls-right">
                            <div class="search-box">
                                <input type="text" id="um-search" placeholder="Search vehicles...">
                                <i class="fas fa-search"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="um-filters">
                        <div class="filter-group">
                            <label for="um-type-filter">Vehicle Type:</label>
                            <select id="um-type-filter" onchange="applyUMFilters()">
                                <option value="">All Types</option>
                                <option value="Bike Maintenance">Bike Maintenance</option>
                                <option value="Mini Truck">Mini Truck</option>
                                <option value="Tempo">Tempo</option>
                                <option value="Pickup">Pickup</option>
                                <option value="Truck">Truck</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="um-status-filter">Status:</label>
                            <select id="um-status-filter" onchange="applyUMFilters()">
                                <option value="">All Status</option>
                                <option value="Available">Available</option>
                                <option value="In Use">In Use</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Out of Service">Out of Service</option>
                                <option value="Completed">Completed</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="um-location-filter">Location:</label>
                            <select id="um-location-filter" onchange="applyUMFilters()">
                                <option value="">All Locations</option>
                                <option value="Bangalore">Bangalore</option>
                                <option value="Delhi">Delhi</option>
                                <option value="Hyderabad">Hyderabad</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="Chennai">Chennai</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <button class="btn btn-outline" onclick="clearUMFilters()">
                                <i class="fas fa-times"></i> Clear Filters
                            </button>
                        </div>
                    </div>

                    <div class="um-summary">
                        <div class="summary-item">
                            <span class="summary-label">Total Records:</span>
                            <span class="summary-value" id="total-records">0</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Completed:</span>
                            <span class="summary-value completed" id="completed-count">0</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">In Progress:</span>
                            <span class="summary-value in-progress" id="in-progress-count">0</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Pending:</span>
                            <span class="summary-value pending" id="pending-count">0</span>
                        </div>
                    </div>
                    
                    <div class="um-table-container">
                        <table id="um-vehicles-table" class="um-table">
                            <thead>
                                <tr>
                                    <th onclick="sortUMTable(0)">Date & Time Received <i class="fas fa-sort"></i></th>
                                    <th onclick="sortUMTable(1)">Service ID <i class="fas fa-sort"></i></th>
                                    <th onclick="sortUMTable(2)">Expected Cor Priority Level <i class="fas fa-sort"></i></th>
                                    <th onclick="sortUMTable(3)">Expected Durat City <i class="fas fa-sort"></i></th>
                                    <th onclick="sortUMTable(4)">Bike Registra <i class="fas fa-sort"></i></th>
                                    <th onclick="sortUMTable(5)">Bike Brand/M <i class="fas fa-sort"></i></th>
                                    <th onclick="sortUMTable(6)">Bike Type <i class="fas fa-sort"></i></th>
                                    <th onclick="sortUMTable(7)">Chassis Num <i class="fas fa-sort"></i></th>
                                    <th onclick="sortUMTable(8)">Existing Issue Rider Name <i class="fas fa-sort"></i></th>
                                    <th onclick="sortUMTable(9)">Contact Num <i class="fas fa-sort"></i></th>
                                    <th onclick="sortUMTable(10)">Request ID <i class="fas fa-sort"></i></th>
                                    <th onclick="sortUMTable(11)">CM (City Mai TL (Team Lea <i class="fas fa-sort"></i></th>
                                    <th onclick="sortUMTable(12)">Part Name <i class="fas fa-sort"></i></th>
                                    <th onclick="sortUMTable(13)">Repair Action Status <i class="fas fa-sort"></i></th>
                                </tr>
                            </thead>
                            <tbody id="um-vehicles-tbody">
                                <!-- Data will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="um-pagination">
                        <button class="btn btn-outline" onclick="previousUMPage()" id="um-prev-btn">
                            <i class="fas fa-chevron-left"></i> Previous
                        </button>
                        <span id="um-page-info">Page 1 of 1</span>
                        <button class="btn btn-outline" onclick="nextUMPage()" id="um-next-btn">
                            Next <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.classList.add('show'); // Add show class when modal is created
    } else {
        modal.classList.add('show');
    }
    
    // Load UM vehicles data
    loadUMVehiclesData();
    
    // Show notification if there are maintenance records
    const savedData = localStorage.getItem('umVehiclesData');
    if (savedData) {
        const data = JSON.parse(savedData);
        const maintenanceRecords = data.filter(record => record.type === 'Bike Maintenance' && record.maintenanceDetails);
        if (maintenanceRecords.length > 0) {
            setTimeout(() => {
                showNotification(`Loaded ${maintenanceRecords.length} bike maintenance record(s)`, 'success');
            }, 500);
        }
    }
    
    // Add keyboard support for closing modal
    const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
            closeUMVehiclesModal();
        }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    
    // Store the event listener for cleanup
    modal.dataset.keyListener = handleKeyPress;
    
    // Add click outside to close functionality
    const handleOutsideClick = (e) => {
        if (e.target === modal) {
            closeUMVehiclesModal();
        }
    };
    
    modal.addEventListener('click', handleOutsideClick);
    
    // Store the click listener for cleanup
    modal.dataset.clickListener = handleOutsideClick;
    
    // Add close button event listener
    const closeBtn = document.getElementById('um-close-btn');
    if (closeBtn) {
        const handleCloseClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeUMVehiclesModal();
        };
        
        closeBtn.addEventListener('click', handleCloseClick);
        modal.dataset.closeBtnListener = handleCloseClick;
    }
    
    // Close dropdown
    document.getElementById('um-dropdown').classList.remove('show');
}

// Close UM Vehicles modal and return to Bike Maintenance form
function closeUMVehiclesModal() {
    const modal = document.getElementById('um-vehicles-modal');
    if (modal) {
        modal.classList.remove('show');
        
        // Clean up keyboard event listener
        const keyListener = modal.dataset.keyListener;
        if (keyListener) {
            document.removeEventListener('keydown', keyListener);
            delete modal.dataset.keyListener;
        }
        
        // Clean up click outside event listener
        const clickListener = modal.dataset.clickListener;
        if (clickListener) {
            modal.removeEventListener('click', clickListener);
            delete modal.dataset.clickListener;
        }
        
        // Clean up close button event listener
        const closeBtnListener = modal.dataset.closeBtnListener;
        if (closeBtnListener) {
            const closeBtn = document.getElementById('um-close-btn');
            if (closeBtn) {
                closeBtn.removeEventListener('click', closeBtnListener);
            }
            delete modal.dataset.closeBtnListener;
        }
        
        // Show notification
        showNotification('Returning to Bike Maintenance Form', 'info');
        
        // Redirect to Bike Maintenance form
        setTimeout(() => {
            // Scroll to the top of the page to show the bike maintenance form
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Focus on the bike maintenance form
            const maintenanceForm = document.getElementById('maintenanceForm');
            if (maintenanceForm) {
                maintenanceForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 500);
    }
}

// Load UM vehicles data
function loadUMVehiclesData() {
    // Load data from localStorage
    const savedData = localStorage.getItem('umVehiclesData');
    
    if (savedData) {
        umVehiclesData = JSON.parse(savedData);
    } else {
        // Initialize with empty array if no saved data exists
        umVehiclesData = [];
    }
    
    displayUMVehiclesData(umVehiclesData);
}

// Display UM vehicles data
function displayUMVehiclesData(data) {
    const tbody = document.getElementById('um-vehicles-tbody');
    tbody.innerHTML = '';
    
    // Filter to show only maintenance records
    const maintenanceRecords = data.filter(vehicle => vehicle.type === 'Bike Maintenance' && vehicle.maintenanceDetails);
    
    if (maintenanceRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="14" style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-info-circle"></i> No bike maintenance records found. Submit a bike maintenance form to see records here.
                </td>
            </tr>
        `;
        return;
    }
    
    // Calculate summary statistics
    let totalRecords = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let pendingCount = 0;
    
    maintenanceRecords.forEach(vehicle => {
        const details = vehicle.maintenanceDetails;
        
        // Create a row for each part, or one row if no parts
        const parts = details.parts && details.parts.length > 0 ? details.parts : [{ partName: 'N/A', damageDescription: 'N/A', repairAction: 'N/A', status: 'N/A' }];
        
        parts.forEach((part, partIndex) => {
            totalRecords++;
            
            // Count statuses
            if (part.status === 'Completed') {
                completedCount++;
            } else if (part.status === 'In Progress') {
                inProgressCount++;
            } else {
                pendingCount++;
            }
            const row = document.createElement('tr');
            
            // Add a subtle background for different maintenance records
            if (partIndex === 0) {
                row.style.borderTop = '2px solid #667eea';
            }
            
            row.innerHTML = `
                <td>${details.arrivalDateTime || 'N/A'}</td>
                <td>${details.serviceId || 'N/A'}</td>
                <td>
                    <span class="priority-badge priority-${details.priorityLevel?.toLowerCase() || 'medium'}">
                        ${details.priorityLevel || 'N/A'}
                    </span>
                </td>
                <td>
                    <div class="duration-city">
                        <div>${details.expectedCompletion || 'N/A'}</div>
                        <div class="sub-text">${vehicle.location || 'N/A'}</div>
                    </div>
                </td>
                <td>${details.bikeRegNumber || 'N/A'}</td>
                <td>${details.capacity || 'N/A'}</td>
                <td>${details.bikeType || 'N/A'}</td>
                <td>${details.chassisNumber || 'N/A'}</td>
                <td>${part.damageDescription || 'N/A'}</td>
                <td>${details.contactNumber || 'N/A'}</td>
                <td>${details.requestId || 'N/A'}</td>
                <td>
                    <div class="cm-tl">
                        <div>${details.cmName || 'N/A'}</div>
                        <div class="sub-text">${details.tlName || 'N/A'}</div>
                    </div>
                </td>
                <td>${part.partName || 'N/A'}</td>
                <td>
                    <div class="repair-status">
                        <div>${part.repairAction || 'N/A'}</div>
                        <span class="status-badge status-${part.status?.toLowerCase().replace(' ', '-') || 'pending'}">
                            ${part.status || 'N/A'}
                        </span>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    });
    
    // Update summary statistics
    document.getElementById('total-records').textContent = totalRecords;
    document.getElementById('completed-count').textContent = completedCount;
    document.getElementById('in-progress-count').textContent = inProgressCount;
    document.getElementById('pending-count').textContent = pendingCount;
}

// Apply UM filters
function applyUMFilters() {
    // Implementation for filtering UM vehicles
    showNotification('Filters Applied', 'UM vehicle filters have been applied.', 'success');
}

// Clear UM filters
function clearUMFilters() {
    document.getElementById('um-type-filter').value = '';
    document.getElementById('um-status-filter').value = '';
    document.getElementById('um-location-filter').value = '';
    document.getElementById('um-search').value = '';
    showNotification('Filters Cleared', 'All UM vehicle filters have been cleared.', 'info');
}

// Sort UM table
function sortUMTable(columnIndex) {
    showNotification('Sort Applied', 'UM vehicles table has been sorted.', 'success');
}

// UM pagination functions
function previousUMPage() {
    showNotification('Previous Page', 'Navigated to previous page.', 'info');
}

function nextUMPage() {
    showNotification('Next Page', 'Navigated to next page.', 'info');
}

// Export UM data to CSV
function exportUMData() {
    const savedData = localStorage.getItem('umVehiclesData');
    
    if (!savedData) {
        showNotification('Export', 'No data available to export!', 'error');
        return;
    }
    
    const data = JSON.parse(savedData);
    const maintenanceRecords = data.filter(vehicle => vehicle.type === 'Bike Maintenance' && vehicle.maintenanceDetails);
    
    if (maintenanceRecords.length === 0) {
        showNotification('Export', 'No bike maintenance records available to export!', 'error');
        return;
    }
    
    try {
        // Create CSV content
        const csvContent = generateCSVContent(maintenanceRecords);
        
        // Create filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `bike_maintenance_records_${timestamp}.csv`;
        
        // Create and download file
        downloadCSV(csvContent, filename);
        
        showNotification('Export', `Successfully exported ${maintenanceRecords.length} maintenance record(s) to CSV!`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Export', 'Failed to export data. Please try again.', 'error');
    }
}

// Generate CSV content from maintenance records
function generateCSVContent(maintenanceRecords) {
    // CSV headers
    const headers = [
        'Date & Time Received',
        'Service ID',
        'Expected Cor Priority Level',
        'Expected Durat City',
        'Bike Registra',
        'Bike Brand/M',
        'Bike Type',
        'Chassis Num',
        'Existing Issue Rider Name',
        'Contact Num',
        'Request ID',
        'CM (City Mai TL (Team Lea',
        'Part Name',
        'Repair Action Status',
        'Labor Cost',
        'Parts Cost',
        'Total Cost',
        'Payment Status',
        'Mechanic Comments',
        'Submitted Date'
    ];
    
    // Start with headers
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    maintenanceRecords.forEach(vehicle => {
        const details = vehicle.maintenanceDetails;
        
        // Create a row for each part, or one row if no parts
        const parts = details.parts && details.parts.length > 0 ? details.parts : [{ partName: 'N/A', damageDescription: 'N/A', repairAction: 'N/A', status: 'N/A' }];
        
        parts.forEach(part => {
            const row = [
                escapeCSVValue(details.arrivalDateTime || 'N/A'),
                escapeCSVValue(details.serviceId || 'N/A'),
                escapeCSVValue(details.priorityLevel || 'N/A'),
                escapeCSVValue(`${details.expectedCompletion || 'N/A'} - ${vehicle.location || 'N/A'}`),
                escapeCSVValue(details.bikeRegNumber || 'N/A'),
                escapeCSVValue(details.capacity || 'N/A'),
                escapeCSVValue(details.bikeType || 'N/A'),
                escapeCSVValue(details.chassisNumber || 'N/A'),
                escapeCSVValue(part.damageDescription || 'N/A'),
                escapeCSVValue(details.contactNumber || 'N/A'),
                escapeCSVValue(details.requestId || 'N/A'),
                escapeCSVValue(`${details.cmName || 'N/A'} - ${details.tlName || 'N/A'}`),
                escapeCSVValue(part.partName || 'N/A'),
                escapeCSVValue(`${part.repairAction || 'N/A'} - ${part.status || 'N/A'}`),
                escapeCSVValue(details.laborCost || 'N/A'),
                escapeCSVValue(details.partsCost || 'N/A'),
                escapeCSVValue(details.totalCost || 'N/A'),
                escapeCSVValue(details.paymentStatus || 'N/A'),
                escapeCSVValue(details.mechanicComments || 'N/A'),
                escapeCSVValue(details.submittedDate || 'N/A')
            ];
            
            csvContent += row.join(',') + '\n';
        });
    });
    
    return csvContent;
}

// Escape CSV values to handle commas, quotes, and newlines
function escapeCSVValue(value) {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    
    const stringValue = String(value);
    
    // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    
    return stringValue;
}

// Download CSV file
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    
    // Create object URL
    const url = URL.createObjectURL(blob);
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Add to document and trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Export filtered data (for future use with filters)
function exportFilteredData() {
    // This function can be enhanced to export only filtered/visible data
    // For now, it exports all data
    exportUMData();
}

// Export summary report
function exportSummaryReport() {
    const savedData = localStorage.getItem('umVehiclesData');
    
    if (!savedData) {
        showNotification('Export', 'No data available to export!', 'error');
        return;
    }
    
    const data = JSON.parse(savedData);
    const maintenanceRecords = data.filter(vehicle => vehicle.type === 'Bike Maintenance' && vehicle.maintenanceDetails);
    
    if (maintenanceRecords.length === 0) {
        showNotification('Export', 'No bike maintenance records available to export!', 'error');
        return;
    }
    
    try {
        // Calculate summary statistics
        let totalRecords = 0;
        let completedCount = 0;
        let inProgressCount = 0;
        let pendingCount = 0;
        let totalCost = 0;
        let paidCount = 0;
        let unpaidCount = 0;
        
        maintenanceRecords.forEach(vehicle => {
            const details = vehicle.maintenanceDetails;
            const parts = details.parts && details.parts.length > 0 ? details.parts : [];
            
            parts.forEach(part => {
                totalRecords++;
                if (part.status === 'Completed') completedCount++;
                else if (part.status === 'In Progress') inProgressCount++;
                else pendingCount++;
            });
            
            totalCost += parseFloat(details.totalCost || 0);
            if (details.paymentStatus === 'Paid') paidCount++;
            else unpaidCount++;
        });
        
        // Create summary report
        const summaryContent = generateSummaryReport(maintenanceRecords, {
            totalRecords,
            completedCount,
            inProgressCount,
            pendingCount,
            totalCost,
            paidCount,
            unpaidCount
        });
        
        // Create filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `bike_maintenance_summary_${timestamp}.csv`;
        
        // Download summary report
        downloadCSV(summaryContent, filename);
        
        showNotification('Export', 'Summary report exported successfully!', 'success');
    } catch (error) {
        console.error('Summary export error:', error);
        showNotification('Export', 'Failed to export summary report. Please try again.', 'error');
    }
}

// Generate summary report content
function generateSummaryReport(maintenanceRecords, stats) {
    const headers = [
        'Report Type',
        'Value',
        'Description'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    // Add summary statistics
    const summaryData = [
        ['Total Maintenance Records', stats.totalRecords, 'Total number of maintenance records'],
        ['Completed Repairs', stats.completedCount, 'Number of completed repairs'],
        ['In Progress Repairs', stats.inProgressCount, 'Number of repairs in progress'],
        ['Pending Repairs', stats.pendingCount, 'Number of pending repairs'],
        ['Total Cost', `₹${stats.totalCost.toFixed(2)}`, 'Total cost of all repairs'],
        ['Paid Records', stats.paidCount, 'Number of paid records'],
        ['Unpaid Records', stats.unpaidCount, 'Number of unpaid records'],
        ['Completion Rate', `${((stats.completedCount / stats.totalRecords) * 100).toFixed(2)}%`, 'Percentage of completed repairs'],
        ['Export Date', new Date().toLocaleString(), 'Date and time of export']
    ];
    
    summaryData.forEach(row => {
        csvContent += row.map(cell => escapeCSVValue(cell)).join(',') + '\n';
    });
    
    return csvContent;
}

// Toggle export dropdown
function toggleExportDropdown() {
    const dropdown = document.getElementById('export-dropdown-menu');
    dropdown.classList.toggle('show');
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('.export-dropdown')) {
            dropdown.classList.remove('show');
            document.removeEventListener('click', closeDropdown);
        }
    });
}

// UM vehicle actions
function editUMVehicle(vehicleId) {
    showNotification('Edit Vehicle', `Edit functionality for ${vehicleId} will be available soon!`, 'info');
}

function deleteUMVehicle(vehicleId) {
    if (confirm(`Are you sure you want to delete vehicle ${vehicleId}?`)) {
        // Remove from umVehiclesData array
        umVehiclesData = umVehiclesData.filter(vehicle => vehicle.id !== vehicleId);
        
        // Update localStorage
        localStorage.setItem('umVehiclesData', JSON.stringify(umVehiclesData));
        
        // Refresh the display
        loadUMVehiclesData();
        
        showNotification('Delete Vehicle', `${vehicleId} has been deleted successfully.`, 'success');
    }
}

function viewUMDetails(vehicleId) {
    const vehicle = umVehiclesData.find(v => v.id === vehicleId);
    
    if (!vehicle) {
        showNotification('Error', 'Vehicle not found!', 'error');
        return;
    }
    
    if (vehicle.type === 'Bike Maintenance' && vehicle.maintenanceDetails) {
        // Show detailed maintenance information
        showMaintenanceDetailsModal(vehicle);
    } else {
        showNotification('View Details', `Details for ${vehicleId} will be available soon!`, 'info');
    }
}

// Show maintenance details modal
function showMaintenanceDetailsModal(vehicle) {
    const details = vehicle.maintenanceDetails;
    
    // Create modal content
    const modalContent = `
        <div class="modal-content maintenance-details-content">
            <div class="modal-header">
                <h2><i class="fas fa-bicycle"></i> Maintenance Details - ${vehicle.id}</h2>
                <button class="close-btn" onclick="closeMaintenanceDetailsModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="details-grid">
                    <div class="detail-section">
                        <h3><i class="fas fa-calendar-alt"></i> Service Information</h3>
                        <div class="detail-item">
                            <label>Service ID:</label>
                            <span>${details.serviceId}</span>
                        </div>
                        <div class="detail-item">
                            <label>Arrival Date:</label>
                            <span>${details.arrivalDateTime}</span>
                        </div>
                        <div class="detail-item">
                            <label>Expected Completion:</label>
                            <span>${details.expectedCompletion}</span>
                        </div>
                        <div class="detail-item">
                            <label>Priority Level:</label>
                            <span class="priority-${details.priorityLevel.toLowerCase()}">${details.priorityLevel}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3><i class="fas fa-bicycle"></i> Bike Information</h3>
                        <div class="detail-item">
                            <label>Registration Number:</label>
                            <span>${details.bikeRegNumber}</span>
                        </div>
                        <div class="detail-item">
                            <label>Brand/Model:</label>
                            <span>${details.capacity}</span>
                        </div>
                        <div class="detail-item">
                            <label>Bike Type:</label>
                            <span>${details.bikeType}</span>
                        </div>
                        <div class="detail-item">
                            <label>Chassis Number:</label>
                            <span>${details.chassisNumber}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3><i class="fas fa-user"></i> Customer Information</h3>
                        <div class="detail-item">
                            <label>Rider Name:</label>
                            <span>${details.riderName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Contact Number:</label>
                            <span>${details.contactNumber}</span>
                        </div>
                        <div class="detail-item">
                            <label>Request ID:</label>
                            <span>${details.requestId}</span>
                        </div>
                        <div class="detail-item">
                            <label>Address:</label>
                            <span>${details.riderAddress || 'Not provided'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3><i class="fas fa-users"></i> Team Information</h3>
                        <div class="detail-item">
                            <label>City Manager:</label>
                            <span>${details.cmName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Team Lead:</label>
                            <span>${details.tlName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Location:</label>
                            <span>${vehicle.location}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3><i class="fas fa-rupee-sign"></i> Cost Information</h3>
                        <div class="detail-item">
                            <label>Labor Cost:</label>
                            <span>₹${details.laborCost}</span>
                        </div>
                        <div class="detail-item">
                            <label>Parts Cost:</label>
                            <span>₹${details.partsCost}</span>
                        </div>
                        <div class="detail-item">
                            <label>Total Cost:</label>
                            <span class="total-cost">₹${details.totalCost}</span>
                        </div>
                        <div class="detail-item">
                            <label>Payment Status:</label>
                            <span class="payment-${details.paymentStatus.toLowerCase()}">${details.paymentStatus}</span>
                        </div>
                    </div>
                </div>
                
                <div class="parts-section">
                    <h3><i class="fas fa-tools"></i> Parts & Repairs</h3>
                    <div class="parts-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Part Name</th>
                                    <th>Damage Description</th>
                                    <th>Repair Action</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${details.parts.map(part => `
                                    <tr>
                                        <td>${part.partName}</td>
                                        <td>${part.damageDescription}</td>
                                        <td>${part.repairAction}</td>
                                        <td><span class="status ${part.status.toLowerCase().replace(' ', '-')}">${part.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                ${details.mechanicComments ? `
                    <div class="comments-section">
                        <h3><i class="fas fa-comment"></i> Mechanic Comments</h3>
                        <p>${details.mechanicComments}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Create and show modal
    let modal = document.getElementById('maintenance-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'maintenance-details-modal';
        modal.className = 'modal show';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = modalContent;
    modal.classList.add('show');
}

// Close maintenance details modal
function closeMaintenanceDetailsModal() {
    const modal = document.getElementById('maintenance-details-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Clear all UM vehicles data (for testing purposes)
function clearAllUMVehiclesData() {
    if (confirm('Are you sure you want to clear all UM vehicles data? This action cannot be undone.')) {
        localStorage.removeItem('umVehiclesData');
        umVehiclesData = [];
        showNotification('All UM vehicles data cleared successfully', 'success');
        
        // Refresh the display if modal is open
        const modal = document.getElementById('um-vehicles-modal');
        if (modal && modal.classList.contains('show')) {
            loadUMVehiclesData();
        }
    }
}

// Check and clear any dummy data on page load
function checkAndClearDummyData() {
    const savedData = localStorage.getItem('umVehiclesData');
    if (savedData) {
        const data = JSON.parse(savedData);
        // Check if there are any non-maintenance records (dummy data)
        const nonMaintenanceRecords = data.filter(record => record.type !== 'Bike Maintenance');
        
        if (nonMaintenanceRecords.length > 0) {
            // Remove dummy data and keep only maintenance records
            const maintenanceRecords = data.filter(record => record.type === 'Bike Maintenance' && record.maintenanceDetails);
            umVehiclesData = maintenanceRecords;
            localStorage.setItem('umVehiclesData', JSON.stringify(maintenanceRecords));
            
            console.log('Dummy data cleared. Kept only maintenance records.');
        }
    }
}

// Export functions for global access
window.addPartRow = addPartRow;
window.removePartRow = removePartRow;
window.saveDraft = saveDraft;
window.cancelForm = cancelForm;
window.closeModal = closeModal;
window.logout = logout;
window.openInventory = openInventory;
window.populateBikeRegNumbers = populateBikeRegNumbers;
window.autoFillBikeDetails = autoFillBikeDetails;
window.showNotification = showNotification;
window.calculateAgeingDays = calculateAgeingDays;
window.calculateOverdueDays = calculateOverdueDays;
window.populateCMDropdown = populateCMDropdown;
window.loadCMData = loadCMData;
window.validateContactNumber = validateContactNumber;
window.toggleUMDropdown = toggleUMDropdown;
window.openUMVehicles = openUMVehicles;
window.addUMVehicle = addUMVehicle;
window.goBackToBikeMaintenanceForm = goBackToBikeMaintenanceForm;
window.umMaintenance = umMaintenance;
window.showUMVehiclesModal = showUMVehiclesModal;
window.closeUMVehiclesModal = closeUMVehiclesModal;
window.loadUMVehiclesData = loadUMVehiclesData;
window.displayUMVehiclesData = displayUMVehiclesData;
window.applyUMFilters = applyUMFilters;
window.clearUMFilters = clearUMFilters;
window.sortUMTable = sortUMTable;
window.previousUMPage = previousUMPage;
window.nextUMPage = nextUMPage;
window.exportUMData = exportUMData;
window.editUMVehicle = editUMVehicle;
window.deleteUMVehicle = deleteUMVehicle;
window.viewUMDetails = viewUMDetails;
window.addMaintenanceRecordToUMVehicles = addMaintenanceRecordToUMVehicles;
window.getOverallStatus = getOverallStatus;
window.showMaintenanceDetailsModal = showMaintenanceDetailsModal;
window.closeMaintenanceDetailsModal = closeMaintenanceDetailsModal;
window.clearAllUMVehiclesData = clearAllUMVehiclesData;
window.checkAndClearDummyData = checkAndClearDummyData;
window.exportUMData = exportUMData;
window.exportFilteredData = exportFilteredData;
window.exportSummaryReport = exportSummaryReport;
window.toggleExportDropdown = toggleExportDropdown;
window.closeUMVehiclesModal = closeUMVehiclesModal;
window.logout = logout;
window.checkUserAuthentication = checkUserAuthentication;
window.forceLogout = forceLogout;
window.setupLogoutButtons = setupLogoutButtons;

// Add CSS for priority indicators and notifications
const priorityStyles = document.createElement('style');
priorityStyles.textContent = `
    .priority-high {
        position: relative;
    }
    
    .priority-high::after {
        content: '🔥';
        position: absolute;
        top: -5px;
        right: -5px;
        font-size: 1rem;
    }
    
    .priority-medium {
        position: relative;
    }
    
    .priority-medium::after {
        content: '⚡';
        position: absolute;
        top: -5px;
        right: -5px;
        font-size: 1rem;
    }
    
    .priority-low {
        position: relative;
    }
    
    .priority-low::after {
        content: '🐌';
        position: absolute;
        top: -5px;
        right: -5px;
        font-size: 1rem;
    }
    
    .modal.success .modal-header {
        background: linear-gradient(135deg, #48bb78, #38a169);
        color: white;
    }
    
    .modal.error .modal-header {
        background: linear-gradient(135deg, #f56565, #e53e3e);
        color: white;
    }
    
    .modal.info .modal-header {
        background: linear-gradient(135deg, #4299e1, #3182ce);
        color: white;
    }
    
    /* Notification Styles */
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
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-content i {
        font-size: 1.2rem;
        color: #28a745;
    }
    
    .notification-content span {
        flex: 1;
        font-size: 0.9rem;
        color: #333;
    }
    
    .notification-content button {
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .notification-content button:hover {
        background: #f0f0f0;
        color: #333;
    }
    
    /* Enhanced Dropdown Styles */
    #bikeRegNumber {
        transition: all 0.3s ease;
    }
    
    #bikeRegNumber:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    #bikeRegNumber option {
        padding: 0.5rem;
        font-size: 0.9rem;
    }
    
    /* Loading state for dropdown */
    .loading-dropdown {
        opacity: 0.6;
        pointer-events: none;
    }
    
    .loading-dropdown::after {
        content: 'Loading...';
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.8rem;
        color: #666;
    }
    
    /* Readonly field styles */
    input[readonly] {
        background-color: #f8f9fa;
        border-color: #e9ecef;
        color: #495057;
        cursor: not-allowed;
        font-weight: 500;
    }
    
    input[readonly]:focus {
        border-color: #e9ecef;
        box-shadow: none;
        outline: none;
    }
    
    /* Auto-filled field indicator */
    .auto-filled {
        position: relative;
    }
    
    .auto-filled::after {
        content: '✓';
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: #28a745;
        font-weight: bold;
        font-size: 1.1rem;
    }
    
    /* EV badge for bike type */
    #bikeType {
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        font-weight: 600;
        text-align: center;
    }
    
    #bikeType::placeholder {
        color: rgba(255, 255, 255, 0.8);
    }
    
    /* Ageing Tile Styles */
    .ageing-tile {
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 12px;
        padding: 1.5rem;
        color: white;
        text-align: center;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        transition: all 0.3s ease;
    }
    
    .ageing-tile:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    /* Overdue Tile Styles */
    .overdue-tile {
        background: linear-gradient(135deg, #dc3545, #c82333);
        box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
    }
    
    .overdue-tile:hover {
        box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
    }
    
    .ageing-tile label {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        display: block;
    }
    
    .ageing-display {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .ageing-number {
        font-size: 2.5rem;
        font-weight: 700;
        line-height: 1;
    }
    
    .ageing-label {
        font-size: 1rem;
        font-weight: 500;
        opacity: 0.9;
    }
    
    /* Ageing status colors */
    .ageing-display.overdue {
        background: linear-gradient(135deg, #dc3545, #c82333);
        border-radius: 8px;
        padding: 0.5rem 1rem;
        margin-top: 0.5rem;
    }
    
    .ageing-display.due-today {
        background: linear-gradient(135deg, #fd7e14, #e55a00);
        border-radius: 8px;
        padding: 0.5rem 1rem;
        margin-top: 0.5rem;
    }
    
    .ageing-display.due-soon {
        background: linear-gradient(135deg, #ffc107, #e0a800);
        border-radius: 8px;
        padding: 0.5rem 1rem;
        margin-top: 0.5rem;
    }
    
    .ageing-display.normal {
        background: linear-gradient(135deg, #17a2b8, #138496);
        border-radius: 8px;
        padding: 0.5rem 1rem;
        margin-top: 0.5rem;
    }
    
    .ageing-display.long-duration {
        background: linear-gradient(135deg, #28a745, #1e7e34);
        border-radius: 8px;
        padding: 0.5rem 1rem;
        margin-top: 0.5rem;
    }
    
    /* Animation for ageing number */
    @keyframes pulseAgeing {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .ageing-display.overdue .ageing-number,
    .ageing-display.due-today .ageing-number {
        animation: pulseAgeing 2s infinite;
    }
    
    /* UM Vehicles Modal Styles */
    .um-vehicles-content {
        max-width: 100vw;
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        overflow: hidden;
        border-radius: 0;
        margin: 0;
    }
    
    /* Full page modal */
    #um-vehicles-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    #um-vehicles-modal.show {
        display: flex;
    }
    
    /* Full page modal header */
    .um-vehicles-content .modal-header {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e9ecef;
        position: sticky;
        top: 0;
        z-index: 10;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .um-vehicles-content .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    /* Enhanced close button */
    .um-vehicles-content .close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.5rem;
        transition: all 0.3s ease;
        position: relative;
        z-index: 20;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
    
    .um-vehicles-content .close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
        transform: scale(1.1);
    }
    
    .um-vehicles-content .close-btn:active {
        transform: scale(0.95);
    }
    
    .um-vehicles-content .close-btn i {
        font-size: 1.2rem;
    }
    
    /* Additional close button enhancements */
    .um-vehicles-content .close-btn::before {
        content: '';
        position: absolute;
        top: -5px;
        left: -5px;
        right: -5px;
        bottom: -5px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .um-vehicles-content .close-btn:hover::before {
        opacity: 1;
    }
    
    /* Mobile responsive close button */
    @media (max-width: 768px) {
        .um-vehicles-content .close-btn {
            width: 60px;
            height: 60px;
            font-size: 1.8rem;
        }
        
        .um-vehicles-content .close-btn i {
            font-size: 1.5rem;
        }
    }
    
    /* Full page controls */
    .um-controls {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border: 1px solid #e9ecef;
    }
    
    .controls-left {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
    }
    
    .controls-right {
        display: flex;
        align-items: center;
    }
    
    /* Full page table container */
    .um-table-container {
        flex: 1;
        overflow: auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    /* Responsive full page */
    @media (max-width: 768px) {
        .um-vehicles-content {
            width: 100vw;
            height: 100vh;
        }
        
        .um-controls {
            flex-direction: column;
            gap: 1rem;
        }
        
        .controls-left {
            justify-content: center;
        }
        
        .um-summary {
            flex-direction: column;
            gap: 1rem;
        }
        
        .summary-item {
            text-align: center;
        }
    }
    
    .um-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        gap: 1rem;
    }
    
    .controls-left {
        display: flex;
        gap: 1rem;
    }
    
    .controls-right {
        display: flex;
        gap: 1rem;
    }
    
    .um-filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        align-items: end;
    }
    
    .um-table-container {
        overflow-x: auto;
        margin-bottom: 1.5rem;
    }
    
    .um-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .um-table th {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .um-table th:hover {
        background: linear-gradient(135deg, #5a67d8, #6b46c1);
    }
    
    .um-table td {
        padding: 1rem;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .um-table tr:hover {
        background: #f8f9fa;
    }
    
    .um-pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    
    /* Status styles for UM vehicles */
    .status.available {
        background: #d4edda;
        color: #155724;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .status.in-use {
        background: #fff3cd;
        color: #856404;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .status.maintenance {
        background: #f8d7da;
        color: #721c24;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .status.out-of-service {
        background: #e2e3e5;
        color: #383d41;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    /* Dropdown styles */
    .dropdown-menu {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        min-width: 200px;
    }
    
    .dropdown-menu.show {
        display: block;
    }
    
    .dropdown-menu li {
        list-style: none;
    }
    
    .dropdown-menu a {
        display: block;
        padding: 0.75rem 1rem;
        color: #333;
        text-decoration: none;
        transition: background 0.3s ease;
    }
    
    .dropdown-menu a:hover {
        background: #f8f9fa;
    }
    
    .dropdown-arrow {
        margin-left: 0.5rem;
        transition: transform 0.3s ease;
    }
    
    .nav-item.dropdown.active .dropdown-arrow {
        transform: rotate(180deg);
    }
    
    /* Enhanced UM table styles for maintenance records */
    .vehicle-id, .vehicle-type, .vehicle-capacity, .vehicle-location, .vehicle-date {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .sub-info {
        font-size: 0.75rem;
        color: #666;
        font-style: italic;
    }
    
    .vehicle-type i {
        color: #667eea;
        margin-right: 0.5rem;
    }
    
    /* Maintenance record specific styles */
    .um-table tr[data-type="maintenance"] {
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    }
    
    .um-table tr[data-type="maintenance"]:hover {
        background: linear-gradient(135deg, #e9ecef, #dee2e6);
    }
    
    /* Status styles for maintenance records */
    .status.completed {
        background: #d4edda;
        color: #155724;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .status.in-progress {
        background: #fff3cd;
        color: #856404;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .status.pending {
        background: #f8d7da;
        color: #721c24;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    /* Maintenance Details Modal Styles */
    .maintenance-details-content {
        max-width: 1000px;
        width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .detail-section {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    }
    
    .detail-section h3 {
        margin: 0 0 1rem 0;
        color: #333;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e9ecef;
    }
    
    .detail-item:last-child {
        border-bottom: none;
    }
    
    .detail-item label {
        font-weight: 600;
        color: #495057;
        min-width: 120px;
    }
    
    .detail-item span {
        color: #333;
        text-align: right;
        flex: 1;
    }
    
    .priority-high {
        color: #dc3545;
        font-weight: 600;
    }
    
    .priority-medium {
        color: #ffc107;
        font-weight: 600;
    }
    
    .priority-low {
        color: #28a745;
        font-weight: 600;
    }
    
    .total-cost {
        font-weight: 700;
        color: #28a745;
        font-size: 1.1rem;
    }
    
    .payment-paid {
        color: #28a745;
        font-weight: 600;
    }
    
    .payment-unpaid {
        color: #dc3545;
        font-weight: 600;
    }
    
    .payment-partial {
        color: #ffc107;
        font-weight: 600;
    }
    
    .parts-section, .comments-section {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        margin-top: 1.5rem;
    }
    
    .parts-section h3, .comments-section h3 {
        margin: 0 0 1rem 0;
        color: #333;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .parts-table table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
    }
    
    .parts-table th {
        background: #667eea;
        color: white;
        padding: 0.75rem;
        text-align: left;
        font-weight: 600;
    }
    
    .parts-table td {
        padding: 0.75rem;
        border-bottom: 1px solid #e9ecef;
    }
    
    .parts-table tr:hover {
        background: #f8f9fa;
    }
    
    .comments-section p {
        margin: 0;
        color: #333;
        line-height: 1.6;
        font-style: italic;
    }
    
    /* Comprehensive table styles */
    .um-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .um-table th {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 0.75rem 0.5rem;
        text-align: left;
        font-weight: 600;
        font-size: 0.8rem;
        white-space: nowrap;
        position: sticky;
        top: 0;
        z-index: 10;
    }
    
    .um-table td {
        padding: 0.75rem 0.5rem;
        border-bottom: 1px solid #e9ecef;
        vertical-align: top;
        max-width: 150px;
        word-wrap: break-word;
    }
    
    .um-table tr:hover {
        background: #f8f9fa;
    }
    
    .um-table tr:nth-child(even) {
        background: #fafbfc;
    }
    
    .um-table tr:nth-child(even):hover {
        background: #f1f3f4;
    }
    
    /* Priority badges */
    .priority-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .priority-high {
        background: #fee2e2;
        color: #dc2626;
    }
    
    .priority-medium {
        background: #fef3c7;
        color: #d97706;
    }
    
    .priority-low {
        background: #dcfce7;
        color: #16a34a;
    }
    
    /* Status badges */
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .status-completed {
        background: #dcfce7;
        color: #16a34a;
    }
    
    .status-in-progress {
        background: #fef3c7;
        color: #d97706;
    }
    
    .status-pending {
        background: #fee2e2;
        color: #dc2626;
    }
    
    /* Sub-text styling */
    .sub-text {
        font-size: 0.75rem;
        color: #6b7280;
        margin-top: 0.25rem;
        font-style: italic;
    }
    
    /* Combined fields styling */
    .duration-city, .issue-rider, .cm-tl, .repair-status {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .repair-status {
        align-items: flex-start;
    }
    
    /* Table container with horizontal scroll */
    .um-table-container {
        overflow-x: auto;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    /* Summary section */
    .um-summary {
        display: flex;
        gap: 2rem;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
    }
    
    .summary-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }
    
    .summary-label {
        font-size: 0.8rem;
        color: #6b7280;
        font-weight: 500;
    }
    
    .summary-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #374151;
    }
    
    .summary-value.completed {
        color: #16a34a;
    }
    
    .summary-value.in-progress {
        color: #d97706;
    }
    
    .summary-value.pending {
        color: #dc2626;
    }
    
    /* Responsive table */
    @media (max-width: 1200px) {
        .um-table {
            font-size: 0.8rem;
        }
        
        .um-table th,
        .um-table td {
            padding: 0.5rem 0.25rem;
        }
        
        .um-summary {
            flex-wrap: wrap;
            gap: 1rem;
        }
    }
    
    /* Export dropdown styles */
    .export-dropdown {
        position: relative;
        display: inline-block;
    }
    
    .export-dropdown .dropdown-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .export-dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        min-width: 200px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s ease;
    }
    
    .export-dropdown-menu.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .export-option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem 1rem;
        border: none;
        background: none;
        text-align: left;
        cursor: pointer;
        transition: background-color 0.2s ease;
        font-size: 0.9rem;
        color: #374151;
    }
    
    .export-option:hover {
        background: #f8f9fa;
    }
    
    .export-option:first-child {
        border-radius: 8px 8px 0 0;
    }
    
    .export-option:last-child {
        border-radius: 0 0 8px 8px;
    }
    
    .export-option i {
        width: 16px;
        text-align: center;
    }
`;

document.head.appendChild(priorityStyles); 

// Masters modal open/close logic
function toggleMastersDropdown() {
    const dropdown = document.getElementById('masters-dropdown');
    dropdown.classList.toggle('show');
}

function addNewCM() {
    document.getElementById('addCMModal').style.display = 'block';
}
function addNewCity() {
    document.getElementById('addCityModal').style.display = 'block';
}
function addNewParts() {
    document.getElementById('addPartsModal').style.display = 'block';
}
function closeMastersModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    // Masters forms event listeners
    document.getElementById('addCMForm').addEventListener('submit', function(e) {
        e.preventDefault();
        closeMastersModal('addCMModal');
        // TODO: Add logic to save new CM
    });
    document.getElementById('addCityForm').addEventListener('submit', function(e) {
        e.preventDefault();
        closeMastersModal('addCityModal');
        // TODO: Add logic to save new City
    });
    document.getElementById('addPartsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        closeMastersModal('addPartsModal');
        // TODO: Add logic to save new Part
    });
}); 

// Listen for updates from dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Listen for CM data updates
    window.addEventListener('cmDataUpdated', function(e) {
        const { city, cmName } = e.detail;
        updateCMDropdown(city, cmName);
    });
    
    // Listen for cities updates
    window.addEventListener('citiesUpdated', function(e) {
        const { cityName } = e.detail;
        updateCityDropdown(cityName);
    });
    
    // Listen for parts updates
    window.addEventListener('partsUpdated', function(e) {
        const { part } = e.detail;
        updatePartsDropdown(part);
    });
});

function updateCMDropdown(city, cmName) {
    // Update the CM data structure
    if (!cmData[city]) {
        cmData[city] = [];
    }
    if (!cmData[city].includes(cmName)) {
        cmData[city].push(cmName);
    }
    
    // If the city dropdown is currently selected, refresh the CM dropdown
    const citySelect = document.getElementById('city');
    const cmSelect = document.getElementById('cmName');
    if (citySelect.value === city && cmSelect) {
        populateCMDropdown(city);
    }
}

function updateCityDropdown(cityName) {
    // Add new city to the city dropdown
    const citySelect = document.getElementById('city');
    if (citySelect) {
        // Check if city already exists
        const existingOption = Array.from(citySelect.options).find(option => option.value === cityName);
        if (!existingOption) {
            const option = document.createElement('option');
            option.value = cityName;
            option.textContent = cityName;
            citySelect.appendChild(option);
        }
    }
}

function updatePartsDropdown(part) {
    // This would update the parts dropdown in the maintenance form
    // Implementation depends on how parts are displayed in the form
    console.log('New part added:', part);
}

// Modify loadCMData to also load from localStorage
function loadCMData() {
    // Load from localStorage if available
    const savedCMData = localStorage.getItem('cmData');
    if (savedCMData) {
        cmData = JSON.parse(savedCMData);
    } else {
        // Default CM data
        cmData = {
            'BLR': [
                'Dinesh',
                'Somashekar',
                'Prajwal S Patil',
                'Prashanth S',
                'Chetan GV',
                'RMP_Bhabhik'
            ],
            'Del': [
                'Akram',
                'Salman Ahmed',
                'Harshit'
            ],
            'HYD': [
                'Shaik Jakir Umar',
                'Mohd Abdul Hakeem',
                'Madhukar Kommu'
            ],
            'MUM': [
                'Mumbai CM 1',
                'Mumbai CM 2',
                'Mumbai CM 3'
            ],
            'CHN': [
                'Chennai CM 1',
                'Chennai CM 2',
                'Chennai CM 3'
            ]
        };
    }
    
    console.log('CM data loaded for all cities');
}

// Modify populateCityDropdown to also load from localStorage
function populateCityDropdown() {
    const citySelect = document.getElementById('city');
    
    // Load cities from localStorage if available
    const savedCities = localStorage.getItem('cities');
    let cities = [];
    
    if (savedCities) {
        cities = JSON.parse(savedCities);
    } else {
        // Check if bikeDataArray is available
        if (typeof bikeDataArray !== 'undefined' && bikeDataArray.length > 0) {
            // Extract unique cities from bike data
            cities = [...new Set(bikeDataArray.map(bike => bike.city))].sort();
        } else {
            // Fallback: Add some default cities if bike data is not available
            cities = ['BLR', 'Del', 'HYD', 'MUM', 'CHN'];
        }
    }
    
    // Clear existing options except the first one
    citySelect.innerHTML = '<option value="">Select City</option>';
    
    // Add city options
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = getCityDisplayName(city);
        citySelect.appendChild(option);
    });
}