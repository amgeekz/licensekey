const API_BASE = "https://license.amgeekz.my.id/";

const $ = id => document.getElementById(id);

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("id-ID");
}

function renderProductStatus(productId, productData) {
  const element = document.getElementById(`product-${productId}`);
  const releaseButton = document.getElementById(`btn-release-${productId}`);
  
  if (!element) return;
  
  if (!productData || productData.status === "unused") {
    element.textContent = "❌ Belum diaktivasi";
    element.className = "info-value status-other";
    if (releaseButton) releaseButton.style.display = "none";
  } else if (productData.status === "active") {
    const deviceName = productData.deviceName || "Unknown Device";
    element.textContent = `✅ Aktif (${deviceName})`;
    element.className = "info-value status-active";
    if (releaseButton) releaseButton.style.display = "inline-flex";
  } else {
    element.textContent = "⛔ Dinonaktifkan";
    element.className = "info-value status-other";
    if (releaseButton) releaseButton.style.display = "none";
  }
}

function setMsg(text, type = "info") {
  const msg = $("msg");
  if (!msg) return;
  
  msg.textContent = text || "";
  msg.className = "message";
  if (type === "error") {
    msg.classList.add("error");
  } else if (type === "success") {
    msg.classList.add("success");
  }
}

async function releaseDevice(licenseKey, product) {
  if (!confirm(`Yakin ingin melepaskan device ${product} dari license ini?`)) return;

  setMsg(`Memproses pelepasan device ${product}...`);

  try {
    const res = await fetch(`${API_BASE}/api/license/release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        licenseKey: licenseKey,
        product: product
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (!data.ok) {
      setMsg(data.message || `Gagal melepaskan device ${product}.`, "error");
      return;
    }

    setMsg(`✅ ${data.message}`, "success");
    
    // Refresh license info setelah release
    setTimeout(() => {
      $("btn-check").click();
    }, 1500);
    
  } catch (e) {
    console.error("Release error:", e);
    setMsg("❌ Gagal terhubung ke server.", "error");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const input = $("lic-input");
  const btnCheck = $("btn-check");
  const btnRelease = $("btn-release");
  const infoBox = $("lic-info");
  const statusEl = $("lic-status");
  const firstEl = $("lic-first");
  const lastEl = $("lic-last");

  if (!input || !btnCheck || !infoBox) {
    console.error("Element not found");
    return;
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
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();

      console.log("Full API Response:", data);
      console.log("License Data:", data.license);
      console.log("Products Data:", data.license?.products);

      if (!data.ok) {
        setMsg(data.message || "License tidak ditemukan / invalid.", "error");
        return;
      }

      const lic = data.license;

      statusEl.textContent = lic.status || "-";
      statusEl.className = "info-value " + (
        lic.status === "active" ? "status-active" :
        lic.status === "unused" ? "status-unused" :
        "status-other"
      );

      const products = lic.products || {};
      console.log("Digiflazz Product:", products.digiflazz);
      
      renderProductStatus("digiflazz", products.digiflazz);
      renderProductStatus("whatsapp", products.whatsapp);
      renderProductStatus("telegram", products.telegram);

      // Setup release buttons untuk masing-masing product
      const releaseDigiflazz = $("btn-release-digiflazz");
      const releaseWhatsapp = $("btn-release-whatsapp");
      const releaseTelegram = $("btn-release-telegram");

      if (releaseDigiflazz) {
        releaseDigiflazz.onclick = () => releaseDevice(key, "digiflazz");
      }
      if (releaseWhatsapp) {
        releaseWhatsapp.onclick = () => releaseDevice(key, "whatsapp");
      }
      if (releaseTelegram) {
        releaseTelegram.onclick = () => releaseDevice(key, "telegram");
      }

      firstEl.textContent = formatDate(lic.firstActivated);
      lastEl.textContent = formatDate(lic.lastCheckin);

      infoBox.style.display = "block";
      setMsg("");
    } catch (e) {
      console.error("Fetch error:", e);
      setMsg("Gagal terhubung ke server.", "error");
    }
  });

  // Button release lama (untuk backward compatibility)
  btnRelease.addEventListener("click", async () => {
    const key = input.value.trim();
    if (!key) {
      setMsg("Masukkan license key dulu.", "error");
      return;
    }

    if (!confirm("Yakin ingin melepaskan device Digiflazz dari license ini?")) return;

    setMsg("Memproses pelepasan device Digiflazz...");

    try {
      const res = await fetch(`${API_BASE}/api/license/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          licenseKey: key,
          product: "digiflazz"
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (!data.ok) {
        setMsg(data.message || "Gagal melepaskan device.", "error");
        return;
      }

      setMsg("Device berhasil dilepas. License dapat digunakan di perangkat lain.", "success");
      infoBox.style.display = "none";
      
      input.value = "";
    } catch (e) {
      console.error("Release error:", e);
      setMsg("Gagal terhubung ke server.", "error");
    }
  });
  
  const params = new URLSearchParams(location.search);
  const lk = params.get("license");
  if (lk) {
    input.value = lk;
    setTimeout(() => {
      btnCheck.click();
    }, 100);
  }

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      btnCheck.click();
    }
  });
});