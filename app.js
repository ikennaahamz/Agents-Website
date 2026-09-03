// Binds SITE_CONFIG to pages + handles lead form.
// Mode: Supabase DB if keys set, else mailto + WhatsApp fallback (still works free).
(function () {
  const cfg = window.SITE_CONFIG || {};
  const digits = (cfg.whatsapp || "").replace(/\D/g, "");
  document.querySelectorAll('[data-config="agencyName"]').forEach(e => e.textContent = cfg.agencyName || "");
  document.querySelectorAll('[data-config="email"]').forEach(e => e.textContent = cfg.email || "");
  document.querySelectorAll('[data-config="whatsapp"]').forEach(e => e.textContent = cfg.whatsapp || "");
  document.querySelectorAll('[data-config="tagline"]').forEach(e => e.textContent = cfg.tagline || "");
  const wa = document.getElementById("wa-float");
  if (wa && digits) wa.href = "https://wa.me/" + digits + "?text=" + encodeURIComponent("Hello " + (cfg.agencyName || "") + ", I need student housing in North Cyprus.");
  const ul = document.getElementById("uni-list");
  if (ul && Array.isArray(cfg.universities)) ul.innerHTML = cfg.universities.map(u => "<li>" + u.replace(/</g, "&lt;") + "</li>").join("");
  const sel = document.getElementById("uni-select");
  if (sel && Array.isArray(cfg.universities)) sel.innerHTML = '<option value="">Select university…</option>' + cfg.universities.map(u => '<option value="' + u.replace(/"/g, "&quot;") + '">' + u.replace(/</g, "&lt;") + "</option>").join("");
  const form = document.getElementById("lead-form");
  if (!form) return;
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const status = document.getElementById("form-status");
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = { name: data.name, contact: data.contact, university: data.university, message: data.message, created_at: new Date().toISOString() };
    // 1) Try Supabase if configured
    if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
      try {
        const res = await fetch(cfg.supabaseUrl + "/rest/v1/" + (cfg.supabaseTable || "leads"), {
          method: "POST",
          headers: { "apikey": cfg.supabaseAnonKey, "Authorization": "Bearer " + cfg.supabaseAnonKey, "Content-Type": "application/json", "Prefer": "return=minimal" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("DB " + res.status);
        status.textContent = "Saved! We will reply via WhatsApp/email shortly.";
        form.reset();
        return;
      } catch (err) { status.textContent = "DB save failed, opening email/WhatsApp fallback…"; }
    }
    // 2) Fallback: email + WhatsApp (free, no server)
    const subject = encodeURIComponent("Housing enquiry from " + payload.name);
    const body = encodeURIComponent("Name: " + payload.name + "\nContact: " + payload.contact + "\nUniversity: " + payload.university + "\nMessage: " + payload.message);
    window.location.href = "mailto:" + (cfg.email || "") + "?subject=" + subject + "&body=" + body;
    if (digits) window.open("https://wa.me/" + digits + "?text=" + encodeURIComponent(payload.name + " | " + payload.contact + " | " + payload.university + " | " + payload.message), "_blank");
    status.textContent = "Opened your email + WhatsApp — just hit send.";
  });
})();
