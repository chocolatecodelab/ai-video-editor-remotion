"""render_kamera — bagian Renderer: transisi seluruh frame (E09/E13/E14/E26/E28–E30, E42 zoom-portal) dan efek kamera
pada rekaman (digital-zoom, phone-mockup, frame-break, pull-back-reveal, vertigo, green-screen, E39 snap-zoom,
E38 frame-escape, E44 studio-reveal, E46 paper-cutout). Parameter: frontmatter `param` modul efek < token kamera.<efek>
< field elemen."""
from __future__ import annotations

from functools import lru_cache

import cv2
import numpy as np

from remotion_jembatan import render_overlay
from render_dasar import Overlay, warp_penuh
from sistem import GagalPipeline, frontmatter, hex_rgb, resolve


# efek kamera (tipe "kamera") & yang butuh mask subjek (roto)
KAMERA = ("digital-zoom", "phone-mockup", "frame-break", "pull-back-reveal", "vertigo", "green-screen",
          "snap-zoom", "frame-escape", "studio-reveal", "paper-cutout")
KAMERA_MASK = {"frame-break", "vertigo", "green-screen", "frame-escape", "paper-cutout"}
BUNYI_KAMERA = {"digital-zoom": "kamera-pukul", "snap-zoom": "kamera-pukul", "paper-cutout": "paper-lapis"}  # lainnya: kamera-masuk
# modul efek → jenis transisi (tipe "transisi")
JENIS_TRANSISI = {"blur-zoom": "blur-zoom", "zoom-through-cut": "zoom-tembus", "whip": "whip", "glitch": "glitch",
                  "celup": "celup", "paper-cut": "kertas", "doodle-boil": "coretan", "zoom-portal": "portal"}
TRANSISI_BAWAAN = {"portal": {"durasi": 0.8, "bunyi": "whoosh-panjang"}}  # jenis tanpa entri token transisi.<jenis>


def param_efek(nama: str) -> dict:
    """Nilai bawaan efek dari frontmatter `param` modulnya (efek baru tidak perlu menaikkan versi token platform)."""
    try:
        return dict(frontmatter(resolve("efek", nama).path)[0].get("param") or {})
    except GagalPipeline:
        return {}


