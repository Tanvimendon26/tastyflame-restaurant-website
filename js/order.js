/**
 * order.js - Handles all order-related functionality
 * - Process orders
 * - Order history
 * - Generate invoice
 */

// Update existing orders to remove pending status
function updateExistingOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = orders.map(order => {
        if (order.status === 'Pending') {
            order.status = order.paymentMode === 'cash' ? 'Cash on Delivery' : 'Paid via UPI';
        }
        return order;
    });
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
}

// Initialize order functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update existing orders first
    updateExistingOrders();
    
    // Add event listeners for order-related buttons
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const generateBillBtn = document.getElementById('generateBillBtn');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', showOrderConfirmation);
    }
    
    if (generateBillBtn) {
        generateBillBtn.addEventListener('click', generateInvoice);
    }
    
    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', function() {
            const customerInfo = {
                name: document.getElementById('customerName').value,
                email: document.getElementById('customerEmail').value,
                phone: document.getElementById('customerPhone').value,
                address: document.getElementById('customerAddress').value
            };
            
            placeOrder(customerInfo);
            document.getElementById('confirmationModal').style.display = 'none';
            document.getElementById('successModal').style.display = 'block';
        });
    }
    
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', function() {
            document.getElementById('confirmationModal').style.display = 'none';
        });
    }
    
    // Render order history
    renderOrderHistory();
});

// Initialize orders in localStorage if not already present
function initializeOrders() {
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
    return JSON.parse(localStorage.getItem('orders'));
}

// Place a new order
function placeOrder(customerInfo, paymentMode = 'cash') {
    const cart = window.cart.getCartItems();
    
    if (cart.length === 0) {
        return { success: false, message: 'Your cart is empty!' };
    }
    
    // Set status based on payment mode
    const orderStatus = paymentMode === 'cash' ? 'Cash on Delivery' : 'Paid via UPI';
    
    // Create order object
    const order = {
        id: generateOrderId(),
        items: cart,
        customerInfo: customerInfo,
        date: new Date().toISOString(),
        total: window.cart.calculateCartTotal().total,
        status: orderStatus,
        paymentMode: paymentMode
    };
    
    // Get orders from localStorage
    const orders = initializeOrders();
    
    // Add new order
    orders.push(order);
    
    // Save orders to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    window.cart.clearCart();
    
    // Show notification
    showNotification('Order placed successfully!', 'success');
    
    return { success: true, message: 'Order placed successfully!', orderId: order.id };
}

// Generate a unique order ID
function generateOrderId() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.floor(Math.random() * 2176782336).toString(36).toUpperCase().slice(0,4); // up to 36^6
    return `TF-${ts}-${rand}`;
}

// Get all orders
function getUserOrders() {
    const orders = initializeOrders();
    return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Get order by ID
function getOrderById(orderId) {
    const orders = initializeOrders();
    return orders.find(order => order.id === orderId);
}

// Render order history
function renderOrderHistory() {
    const orderHistoryContainer = document.getElementById('orderHistory');
    
    if (!orderHistoryContainer) return;
    
    const orders = getUserOrders();
    
    if (orders.length === 0) {
        orderHistoryContainer.innerHTML = '<p class="no-orders">You have no previous orders.</p>';
        return;
    }
    
    let orderHistoryHTML = '';
    
    orders.forEach(order => {
        // Format date
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString();
        
        // Get item names
        const itemNames = order.items.map(item => `${item.name} x${item.quantity}`).join(', ');
        
        orderHistoryHTML += `
            <div class="order-card" data-id="${order.id}">
                <div class="order-header">
                    <h3>Order #${order.id}</h3>
                    <span class="order-date">${formattedDate}</span>
                </div>
                <div class="order-details">
                    <p><strong>Items:</strong> ${itemNames}</p>
                    <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
                    <p><strong>Status:</strong> <span class="order-status">${order.status}</span></p>
                </div>
                <div class="order-actions">
                    <button class="view-order-btn" data-id="${order.id}">View Details</button>
                    <button class="generate-invoice-btn" data-id="${order.id}">Generate Invoice</button>
                </div>
            </div>
        `;
    });
    
    orderHistoryContainer.innerHTML = orderHistoryHTML;
    
    // Add event listeners to view order buttons
    document.querySelectorAll('.view-order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            showOrderDetails(orderId);
        });
    });
    
    // Add event listeners to generate invoice buttons
    document.querySelectorAll('.generate-invoice-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            generateInvoice(orderId);
        });
    });
}

