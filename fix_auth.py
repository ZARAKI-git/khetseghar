#!/usr/bin/env python3
"""Apply full Supabase Auth to KhetSeGhar_Website.html"""

file_path = '/Users/tejindersingh/Downloads/KhetSeGhar_Website.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# ──────────────────────────────────────────────────
# 1. Fix Supabase client init — add auth options
# ──────────────────────────────────────────────────
old_client = """const db = supabase.createClient(SUPA_URL, SUPA_KEY);"""
new_client = """const db = supabase.createClient(SUPA_URL, SUPA_KEY, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
    });"""
html = html.replace(old_client, new_client)

# ──────────────────────────────────────────────────
# 2. Add auth state variables and session restore after currentUser line
# ──────────────────────────────────────────────────
old_vars = """let currentUser = null;   // {type, id, name}"""
new_vars = """let currentUser = null;   // {type, id, name, email, authUid}"""
html = html.replace(old_vars, new_vars)

# ──────────────────────────────────────────────────
# 3. Replace checkConnection to also restore session
# ──────────────────────────────────────────────────
old_check = """    async function checkConnection() {
      try {
        const { error } = await db.from('farmers').select('id').limit(1);
        if (error) throw error;
        document.getElementById('db-dot').className = 'db-dot connected';
        document.getElementById('db-label').textContent = '✓ Supabase Connected';
        setTimeout(() => { document.getElementById('db-status').style.opacity = '0.4'; }, 4000);
      } catch (e) {
        document.getElementById('db-dot').className = 'db-dot error';
        document.getElementById('db-label').textContent = '⚠ DB Error — Run SQL Schema';
      }
    }"""

new_check = """    async function checkConnection() {
      try {
        const { error } = await db.from('farmers').select('id').limit(1);
        if (error) throw error;
        document.getElementById('db-dot').className = 'db-dot connected';
        document.getElementById('db-label').textContent = '✓ Supabase Connected';
        setTimeout(() => { document.getElementById('db-status').style.opacity = '0.4'; }, 4000);
      } catch (e) {
        document.getElementById('db-dot').className = 'db-dot error';
        document.getElementById('db-label').textContent = '⚠ DB Error — Run SQL Schema';
      }
      await restoreSession();
    }

    // ═══════════════════════════════════════════════
    //  AUTH — SESSION RESTORE
    // ═══════════════════════════════════════════════
    async function restoreSession() {
      try {
        const { data: { session } } = await db.auth.getSession();
        if (!session) return;
        const authUser = session.user;
        if (!authUser.email_confirmed_at) return; // not confirmed yet
        const uid = authUser.id;
        const email = authUser.email;
        // Try farmer
        let { data: farmer } = await db.from('farmers').select('*').eq('auth_uid', uid).maybeSingle();
        if (!farmer) {
          const { data: fByEmail } = await db.from('farmers').select('*').eq('email', email).maybeSingle();
          if (fByEmail) { await db.from('farmers').update({ auth_uid: uid }).eq('email', email); farmer = fByEmail; }
        }
        if (farmer) { currentUser = { type:'farmer', id:farmer.id, name:farmer.name, email, authUid:uid }; updateNavForUser(); return; }
        // Try customer
        let { data: customer } = await db.from('customers').select('*').eq('auth_uid', uid).maybeSingle();
        if (!customer) {
          const { data: cByEmail } = await db.from('customers').select('*').eq('email', email).maybeSingle();
          if (cByEmail) { await db.from('customers').update({ auth_uid: uid }).eq('email', email); customer = cByEmail; }
        }
        if (customer) { currentUser = { type:'customer', id:customer.id, name:customer.name, email, authUid:uid }; updateNavForUser(); }
      } catch(e) { console.error('Session restore:', e); }
    }

    db.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') { currentUser = null; updateNavForUser(); }
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) { await restoreSession(); }
    });

    function updateNavForUser() {
      const joinBtn = document.getElementById('nav-join-btn');
      const userBtn = document.getElementById('nav-user-btn');
      const loginLink = document.getElementById('nav-login-link');
      if (!joinBtn || !userBtn) return;
      if (currentUser) {
        joinBtn.style.display = 'none';
        if (loginLink) loginLink.style.display = 'none';
        userBtn.style.display = 'inline-flex';
        userBtn.textContent = 'Hi, ' + (currentUser.name?.split(' ')[0] || 'User');
      } else {
        joinBtn.style.display = 'inline-flex';
        if (loginLink) loginLink.style.display = 'inline';
        userBtn.style.display = 'none';
      }
    }

    async function logoutUser() {
      await db.auth.signOut();
      currentUser = null; updateNavForUser();
      showToast('Logged out successfully.', 'success');
    }"""
