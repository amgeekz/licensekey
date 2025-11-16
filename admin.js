// admin.js

const $ = id => document.getElementById(id);
const API_BASE = ""; // kosong = origin yang sama (https://project.vercel.app)

// ====== ADMIN KEY STORAGE ======
function getAdminKey() {
  return localStorage.getItem("geekz_admin_key") || "";
}
function setAdminKey(key) {
  if (key) localStorage.setItem("geekz_admin_key", key);
}

// ====== FETCH HELPER ======
async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";
  const adminKey = getAdminKey();
  if (adminKey) headers["X-Admin-Key"] = adminKey;

  const res = await fetch(API_BASE + path, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// ====== LOGIN ======
async function tryLogin() {
  const pass = $("admin-pass").value.trim();
  if (!pass) {
    $("login-msg").textContent = "Isi password terlebih dahulu.";
    return;
  }
  setAdminKey(pass);

  const { status, data } = await apiFetch("/api/admin/login", {
    method: "POST",
    body: {}
  });

  if (!data.ok || status !== 200) {
    $("login-msg").textContent =
      "Login gagal: " + (data.message || "invalid password");
    localStorage.removeItem("geekz_admin_key");
    return;
  }

  $("login-msg").textContent = "";
  $("login-card").style.display = "none";
  $("admin-card").style.display = "block";
  $("list-card").style.display = "block";
  loadLicenses();
}

// ====== LIST LICENSE ======
function renderLicenses(items) {
  const tbody = $("tbl-body");
  tbody.innerHTML = "";
  items.forEach(it => {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    tr.innerHTML = `
      <td>${it.licenseKey}</td>
      <td>${it.ownerEmail || "-"}</td>
      <td class="${
        it.status === "active"
          ? "status-active"
          : it.status === "unused"
          ? "status-unused"
          : "status-other"
      }">${it.status}</td>
      <td>${
        it.deviceId
          ? `${it.deviceName || ""}<br><span class="small">${it.deviceId}</span>`
          : "<span class='small'>-</span>"
      }</td>
      <td>
        <span class="small">Aktif: ${
          it.firstActivated
            ? new Date(it.firstActivated).toLocaleString("id-ID")
            : "-"
        }</span><br>
        <span class="small">Last: ${
          it.lastCheckin
            ? new Date(it.lastCheckin).toLocaleString("id-ID")
            : "-"
        }</span>
      </td>
    `;
    tr.addEventListener("click", () => {
      $("f-licenseKey").value = it.licenseKey;
      $("f-ownerEmail").value = it.ownerEmail || "";
      $("f-status").value = it.status || "unused";
      $("admin-msg").textContent =
        "License dimuat ke form. Edit lalu klik Simpan / Update.";
    });
    tbody.appendChild(tr);
  });
}

async function loadLicenses() {
  $("admin-msg").textContent = "Memuat daftar license...";
  const { status, data } = await apiFetch("/api/admin/licenses-list");
  if (!data.ok || status !== 200) {
    $("admin-msg").textContent =
      "Gagal load license: " + (data.message || "Unknown error";
    return;
  }
  $("admin-msg").textContent = "";
  renderLicenses(data.items || []);
}

// ====== FORM ACTIONS ======
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
    $("admin-msg").textContent =
      "Gagal simpan license: " + (data.message || "Unknown error");
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
    $("admin-msg").textContent =
      "Gagal hapus license: " + (data.message || "Unknown error");
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

// ====== INIT ======
window.addEventListener("DOMContentLoaded", () => {
  $("btn-login").addEventListener("click", tryLogin);
  $("admin-pass").addEventListener("keydown", e => {
    if (e.key === "Enter") tryLogin();
  });

  $("btn-save").addEventListener("click", saveLicense);
  $("btn-delete").addEventListener("click", deleteLicense);
  $("btn-clear").addEventListener("click", clearForm);

  // kalau sudah pernah login, coba auto-login
  if (getAdminKey()) {
    tryLogin();
  }
});