"""storyboard_html — halaman tinjauan storyboard (out/storyboard.html): lembar kontak per bagian video.

Tugas halaman: pengguna melihat video bagian demi bagian, menemukan yang perlu diubah, lalu MENYETUJUI atau MEMINTA
REVISI. Lapisan pertama memakai bahasa pengguna ("Teks di belakang kepala", "muncul di kata 'Halo'"); istilah teknis
(efek@versi, anchor, masuk/keluar) dilipat di "Detail teknis". Satu file HTML mandiri (CSS/JS sebaris), bekerja tanpa
internet; font diambil dari pipeline/fonts lewat path relatif, dengan cadangan font sistem.

Dipanggil oleh storyboard.storyboard(); data yang sama juga ditulis ke out/storyboard.json.
"""
from __future__ import annotations

import html
import json
import os
import re
from functools import lru_cache
from pathlib import Path

import qa
from sistem import ROOT, GagalPipeline, resolve

# nama jenis elemen dalam bahasa pengguna
JENIS = {"judul": "Judul", "teks": "Teks", "kartu": "Kartu", "cta": "Ajakan bertindak", "depth": "Teks di belakang kepala",
         "info": "Kartu info", "chip": "Label", "gambar": "Gambar", "broll": "B-roll", "push": "Zoom pelan",
         "kamera": "Gerak kamera", "transisi": "Transisi", "latar": "Latar panel", "remotion": "Grafis", "caption": "Caption"}
# warna lajur di linimasa lengkap (lembut di atas kertas; teks lajur memakai tinta)
WARNA_LAJUR = {"judul": "#B9D3F0", "teks": "#C9D9EC", "kartu": "#D6CDEE", "cta": "#F2D98B", "depth": "#F0C4D1",
               "remotion": "#BFE3CF", "gambar": "#F1CFAE", "broll": "#EDB8B5", "push": "#D9DDE1", "info": "#C4DDF1",
               "chip": "#DCCDF0", "kamera": "#D9DDE1", "latar": "#D2D7DC", "caption": "#E2E5E2", "beat": "#1D2023"}


def e(x) -> str:
    return html.escape(str(x)) if x is not None else ""


def aksen(x) -> str:
    """*kata* → <strong>kata</strong> (setelah di-escape)."""
    bagian = e(x).split("*")
    return "".join(f"<strong>{b}</strong>" if i % 2 else b for i, b in enumerate(bagian))


def md(x) -> str:
    """Teks aturan modul (markdown ringan): `kode` → <code>kode</code> setelah di-escape."""
    return re.sub(r"`([^`]+)`", r"<code>\1</code>", e(x))


def ringkas_aturan(x: str, maks: int = 90) -> str:
    """Klausa utama aturan untuk catatan per elemen (teks lengkap ada di 'Pemeriksaan otomatis')."""
    x = re.split(r"\s+\(|;\s", x, maxsplit=1)[0].strip()
    return x if len(x) <= maks else x[:maks].rsplit(" ", 1)[0] + "…"


def polos(x) -> str:
    return str(x or "").replace("*", "")


def tc(t: float) -> str:
    """Kode waktu m:ss,d (koma desimal Indonesia)."""
    t = max(0.0, t)
    return f"{int(t // 60)}:{t % 60:04.1f}".replace(".", ",")


def dtk(x: float) -> str:
    return f"{x:.1f}".replace(".", ",") + " dtk"


@lru_cache(maxsize=None)
def label_efek(ref: str | None) -> str | None:
    """'coret@0.1' → 'Coret kata' (judul modul efek); None bila tidak ada."""
    if not ref:
        return None
    nama = ref.partition("@")[0]
    try:
        teks = resolve("efek", nama).path.read_text(encoding="utf-8")
    except (GagalPipeline, OSError):
        return nama
    m = re.search(r"^# .*?—\s*(?:Efek:\s*)?(.+)$", teks, re.M)
    return re.sub(r"\s*\([^)]*\)\s*$", "", m.group(1)).strip() if m else nama


def label_modul(ref: str) -> str:
    """'glass-tech@0.5' → 'Glass Tech'."""
    return ref.partition("@")[0].replace("-", " ").title()


