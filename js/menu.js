/**
 * menu.js - Handles all menu-related functionality
 * - Dynamic menu rendering
 * - Category filtering
 * - Search functionality
 * - Rating system
 */

// Menu data - normally this would come from a backend API
const menuItems = [
    {
        id: 1,
        name: "Butter Chicken",
        category: "Main Course",
        price: 350,
        description: "Tender chicken cooked in a rich buttery tomato sauce with aromatic spices.",
        image: "images/dish1.jpg",
        ratings: [],
        averageRating: 0
    },
    {
        id: 2,
        name: "Paneer Tikka",
        category: "Starters",
        price: 250,
        description: "Chunks of paneer marinated in spices and grilled to perfection.",
        image: "images/dish2.jpg",
        ratings: [],
        averageRating: 0
    },
    {
        id: 3,
        name: "Veg Biryani",
        category: "Main Course",
        price: 300,
        description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices.",
        image: "images/dish3.jpg",
        ratings: [],
        averageRating: 0
    },
    {
        id: 4,
        name: "chocolate Cake",
        category: "Desserts",
        price: 150,
        description: "Decadent chocolate cake layered and topped with rich ganache.",
        image: "images/dish4.jpg",
        ratings: [],
        averageRating: 0
    },
    {
        id: 5,
        name: "cocktail",
        category: "Drinks",
        price: 120,
        description: "Refreshing beverages served chilled – from mocktails to signature drinks.",
        image: "images/dish5.jpg",
        ratings: [],
        averageRating: 0
    },
    {
        id: 6,
        name: "Chicken Biryani",
        category: "Main Course",
        price: 380,
        description: "Aromatic basmati rice cooked with tender chicken pieces and authentic spices.",
        image: "images/dish6.jpg",
        ratings: [],
        averageRating: 0
    },
    {
        id: 7,
        name: "South Indian Thali",
        category: "Main Course",
        price: 200,
        description: "Authentic flavorful South Indian Thali with seasonal curries and rice.",
        image: "images/dish7.jpg",
        ratings: [],
        averageRating: 0
    },
    {
        id: 8,
        name: "Chocolate Brownie",
        category: "Desserts",
        price: 180,
        description: "Rich chocolate brownie with a gooey center, served with vanilla ice cream.",
        image: "images/dish8.jpg",
        ratings: [],
        averageRating: 0
    }
];

// Versioning to ensure updated menu data overrides stale localStorage
const MENU_DATA_VERSION = "2";

// Initialize or refresh menu data in localStorage when data version changes
function initializeMenuData() {
    try {
        const storedVersion = localStorage.getItem('menuDataVersion');
        const storedItems = localStorage.getItem('menuItems');

        // If version changed OR items missing, write latest menuItems to storage
        if (storedVersion !== String(MENU_DATA_VERSION) || !storedItems) {
            localStorage.setItem('menuItems', JSON.stringify(menuItems));
            localStorage.setItem('menuDataVersion', String(MENU_DATA_VERSION));
            return menuItems;
        }

        // Otherwise, use stored items
        return JSON.parse(storedItems);
    } catch (e) {
        // Fallback if localStorage is inaccessible
        return menuItems;
    }
}

// Utility to force reset localStorage menu data
function resetMenuData() {
    try {
        localStorage.removeItem('menuItems');
        localStorage.removeItem('menuDataVersion');
    } catch (e) {
        // ignore
    }
    return initializeMenuData();
}

// Get menu items from localStorage
function getMenuItems() {
    return JSON.parse(localStorage.getItem('menuItems')) || initializeMenuData();
}

// Get unique categories from menu items
function getCategories() {
    const items = getMenuItems();
    const categories = [...new Set(items.map(item => item.category))];
    return categories;
}

// Render category filter buttons
function renderCategoryFilters() {
    const categories = getCategories();
    const filterContainer = document.getElementById('categoryFilter');
    
    if (!filterContainer) return;
    
    // Add "All" category
    let filtersHTML = `<button class="category-filter active" data-category="all">All</button>`;
    
    // Add each category as a button
    categories.forEach(category => {
        filtersHTML += `<button class="category-filter" data-category="${category}">${category}</button>`;
    });
    
    filterContainer.innerHTML = filtersHTML;
    
    // Add event listeners ONLY to filter buttons within the container
    filterContainer.querySelectorAll('button.category-filter').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterContainer.querySelectorAll('button.category-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter menu items
            const category = this.getAttribute('data-category');
            filterMenuItems(category);
        });
    });
}

// Filter menu items by category
function filterMenuItems(category) {
    const items = getMenuItems();
    const filteredItems = category === 'all' ? items : items.filter(item => item.category === category);
    renderMenuItems(filteredItems);
}

// Search menu items
function searchMenuItems(query) {
    const items = getMenuItems();
    const searchResults = items.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) || 
        item.description.toLowerCase().includes(query.toLowerCase())
    );
    renderMenuItems(searchResults);
}

