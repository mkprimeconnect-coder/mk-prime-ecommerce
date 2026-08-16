/* ================================================================
   MK PRIME CONNECT - ADMIN BACKEND ENGINE (admin.js)
   ================================================================ */

// --- 1. SUPABASE & CLOUDINARY CONFIG ---
const supabaseUrl = 'https://lqwgtqtulhifavzidykh.supabase.co';
const supabaseKey = 'sb_publishable_chUtpCFjxVDIvbTXNnteyA_Vo0K5USw';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Cloudinary Details
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/f7ym0acs/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'mkprime_preset';

// --- 2. GLOBAL EVENT LISTENER ---
document.addEventListener('DOMContentLoaded', () => {
    initAdminAuth();
    initAdminTabs();
    initProductUpload();
});

// --- 3. ADMIN AUTHENTICATION (Login / Logout) ---
function initAdminAuth() {
    const loginForm = document.getElementById('adminLoginForm');
    const loginOverlay = document.getElementById('adminLoginOverlay');
    const dashboardLayout = document.getElementById('adminDashboardLayout');
    const logoutBtn = document.getElementById('adminLogoutBtn');

    // Check if already logged in
    if (localStorage.getItem('mkPrimeAdminAuth') === 'true') {
        if (loginOverlay) loginOverlay.classList.add('hidden');
        if (dashboardLayout) dashboardLayout.classList.remove('hidden');
        fetchDashboardData();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            const btn = document.getElementById('adminLoginBtn');

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

            if (email === 'admin@mkprime.com' && password === 'admin123') {
                setTimeout(() => {
                    localStorage.setItem('mkPrimeAdminAuth', 'true');
                    if (loginOverlay) loginOverlay.classList.add('hidden');
                    if (dashboardLayout) dashboardLayout.classList.remove('hidden');
                    fetchDashboardData();
                    btn.innerHTML = 'Login to Dashboard <i class="fas fa-lock"></i>';
                }, 800);
            } else {
                alert('Invalid Admin Credentials! (Hint: admin@mkprime.com / admin123)');
                btn.innerHTML = 'Login to Dashboard <i class="fas fa-lock"></i>';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('mkPrimeAdminAuth');
            window.location.reload();
        });
    }
}

// --- 4. ADMIN TABS & SIDEBAR LOGIC ---
function initAdminTabs() {
    const navItems = document.querySelectorAll('.admin-nav-item');
    const panels = document.querySelectorAll('.admin-panel');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.id === 'adminLogoutBtn') return;
            e.preventDefault();

            navItems.forEach(nav => nav.classList.remove('active'));
            panels.forEach(panel => {
                panel.classList.add('hidden');
                panel.classList.remove('active');
            });

            this.classList.add('active');
            const targetId = this.getAttribute('data-target');
            const targetPanel = document.getElementById(targetId);
            
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                targetPanel.classList.add('active');
                
                if (targetId === 'panel-products') fetchAllProducts();
                if (targetId === 'panel-orders') fetchAllOrders();
            }
        });
    });
}

// --- 5. PRODUCT UPLOAD SYSTEM (Supabase + Cloudinary) ---
function initProductUpload() {
    const addProductForm = document.getElementById('addProductForm');
    const imageInput = document.getElementById('prodImageFile');

    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('uploadProductBtn');
            const file = imageInput ? imageInput.files[0] : null;

            if (!file) {
                alert('Please select a product image first.');
                return;
            }

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading Image...';
            btn.disabled = true;

            try {
                // STEP 1: Upload to Cloudinary
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

                const cloudRes = await fetch(CLOUDINARY_URL, {
                    method: 'POST',
                    body: formData
                });
                const cloudData = await cloudRes.json();
                
                if (!cloudData.secure_url) throw new Error('Image upload failed');
                const imageUrl = cloudData.secure_url;

                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving to Database...';

                // STEP 2: Save Details to Supabase
                const productData = {
                    title: document.getElementById('prodTitle').value,
                    price: parseFloat(document.getElementById('prodPrice').value),
                    stock: parseInt(document.getElementById('prodStock').value),
                    category: document.getElementById('prodCategory').value,
                    image_url: imageUrl
                };

                const { error } = await supabase
                    .from('products')
                    .insert([productData]);

                if (error) throw error;

                alert('Product successfully published! 🎉');
                addProductForm.reset();
                
                // Switch back to Products list
                const productsNav = document.querySelector('[data-target="panel-products"]');
                if (productsNav) productsNav.click();

            } catch (error) {
                console.error('Upload Error:', error);
                alert('Error uploading product: ' + error.message);
            } finally {
                btn.innerHTML = 'Publish Product';
                btn.disabled = false;
            }
        });
    }
}

// --- 6. DATA FETCHING ---
async function fetchDashboardData() {
    setTimeout(() => {
        const rev = document.getElementById('kpiRevenue');
        const ord = document.getElementById('kpiOrders');
        const pen = document.getElementById('kpiPending');
        const pro = document.getElementById('kpiProducts');

        if (rev) rev.innerText = '₹45,290';
        if (ord) ord.innerText = '12';
        if (pen) pen.innerText = '3';
        if (pro) pro.innerText = '24';
        
        const tbody = document.getElementById('dashboardRecentOrders');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td class="font-bold">#MK-8923</td>
                    <td>Rahul Sharma</td>
                    <td>₹2,499</td>
                    <td><span class="status-badge status-processing">Processing</span></td>
                    <td><button class="btn-text text-accent">View</button></td>
                </tr>
            `;
        }
    }, 800);
}

async function fetchAllProducts() {
    const tbody = document.getElementById('adminProductsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading Products...</td></tr>';

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No products found. Add your first product!</td></tr>';
            return;
        }

        let html = '';
        data.forEach(p => {
            html += `
                <tr>
                    <td><img src="${p.image_url}" class="admin-table-img" alt="Img" style="width:40px; height:40px; object-fit:cover; border-radius:6px;"></td>
                    <td class="font-bold">${p.title}</td>
                    <td class="uppercase-text text-small">${p.category}</td>
                    <td class="font-bold text-accent">₹${p.price}</td>
                    <td>${p.stock}</td>
                    <td>
                        <button class="btn-icon-square hover-lift" title="Edit"><i class="fas fa-edit"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (error) {
        console.error('Error fetching products:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading products from database.</td></tr>';
    }
}

async function fetchAllOrders() {
    const tbody = document.getElementById('adminOrdersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" class="text-center"><i class="fas fa-spinner fa-spin"></i> Fetching Orders...</td></tr>';
    
    setTimeout(() => {
        tbody.innerHTML = `
            <tr>
                <td class="font-bold">#MK-8923</td>
                <td class="text-small">14 Oct, 2026</td>
                <td>Rahul Sharma<br><span class="text-small text-muted">+91 9876543210</span></td>
                <td class="font-bold">₹2,499</td>
                <td><span class="status-badge status-processing">Processing</span></td>
            </tr>
        `;
    }, 600);
}