def uraian(it: dict) -> tuple[str, str]:
    """(jenis, isi HTML) satu elemen dalam bahasa pengguna."""
    tipe, efek = it["tipe"], it.get("efek")
    teks = it.get("teks") or ""
    if tipe == "remotion":
        isi = "" if teks in ("", it.get("komposisi")) else aksen(teks)
        return label_efek(efek) or JENIS["remotion"], isi
    if tipe in ("kamera", "transisi"):
        return JENIS[tipe], e(label_efek(efek) or "")
    if tipe == "push":
        return JENIS["push"], ""
    if tipe in ("broll", "gambar"):
        return JENIS[tipe], e(os.path.basename(str(teks)))
    jenis = JENIS.get(tipe, tipe)
    if efek and tipe not in ("depth",):
        jenis = f"{jenis} ({label_efek(efek)})"
    return jenis, aksen(teks)


def teks_uraian(it: dict) -> str:
    """Uraian satu elemen sebagai teks polos (tanpa HTML), mis. 'Gambar logo-otca.png'."""
    jenis, isi = uraian(it)
    isi = html.unescape(re.sub(r"<[^>]+>", "", isi))
    return f"{jenis} {isi}".strip()


def anchor_teks(a) -> str:
    if not a:
        return ""
    if "kata" in a:
        ke = f" yang ke-{a['ke']}" if a.get("ke", 1) != 1 else ""
        return f"muncul di kata “{a['kata']}”{ke}"
    if "beat" in a:
        return f"mengikuti bagian {a['beat']}"
    return ""


def anchor_teknis(a) -> str:
    if not a:
        return ""
    if "kata" in a:
        return f"kata “{a['kata']}”" + (f" ke-{a['ke']}" if a.get("ke", 1) != 1 else "") + \
               (f" {a['offset']:+.2f}s" if a.get("offset") else "")
    if "beat" in a:
        return f"beat {a['beat']} ({a.get('ujung', 'mulai')})"
    return ""


def _font(nama: str, out: Path) -> str:
    """URL relatif ke pipeline/fonts dari folder storyboard.html (tetap bekerja tanpa internet)."""
    return Path(os.path.relpath(ROOT / "pipeline" / "fonts" / nama, out)).as_posix()


# ============================================================== halaman