// Render menu items to the page
function renderMenuItems(items) {
    const menuContainer = document.getElementById('menuContainer');
    
    if (!menuContainer) return;
    
    if (items.length === 0) {
        menuContainer.innerHTML = '<p class="no-results">No items found. Try a different search.</p>';
        return;
    }
    
    let menuHTML = '';
    
    items.forEach(item => {
        // Generate star rating HTML
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.round(item.averageRating)) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else {
                starsHTML += '<i class="far fa-star"></i>';
            }
        }
        
        menuHTML += `
            <div class="menu-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="menu-item-image">
                <div class="menu-item-info">
                    <h3 class="menu-item-title">${item.name}</h3>
                    <p class="menu-item-category">${item.category}</p>
                    <p class="menu-item-description">${item.description}</p>
                    <p class="menu-item-price">₹${item.price}</p>
                    <div class="menu-item-rating">
                        ${starsHTML}
                        <span>(${item.ratings.length} reviews)</span>
                    </div>
                    <div class="menu-item-actions">
                        <button class="add-to-cart-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
                            Add to Cart
                        </button>
                        <button class="rate-item-btn" data-id="${item.id}">Rate</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    menuContainer.innerHTML = menuHTML;
    
    // Add event listeners to Add to Cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            
            // Call addToCart function from cart.js
            window.addToCart({ id, name, price, quantity: 1 });
        });
    });
    
    // Add event listeners to Rate buttons
    document.querySelectorAll('.rate-item-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            showRatingModal(id);
        });
    });
}

// Show rating modal
function showRatingModal(itemId) {
    // Create modal if it doesn't exist
    if (!document.getElementById('ratingModal')) {
        const modalHTML = `
            <div id="ratingModal" class="modal">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h3>Rate this dish</h3>
                    <div class="rating-stars">
                        <i class="far fa-star" data-rating="1"></i>
                        <i class="far fa-star" data-rating="2"></i>
                        <i class="far fa-star" data-rating="3"></i>
                        <i class="far fa-star" data-rating="4"></i>
                        <i class="far fa-star" data-rating="5"></i>
                    </div>
                    <textarea id="reviewText" placeholder="Write your review (optional)"></textarea>
                    <button id="submitRating">Submit Rating</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listener to close button
        document.querySelector('#ratingModal .close-modal').addEventListener('click', function() {
            document.getElementById('ratingModal').style.display = 'none';
        });
        
        // Add event listeners to stars
        document.querySelectorAll('#ratingModal .rating-stars i').forEach(star => {
            star.addEventListener('mouseover', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                highlightStars(rating);
            });
            
            star.addEventListener('mouseout', function() {
                resetStars();
            });
            
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                selectRating(rating);
            });
        });
    }
    
    // Reset modal state
    document.getElementById('reviewText').value = '';
    resetStars();
    // Clear any previously selected rating
    const ratingStarsContainer = document.querySelector('#ratingModal .rating-stars');
    if (ratingStarsContainer) {
        ratingStarsContainer.setAttribute('data-selected-rating', '0');
    }
    
    // Store the item ID in the modal
    document.getElementById('ratingModal').setAttribute('data-item-id', itemId);
    
    // Show the modal
    document.getElementById('ratingModal').style.display = 'block';
    
    // Remove existing event listener to prevent duplicates
    const submitBtn = document.getElementById('submitRating');
    const newSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
    
    // Add event listener to submit button
    newSubmitBtn.addEventListener('click', function() {
        const itemId = parseInt(document.getElementById('ratingModal').getAttribute('data-item-id'));
        const ratingStars = document.querySelector('#ratingModal .rating-stars');
        const selectedRatingStr = ratingStars ? ratingStars.getAttribute('data-selected-rating') : '0';
        const selectedRating = parseInt(selectedRatingStr || '0');

        if (!selectedRating || isNaN(selectedRating)) {
            alert('Please select a rating before submitting');
            return;
        }

        const review = document.getElementById('reviewText').value;
        
        submitRating(itemId, selectedRating, review);
        document.getElementById('ratingModal').style.display = 'none';
    });
}

// Highlight stars on hover
function highlightStars(rating) {
    document.querySelectorAll('#ratingModal .rating-stars i').forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
}

// Reset stars to default state
function resetStars() {
    const ratingStars = document.querySelector('#ratingModal .rating-stars');
    const selectedRating = ratingStars ? parseInt(ratingStars.getAttribute('data-selected-rating') || '0') : 0;

    document.querySelectorAll('#ratingModal .rating-stars i').forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= selectedRating) {
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
        }
        if (starRating === selectedRating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
}

// Select a rating
function selectRating(rating) {
    const ratingStars = document.querySelector('#ratingModal .rating-stars');
    if (ratingStars) {
        ratingStars.setAttribute('data-selected-rating', String(rating));
    }
    document.querySelectorAll('#ratingModal .rating-stars i').forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        // Fill stars up to selected rating
        if (starRating <= rating) {
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
        }
        // Only mark the clicked star as selected
        if (starRating === rating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
}

// Submit a rating
function submitRating(itemId, rating, review) {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Please log in to rate dishes.');
        return;
    }
    
    // Get menu items
    const items = getMenuItems();
    
    // Find the item
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return;
    
    // Add the rating
    const newRating = {
        userId: currentUser.id,
        username: currentUser.username,
        rating: rating,
        review: review,
        date: new Date().toISOString()
    };
    
    items[itemIndex].ratings.push(newRating);
    
    // Calculate average rating
    const ratings = items[itemIndex].ratings.map(r => r.rating);
    const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    items[itemIndex].averageRating = averageRating;
    
    // Save to localStorage
    localStorage.setItem('menuItems', JSON.stringify(items));
    
    // Re-render menu items
    renderMenuItems(items);
    
    // Show success message
    alert('Thank you for your rating!');
}

// Initialize menu page
function initMenuPage() {
    // Ensure localStorage reflects latest menu data
    initializeMenuData();
    // Initialize menu data
    initializeMenuData();
    
    // Render category filters
    renderCategoryFilters();
    
    // Set up search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query === '') {
                filterMenuItems('all');
            } else {
                searchMenuItems(query);
            }
        });
    }
    
    // Initial render of all menu items
    const items = getMenuItems();
    renderMenuItems(items);
}

// Export functions for use in other files
window.menu = {
    initMenuPage,
    getMenuItems,
    renderMenuItems,
    searchMenuItems,
    filterMenuItems,
    resetMenuData
};

// Initialize menu page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.menu-page')) {
        console.log("Menu page loaded");
        initMenuPage();
    }
});