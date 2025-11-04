/**
 * cart.js - Handles all cart-related functionality
 * - Add to cart
 * - Update quantity
 * - Remove from cart
 * - Calculate total
 * - Apply coupon codes
 * - Persist cart in localStorage
 */

// Initialize cart in localStorage if not already present
function initializeCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    return JSON.parse(localStorage.getItem('cart'));
}

// Get cart items from localStorage
function getCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || initializeCart();
}

// Add item to cart
function addToCart(item) {
    const cart = getCartItems();
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex !== -1) {
        // Update quantity if item already exists
        cart[existingItemIndex].quantity += item.quantity;
    } else {
        // Add new item to cart
        cart.push(item);
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showNotification(`${item.name} added to cart!`);
    
    // If on orders page, render cart items
    if (document.querySelector('.orders-page')) {
        renderCartItems();
    }
}

// Update item quantity in cart
function updateCartItemQuantity(id, quantity) {
    const cart = getCartItems();
    
    // Find the item
    const itemIndex = cart.findIndex(item => item.id === id);
    
    if (itemIndex === -1) return;
    
    // Update quantity
    if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        removeFromCart(id);
    } else {
        cart[itemIndex].quantity = quantity;
        
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // If on orders page, render cart items
        if (document.querySelector('.orders-page')) {
            renderCartItems();
        }
    }
}

// Remove item from cart
function removeFromCart(id) {
    const cart = getCartItems();
    
    // Filter out the item
    const updatedCart = cart.filter(item => item.id !== id);
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Update cart count
    updateCartCount();
    
    // If on orders page, render cart items
    if (document.querySelector('.orders-page')) {
        renderCartItems();
    }
}

// Clear cart
function clearCart() {
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartCount();
    
    // If on orders page, render cart items
    if (document.querySelector('.orders-page')) {
        renderCartItems();
    }
}

// Calculate cart total
function calculateCartTotal() {
    const cart = getCartItems();
    
    // Calculate subtotal
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Get applied coupon
    const appliedCoupon = localStorage.getItem('appliedCoupon');
    let discount = 0;
    
    if (appliedCoupon) {
        const coupon = JSON.parse(appliedCoupon);
        discount = (subtotal * coupon.discountPercentage) / 100;
    }
    
    // Calculate total
    const total = subtotal - discount;
    
    return {
        subtotal: subtotal,
        discount: discount,
        total: total
    };
}

// Update cart count in navbar
function updateCartCount() {
    const cart = getCartItems();
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
    
    // Update cart count in navbar
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        
        // Show/hide cart count badge
        if (cartCount > 0) {
            cartCountElement.style.display = 'inline-block';
        } else {
            cartCountElement.style.display = 'none';
        }
    }
}

// Apply coupon code
function applyCoupon(code) {
    // Define available coupons
    const availableCoupons = [
        { code: 'WELCOME10', discountPercentage: 10 },
        { code: 'TASTY20', discountPercentage: 20 },
        { code: 'FLAME15', discountPercentage: 15 }
    ];
    
    // Find the coupon
    const coupon = availableCoupons.find(coupon => coupon.code === code);
    
    if (!coupon) {
        showNotification('Invalid coupon code!', 'error');
        return false;
    }
    
    // Save applied coupon to localStorage
    localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
    
    // Show success message
    showNotification(`Coupon applied! ${coupon.discountPercentage}% discount`, 'success');
    
    // If on orders page, render cart items
    if (document.querySelector('.orders-page')) {
        renderCartItems();
    }
    
    return true;
}

// Remove applied coupon
function removeCoupon() {
    localStorage.removeItem('appliedCoupon');
    
    // Show message
    showNotification('Coupon removed!', 'info');
    
    // If on orders page, render cart items
    if (document.querySelector('.orders-page')) {
        renderCartItems();
    }
}

