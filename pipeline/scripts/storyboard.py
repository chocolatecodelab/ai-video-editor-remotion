"""storyboard — pratinjau sebelum render penuh: thumbnail, timeline, timestamp, transkrip, pra-QA.

Pemakaian:
    python storyboard.py <folder-proyek> [--buka]

Output : out/storyboard.html (+ out/storyboard/*.jpg), out/storyboard.json
Lalu   : video.py setuju <proyek>   → mencatat persetujuan atas versi beat-sheet ini
         video.py semua <proyek>    → render penuh

Thumbnail diambil di frame saat tiap elemen tampil penuh, dengan mesin yang sama dengan render final
(termasuk overlay Remotion). Di frame itu kontras & kotak elemen diukur, jadi pra-QA bisa mengecek zona aman,
tumpang tindih, kontras, kecepatan baca, durasi efek, stagger, dan template — tanpa render penuh.
Aturan yang butuh file hasil render (loudness, ekspor, mask per frame) ditandai "setelah render".
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import os
import re

from PIL import Image

import qa
from render import Renderer
from sistem import GagalPipeline, Proyek, baca_json, log, main_aman, sha_file, tulis_json

LEBAR_THUMB = 270
WARNA = {"judul": "#5EE6FF", "teks": "#7FB3FF", "kartu": "#8B7CFF", "cta": "#FFE14D", "depth": "#FF8FB1",
         "remotion": "#3DDC97", "gambar": "#F7A35C", "broll": "#F25F5C", "push": "#B8C2D6", "caption": "#4B5568",
         "info": "#9AD1FF", "chip": "#C9A7FF", "transisi": "#FFFFFF", "latar": "#2A3446"}


def sha_beat(p: Proyek) -> str:
    return sha_file(p.beat_sheet_path, penuh=True)


def e(x) -> str:
    return html.escape(str(x)) if x is not None else ""


def aksen(x) -> str:
    """*kata* → <span class="aks">kata</span> (setelah di-escape)."""
    bagian = e(x).split("*")
    return "".join(f'<span class="aks">{b}</span>' if i % 2 else b for i, b in enumerate(bagian))


def polos(x) -> str:
    return str(x or "").replace("*", "")


def _tengah(r: dict) -> float:
    return (r["mulai"] + r.get("delay", 0) + r.get("durasi_masuk", 0) + r["selesai"] - r.get("durasi_keluar", 0)) / 2


def _anchor_teks(a) -> str:
    if not a:
        return ""
    if "kata" in a:
        return f"kata “{a['kata']}”" + (f" ke-{a['ke']}" if a.get("ke", 1) != 1 else "") + \
               (f" {a['offset']:+.2f}s" if a.get("offset") else "")
    if "beat" in a:
        return f"beat {a['beat']} ({a.get('ujung', 'mulai')})"
    return ""


def kumpulkan(r: Renderer) -> tuple[list[dict], list[dict]]:
    """→ (item timeline: elemen/push/broll, daftar waktu thumbnail)."""
    fps = r.p.fps
    rek = list(r.rekam.values())
    items = []
    for rec in rek:
        if rec.get("induk") or rec["tipe"] == "caption":
            continue
        if rec["tipe"] == "remotion" and rec.get("dekoratif"):  # hiasan yang memudar (partikel): sampel saat tampak, bukan di akhir
            t = rec["mulai"] + min(0.4, (rec["selesai"] - rec["mulai"]) / 3)
        elif rec["tipe"] == "remotion":
            t = rec["t_ukur"]
        else:
            t = max([_tengah(rec)] + [_tengah(x) for x in rek if x.get("induk") == rec["id"]])
        anak = " · ".join(x["teks"] for x in rek if x.get("induk") == rec["id"] and x.get("teks"))
        items.append({"id": rec["id"], "tipe": rec["tipe"], "beat": rec.get("beat"), "mulai": rec["mulai"],
                      "selesai": rec["selesai"],
                      "teks": rec.get("teks") or anak or rec.get("file") or rec.get("komposisi") or "",
                      "efek": rec.get("efek"), "anchor": rec.get("anchor"), "masuk": rec.get("masuk"),
                      "keluar": rec.get("keluar"), "t": min(t, rec["selesai"] - 1 / fps)})
    for u in r.push:
        items.append({"id": u["id"], "tipe": "push", "beat": u["id"].split("/")[0], "mulai": u["mulai"],
                      "selesai": u["selesai"], "teks": f"push ×{u['skala']:.2f}, gerak {u['gerak']:.2f}s, {u['easing']}",
                      "efek": u.get("efek"), "anchor": None, "t": min(u["selesai"] - 1 / fps, u["mulai"] + u["gerak"])})
    for b in r.broll:
        items.append({"id": b["id"], "tipe": "broll", "beat": b["id"].split("/")[0], "mulai": b["mulai"],
                      "selesai": b["selesai"], "teks": os.path.basename(str(b["file"])), "efek": b.get("efek"),
                      "anchor": None, "t": (b["mulai"] + b["selesai"]) / 2})
    items.sort(key=lambda x: x["mulai"])
    # satu thumbnail per frame unik; beat tanpa elemen tetap dapat satu thumbnail
    waktu = {round(i["t"] * fps): i["id"] for i in items}
    for b in r.bs["beats"]:
        if not any(b["mulai"] <= w / fps < b["selesai"] for w in waktu):
            waktu[round(min(b["mulai"] + 0.5, (b["mulai"] + b["selesai"]) / 2) * fps)] = f"beat {b['id']}"
    thumbs = []
    for f, lbl in sorted(waktu.items()):
        if thumbs and f - thumbs[-1]["frame"] < 0.25 * fps:
            thumbs[-1]["label"] += f", {lbl}"
            continue
        thumbs.append({"frame": f, "t": f / fps, "label": lbl})
    return items, thumbs


def _isu_per_elemen(hasil: list[dict], ids: list[str]) -> dict[str, list[tuple]]:
    isu: dict[str, list[tuple]] = {}
    for h in hasil:
        if h["status"] not in (qa.GAGAL, qa.PERINGATAN):
            continue
        for baris in h["detail"]:
            for i in ids:
                if re.search(rf"(^|[^\w/-]){re.escape(i)}([^\w-]|$)", baris):
                    isu.setdefault(i, []).append((h["id"], h["status"], baris))
    return isu


def _lajur(items: list[dict]) -> list[int]:
    akhir, out = [], []
    for it in items:
        for k, a in enumerate(akhir):
            if a <= it["mulai"] + 1e-3:
                akhir[k] = it["selesai"]
                out.append(k)
                break
        else:
            akhir.append(it["selesai"])
            out.append(len(akhir) - 1)
    return out


def storyboard(p: Proyek, buka: bool = False) -> dict:
    r = Renderer(p)
    dur = r.dur
    items, thumbs = kumpulkan(r)
    d = p.out / "storyboard"
    d.mkdir(parents=True, exist_ok=True)
    for f in d.glob("*.jpg"):
        f.unlink()
    log("storyboard", f"{len(thumbs)} thumbnail, {len(items)} elemen …")
    for th in thumbs:
        img = Image.fromarray(r.potret(th["t"]))
        img = img.resize((LEBAR_THUMB, round(img.height * LEBAR_THUMB / img.width)), Image.LANCZOS)
        th["file"] = f"storyboard/t{th['frame']:05d}.jpg"
        img.save(p.out / th["file"], quality=85)
    r._tutup_pembaca()

    layout = r.layout(None)
    hasil = qa.evaluasi(p, qa.Ctx(p, layout), qa.BUTUH_RENDER)
    status, n = qa.ringkas(hasil)
    isu = _isu_per_elemen(hasil, sorted({i["id"] for i in items} | {x["id"] for x in layout["elemen"]}))
    data = {"proyek": p.manifest["proyek"], "waktu": dt.datetime.now().isoformat(timespec="seconds"),
            "beat_sheet_sha": sha_beat(p), "durasi": round(dur, 3), "pra_qa": status, "ringkas": n,
            "elemen": [{k: v for k, v in i.items()} for i in items], "thumbnail": thumbs}
    tulis_json(p.out / "storyboard.json", data)
    halaman = p.out / "storyboard.html"
    halaman.write_text(_html(p, r, items, thumbs, hasil, status, n, isu, layout), encoding="utf-8")
    log("storyboard", f"pra-QA {status} (gagal {n[qa.GAGAL]}, peringatan {n[qa.PERINGATAN]}) → "
                      f"{halaman.relative_to(p.dir)}")
    if buka and hasattr(os, "startfile"):
        os.startfile(halaman)
    return data


def _html(p, r, items, thumbs, hasil, status, n, isu, layout) -> str:
    dur = r.dur
    pct = lambda t: f"{100 * t / dur:.3f}%"
    words = (r.bs.get("_words") or {}).get("kata", [])
    m = p.manifest
    efek = sorted({i["efek"] for i in items if i.get("efek")})
    persetujuan = m.get("persetujuan") or {}
    disetujui = persetujuan.get("beat_sheet_sha") == sha_beat(p)

    # ---------- timeline
    def blok(it, top, warna, label):
        return (f'<div class="blk" style="left:{pct(it["mulai"])};width:{pct(it["selesai"] - it["mulai"])};'
                f'top:{top}px;background:{warna}" title="{e(it["id"])} · {it["mulai"]:.2f}–{it["selesai"]:.2f}s '
                f'({it["selesai"] - it["mulai"]:.2f}s)&#10;{e(label)}">{e(label)}</div>')

    trek = []
    for b in r.bs["beats"]:
        trek.append(blok({"id": b["id"], "mulai": b["mulai"], "selesai": b["selesai"]}, 0, "#c9d3e6", b["id"]))
    vis = [i for i in items if i["tipe"] not in ("push", "broll")]
    lj = _lajur(vis)
    for it, k in zip(vis, lj):
        trek.append(blok(it, 30 + 26 * k, WARNA.get(it["tipe"], "#888"),
                         f"{it['efek'].split('@')[0] if it.get('efek') else it['tipe']}: {polos(it['teks'])[:40]}"))
    y_kam = 30 + 26 * (max(lj) + 1 if lj else 1) + 6
    for it in items:
        if it["tipe"] in ("push", "broll"):
            trek.append(blok(it, y_kam, WARNA.get(it["tipe"], "#B8C2D6"), f"{it['tipe']} {it.get('efek') or ''}"))
    y_cap = y_kam + 30
    for c in [x for x in layout["elemen"] if x["tipe"] == "caption"]:
        trek.append(blok(c, y_cap, WARNA["caption"], c["teks"]))
    y_sfx = y_cap + 30
    for s in r.sfx:
        trek.append(f'<div class="sfx" style="left:{pct(s["t"])};top:{y_sfx}px" '
                    f'title="{e(s["sumber"])} @ {s["t"]:.2f}s ({s["db"]} dB)">♪</div>')
    for th in thumbs:
        trek.append(f'<a class="tick" href="#f{th["frame"]}" style="left:{pct(th["t"])};top:{y_sfx + 22}px" '
                    f'title="thumbnail {th["t"]:.2f}s">▲</a>')
    sumbu = "".join(f'<div class="ax" style="left:{pct(s)}">{s}s</div>'
                    for s in range(0, int(dur) + 1, 1 if dur <= 20 else 5))
    tinggi = y_sfx + 44
    label_trek = (f'<div class="lbl" style="top:0">Beat</div><div class="lbl" style="top:30px">Elemen</div>'
                  f'<div class="lbl" style="top:{y_kam}px">Kamera</div><div class="lbl" style="top:{y_cap}px">Caption</div>'
                  f'<div class="lbl" style="top:{y_sfx}px">SFX</div>')

    # ---------- per beat
    bagian = []
    for b in r.bs["beats"]:
        el = [i for i in items if i["beat"] == b["id"]]
        kata_anchor = {re.sub(r"[^\w]", "", (i.get("anchor") or {}).get("kata", "").lower()) for i in el} - {""}
        kt = []
        for w in words:
            if b["mulai"] - 0.05 <= w["s"] < b["selesai"]:
                k = re.sub(r"[^\w]", "", w["w"].lower())
                cls = ' class="anc"' if k in kata_anchor else ""
                kt.append(f'<span{cls} title="{w["s"]:.2f}–{w["e"]:.2f}s">{e(w["w"])}</span>')
        th = [t for t in thumbs if b["mulai"] <= t["t"] < b["selesai"]]
        gambar = "".join(f'<figure id="f{t["frame"]}"><img src="{t["file"]}" width="{LEBAR_THUMB // 2 * 1}"><figcaption>'
                         f'{t["t"]:.2f}s<br>{e(t["label"])}</figcaption></figure>' for t in th)
        baris = []
        for i in el:
            masalah = isu.get(i["id"], [])
            ikon = "❌" if any(s == qa.GAGAL for _, s, _ in masalah) else ("⚠️" if masalah else "✅")
            det = "<br>".join(f"<b>{e(a)}</b> {e(x)}" for a, _, x in masalah)
            baris.append(
                f'<tr><td><span class="dot" style="background:{WARNA.get(i["tipe"], "#888")}"></span>{e(i["tipe"])}'
                f'{"<br><small>" + e(i["efek"]) + "</small>" if i.get("efek") else ""}</td><td>{aksen(i["teks"])}</td>'
                f'<td class="num">{i["mulai"]:.2f}–{i["selesai"]:.2f}</td><td class="num">{i["selesai"] - i["mulai"]:.2f}s</td>'
                f'<td>{e(_anchor_teks(i.get("anchor")))}</td><td>{e(i.get("masuk") or "")}/{e(i.get("keluar") or "")}</td>'
                f'<td>{ikon} {det}</td></tr>')
        tabel = ("<table><tr><th>Tipe / efek</th><th>Teks</th><th>Waktu (s)</th><th>Durasi</th><th>Anchor</th>"
                 "<th>Masuk/keluar</th><th>Pra-QA</th></tr>" + "".join(baris) + "</table>") if baris else \
                "<p class='mut'>Tidak ada elemen — talking head + caption.</p>"
        bagian.append(f'<section><h2>{e(b["id"])} <span class="mut">{e(b.get("beat", ""))} · '
                      f'{b["mulai"]:.2f}–{b["selesai"]:.2f}s ({b["selesai"] - b["mulai"]:.2f}s)</span></h2>'
                      f'<p class="tr">{" ".join(kt) or "<span class=mut>(tanpa transkrip)</span>"}</p>'
                      f'<div class="thumbs">{gambar}</div>{tabel}</section>')

    # ---------- pra-QA
    urut = {qa.GAGAL: 0, "BELUM DIIMPLEMENTASI": 1, qa.PERINGATAN: 2, qa.LULUS: 3, qa.LEWAT: 4}
    ikon = {qa.LULUS: "✅", qa.GAGAL: "❌", qa.PERINGATAN: "⚠️", qa.LEWAT: "➖", "BELUM DIIMPLEMENTASI": "🚧"}
    qrows = "".join(f'<tr class="{x["status"].lower()}"><td>{ikon[x["status"]]}</td><td>{e(x["id"])}</td>'
                    f'<td>{e(x["aturan"][:120])}</td><td>{"<br>".join(e(s) for s in x["detail"][:6])}</td></tr>'
                    for x in sorted((x for x in hasil if x["status"]), key=lambda x: (urut[x["status"]], x["id"])))
    manual = "".join(f"<li><b>{e(x['id'])}</b> {e(x['aturan'])}</li>" for x in hasil if x["manual"])

    badge = {"LULUS": "ok", "GAGAL": "bad"}[status]
    return f"""<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Storyboard — {e(m['proyek'])}</title>
