// Auth Form Handler
class AuthForm {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.signupForm = document.getElementById('signupForm');
        this.loginFormElement = document.getElementById('loginFormElement');
        this.signupFormElement = document.getElementById('signupFormElement');
        this.switchToSignup = document.getElementById('switchToSignup');
        this.switchToLogin = document.getElementById('switchToLogin');
        
        this.init();
    }

    init() {
        // Form switching
        this.switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchForms('signup');
        });

        this.switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchForms('login');
        });

        // Form submissions
        this.loginFormElement.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        this.signupFormElement.addEventListener('submit', (e) => this.handleSignupSubmit(e));

        // Password visibility toggles
        this.setupPasswordToggles();

        // Real-time password strength indicator
        const signupPassword = document.getElementById('signupPassword');
        signupPassword.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));

        // Real-time validation
        this.setupRealTimeValidation();
    }

    switchForms(formType) {
        if (formType === 'signup') {
            this.loginForm.classList.remove('active');
            this.signupForm.classList.add('active');
            this.signupFormElement.reset();
            this.clearAllErrors();
        } else {
            this.signupForm.classList.remove('active');
            this.loginForm.classList.add('active');
            this.loginFormElement.reset();
            this.clearAllErrors();
        }
    }

    setupPasswordToggles() {
        const toggles = document.querySelectorAll('.password-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = toggle.getAttribute('data-target');
                const input = document.getElementById(targetId);
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                toggle.textContent = isPassword ? '🙈' : '👁️';
            });
        });
    }

    setupRealTimeValidation() {
        // Login email validation
        document.getElementById('loginEmail').addEventListener('blur', (e) => {
            this.validateEmail(e.target.value, 'loginEmailError', e.target);
        });

        // Login password validation
        document.getElementById('loginPassword').addEventListener('blur', (e) => {
            this.validateLoginPassword(e.target.value, 'loginPasswordError', e.target);
        });

        // Signup name validation
        document.getElementById('signupName').addEventListener('blur', (e) => {
            this.validateName(e.target.value, 'signupNameError', e.target);
        });

        // Signup email validation
        document.getElementById('signupEmail').addEventListener('blur', (e) => {
            this.validateEmail(e.target.value, 'signupEmailError', e.target);
        });

        // Signup password validation
        document.getElementById('signupPassword').addEventListener('blur', (e) => {
            this.validateSignupPassword(e.target.value, 'signupPasswordError', e.target);
        });

        // Signup confirm password validation
        document.getElementById('signupConfirmPassword').addEventListener('blur', (e) => {
            this.validateConfirmPassword(e.target.value, 'signupConfirmPasswordError', e.target);
        });
    }

    validateEmail(email, errorId, inputElement) {
        const errorElement = document.getElementById(errorId);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim()) {
            errorElement.textContent = 'Email is required';
            inputElement.classList.add('error');
            return false;
        } else if (!emailRegex.test(email)) {
            errorElement.textContent = 'Please enter a valid email address';
            inputElement.classList.add('error');
            return false;
        } else {
            errorElement.textContent = '';
            inputElement.classList.remove('error');
            return true;
        }
    }

    validateName(name, errorId, inputElement) {
        const errorElement = document.getElementById(errorId);

        if (!name.trim()) {
            errorElement.textContent = 'Full name is required';
            inputElement.classList.add('error');
            return false;
        } else if (name.trim().length < 2) {
            errorElement.textContent = 'Name must be at least 2 characters';
            inputElement.classList.add('error');
            return false;
        } else {
            errorElement.textContent = '';
            inputElement.classList.remove('error');
            return true;
        }
    }

    validateLoginPassword(password, errorId, inputElement) {
        const errorElement = document.getElementById(errorId);

        if (!password) {
            errorElement.textContent = 'Password is required';
            inputElement.classList.add('error');
            return false;
        } else if (password.length < 8) {
            errorElement.textContent = 'Password must be at least 8 characters';
            inputElement.classList.add('error');
            return false;
        } else {
            errorElement.textContent = '';
            inputElement.classList.remove('error');
            return true;
        }
    }

    validateSignupPassword(password, errorId, inputElement) {
        const errorElement = document.getElementById(errorId);
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (!password) {
            errorElement.textContent = 'Password is required';
            inputElement.classList.add('error');
            return false;
        } else if (password.length < 8) {
            errorElement.textContent = 'Password must be at least 8 characters';
            inputElement.classList.add('error');
            return false;
        } else if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            errorElement.textContent = 'Password must contain uppercase, lowercase, and numbers';
            inputElement.classList.add('error');
            return false;
        } else {
            errorElement.textContent = '';
            inputElement.classList.remove('error');
            return true;
        }
    }

    validateConfirmPassword(confirmPassword, errorId, inputElement) {
        const errorElement = document.getElementById(errorId);
        const password = document.getElementById('signupPassword').value;

        if (!confirmPassword) {
            errorElement.textContent = 'Please confirm your password';
            inputElement.classList.add('error');
            return false;
        } else if (confirmPassword !== password) {
            errorElement.textContent = 'Passwords do not match';
            inputElement.classList.add('error');
            return false;
        } else {
            errorElement.textContent = '';
            inputElement.classList.remove('error');
            return true;
        }
    }

    updatePasswordStrength(password) {
        const strengthElement = document.getElementById('passwordStrength');
        const strengthMeter = document.getElementById('strengthMeter');
        const strengthText = document.getElementById('strengthText');

        if (!password) {
            strengthElement.classList.remove('visible');
            return;
        }

        strengthElement.classList.add('visible');

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        const length = password.length;

        let strength = 0;
        if (length >= 8) strength++;
        if (hasUpperCase) strength++;
        if (hasLowerCase) strength++;
        if (hasNumber) strength++;
        if (hasSpecialChar) strength++;

        // Remove previous classes
        strengthMeter.classList.remove('weak', 'fair', 'strong');
        strengthText.classList.remove('weak', 'fair', 'strong');

        if (strength <= 2) {
            strengthMeter.classList.add('weak');
            strengthText.classList.add('weak');
            strengthText.textContent = 'Weak';
        } else if (strength <= 3) {
            strengthMeter.classList.add('fair');
            strengthText.classList.add('fair');
            strengthText.textContent = 'Fair';
        } else {
            strengthMeter.classList.add('strong');
            strengthText.classList.add('strong');
            strengthText.textContent = 'Strong';
        }
    }

    clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        const inputElements = document.querySelectorAll('.form-group input');

        errorElements.forEach(el => el.textContent = '');
        inputElements.forEach(el => el.classList.remove('error'));
    }

    handleLoginSubmit(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Validate all fields
        const emailValid = this.validateEmail(email, 'loginEmailError', document.getElementById('loginEmail'));
        const passwordValid = this.validateLoginPassword(password, 'loginPasswordError', document.getElementById('loginPassword'));

        if (emailValid && passwordValid) {
            // Store in localStorage (simple persistence)
            const user = {
                email: email,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('shopEaseUser', JSON.stringify(user));
            
            // Show success message (you can enhance this later with a proper notification)
            alert('Welcome back! You are now signed in.');
            
            // Redirect to home page
            window.location.href = 'index.html';
        }
    }

    handleSignupSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        // Validate all fields
        const nameValid = this.validateName(name, 'signupNameError', document.getElementById('signupName'));
        const emailValid = this.validateEmail(email, 'signupEmailError', document.getElementById('signupEmail'));
        const passwordValid = this.validateSignupPassword(password, 'signupPasswordError', document.getElementById('signupPassword'));
        const confirmPasswordValid = this.validateConfirmPassword(confirmPassword, 'signupConfirmPasswordError', document.getElementById('signupConfirmPassword'));

        if (nameValid && emailValid && passwordValid && confirmPasswordValid) {
            // Store user data in localStorage (simple persistence)
            const user = {
                name: name,
                email: email,
                password: password, // Note: In production, never store plain passwords!
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('shopEaseUser', JSON.stringify(user));
            
            // Show success message
            alert('Account created successfully! Welcome to ShopEase!');
            
            // Redirect to home page
            window.location.href = 'index.html';
        }
    }
}

// Initialize auth form when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AuthForm();
});
