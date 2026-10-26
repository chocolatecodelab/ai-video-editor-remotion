// Storyboard: catatan revisi tersimpan per versi beat-sheet, salin pesan setujui/revisi, pita bagian mengikuti gulir,
// frame bisa diperbesar (panah kiri/kanan, Esc). Tanpa pustaka; halaman tetap terbaca tanpa JavaScript.
(() => {
  const D = JSON.parse(document.getElementById("data").textContent);
  const kunci = `storyboard:${D.proyek}:${D.sha}`;
  const umum = document.getElementById("umum");
  const baca = () => { try { return JSON.parse(localStorage.getItem(kunci) || "{}"); } catch { return {}; } };
  const simpan = (x) => { try { localStorage.setItem(kunci, JSON.stringify(x)); } catch { /* mode privat */ } };
  const keadaan = Object.assign({ catatan: {}, cek: {} }, baca());

  // ---------- catatan revisi → rangkuman
  const rangkuman = document.getElementById("rangkuman");
  const tombolRevisi = document.querySelector('[data-salin="revisi"]');
  const teksRevisi = () => {
    const baris = D.bagian
      .filter((b) => (keadaan.catatan[b.id] || "").trim())
      .map((b) => `- Bagian ${b.nama} (${b.waktu}): ${keadaan.catatan[b.id].trim()}`);
    const u = (keadaan.catatan._umum || "").trim();
    if (u) baris.push(`- Umum: ${u}`);
    if (!baris.length) return "";
    return `Revisi storyboard ${D.proyek} (beat-sheet ${D.shaPendek}):\n${baris.join("\n")}\nSetelah merevisi beat-sheet, buat storyboard ulang.`;
  };
  const perbarui = () => {
    const t = teksRevisi();
    rangkuman.textContent = t;
    if (tombolRevisi) tombolRevisi.disabled = !t;
  };
  document.querySelectorAll("textarea[data-catatan]").forEach((ta) => {
    ta.value = keadaan.catatan[ta.dataset.catatan] || "";
    ta.addEventListener("input", () => {
      keadaan.catatan[ta.dataset.catatan] = ta.value;
      simpan(keadaan);
      perbarui();
    });
  });
  perbarui();

  // ---------- checklist manual
  document.querySelectorAll("input[data-cek]").forEach((c) => {
    c.checked = !!keadaan.cek[c.dataset.cek];
    c.addEventListener("change", () => { keadaan.cek[c.dataset.cek] = c.checked; simpan(keadaan); });
  });

  // ---------- salin
  const salinTeks = async (teks) => {
    try { await navigator.clipboard.writeText(teks); return true; } catch {
      const ta = Object.assign(document.createElement("textarea"), { value: teks });
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand("copy"); ta.remove(); return ok;
    }
  };
  document.querySelectorAll("[data-salin]").forEach((b) => {
    const label = b.textContent;
    b.addEventListener("click", async () => {
      const setuju = b.dataset.salin === "setuju";
      const ok = await salinTeks(setuju ? D.setuju : teksRevisi());
      b.textContent = ok ? (setuju ? "Pesan persetujuan tersalin" : "Permintaan revisi tersalin") : "Gagal menyalin";
      b.classList.toggle("tombol--tersalin", ok);
      umum.textContent = ok ? `${b.textContent}. Tempel di Claude Code.` : "Gagal menyalin. Salin manual dari halaman ini.";
      setTimeout(() => { b.textContent = label; b.classList.remove("tombol--tersalin"); }, 2400);
    });
  });

  // ---------- pita bagian mengikuti gulir
  const tautan = new Map([...document.querySelectorAll(".pita__bagian")].map((a) => [a.dataset.ke, a]));
  const terlihat = new Map();
  const io = new IntersectionObserver((xs) => {
    xs.forEach((x) => terlihat.set(x.target.id, x.isIntersecting ? x.intersectionRatio : 0));
    let aktif = null, maks = 0;
    terlihat.forEach((r, id) => { if (r > maks) { maks = r; aktif = id; } });
    tautan.forEach((a, id) => a.setAttribute("aria-current", String(id === aktif)));
  }, { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "-64px 0px -30% 0px" });
  document.querySelectorAll(".bagian").forEach((s) => io.observe(s));

  // ---------- frame diperbesar
  const dlg = document.getElementById("lihat");
  const img = document.getElementById("lihat-img");
  const ket = document.getElementById("lihat-ket");
  let ke = 0, asal = null;
  const tampil = (k) => {
    ke = (k + D.frame.length) % D.frame.length;
    const f = D.frame[ke];
    img.src = f.src;
    img.alt = `Frame ${f.t}, ${f.ket}`;
    ket.textContent = `${f.t}, bagian ${f.bagian}: ${f.ket} (${ke + 1} dari ${D.frame.length})`;
  };
  document.querySelectorAll("[data-frame]").forEach((b) => b.addEventListener("click", () => {
    asal = b; tampil(Number(b.dataset.frame)); dlg.showModal();
  }));
  dlg.querySelectorAll("[data-geser]").forEach((b) => b.addEventListener("click", () => tampil(ke + Number(b.dataset.geser))));
  dlg.querySelector("[data-tutup]").addEventListener("click", () => dlg.close());
  dlg.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowRight") { ev.preventDefault(); tampil(ke + 1); }
    if (ev.key === "ArrowLeft") { ev.preventDefault(); tampil(ke - 1); }
  });
  dlg.addEventListener("click", (ev) => { if (ev.target === dlg) dlg.close(); });
  dlg.addEventListener("close", () => asal && asal.focus());
})();
