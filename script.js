

/**
 * script.js - Main JavaScript file for TastyFlame Restaurant
 * Initializes all modules and implements theme toggle functionality
 */

// Theme toggle functionality
function initThemeToggle() {
    // Check if theme preference exists in localStorage
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply theme to body
    document.body.classList.toggle('dark-theme', currentTheme === 'dark');
    
    // Create theme toggle button if it doesn't exist
    if (!document.getElementById('themeToggle')) {
        const themeToggleHTML = `
            <div id="themeToggle" class="theme-toggle">
                <i class="fas fa-sun"></i>
                <i class="fas fa-moon"></i>
            </div>
        `;
        
        document.querySelector('.navbar').insertAdjacentHTML('beforeend', themeToggleHTML);
        
        // Add event listener to theme toggle button
        document.getElementById('themeToggle').addEventListener('click', function() {
            // Toggle theme
            document.body.classList.toggle('dark-theme');
            
            // Save theme preference to localStorage
            const newTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            
            // Update theme toggle button
            updateThemeToggleButton();
        });
    }
    
    // Update theme toggle button
    updateThemeToggleButton();
}

// Update theme toggle button based on current theme
function updateThemeToggleButton() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) return;
    
    const isDarkTheme = document.body.classList.contains('dark-theme');
    
    // Update active icon
    themeToggle.querySelector('.fa-sun').style.opacity = isDarkTheme ? 0.5 : 1;
    themeToggle.querySelector('.fa-moon').style.opacity = isDarkTheme ? 1 : 0.5;
}

// Initialize contact form validation
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;
        
        // Validate form
        let isValid = true;
        let errorMessage = '';
        
        if (!name) {
            isValid = false;
            errorMessage = 'Please enter your name.';
        } else if (!email) {
            isValid = false;
            errorMessage = 'Please enter your email.';
        } else if (!validateEmail(email)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        } else if (!message) {
            isValid = false;
            errorMessage = 'Please enter your message.';
        }
        
        if (!isValid) {
            showNotification(errorMessage, 'error');
            return;
        }
        
        // Simulate form submission (in a real app, this would send data to a server)
        showNotification('Your message has been sent successfully!', 'success');
        
        // Reset form
        contactForm.reset();
    });
}

// Validate email format
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    if (!document.getElementById('notification')) {
        const notificationHTML = `
            <div id="notification" class="notification"></div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', notificationHTML);
    }
    
    const notification = document.getElementById('notification');
    
    // Set notification content and type
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    notification.style.display = 'block';
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Initialize all functionality
function init() {
    // Initialize theme toggle
    initThemeToggle();
    
    // Initialize contact form validation
    initContactForm();
    
    // Add auth container to navbar if it doesn't exist
    if (!document.getElementById('authContainer') && document.querySelector('.navbar')) {
        const authContainerHTML = `
            <div id="authContainer" class="auth-container"></div>
        `;
        
        document.querySelector('.navbar').insertAdjacentHTML('beforeend', authContainerHTML);
    }
    
    // Update active nav link
    updateActiveNavLink();
}

// Update active nav link based on current page
function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        
        if (link.getAttribute('href') === currentPage || 
            (currentPage === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
});
