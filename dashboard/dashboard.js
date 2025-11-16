// dashboard/dashboard.js

const API_BASE = "https://licensekey-cyan.vercel.app/";

const $ = id => document.getElementById(id);

async function fetchInfo(licenseKey) {
  const res = await fetch(`${API_BASE}/api/license/info?licenseKey=${encodeURIComponent(licenseKey)}`);
  return res.json();
}

async function releaseDevice(licenseKey) {
  const res = await fetch(`${API_BASE}/api/license/release`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ licenseKey })
  });
  return res.json();
}

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("id-ID");
}

window.addEventListener("DOMContentLoaded", () => {
  const input = $("lic-input");
  const btnCheck = $("btn-check");
  const btnRelease = $("btn-release");
  const msg = $("msg");
  const infoBox = $("lic-info");
  const statusEl = $("lic-status");
  const deviceEl = $("lic-device");
  const firstEl = $("lic-first");
  const lastEl = $("lic-last");

  btnCheck.onclick = async () => {
    const key = input.value.trim();
    if (!key) {
      msg.textContent = "Masukkan license key terlebih dahulu.";
      infoBox.style.display = "none";
      return;
    }

    msg.textContent = "Mengambil data...";
    infoBox.style.display = "none";

    try {
      const data = await fetchInfo(key);
      if (!data.ok) {
        msg.textContent = "Error: " + (data.message || "Gagal cek license");
        return;
      }

      const lic = data.license;
      infoBox.style.display = "block";

      statusEl.textContent = lic.status;
      statusEl.className = "value " +
        (lic.status === "active"
          ? "status-active"
          : lic.status === "unused"
          ? "status-unused"
          : "status-other");

      deviceEl.textContent = lic.deviceId
        ? `${lic.deviceName || "(tanpa nama)"} (${lic.deviceId})`
        : "Belum terikat ke device manapun.";

      firstEl.textContent = formatDate(lic.firstActivated);
      lastEl.textContent = formatDate(lic.lastCheckin);

      msg.textContent = "";
    } catch (e) {
      console.error(e);
      msg.textContent = "Gagal terhubung ke API.";
    }
  };

  btnRelease.onclick = async () => {
    const key = input.value.trim();
    if (!key) return;

    if (!confirm("Yakin ingin melepaskan device dari license ini?")) return;

    msg.textContent = "Memproses...";
    try {
      const data = await releaseDevice(key);
      if (!data.ok) {
        msg.textContent = "Error: " + (data.message || "Gagal release");
        return;
      }
      msg.textContent = "Device dilepas. License dapat dipakai di perangkat lain.";
      infoBox.style.display = "none";
    } catch (e) {
      console.error(e);
      msg.textContent = "Gagal terhubung ke API.";
    }
  };

  // auto-isi dari ?license= di URL
  const params = new URLSearchParams(location.search);
  const lk = params.get("license");
  if (lk) {
    input.value = lk;
    btnCheck.click();
  }
});
