import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { JenisKeluar, JenisMasuk, PropsDasar, Tokens, kurva, rgba, warna } from "./kontrak";
import { Bingkai, KonteksMotif, MotifKonteks, motifDari } from "./motif";
import { pakaiFontToken } from "./font";

// Bagian bersama perangkat UI (E18–E25, E01–E17 native): waktu, masuk/keluar, warna & ukuran token, wadah di zona aman,
// bingkai sesuai motif gaya (lib/motif.tsx).
export type ElemenUI = { opasitas?: number; judul?: string; geser_y?: number; jadwal: Record<string, unknown> };

/** Transformasi masuk/keluar satu frame — rumus SAMA dengan Animator Python (pipeline/scripts/render_dasar.py), agar
 *  perangkat Remotion masuk/keluar seperti judul/kartu Python di video yang sama (token gerak.masuk-default dll.). */
export const gerakMasukKeluar = (o: {
  dtk: number; durasi: number; masuk: JenisMasuk; keluar: JenisKeluar; dIn: number; dOut: number;
  eIn: (x: number) => number; eOut: (x: number) => number; jarak: number; skalaPop: number;
}) => {
  let op = 1, dx = 0, dy = 0, s = 1;
  if (o.masuk !== "tidak" && o.dIn > 0) {
    const pr = o.dtk / o.dIn;
    if (pr < 1) {
      const e = o.eIn(Math.max(0, pr));
      const p = Math.max(0, pr);
      if (o.masuk === "fade") op *= e;
      else if (o.masuk === "naik") { op *= Math.min(1, p * 2); dy += o.jarak * (1 - e); }
      else if (o.masuk === "turun") { op *= Math.min(1, p * 2); dy -= o.jarak * (1 - e); }
      else if (o.masuk === "geser") { op *= Math.min(1, p * 2); dx += o.jarak * 1.5 * (1 - e); }
      else if (o.masuk === "pop") { op *= Math.min(1, p * 3); s *= o.skalaPop + (1 - o.skalaPop) * e; }
    }
  }
  if (o.keluar !== "tidak" && o.dOut > 0) {
    const pr = (o.dtk - (o.durasi - o.dOut)) / o.dOut;
    if (pr > 0) {
      const e = o.eOut(Math.min(1, pr));
      op *= 1 - e;
      if (o.keluar === "naik") dy -= o.jarak * 0.5 * e;
      else if (o.keluar === "pop") s *= 1 - (1 - o.skalaPop) * 0.5 * e;
    }
  }
  return { op, dx, dy, s };
};

/** Data satu frame untuk <Wadah>/<SediaMotif> (dihitung pakaiDasar). */
export type DataWadah = {
  konteks: KonteksMotif;
  gerak: { op: number; dx: number; dy: number; s: number };
  zona: [number, number, number, number];
  inset: number;
  lebar: number;
  posisi: "atas" | "tengah" | "bawah";
  geserY: number;
};

/** Wadah perangkat di zona aman: gerak masuk/keluar gaya + konteks motif. Komponen tingkat modul (identitas stabil):
 *  React hanya memperbarui atribut tiap frame, tidak membongkar & membangun ulang isi perangkat. */
export const Wadah: React.FC<{ wadah: DataWadah; children: React.ReactNode }> = ({ wadah: d, children }) => {
  const [x0, y0, x1, y1] = d.zona;
  return (
    <MotifKonteks.Provider value={d.konteks}>
      <AbsoluteFill style={{ opacity: d.gerak.op }}>
        <div style={{ position: "absolute", left: x0, top: y0, width: x1 - x0, height: y1 - y0, display: "flex",
                      boxSizing: "border-box", padding: d.inset, flexDirection: "column", alignItems: "center",
                      justifyContent: { atas: "flex-start", tengah: "center", bawah: "flex-end" }[d.posisi] }}>
          <div style={{ width: d.lebar, translate: `${d.gerak.dx}px ${d.gerak.dy + d.geserY}px`, scale: String(d.gerak.s) }}>
            {children}
          </div>
        </div>
      </AbsoluteFill>
    </MotifKonteks.Provider>
  );
};

/** Penyedia konteks motif tanpa wadah zona (komposisi tata letak bebas: cover-story, cutaway). */
export const SediaMotif: React.FC<{ wadah: DataWadah; children: React.ReactNode }> = ({ wadah, children }) => (
  <MotifKonteks.Provider value={wadah.konteks}>{children}</MotifKonteks.Provider>
);

/** `masukSendiri`: komposisi menganimasikan masuknya sendiri (mis. JudulGaya: motif.judul.masuk) → <Wadah> tidak
 *  menambah gerak masuk (hindari animasi ganda); gerak keluar gaya tetap berlaku. */
