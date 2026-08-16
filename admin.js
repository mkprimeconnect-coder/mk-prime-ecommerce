/* ================================================================
   MK PRIME CONNECT - ADMIN BACKEND ENGINE (admin.js)
   ================================================================ */

// --- 1. SUPABASE & CLOUDINARY CONFIG ---
const supabaseUrl = 'https://lqwgtqtulhifavzidykh.supabase.co';
const supabaseKey = 'sb_publishable_chUtpCFjxVDIvbTXNnteyA_Vo0K5USw';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Cloudinary Details
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/f7ym0acs/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'mkprime_preset'; // Jo preset aap banayenge

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

    // Check if already logged in (Local Session for demo/MVP)
    if (localStorage.getItem('mkPrimeAdminAuth') === 'true') {
        loginOverlay.classList.add('hidden');
        dashboardLayout.classList.remove('hidden');
        fetchDashboardData();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            const btn = document.getElementById('adminLoginBtn');

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

            // For MVP: Simple Email/Pass check (In production, use Supabase Auth)
            // You can change this to your actual admin email and a secure password
            if (email === 'admin@mkprime.com' && password === 'admin123') {
                setTimeout(() => {
                    localStorage.setItem('mkPrimeAdminAuth', 'true');
                    loginOverlay.classList.add('hidden');
                    dashboardLayout.classList.remove('hidden');
                    fetchDashboardData();
                    btn.innerHTML = 'Login to Dashboard <i class="fas fa-lock"></i>';
                }, 1000);
            } else {
                alert('Invalid Admin Credentials!');
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
            if (this.id === 'adminLogoutBtn') return; // Skip logout button
            e.preventDefault();

            // Remove active from all
            navItems.forEach(nav => nav.classList.remove('active'));
            panels.forEach(panel => panel.classList.add('hidden'));
            panels.forEach(panel => panel.classList.remove('active'));

            // Add active to current
            this.classList.add('active');
            const targetId = this.getAttribute('data-target');
            const targetPanel = document.getElementById(targetId);
            
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                targetPanel.classList.add('active');
                
                // Fetch data based on panel
                if(targetId === 'panel-products') fetchAllProducts();
                if(targetId === 'panel-orders') fetchAllOrders();
            }
        });
    });
}

// --- 5. PRODUCT UPLOAD SYSTEM (Supabase + Cloudinary) ---
function initProductUpload() {
    const addProductForm = document.getElementById('addProductForm');
    const imageInput = document.getElementById('prodImageFile');
    const imagePreview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const removeBtn = document.getElementById('removeImageBtn');

    // Image Preview Logic
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    previewContainer.classList.remove('hidden');
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            imageInput.value = '';
            imagePreview.src = '';
            previewContainer.classList.add('hidden');
        });
    }

    // Form Submit (Upload to Cloudinary, then save to Supabase)
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('uploadProductBtn');
            const file = imageInput.files[0];

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
                    description: document.getElementById('prodDesc').value || null,
                    stock: parseInt(document.getElementById('prodStock').value),
                    category: document.getElementById('prodCategory').value,
                    image_url: imageUrl
                    // Note: If you added MRP and Trending columns to supabase, add them here
                };

                const { data, error } = await supabase
                    .from('products')
                    .insert([productData]);

                if (error) throw error;

                // Success
                alert('Product successfully published! 🎉');
                addProductForm.reset();
                previewContainer.classList.add('hidden');
                
                // Switch back to Products list
                document.querySelector('[data-target="panel-products"]').click();

            } catch (error) {
                console.error('Upload Error:', error);
                alert('Error uploading product: ' + error.message);
            } finally {
                btn.innerHTML = '<i class="fas fa-upload"></i> Publish Product';
                btn.disabled = false;
            }
        });
    }
}

// --- 6. DATA FETCHING (Skeletons to Data) ---
async function fetchDashboardData() {
    // Demo data update - Will be replaced by real Supabase Count queries
    setTimeout(() => {
        document.getElementById('kpiRevenue').innerText = '₹45,290';
        document.getElementById('kpiOrders').innerText = '12';
        document.getElementById('kpiPending').innerText = '3';
        document.getElementById('kpiProducts').innerText = '24';
        
        // Remove skeleton and add demo row
        const tbody = document.getElementById('dashboardRecentOrders');
        if(tbody) {
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
    }, 1000);
}

async function fetchAllProducts() {
    const tbody = document.getElementById('adminProductsTableBody');
    if(!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading Products...</td></tr>';

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No products found. Add your first product!</td></tr>';
            return;
        }

        let html = '';
        data.forEach(p => {
            html += `
                <tr>
                    <td><img src="${p.image_url}" class="admin-table-img" alt="Img"></td>
                    <td class="font-bold">${p.title}</td>
                    <td class="uppercase-text text-small">${p.category}</td>
                    <td class="font-bold text-accent">₹${p.price}</td>
                    <td>${p.stock}</td>
                    <td><input type="checkbox" ${p.stock > 10 ? 'checked' : ''} disabled></td>
                    <td>
                        <button class="btn-icon-square hover-lift tooltip-wrapper"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon-square hover-lift text-danger tooltip-wrapper"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (error) {
        console.error('Error fetching products:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading products.</td></tr>';
    }
}

async function fetchAllOrders() {
    const tbody = document.getElementById('adminOrdersTableBody');
    if(!tbody) return;
    
    // Simulating order fetch
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Fetching Orders...</td></tr>';
    
    setTimeout(() => {
        tbody.innerHTML = `
            <tr>
                <td class="font-bold">#MK-8923</td>
                <td class="text-small">14 Oct, 2026</td>
                <td>Rahul Sharma<br><span class="text-small text-muted">+91 9876543210</span></td>
                <td class="font-bold">₹2,499</td>
                <td class="text-muted">312345678901</td>
                <td><span class="status-badge status-processing">Processing</span></td>
                <td>
                    <select class="admin-input form-small">
                        <option>Update</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                    </select>
                </td>
            </tr>
        `;
    }, 800);
}
