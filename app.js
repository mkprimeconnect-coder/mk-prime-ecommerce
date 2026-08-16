/* ================================================================
   MK PRIME CONNECT - MAIN FRONTEND JAVASCRIPT ENGINE (app.js)
   ================================================================ */

// --- 1. SUPABASE INITIALIZATION ---
const supabaseUrl = 'https://lqwgtqtulhifavzidykh.supabase.co';
const supabaseKey = 'sb_publishable_chUtpCFjxVDIvbTXNnteyA_Vo0K5USw';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- 2. GLOBAL EVENT LISTENER ---
document.addEventListener('DOMContentLoaded', () => {
    initScrollEffects();
    initAuthModal();
    initCartLogic();
    initTabsAndAccordions();
    initLoadersAndData();
    initMobileMenu();
    checkAuthStatus(); // Check if user is already logged in
});

// --- 3. SCROLL EFFECTS & GLASSMORPHISM ---
function initScrollEffects() {
    const header = document.getElementById('mainHeader');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            if (header) header.classList.add('scrolled');
        } else {
            if (header) header.classList.remove('scrolled');
        }
    });

    const bobbingElements = document.querySelectorAll('.bobbing-anim');
    bobbingElements.forEach(el => {
        el.style.animationPlayState = 'running';
    });
}

// --- 4. AUTHENTICATION & SUPABASE LOGIN LOGIC ---
function initAuthModal() {
    const authModal = document.getElementById('authModal');
    const closeBtn = document.getElementById('closeAuthBtn');

    if (!authModal) return;

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.auth-trigger');
        if (trigger) {
            e.preventDefault();
            e.stopPropagation();
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    const closeModal = () => {
        authModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeModal();
        }
    });

    // Google Login Trigger
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting to Google...';
            try {
                const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                if (error) throw error;
            } catch (error) {
                console.error('Google Login Error:', error.message);
                alert('Secure login failed. Please try again.');
                googleBtn.innerHTML = '<i class="fab fa-google" style="color: #ea4335;"></i> Continue with Google';
            }
        });
    }
}

// Real Email Login / Signup using Supabase
async function handleEmailLogin(event) {
    event.preventDefault();
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');

    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    // Try logging in first
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });

    // If account doesn't exist, automatically sign them up!
    if (error) {
        const signUpRes = await supabase.auth.signUp({ email, password });
        if (signUpRes.error) {
            alert('Authentication Error: ' + signUpRes.error.message);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        } else {
            alert('Account created successfully! Welcome to MK Prime Connect.');
        }
    } else {
        alert('Login Successful! Welcome back.');
    }

    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    window.location.href = 'dashboard.html';
}

// Check Session on page load
async function checkAuthStatus() {
    const { data: { session } } = await supabase.auth.getSession();
    const authBtn = document.getElementById('headerAuthBtn');
    
    if (session && authBtn) {
        authBtn.innerHTML = '<i class="fas fa-user-shield"></i> Dashboard';
        authBtn.onclick = () => window.location.href = 'dashboard.html';
        authBtn.classList.remove('auth-trigger');
    }
}

// --- 5. CART & BADGE LOGIC ---
function initCartLogic() {
    let cartCount = localStorage.getItem('mkPrimeCartCount') || 0;
    updateCartBadges(cartCount);

    const addCartBtns = document.querySelectorAll('.add-cart-btn, .add-to-cart-btn');
    addCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            cartCount++;
            localStorage.setItem('mkPrimeCartCount', cartCount);
            updateCartBadges(cartCount);
            
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Added';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        });
    });
}

function updateCartBadges(count) {
    const headerBadge = document.getElementById('headerCartCount');
    const bottomBadge = document.getElementById('bottomCartCount');
    
    if (headerBadge) headerBadge.innerText = count;
    if (bottomBadge) bottomBadge.innerText = count;
}

// --- 6. TABS & ACCORDIONS ---
function initTabsAndAccordions() {
    const tabLinks = document.querySelectorAll('.dash-nav-item, .pill-btn');
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if(this.hasAttribute('data-tab')) {
                e.preventDefault();
                const targetId = this.getAttribute('data-tab');
                document.querySelectorAll('.dash-tab-content').forEach(tc => tc.classList.add('hidden'));
                const targetTab = document.getElementById(`tab-${targetId}`);
                if(targetTab) targetTab.classList.remove('hidden');
            }
        });
    });

    const accHeaders = document.querySelectorAll('.accordion-header');
    accHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const item = this.parentElement;
            item.classList.toggle('active');
        });
    });
}

// --- 7. LOADERS & DUMMY DATA ---
function initLoadersAndData() {
    const trendingGrid = document.getElementById('homeTrendingGrid');
    const demoProducts = [
        { id: 101, name: 'Premium Leather Wallet', price: '₹1,299', mrp: '₹2,499', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80', cat: 'Accessories', badge: 'Trending' },
        { id: 102, name: 'Noise-Canceling Earbuds', price: '₹2,499', mrp: '₹4,999', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80', cat: 'Gadgets', badge: 'Hot' },
        { id: 103, name: 'Classic Polo T-Shirt', price: '₹899', mrp: '₹1,499', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80', cat: 'Apparel', badge: '' },
        { id: 104, name: 'Luxury Gift Hamper', price: '₹3,499', mrp: '₹5,000', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80', cat: 'Gifts', badge: 'New' }
    ];

    if (trendingGrid) {
        setTimeout(() => {
            let html = '';
            demoProducts.slice(0,4).forEach(p => {
                html += `
                    <div class="product-card glass-card hover-lift" onclick="window.location.href='product-detail.html?id=${p.id}'">
                        <div class="product-img-box">
                            <img src="${p.image}" alt="${p.name}" loading="lazy">
                        </div>
                        <div class="product-info">
                            <span class="product-cat text-muted text-small uppercase-text">${p.cat}</span>
                            <h4 class="product-name font-bold mt-5">${p.name}</h4>
                            <div class="product-price-row flex-between align-center mt-10">
                                <span class="current-price font-bold">${p.price}</span>
                                <button class="btn-icon-square add-cart-btn"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                    </div>
                `;
            });
            trendingGrid.innerHTML = html;
            initCartLogic();
        }, 1000);
    }
}

// --- 8. MOBILE MENU ---
function initMobileMenu() {
    document.addEventListener('click', (e) => {
        const menuToggle = e.target.closest('.menu-toggle');
        if (menuToggle) {
            e.preventDefault();
            window.location.href = 'shop.html';
        }
    });
}