// Show order details modal
function showOrderDetails(orderId) {
    const order = getOrderById(orderId);
    
    if (!order) return;
    
    // Format date
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString();
    
    // Create modal if it doesn't exist
    if (!document.getElementById('orderModal')) {
        const modalHTML = `
            <div id="orderModal" class="modal">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div id="orderModalContent"></div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listener to close button (scoped to order details modal)
        const detailsCloseBtn = document.querySelector('#orderModal .close-modal');
        if (detailsCloseBtn) {
            detailsCloseBtn.addEventListener('click', function() {
                document.getElementById('orderModal').style.display = 'none';
            });
        }
    }
    
    // Generate items HTML
    let itemsHTML = '';
    
    order.items.forEach(item => {
        itemsHTML += `
            <div class="order-detail-item">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">x${item.quantity}</span>
                <span class="item-price">₹${item.price}</span>
                <span class="item-total">₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    });
    
    // Generate order details HTML
    const orderDetailsHTML = `
        <h2>Order #${order.id}</h2>
        <div class="order-info">
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Status:</strong> ${order.status}</p>
        </div>
        <div class="customer-details">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${order.customerInfo.name}</p>
            <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
            <p><strong>Address:</strong> ${order.customerInfo.address}</p>
        </div>
        <div class="order-items-details">
            <h3>Order Items</h3>
            <div class="order-items-header">
                <span>Item</span>
                <span>Quantity</span>
                <span>Price</span>
                <span>Total</span>
            </div>
            ${itemsHTML}
        </div>
        <div class="order-total">
            <h3>Total: ₹${order.total.toFixed(2)}</h3>
        </div>
        <button id="generateInvoiceBtn" class="btn-primary">Generate Invoice</button>
    `;
    
    // Set modal content
    document.getElementById('orderModalContent').innerHTML = orderDetailsHTML;
    
    // Add event listener to generate invoice button
    document.getElementById('generateInvoiceBtn').addEventListener('click', function() {
        generateInvoice(orderId);
    });
    
    // Show modal
    document.getElementById('orderModal').style.display = 'block';
}

