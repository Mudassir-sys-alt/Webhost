// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const messageModal = document.getElementById('messageModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');

// Form switching functionality
function switchForm(formType) {
    if (formType === 'signup') {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        // Smooth transition effect
        signupForm.style.opacity = '0';
        signupForm.style.transform = 'translateX(20px)';
        setTimeout(() => {
            signupForm.style.transition = 'all 0.3s ease';
            signupForm.style.opacity = '1';
            signupForm.style.transform = 'translateX(0)';
        }, 10);
    } else {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        // Smooth transition effect
        loginForm.style.opacity = '0';
        loginForm.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            loginForm.style.transition = 'all 0.3s ease';
            loginForm.style.opacity = '1';
            loginForm.style.transform = 'translateX(0)';
        }, 10);
    }
}

// Password visibility toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Form validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

function showFieldError(inputId, message) {
    const inputGroup = document.getElementById(inputId).parentElement;
    inputGroup.classList.add('error');
    
    // Remove existing error message
    const existingError = inputGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    inputGroup.appendChild(errorMessage);
}

function clearFieldError(inputId) {
    const inputGroup = document.getElementById(inputId).parentElement;
    inputGroup.classList.remove('error');
    
    const errorMessage = inputGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function showFieldSuccess(inputId) {
    const inputGroup = document.getElementById(inputId).parentElement;
    inputGroup.classList.add('success');
    
    // Remove existing success message
    const existingSuccess = inputGroup.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    // Add new success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `<i class="fas fa-check-circle"></i> Valid`;
    inputGroup.appendChild(successMessage);
}

// Modal functionality
function showModal(title, message, type = 'success') {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Add type-specific styling
    messageModal.className = `modal show ${type}`;
    
    // Add click outside to close
    messageModal.addEventListener('click', function(e) {
        if (e.target === messageModal) {
            closeModal();
        }
    });
    
    // Add escape key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function closeModal() {
    messageModal.classList.remove('show');
}

// User database - Default admin and registered users
const registeredUsers = [
    {
        id: 'admin',
        email: 'mudassir@loadshare.net',
        password: 'admin123',
        role: 'admin',
        name: 'Mudassir',
        firstName: 'Mudassir',
        lastName: 'Admin'
    },
    {
        id: 'user1',
        email: 'user1@loadshare.com',
        password: 'user123',
        role: 'user',
        name: 'Regular User',
        firstName: 'Regular',
        lastName: 'User'
    },
    {
        id: 'manager1',
        email: 'manager1@loadshare.com',
        password: 'manager123',
        role: 'manager',
        name: 'Manager User',
        firstName: 'Manager',
        lastName: 'User'
    }
];

// Function to check if user is registered
function isUserRegistered(email) {
    return registeredUsers.some(user => user.email === email);
}

// Function to validate user credentials
function validateUserCredentials(email, password) {
    return registeredUsers.find(user => user.email === email && user.password === password);
}

// Login form handling
loginFormElement.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Clear previous errors
    clearFieldError('loginEmail');
    clearFieldError('loginPassword');
    
    // Validation
    let hasErrors = false;
    
    if (!email) {
        showFieldError('loginEmail', 'Email is required');
        hasErrors = true;
    } else if (!validateEmail(email)) {
        showFieldError('loginEmail', 'Please enter a valid email address');
        hasErrors = true;
    }
    
    if (!password) {
        showFieldError('loginPassword', 'Password is required');
        hasErrors = true;
    }
    
    if (hasErrors) {
        return;
    }
    
    // Show loading state
    const submitButton = loginFormElement.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Signing In...';
    submitButton.classList.add('loading');
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if user is registered
        if (!isUserRegistered(email)) {
            showModal('Login Failed', 'User not registered. Please check your email or contact administrator.', 'error');
            return;
        }
        
        // Validate credentials
        const user = validateUserCredentials(email, password);
        if (!user) {
            showModal('Login Failed', 'Invalid email or password. Please try again.', 'error');
            return;
        }
        
        // Store user session
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Store login state if remember me is checked
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('userEmail', email);
        }
        
        // Clear form
        loginFormElement.reset();
        
        // Show success message
        showModal('Login Successful', `Welcome back, ${user.name}! Redirecting to dashboard...`, 'success');
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        showModal('Login Failed', 'An error occurred during login. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.classList.remove('loading');
    }
});

