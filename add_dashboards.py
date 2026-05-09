#!/usr/bin/env python3
"""Add farmer/customer dashboards to KhetSeGhar_Website.html"""

file_path = '/Users/tejindersingh/Downloads/KhetSeGhar_Website.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# ──────────────────────────────────────────
# 1. Add dashboard CSS before </style>
# ──────────────────────────────────────────
dashboard_css = """
    /* DASHBOARD */
    .dashboard { display:none; padding:90px 5% 40px; min-height:100vh; }
    .dashboard.active { display:block; }
    .landing-content { display:block; }
    .landing-content.hidden { display:none; }
    .dash-header { margin-bottom:32px; }
    .dash-welcome { font-family:'Playfair Display',serif; font-size:clamp(24px,3vw,36px); font-weight:800; color:var(--soil); }
    .dash-role { font-size:14px; color:var(--earth); margin-top:4px; }
    .dash-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:18px; margin:24px 0; }
    .dash-stat-card { background:white; border-radius:18px; padding:22px; border:1px solid var(--border); text-align:center; transition:all .3s; }
    .dash-stat-card:hover { transform:translateY(-3px); box-shadow:var(--shadow); }
    .dash-stat-icon { font-size:32px; margin-bottom:8px; }
    .dash-stat-num { font-family:'Playfair Display',serif; font-size:28px; font-weight:800; color:var(--leaf); }
    .dash-stat-label { font-size:12px; color:var(--earth); margin-top:2px; }
    .dash-section { margin-top:36px; }
    .dash-section-title { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:var(--soil); margin-bottom:18px; display:flex; align-items:center; justify-content:space-between; }
    .dash-btn { background:linear-gradient(135deg,var(--leaf),var(--sprout)); color:white; border:none; padding:10px 22px; border-radius:30px; font-size:14px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .3s; }
    .dash-btn:hover { transform:translateY(-2px); box-shadow:0 4px 16px rgba(45,106,79,.4); }
    .dash-btn-outline { background:transparent; color:var(--leaf); border:2px solid var(--leaf); padding:10px 22px; border-radius:30px; font-size:14px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .2s; }
    .dash-btn-outline:hover { background:var(--light-leaf); }
    .dash-empty { text-align:center; padding:40px; color:var(--earth); font-size:14px; background:white; border-radius:18px; border:1px solid var(--border); }
    .dash-product-card { background:white; border-radius:18px; padding:18px; border:1px solid var(--border); display:flex; align-items:center; gap:14px; margin-bottom:12px; transition:all .3s; }
    .dash-product-card:hover { box-shadow:var(--shadow); }
    .dash-product-emoji { font-size:32px; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; }
    .dash-product-info { flex:1; }
    .dash-product-name { font-weight:700; font-size:15px; }
    .dash-product-meta { font-size:12px; color:var(--earth); margin-top:2px; }
    .dash-product-price { font-weight:800; font-size:18px; color:var(--leaf); }
    .dash-actions { display:flex; gap:12px; flex-wrap:wrap; margin-top:18px; }
    .back-to-home { background:none; border:none; color:var(--leaf); font-size:13px; font-weight:600; cursor:pointer; padding:0; font-family:'DM Sans',sans-serif; }
    .back-to-home:hover { text-decoration:underline; }
"""
html = html.replace('    /* LANGUAGE TOGGLE */', dashboard_css + '    /* LANGUAGE TOGGLE */')

