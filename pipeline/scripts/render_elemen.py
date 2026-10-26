"""render_elemen — bagian Renderer: elemen PIL (judul/teks, gambar, kartu, cta, info, chip, latar)."""
from __future__ import annotations

import numpy as np
from PIL import Image

from render_dasar import Lapisan, ke_premult
from render_panel import IKON, buat_panel, sprite_ikon, sprite_status, susun_horizontal, susun_vertikal
from render_teks import Sprite
from sistem import GagalPipeline, resolve


class ElemenMixin:
    """Elemen PIL. Dipakai sebagai kelas dasar Renderer (render.py)."""

    def _teks_sprite(self, e, peran, lebar=None, warna=None, **kw) -> Sprite:
        p = self.p
        kw.setdefault("hias", self.hias)
        return self.pen.teks(e["teks"], peran, p.px(e.get("ukuran", p.t(f"ukuran.{peran}"))),
                             lebar or self._lebar_maks(e), p.t(f"warna.{warna or 'teks-utama'}"),
                             aksen=p.t("warna.aksen"), **kw)

    def _el_judul(self, e, peran="judul", posisi="atas"):
        if not e.get("teks"):
            raise GagalPipeline(f"{e['_id']}: butuh 'teks'.")
        p = self.p
        if e["tipe"] == "judul" and p.t("motif.judul", None) and e.get("efek_teks", True) and "x" not in e and "y" not in e:
            return self._judul_gaya(e, posisi)
        # keterbacaan di atas video (K01.4): "stroke": true|px, atau "latar": "panel"
        stroke = e.get("stroke", 0)
        stroke = p.px(p.t("caption.stroke")) if stroke is True else p.px(stroke)
        panel = e.get("latar") == "panel"
        pad = p.px(p.t("spasi.padding-kartu")) if panel else 0
        spr = self._teks_sprite(e, peran, lebar=self._lebar_maks(e) - 2 * pad, warna=e.get("warna"),
                                stroke=stroke, warna_stroke=p.t("warna.stroke"), bayangan=not panel)
        an = self._anim_dasar(e)
        if panel:
            pd = spr.info["pad"]
            pw, ph = spr.w - 2 * pd + 2 * pad, spr.h - 2 * pd + int(pad * 1.4)
            cx, cy = self._pusat(e, pw, ph, posisi)
            pn = buat_panel(p, pw, ph, p.px(p.t("radius.kartu")), p.t("warna.panel"), p.t("warna.panel-opasitas"),
                            p.t("warna.garis-opasitas"), p.t("warna.garis-panel"), p.px(p.t("blur.panel")))
            Lp = Lapisan(e["_id"], e["tipe"], e["mulai"], e["selesai"], cx, cy, panel=pn, ukur_kontras=False, **an)
            self.lapisan.append(Lp)
            self._catat(Lp, e, peran=peran, latar="panel")
            L = Lapisan(e["_id"] + "/teks", "teks-panel", e["mulai"], e["selesai"], cx, cy, sprite=spr,
                        induk=e["_id"], **an)
        else:
            cx, cy = self._pusat(e, spr.w, spr.h, posisi)
            L = Lapisan(e["_id"], e["tipe"], e["mulai"], e["selesai"], cx, cy, sprite=spr, **an)
        self.lapisan.append(L)
        self._catat(L, e, peran=peran)

    def _judul_gaya(self, e, posisi: str) -> None:
        """Judul dengan efek teks khas gaya (E31, Remotion JudulGaya): masuk & hiasan dari token motif.judul."""
        p = self.p
        stroke = e.get("stroke")
        r = {k: v for k, v in e.items() if k not in ("tipe", "efek", "stroke")}
        r.update(tipe="remotion", efek="judul-gaya", _efek=resolve("efek", "judul-gaya").ref, posisi=e.get("posisi", posisi),
                 stroke=bool(stroke), latar=e.get("latar"))
        self._el_remotion(r)
        rec = self.rekam[e["_id"]]
        rec["judul"] = True
        # JudulGaya menganimasikan masuknya sendiri (motif.judul.masuk; <Wadah> tidak menambah gerak) → catat yang terjadi
        rec["masuk"] = e.get("masuk_gaya") or p.t("motif.judul.masuk", "fade")
        if stroke:  # K01.4: keterbacaan dari outline (warna token stroke), sama seperti judul PIL
            rec.update(stroke=p.px(p.t("caption.stroke")), warna_stroke=p.t("warna.stroke"))
        if e.get("latar") == "panel":
            rec["panel_opasitas"] = float(p.t("warna.panel-opasitas"))
        elif not stroke:
            rec["panel_opasitas"] = 0.0  # langsung di atas latar (video tanpa rekaman: warna latar) → kontras diukur apa adanya
        e["_sfx_sendiri"] = r.get("_sfx_sendiri")

    def _el_teks(self, e):
        self._el_judul(e, peran=e.get("peran", "isi"), posisi="tengah")

    def _el_gambar(self, e):
        p = self.p
        path = p.path_aset(e.get("file"))
        if not path or not path.exists():
            raise GagalPipeline(f"{e['_id']}: file gambar {e.get('file')!r} tidak ada.")
        img = Image.open(path).convert("RGBA")
        lw = self._lebar_maks(e)
        img = img.resize((lw, int(img.height * lw / img.width)), Image.LANCZOS)
        spr = Sprite(ke_premult(img), {"pad": 0})
        cx, cy = self._pusat(e, spr.w, spr.h, "tengah")
        L = Lapisan(e["_id"], "gambar", e["mulai"], e["selesai"], cx, cy, sprite=spr, ukur_kontras=False,
                    **self._anim_dasar(e))
        self.lapisan.append(L)
        self._catat(L, e, file=e["file"])

    def _el_kartu(self, e):
        p = self.p
        pad, jarak = p.px(p.t("spasi.padding-kartu")), p.px(p.t("spasi.jarak-item"))
        lw = self._lebar_maks(e)
        isi_w = lw - 2 * pad
        spek = ([("judul", e["judul"], "subjudul", "teks-utama")] if e.get("judul") else []) +                ([("teks", e["teks"], "isi", "teks-sekunder")] if e.get("teks") else []) +                [("item", f"{e.get('penanda', '•')} {it}", "isi", "teks-sekunder") for it in e.get("item", [])]
        if not spek:
            raise GagalPipeline(f"{e['_id']}: kartu butuh judul, teks, atau item.")
        anak = [(self.pen.teks(teks, peran, p.px(p.t(f"ukuran.{peran}")), isi_w, p.t(f"warna.{warna}"),
                               aksen=p.t("warna.aksen"), rata="kiri", bayangan=False, hias=self.hias), jenis, teks, peran)
                for jenis, teks, peran, warna in spek]
        pads = [a[0].info["pad"] for a in anak]
        tinggi_isi = sum(a[0].h - 2 * pd for a, pd in zip(anak, pads)) + jarak * (len(anak) - 1)
        ph = tinggi_isi + 2 * pad
        pn = buat_panel(p, lw, ph, p.px(p.t("radius.kartu")), p.t("warna.panel"), p.t("warna.panel-opasitas"),
                        p.t("warna.garis-opasitas"), p.t("warna.garis-panel"), p.px(p.t("blur.panel")))
        cx, cy = self._pusat(e, lw, ph, "tengah")
        an = self._anim_dasar(e)
        Lp = Lapisan(e["_id"], "kartu", e["mulai"], e["selesai"], cx, cy, panel=pn, ukur_kontras=False, **an)
        self.lapisan.append(Lp)
        stagger = float(e.get("stagger", p.t("durasi.stagger")))
        n_item = sum(1 for a in anak if a[1] == "item")
        self._catat(Lp, e, item=n_item, stagger=stagger if n_item > 1 else None)
        y = cy - ph / 2 + pad
        x_kiri = cx - lw / 2 + pad
        an_anak = dict(an, masuk="naik" if an["masuk"] != "tidak" else "tidak")
        for i, ((spr, jenis, teks, peran), pd) in enumerate(zip(anak, pads)):
            acx = x_kiri - pd + spr.w / 2
            acy = y - pd + spr.h / 2
            L = Lapisan(f"{e['_id']}/{i}", "teks-kartu", e["mulai"], e["selesai"], acx, acy, sprite=spr,
                        delay=an["d_in"] * 0.5 + i * stagger, induk=e["_id"], **an_anak)
            self.lapisan.append(L)
            self._catat(L, {"teks": teks, "_beat": e["_beat"]}, peran=peran, bagian=jenis)
            y += spr.h - 2 * pd + jarak

    def _el_cta(self, e):
        p = self.p
        pad = p.px(p.t("spasi.padding-kartu"))
        spr = self.pen.teks(e["teks"], "subjudul", p.px(e.get("ukuran", p.t("ukuran.subjudul"))),
                            self._lebar_maks(e) - 2 * pad, p.t("warna.latar"), bayangan=False)
        pd = spr.info["pad"]
        pw, ph = spr.w - 2 * pd + 2 * pad, spr.h - 2 * pd + int(pad * 1.2)
        pn = buat_panel(p, pw, ph, p.px(p.t("radius.chip")), p.t("warna.aksen"), 1.0, 0, "#000000", 0)
        cx, cy = self._pusat(e, pw, ph, "tengah")
        an = self._anim_dasar(e, "pop")
        Lp = Lapisan(e["_id"], "cta", e["mulai"], e["selesai"], cx, cy, panel=pn, ukur_kontras=False, **an)
        self.lapisan.append(Lp)
        self._catat(Lp, e)
        L = Lapisan(e["_id"] + "/teks", "teks-cta", e["mulai"], e["selesai"], cx, cy, sprite=spr, induk=e["_id"], **an)
        self.lapisan.append(L)
        self._catat(L, e, peran="subjudul")

    def _panel_teks(self, e, isi: np.ndarray, info: dict, radius: int, pad_x: int, pad_y: int, tipe: str) -> None:
        """Panel token (kaca/solid) + isi premult di tengahnya → 2 lapisan (panel, teks) seperti judul ber-panel."""
        p = self.p
        h, w = isi.shape[:2]
        pw, ph = w + 2 * pad_x, h + 2 * pad_y
        cx, cy = self._pusat(e, pw, ph, "tengah")
        pn = buat_panel(p, pw, ph, radius, p.t("warna.panel"), float(e.get("opasitas", p.t("warna.panel-opasitas"))),
                        p.t("warna.garis-opasitas"), p.t("warna.garis-panel"), p.px(p.t("blur.panel")))
        an = self._anim_dasar(e, "pop")
        Lp = Lapisan(e["_id"], tipe, e["mulai"], e["selesai"], cx, cy, panel=pn, ukur_kontras=False, **an)
        self.lapisan.append(Lp)
        self._catat(Lp, e, latar="panel")
        spr = Sprite(isi, dict(info, pad=0))
        L = Lapisan(e["_id"] + "/teks", f"teks-{tipe}", e["mulai"], e["selesai"], cx, cy, sprite=spr,
                    induk=e["_id"], **an)
        self.lapisan.append(L)
        self._catat(L, e)

    def _el_info(self, e):
        """Kartu info kontekstual: ikon + judul + sub, ditaruh dekat bagian yang dibicarakan (x/y)."""
        p = self.p
        if not e.get("judul"):
            raise GagalPipeline(f"{e['_id']}: info butuh 'judul' (opsional: sub, ikon, x, y).")
        u_judul, u_sub = p.px(p.t("ukuran.isi")), p.px(p.t("qa.ukuran-min-px"))
        jarak = p.px(p.t("spasi.jarak-item"))
        zx0, _, zx1, _ = self.zona
        pad = p.px(p.t("spasi.padding-kartu")) * 2 // 3
        lebar = (self._lebar_maks(e) if "lebar" in e else int((zx1 - zx0) * 0.62)) - 2 * pad
        aksen = p.t("warna.aksen")
        bagian = []
        if e.get("ikon"):
            if e["ikon"] not in IKON:
                raise GagalPipeline(f"{e['_id']}: ikon {e['ikon']!r} tidak ada (ada: {', '.join(IKON)}).")
            bagian.append(("ikon", sprite_ikon(e["ikon"], int(u_judul * 1.2), aksen)))
        sj = self.pen.teks(e["judul"], "subjudul", u_judul, lebar, p.t("warna.teks-utama"), aksen=aksen,
                           rata="kiri", bayangan=False, hias=self.hias)
        bagian.append(("judul", sj))
        if e.get("sub"):
            bagian.append(("sub", self.pen.teks(e["sub"], "isi", u_sub, lebar, p.t("warna.teks-sekunder"),
                                                aksen=aksen, rata="kiri", bayangan=False)))
        isi = susun_vertikal([s for _, s in bagian], jarak // 2)
        teks = [s for n, s in bagian if n != "ikon"]
        info = {"ukuran": min(s.info["ukuran"] for s in teks), "baris": sum(s.info["baris"] for s in teks),
                "karakter_baris_maks": max(s.info["karakter_baris_maks"] for s in teks),
                "kata": sum(s.info["kata"] for s in teks), "warna": sorted({c for s in teks for c in s.info["warna"]}),
                "stroke": 0, "warna_stroke": None}
        e["teks"] = " ".join(x for x in (e["judul"], e.get("sub")) if x)
        self._panel_teks(e, isi, info, p.px(p.t("radius.kartu")), pad, pad, "info")

    def _el_latar(self, e):
        """Cutaway: lapisan penuh (warna token, default kaca buram di atas video) agar perangkat besar tampil tanpa
        menutupi wajah. Ditaruh paling awal di beat → tergambar di bawah elemen lain, di atas video."""
        p = self.p
        warna = p.t(f"warna.{e.get('warna', 'latar')}")
        opas = float(e.get("opasitas", p.t("perangkat.latar-opasitas")))
        pn = buat_panel(p, p.W, p.H, 0, warna, opas, 0, "#000000", p.px(float(e.get("blur", p.t("perangkat.latar-blur")))))
        an = self._anim_dasar(e, "fade")
        an.update(masuk=e.get("masuk", "fade"), keluar=e.get("keluar", "fade"))
        L = Lapisan(e["_id"], "latar", e["mulai"], e["selesai"], p.W / 2, p.H / 2, panel=pn, ukur_kontras=False, **an)
        self.lapisan.append(L)
        self.rekam[L.id] = {"id": L.id, "tipe": "latar", "beat": e["_beat"], "mulai": round(L.mulai, 3),
                            "selesai": round(L.selesai, 3), "bbox": None, "bbox_animasi": None, "induk": None, "dekoratif": True,
                            "masuk": L.masuk, "keluar": L.keluar, "efek": e.get("_efek"), "fungsi": e.get("fungsi")}

    def _el_chip(self, e):
        """Pil status: ikon benar/salah/nomor + teks pendek (kuis, label lapisan, langkah)."""
        p = self.p
        if not e.get("teks"):
            raise GagalPipeline(f"{e['_id']}: chip butuh 'teks' (opsional: status benar|salah|nomor|info, nomor).")
        u = p.px(p.t("ukuran.isi"))
        st = self.pen.teks(e["teks"], "subjudul", u, self._lebar_maks(e), p.t("warna.teks-utama"),
                           aksen=p.t("warna.aksen"), bayangan=False, hias=self.hias)
        status = e.get("status", "info")
        if status not in ("benar", "salah", "nomor", "info"):
            raise GagalPipeline(f"{e['_id']}: status {status!r} (benar|salah|nomor|info).")
        bagian = [st]
        if status != "info":
            warna = p.t("warna.peringatan") if status == "salah" else p.t("warna.aksen")
            bagian.insert(0, sprite_status(status, int(u * 1.05), warna, p.t("warna.latar"),
                                           str(e.get("nomor", "")), self.pen.font("subjudul", int(u * 0.62))))
        isi = susun_horizontal(bagian, p.px(p.t("spasi.jarak-item")) // 2)
        info = {k: st.info[k] for k in ("ukuran", "baris", "karakter_baris_maks", "kata", "warna")}
        info.update(stroke=0, warna_stroke=None)
        pad_y = p.px(p.t("spasi.padding-kartu")) // 3
        self._panel_teks(e, isi, info, p.px(p.t("radius.chip")), pad_y * 2, pad_y, "chip")
        self.rekam[e["_id"]]["status"] = status