// Function to add new user to registered users
function addNewUser(userData) {
    const newUser = {
        id: 'user_' + Date.now(),
        email: userData.email,
        password: userData.password,
        role: 'user', // Default role for new signups
        name: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        company: userData.company || ''
    };
    
    registeredUsers.push(newUser);
    
    // Store updated users in localStorage for persistence
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    return newUser;
}

// Function to check if email already exists
function isEmailAlreadyRegistered(email) {
    return registeredUsers.some(user => user.email === email);
}

// Signup form handling
signupFormElement.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName = document.getElementById('signupLastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const company = document.getElementById('signupCompany').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Clear previous errors
    clearFieldError('signupFirstName');
    clearFieldError('signupLastName');
    clearFieldError('signupEmail');
    clearFieldError('signupPassword');
    clearFieldError('signupConfirmPassword');
    
    // Validation
    let hasErrors = false;
    
    if (!firstName) {
        showFieldError('signupFirstName', 'First name is required');
        hasErrors = true;
    }
    
    if (!lastName) {
        showFieldError('signupLastName', 'Last name is required');
        hasErrors = true;
    }
    
    if (!email) {
        showFieldError('signupEmail', 'Email is required');
        hasErrors = true;
    } else if (!validateEmail(email)) {
        showFieldError('signupEmail', 'Please enter a valid email address');
        hasErrors = true;
    } else if (isEmailAlreadyRegistered(email)) {
        showFieldError('signupEmail', 'Email already registered. Please use a different email or try logging in.');
        hasErrors = true;
    }
    
    if (!password) {
        showFieldError('signupPassword', 'Password is required');
        hasErrors = true;
    } else if (!validatePassword(password)) {
        showFieldError('signupPassword', 'Password must be at least 8 characters with uppercase, lowercase, and number');
        hasErrors = true;
    }
    
    if (!confirmPassword) {
        showFieldError('signupConfirmPassword', 'Please confirm your password');
        hasErrors = true;
    } else if (password !== confirmPassword) {
        showFieldError('signupConfirmPassword', 'Passwords do not match');
        hasErrors = true;
    }
    
    if (!agreeTerms) {
        showModal('Terms Required', 'Please agree to the Terms of Service and Privacy Policy.', 'error');
        return;
    }
    
    if (hasErrors) {
        return;
    }
    
    // Show loading state
    const submitButton = signupFormElement.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Creating Account...';
    submitButton.classList.add('loading');
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create new user
        const newUser = addNewUser({
            firstName,
            lastName,
            email,
            company,
            password
        });
        
        // Store user session
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Clear form
        signupFormElement.reset();
        
        // Show success message
        showModal('Account Created', `Welcome to Loadshare Networks, ${newUser.name}! Your account has been created successfully. Redirecting to dashboard...`, 'success');
        
        // Redirect to dashboard after successful signup
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        showModal('Signup Failed', 'An error occurred while creating your account. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.classList.remove('loading');
    }
});

