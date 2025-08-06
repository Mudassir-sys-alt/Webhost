# Role-Based Access Control (RBAC) Implementation

## Overview

This implementation provides role-based access control for the bike inventory management system. Users are assigned different roles with specific permissions, ensuring that only authorized users can perform certain actions.

## User Roles and Permissions

### 1. Admin Role
- **Username:** `admin@loadshare.com`
- **Password:** `admin123`
- **Permissions:**
  - ✅ Add new bikes
  - ✅ Edit existing bikes
  - ✅ Delete bikes
  - ✅ Export data
  - ✅ View all inventory
  - ✅ Search and filter

### 2. Mudassir (Admin Role) ⭐
- **Username:** `mudassir@loadshare.net`
- **Password:** `mudassir123`
- **Permissions:**
  - ✅ Add new bikes
  - ✅ Edit existing bikes
  - ✅ Delete bikes
  - ✅ Export data
  - ✅ View all inventory
  - ✅ Search and filter

### 3. Manager Role
- **Username:** `manager1@loadshare.com`
- **Password:** `manager123`
- **Permissions:**
  - ✅ Add new bikes
  - ✅ Edit existing bikes
  - ❌ Delete bikes (restricted to admin only)
  - ✅ Export data
  - ✅ View all inventory
  - ✅ Search and filter

### 4. User Role
- **Username:** `user1@loadshare.com`
- **Password:** `user123`
- **Permissions:**
  - ❌ Add new bikes
  - ❌ Edit existing bikes
  - ❌ Delete bikes
  - ❌ Export data
  - ✅ View all inventory
  - ✅ Search and filter

## Key Features

### 🔐 Authentication System
- **Login Modal:** Automatically appears when no user is logged in
- **Session Management:** Uses localStorage to persist login state
- **Logout Functionality:** Clears session and returns to login

### 🛡️ Permission-Based UI
- **Dynamic Button States:** Edit/Delete buttons are disabled for unauthorized users
- **Visual Feedback:** Role badges displayed next to user name
- **Access Denied Messages:** Clear notifications when permissions are insufficient

### 📊 Role Indicators
- **Admin:** Red badge with "ADMIN" label
- **Manager:** Orange badge with "MANAGER" label  
- **User:** Gray badge with "USER" label

## Technical Implementation

### Files Modified

1. **user-management.js** (New)
   - User authentication and role management
   - Permission checking methods
   - Session handling

2. **dashboard-script.js** (Modified)
   - Integrated permission checks in bike management functions
   - Updated UI to respect user roles
   - Added access control to export functionality

3. **dashboard.html** (Modified)
   - Added user-management.js script reference

4. **dashboard-styles.css** (Modified)
   - Added login modal styles
   - Role badge styling
   - Disabled button states

### Core Functions

```javascript
// Permission checking methods
userManager.canAdd()     // Check if user can add bikes
userManager.canEdit()    // Check if user can edit bikes
userManager.canDelete()  // Check if user can delete bikes
userManager.canExport()  // Check if user can export data

// Role checking methods
userManager.isAdmin()    // Check if user is admin
userManager.isManager()  // Check if user is manager
userManager.isUser()     // Check if user is regular user
```

### Permission Matrix

| Action | Admin | Manager | User |
|--------|-------|---------|------|
| Add Bike | ✅ | ✅ | ❌ |
| Edit Bike | ✅ | ✅ | ❌ |
| Delete Bike | ✅ | ❌ | ❌ |
| Export Data | ✅ | ✅ | ❌ |
| View Inventory | ✅ | ✅ | ✅ |
| Search & Filter | ✅ | ✅ | ✅ |

## Testing the Implementation

### Quick Test Steps

1. **Open the application:**
   ```
   Open dashboard.html in your browser
   ```

2. **Test Admin Access (mudassir@loadshare.net):**
   ```
   Email: mudassir@loadshare.net
   Password: mudassir123
   ```
   - Should see red "ADMIN" badge
   - All buttons should be enabled
   - Can perform all actions

3. **Test Manager Access:**
   ```
   Email: manager1@loadshare.com
   Password: manager123
   ```
   - Should see orange "MANAGER" badge
   - Delete buttons should be disabled
   - Can add, edit, and export

4. **Test User Access:**
   ```
   Email: user1@loadshare.com
   Password: user123
   ```
   - Should see gray "USER" badge
   - All action buttons should be disabled
   - Can only view and search

### Test Page

Open `role-test.html` for a comprehensive overview of all permissions and testing instructions.

## Security Considerations

### Current Implementation
- **Client-side authentication:** For demonstration purposes
- **Role-based UI:** Prevents unauthorized actions through UI
- **Session persistence:** Uses localStorage

### Production Recommendations
- **Server-side authentication:** Implement proper backend authentication
- **JWT tokens:** Use secure token-based authentication
- **API protection:** Secure all endpoints with proper authorization
- **HTTPS:** Ensure all communications are encrypted
- **Input validation:** Validate all user inputs server-side

## Customization

### Adding New Users

To add a new user, modify the `users` array in `user-management.js`:

```javascript
{
    id: 'newuser',
    username: 'newuser',
    password: 'password123',
    email: 'newuser@loadshare.com',
    role: 'admin', // or 'manager' or 'user'
    name: 'New User'
}
```

### Adding New Permissions

1. Add a new permission method in `UserManager` class:
```javascript
canCustomAction() {
    return this.currentUser && this.currentUser.role === 'admin';
}
```

2. Use the permission check in your functions:
```javascript
function customAction() {
    if (!userManager.canCustomAction()) {
        showNotification('Access Denied', 'Insufficient permissions.', 'error');
        return;
    }
    // Perform action
}
```

## Troubleshooting

### Common Issues

1. **Login modal not appearing:**
   - Clear browser localStorage
   - Refresh the page

2. **Buttons not updating:**
   - Check browser console for JavaScript errors
   - Ensure user-management.js is loaded before dashboard-script.js

3. **Permissions not working:**
   - Verify user role is correctly set
   - Check that permission methods are being called

### Debug Mode

Add this to browser console to check current user:
```javascript
console.log(userManager.currentUser);
console.log('Can edit:', userManager.canEdit());
console.log('Can delete:', userManager.canDelete());
```

## Support

For any issues or questions regarding the role-based access control implementation, please refer to the test page (`role-test.html`) or check the browser console for error messages. 