// Generate invoice for order or from cart
function generateInvoice(orderId) {
    try {
        // Check if jsPDF is available
        if (typeof jspdf === 'undefined') {
            showNotification('PDF generation library not loaded. Please try again later.', 'error');
            return;
        }
        
        let items, customerInfo, total, invoiceId;
        
        if (orderId) {
            // Generate invoice for existing order
            const order = getOrderById(orderId);
            if (!order) {
                showNotification('Order not found', 'error');
                return;
            }
            
            items = order.items;
            customerInfo = order.customerInfo;
            total = order.total;
            invoiceId = order.id;
        } else {
            // Generate invoice from current cart
            items = window.cart.getCartItems();
            if (items.length === 0) {
                showNotification('Your cart is empty', 'error');
                return;
            }
            
            // Get customer info from form
            customerInfo = {
                name: document.getElementById('customerName').value || 'Guest',
                email: document.getElementById('customerEmail').value || 'guest@example.com',
                phone: document.getElementById('customerPhone').value || 'N/A',
                address: document.getElementById('customerAddress').value || 'N/A'
            };
            
            // Calculate total
            const cartTotal = window.cart.calculateCartTotal();
            total = cartTotal.total;
            invoiceId = 'DRAFT-' + Date.now().toString().slice(-6);
        }
        
        // Create new PDF document
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add restaurant logo and info
        doc.setFontSize(22);
        doc.setTextColor(33, 33, 33);
        doc.text('TastyFlame Restaurant', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('123 Flavor Street, Foodville', 105, 30, { align: 'center' });
        doc.text('Cuisine City, Food State - 123456', 105, 35, { align: 'center' });
        doc.text('Phone: +91 9876543210', 105, 40, { align: 'center' });
        
        // Add invoice title
        doc.setFontSize(18);
        doc.setTextColor(33, 33, 33);
        doc.text('INVOICE', 105, 55, { align: 'center' });
        
        // Add order info
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString() + ' ' + currentDate.toLocaleTimeString();
        
        doc.setFontSize(12);
        doc.text(`Invoice #: ${invoiceId}`, 20, 70);
        doc.text(`Date: ${formattedDate}`, 20, 77);
        
        // Add customer info
        doc.setFontSize(14);
        doc.text('Customer Information', 20, 90);
        
        doc.setFontSize(12);
        doc.text(`Name: ${customerInfo.name}`, 20, 100);
        doc.text(`Email: ${customerInfo.email}`, 20, 107);
        doc.text(`Phone: ${customerInfo.phone}`, 20, 114);
        doc.text(`Address: ${customerInfo.address}`, 20, 121);
        
        // Add order items
        doc.setFontSize(14);
        doc.text('Order Items', 20, 137);
        
        // Add table headers
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Item', 20, 147);
        doc.text('Quantity', 100, 147);
        doc.text('Price', 130, 147);
        doc.text('Total', 170, 147);
        
        // Add table rows
        doc.setTextColor(33, 33, 33);
        let y = 157;
        
        items.forEach(item => {
            doc.text(item.name, 20, y);
            doc.text(item.quantity.toString(), 100, y);
            doc.text(`₹${item.price.toFixed(2)}`, 130, y);
            doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 170, y);
            y += 10;
        });
        
        // Add total
        doc.setLineWidth(0.5);
        doc.line(20, y, 190, y);
        y += 10;
        
        doc.setFontSize(14);
        doc.text('Total:', 130, y);
        doc.text(`₹${total.toFixed(2)}`, 170, y);
        
        // Add footer
        y += 30;
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Thank you for your order!', 105, y, { align: 'center' });
        
        // Save PDF
        doc.save(`TastyFlame_Invoice_${invoiceId}.pdf`);
        
        // Show success notification
        showNotification('Invoice generated successfully', 'success');
    } catch (error) {
        console.error('Error generating invoice:', error);
        showNotification('Failed to generate invoice. Please try again.', 'error');
    }
}