html = html.replace(old_check, new_check)

# ──────────────────────────────────────────────────
# 4. Add login/account to modal system
# ──────────────────────────────────────────────────
old_modal = """      if (type === 'join') box.innerHTML = joinHTML('buyer');
      else if (type === 'farmer-register') box.innerHTML = joinHTML('farmer');
      else if (type === 'cart') box.innerHTML = cartHTML();"""
new_modal = """      if (type === 'join') box.innerHTML = joinHTML('buyer');
      else if (type === 'farmer-register') box.innerHTML = joinHTML('farmer');
      else if (type === 'login') box.innerHTML = loginHTML();
      else if (type === 'account') box.innerHTML = accountHTML();
      else if (type === 'cart') box.innerHTML = cartHTML();"""
html = html.replace(old_modal, new_modal)

# ──────────────────────────────────────────────────
# 5. Replace joinHTML to add email+password fields
# ──────────────────────────────────────────────────
old_join = """    // ── JOIN / REGISTER ──
    function joinHTML(tab) {
      return `
    <button class="modal-close" onclick="closeModal()">✕</button>
    <h2 class="modal-title">Join KhetSeGhar</h2>
    <p class="modal-sub">खेत से घर परिवार में शामिल हों</p>
    <div class="modal-tabs">
      <button class="modal-tab ${tab === 'buyer' ? 'active' : ''}" onclick="document.getElementById('modal-box').innerHTML=joinHTML('buyer')">🛒 I'm a Buyer</button>
      <button class="modal-tab ${tab === 'farmer' ? 'active' : ''}" onclick="document.getElementById('modal-box').innerHTML=joinHTML('farmer')">🌾 I'm a Farmer</button>
    </div>"""

new_join = """    // ── LOGIN MODAL ──
    function loginHTML() {
      return `
    <button class="modal-close" onclick="closeModal()">✕</button>
    <h2 class="modal-title">Welcome Back 👋</h2>
    <p class="modal-sub">खेत से घर में लॉगिन करें</p>
    <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="l-email" placeholder="you@example.com" type="email"></div>
    <div class="form-group"><label class="form-label">Password</label><input class="form-input" id="l-password" placeholder="Your password" type="password" onkeydown="if(event.key==='Enter')loginUser()"></div>
    <button class="form-submit" onclick="loginUser()">🔐 Log In</button>
    <p style="text-align:center;margin-top:12px;font-size:13px;color:#888">
      <a href="#" onclick="forgotPassword();return false" style="color:var(--leaf);font-weight:600">Forgot password?</a>
    </p>
    <p style="text-align:center;margin-top:8px;font-size:13px;color:#888">No account? <a href="#" onclick="openModal('join');return false" style="color:var(--leaf);font-weight:600">Register Free</a></p>`;
    }

    // ── ACCOUNT MODAL ──
    function accountHTML() {
      if (!currentUser) return loginHTML();
      const icon = currentUser.type === 'farmer' ? '🌾' : '🛒';
      const role = currentUser.type === 'farmer' ? 'Farmer' : 'Buyer';
      return `
    <button class="modal-close" onclick="closeModal()">✕</button>
    <h2 class="modal-title">${icon} My Account</h2>
    <div style="background:var(--light-leaf);border-radius:16px;padding:18px;margin:16px 0">
      <div style="font-size:36px;text-align:center;margin-bottom:10px">${icon}</div>
      <div style="font-weight:700;font-size:18px;text-align:center">${currentUser.name}</div>
      <div style="color:var(--earth);text-align:center;font-size:13px;margin-top:4px">${role} · ${currentUser.email||''}</div>
    </div>
    ${currentUser.type==='farmer'?'<button class="form-submit" style="margin-bottom:12px" onclick="closeModal();openModal(\\'list-product\\')">📸 List New Crop</button>':''}
    <button onclick="logoutUser();closeModal()" style="width:100%;padding:14px;border:2px solid var(--red);background:transparent;color:var(--red);border-radius:14px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit">🚪 Log Out</button>`;
    }

    // ── AUTH FUNCTIONS ──
    async function loginUser() {
      const email = document.getElementById('l-email').value.trim();
      const password = document.getElementById('l-password').value;
      if (!email || !password) { showToast('Enter email and password', 'error'); return; }
      const btn = document.querySelector('.form-submit');
      btn.disabled = true; btn.textContent = 'Logging in…';
      try {
        const { data, error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.user.email_confirmed_at) { btn.disabled=false; btn.textContent='Log In'; showToast('Please confirm your email first!','error'); return; }
        await restoreSession();
        closeModal();
        showToast('Welcome back, ' + (currentUser?.name || email.split('@')[0]) + '!', 'success');
      } catch(e) { btn.disabled=false; btn.textContent='Log In'; showToast('Login failed: '+(e.message||'Wrong credentials'),'error'); }
    }

    async function forgotPassword() {
      const email = document.getElementById('l-email')?.value?.trim();
      if (!email) { showToast('Enter your email above first','error'); return; }
      const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
      if (error) { showToast('Error: '+error.message,'error'); return; }
      showToast('Password reset link sent to '+email,'success');
    }

    // ── JOIN / REGISTER ──
    function joinHTML(tab) {
      return `
    <button class="modal-close" onclick="closeModal()">✕</button>
    <h2 class="modal-title">Join KhetSeGhar</h2>
    <p class="modal-sub">खेत से घर परिवार में शामिल हों</p>
    <div class="modal-tabs">
      <button class="modal-tab ${tab === 'buyer' ? 'active' : ''}" onclick="document.getElementById('modal-box').innerHTML=joinHTML('buyer')">🛒 I'm a Buyer</button>
      <button class="modal-tab ${tab === 'farmer' ? 'active' : ''}" onclick="document.getElementById('modal-box').innerHTML=joinHTML('farmer')">🌾 I'm a Farmer</button>
    </div>"""