def halaman(p, r, items, thumbs, hasil, status, n, isu, layout, sha: str, lebar_thumb: int) -> str:
    m = p.manifest
    dur = r.dur
    words = (r.bs.get("_words") or {}).get("kata", [])
    persetujuan = m.get("persetujuan") or {}
    disetujui = persetujuan.get("beat_sheet_sha") == sha
    aturan = {h["id"]: h["aturan"] for h in hasil}
    beats = r.bs["beats"]

    def isu_el(i: dict) -> list[tuple]:
        return isu.get(i["id"], [])

    def tingkat(daftar: list[tuple]) -> str:
        if any(s == qa.GAGAL for _, s, _ in daftar):
            return "masalah"
        return "catatan" if daftar else ""

    # elemen yang hadir hampir sepanjang video (logo, latar) dicantumkan sekali di kepala, bukan di bagian pertama
    sepanjang = [i for i in items if i["selesai"] - i["mulai"] >= 0.8 * dur]
    id_sepanjang = {i["id"] for i in sepanjang}

    # ---------------------------------------------------------- per bagian
    nomor = {b["id"]: k + 1 for k, b in enumerate(beats)}
    semua_frame, bagian_html, pita = [], [], []
    for b in beats:
        el = [i for i in items if i["beat"] == b["id"] and i["id"] not in id_sepanjang]
        isu_b = [x for i in el for x in isu_el(i)]
        tk = tingkat(isu_b)
        nama = b.get("beat") or b["id"]
        # frame
        th = [t for t in thumbs if b["mulai"] <= t["t"] < b["selesai"]]
        frame_html = []
        for t in th:
            ids = [x.strip() for x in t["label"].split(",")]
            el_t = [i for i in el if i["id"] in ids]
            tf = tingkat([x for i in el_t for x in isu_el(i)])
            ket = ", ".join(dict.fromkeys(uraian(i)[0] for i in el_t)) or "Talking head"
            k = len(semua_frame)
            semua_frame.append({"src": t["file"], "t": tc(t["t"]), "ket": ket, "bagian": f"{nomor[b['id']]}. {nama}"})
            frame_html.append(
                f'<figure class="frame{" frame--" + tf if tf else ""}">'
                f'<button type="button" class="frame__tombol" data-frame="{k}" aria-label="Perbesar frame {tc(t["t"])}: {e(ket)}">'
                f'<img src="{e(t["file"])}" width="{lebar_thumb}" height="{round(lebar_thumb * 16 / 9)}" alt="" loading="lazy"></button>'
                f'<figcaption><span class="kode">{tc(t["t"])}</span> {e(ket)}</figcaption></figure>')
        # ucapan: kata pemicu elemen disorot
        pemicu = {re.sub(r"[^\w]", "", (i.get("anchor") or {}).get("kata", "").lower()) for i in el} - {""}
        kata = []
        for w in words:
            if b["mulai"] - 0.05 <= w["s"] < b["selesai"]:
                k = re.sub(r"[^\w]", "", w["w"].lower())
                kata.append(f'<mark title="{tc(w["s"])}">{e(w["w"])}</mark>' if k in pemicu else e(w["w"]))
        ucapan = " ".join(kata)
        # elemen
        baris = []
        for i in el:
            jenis, isi = uraian(i)
            waktu = f'{tc(i["mulai"])}–{tc(i["selesai"])}'
            pemicu_teks = anchor_teks(i.get("anchor"))
            catatan_qa = "".join(
                f'<li class="isu isu--{"masalah" if s == qa.GAGAL else "catatan"}">'
                f'<span class="isu__aturan">{e(a)} {md(ringkas_aturan(aturan.get(a, "")))}</span><span class="isu__detail">{e(x)}</span></li>'
                for a, s, x in isu_el(i))
            baris.append(
                f'<li class="elemen{" elemen--" + tingkat(isu_el(i)) if isu_el(i) else ""}">'
                f'<p class="elemen__jenis">{e(jenis)}</p>'
                f'{f"<p class=elemen__isi>{isi}</p>" if isi else ""}'
                f'<p class="elemen__waktu"><span class="kode">{waktu}</span>{", " + e(pemicu_teks) if pemicu_teks else ""}</p>'
                f'{f"<ul class=isu-daftar>{catatan_qa}</ul>" if catatan_qa else ""}</li>')
        teknis = "".join(
            f'<tr><td><code>{e(i["id"])}</code></td><td>{e(i["tipe"])}</td><td>{e(i.get("efek") or "")}</td>'
            f'<td class="kode">{i["mulai"]:.2f}–{i["selesai"]:.2f}</td><td>{e(anchor_teknis(i.get("anchor")))}</td>'
            f'<td>{e(i.get("masuk") or "")}/{e(i.get("keluar") or "")}</td><td>{e(polos(i.get("teks")))}</td></tr>' for i in el)
        lencana = {"masalah": f'<p class="lencana lencana--masalah">{sum(1 for _, s, _ in isu_b if s == qa.GAGAL)} perlu diperbaiki</p>',
                   "catatan": f'<p class="lencana lencana--catatan">{len(isu_b)} catatan</p>'}.get(tk, "")
        bagian_html.append(f"""
<section class="bagian" id="b-{e(b['id'])}" data-bagian="{e(b['id'])}" aria-labelledby="j-{e(b['id'])}">
  <header class="bagian__kepala">
    <span class="bagian__no" aria-hidden="true">{nomor[b['id']]}</span>
    <div><h2 id="j-{e(b['id'])}">{e(nama)}</h2>
    <p class="bagian__waktu"><span class="kode">{tc(b['mulai'])}–{tc(b['selesai'])}</span> <span class="redup">({dtk(b['selesai'] - b['mulai'])})</span></p></div>
    {lencana}
  </header>
  <div class="bagian__badan">
  <div class="strip" role="list" aria-label="Frame bagian {e(nama)}">{''.join(f'<div role="listitem">{x}</div>' for x in frame_html)}</div>
  <div class="bagian__isi">
    <div class="ucapan">{f'<p class="ucapan__teks">{ucapan}</p>' if ucapan else '<p class="redup">Tanpa ucapan di bagian ini.</p>'}</div>
    <div class="bagian__elemen">
      {f'<ul class="elemen-daftar">{"".join(baris)}</ul>' if baris else '<p class="redup">Hanya talking head dan caption.</p>'}
      {f'<details class="teknis"><summary>Detail teknis</summary><div class="tabel-gulir"><table><thead><tr><th>ID</th><th>Tipe</th><th>Efek</th><th>Waktu (s)</th><th>Pemicu</th><th>Masuk/keluar</th><th>Teks</th></tr></thead><tbody>{teknis}</tbody></table></div></details>' if teknis else ''}
      <label class="catatan"><span>Catatan revisi untuk bagian ini</span>
        <textarea data-catatan="{e(b['id'])}" rows="2" placeholder="Mis. ganti teks judul, pindahkan coret ke kata “sertifikat”"></textarea></label>
    </div>
  </div>
  </div>
</section>""")
        pita.append(f'<a class="pita__bagian{" pita__bagian--" + tk if tk else ""}" href="#b-{e(b["id"])}" '
                    f'style="flex-grow:{max(0.4, b["selesai"] - b["mulai"]):.2f}" data-ke="b-{e(b["id"])}" '
                    f'title="{e(nama)}, {tc(b["mulai"])}–{tc(b["selesai"])}"><span class="pita__no">{nomor[b["id"]]}</span>'
                    f'<span class="pita__nama">{e(nama)}</span></a>')

    # ---------------------------------------------------------- pemeriksaan otomatis
    gagal = [h for h in hasil if h["status"] == qa.GAGAL]
    catatan = [h for h in hasil if h["status"] == qa.PERINGATAN]
    lulus = [h for h in hasil if h["status"] == qa.LULUS]
    nanti = [h for h in hasil if h["status"] == qa.LEWAT or h["id"] in qa.BUTUH_RENDER]

    def daftar_qa(xs, kelas):
        return "".join(f'<li class="qa qa--{kelas}"><p class="qa__judul"><span class="kode">{e(x["id"])}</span> {md(x["aturan"])}</p>'
                       + (f'<ul class="qa__detail">{"".join(f"<li>{e(d)}</li>" for d in x["detail"][:8])}</ul>' if x["detail"] else "")
                       + "</li>" for x in xs)

    manual = "".join(f'<li><label class="centang"><input type="checkbox" data-cek="{e(x["id"])}">'
                     f'<span><span class="kode">{e(x["id"])}</span> {md(x["aturan"])}</span></label></li>'
                     for x in hasil if x["manual"])

    # ---------------------------------------------------------- keputusan
    if disetujui:
        kunci, judul_k = "disetujui", "Sudah disetujui"
        isi_k = f"Versi beat-sheet ini disetujui {e(persetujuan.get('waktu', '').replace('T', ' '))}. Render penuh boleh dijalankan."
    elif status == qa.GAGAL:
        kunci, judul_k = "masalah", "Perlu diperbaiki dulu"
        isi_k = (f'<a href="#pemeriksaan">{len(gagal)} pemeriksaan otomatis gagal</a>. Tandai yang perlu diubah di catatan '
                 f"revisi, lalu minta revisi. Menyetujui tetap bisa, tetapi QA setelah render kemungkinan gagal.")
    elif catatan:
        kunci, judul_k = "catatan", "Siap disetujui"
        isi_k = f'<a href="#pemeriksaan">{len(catatan)} catatan ringan</a> dari pemeriksaan otomatis. Tidak ada yang menghalangi render.'
    else:
        kunci, judul_k = "siap", "Siap disetujui"
        isi_k = "Semua pemeriksaan otomatis yang bisa dicek sebelum render lolos."

    data_js = {"proyek": m["proyek"], "sha": sha, "shaPendek": sha[:10], "frame": semua_frame,
               "bagian": [{"id": b["id"], "nama": f"{nomor[b['id']]}. {b.get('beat') or b['id']}",
                           "waktu": f"{tc(b['mulai'])}–{tc(b['selesai'])}"} for b in beats],
               "setuju": (f"Storyboard {m['proyek']} disetujui (beat-sheet {sha[:10]}). "
                          f"Catat persetujuan dengan video.py setuju {m['proyek']}, lalu lanjut render penuh."),
               "perintah": {"setuju": f"video.py setuju {m['proyek']}", "storyboard": f"video.py storyboard {m['proyek']}",
                            "semua": f"video.py semua {m['proyek']}"}}

    efek = sorted({label_efek(i["efek"]) for i in items if i.get("efek")} - {None})
    data_json = json.dumps(data_js, ensure_ascii=False).replace("</", "<\\/")  # aman di dalam <script>
    out_dir = p.out
    return f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Storyboard: {e(m.get('judul') or m['proyek'])}</title>