// Real-time validation
function setupRealTimeValidation() {
    // Email validation
    const emailInputs = ['loginEmail', 'signupEmail'];
    emailInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('blur', function() {
                const email = this.value.trim();
                if (email && !validateEmail(email)) {
                    showFieldError(inputId, 'Please enter a valid email address');
                } else if (email) {
                    clearFieldError(inputId);
                    showFieldSuccess(inputId);
                }
            });
            
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    clearFieldError(inputId);
                }
            });
        }
    });
    
    // Password validation for signup
    const signupPassword = document.getElementById('signupPassword');
    if (signupPassword) {
        signupPassword.addEventListener('blur', function() {
            const password = this.value;
            if (password && !validatePassword(password)) {
                showFieldError('signupPassword', 'Password must be at least 8 characters with uppercase, lowercase, and number');
            } else if (password) {
                clearFieldError('signupPassword');
                showFieldSuccess('signupPassword');
            }
        });
        
        signupPassword.addEventListener('input', function() {
            if (this.value) {
                clearFieldError('signupPassword');
            }
        });
    }
    
    // Confirm password validation
    const confirmPassword = document.getElementById('signupConfirmPassword');
    if (confirmPassword) {
        confirmPassword.addEventListener('blur', function() {
            const password = document.getElementById('signupPassword').value;
            const confirmPass = this.value;
            
            if (confirmPass && password !== confirmPass) {
                showFieldError('signupConfirmPassword', 'Passwords do not match');
            } else if (confirmPass && password === confirmPass) {
                clearFieldError('signupConfirmPassword');
                showFieldSuccess('signupConfirmPassword');
            }
        });
        
        confirmPassword.addEventListener('input', function() {
            if (this.value) {
                clearFieldError('signupConfirmPassword');
            }
        });
    }
}

// Social login buttons
function setupSocialLogin() {
    const socialButtons = document.querySelectorAll('.btn-social');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const provider = this.classList.contains('btn-google') ? 'Google' : 'LinkedIn';
            showModal('Coming Soon', `${provider} authentication will be available soon!`, 'info');
        });
    });
}

// Forgot password functionality
function setupForgotPassword() {
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showModal('Password Reset', 'Password reset functionality will be available soon!', 'info');
        });
    }
}

// Terms and Privacy links
function setupTermsLinks() {
    const termsLinks = document.querySelectorAll('.terms-link');
    
    termsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const isTerms = this.textContent.includes('Terms');
            const title = isTerms ? 'Terms of Service' : 'Privacy Policy';
            showModal(title, `${title} content will be available soon!`, 'info');
        });
    });
}

// Check for remembered login
function checkRememberedLogin() {
    const remembered = localStorage.getItem('rememberMe');
    const userEmail = localStorage.getItem('userEmail');
    
    if (remembered === 'true' && userEmail) {
        document.getElementById('loginEmail').value = userEmail;
        document.getElementById('rememberMe').checked = true;
    }
}

// Function to load registered users from localStorage
function loadRegisteredUsers() {
    const savedUsers = localStorage.getItem('registeredUsers');
    if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        // Merge with default users, avoiding duplicates
        parsedUsers.forEach(savedUser => {
            const existingUser = registeredUsers.find(user => user.email === savedUser.email);
            if (!existingUser) {
                registeredUsers.push(savedUser);
            }
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load registered users from localStorage
    loadRegisteredUsers();
    
    setupRealTimeValidation();
    setupSocialLogin();
    setupForgotPassword();
    setupTermsLinks();
    checkRememberedLogin();
    
    // Setup idle timeout for login page
    setupLoginIdleTimeout();
    
    // Add smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add focus styles for better accessibility
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
});

// Add some nice animations on page load
window.addEventListener('load', function() {
    const authContainer = document.querySelector('.auth-container');
    authContainer.style.opacity = '0';
    authContainer.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        authContainer.style.transition = 'all 0.6s ease';
        authContainer.style.opacity = '1';
        authContainer.style.transform = 'translateY(0)';
    }, 100);
});

// Add CSS for idle warning modal
const idleWarningStyles = document.createElement('style');
idleWarningStyles.textContent = `
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
    
    #login-countdown-timer {
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
    
    #login-countdown-timer {
        animation: pulse 1s infinite;
    }
`;

document.head.appendChild(idleWarningStyles);

// Export functions for global access
window.switchForm = switchForm;
window.togglePassword = togglePassword;
window.closeModal = closeModal;

// Idle timeout functionality for login page
let loginIdleTimeout;
let loginIdleWarningTimeout;
let isLoginIdleWarningShown = false;
const LOGIN_IDLE_TIMEOUT_MINUTES = 10;
const LOGIN_IDLE_WARNING_MINUTES = 1;
const LOGIN_IDLE_TIMEOUT_MS = LOGIN_IDLE_TIMEOUT_MINUTES * 60 * 1000;
const LOGIN_IDLE_WARNING_MS = LOGIN_IDLE_WARNING_MINUTES * 60 * 1000;