// Render cart items on orders page
function renderCartItems() {
    const orderItemsContainer = document.getElementById('orderItems');
    
    if (!orderItemsContainer) return;
    
    const cart = getCartItems();
    
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty. <a href="menu.html">Go to Menu</a></p>';
        
        // Hide order form
        const orderForm = document.querySelector('.customer-info');
        if (orderForm) {
            orderForm.style.display = 'none';
        }
        
        // Hide coupon form
        const couponForm = document.querySelector('.coupon-form');
        if (couponForm) {
            couponForm.style.display = 'none';
        }
        
        // Update total
        updateOrderTotal();
        
        return;
    }
    
    // Show order form
    const orderForm = document.querySelector('.customer-info');
    if (orderForm) {
        orderForm.style.display = 'block';
    }
    
    // Show coupon form
    const couponForm = document.querySelector('.coupon-form');
    if (couponForm) {
        couponForm.style.display = 'block';
    }
    
    let cartHTML = '';
    
    cart.forEach(item => {
        cartHTML += `
            <div class="order-item" data-id="${item.id}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">₹${item.price}</p>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn decrease">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                    <button class="quantity-btn increase">+</button>
                </div>
                <div class="item-total">
                    <p>₹${item.price * item.quantity}</p>
                </div>
                <button class="remove-item-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    orderItemsContainer.innerHTML = cartHTML;
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const orderItem = this.closest('.order-item');
            const id = parseInt(orderItem.getAttribute('data-id'));
            const quantityInput = orderItem.querySelector('.quantity-input');
            const currentQuantity = parseInt(quantityInput.value);
            
            if (currentQuantity > 1) {
                quantityInput.value = currentQuantity - 1;
                updateCartItemQuantity(id, currentQuantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.quantity-btn.increase').forEach(button => {
        button.addEventListener('click', function() {
            const orderItem = this.closest('.order-item');
            const id = parseInt(orderItem.getAttribute('data-id'));
            const quantityInput = orderItem.querySelector('.quantity-input');
            const currentQuantity = parseInt(quantityInput.value);
            
            quantityInput.value = currentQuantity + 1;
            updateCartItemQuantity(id, currentQuantity + 1);
        });
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const orderItem = this.closest('.order-item');
            const id = parseInt(orderItem.getAttribute('data-id'));
            const quantity = parseInt(this.value);
            
            if (quantity >= 1) {
                updateCartItemQuantity(id, quantity);
            } else {
                this.value = 1;
                updateCartItemQuantity(id, 1);
            }
        });
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderItem = this.closest('.order-item');
            const id = parseInt(orderItem.getAttribute('data-id'));
            
            removeFromCart(id);
        });
    });
    
    // Update order total
    updateOrderTotal();
}

// Update order total on orders page
function updateOrderTotal() {
    const totalElement = document.getElementById('total');
    const subtotalElement = document.getElementById('subtotal');
    const discountElement = document.getElementById('discount');
    
    if (!totalElement) return;
    
    const { subtotal, discount, total } = calculateCartTotal();
    
    if (subtotalElement) {
        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    }
    
    if (discountElement) {
        discountElement.textContent = discount > 0 ? `-₹${discount.toFixed(2)}` : '₹0.00';
        
        // Show/hide discount row
        const discountRow = document.querySelector('.summary-row.discount');
        if (discountRow) {
            discountRow.style.display = discount > 0 ? 'flex' : 'none';
        }
    }
    
    totalElement.textContent = `₹${total.toFixed(2)}`;
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

// Initialize cart functionality
function initCart() {
    // Initialize cart in localStorage
    initializeCart();
    
    // Update cart count in navbar
    updateCartCount();
    
    // Add event listeners for cart-related buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-to-cart')) {
            const menuItem = event.target.closest('.menu-item');
            if (menuItem) {
                const id = parseInt(menuItem.dataset.id);
                const name = menuItem.querySelector('.menu-item-title').textContent;
                const price = parseFloat(menuItem.querySelector('.menu-item-price').textContent.replace('₹', ''));
                
                // Create item object
                const item = {
                    id: id,
                    name: name,
                    price: price,
                    quantity: 1
                };
                
                addToCart(item);
            }
        }
    });
    
    // If on orders page, render cart items
    if (document.querySelector('.orders-page')) {
        renderCartItems();
        
        // Set up coupon form
        const couponForm = document.getElementById('couponForm');
        if (couponForm) {
            couponForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const couponInput = document.getElementById('couponCode');
                const couponCode = couponInput.value.trim();
                
                if (couponCode) {
                    const success = applyCoupon(couponCode);
                    
                    if (success) {
                        couponInput.value = '';
                    }
                }
            });
        }
        
        // Set up remove coupon button
        const removeCouponBtn = document.getElementById('removeCoupon');
        if (removeCouponBtn) {
            removeCouponBtn.addEventListener('click', function() {
                removeCoupon();
            });
        }
    }
}

// Export functions for use in other files
window.addToCart = addToCart;
window.cart = {
    initCart,
    getCartItems,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    calculateCartTotal,
    applyCoupon,
    removeCoupon
};

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initCart();
});