html = html.replace(old_join, new_join)

# ──────────────────────────────────────────────────
# 6. Replace buyer form (add email+password, remove mobile-only)
# ──────────────────────────────────────────────────
# Buyer tab content
old_buyer_fields = """    ${tab === 'buyer' ? `
      <div class="form-group"><label class="form-label"><span class="en">Full Name</span><span class="hi">पूरा नाम</span></label><input class="form-input" id="r-name" placeholder="Your full name"></div>
      <div class="form-group"><label class="form-label"><span class="en">Mobile</span><span class="hi">मोबाइल</span></label><input class="form-input" id="r-mobile" placeholder="+91 XXXXX XXXXX" type="tel"></div>
      <div class="form-group"><label class="form-label"><span class="en">City</span><span class="hi">शहर</span></label><input class="form-input" id="r-city" placeholder="Your city"></div>
      <div class="form-group"><label class="form-label">Are you a bulk buyer? (Restaurant/Hotel)</label>
        <select class="form-select" id="r-bulk"><option value="false">No — Regular Buyer</option><option value="true">Yes — Bulk/Business Buyer</option></select>
      </div>
      <button class="form-submit" onclick="registerCustomer()"><span class="en">🛒 Create Account</span><span class="hi">🛒 खाता बनाएं</span></button>"""

new_buyer_fields = """    ${tab === 'buyer' ? `
      <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="r-name" placeholder="Your full name"></div>
      <div class="form-group"><label class="form-label">Email Address</label><input class="form-input" id="r-email" placeholder="you@example.com" type="email"></div>
      <div class="form-group"><label class="form-label">Password (min 8 chars)</label><input class="form-input" id="r-password" placeholder="Create a strong password" type="password"></div>
      <div class="form-group"><label class="form-label">Mobile (optional)</label><input class="form-input" id="r-mobile" placeholder="+91 XXXXX XXXXX" type="tel"></div>
      <div class="form-group"><label class="form-label">City</label><input class="form-input" id="r-city" placeholder="Your city"></div>
      <div class="form-group"><label class="form-label">Buyer Type</label>
        <select class="form-select" id="r-bulk"><option value="false">Regular Buyer</option><option value="true">Bulk / Business Buyer</option></select>
      </div>
      <button class="form-submit" onclick="registerCustomer()">🛒 Create Account</button>
      <p style="text-align:center;margin-top:14px;font-size:13px;color:#888">Already have an account? <a href="#" onclick="openModal('login');return false" style="color:var(--leaf);font-weight:600">Log In</a></p>"""
html = html.replace(old_buyer_fields, new_buyer_fields)