// Function to reset login idle timer
function resetLoginIdleTimer() {
    if (loginIdleTimeout) {
        clearTimeout(loginIdleTimeout);
    }
    if (loginIdleWarningTimeout) {
        clearTimeout(loginIdleWarningTimeout);
    }
    
    if (isLoginIdleWarningShown) {
        hideLoginIdleWarning();
    }
    
    loginIdleWarningTimeout = setTimeout(() => {
        showLoginIdleWarning();
    }, LOGIN_IDLE_TIMEOUT_MS - LOGIN_IDLE_WARNING_MS);
    
    loginIdleTimeout = setTimeout(() => {
        performLoginIdleLogout();
    }, LOGIN_IDLE_TIMEOUT_MS);
}

// Function to show login idle warning
function showLoginIdleWarning() {
    isLoginIdleWarningShown = true;
    
    let warningModal = document.getElementById('login-idle-warning-modal');
    if (!warningModal) {
        warningModal = document.createElement('div');
        warningModal.id = 'login-idle-warning-modal';
        warningModal.className = 'modal show';
        warningModal.innerHTML = `
            <div class="modal-content idle-warning-content">
                <div class="modal-header">
                    <h2><i class="fas fa-exclamation-triangle"></i> Session Timeout Warning</h2>
                </div>
                <div class="modal-body">
                    <p>Your session will expire in <span id="login-countdown-timer">${LOGIN_IDLE_WARNING_MINUTES}:00</span> due to inactivity.</p>
                    <p>Click "Stay Logged In" to continue your session.</p>
                    <div class="warning-actions">
                        <button class="btn btn-primary" onclick="extendLoginSession()">
                            <i class="fas fa-clock"></i> Stay Logged In
                        </button>
                        <button class="btn btn-secondary" onclick="performLoginIdleLogout()">
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
    
    startLoginCountdown();
    
    warningModal.addEventListener('click', function(e) {
        if (e.target === warningModal) {
            e.stopPropagation();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isLoginIdleWarningShown) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
}

// Function to hide login idle warning
function hideLoginIdleWarning() {
    isLoginIdleWarningShown = false;
    const warningModal = document.getElementById('login-idle-warning-modal');
    if (warningModal) {
        warningModal.classList.remove('show');
    }
    stopLoginCountdown();
}

// Function to start login countdown timer
function startLoginCountdown() {
    let timeLeft = LOGIN_IDLE_WARNING_MINUTES * 60;
    
    const countdownInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const countdownElement = document.getElementById('login-countdown-timer');
        
        if (countdownElement) {
            countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
    
    window.loginCountdownInterval = countdownInterval;
}

// Function to stop login countdown timer
function stopLoginCountdown() {
    if (window.loginCountdownInterval) {
        clearInterval(window.loginCountdownInterval);
        window.loginCountdownInterval = null;
    }
}

// Function to extend login session
function extendLoginSession() {
    hideLoginIdleWarning();
    resetLoginIdleTimer();
    showModal('Session Extended', 'Your session has been extended. You will remain logged in.', 'success');
}

// Function to perform login idle logout
function performLoginIdleLogout() {
    hideLoginIdleWarning();
    
    if (loginIdleTimeout) {
        clearTimeout(loginIdleTimeout);
    }
    if (loginIdleWarningTimeout) {
        clearTimeout(loginIdleWarningTimeout);
    }
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('userEmail');
    
    showModal('Session Expired', 'You have been logged out due to inactivity.', 'error');
    
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

// Function to setup login idle timeout
function setupLoginIdleTimeout() {
    const activityEvents = [
        'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
    ];
    
    activityEvents.forEach(event => {
        document.addEventListener(event, resetLoginIdleTimer, true);
    });
    
    resetLoginIdleTimer();
}

// Export login idle timeout functions
window.extendLoginSession = extendLoginSession;
window.performLoginIdleLogout = performLoginIdleLogout;
window.resetLoginIdleTimer = resetLoginIdleTimer; 