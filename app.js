// =========================================
// MK PRIME CONNECT - MAIN JAVASCRIPT LOGIC
// =========================================

// --- 1. SUPABASE INITIALIZATION ---
// (Aapki backend details yahan connect ho rahi hain)
const supabaseUrl = 'https://lqwgtqtulhifavzidykh.supabase.co';
const supabaseKey = 'sb_publishable_chUtpCFjxVDIvbTXNnteyA_Vo0K5USw';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// DOM Load hone ka wait karo
document.addEventListener('DOMContentLoaded', () => {
    initAuthModal();
    loadTrendingProducts();
});

// --- 2. AUTHENTICATION MODAL LOGIC ---
function initAuthModal() {
    const authModal = document.getElementById('authModal');
    const closeBtn = document.getElementById('closeAuthBtn');
    const authTriggers = document.querySelectorAll('.auth-trigger'); // Dono Sign In buttons (Top & Bottom)

    // Modal Open Karne ka function
    authTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Background scroll band karne ke liye
        });
    });

    // Modal Close Karne ka function
    const closeModal = () => {
        authModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Scroll wapas chalu
    };

    // Close button (X) par click
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Modal box ke bahar click karne par band karna
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeModal();
        }
    });

    // --- 3. GOOGLE LOGIN INTEGRATION ---
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            
            // Supabase Google OAuth Call
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            
            if (error) {
                console.error('Google Login Error:', error.message);
                alert('Login failed. Please try again.');
                googleBtn.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Logo"> Continue with Google';
            }
        });
    }
}

// --- 4. LOAD TRENDING PRODUCTS (Demo Data) ---
// (Baad mein ye data hum Supabase Admin Panel se fetch karenge)
function loadTrendingProducts() {
    const grid = document.getElementById('trendingProductGrid');
    if (!grid) return;

    // Loading animation ke baad products dikhane ke liye delay (Premium feel)
    setTimeout(() => {
        const dummyProducts = [
            { id: 1, name: 'Premium Leather Wallet', price: '₹1,299', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80', category: 'Accessories' },
            { id: 2, name: 'Noise-Canceling Earbuds', price: '₹2,499', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80', category: 'Gadgets' },
            { id: 3, name: 'Classic Polo T-Shirt', price: '₹899', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80', category: 'Apparel' },
            { id: 4, name: 'Luxury Gift Hamper', price: '₹3,499', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80', category: 'Gifts' }
        ];

        let html = '';
        dummyProducts.forEach(product => {
            html += `
                <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
                    <div class="product-img-box">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="product-badge">Trending</div>
                    </div>
                    <div class="product-info">
                        <span class="product-cat">${product.category}</span>
                        <h4 class="product-name">${product.name}</h4>
                        <div class="product-price-row">
                            <span class="product-price">${product.price}</span>
                            <button class="add-to-cart-btn" onclick="event.stopPropagation(); alert('Item added to your Cart!')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }, 800); // 0.8 sec loading time
}
