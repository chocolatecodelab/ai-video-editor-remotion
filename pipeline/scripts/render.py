"""render — komposisi video dari manifest + beat-sheet.json + token gaya. Tidak ada timing/teks di kode.

Pemakaian:
    python render.py <folder-proyek>                 # render penuh → out/master.mov + out/layout.json
    python render.py <folder-proyek> --still 1.5,8   # PNG frame tertentu → out/still_001.50.png (cepat, untuk review)
    python render.py <folder-proyek> --pekerja 1     # paksa berurutan (default paralel otomatis, env VIDEO_PEKERJA)

Urutan lapisan per frame:
    latar (rekaman / broll, kena push) → teks depth → subjek (mask) → judul/teks/kartu/cta/gambar → caption

Elemen beat-sheet (lihat pipeline/scripts/README.md untuk semua field):
    judul, teks, kartu, cta, depth, gambar, info, chip, broll, push, sfx, remotion

Suara: elemen tanpa field "sfx" mendapat bunyi otomatis dari token `sfx.peta` (K08); "sfx": false = sengaja diam.
Semua SFX dirakit jadi satu bus (sfx.py) lalu dicampur dengan suara + musik.

Susunan modul (render.py = orkestrator: bangun lapisan, per frame, render berurutan/paralel, layout.json):
    render_dasar     easing, sprite & transform, pembaca video/overlay, lapisan + animasi
    render_teks      teks PIL (markup *aksen*, hiasan kata)      render_panel   panel motif gaya, ikon, chip
    render_elemen    judul/teks/kartu/cta/info/chip/latar/gambar  render_depth   teks depth (rotoscope)
    render_perangkat elemen Remotion (overlay)                    render_kamera  transisi & efek kamera
    render_audio     SFX + campuran & loudness akhir
"""
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

import beat
from render_audio import MARGIN_TP_LOSSY, AudioMixin  # noqa: F401  (re-export)
from render_dasar import (Animator, Easing, Lapisan, Overlay, Pembaca, Transform, bbox_transform,  # noqa: F401
                          ke_premult, ke_uint8, tempel, warp_penuh)
from render_depth import DepthMixin
from render_elemen import ElemenMixin
from render_kamera import JENIS_TRANSISI, KAMERA, KAMERA_MASK, KameraMixin, param_efek  # noqa: F401
from render_pip import PipMixin
from render_panel import IKON, Panel, buat_panel, tempel_panel  # noqa: F401
from render_perangkat import ALPHA_KOTAK, KONTRAK_DEFAULT, KONTRAK_TEKS, PerangkatMixin  # noqa: F401
from render_teks import Penata, Sprite, parse_teks  # noqa: F401
from sistem import (SETPARAMS_BT709, GagalPipeline, Proyek, baca_json, durasi, hex_rgb, jalankan, log, main_aman, resolve,
                    tulis_json)
import zoom_potong

PARALLAX_DEPTH = 0.5  # K03.4: teks depth ikut push 50% → bergerak lebih lambat dari latar


# ============================================================== penyusun