export const pakaiDasar = <E extends ElemenUI>(props: PropsDasar<E>, posisiDefault = "tengah", opsi: { masukSendiri?: boolean } = {}) => {
  const { fps, durasiFrame, skala, zona, elemen: el } = props;
  const t = pakaiFontToken(props.tokens);
  const f = useCurrentFrame();
  const dtk = f / fps;
  const px = (v: number) => v * skala;
  const ease = kurva(t, el.easing ?? "standar");
  const easeKeluar = kurva(t, el.easing_keluar ?? "keluar");
  // durasi 0 = tanpa animasi masuk/keluar (mis. overlay set studio yang dianimasikan Python); interpolate butuh rentang naik
  const masuk = el.durasi_masuk > 0
    ? interpolate(dtk, [0, el.durasi_masuk], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const keluar = el.durasi_keluar > 0 ? interpolate(f, [durasiFrame - el.durasi_keluar * fps, durasiFrame], [0, 1], {
    easing: easeKeluar, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }) : 0;
  /** progres 0–1 dari detik `a` selama `d` detik (easing token) */
  const naik = (a: number, d: number, nama = "standar") =>
    interpolate(dtk, [a, a + d], [0, 1], { easing: kurva(t, nama), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const qa = t.qa as Record<string, number>;
  const w = {
    aksen: warna(t, "aksen"), aksen2: warna(t, "aksen-2"), utama: warna(t, "teks-utama"), sekunder: warna(t, "teks-sekunder"),
    peringatan: warna(t, "peringatan"), latar: warna(t, "latar"),
    panel: rgba(warna(t, "panel"), Number(el.opasitas ?? t.warna["panel-opasitas"])),
    garis: `${px(2)}px solid ${rgba(warna(t, "garis-panel"), Math.max(0.12, Number(t.warna["garis-opasitas"])))}`,
    bayangan: `${px(t.bayangan.offset[0])}px ${px(t.bayangan.offset[1])}px ${px(t.bayangan.blur)}px ${rgba(warna(t, "bayangan"), Number(t.warna["bayangan-opasitas"]))}`,
  };
  const u = { isi: px(t.ukuran.isi), sub: px(t.ukuran.subjudul), judul: px(t.ukuran.judul), kecil: px(qa["ukuran-min-px"]) };
  const font = (peran: "isi" | "subjudul" | "judul") => ({ fontFamily: t.font[peran].family, fontWeight: t.font[peran].weight });
  const motif = motifDari(t);
  const [x0, , x1] = zona;
  // bingkai yang melampaui kotaknya sendiri (bayangan keras, rotasi, braket sudut) diberi jarak agar tetap di zona aman (K00.1)
  const inset = px(({ brutal: 18, kinetik: 14, kertas: 18, kolase: 22, hud: 12, spidol: 8, pensil: 8 } as Record<string, number>)[motif.bingkai] ?? 0);
  const lebar = (x1 - x0 - 2 * inset) * ((el as { lebar?: number }).lebar ?? 1);
  const jarak = px(Number(t.gerak["jarak-naik"]));
  const posisi = (el.posisi ?? posisiDefault) as "atas" | "tengah" | "bawah";
  const konteks: KonteksMotif = { motif, mulai: el.durasi_masuk + 0.15, aksen: w.aksen, aksen2: w.aksen2, utama: w.utama, latar: w.latar, px };
  const gerak = gerakMasukKeluar({
    dtk, durasi: durasiFrame / fps, dIn: el.durasi_masuk, dOut: el.durasi_keluar, eIn: ease, eOut: easeKeluar, jarak,
    masuk: opsi.masukSendiri ? "tidak" : el.masuk ?? (String(t.gerak["masuk-default"] ?? "naik") as JenisMasuk),
    keluar: el.keluar ?? (String(t.gerak["keluar-default"] ?? "fade") as JenisKeluar),
    skalaPop: Number(t.gerak["skala-pop"] ?? 0.9),
  });
  const wadah: DataWadah = { konteks, gerak, zona, inset, lebar, posisi, geserY: px(Number((el as ElemenUI).geser_y ?? 0)) };
  return { f, dtk, fps, px, t, el, ease, masuk, keluar, naik, w, u, font, lebar, motif, wadah, Wadah, SediaMotif };
};

/** Jendela perangkat (bar judul + isi) — bentuknya mengikuti motif.bingkai gaya. */
export const Jendela: React.FC<{ t: Tokens; px: (v: number) => number; judul?: string; kanan?: React.ReactNode;
                                 w: ReturnType<typeof pakaiDasar>["w"]; u: ReturnType<typeof pakaiDasar>["u"];
                                 polos?: boolean; kecil?: boolean; seed?: string; padding?: number; radius?: number;
                                 children: React.ReactNode }> = (p) => (
  <Bingkai {...p} seed={p.seed ?? p.judul ?? "j"} />
);

/** Palet ubin/blok dari token gaya saja (urutan stabil): aksen, aksen-2, peringatan + versi lembutnya. */
export const palet = (w: ReturnType<typeof pakaiDasar>["w"]) =>
  [w.aksen, w.aksen2, w.peringatan, rgba(w.aksen, 0.55), rgba(w.aksen2, 0.55)];