<style>
@font-face{{font-family:"Inter SB";src:url("{_font('Inter-Variable.ttf', out_dir)}") format("truetype");font-weight:100 900;font-display:swap}}
@font-face{{font-family:"Anton SB";src:url("{_font('Anton-Regular.ttf', out_dir)}") format("truetype");font-display:swap}}
{CSS}
</style>
</head>
<body>
<a class="lompat" href="#isi">Lompat ke bagian pertama</a>
<header class="kepala">
  <div class="kepala__judul">
    <p class="kepala__proyek">{e(m['proyek'])}</p>
    <h1>{e(m.get('judul') or m['proyek'])}</h1>
    <dl class="fakta">
      <div><dt>Durasi</dt><dd>{dtk(dur)}</dd></div>
      <div><dt>Bagian</dt><dd>{len(beats)}</dd></div>
      <div><dt>Gaya</dt><dd>{e(label_modul(p.gaya.ref))}</dd></div>
      <div><dt>Template</dt><dd>{e(label_modul(p.template.ref))}</dd></div>
      <div><dt>Efek</dt><dd>{e(', '.join(efek) or 'tidak ada')}</dd></div>
      {f'<div><dt>Sepanjang video</dt><dd>{e(", ".join(teks_uraian(i) for i in sepanjang))}</dd></div>' if sepanjang else ''}
    </dl>
  </div>
  <aside class="keputusan keputusan--{kunci}" aria-labelledby="keputusan-judul">
    <p class="keputusan__judul" id="keputusan-judul">{judul_k}</p>
    <p class="keputusan__isi">{isi_k}</p>
    <div class="keputusan__aksi">
      {'' if disetujui else f'<button type="button" class="tombol {"tombol--utama" if kunci != "masalah" else ""}" data-salin="setuju">Setujui storyboard</button>'}
      <a class="tombol {"tombol--utama" if kunci == "masalah" else ""}" href="#revisi">Minta revisi</a>
    </div>
    <p class="keputusan__catatan">{'' if disetujui else 'Tombol setujui menyalin pesan persetujuan. Tempel di Claude Code untuk melanjutkan.'}</p>
  </aside>