# Farmer tab content
old_farmer_fields = """    ` : `
      <div class="form-group"><label class="form-label"><span class="en">Full Name</span><span class="hi">पूरा नाम</span></label><input class="form-input" id="r-name" placeholder="Your full name"></div>
      <div class="form-group"><label class="form-label"><span class="en">Mobile</span><span class="hi">मोबाइल</span></label><input class="form-input" id="r-mobile" placeholder="+91 XXXXX XXXXX" type="tel"></div>"""

new_farmer_fields = """    ` : `
      <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="r-name" placeholder="Your full name"></div>
      <div class="form-group"><label class="form-label">Email Address</label><input class="form-input" id="r-email" placeholder="you@example.com" type="email"></div>
      <div class="form-group"><label class="form-label">Password (min 8 chars)</label><input class="form-input" id="r-password" placeholder="Create a strong password" type="password"></div>
      <div class="form-group"><label class="form-label">Mobile (optional)</label><input class="form-input" id="r-mobile" placeholder="+91 XXXXX XXXXX" type="tel"></div>"""
html = html.replace(old_farmer_fields, new_farmer_fields)

# Add login link after farmer register button
old_farmer_btn = """      <button class="form-submit" onclick="registerFarmerSubmit()"><span class="en">🌾 Register as Farmer</span><span class="hi">🌾 किसान बनें</span></button>
    \`}\`;
    }"""

new_farmer_btn = """      <button class="form-submit" onclick="registerFarmerSubmit()">🌾 Register as Farmer</button>
      <p style="text-align:center;margin-top:14px;font-size:13px;color:#888">Already registered? <a href="#" onclick="openModal('login');return false" style="color:var(--leaf);font-weight:600">Log In</a></p>
    \`}\`;
    }"""
html = html.replace(old_farmer_btn, new_farmer_btn)

# ──────────────────────────────────────────────────
# 7. Replace registerCustomer with auth version
# ──────────────────────────────────────────────────
old_reg_cust = """    async function registerCustomer() {
      const name = document.getElementById('r-name').value.trim();
      const mobile = document.getElementById('r-mobile').value.trim();
      const city = document.getElementById('r-city').value.trim();
      const bulk = document.getElementById('r-bulk').value === 'true';
      if (!name || !mobile) { showToast('Please fill name & mobile', 'error'); return; }
      const btn = document.querySelector('.form-submit');
      btn.disabled = true; btn.textContent = 'Registering…';
      try {
        const { data, error } = await db.from('customers').insert([{ name, mobile, city, is_bulk_buyer: bulk }]).select().single();
        if (error) throw error;
        currentUser = { type: 'customer', id: data.id, name: data.name };
        closeModal();
        showToast(`🎉 Welcome ${name}! Start shopping fresh produce.`, 'success');
      } catch (e) {
        btn.disabled = false; btn.textContent = '🛒 Create Account';
        showToast(e.message?.includes('unique') ? '📱 Mobile already registered! Try logging in.' : '❌ ' + e.message, 'error');
      }
    }"""

new_reg_cust = """    async function registerCustomer() {
      const name = document.getElementById('r-name').value.trim();
      const email = document.getElementById('r-email').value.trim();
      const password = document.getElementById('r-password').value;
      const mobile = document.getElementById('r-mobile').value.trim() || null;
      const city = document.getElementById('r-city').value.trim();
      const bulk = document.getElementById('r-bulk').value === 'true';
      if (!name || !email || !password) { showToast('Please fill name, email & password', 'error'); return; }
      if (password.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
      const btn = document.querySelector('.form-submit');
      btn.disabled = true; btn.textContent = 'Creating account…';
      try {
        // Step 1: Supabase Auth signup
        const { error: authErr } = await db.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.href, data: { name, role: 'customer' } }
        });
        if (authErr) throw authErr;
        // Step 2: Insert profile row (auth_uid linked on first login)
        const ins = { name, email, city, is_bulk_buyer: bulk };
        if (mobile) ins.mobile = mobile;
        const { error: dbErr } = await db.from('customers').insert([ins]);
        if (dbErr) throw dbErr;
        // Step 3: Sign out immediately — user must confirm email first
        await db.auth.signOut();
        closeModal();
        showToast('✅ Account created! Check ' + email + ' for a confirmation link, then log in.', 'success');
      } catch(e) {
        btn.disabled = false; btn.textContent = '🛒 Create Account';
        const msg = e.message || '';
        if (msg.includes('already') || msg.includes('duplicate')) { showToast('Email already registered. Please log in.', 'error'); }
        else { showToast('Registration failed: ' + msg, 'error'); }
      }
    }"""