// Show order confirmation modal
function showOrderConfirmation(orderData) {
    // Validate cart and customer info before showing modal
    const cart = window.cart.getCartItems();
    if (!cart || cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    const customerInfo = {
        name: document.getElementById('customerName').value.trim(),
        email: document.getElementById('customerEmail').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
        address: document.getElementById('customerAddress').value.trim()
    };
    const validation = validateCustomerInfo(customerInfo);
    if (!validation.valid) {
        showNotification(validation.errors.join('\n'), 'error');
        return;
    }
    // Create modal if it doesn't exist
    if (!document.getElementById('confirmationModal')) {
        const modalHTML = `
            <div id="confirmationModal" class="modal">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div class="confirmation-content">
                        <h2>Order Confirmation</h2>
                        <p>Are you sure you want to place this order?</p>
                        <div id="confirmationDetails" class="confirmation-details"></div>
                        <div class="confirmation-actions">
                            <button id="confirmOrderBtn" class="btn-primary">Confirm Order</button>
                            <button id="cancelOrderBtn" class="btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listener to close button (scoped to confirmation modal)
        const confCloseBtn = document.querySelector('#confirmationModal .close-modal');
        if (confCloseBtn) {
            confCloseBtn.addEventListener('click', function() {
                document.getElementById('confirmationModal').style.display = 'none';
            });
        }
    }
    
    // Generate confirmation details HTML
    let detailsHTML = '<h3>Order Items:</h3><ul>';
    
    cart.forEach(item => {
        detailsHTML += `<li>${item.name} x ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}</li>`;
    });
    
    detailsHTML += '</ul>';
    const cartTotal = window.cart.calculateCartTotal();
    detailsHTML += `<p><strong>Subtotal:</strong> ₹${cartTotal.subtotal.toFixed(2)}</p>`;
    detailsHTML += `<p><strong>Discount:</strong> ₹${cartTotal.discount.toFixed(2)}</p>`;
    detailsHTML += `<p><strong>Total:</strong> ₹${cartTotal.total.toFixed(2)}</p>`;
    detailsHTML += `<div class="confirm-customer">
        <h4>Customer Info</h4>
        <p><strong>Name:</strong> ${customerInfo.name}</p>
        <p><strong>Email:</strong> ${customerInfo.email}</p>
        <p><strong>Phone:</strong> ${customerInfo.phone}</p>
        <p><strong>Address:</strong> ${customerInfo.address}</p>
    </div>`;
    
    // Set confirmation details
    document.getElementById('confirmationDetails').innerHTML = detailsHTML;
    
    // Show modal
    document.getElementById('confirmationModal').style.display = 'block';
    
    // Add event listener to confirm button
    document.getElementById('confirmOrderBtn').addEventListener('click', function() {
        const paymentMode = document.getElementById('paymentMode').value;
        if (paymentMode === 'upi') {
            // Show payment modal for UPI
            showPaymentModal(function() {
                const result = placeOrder(customerInfo, 'upi');
                if (result.success) {
                    document.getElementById('confirmationModal').style.display = 'none';
                    showOrderSuccess(result.orderId);
                } else {
                    showNotification(result.message || 'Failed to place order', 'error');
                }
            }, function() {
                showNotification('Payment cancelled', 'error');
            });
        } else {
            // Process cash on delivery
            const result = placeOrder(customerInfo, 'cash');
            if (result.success) {
                document.getElementById('confirmationModal').style.display = 'none';
                showOrderSuccess(result.orderId);
            } else {
                showNotification(result.message || 'Failed to place order', 'error');
            }
        }
    });
    
    // Add event listener to cancel button
    document.getElementById('cancelOrderBtn').addEventListener('click', function() {
        document.getElementById('confirmationModal').style.display = 'none';
    });
}

// Show order success modal
function showOrderSuccess(orderId) {
    // Create modal if it doesn't exist
    if (!document.getElementById('successModal')) {
        const modalHTML = `
            <div id="successModal" class="modal">
                <div class="modal-content success-modal">
                    <span class="close-modal">&times;</span>
                    <div class="success-content">
                        <i class="fas fa-check-circle"></i>
                        <h2>Order Placed Successfully!</h2>
                        <p>Your order has been confirmed.</p>
                        <p>Order ID: <strong id="successOrderId"></strong></p>
                        <div class="success-actions">
                            <button id="viewOrderBtn" class="btn-primary">View Order</button>
                            <button id="continueShoppingBtn" class="btn-secondary">Continue Shopping</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listener to close button
        document.querySelector('#successModal .close-modal').addEventListener('click', function() {
            document.getElementById('successModal').style.display = 'none';
        });
    }
    
    // Set order ID
    document.getElementById('successOrderId').textContent = orderId;
    
    // Show modal
    document.getElementById('successModal').style.display = 'block';
    
    // Add event listener to view order button
    document.getElementById('viewOrderBtn').addEventListener('click', function() {
        document.getElementById('successModal').style.display = 'none';
        showOrderDetails(orderId);
    });
    
    // Add event listener to continue shopping button
    document.getElementById('continueShoppingBtn').addEventListener('click', function() {
        document.getElementById('successModal').style.display = 'none';
        window.location.href = 'menu.html';
    });
}

