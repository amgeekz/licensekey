const $ = id => document.getElementById(id);
const API_BASE = "https://license.amgeekz.my.id/";

function getAdminToken() {
  return localStorage.getItem("geekz_admin_token") || "";
}

function setAdminToken(token) {
  if (token) localStorage.setItem("geekz_admin_token", token);
}

function clearAdminToken() {
  localStorage.removeItem("geekz_admin_token");
}

async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";
  
  const token = getAdminToken();
  if (token) headers["X-Admin-Token"] = token;

  try {
    const res = await fetch(API_BASE + path, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (res.status === 401) {
      clearAdminToken();
      showLoginPanel();
      throw new Error('Session expired');
    }

    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch (error) {
    console.error("API Fetch error:", error);
    throw error;
  }
}

function showAdminPanel() {
  $("login-header").style.display = "none";
  $("admin-header").style.display = "flex";
  $("login-card").style.display = "none";
  $("admin-card").style.display = "block";
  $("list-card").style.display = "block";
}

function showLoginPanel() {
  $("login-header").style.display = "block";
  $("admin-header").style.display = "none";
  $("login-card").style.display = "block";
  $("admin-card").style.display = "none";
  $("list-card").style.display = "none";
}

function logout() {
  clearAdminToken();
  showLoginPanel();
  $("admin-pass").value = "";
  $("login-msg").textContent = "Anda telah logout.";
}

async function tryLogin() {
  const pass = $("admin-pass").value.trim();
  if (!pass) {
    $("login-msg").textContent = "Isi password terlebih dahulu.";
    return;
  }

  try {
    const response = await fetch(API_BASE + '/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': pass
      }
    });

    const data = await response.json();
    
    if (!data.ok) {
      $("login-msg").textContent = data.message || "Login gagal";
      return;
    }

    setAdminToken(data.token);
    $("login-msg").textContent = "";
    showAdminPanel();
    loadLicenses();
    
  } catch (error) {
    console.error("Login error:", error);
    $("login-msg").textContent = "Error: " + error.message;
  }
}

function renderLicenses(items) {
  const tbody = $("tbl-body");
  tbody.innerHTML = "";
  items.forEach(it => {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    
    console.log('License data:', it);
    
    const deviceInfo = [];
    
    if (it.products) {
      if (it.products.digiflazz?.deviceId) {
        const digiflazz = it.products.digiflazz;
        deviceInfo.push(`🔧 Digiflazz: ${digiflazz.deviceName || ''}<br><span class="small">${digiflazz.deviceId}</span>`);
      }
      
      if (it.products.whatsapp?.deviceId) {
        const whatsapp = it.products.whatsapp;
        deviceInfo.push(`💬 WhatsApp: ${whatsapp.deviceName || ''}<br><span class="small">${whatsapp.deviceId}</span>`);
      }
      
      if (it.products.telegram?.deviceId) {
        const telegram = it.products.telegram;
        deviceInfo.push(`📱 Telegram: ${telegram.deviceName || ''}<br><span class="small">${telegram.deviceId}</span>`);
      }
    }
    
    if (deviceInfo.length === 0 && it.deviceId) {
      deviceInfo.push(`🔧 Digiflazz: ${it.deviceName || ''}<br><span class="small">${it.deviceId}</span>`);
    }
    
    const deviceDisplay = deviceInfo.length > 0 
      ? deviceInfo.join('<br><br>')
      : "<span class='small'>-</span>";

    const firstActivated = it.firstActivated || (it.products?.digiflazz?.firstActivated);
    const lastCheckin = it.lastCheckin || (it.products?.digiflazz?.lastCheckin);

    tr.innerHTML = `
      <td>${it.licenseKey}</td>
      <td>${it.ownerEmail || "-"}</td>
      <td class="${it.status === "active" ? "status-active" : it.status === "unused" ? "status-unused" : "status-other"}">${it.status}</td>
      <td>${deviceDisplay}</td>
      <td>
        <span class="small">Aktif: ${firstActivated ? new Date(firstActivated).toLocaleString("id-ID") : "-"}</span><br>
        <span class="small">Last: ${lastCheckin ? new Date(lastCheckin).toLocaleString("id-ID") : "-"}</span>
      </td>
    `;
    
    tr.addEventListener("click", () => {
      $("f-licenseKey").value = it.licenseKey;
      $("f-ownerEmail").value = it.ownerEmail || "";
      $("f-status").value = it.status || "unused";
      $("admin-msg").textContent = "License dimuat ke form. Edit lalu klik Simpan / Update.";
    });
    tbody.appendChild(tr);
  });
}