class Renderer(ElemenMixin, DepthMixin, PerangkatMixin, KameraMixin, PipMixin, AudioMixin):
    def __init__(self, p: Proyek):
        self.p = p
        self.ada_rekaman = p.ingest_video.exists()
        if not self.ada_rekaman and p.manifest.get("aset", {}).get("rekaman"):
            raise GagalPipeline("cache/ingest.mp4 belum ada. Jalankan ingest dulu.")
        self.dur = durasi(p.ingest_video) if self.ada_rekaman else None
        self.bs = beat.muat(p, self.dur)
        if self.dur is None:
            self.dur = max(b["selesai"] for b in self.bs["beats"])
        self.n_frame = int(round(self.dur * p.fps))
        self.ease = {k: Easing(k, v) for k, v in p.t("easing").items()}
        self.ease["linear"] = Easing("linear", "linear")
        self.pen = Penata(p)
        self.hias = p.t("motif.aksen", "") or None  # hiasan kata *aksen* khas gaya (judul, kartu, info, chip)
        self.anim = Animator(p)
        self.zona = p.zona_aman()
        self.lapisan: list[Lapisan] = []
        self.rekam: dict[str, dict] = {}
        self.push: list[dict] = []
        self.tanpa_caption: list[tuple[float, float]] = []  # rentang teks kinetik (E51) yang menggantikan caption
        self.mb_remotion: list[str] = []                     # overlay Remotion dengan motion blur sendiri (K05.4)
        self.broll: list[dict] = []
        self.pip: list[dict] = []
        self.transisi: list[dict] = []
        self.kamera: list[dict] = []
        self.kamera_info: dict[str, dict] = {}
        self._depth_tunda: list = []
        self.wajah =(baca_json(p.cache / "wajah.json").get("bingkai") if (p.cache / "wajah.json").exists() else None)
        self.sfx: list[dict] = []
        self.peringatan: list[str] = []
        self.mask_info: dict[str, dict] = {}
        self._bangun()

    # ---------------------------------------------------------- helper posisi
    def _easing(self, nama: str | None, default: str) -> Easing:
        nama = nama or default
        if nama not in self.ease:
            raise GagalPipeline(f"easing {nama!r} tidak ada di token (ada: {', '.join(self.ease)}).")
        return self.ease[nama]

    def _pusat(self, e: dict, w: int, h: int, posisi_default: str) -> tuple[float, float]:
        zx0, zy0, zx1, zy1 = self.zona
        cx = e["x"] * self.p.W if "x" in e else (zx0 + zx1) / 2
        if "y" in e:
            cy = e["y"] * self.p.H
        else:
            pos = e.get("posisi", posisi_default)
            geser = self.p.px(e.get("geser_y", 0))
            cy = {"atas": zy0 + h / 2, "tengah": (zy0 + zy1) / 2, "bawah": zy1 - h / 2}.get(pos)
            if cy is None:
                raise GagalPipeline(f"{e['_id']}: posisi {pos!r} tidak dikenal (atas/tengah/bawah atau x/y).")
            cy += geser
        return cx, cy

    def _lebar_maks(self, e: dict) -> int:
        zx0, _, zx1, _ = self.zona
        lebar = zx1 - zx0
        return int(lebar * e["lebar"]) if "lebar" in e else lebar

    def _anim_dasar(self, e: dict, masuk_default: str | None = None) -> dict:
        p = self.p
        return dict(masuk=e.get("masuk", masuk_default or p.t("gerak.masuk-default")),
                    keluar=e.get("keluar", p.t("gerak.keluar-default")),
                    d_in=float(e.get("durasi_masuk", p.t("durasi.masuk"))),
                    d_out=float(e.get("durasi_keluar", p.t("durasi.keluar"))),
                    e_in=self._easing(e.get("easing"), "standar"),
                    e_out=self._easing(e.get("easing_keluar"), "keluar"))

    def _catat(self, L: Lapisan, e: dict, **lain) -> None:
        w, h = L.wh
        rec = {"id": L.id, "tipe": L.tipe, "beat": e.get("_beat"), "teks": e.get("teks"),
               "mulai": round(L.mulai, 3), "selesai": round(L.selesai, 3), "delay": round(L.delay, 3),
               "bbox": [round(v, 1) for v in bbox_transform(w, h, Transform(L.cx, L.cy, 1, 1))],
               "bbox_animasi": None, "masuk": L.masuk, "keluar": L.keluar, "durasi_masuk": L.d_in,
               "durasi_keluar": L.d_out, "easing": L.e_in.nama if L.e_in else None,
               "easing_keluar": L.e_out.nama if L.e_out else None, "anchor_kata": e.get("_anchor", False),
               "induk": L.induk, "kontras": None, "efek": e.get("_efek"), "anchor": e.get("_anchor_spek"),
               "fungsi": e.get("fungsi")}
        if L.sprite:
            pad = L.sprite.info["pad"]
            x0, y0, x1, y1 = rec["bbox"]
            rec["bbox_teks"] = [x0 + pad, y0 + pad, x1 - pad, y1 - pad]
            rec.update({k: v for k, v in L.sprite.info.items() if k != "pad"})
        rec.update(lain)
        self.rekam[L.id] = rec

    # ---------------------------------------------------------- bangun lapisan
    def _bangun(self) -> None:
        self._var_sfx: dict[str, int] = {}
        for e in beat.semua_elemen(self.bs):
            getattr(self, f"_el_{e['tipe']}")(e)
            if e["tipe"] == "sfx":
                continue
            if "sfx" in e:
                if e["sfx"]:
                    self._daftar_sfx(e["sfx"], e["mulai"], e["_id"])
                elif e["_id"] in self.rekam:
                    self.rekam[e["_id"]]["sfx_mati"] = True  # K08.1: diam disengaja
            else:
                self._sfx_otomatis(e)
        self._tata_depth()
        self._caption()
        self._zoom_potong()

    def _el_push(self, e):
        p = self.p
        rentang = e["selesai"] - e["mulai"]
        item = {"id": e["_id"], "mulai": e["mulai"], "selesai": e["selesai"],
                "skala": float(e.get("skala", p.t("gerak.push-in"))),
                "gerak": float(e.get("gerak", min(1.0, rentang))),
                "fokus": e.get("fokus", [0.5, 0.4]), "easing": e.get("easing", "standar"),
                "anchor_kata": e.get("_anchor", False), "efek": e.get("_efek"), "anchor": e.get("_anchor_spek"),
                "potong": str(e.get("_efek", "")).startswith("zoom-potong@")}  # E55 manual: ganti bingkai, bukan push
        item["_e"] = self._easing(item["easing"], "standar")
        self.push.append(item)

    def _zoom_potong(self) -> None:
        """E55: zoom cut otomatis (zoom_potong.py) — beat-sheet `zoom_potong: {"aktif": false}` untuk mematikan.
        Masuk ke daftar push sebagai `potong` (gerak 0 = ganti bingkai seketika, berpusat di wajah)."""
        cfg = self.bs.get("zoom_potong") or {}
        words = self.bs.get("_words")
        if not cfg.get("aktif", True) or not self.ada_rekaman or not words:
            return
        modul = resolve("efek", "zoom-potong")
        c = {**param_efek("zoom-potong"), **self.p.t("kamera.zoom-potong", {}), **cfg}
        blok = [(x["mulai"], x["selesai"]) for x in self.broll + self.kamera + self.transisi + self.push + self.pip]
        blok += [(L.mulai, L.selesai) for L in self.lapisan if L.belakang]
        rentang = zoom_potong.rencana(words["kata"], blok, self.dur, float(c["jeda"]), float(c["kalimat-min"]))
        for n, (a, z) in enumerate(rentang):
            beat_id = next((b["id"] for b in self.bs["beats"] if b["mulai"] <= a < b["selesai"]), "zoom")
            ff = [self._fokus_wajah(a + (z - a) * q, self.p.W / 2, self.p.H * 0.4) for q in (0.1, 0.5, 0.9)]
            fx, fy = float(np.median([f[0] for f in ff])), float(np.median([f[1] for f in ff]))
            item = {"id": f"{beat_id}/zoom-potong{n}", "mulai": a, "selesai": z, "skala": float(c["skala"]), "gerak": 0.0,
                    "fokus": [round(fx / self.p.W, 4), round(fy / self.p.H, 4)], "easing": "standar", "anchor_kata": True,
                    "efek": modul.ref, "anchor": None, "potong": True}
            item["_e"] = self._easing("standar", "standar")
            self.push.append(item)

    def _el_broll(self, e):
        if e.get("jendela") or str(e.get("_efek", "")).startswith("broll-overlay@"):
            return self._el_pip(e)  # E45: b-roll di jendela di atas rekaman
        path = self.p.path_aset(e.get("file"))
        if not path or not path.exists():
            raise GagalPipeline(f"{e['_id']}: file broll {e.get('file')!r} tidak ada.")
        self.broll.append({"id": e["_id"], "file": path, "mulai": e["mulai"], "selesai": e["selesai"],
                           "dari": float(e.get("dari", 0)), "efek": e.get("_efek"), "_r": None})

    # ---------------------------------------------------------- caption
    def _caption(self) -> None:
        p = self.p
        cfg = self.bs["caption"]
        self.cap: list[dict] = []
        if not cfg.get("aktif", True):
            return
        words = self.bs.get("_words")
        if not words:
            self.peringatan.append("Caption aktif tapi cache/words.json tidak ada → caption tidak dirender.")
            return
        c = p.t("caption")
        kata = [w for w in words["kata"] if w["w"].strip()]
        maks_total = c["karakter-maks-baris"] * c["baris-maks"]
        grup, cur = [], []
        for w in kata:
            if cur:
                teks_baru = " ".join(x["w"] for x in cur + [w])
                if (len(cur) >= c["kata-maks"] or w["s"] - cur[-1]["e"] > c["jeda-pecah"]
                        or len(teks_baru) > maks_total or cur[-1]["w"].endswith((".", "?", "!", ","))):
                    grup.append(cur)
                    cur = []
            cur.append(w)
        if cur:
            grup.append(cur)
        karaoke = c.get("mode", "aktif") == "karaoke"  # karaoke: kata yang belum diucapkan diredupkan
        warna_aktif = None if karaoke else p.t(f"warna.{c['warna-aktif']}")
        redup = c["redup"] if karaoke else None
        stroke = p.px(c["stroke"])
        zx0, zy0, zx1, zy1 = self.zona
        posisi = cfg.get("posisi", "bawah")
        for i, g in enumerate(grup):
            s = g[0]["s"]
            nxt = grup[i + 1][0]["s"] if i + 1 < len(grup) else None
            e = nxt if nxt is not None and nxt - g[-1]["e"] < 0.6 else g[-1]["e"] + 0.3
            e = min(e, self.dur)
            tengah = (s + e) / 2
            if any(a <= tengah < z for a, z in cfg["kecuali"]):
                continue
            # teks kinetik (E51) sudah membawakan kalimat ini → caption tidak dobel: kata yang diucapkan selama teks
            # kinetik dibuang; sisanya tampil sampai teks kinetik masuk bila masih terbaca (K01.5), selain itu dilewati
            kin = [(a, z) for a, z in self.tanpa_caption if s < z and e > a]
            if kin:
                a = kin[0][0]
                g = [w for w in g if w["s"] < a - 0.05]
                e = a
                if not g or e - s < 0.3 or len(" ".join(w["w"] for w in g)) / (e - s) > p.t("qa.karakter-per-detik-maks"):
                    continue
            teks = " ".join(w["w"] for w in g)
            buat = lambda aktif, teks=teks: self.pen.teks(
                teks, "caption", p.px(p.t("ukuran.caption")), zx1 - zx0, p.t("warna.teks-utama"), stroke=stroke,
                warna_stroke=p.t("warna.stroke"), bayangan=True, aktif=aktif, warna_aktif=warna_aktif,
                huruf_besar=c["huruf-besar"], maks_karakter=c["karakter-maks-baris"], redup=redup)
            spr0 = buat(0)
            cx = (zx0 + zx1) / 2
            cy = {"bawah": zy1 - spr0.h / 2, "tengah": (zy0 + zy1) / 2, "atas": zy0 + spr0.h / 2}[posisi]
            item = {"id": f"caption/{i:03d}", "mulai": s, "selesai": e, "kata": g, "cx": cx, "cy": cy,
                    "buat": buat, "spr": {0: spr0}}
            self.cap.append(item)
            pad = spr0.info["pad"]
            bb = bbox_transform(spr0.w, spr0.h, Transform(cx, cy, 1, 1))
            self.rekam[item["id"]] = {
                "id": item["id"], "tipe": "caption", "teks": teks, "mulai": round(s, 3), "selesai": round(e, 3),
                "bbox": [round(v, 1) for v in bb], "bbox_teks": [bb[0] + pad, bb[1] + pad, bb[2] - pad, bb[3] - pad],
                "bbox_animasi": None, "masuk": "pop", "easing": "standar", "induk": None, "kontras": None,
                **{k: v for k, v in spr0.info.items() if k != "pad"}, "mode": "karaoke" if karaoke else "aktif",
                "warna": sorted({p.t("warna.teks-utama"), warna_aktif} - {None})}

    def _gambar_caption(self, frame: np.ndarray, t: float, sampel: bool) -> None:
        for c in self.cap:
            if not (c["mulai"] <= t < c["selesai"]):
                continue
            aktif = 0
            for j, w in enumerate(c["kata"]):
                if w["s"] <= t:
                    aktif = j
            if aktif not in c["spr"]:
                c["spr"][aktif] = c["buat"](aktif)
            spr = c["spr"][aktif]
            pr = (t - c["mulai"]) / 0.12
            s = 0.92 + 0.08 * self.ease["standar"](pr) if pr < 1 else 1.0
            tr = Transform(c["cx"], c["cy"], s, min(1.0, pr * 2) if pr < 1 else 1.0)
            if sampel:
                self._sampel_kontras(frame, c["id"], t)
            self._perluas_bbox(c["id"], spr.w, spr.h, tr)
            tempel(frame, spr.img, [tr])

    # ---------------------------------------------------------- per frame
    def _skala_push(self, t: float) -> tuple[float, float, float]:
        s, fx, fy = 1.0, 0.5, 0.4
        for u in self.push:
            if u["mulai"] <= t < u["selesai"]:
                pr = (t - u["mulai"]) / u["gerak"] if u["gerak"] > 0 else 1
                s *= 1 + (u["skala"] - 1) * u["_e"](pr)
                fx, fy = u["fokus"]
        return s, fx * self.p.W, fy * self.p.H

    def _perluas_bbox(self, id_: str, w: int, h: int, tr: Transform) -> None:
        rec = self.rekam.get(id_)
        if rec is None or tr.op < 0.05:
            return
        b = bbox_transform(w, h, tr)
        a = rec["bbox_animasi"]
        rec["bbox_animasi"] = [round(v, 1) for v in (b if a is None else
                                                     (min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3])))]

    def _sampel_kontras(self, frame: np.ndarray, id_: str, t: float) -> None:
        """Ukur luminans latar efektif tepat sebelum teks digambar, di frame tengah durasi tampil."""
        rec = self.rekam[id_]
        if rec.get("kontras") is not None:
            return
        # tengah bagian diam (setelah animasi masuk, sebelum keluar)
        tengah = (rec["mulai"] + rec.get("delay", 0) + rec.get("durasi_masuk", 0)
                  + rec["selesai"] - rec.get("durasi_keluar", 0)) / 2
        if t + 0.5 / self.p.fps < tengah:
            return
        x0, y0, x1, y1 = [int(v) for v in rec["bbox_teks"]]
        H, W = frame.shape[:2]
        reg = frame[max(0, y0):min(H, y1):2, max(0, x0):min(W, x1):2]
        if reg.size == 0:
            return
        c = reg.reshape(-1, 3) / 255.0
        lin = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
        L = lin @ np.array([0.2126, 0.7152, 0.0722])
        rec["kontras"] = {"t": round(t, 3), "l_p10": round(float(np.percentile(L, 10)), 4),
                          "l_p90": round(float(np.percentile(L, 90)), 4)}

    def _frame_broll(self, t: float, sekuensial: bool) -> np.ndarray | None:
        for b in self.broll:
            if b["mulai"] <= t < b["selesai"]:
                if b["_r"] is None or not sekuensial:
                    if b["_r"]:
                        b["_r"].tutup()
                    b["_r"] = Pembaca(b["file"], b["dari"] + (t - b["mulai"]), self.p.W, self.p.H, self.p.fps, cover=True)
                return b["_r"].baca()
            if b["_r"] is not None and t >= b["selesai"]:
                b["_r"].tutup()
                b["_r"] = None
        return None

    def _mask(self, i: int) -> np.ndarray | None:
        """Mask subjek frame i (feather token) — di-cache satu frame: depth & efek kamera memakai mask yang sama."""
        if self._mask_cache[0] == i:
            return self._mask_cache[1]
        m = self._baca_mask(i)
        self._mask_cache = (i, m)
        return m

    _mask_cache: tuple = (-1, None)

    def _baca_mask(self, i: int) -> np.ndarray | None:
        f = self.p.masks_dir / f"{i:06d}.png"
        if not f.exists():
            return None
        m = cv2.imread(str(f), cv2.IMREAD_UNCHANGED)
        if m.ndim == 3:
            m = m[..., 3] if m.shape[2] == 4 else cv2.cvtColor(m, cv2.COLOR_BGR2GRAY)
        if m.shape[:2] != (self.p.H, self.p.W):
            m = cv2.resize(m, (self.p.W, self.p.H), interpolation=cv2.INTER_LINEAR)
        m = m.astype(np.float32) / (65535.0 if m.dtype == np.uint16 else 255.0)
        fe = self.p.t("mask.feather-px")
        if fe > 0:
            m = cv2.GaussianBlur(m, (0, 0), fe)
        return m

    def _transforms(self, L: Lapisan, t: float) -> list[Transform]:
        tr = self.anim(L, t)
        if tr is None:
            return []
        mb = self.p.t("motion-blur")
        if not mb.get("aktif"):
            return [tr]
        sebelum = self.anim(L, t - 1 / self.p.fps)
        if sebelum is None:
            return [tr]
        w, h = L.wh
        gerak = max(abs(tr.cx - sebelum.cx), abs(tr.cy - sebelum.cy), abs(tr.s - sebelum.s) * max(w, h) / 2)
        if gerak <= self.p.px(mb["ambang-px"]):
            return [tr]
        n = int(mb["sampel"])
        self.mb_dipakai += 1
        # shutter 180°: sampel di antara t − ½ frame dan t
        out = []
        for k in range(n):
            tk = t - 0.5 / self.p.fps * (1 - k / max(1, n - 1))
            out.append(self.anim(L, tk) or tr)
        return out

    def frame(self, i: int, latar: np.ndarray | None, sekuensial: bool = True) -> np.ndarray:
        p = self.p
        t = i / p.fps
        br = self._frame_broll(t, sekuensial)
        src = br if br is not None else latar
        if src is None:
            src = np.empty((p.H, p.W, 3), np.uint8)
            src[:] = hex_rgb(p.t("warna.latar"))
        s, fx, fy = self._skala_push(t)
        kam = self._kamera_aktif(t) if br is None and latar is not None else None
        if kam:
            self.kamera_info.setdefault(kam["id"], {"butuh": 0, "ada": 0})
            if kam["jenis"] in KAMERA_MASK:
                self.kamera_info[kam["id"]]["butuh"] += 1
                self.kamera_info[kam["id"]]["ada"] += int((self.p.masks_dir / f"{i:06d}.png").exists())
            dasar = self._terapkan_kamera(kam, src, i, t, s, fx, fy)
        else:
            dasar = warp_penuh(src, s, fx, fy).astype(np.float32)
        frame = dasar.copy()

        depth = [L for L in self.lapisan if L.belakang and L.mulai <= t < L.selesai]
        if depth and kam and kam["jenis"] not in ("digital-zoom", "vertigo", "snap-zoom"):
            depth = []  # rekaman dikecilkan/diganti latar: teks di balik subjek tidak sejajar lagi
        if depth:
            m = self._mask(i) if (br is None and self.ada_rekaman) else None
            for L in depth:
                info = self.mask_info.setdefault(L.id, {"butuh": 0, "ada": 0})
                info["butuh"] += 1
                info["ada"] += int(m is not None)
            if m is not None:
                m = warp_penuh(m, s, fx, fy)[..., None]
                sd = 1 + (s - 1) * PARALLAX_DEPTH
                for L in depth:
                    if L.overlay:  # overlay Remotion di balik subjek (mis. masthead cover-story)
                        self._tempel_overlay(frame, L, i, t)
                        continue
                    self._ukur_tutup_depth(L, m)
                    trs = []
                    for tr in self._transforms(L, t):
                        tr = Transform(fx + (tr.cx - fx) * sd, fy + (tr.cy - fy) * sd, tr.s * sd, tr.op)
                        trs.append(tr)
                    if trs:
                        self._perluas_bbox(L.id, *L.wh, trs[-1])
                    tempel(frame, L.sprite.img, trs)
                frame = frame * (1 - m) + dasar * m

        if self.pip:
            self._tempel_pip(frame, t, sekuensial)
        for L in self.lapisan:
            if L.belakang:
                continue
            if L.overlay:
                if L.mulai <= t < L.selesai:
                    self._tempel_overlay(frame, L, i, t)
                continue
            trs = self._transforms(L, t)
            if not trs:
                continue
            if self._sampel and L.ukur_kontras and L.id in self.rekam:
                self._sampel_kontras(frame, L.id, t)
            self._perluas_bbox(L.id, *L.wh, trs[-1])
            if L.panel:
                tempel_panel(frame, L.panel, trs[-1])
            else:
                tempel(frame, L.sprite.img, trs)
        self._gambar_caption(frame, t, self._sampel)
        frame = self._terapkan_transisi(frame, t, i)
        return ke_uint8(frame, i)

    _sampel = True
    mb_dipakai = 0

    # ---------------------------------------------------------- keluaran
    def layout(self, audio: dict | None) -> dict:
        p = self.p
        words = self.bs.get("_words")
        return {
            "proyek": p.manifest["proyek"], "resolusi": [p.W, p.H], "fps": p.fps, "durasi": round(self.dur, 3),
            "zona_aman": list(self.zona), "elemen": list(self.rekam.values()),
            "push": [{k: v for k, v in u.items() if not k.startswith("_")} for u in self.push],
            "broll": [{"id": b["id"], "file": str(b["file"]), "mulai": b["mulai"], "selesai": b["selesai"], "efek": b["efek"]}
                      for b in self.broll],
            "transisi": [{k: v for k, v in tr.items() if not k.startswith("_")} for tr in self.transisi],
            "kamera": [{k: v for k, v in km.items() if k != "cfg" and not k.startswith("_")} | {"cfg": {a: b for a, b in km["cfg"].items() if not a.startswith("_")}}
                       for km in self.kamera],
            "mask_kamera": self.kamera_info,
            "sfx": self.sfx, "audio": audio, "mask": self.mask_info,
            "motion_blur": {"aktif": bool(p.t("motion-blur.aktif")), "frame_terpakai": self.mb_dipakai,
                            "remotion": self.mb_remotion},
            "caption": {"aktif": self.bs["caption"].get("aktif", True), "potongan": len(self.cap),
                        "sumber": (words or {}).get("_meta")},
            "beats": [{"id": b["id"], "mulai": b["mulai"], "selesai": b["selesai"], "anchor_kata": b["_anchor_mulai"]}
                      for b in self.bs["beats"]],
            "kata_mulai": [w["s"] for w in (words or {}).get("kata", [])],
            "peringatan": self.peringatan,
        }

    def _render_rentang(self, a: int, z: int, tujuan: Path, progres: bool = True) -> None:
        """Frame [a, z) → video ProRes (format master, tanpa audio)."""
        p = self.p
        ek = p.t("ekspor.master")
        enc = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
               "-s", f"{p.W}x{p.H}", "-r", str(p.fps), "-i", "-",
               "-vf", f"scale=out_color_matrix=bt709:out_range=tv,format={ek['pix_fmt']},{SETPARAMS_BT709}",
               "-c:v", ek["codec"], "-profile:v", str(ek["profil"]), "-vendor", "apl0",
               "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
               str(tujuan)]
        proc = subprocess.Popen(enc, stdin=subprocess.PIPE)
        baca = Pembaca(p.ingest_video, a / p.fps, p.W, p.H, p.fps, cover=True) if self.ada_rekaman else None
        langkah = max(1, (z - a) // 10)
        try:
            for i in range(a, z):
                latar = baca.baca() if baca else None
                proc.stdin.write(self.frame(i, latar).tobytes())
                if progres and (i - a) % langkah == 0:
                    log("render", f"{100 * (i - a) // (z - a):3d}%")
        finally:
            if baca:
                baca.tutup()
            self._tutup_pembaca()
            proc.stdin.close()
            proc.wait()
        if proc.returncode:
            raise GagalPipeline("encoder ffmpeg gagal.")

    def _render_paralel(self, tujuan: Path, n: int) -> None:
        """Frame dibagi ke n proses (frame independen satu sama lain) → potongan ProRes → disambung tanpa encode ulang
        (ProRes intra-frame). Statistik QA per frame dari tiap proses digabung (_gabung_statistik)."""
        from concurrent.futures import ProcessPoolExecutor, as_completed
        p = self.p
        rentang = [(self.n_frame * k // n, self.n_frame * (k + 1) // n) for k in range(n)]
        bagian = [p.cache / f"video_bagian_{k:02d}.mov" for k in range(n)]
        hasil: list = [None] * n
        log("render", f"paralel: {n} proses × ±{self.n_frame // n} frame")
        with ProcessPoolExecutor(n) as ex:
            tugas = {ex.submit(_pekerja_rentang, str(p.dir), a, z, str(f)): k
                     for k, ((a, z), f) in enumerate(zip(rentang, bagian, strict=True))}
            for j, t in enumerate(as_completed(tugas), 1):
                hasil[tugas[t]] = t.result()
                log("render", f"{100 * j // n:3d}% ({j}/{n} bagian)")
        self._gabung_statistik(hasil)
        daftar = p.cache / "video_bagian.txt"
        daftar.write_text("".join(f"file '{f.as_posix()}'\n" for f in bagian), encoding="utf-8")
        jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", 0, "-i", daftar,
                  "-c", "copy", tujuan])
        for f in [*bagian, daftar]:
            f.unlink(missing_ok=True)

    def _gabung_statistik(self, hasil: list[dict]) -> None:
        """Gabung catatan per frame dari proses paralel = hasil yang sama dengan render berurutan:
        kotak animasi = gabungan; sampel kontras (dan kotak saat sampel) = yang waktunya paling awal; tutup wajah = maks;
        tutup depth = jumlah/maks; hitungan mask & motion blur = jumlah."""
        for h in hasil:
            self.mb_dipakai += h["mb"]
            for dst, src in ((self.mask_info, h["mask"]), (self.kamera_info, h["kamera"])):
                for k, v in src.items():
                    d = dst.setdefault(k, {"butuh": 0, "ada": 0})
                    d["butuh"] += v["butuh"]
                    d["ada"] += v["ada"]
        for id_, rec in self.rekam.items():
            bag = [h["rekam"][id_] for h in hasil if id_ in h["rekam"]]
            kotak = [r["bbox_animasi"] for r in bag if r.get("bbox_animasi")]
            if kotak:
                rec["bbox_animasi"] = [min(k[0] for k in kotak), min(k[1] for k in kotak),
                                       max(k[2] for k in kotak), max(k[3] for k in kotak)]
            ukur = [r for r in bag if r.get("kontras")]
            if ukur:
                r0 = min(ukur, key=lambda r: r["kontras"]["t"])
                rec["kontras"] = r0["kontras"]
                if rec["tipe"] == "remotion":
                    rec["bbox"], rec["bbox_teks"] = r0["bbox"], r0["bbox_teks"]
            if rec["tipe"] == "remotion" and rec.get("dekoratif") and rec.get("bbox_animasi"):
                rec["bbox"] = rec["bbox_teks"] = rec["bbox_animasi"]
            if tw := [r["tutup_wajah_px"] for r in bag if "tutup_wajah_px" in r]:
                rec["tutup_wajah_px"] = max(tw)
            if tt := [r["tertutup"] for r in bag if r.get("tertutup")]:
                rec["tertutup"] = {"n": sum(u["n"] for u in tt), "jumlah": round(sum(u["jumlah"] for u in tt), 4),
                                   "maks": max(u["maks"] for u in tt)}

    def jumlah_pekerja(self, diminta: int | None) -> int:
        """diminta (CLI --pekerja) > env VIDEO_PEKERJA > otomatis (½ inti CPU, maks 4 — tiap proses ±0,5–1 GB RAM).
        Video pendek tetap berurutan (biaya menyalakan proses > hematnya)."""
        import os
        n = diminta or int(os.environ.get("VIDEO_PEKERJA", 0)) or min(4, max(1, (os.cpu_count() or 2) // 2))
        return max(1, min(n, self.n_frame // (self.p.fps * 2)))

    def render(self, pekerja: int | None = None) -> None:
        p = self.p
        video_tmp = p.cache / "video.mov"
        n = self.jumlah_pekerja(pekerja)
        log("render", f"{self.n_frame} frame ({self.dur:.2f} s), {len(self.lapisan)} lapisan, "
                      f"{len(self.cap)} potongan caption, {len(self.push)} push, {len(self.sfx)} sfx")
        if n > 1:
            self._tutup_pembaca()
            self._render_paralel(video_tmp, n)
        else:
            self._render_rentang(0, self.n_frame, video_tmp)
        log("render", "audio: campur suara + musik (ducking) + sfx → loudnorm")
        mix = p.cache / "mix.wav"
        audio = self.campur_audio(mix)
        jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", video_tmp, "-i", mix,
                  "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "pcm_s24le", "-shortest", p.master_path])
        video_tmp.unlink(missing_ok=True)
        tulis_json(p.layout_path, self.layout(audio))
        for w in self.peringatan:
            log("render", f"PERINGATAN: {w}")
        log("render", f"selesai → {p.master_path.relative_to(p.dir)}, {p.layout_path.relative_to(p.dir)}")

    def potret(self, t: float) -> np.ndarray:
        """Satu frame acak (bukan berurutan) pada waktu t — dipakai still & storyboard."""
        p = self.p
        i = min(self.n_frame - 1, int(round(t * p.fps)))
        latar = None
        if self.ada_rekaman:
            r = Pembaca(p.ingest_video, i / p.fps, p.W, p.H, p.fps, cover=True)
            latar = r.baca().copy()
            r.tutup()
        return self.frame(i, latar, sekuensial=False)

    def still(self, waktu: list[float]) -> list:
        p = self.p
        self._sampel = False
        hasil = []
        for t in waktu:
            img = self.potret(t)
            out = p.out / f"still_{t:06.2f}.png"
            Image.fromarray(img).save(out)
            hasil.append(out)
            log("render", f"still t={t:.2f}s → {out.relative_to(p.dir)}")
        self._tutup_pembaca()
        return hasil

    def _tutup_pembaca(self) -> None:
        for b in self.broll:
            if b["_r"]:
                b["_r"].tutup()
                b["_r"] = None
        for L in self.lapisan:
            if L.overlay:
                L.overlay.tutup()
        for tr in self.transisi:
            if tr.get("_ov"):
                tr["_ov"].tutup()
        for j in self.pip:
            if j["_r"]:
                j["_r"].tutup()
                j["_r"] = None
        for k in self.kamera:
            if k.get("_ov"):
                k["_ov"].tutup()


def _pekerja_rentang(folder: str, a: int, z: int, tujuan: str) -> dict:
    """Proses paralel (spawn): bangun Renderer yang sama (overlay Remotion sudah di-cache proses utama), render [a, z)."""
    import contextlib
    import io
    cv2.setNumThreads(1)  # paralelisme di level proses; thread OpenCV per proses hanya berebut inti
    with contextlib.redirect_stdout(io.StringIO()):  # log pembangunan (overlay cache, peringatan) sudah dicetak proses utama
        r = Renderer(Proyek(folder))
    r._render_rentang(a, z, Path(tujuan), progres=False)
    return {"rekam": r.rekam, "mask": r.mask_info, "kamera": r.kamera_info, "mb": r.mb_dipakai}


def render(p: Proyek, pekerja: int | None = None) -> None:
    Renderer(p).render(pekerja)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("proyek")
    ap.add_argument("--still", help="daftar waktu (detik) dipisah koma, mis. 1.5,8")
    ap.add_argument("--pekerja", type=int, help="jumlah proses render paralel (default: env VIDEO_PEKERJA / otomatis; 1 = berurutan)")
    ap.add_argument("--tanpa-setuju", action="store_true",
                    help="render penuh tanpa persetujuan storyboard — hanya atas keputusan pengguna (dicatat di manifest)")
    arg = ap.parse_args()
    p = Proyek(arg.proyek)
    if not arg.still:  # still = review cepat, tidak butuh persetujuan
        import storyboard
        storyboard.wajib_persetujuan(p, arg.tanpa_setuju)
    r = Renderer(p)
    if arg.still:
        r.still([float(x) for x in arg.still.split(",")])
    else:
        r.render(arg.pekerja)
    return 0


if __name__ == "__main__":
    main_aman(main)