// Show success modal
function showSuccessModal(orderId) {
    const modal = document.getElementById('successModal');
    const orderIdSpan = document.getElementById('successOrderId');
    
    if (modal && orderIdSpan) {
        orderIdSpan.textContent = orderId;
        modal.style.display = 'block';
    }
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

// Validate customer information (required fields)
function validateCustomerInfo(info){
    const errors = [];
    if (!info.name) errors.push('Name is required');
    if (!info.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) errors.push('Valid email is required');
    if (!info.phone || !/^\d{10}$/.test(info.phone)) errors.push('Valid 10-digit phone number is required');
    if (!info.address) errors.push('Delivery address is required');
    return { valid: errors.length === 0, errors };
}

// Simulated payment modal (placeholder gateway)
function showPaymentModal(onSuccess, onCancel){
    if (!document.getElementById('paymentModal')){
        const modal = document.createElement('div');
        modal.id = 'paymentModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>UPI Payment</h2>
                <div class="upi-details">
                    <p><strong>UPI ID:</strong> restaurant@upi</p>
                    <p>Please complete the payment using your UPI app and click "Payment Done" below.</p>
                </div>
                <div class="modal-buttons">
                    <button id="payNowBtn" class="btn">Payment Done</button>
                    <button id="cancelPaymentBtn" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close-modal').addEventListener('click', function(){
            document.getElementById('paymentModal').style.display = 'none';
            if (onCancel) onCancel();
        });
        modal.querySelector('#cancelPaymentBtn').addEventListener('click', function(){
            document.getElementById('paymentModal').style.display = 'none';
            if (onCancel) onCancel();
        });
        modal.querySelector('#payNowBtn').addEventListener('click', function(){
            document.getElementById('paymentModal').style.display = 'none';
            if (onSuccess) onSuccess();
        });
    }
    document.getElementById('paymentModal').style.display = 'block';
}



// Initialize order functionality
function initOrder() {
    // Initialize orders in localStorage
    initializeOrders();
    
    // If on orders page, set up order form
    if (document.querySelector('.orders-page')) {
        const orderForm = document.getElementById('orderForm');
        
        if (orderForm) {
            orderForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get customer info
                const name = document.getElementById('customerName').value;
                const phone = document.getElementById('customerPhone').value;
                const address = document.getElementById('customerAddress').value;
                
                // Validate form
                if (!name || !phone || !address) {
                    showNotification('Please fill in all fields!', 'error');
                    return;
                }
                
                // Show order confirmation
                showOrderConfirmation({ name, phone, address });
            });
        }
        
        // Add event listeners for order-related buttons
        const generateBillBtn = document.getElementById('generateBillBtn');
        const confirmOrderBtn = document.getElementById('confirmOrderBtn');
        const cancelOrderBtn = document.getElementById('cancelOrderBtn');
        const closeSuccessBtn = document.getElementById('closeSuccessBtn');
        
        if (generateBillBtn) {
            generateBillBtn.addEventListener('click', generateInvoice);
        }
        
        if (cancelOrderBtn) {
            cancelOrderBtn.addEventListener('click', function() {
                document.getElementById('confirmationModal').style.display = 'none';
            });
        }
        
        // Close only the nearest modal when clicking on the X button
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });
        // Close success modal via its Close button if present
        if (closeSuccessBtn) {
            closeSuccessBtn.addEventListener('click', function(){
                const modal = document.getElementById('successModal');
                if (modal) modal.style.display = 'none';
            });
        }
        
        // Render order history
        renderOrderHistory();
    }
}

// Export functions for use in other files
window.order = {
    initOrder,
    placeOrder,
    getUserOrders,
    getOrderById,
    renderOrderHistory,
    generateInvoice
};

// Initialize order when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initOrder();
});