</header>

<nav class="pita" aria-label="Bagian video">
  <div class="pita__jalur">{''.join(pita)}</div>
</nav>

<main id="isi">
{''.join(bagian_html)}

<section class="blok" id="pemeriksaan" aria-labelledby="j-pemeriksaan">
  <h2 id="j-pemeriksaan">Pemeriksaan otomatis</h2>
  <p class="blok__ringkas">{len(gagal)} perlu diperbaiki, {len(catatan)} catatan, {len(lulus)} lolos. Loudness, ekspor, dan mask
  per frame baru dicek setelah render.</p>
  {f'<h3>Perlu diperbaiki</h3><ul class="qa-daftar">{daftar_qa(gagal, "masalah")}</ul>' if gagal else ''}
  {f'<h3>Catatan</h3><ul class="qa-daftar">{daftar_qa(catatan, "catatan")}</ul>' if catatan else ''}
  <details class="lipat"><summary>Lolos ({len(lulus)})</summary><ul class="qa-daftar">{daftar_qa(lulus, "lolos")}</ul></details>
  {f'<details class="lipat"><summary>Dicek setelah render ({len(nanti)})</summary><ul class="qa-daftar">{daftar_qa(nanti, "nanti")}</ul></details>' if nanti else ''}
</section>

<section class="blok" id="checklist" aria-labelledby="j-checklist">
  <h2 id="j-checklist">Periksa sendiri setelah render</h2>
  <p class="blok__ringkas">Hal yang tidak bisa diukur mesin. Centangan tersimpan di browser ini.</p>
  <ul class="centang-daftar">{manual or '<li class="redup">Tidak ada.</li>'}</ul>
</section>

<section class="blok" id="revisi" aria-labelledby="j-revisi">
  <h2 id="j-revisi">Minta revisi</h2>
  <p class="blok__ringkas">Catatan dari tiap bagian dirangkum di sini. Salin, tempel di Claude Code, lalu storyboard dibuat ulang.</p>
  <label class="catatan"><span>Catatan umum</span>
    <textarea data-catatan="_umum" rows="2" placeholder="Mis. tempo terlalu cepat di paruh kedua"></textarea></label>
  <pre class="rangkuman" id="rangkuman" aria-live="polite"></pre>
  <button type="button" class="tombol tombol--utama" data-salin="revisi" disabled>Salin permintaan revisi</button>
  <details class="lipat"><summary>Perintah manual</summary>
    <p>Setujui versi ini: <code>{e(data_js['perintah']['setuju'])}</code>, lalu render: <code>{e(data_js['perintah']['semua'])}</code>.
    Setelah mengubah beat-sheet.json: <code>{e(data_js['perintah']['storyboard'])}</code>.</p>
    <p class="redup">Versi beat-sheet: <code>{sha[:10]}</code>. Video {dtk(dur)}, {r.n_frame} frame, {p.fps} fps.</p>
  </details>