# ──────────────────────────────────────────
# 2. Add dashboard HTML after </nav> and before <!-- HERO -->
# ──────────────────────────────────────────
dashboard_html = """
  <!-- FARMER DASHBOARD -->
  <div class="dashboard" id="farmer-dashboard">
    <div class="dash-header">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div>
          <h1 class="dash-welcome">🌾 <span id="fd-name">Farmer</span>'s Dashboard</h1>
          <p class="dash-role">Farmer Account · <span id="fd-email"></span></p>
        </div>
        <div class="dash-actions">
          <button class="dash-btn" onclick="openModal('list-product')">📸 List New Crop</button>
          <button class="dash-btn-outline" onclick="showLanding()">🏠 Back to Home</button>
          <button class="dash-btn-outline" style="border-color:var(--red);color:var(--red)" onclick="logoutUser()">🚪 Logout</button>
        </div>
      </div>
    </div>
    <div class="dash-grid">
      <div class="dash-stat-card"><div class="dash-stat-icon">📦</div><div class="dash-stat-num" id="fd-products">0</div><div class="dash-stat-label">My Listings</div></div>
      <div class="dash-stat-card"><div class="dash-stat-icon">🛒</div><div class="dash-stat-num" id="fd-orders">0</div><div class="dash-stat-label">Orders</div></div>
      <div class="dash-stat-card"><div class="dash-stat-icon">⭐</div><div class="dash-stat-num" id="fd-rating">-</div><div class="dash-stat-label">Rating</div></div>
      <div class="dash-stat-card"><div class="dash-stat-icon">💰</div><div class="dash-stat-num" id="fd-sales">0</div><div class="dash-stat-label">Total Sales</div></div>
    </div>
    <div class="dash-section">
      <div class="dash-section-title">My Crop Listings <button class="dash-btn" onclick="openModal('list-product')" style="font-size:12px;padding:7px 16px">+ Add New</button></div>
      <div id="fd-listings"><div class="dash-empty">Loading your listings…</div></div>
    </div>
  </div>

  <!-- CUSTOMER DASHBOARD -->
  <div class="dashboard" id="customer-dashboard">
    <div class="dash-header">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div>
          <h1 class="dash-welcome">🛒 <span id="cd-name">Buyer</span>'s Dashboard</h1>
          <p class="dash-role">Buyer Account · <span id="cd-email"></span></p>
        </div>
        <div class="dash-actions">
          <button class="dash-btn" onclick="showLanding();document.getElementById('products').scrollIntoView({behavior:'smooth'})">🛍️ Browse Products</button>
          <button class="dash-btn-outline" onclick="showLanding()">🏠 Back to Home</button>
          <button class="dash-btn-outline" style="border-color:var(--red);color:var(--red)" onclick="logoutUser()">🚪 Logout</button>
        </div>
      </div>
    </div>
    <div class="dash-grid">
      <div class="dash-stat-card"><div class="dash-stat-icon">📦</div><div class="dash-stat-num" id="cd-orders">0</div><div class="dash-stat-label">My Orders</div></div>
      <div class="dash-stat-card"><div class="dash-stat-icon">🛒</div><div class="dash-stat-num" id="cd-cart">0</div><div class="dash-stat-label">Cart Items</div></div>
      <div class="dash-stat-card"><div class="dash-stat-icon">💬</div><div class="dash-stat-num" id="cd-messages">0</div><div class="dash-stat-label">Messages</div></div>
    </div>
    <div class="dash-section">
      <div class="dash-section-title">Recent Orders</div>
      <div id="cd-order-list"><div class="dash-empty">No orders yet. Start shopping!</div></div>
    </div>
  </div>

  <!-- LANDING CONTENT WRAPPER -->
  <div id="landing-content">

"""

# Wrap everything between </nav> and <footer> as landing content
html = html.replace('  </nav>\n\n  <!-- HERO -->', '  </nav>\n' + dashboard_html + '  <!-- HERO -->')

# Close the landing-content wrapper before footer
html = html.replace('  <!-- FOOTER -->\n  <footer>', '  </div><!-- /landing-content -->\n\n  <!-- FOOTER -->\n  <footer>')

# ──────────────────────────────────────────
# 3. Add dashboard JS before the INIT section
# ──────────────────────────────────────────
dashboard_js = """
    // ═══════════════════════════════════════════════
    //  DASHBOARD
    // ═══════════════════════════════════════════════
    function showDashboard() {
      if (!currentUser) return;
      const landing = document.getElementById('landing-content');
      const fDash = document.getElementById('farmer-dashboard');
      const cDash = document.getElementById('customer-dashboard');
      landing.style.display = 'none';
      if (currentUser.type === 'farmer') {
        fDash.classList.add('active');
        cDash.classList.remove('active');
        document.getElementById('fd-name').textContent = currentUser.name?.split(' ')[0] || 'Farmer';
        document.getElementById('fd-email').textContent = currentUser.email || '';
        loadFarmerDashboard();
      } else {
        cDash.classList.add('active');
        fDash.classList.remove('active');
        document.getElementById('cd-name').textContent = currentUser.name?.split(' ')[0] || 'Buyer';
        document.getElementById('cd-email').textContent = currentUser.email || '';
        loadCustomerDashboard();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showLanding() {
      document.getElementById('landing-content').style.display = 'block';
      document.getElementById('farmer-dashboard').classList.remove('active');
      document.getElementById('customer-dashboard').classList.remove('active');
    }

    async function loadFarmerDashboard() {
      if (!currentUser || currentUser.type !== 'farmer') return;
      try {
        // Load farmer's products
        const { data: products } = await db.from('products').select('*').eq('farmer_id', currentUser.id);
        const listings = products || [];
        document.getElementById('fd-products').textContent = listings.length;
        // Load farmer profile for stats
        const { data: farmer } = await db.from('farmers').select('*').eq('id', currentUser.id).maybeSingle();
        if (farmer) {
          document.getElementById('fd-rating').textContent = farmer.rating || '-';
          document.getElementById('fd-sales').textContent = farmer.total_sales || 0;
        }
        // Render listings
        const el = document.getElementById('fd-listings');
        if (!listings.length) {
          el.innerHTML = '<div class="dash-empty">No crops listed yet.<br><button class="dash-btn" style="margin-top:14px" onclick="openModal(\\'list-product\\')">📸 List Your First Crop</button></div>';
        } else {
          el.innerHTML = listings.map(p => `
            <div class="dash-product-card">
              <div class="dash-product-emoji" style="background:${p.bg_color||'#FFF9E6'}">${p.emoji||'🌾'}</div>
              <div class="dash-product-info">
                <div class="dash-product-name">${p.name} ${p.name_hindi?'· '+p.name_hindi:''}</div>
                <div class="dash-product-meta">${p.quantity_available} ${p.unit} available · ${p.is_organic?'🌿 Organic':'⚡ Fresh'} · ${p.category}</div>
              </div>
              <div class="dash-product-price">₹${p.price_per_unit}/${p.unit}</div>
            </div>`).join('');
        }
      } catch(e) { console.error('Farmer dashboard:', e); }
    }

    async function loadCustomerDashboard() {
      if (!currentUser || currentUser.type !== 'customer') return;
      try {
        const { data: orders } = await db.from('orders').select('*, products(name, emoji), farmers(name)').eq('customer_id', currentUser.id).order('created_at', { ascending: false });
        const orderList = orders || [];
        document.getElementById('cd-orders').textContent = orderList.length;
        document.getElementById('cd-cart').textContent = cart.length;
        const el = document.getElementById('cd-order-list');
        if (!orderList.length) {
          el.innerHTML = '<div class="dash-empty">No orders yet.<br><button class="dash-btn" style="margin-top:14px" onclick="showLanding();document.getElementById(\\'products\\').scrollIntoView({behavior:\\'smooth\\'})">🛍️ Start Shopping</button></div>';
        } else {
          el.innerHTML = orderList.map(o => `
            <div class="dash-product-card">
              <div class="dash-product-emoji" style="background:var(--light-leaf)">${o.products?.emoji||'📦'}</div>
              <div class="dash-product-info">
                <div class="dash-product-name">${o.products?.name||'Product'}</div>
                <div class="dash-product-meta">From: ${o.farmers?.name||'Farmer'} · ${o.quantity} ${o.unit} · Status: <strong>${o.status}</strong></div>
              </div>
              <div class="dash-product-price">₹${o.total_amount}</div>
            </div>`).join('');
        }
      } catch(e) { console.error('Customer dashboard:', e); }
    }

"""