class KameraMixin:
    """Transisi & efek kamera. Dipakai sebagai kelas dasar Renderer (render.py)."""

    def _el_transisi(self, e):
        """Transisi seluruh frame berpusat di `mulai` (titik potong). Jenis (default = motif.transisi gaya):
        blur-zoom (E26), zoom-tembus (E09), whip (E28), glitch (E29), celup (E30), kertas (E13), coretan (E14)."""
        p = self.p
        jenis = e.get("jenis") or JENIS_TRANSISI.get(str(e.get("_efek", "")).partition("@")[0]) or p.t("motif.transisi", "blur-zoom")
        cfg = {**TRANSISI_BAWAAN.get(jenis, {}), **param_efek(str(e.get("_efek", "")).partition("@")[0]),
               **p.t(f"transisi.{jenis}", {})}
        d = float(e.get("durasi", cfg["durasi"]))
        tr = {"id": e["_id"], "jenis": jenis, "mulai": round(e["mulai"] - d / 2, 3), "selesai": round(e["mulai"] + d / 2, 3),
              "skala": float(e.get("skala", cfg.get("skala", 1.0))), "skala_masuk": float(cfg.get("skala-masuk", 1.0)),
              "blur": p.px(float(e.get("blur", cfg.get("blur-px", 0)))), "geser": float(cfg.get("geser", 0)),
              "geser_px": p.px(float(cfg.get("geser-px", 0))), "efek": e.get("_efek"), "_ov": None}
        if jenis in ("kertas", "coretan"):  # sapuan penutup layar (Remotion)
            n = int(round(d * p.fps))
            props = {"W": p.W, "H": p.H, "fps": p.fps, "durasiFrame": n, "skala": p.skala, "zona": list(self.zona),
                     "tokens": p.tokens, "elemen": {"jenis": jenis, "durasi_masuk": 0, "durasi_keluar": 0}}
            path, _ = render_overlay(p, "Sapuan", props)
            tr["_ov"] = Overlay(path, p.W, p.H, p.fps, n)
            tr["overlay"] = path.name
        self.transisi.append(tr)
        if "sfx" not in e and p.t("sfx.otomatis", False) and cfg.get("bunyi"):
            e["_sfx_sendiri"] = True
            self._daftar_sfx({"file": cfg["bunyi"]}, e["mulai"], e["_id"], kelas="transisi", otomatis=True)

    def _terapkan_transisi(self, frame: np.ndarray, t: float, i: int) -> np.ndarray:
        p = self.p
        for tr in self.transisi:
            if not tr["mulai"] <= t < tr["selesai"]:
                continue
            q = (t - tr["mulai"]) / (tr["selesai"] - tr["mulai"])
            b = float(np.sin(np.pi * q))
            j = tr["jenis"]
            if j == "blur-zoom":
                frame = warp_penuh(frame, 1 + (tr["skala"] - 1) * b, p.W / 2, p.H / 2)
                if tr["blur"] * b > 0.6:
                    frame = cv2.GaussianBlur(frame, (0, 0), tr["blur"] * b / 2)
            elif j == "zoom-tembus":  # masuk menembus titik tengah, potong, keluar dari skala besar
                s = 1 + (tr["skala"] - 1) * q ** 2.2 * 2 if q < 0.5 else 1 + (tr["skala_masuk"] - 1) * (1 - q) ** 2.2 * 2
                frame = warp_penuh(frame, max(1.0, s), p.W / 2, p.H / 2)
                if tr["blur"] * b > 0.6:
                    frame = cv2.GaussianBlur(frame, (0, 0), tr["blur"] * b / 2)
            elif j == "whip":  # geser cepat + blur arah horizontal
                dx = (q * 2 if q < 0.5 else (q - 1) * 2) * p.W * tr["geser"]
                frame = cv2.warpAffine(frame, np.float32([[1, 0, -dx], [0, 1, 0]]), (p.W, p.H), borderMode=cv2.BORDER_REFLECT)
                L = int(tr["blur"] * b)
                if L > 2:
                    frame = cv2.blur(frame, (L, 1))
            elif j == "glitch":  # pergeseran kanal RGB + irisan horizontal bergeser + garis pindai
                rng = np.random.default_rng(i)
                d = int(tr["geser_px"] * b) + 1
                out = frame.copy()
                out[..., 0] = np.roll(frame[..., 0], d, axis=1)
                out[..., 2] = np.roll(frame[..., 2], -d, axis=1)
                for _ in range(int(3 + 6 * b)):
                    y0 = int(rng.integers(0, p.H - 40))
                    h = int(rng.integers(8, 90))
                    out[y0:y0 + h] = np.roll(out[y0:y0 + h], int(rng.integers(-3, 4) * d), axis=1)
                out[::4] *= 1 - 0.25 * b
                frame = out
            elif j == "celup":  # celup ke warna latar gaya, potong tersembunyi di puncak
                frame = frame * (1 - b) + np.float32(hex_rgb(p.t("warna.latar"))) * b
            elif j == "portal":
                frame = self._portal(tr, frame, q)
            elif tr["_ov"] is not None:  # kertas / coretan
                rgba = tr["_ov"].ambil(i - int(round(tr["mulai"] * p.fps)))
                if rgba is not None:
                    a = rgba[..., 3:4].astype(np.float32) / 255.0
                    frame = rgba[..., :3].astype(np.float32) * a + frame * (1 - a)
        return frame

    # ---------------------------------------------------------- kamera (efek pada rekaman)
    def _el_kamera(self, e):
        """Efek kamera pada rekaman: digital-zoom (E05), phone-mockup (E06), frame-break (E04), pull-back-reveal (E11),
        vertigo (E15), green-screen (E12, ganti latar). Parameter dari token kamera.<jenis>, boleh ditimpa elemen."""
        p = self.p
        jenis = str(e.get("_efek") or e.get("jenis") or "").partition("@")[0]
        if jenis not in KAMERA:
            raise GagalPipeline(f"{e['_id']}: kamera butuh 'efek' salah satu {', '.join(KAMERA)}.")
        if not self.ada_rekaman:
            raise GagalPipeline(f"{e['_id']}: efek kamera {jenis} butuh rekaman.")
        cfg = param_efek(jenis)
        cfg.update(p.t(f"kamera.{jenis}", {}))
        cfg.update({k: v for k, v in e.items() if not k.startswith("_") and k not in ("tipe", "efek", "mulai", "selesai")})
        dur = e["selesai"] - e["mulai"]
        k = {"id": e["_id"], "jenis": jenis, "mulai": e["mulai"], "selesai": e["selesai"], "cfg": cfg,
             "d_in": min(float(cfg.get("durasi-masuk", 0.45)), dur / 3), "d_out": min(float(cfg.get("durasi-keluar", 0.35)), dur / 3)}
        if jenis == "digital-zoom":
            k["ketukan"] = [float(x) for x in cfg.get("ketukan") or [0.0, round(dur * 0.5, 2)]]
        if jenis == "snap-zoom":
            k["ketukan"] = [float(cfg.get("durasi-masuk", 0.16))]
        if jenis == "studio-reveal":  # set studio Remotion ber-lubang layar; rekaman tampil di lubang
            n = int(round(dur * p.fps))
            props = {"W": p.W, "H": p.H, "fps": p.fps, "durasiFrame": n, "skala": p.skala, "zona": list(self.zona),
                     "tokens": p.tokens, "elemen": {"lubang": cfg.get("lubang", [0.2, 0.12, 0.8, 0.72]), "durasi_masuk": 0,
                                                     "durasi_keluar": 0, "judul": cfg.get("judul"), "jadwal": {}}}
            path, _ = render_overlay(p, "StudioSet", props)
            k["_ov"] = Overlay(path, p.W, p.H, p.fps, n)
            k["overlay"] = path.name
        self.kamera.append(k)
        self.rekam[e["_id"]] = {"id": e["_id"], "tipe": "kamera", "beat": e["_beat"], "efek": e.get("_efek"),
                                "mulai": round(e["mulai"], 3), "selesai": round(e["selesai"], 3), "bbox": [0, 0, p.W, p.H],
                                "bbox_animasi": None, "induk": None, "dekoratif": True, "fungsi": e.get("fungsi"),
                                "anchor": e.get("_anchor_spek"), "anchor_kata": e.get("_anchor", False),
                                "butuh_mask": jenis in KAMERA_MASK, "masuk": jenis, "keluar": jenis}
        if "sfx" not in e and p.t("sfx.otomatis", False):
            e["_sfx_sendiri"] = True
            peta = p.t("sfx.peta")
            kunci = BUNYI_KAMERA.get(jenis, "kamera-masuk")
            m = peta[kunci]
            waktu = [e["mulai"] + x for x in k.get("ketukan", [0.0])]
            for n, tk in enumerate(waktu):
                self._daftar_sfx({"file": m["bunyi"]}, tk, f"{e['_id']}/k{n}", kelas=m["kelas"], otomatis=True)

    def _latar_gaya(self) -> np.ndarray:
        """Latar penuh dari token (gradien latar + cahaya aksen) untuk efek kamera yang mengecilkan rekaman."""
        if getattr(self, "_latar_cache", None) is None:
            p = self.p
            a = np.float32(hex_rgb(p.t("warna.latar")))
            c = np.float32(hex_rgb(p.t("warna.aksen")))
            c2 = np.float32(hex_rgb(p.t("warna.aksen-2")))
            yy, xx = np.mgrid[0:p.H, 0:p.W].astype(np.float32)
            g1 = np.exp(-(((xx - p.W * 0.2) / (p.W * 0.6)) ** 2 + ((yy - p.H * 0.25) / (p.H * 0.35)) ** 2))[..., None]
            g2 = np.exp(-(((xx - p.W * 0.85) / (p.W * 0.6)) ** 2 + ((yy - p.H * 0.8) / (p.H * 0.35)) ** 2))[..., None]
            gelap = 0.82 + 0.18 * (1 - yy / p.H)[..., None]
            self._latar_cache = np.clip(a * gelap + (c - a) * g1 * 0.22 + (c2 - a) * g2 * 0.18, 0, 255)
        return self._latar_cache

    @staticmethod
    @lru_cache(maxsize=16)
    def _kotak_bulat(w: int, h: int, r: int) -> np.ndarray:
        m = np.zeros((h, w), np.uint8)
        r = max(1, min(r, w // 2, h // 2))
        cv2.rectangle(m, (r, 0), (w - r - 1, h - 1), 255, -1)
        cv2.rectangle(m, (0, r), (w - 1, h - r - 1), 255, -1)
        for cx, cy in ((r, r), (w - r - 1, r), (r, h - r - 1), (w - r - 1, h - r - 1)):
            cv2.circle(m, (cx, cy), r, 255, -1, lineType=cv2.LINE_AA)
        return cv2.GaussianBlur(m, (3, 3), 0).astype(np.float32) / 255.0

    def _kamera_aktif(self, t: float) -> dict | None:
        return next((k for k in self.kamera if k["mulai"] <= t < k["selesai"]), None)

    def _terapkan_kamera(self, k: dict, src: np.ndarray, i: int, t: float, s: float, fx: float, fy: float) -> np.ndarray:
        p = self.p
        cfg = k["cfg"]
        rel = t - k["mulai"]
        e_in = self.ease["standar"]
        kk = e_in(min(1.0, rel / max(1e-3, k["d_in"]))) * e_in(min(1.0, (k["selesai"] - t) / max(1e-3, k["d_out"])))
        j = k["jenis"]
        if j == "snap-zoom":
            return self._snap_zoom(k, src, i, t, s, fx, fy, rel)
        if j == "digital-zoom":
            skala = [float(x) for x in cfg.get("skala", [1.12, 1.24])]
            sz, guncang = 1.0, 0.0
            dp = float(cfg.get("durasi-pukul", 0.12))
            for n, tk in enumerate(k["ketukan"]):
                if rel >= tk:
                    target = skala[min(n, len(skala) - 1)]
                    q = min(1.0, (rel - tk) / dp)
                    sz = sz + (target - sz) * (1 - (1 - q) ** 3)
                    guncang = max(0.0, 1 - (rel - tk) / 0.28)
            keluar = e_in(min(1.0, (k["selesai"] - t) / max(1e-3, k["d_out"])))
            sz = 1 + (sz - 1) * keluar
            amp = p.px(float(cfg.get("guncang-px", 10))) * guncang
            ffx, ffy = self._fokus_wajah(t, fx, fy)
            dasar = warp_penuh(src, s * sz, ffx + np.sin(i * 2.1) * amp, ffy + np.cos(i * 1.7) * amp)
            return dasar.astype(np.float32)
        dasar = warp_penuh(src, s, fx, fy).astype(np.float32)
        if j == "vertigo":
            m = self._mask(i)
            sb = 1 + (float(cfg.get("skala-latar", 1.3)) - 1) * e_in(min(1.0, rel / max(1e-3, k["selesai"] - k["mulai"]))) * \
                e_in(min(1.0, (k["selesai"] - t) / max(1e-3, k["d_out"])))
            latar = warp_penuh(src, s * sb, fx, fy).astype(np.float32)
            if m is None:
                return latar
            m = warp_penuh(m, s, fx, fy)[..., None]
            return latar * (1 - m) + dasar * m
        if j == "frame-escape":
            return self._frame_escape(k, dasar, i, rel, kk, s, fx, fy)
        if j == "studio-reveal":
            return self._studio_reveal(k, dasar, i, kk)
        if j == "paper-cutout":
            return self._paper_cutout(k, dasar, i, rel, kk, s, fx, fy)
        if j == "green-screen":
            m = self._mask(i)
            if m is None:
                return dasar
            m = warp_penuh(m, s, fx, fy)[..., None] * kk + (1 - kk)
            return self._latar_gaya() * (1 - m) + dasar * m
        # rekaman dikecilkan ke dalam bingkai: pull-back-reveal, phone-mockup, frame-break
        sf = 1 + (float(cfg.get("skala", 0.66)) - 1) * kk
        cx, cy = p.W / 2, p.H * float(cfg.get("pusat-y", 0.47))
        if j == "phone-mockup":
            cy += (1 - kk) * p.H * 0.06
        hasil = self._latar_gaya().copy()
        kecil = cv2.resize(dasar, (max(2, int(p.W * sf)), max(2, int(p.H * sf))), interpolation=cv2.INTER_AREA)
        h, w = kecil.shape[:2]
        x0, y0 = int(cx - w / 2), int(cy - h / 2)
        if j == "frame-break":
            fw = int(p.W * (1 + (float(cfg.get("lebar", 0.78)) - 1) * kk))
            fh = int(p.H * (1 + (float(cfg.get("tinggi", 0.58)) - 1) * kk))
            fx0, fy0 = int(cx - fw / 2), int(cy - fh / 2 + p.H * 0.04 * kk)
            jendela = np.zeros((p.H, p.W), np.float32)
            jendela[max(0, fy0):fy0 + fh, max(0, fx0):fx0 + fw] = 1
            lapis = hasil.copy()
            self._tempel_kotak(lapis, kecil, x0, y0, None)
            hasil = lapis * jendela[..., None] + hasil * (1 - jendela[..., None])
            tebal = max(1, int(p.px(float(cfg.get("tebal", 14))) * kk))
            cv2.rectangle(hasil, (fx0, fy0), (fx0 + fw, fy0 + fh), tuple(float(v) for v in hex_rgb(p.t("warna.teks-utama"))), tebal)
            m = self._mask(i)
            if m is not None:  # subjek menembus bingkai
                mk = cv2.resize(warp_penuh(m, s, fx, fy), (w, h), interpolation=cv2.INTER_AREA)
                self._tempel_kotak(hasil, kecil, x0, y0, mk * kk)
            return hasil
        r = p.px(float(cfg.get("radius", 60))) * sf
        if j == "phone-mockup":
            bz = p.px(float(cfg.get("bezel", 24)))
            bodi = np.full((h + 2 * bz, w + 2 * bz, 3), np.float32(hex_rgb(cfg.get("warna-bodi", "#111317"))))
            mb = self._kotak_bulat(w + 2 * bz, h + 2 * bz, int(r + bz))
            self._tempel_kotak(hasil, bodi, x0 - bz, y0 - bz, mb * kk + (1 - kk) * 0, bayangan=True)
            self._tempel_kotak(hasil, kecil, x0, y0, self._kotak_bulat(w, h, int(r)) * kk + (1 - kk))
            nw = int(w * 0.28)
            cv2.rectangle(hasil, (int(cx - nw / 2), y0 + bz // 2), (int(cx + nw / 2), y0 + bz // 2 + p.px(26)), (10, 10, 12), -1)
            return hasil
        # pull-back-reveal: bingkai garis aksen tipis
        garis = p.px(6)
        self._tempel_kotak(hasil, np.full((h + 2 * garis, w + 2 * garis, 3), np.float32(hex_rgb(p.t("warna.aksen")))),
                           x0 - garis, y0 - garis, self._kotak_bulat(w + 2 * garis, h + 2 * garis, int(r + garis)) * kk, bayangan=True)
        self._tempel_kotak(hasil, kecil, x0, y0, self._kotak_bulat(w, h, int(r)) * kk + (1 - kk))
        return hasil

    def _tempel_kotak(self, dasar: np.ndarray, img: np.ndarray, x: int, y: int, mask: np.ndarray | None, bayangan: bool = False) -> None:
        """Tempel img (h, w, 3) di (x, y) dengan mask (h, w) 0–1 (None = penuh), terpotong tepi frame."""
        H, W = dasar.shape[:2]
        h, w = img.shape[:2]
        a0, b0 = max(0, x), max(0, y)
        a1, b1 = min(W, x + w), min(H, y + h)
        if a1 <= a0 or b1 <= b0:
            return
        sub = img[b0 - y:b1 - y, a0 - x:a1 - x]
        m = np.ones(sub.shape[:2], np.float32) if mask is None else mask[b0 - y:b1 - y, a0 - x:a1 - x]
        if bayangan:  # jatuh searah cahaya rekaman (K10.3, render_menyatu); bawaan lurus ke bawah
            ux, uy = getattr(self, "arah_bayangan", (0.0, 1.0))
            dx, dy = int(round(ux * self.p.px(18))), int(round(uy * self.p.px(18)))
            xa, ya, xb, yb = max(0, a0 + dx), max(0, b0 + dy), min(W, a1 + dx), min(H, b1 + dy)
            if xb > xa and yb > ya:
                ms = cv2.GaussianBlur(m, (0, 0), self.p.px(16)) * 0.45
                dasar[ya:yb, xa:xb] *= 1 - ms[ya - b0 - dy:yb - b0 - dy, xa - a0 - dx:xb - a0 - dx, None]
        reg = dasar[b0:b1, a0:a1]
        reg[:] = sub * m[..., None] + reg * (1 - m[..., None])

    def _fokus_wajah(self, t: float, fx: float, fy: float) -> tuple[float, float]:
        """Pusat zoom = tengah wajah (cache/wajah.json, wajah.py) bila ada; selain itu fokus push."""
        w = self.wajah
        if not w:
            return fx, fy
        k = min(w, key=lambda r: abs(r["t"] - t))
        if abs(k["t"] - t) > 0.6 or not k.get("kotak"):
            return fx, fy
        x0, y0, x1, y1 = k["kotak"]
        return (x0 + x1) / 2 * self.p.W, (y0 + y1) / 2 * self.p.H

    # ---------------------------------------------------------- efek kamera & transisi tambahan (E38, E39, E42, E44, E46)
    def _snap_zoom(self, k, src, i, t, s, fx, fy, rel) -> np.ndarray:
        """E39: zoom kilat ke wajah (±0,16 s) dengan zoom-blur & kilatan, tahan, lalu kembali kilat di akhir."""
        cfg = k["cfg"]
        z = float(cfg.get("skala", 1.45))
        tin, tout = float(cfg.get("durasi-masuk", 0.16)), float(cfg.get("durasi-keluar", 0.14))
        sisa = k["selesai"] - t
        if rel < tin:
            q = rel / tin
            sz, blur = 1 + (z - 1) * (1 - (1 - q) ** 3), float(np.sin(np.pi * q))
        elif sisa < tout:
            q = max(0.0, sisa / tout)
            sz, blur = 1 + (z - 1) * (1 - (1 - q) ** 3), float(np.sin(np.pi * q))
        else:
            sz, blur = z, 0.0
        ffx, ffy = self._fokus_wajah(t, fx, fy)
        if blur > 0.05:  # zoom-blur: rata-rata beberapa skala di sepanjang arah gerak
            n = 5
            img = sum(warp_penuh(src, s * sz * (1 - 0.03 * blur * j), ffx, ffy).astype(np.float32) for j in range(n)) / n
        else:
            img = warp_penuh(src, s * sz, ffx, ffy).astype(np.float32)
        kilat = max(0.0, 1 - abs(rel - tin) / 0.07)  # kilatan putih singkat di puncak
        if kilat > 0:
            img = img * (1 - 0.35 * kilat) + 255.0 * 0.35 * kilat
        return img

    def _frame_escape(self, k, dasar, i, rel, kk, s, fx, fy) -> np.ndarray:
        """E38: rekaman mengecil jadi kartu miring di latar gaya, lalu SUBJEK keluar dari kartu (membesar ke ukuran
        penuh di depan kartu, dengan bayangan). Butuh roto."""
        p, cfg = self.p, k["cfg"]
        sf = 1 + (float(cfg.get("skala", 0.62)) - 1) * kk
        cx, cy = p.W / 2, p.H * float(cfg.get("pusat-y", 0.45))
        hasil = self._latar_gaya().copy()
        w, h = max(2, int(p.W * sf)), max(2, int(p.H * sf))
        kecil = cv2.resize(dasar, (w, h), interpolation=cv2.INTER_AREA)
        miring = float(cfg.get("miring", 7)) * kk  # derajat: sisi kanan kartu sedikit menjauh
        d = np.tan(np.radians(miring)) * h * 0.25
        x0, y0 = cx - w / 2, cy - h / 2
        sumber = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
        tuju = np.float32([[x0, y0], [x0 + w, y0 + d], [x0 + w, y0 + h - d], [x0, y0 + h]])
        M = cv2.getPerspectiveTransform(sumber, tuju)
        kartu = cv2.warpPerspective(kecil, M, (p.W, p.H), flags=cv2.INTER_LINEAR)
        mk = cv2.warpPerspective(np.ones((h, w), np.float32), M, (p.W, p.H))
        bay = cv2.GaussianBlur(np.roll(np.roll(mk, p.px(22), 0), p.px(14), 1), (0, 0), p.px(18))[..., None] * 0.45 * kk
        hasil = hasil * (1 - bay)
        hasil = kartu * mk[..., None] + hasil * (1 - mk[..., None])
        tebal = max(1, int(p.px(float(cfg.get("tebal", 10))) * kk))
        cv2.polylines(hasil, [tuju.astype(np.int32)], True, tuple(float(v) for v in hex_rgb(p.t("warna.panel"))), tebal, cv2.LINE_AA)
        mulai_lepas = k["d_in"] + float(cfg.get("tunda", 0.35))
        e2 = self.ease["standar"](min(1.0, max(0.0, (rel - mulai_lepas) / float(cfg.get("durasi-lepas", 0.6)))))
        m = self._mask(i)
        if m is None or e2 <= 0:
            return hasil
        m = warp_penuh(m, s, fx, fy)
        ss = sf + (float(cfg.get("skala-subjek", 1.0)) - sf) * e2   # subjek: dari ukuran kartu → penuh
        ccx, ccy = cx + (p.W / 2 - cx) * e2, cy + (p.H / 2 - cy) * e2
        A = np.float32([[ss, 0, ccx - p.W / 2 * ss], [0, ss, ccy - p.H / 2 * ss]])
        subjek = cv2.warpAffine(dasar, A, (p.W, p.H), flags=cv2.INTER_LINEAR)
        ms = cv2.warpAffine(m, A, (p.W, p.H), flags=cv2.INTER_LINEAR)[..., None]
        bay = cv2.GaussianBlur(np.roll(ms[..., 0], p.px(18), 0), (0, 0), p.px(14))[..., None] * 0.4 * e2
        hasil = hasil * (1 - bay)
        return subjek * ms + hasil * (1 - ms)

    def _studio_reveal(self, k, dasar, i, kk) -> np.ndarray:
        """E44: kamera mundur dari layar — rekaman ternyata tampil di layar besar sebuah studio (set Remotion warna gaya)."""
        p, cfg = self.p, k["cfg"]
        hx0, hy0, hx1, hy1 = [float(v) for v in cfg.get("lubang", [0.2, 0.12, 0.8, 0.72])]
        cxh, cyh = (hx0 + hx1) / 2 * p.W, (hy0 + hy1) / 2 * p.H
        S0 = max(1.0 / (hx1 - hx0), 1.0 / (hy1 - hy0))
        S = S0 + (1 - S0) * kk
        hasil = np.zeros((p.H, p.W, 3), np.float32)
        rw, rh = max(2, int((hx1 - hx0) * p.W * S)), max(2, int((hy1 - hy0) * p.H * S))
        isi = cv2.resize(dasar, (rw, rh), interpolation=cv2.INTER_AREA if S < 1.5 else cv2.INTER_LINEAR)
        self._tempel_kotak(hasil, isi, int(cxh - rw / 2), int(cyh - rh / 2), None)
        rgba = k["_ov"].ambil(i - int(round(k["mulai"] * p.fps)))
        if rgba is None:
            return hasil
        rgba = warp_penuh(rgba.astype(np.float32), S, cxh, cyh)
        a = rgba[..., 3:4] / 255.0
        return rgba[..., :3] * a + hasil * (1 - a)

    def _kertas_tekstur(self) -> np.ndarray:
        if getattr(self, "_tekstur_kertas", None) is None:
            p = self.p
            rng = np.random.default_rng(7)
            n = cv2.GaussianBlur(rng.normal(0, 1, (p.H // 2, p.W // 2)).astype(np.float32), (0, 0), 1.2)
            n = cv2.resize(n, (p.W, p.H))
            self._tekstur_kertas = (1 + 0.035 * n)[..., None]
        return self._tekstur_kertas

    def _paper_cutout(self, k, dasar, i, rel, kk, s, fx, fy) -> np.ndarray:
        """E46: subjek jadi potongan kertas/stiker — tepi putih tebal bertekstur + bayangan, latar kertas warna gaya,
        gerak dipatah 12 fps (getar stop-motion). Butuh roto."""
        p, cfg = self.p, k["cfg"]
        m = self._mask(i)
        if m is None:
            return dasar
        m = warp_penuh(m, s, fx, fy)
        langkah = int(rel * 12)  # stop-motion 12 fps
        rng = np.random.default_rng(langkah)
        dx, dy = (rng.uniform(-1, 1, 2) * p.px(float(cfg.get("getar-px", 3))) * kk).astype(int)
        if dx or dy:
            A = np.float32([[1, 0, dx], [0, 1, dy]])
            dasar = cv2.warpAffine(dasar, A, (p.W, p.H), borderMode=cv2.BORDER_REFLECT)
            m = cv2.warpAffine(m, A, (p.W, p.H))
        latar = np.full((p.H, p.W, 3), np.float32(hex_rgb(p.t("warna.latar")))) * self._kertas_tekstur()
        hasil = dasar * (1 - kk) + latar * kk
        tepi = p.px(float(cfg.get("tepi-px", 16)))
        stiker = cv2.dilate((m > 0.5).astype(np.float32), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * tepi + 1, 2 * tepi + 1)))
        stiker = cv2.GaussianBlur(stiker, (0, 0), 1.2) * kk
        bay = cv2.GaussianBlur(np.roll(np.roll(stiker, p.px(16), 0), p.px(10), 1), (0, 0), p.px(10))[..., None] * 0.38
        hasil = hasil * (1 - bay)
        putih = np.float32(hex_rgb(cfg.get("warna-tepi", "#FBF8F1"))) * self._kertas_tekstur()
        hasil = putih * stiker[..., None] + hasil * (1 - stiker[..., None])
        return dasar * m[..., None] + hasil * (1 - m[..., None])

    def _portal(self, tr, frame, q) -> np.ndarray:
        """E42 zoom-portal: paruh pertama kamera masuk ke lingkaran portal di tengah (luar meredup & membesar);
        paruh kedua adegan baru tampil di lingkaran yang membesar sampai penuh, luar = adegan lama (beku)."""
        p = self.p
        cx, cy = p.W / 2, p.H * 0.42
        rmax = float(np.hypot(max(cx, p.W - cx), max(cy, p.H - cy)))
        rmin = p.W * 0.16
        yy, xx = np.ogrid[:p.H, :p.W]
        jarak = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2).astype(np.float32)
        aksen = np.float32(hex_rgb(p.t("warna.aksen")))
        if q < 0.5:
            q1 = self.ease["standar"](q * 2)
            r = rmax + (rmin - rmax) * q1
            dalam = warp_penuh(frame, 1 + 0.6 * q1, cx, cy)
            luar = cv2.GaussianBlur(dalam, (0, 0), 2 + 10 * q1) * (1 - 0.6 * q1)
        else:
            if tr.get("_snap") is None:  # adegan lama tepat sebelum potongan (dirender sekali, tanpa statistik)
                simpan = self._sampel
                self._sampel = False
                tr["_snap"] = self.potret(max(0.0, (tr["mulai"] + tr["selesai"]) / 2 - 1.0 / p.fps)).astype(np.float32)
                self._sampel = simpan
                for b in self.broll:  # potret membuka pembaca broll di waktu lain → paksa buka ulang
                    if b["_r"]:
                        b["_r"].tutup()
                        b["_r"] = None
            q2 = self.ease["standar"]((q - 0.5) * 2)
            r = rmin + (rmax - rmin) * q2
            dalam = warp_penuh(frame, 1.25 - 0.25 * q2, cx, cy)
            luar = cv2.GaussianBlur(warp_penuh(tr["_snap"], 1.6 + 0.8 * q2, cx, cy), (0, 0), 12) * 0.4
        lembut = max(2.0, p.px(6))
        m = np.clip((r - jarak) / lembut, 0, 1)[..., None]
        cincin = np.exp(-((jarak - r) / p.px(10)) ** 2)[..., None] * 0.85
        hasil = dalam * m + luar * (1 - m)
        return hasil * (1 - cincin) + aksen * cincin
