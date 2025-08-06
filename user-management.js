// User Management System
class UserManager {
    constructor() {
        this.currentUser = null;
        this.users = [
            {
                id: 'admin',
                username: 'admin',
                password: 'admin123',
                email: 'admin@loadshare.com',
                role: 'admin',
                name: 'Administrator'
            },
            {
                id: 'mudassir',
                username: 'mudassir',
                password: 'mudassir123',
                email: 'mudassir@loadshare.net',
                role: 'admin',
                name: 'Mudassir'
            },
            {
                id: 'user1',
                username: 'user1',
                password: 'user123',
                email: 'user1@loadshare.com',
                role: 'user',
                name: 'Regular User'
            },
            {
                id: 'manager1',
                username: 'manager1',
                password: 'manager123',
                email: 'manager1@loadshare.com',
                role: 'manager',
                name: 'Manager User'
            }
        ];
        
        this.init();
    }
    
    init() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUI();
        } else {
            // Don't automatically show login modal - let the main authentication system handle it
            // this.showLoginModal();
        }
    }
    
    showLoginModal() {
        // Create login modal if it doesn't exist
        if (!document.getElementById('login-modal')) {
            const modalHTML = `
                <div id="login-modal" class="modal show">
                    <div class="modal-content login-modal-content">
                        <div class="modal-header">
                            <h2><i class="fas fa-sign-in-alt"></i> Login</h2>
                            <button class="close-btn" onclick="userManager.hideLoginModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form class="login-form" onsubmit="userManager.login(event)">
                                <div class="form-group">
                                    <label for="login-email">Email</label>
                                    <input type="email" id="login-email" required placeholder="Enter your email">
                                </div>
                                <div class="form-group">
                                    <label for="login-password">Password</label>
                                    <input type="password" id="login-password" required placeholder="Enter your password">
                                </div>
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-sign-in-alt"></i> Login
                                    </button>
                                </div>
                            </form>
                            <div class="demo-accounts">
                                <h4>Demo Accounts:</h4>
                                <div class="demo-account">Admin: admin@loadshare.com / admin123</div>
                                <div class="demo-account">Mudassir: mudassir@loadshare.net / mudassir123</div>
                                <div class="demo-account">Manager: manager1@loadshare.com / manager123</div>
                                <div class="demo-account">User: user1@loadshare.com / user123</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }
    
    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('show');
            // If we're hiding the login modal and there's no user, redirect to main login page
            if (!this.currentUser) {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            }
        }
    }
    
    login(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.hideLoginModal();
            this.updateUI();
            showNotification('Login Successful', `Welcome back, ${user.name}!`, 'success');
        } else {
            showNotification('Login Failed', 'Invalid email or password. Please try again.', 'error');
        }
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        // Don't show login modal - redirect to main login page instead
        showNotification('Logout', 'You have been logged out successfully. Redirecting to login page...', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
    
    updateUI() {
        const userInfo = document.querySelector('.user-name');
        const logoutBtn = document.querySelector('.logout-btn');
        
        if (this.currentUser) {
            userInfo.innerHTML = `Welcome, ${this.currentUser.name} <span class="user-role ${this.currentUser.role}">${this.currentUser.role}</span>`;
            logoutBtn.style.display = 'flex';
        } else {
            userInfo.textContent = 'Welcome, Guest';
            logoutBtn.style.display = 'none';
        }
    }
    
    // Permission methods
    canAdd() {
        return this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'manager');
    }
    
    canEdit() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
    
    canDelete() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
    
    canExport() {
        return this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'manager');
    }
    
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
    
    isManager() {
        return this.currentUser && this.currentUser.role === 'manager';
    }
    
    isUser() {
        return this.currentUser && this.currentUser.role === 'user';
    }
}

// Initialize user manager
const userManager = new UserManager();

// Global logout function
function logout() {
    if (userManager) {
        userManager.logout();
    } else {
        // Fallback logout
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userEmail');
        
        showNotification('Logout', 'You have been logged out successfully. Redirecting to login page...', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
} 