<style>
body{{font:14px/1.45 system-ui,Segoe UI,sans-serif;background:#0d1117;color:#d7dde8;margin:0;padding:24px 32px}}
h1{{margin:0 0 4px;font-size:22px}} h2{{font-size:17px;margin:28px 0 6px}} .mut{{color:#8a94a6;font-weight:400}}
.meta span{{display:inline-block;margin:4px 14px 4px 0}} .badge{{padding:3px 10px;border-radius:12px;font-weight:600}}
.ok{{background:#173d2a;color:#5be39b}} .bad{{background:#4a1d22;color:#ff7b86}} .warn{{background:#3d3317;color:#ffd166}}
.tl{{position:relative;margin:18px 0 8px 70px;height:{tinggi}px;border-left:1px solid #2a3344}}
.blk{{position:absolute;height:22px;border-radius:5px;font-size:11px;color:#0d1117;padding:3px 6px;box-sizing:border-box;
overflow:hidden;white-space:nowrap;text-overflow:ellipsis;opacity:.92}} .blk:hover{{opacity:1;outline:2px solid #fff;z-index:9}}
.lbl{{position:absolute;left:-70px;width:64px;font-size:11px;color:#8a94a6;text-align:right;padding-top:4px}}
.sfx{{position:absolute;color:#ffd166;transform:translateX(-50%)}} .tick{{position:absolute;color:#5EE6FF;
transform:translateX(-50%);text-decoration:none;font-size:11px}}
.axis{{position:relative;margin:0 0 0 70px;height:16px}} .ax{{position:absolute;font-size:10px;color:#6b7588;transform:translateX(-50%)}}
section{{border-top:1px solid #222b3a;padding-bottom:8px}} .tr span{{border-radius:3px;padding:0 1px}}
.aks{{color:#5EE6FF;font-weight:600}} .tr .anc{{background:#3DDC97;color:#0d1117;font-weight:600}} .thumbs{{display:flex;gap:10px;flex-wrap:wrap;margin:8px 0}}
figure{{margin:0}} figure img{{border-radius:6px;border:1px solid #2a3344;display:block}}
figcaption{{font-size:11px;color:#8a94a6;max-width:135px}} table{{border-collapse:collapse;width:100%;margin-top:6px}}
th,td{{border-bottom:1px solid #222b3a;padding:6px 8px;text-align:left;vertical-align:top;font-size:13px}}
th{{color:#8a94a6;font-weight:500}} .num{{font-variant-numeric:tabular-nums;white-space:nowrap}}
.dot{{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px}}
tr.gagal td{{background:#2a1316}} tr.peringatan td{{background:#262012}} code{{background:#1b2230;padding:2px 6px;border-radius:4px}}
</style></head><body>
<h1>Storyboard — {e(m.get('judul') or m['proyek'])}</h1>
<div class="meta mut"><span>{e(m['proyek'])}</span><span>gaya <b>{e(p.gaya.ref)}</b></span><span>template <b>{e(p.template.ref)}</b></span>
<span>efek {e(', '.join(efek) or '—')}</span><span>durasi <b>{r.dur:.2f}s</b> · {r.n_frame} frame @ {p.fps} fps</span>
<span>beat-sheet {sha_beat(p)[:10]}</span></div>
<p><span class="badge {badge}">Pra-QA {status}</span>
<span class="badge bad">gagal {n[qa.GAGAL]}</span> <span class="badge warn">peringatan {n[qa.PERINGATAN]}</span>
<span class="badge ok">lulus {n[qa.LULUS]}</span>
<span class="badge {'ok' if disetujui else 'warn'}">{'disetujui ' + e(persetujuan.get('waktu', '')) if disetujui else 'belum disetujui'}</span></p>

<div class="axis">{sumbu}</div>
<div class="tl">{label_trek}{''.join(trek)}</div>
<p class="mut">Arahkan kursor ke blok untuk detail · ▲ = thumbnail (klik) · ♪ = SFX · kata hijau di transkrip = anchor elemen.</p>

{''.join(bagian)}

<h2>Pra-QA <span class="mut">(tanpa render penuh — loudness, ekspor, mask per frame dicek setelah render)</span></h2>
<table><tr><th></th><th>ID</th><th>Aturan</th><th>Detail</th></tr>{qrows}</table>
<h2>Checklist manual setelah render</h2><ul>{manual}</ul>
<h2>Langkah berikutnya</h2>
<p>Revisi <code>beat-sheet.json</code> lalu <code>video.py storyboard {e(m['proyek'])}</code> lagi, atau setujui:
<code>video.py setuju {e(m['proyek'])}</code> → <code>video.py semua {e(m['proyek'])}</code>.</p>
</body></html>"""


def setuju(p: Proyek) -> dict:
    sb = p.out / "storyboard.json"
    if not sb.exists():
        raise GagalPipeline("Belum ada storyboard. Jalankan: video.py storyboard <proyek>")
    data = baca_json(sb)
    if data["beat_sheet_sha"] != sha_beat(p):
        raise GagalPipeline("beat-sheet.json berubah sejak storyboard dibuat. Buat ulang storyboard lalu setujui.")
    if data["pra_qa"] != "LULUS":
        log("setuju", f"PERINGATAN: pra-QA {data['pra_qa']} — tetap disetujui atas keputusan pengguna.")
    p.manifest["persetujuan"] = {"beat_sheet_sha": data["beat_sheet_sha"], "waktu": dt.datetime.now().isoformat(timespec="seconds"),
                                 "pra_qa": data["pra_qa"], "storyboard": data["waktu"]}
    p.manifest["status"] = "disetujui"
    p.simpan_manifest()
    log("setuju", f"beat-sheet {data['beat_sheet_sha'][:10]} disetujui. Lanjut: video.py semua <proyek>")
    return p.manifest["persetujuan"]


def cek_persetujuan(p: Proyek) -> str | None:
    """Pesan peringatan bila render penuh dijalankan tanpa persetujuan atas beat-sheet saat ini."""
    s = (p.manifest.get("persetujuan") or {}).get("beat_sheet_sha")
    if not s:
        return "beat-sheet belum disetujui (video.py storyboard → setuju)."
    if s != sha_beat(p):
        return "beat-sheet berubah sejak disetujui (buat storyboard & setujui ulang)."
    return None


def wajib_persetujuan(p: Proyek, lewati: bool = False) -> None:
    """Gerbang render penuh: beat-sheet saat ini harus sudah disetujui pengguna lewat storyboard.
    lewati (--tanpa-setuju) hanya atas keputusan pengguna — dicatat di manifest.render_tanpa_setuju."""
    pesan = cek_persetujuan(p)
    if not pesan:
        return
    if not lewati:
        raise GagalPipeline(f"Render penuh ditolak: {pesan}\n"
                            "  video.py storyboard <proyek> --buka → tunjukkan ke pengguna → video.py setuju <proyek>\n"
                            "  (hanya bila pengguna sendiri memutuskan render tanpa persetujuan: tambah --tanpa-setuju)")
    log("render", f"PERINGATAN: {pesan} Dilanjutkan dengan --tanpa-setuju.")
    p.manifest.setdefault("render_tanpa_setuju", []).append(
        {"waktu": dt.datetime.now().isoformat(timespec="seconds"), "beat_sheet_sha": sha_beat(p), "sebab": pesan})
    p.simpan_manifest()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("proyek")
    ap.add_argument("--buka", action="store_true", help="buka storyboard.html di browser")
    arg = ap.parse_args()
    storyboard(Proyek(arg.proyek), arg.buka)
    return 0


if __name__ == "__main__":
    main_aman(main)