html = html.replace(old_reg_cust, new_reg_cust)

# ──────────────────────────────────────────────────
# 8. Replace registerFarmerSubmit with auth version
# ──────────────────────────────────────────────────
old_reg_farmer = """    async function registerFarmerSubmit() {
      const name = document.getElementById('r-name').value.trim();
      const mobile = document.getElementById('r-mobile').value.trim();
      const village = document.getElementById('r-village').value.trim();
      const district = document.getElementById('r-district').value.trim();
      const state = document.getElementById('r-state').value;
      const crops = (document.getElementById('r-crops').value || '').split(',').map(c => c.trim()).filter(Boolean);
      if (!name || !mobile) { showToast('Please fill name & mobile', 'error'); return; }
      const btn = document.querySelector('.form-submit');
      btn.disabled = true; btn.textContent = 'Registering…';
      try {
        const { data, error } = await db.from('farmers').insert([{ name, mobile, village, district, state, crops_grown: crops }]).select().single();
        if (error) throw error;
        currentUser = { type: 'farmer', id: data.id, name: data.name };
        closeModal();
        showToast(`🌾 Welcome Farmer ${name}! You can now list your crops.`, 'success');
        loadFarmers();
        // Offer to list a product right away
        setTimeout(() => openModal('list-product'), 800);
      } catch (e) {
        btn.disabled = false; btn.textContent = '🌾 Register as Farmer';
        showToast(e.message?.includes('unique') ? '📱 Mobile already registered!' : '❌ ' + e.message, 'error');
      }
    }"""

new_reg_farmer = """    async function registerFarmerSubmit() {
      const name = document.getElementById('r-name').value.trim();
      const email = document.getElementById('r-email').value.trim();
      const password = document.getElementById('r-password').value;
      const mobile = document.getElementById('r-mobile').value.trim() || null;
      const village = document.getElementById('r-village').value.trim();
      const district = document.getElementById('r-district').value.trim();
      const state = document.getElementById('r-state').value;
      const crops = (document.getElementById('r-crops').value || '').split(',').map(c => c.trim()).filter(Boolean);
      if (!name || !email || !password) { showToast('Please fill name, email & password', 'error'); return; }
      if (password.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
      const btn = document.querySelector('.form-submit');
      btn.disabled = true; btn.textContent = 'Registering…';
      try {
        // Step 1: Supabase Auth signup
        const { error: authErr } = await db.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.href, data: { name, role: 'farmer' } }
        });
        if (authErr) throw authErr;
        // Step 2: Insert profile row (auth_uid linked on first login)
        const ins = { name, email, village, district, state, crops_grown: crops };
        if (mobile) ins.mobile = mobile;
        const { error: dbErr } = await db.from('farmers').insert([ins]);
        if (dbErr) throw dbErr;
        // Step 3: Sign out immediately — user must confirm email first
        await db.auth.signOut();
        closeModal();
        showToast('✅ Farmer account created! Check ' + email + ' for a confirmation link, then log in.', 'success');
      } catch(e) {
        btn.disabled = false; btn.textContent = '🌾 Register as Farmer';
        const msg = e.message || '';
        if (msg.includes('already') || msg.includes('duplicate')) { showToast('Email already registered. Please log in.', 'error'); }
        else { showToast('Registration failed: ' + msg, 'error'); }
      }
    }"""
html = html.replace(old_reg_farmer, new_reg_farmer)

# ──────────────────────────────────────────────────
# 9. Add Login + Account buttons to nav
# ──────────────────────────────────────────────────
old_nav_cta = """      <a href="#" class="nav-cta" onclick="openModal('join');return false">Join Free</a>"""
new_nav_cta = """      <a href="#" onclick="openModal('login');return false" style="font-size:14px;font-weight:500;color:var(--soil);text-decoration:none" id="nav-login-link">Log In</a>
      <a href="#" class="nav-cta" id="nav-join-btn" onclick="openModal('join');return false">Join Free</a>
      <button class="nav-cta" id="nav-user-btn" style="display:none;border:none;cursor:pointer" onclick="openModal('account')"></button>"""
html = html.replace(old_nav_cta, new_nav_cta)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("✅ All auth changes applied successfully!")
