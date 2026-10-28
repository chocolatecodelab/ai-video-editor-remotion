"""render_menyatu — bagian Renderer: grafis menyatu dengan rekaman (K10, fungsi murni di menyatu.py).

Sebelum elemen dibangun: arah cahaya rekaman diperkirakan (ber-cache di cache/cahaya.json) → token `bayangan.offset`
diputar searah, sehingga bayangan teks/panel PIL, motif Remotion (boxShadow) dan bayangan efek kamera jatuh ke arah yang
sama; `bayangan.putar` (derajat) diteruskan ke Remotion untuk bayangan yang ditulis di komposisi. Per frame: rekaman &
b-roll di-grade ke palet gaya sebelum dikomposit, grain ditambahkan di komposit akhir (grafis + rekaman).

Beat-sheet (menimpa token `grain` / `grade` / `cahaya`):
    "grain":    {"aktif": false} · {"kekuatan": 2.0, "ukuran": 1.4, "kroma": 0.2}
    "grade":    {"aktif": false} · {"kekuatan": 0.5} · {"suhu": 0.2, "saturasi": 0.9, …}
    "bayangan": {"aktif": false} (offset token apa adanya) · {"sudut": -25} (manual, ° dari bawah, + = ke kanan)
"""
from __future__ import annotations

import math
from pathlib import Path

import cv2
import numpy as np

import menyatu
from sistem import baca_json, log, sha_data, sha_file, tulis_json