</section>

<section class="blok" id="linimasa" aria-labelledby="j-linimasa">
  <details class="lipat"><summary id="j-linimasa">Linimasa lengkap</summary>
  {_linimasa(r, items, layout, thumbs, beats)}
  </details>
</section>
</main>

<dialog class="lihat" id="lihat" aria-label="Frame diperbesar">
  <figure><img id="lihat-img" alt=""><figcaption id="lihat-ket"></figcaption></figure>
  <div class="lihat__aksi">
    <button type="button" class="tombol" data-geser="-1">Sebelumnya</button>
    <button type="button" class="tombol" data-geser="1">Berikutnya</button>
    <button type="button" class="tombol tombol--utama" data-tutup>Tutup</button>
  </div>
</dialog>
<p class="sr" id="umum" aria-live="polite"></p>
<script type="application/json" id="data">{data_json}</script>
<script>{JS}</script>
</body>
</html>"""


def _linimasa(r, items, layout, thumbs, beats) -> str:
    """Linimasa berlapis untuk pengguna mahir: bagian, elemen (lajur), kamera, caption, bunyi."""
    dur = r.dur
    pct = lambda t: f"{100 * t / dur:.3f}%"  # noqa: E731

    def blok(mulai, selesai, warna, label, judul):
        return (f'<div class="lm__blok" style="left:{pct(mulai)};width:{pct(max(selesai - mulai, dur / 400))};background:{warna}" '
                f'title="{e(judul)}">{e(label)}</div>')

    baris = [("Bagian", "".join(blok(b["mulai"], b["selesai"], "#1D2023", b.get("beat") or b["id"],
                                     f'{b.get("beat") or b["id"]}, {tc(b["mulai"])}–{tc(b["selesai"])}') for b in beats))]
    vis = [i for i in items if i["tipe"] not in ("push", "broll")]
    lajur: list[list[dict]] = []
    for it in vis:
        for ln in lajur:
            if ln[-1]["selesai"] <= it["mulai"] + 1e-3:
                ln.append(it)
                break
        else:
            lajur.append([it])
    for k, ln in enumerate(lajur):
        baris.append(("Elemen" if k == 0 else "", "".join(
            blok(i["mulai"], i["selesai"], WARNA_LAJUR.get(i["tipe"], "#D9DDE1"), uraian(i)[0],
                 f'{uraian(i)[0]}: {polos(i.get("teks"))[:80]} ({tc(i["mulai"])}–{tc(i["selesai"])})') for i in ln)))
    kam = [i for i in items if i["tipe"] in ("push", "broll")]
    if kam:
        baris.append(("Kamera", "".join(blok(i["mulai"], i["selesai"], WARNA_LAJUR.get(i["tipe"], "#D9DDE1"), uraian(i)[0],
                                             f'{uraian(i)[0]} ({tc(i["mulai"])}–{tc(i["selesai"])})') for i in kam)))
    cap = [x for x in layout["elemen"] if x["tipe"] == "caption"]
    if cap:
        baris.append(("Caption", "".join(blok(c["mulai"], c["selesai"], WARNA_LAJUR["caption"], c["teks"], c["teks"]) for c in cap)))
    if r.sfx:
        baris.append(("Bunyi", "".join(f'<span class="lm__titik" style="left:{pct(s["t"])}" title="{e(s["sumber"])}, {tc(s["t"])}"></span>'
                                       for s in r.sfx)))
    langkah = 1 if dur <= 20 else 5
    sumbu = "".join(f'<span style="left:{pct(s)}">{s // 60}:{s % 60:02d}</span>' for s in range(0, int(dur) + 1, langkah))
    isi = "".join(f'<div class="lm__baris"><span class="lm__label">{e(lbl)}</span><div class="lm__jalur">{konten}</div></div>'
                  for lbl, konten in baris)
    return f'<div class="lm"><div class="lm__baris lm__baris--sumbu"><span class="lm__label"></span><div class="lm__sumbu">{sumbu}</div></div>{isi}</div>'


# CSS & JS dimuat dari file terpisah di folder yang sama (lebih mudah dirawat daripada string panjang di Python)
_DIR = Path(__file__).resolve().parent / "storyboard_aset"
CSS = (_DIR / "storyboard.css").read_text(encoding="utf-8")
JS = (_DIR / "storyboard.js").read_text(encoding="utf-8")
