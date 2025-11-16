// dashboard.js

const API_BASE = "https://licensekey-cyan.vercel.app/"; // kosong = origin yang sama

const $ = id => document.getElementById(id);

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

  function setMsg(text, type = "info") {
    msg.textContent = text || "";
    msg.style.color = type === "error" ? "#f97373" : "#9ca3af";
  }

  btnCheck.addEventListener("click", async () => {
    const key = input.value.trim();
    if (!key) {
      infoBox.style.display = "none";
      setMsg("Masukkan license key terlebih dahulu.", "error");
      return;
    }

    setMsg("Mengambil data license...");
    infoBox.style.display = "none";

    try {
      const res = await fetch(
        `${API_BASE}/api/license/info?licenseKey=${encodeURIComponent(key)}`
      );
      const data = await res.json();

      if (!data.ok) {
        setMsg(data.message || "License tidak ditemukan / invalid.", "error");
        return;
      }

      const lic = data.license;

      statusEl.textContent = lic.status || "-";
      statusEl.className =
        "value " +
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

      infoBox.style.display = "block";
      setMsg("");
    } catch (e) {
      console.error(e);
      setMsg("Gagal terhubung ke server.", "error");
    }
  });

  // Lepaskan device (user sendiri)
  btnRelease.addEventListener("click", async () => {
    const key = input.value.trim();
    if (!key) {
      setMsg("Masukkan license key dulu.", "error");
      return;
    }

    if (!confirm("Yakin ingin melepaskan device dari license ini?")) return;

    setMsg("Memproses pelepasan device...");

    try {
      const res = await fetch(`${API_BASE}/api/license/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: key })
      });

      const data = await res.json();

      if (!data.ok) {
        setMsg(data.message || "Gagal melepaskan device.", "error");
        return;
      }

      setMsg("Device berhasil dilepas. License dapat digunakan di perangkat lain.");
      infoBox.style.display = "none";
    } catch (e) {
      console.error(e);
      setMsg("Gagal terhubung ke server.", "error");
    }
  });

  // auto-isi dari ?license= kalau ada
  const params = new URLSearchParams(location.search);
  const lk = params.get("license");
  if (lk) {
    input.value = lk;
    btnCheck.click();
  }
});