class MenyatuMixin:
    # ---------------------------------------------------------- siapkan (sebelum _bangun)
    def _menyatu_siapkan(self) -> None:
        p, bs = self.p, self.bs
        g = {**p.t("grain", {}), **(bs.get("grain") or {})}
        self.grain_cfg = g
        self._grain = g if g.get("aktif", True) and float(g.get("kekuatan", 0)) > 0 else None
        gr = {**p.t("grade", {}), **(bs.get("grade") or {})}
        self.grade_cfg = gr
        self._grade = menyatu.lut_grade(gr, p.t("warna")) if gr.get("aktif", True) else None
        self._bayangan_siapkan({**p.t("cahaya", {}), **(bs.get("bayangan") or {})})

    def _bayangan_siapkan(self, cfg: dict) -> None:
        p = self.p
        tok = p.tokens.setdefault("bayangan", {"offset": [0, 0], "blur": 0})
        awal = [float(v) for v in tok.get("offset", [0, 0])]
        if not cfg.get("aktif", True):
            est = {"sudut": 0.0, "keyakinan": 0.0, "sumber": "dimatikan"}
        elif "sudut" in cfg:
            est = {"sudut": float(cfg["sudut"]), "keyakinan": 1.0, "sumber": "manual"}
        elif self.ada_rekaman:
            est = self._perkiraan_cahaya(cfg)
        else:
            est = {"sudut": 0.0, "keyakinan": 0.0, "sumber": "tanpa rekaman"}
        dipakai = est["sumber"] == "manual" or est["keyakinan"] >= float(cfg.get("keyakinan-min", 0.35))
        delta = float(est["sudut"]) if dipakai else 0.0
        batas = float(cfg.get("sudut-batas", 60))
        baru, efektif = menyatu.putar(awal, delta, batas)
        if math.hypot(*awal) < 0.5:
            efektif = max(-batas, min(batas, delta))  # offset kosong: hanya bayangan tertulis di komposisi yang berputar
        tok["offset"] = baru
        if efektif:
            tok["putar"] = efektif  # Remotion: bayangan tertulis di komposisi diputar sebesar ini (lib/cahaya.ts)
        r = math.radians(efektif)
        self.arah_bayangan = (math.sin(r), math.cos(r))  # vektor satuan bayangan efek kamera (render_kamera)
        self.menyatu_info = {"bayangan": {**est, "dipakai": dipakai, "offset_token": [int(v) for v in awal],
                                          "offset": baru, "putar": efektif}}
        if dipakai and efektif:
            log("menyatu", f"cahaya {est['sumber']} (keyakinan {est['keyakinan']}) → bayangan diputar {efektif:+.0f}°, "
                           f"offset {baru}")

    def _perkiraan_cahaya(self, cfg: dict) -> dict:
        """Asimetri terang wajah di `sampel` frame (cache/wajah.json), cadangan: bingkai. Ber-cache per isi rekaman."""
        p = self.p
        wajah_path = p.cache / "wajah.json"
        pakai = {k: cfg.get(k) for k in ("sampel", "asimetri-penuh", "sudut-maks")}
        kunci = {"ingest": sha_file(p.ingest_video), "wajah": sha_file(wajah_path) if wajah_path.exists() else None,
                 "cfg": sha_data(pakai)}
        cache = p.cache / "cahaya.json"
        if cache.exists() and (d := baca_json(cache, {})).get("kunci") == kunci:
            return d["hasil"]
        n = int(cfg.get("sampel", 16))
        bingkai = [b for b in (self.wajah or []) if b.get("kotak")]
        if bingkai:
            pilih = [bingkai[int(k * (len(bingkai) - 1) / max(1, n - 1))] for k in range(min(n, len(bingkai)))]
            waktu = [(b["t"], b["kotak"]) for b in pilih]
        else:
            waktu = [(self.dur * (k + 0.5) / n, None) for k in range(n)]
        cap = cv2.VideoCapture(str(p.ingest_video))
        asim, sumber = [], "wajah" if bingkai else "bingkai"
        try:
            for t, kotak in waktu:
                cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
                ok, img = cap.read()
                if not ok:
                    continue
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                H, W = gray.shape
                if kotak:
                    a = menyatu.asimetri_wajah(gray, (int(kotak[0] * W), int(kotak[1] * H),
                                                      int(kotak[2] * W), int(kotak[3] * H)))
                else:
                    a = menyatu.asimetri_bingkai(gray)
                if a is not None:
                    asim.append(a)
        finally:
            cap.release()
        hasil = menyatu.perkiraan_cahaya(asim, sumber, cfg)
        tulis_json(cache, {"kunci": kunci, "hasil": hasil})
        return hasil

    # ---------------------------------------------------------- per frame
    def _broll_rekaman(self, t: float) -> bool:
        """B-roll aktif di t adalah footage (bukan klip cutaway Remotion di cache/remotion/, yang sudah berwarna gaya)."""
        rem = self.p.cache / "remotion"
        b = next((b for b in self.broll if b["mulai"] <= t < b["selesai"]), None)
        return b is not None and rem not in Path(b["file"]).resolve().parents

    def _grade_rekaman(self, img: np.ndarray) -> np.ndarray:
        if self._grade is None:
            return img
        return menyatu.terapkan_grade(img, *self._grade)

    def _grain_akhir(self, frame: np.ndarray, i: int) -> np.ndarray:
        return menyatu.grain(frame, i, self._grain) if self._grain else frame

    # ---------------------------------------------------------- layout (proses utama)
    def menyatu_layout(self) -> dict:
        """Catatan K10: setelan grain, grade (+ ΔE terukur di 3 frame rekaman: rata-rata & wajah), arah bayangan."""
        info = dict(self.menyatu_info)
        info["grain"] = {"aktif": self._grain is not None,
                         **{k: self.grain_cfg.get(k) for k in ("kekuatan", "ukuran", "kroma", "midtone")}}
        gr = {"aktif": self._grade is not None,
              "setelan": {k: v for k, v in self.grade_cfg.items() if k != "aktif"}, "ukur": None}
        if self._grade is not None and self.ada_rekaman:
            gr["ukur"] = self._ukur_grade()
        info["grade"] = gr
        return info

    def _ukur_grade(self) -> dict:
        p = self.p
        cap = cv2.VideoCapture(str(p.ingest_video))
        rata, wajah = [], []
        try:
            for q in (0.25, 0.5, 0.75):
                t = self.dur * q
                cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
                ok, img = cap.read()
                if not ok:
                    continue
                rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                de = menyatu.delta_e(rgb, self._grade_rekaman(rgb))
                rata.append(float(de.mean()))
                k = min(self.wajah, key=lambda r: abs(r["t"] - t)) if self.wajah else None
                if k and k.get("kotak") and abs(k["t"] - t) < 0.6:
                    H, W = de.shape
                    x0, y0, x1, y1 = k["kotak"]
                    reg = de[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)]
                    if reg.size:
                        wajah.append(float(reg.mean()))
        finally:
            cap.release()
        return {"de_rata": round(float(np.mean(rata)), 2) if rata else None,
                "de_wajah": round(float(np.mean(wajah)), 2) if wajah else None, "sampel": len(rata)}