html = html.replace('    // ═══════════════════════════════════════════════\n    //  INIT', dashboard_js + '    // ═══════════════════════════════════════════════\n    //  INIT')

# ──────────────────────────────────────────
# 4. Update updateNavForUser to add dashboard link
# ──────────────────────────────────────────
old_nav_update = """      if (currentUser) {
        joinBtn.style.display = 'none';
        if (loginLink) loginLink.style.display = 'none';
        userBtn.style.display = 'inline-flex';
        userBtn.textContent = 'Hi, ' + (currentUser.name?.split(' ')[0] || 'User');"""

new_nav_update = """      if (currentUser) {
        joinBtn.style.display = 'none';
        if (loginLink) loginLink.style.display = 'none';
        userBtn.style.display = 'inline-flex';
        userBtn.textContent = '📊 ' + (currentUser.name?.split(' ')[0] || 'User');
        userBtn.onclick = function() { showDashboard(); };"""
html = html.replace(old_nav_update, new_nav_update)

# ──────────────────────────────────────────
# 5. After login/register, go to dashboard
# ──────────────────────────────────────────
# After customer registration success (email confirm off)
html = html.replace(
    "          await restoreSession();\n          closeModal();\n          showToast('🎉 Welcome ' + name + '! Start shopping fresh produce.', 'success');",
    "          await restoreSession();\n          closeModal();\n          showToast('🎉 Welcome ' + name + '!', 'success');\n          showDashboard();"
)

# After farmer registration success (email confirm off)
html = html.replace(
    "          await restoreSession();\n          closeModal();\n          showToast('🌾 Welcome Farmer ' + name + '! You can now list your crops.', 'success');\n          loadFarmers();",
    "          await restoreSession();\n          closeModal();\n          showToast('🌾 Welcome Farmer ' + name + '!', 'success');\n          loadFarmers();\n          showDashboard();"
)

# After login success
old_login_success = """        await restoreSession();
        closeModal();
        showToast('Welcome back, ' + (currentUser?.name || email.split('@')[0]) + '!', 'success');"""
new_login_success = """        await restoreSession();
        closeModal();
        showToast('Welcome back, ' + (currentUser?.name || email.split('@')[0]) + '!', 'success');
        showDashboard();"""
html = html.replace(old_login_success, new_login_success)

# After logout, show landing
old_logout = """    async function logoutUser() {
      await db.auth.signOut();
      currentUser = null; updateNavForUser();
      showToast('Logged out successfully.', 'success');
    }"""
new_logout = """    async function logoutUser() {
      await db.auth.signOut();
      currentUser = null; updateNavForUser();
      showLanding();
      showToast('Logged out successfully.', 'success');
    }"""
html = html.replace(old_logout, new_logout)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("✅ Dashboards added successfully!")