function updateStats(items) {
  const total = items.length;
  const active = items.filter(item => item.status === 'active').length;
  const unused = items.filter(item => item.status === 'unused').length;
  
  $("total-licenses").textContent = total;
  $("active-licenses").textContent = active;
  $("unused-licenses").textContent = unused;
}

async function loadLicenses() {
  $("admin-msg").textContent = "Memuat daftar license...";
  const { status, data } = await apiFetch("/api/admin/licenses-list");
  
  console.log('API Response:', { status, data });
  
  if (!data.ok || status !== 200) {
    $("admin-msg").textContent = "Gagal load license: " + (data.message || "Unknown error");
    return;
  }
  
  console.log('Licenses data:', data.items);
  $("admin-msg").textContent = "";
  
  const items = data.items || [];
  renderLicenses(items);
  updateStats(items);
}

async function saveLicense() {
  const licenseKey = $("f-licenseKey").value.trim();
  const ownerEmail = $("f-ownerEmail").value.trim();
  const status = $("f-status").value;

  if (!licenseKey) {
    $("admin-msg").textContent = "License key wajib diisi.";
    return;
  }

  $("admin-msg").textContent = "Menyimpan license...";
  const { status: st, data } = await apiFetch("/api/admin/license-save", {
    method: "POST",
    body: { licenseKey, ownerEmail, status }
  });

  if (!data.ok || st !== 200) {
    $("admin-msg").textContent = "Gagal simpan license: " + (data.message || "Unknown error");
    return;
  }

  $("admin-msg").textContent = "License tersimpan.";
  loadLicenses();
}

async function deleteLicense() {
  const licenseKey = $("f-licenseKey").value.trim();
  if (!licenseKey) {
    $("admin-msg").textContent = "Isi license key yang mau dihapus.";
    return;
  }
  if (!confirm("Yakin hapus license: " + licenseKey + " ?")) return;

  $("admin-msg").textContent = "Menghapus license...";
  const { status: st, data } = await apiFetch("/api/admin/license-delete", {
    method: "POST",
    body: { licenseKey }
  });

  if (!data.ok || st !== 200) {
    $("admin-msg").textContent = "Gagal hapus license: " + (data.message || "Unknown error");
    return;
  }

  $("admin-msg").textContent = "License dihapus.";
  $("f-licenseKey").value = "";
  $("f-ownerEmail").value = "";
  $("f-status").value = "unused";
  loadLicenses();
}

function clearForm() {
  $("f-licenseKey").value = "";
  $("f-ownerEmail").value = "";
  $("f-status").value = "unused";
  $("admin-msg").textContent = "Form dibersihkan.";
}

window.addEventListener("DOMContentLoaded", () => {
  $("btn-login").addEventListener("click", tryLogin);
  $("btn-logout").addEventListener("click", logout);
  $("admin-pass").addEventListener("keydown", e => {
    if (e.key === "Enter") tryLogin();
  });

  $("btn-save").addEventListener("click", saveLicense);
  $("btn-delete").addEventListener("click", deleteLicense);
  $("btn-clear").addEventListener("click", clearForm);

  if (getAdminToken()) {
    showAdminPanel();
    loadLicenses();
  } else {
    showLoginPanel();
  }
});