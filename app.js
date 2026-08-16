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

// --- 4. AUTHENTICATION MODAL LOGIC (Bulletproof Delegation) ---
function initAuthModal() {
    const authModal = document.getElementById('authModal');
    const closeBtn = document.getElementById('closeAuthBtn');

    if (!authModal) return;

    // Event delegation ensures inner icons/text of auth-trigger work instantly
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.auth-trigger');
        if (trigger) {
            e.preventDefault();
            e.stopPropagation();
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    // Close Modal
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
                googleBtn.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" class="social-icon"> Continue with Google';
            }
        });
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
            btn.classList.add('bg-success');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('bg-success');
            }, 2000);
        });
    });
}

function updateCartBadges(count) {
    const headerBadge = document.getElementById('headerCartCount');
    const bottomBadge = document.getElementById('bottomCartCount');
    
    if (headerBadge) {
        headerBadge.innerText = count;
        if(count > 0) animatePulse(headerBadge);
    }
    if (bottomBadge) {
        bottomBadge.innerText = count;
        if(count > 0) animatePulse(bottomBadge);
    }
}

function animatePulse(element) {
    element.classList.remove('pulse-anim');
    void element.offsetWidth;
    element.classList.add('pulse-anim');
}

// --- 6. TABS & ACCORDIONS ---
function initTabsAndAccordions() {
    const tabLinks = document.querySelectorAll('.dash-nav-item, .pill-btn, .switch-tab-btn');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if(this.hasAttribute('data-tab') || this.hasAttribute('data-target')) {
                e.preventDefault();
                const targetId = this.getAttribute('data-tab') || this.getAttribute('data-target');
                
                document.querySelectorAll('.dash-tab-content').forEach(tc => {
                    tc.classList.add('hidden');
                    tc.classList.remove('active');
                });
                document.querySelectorAll('.dash-nav-item').forEach(nl => nl.classList.remove('active'));
                
                const targetTab = document.getElementById(`tab-${targetId}`);
                if(targetTab) {
                    targetTab.classList.remove('hidden');
                    targetTab.classList.add('active');
                }
                
                if(this.classList.contains('dash-nav-item')) {
                    this.classList.add('active');
                } else {
                    const matchingNav = document.querySelector(`.dash-nav-item[data-tab="${targetId}"]`);
                    if(matchingNav) matchingNav.classList.add('active');
                }
            }
        });
    });

    const accHeaders = document.querySelectorAll('.accordion-header');
    accHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const item = this.parentElement;
            if (item.classList.contains('active')) {
                item.classList.remove('active');
            } else {
                const siblings = item.parentElement.querySelectorAll('.accordion-item');
                siblings.forEach(sib => sib.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });
}

// --- 7. LOADERS & DUMMY DATA INJECTION ---
function initLoadersAndData() {
    const trendingGrid = document.getElementById('homeTrendingGrid') || document.getElementById('trendingPageGrid');
    const allProductGrid = document.getElementById('allProductGrid');
    
    const demoProducts = [
        { id: 101, name: 'Premium Leather Wallet', price: '₹1,299', mrp: '₹2,499', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80', cat: 'Accessories', badge: 'Trending' },
        { id: 102, name: 'Noise-Canceling Earbuds', price: '₹2,499', mrp: '₹4,999', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80', cat: 'Gadgets', badge: 'Hot' },
        { id: 103, name: 'Classic Polo T-Shirt', price: '₹899', mrp: '₹1,499', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80', cat: 'Apparel', badge: '' },
        { id: 104, name: 'Luxury Gift Hamper', price: '₹3,499', mrp: '₹5,000', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80', cat: 'Gifts', badge: 'New' }
    ];

    if (trendingGrid) {
        setTimeout(() => {
            renderProducts(demoProducts.slice(0,4), trendingGrid);
        }, 1200);
    }

    if (allProductGrid) {
        setTimeout(() => {
            renderProducts(demoProducts, allProductGrid);
            const totalCount = document.getElementById('totalProductsCount');
            if(totalCount) totalCount.innerText = demoProducts.length;
        }, 1500);
    }
}

function renderProducts(products, container) {
    let html = '';
    products.forEach(p => {
        let badgeHtml = p.badge ? `<div class="product-badge pulse-anim">${p.badge}</div>` : '';
        html += `
            <div class="product-card glass-card hover-lift" onclick="window.location.href='product-detail.html?id=${p.id}'">
                <div class="product-img-box">
                    <img src="${p.image}" alt="${p.name}" loading="lazy">
                    ${badgeHtml}
                </div>
                <div class="product-info">
                    <span class="product-cat text-muted text-small uppercase-text">${p.cat}</span>
                    <h4 class="product-name font-bold mt-5">${p.name}</h4>
                    <div class="product-price-row flex-between align-center mt-10">
                        <div class="price-stack">
                            <span class="current-price font-bold">${p.price}</span>
                            ${p.mrp ? `<span class="mrp-price text-muted line-through text-small ml-5">${p.mrp}</span>` : ''}
                        </div>
                        <button class="btn-icon-square add-cart-btn tooltip-wrapper hover-lift" aria-label="Add to Cart" onclick="event.stopPropagation();">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.style.opacity = '0';
    setTimeout(() => {
        container.innerHTML = html;
        container.style.transition = 'opacity 0.5s ease';
        container.style.opacity = '1';
        initCartLogic();
    }, 300);
}

// --- 8. MOBILE MENU LOGIC (Redirects to shop page smoothly) ---
function initMobileMenu() {
    document.addEventListener('click', (e) => {
        const menuToggle = e.target.closest('.menu-toggle');
        if (menuToggle) {
            e.preventDefault();
            window.location.href = 'shop.html';
        }
    });
}
