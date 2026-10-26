import React from "react";
import { random, spring } from "remotion";
import { PropsDasar, rgba, skalaPersepsi, warna } from "../lib/kontrak";
import { ElemenUI, Jendela, pakaiDasar } from "../lib/dasar";
import { HiasKata, progresHias } from "../lib/motif";

// E31 judul-gaya: judul/hook dengan efek teks profesional khas gaya (token motif.judul):
//   masuk  — pop (memantul), masker (naik dari balik garis masker), ketik (mesin ketik + kursor), slam (menghentak
//            dari besar), stiker (miring + pop), neon (menyala berkedip), fade
//   hiasan — neon (cahaya aksen), long-shadow (bayangan panjang / stiker 3D), glitch (pisah RGB sesaat), gradien
//            (warna mengalir pada kata *aksen*), none
// Kata *aksen* memakai hiasan kata motif.aksen gaya (kotak highlight, garis tergambar, lingkar, stabilo, …).
// Keterbacaan di atas video: `latar: "panel"` (bingkai gaya) atau `stroke` (outline + bayangan), sama seperti judul PIL.
export type JudulGayaElemen = ElemenUI & {
  teks: string; peran?: "judul" | "subjudul" | "isi"; ukuran?: number; latar?: string; stroke?: boolean;
  masuk_gaya?: string; hiasan?: string;
  jadwal: { huruf: number[]; selesai_masuk: number };
};
export type JudulGayaProps = PropsDasar<JudulGayaElemen>;

type Seg = { t: string; aksen: boolean };
const bagi = (teks: string): Seg[][] =>
  teks.split("\n").map((b) => b.split("*").map((t, i) => ({ t, aksen: i % 2 === 1 })).filter((s) => s.t));

export const JudulGaya: React.FC<JudulGayaProps> = (props) => {
  // masuk dianimasikan di sini (motif.judul.masuk) → <Wadah> hanya menangani keluar, tanpa gerak masuk ganda
  const { f, fps, dtk, px, t, el, w, u, font, naik, motif, Wadah, wadah } = pakaiDasar(props, "atas", { masukSendiri: true });
  const peran = el.peran ?? "judul";
  const ukuran = px(el.ukuran ?? t.ukuran[peran] ?? t.ukuran.judul);
  const mj = ((t.motif as Record<string, unknown>)?.judul ?? {}) as { masuk?: string; hiasan?: string };
  const masuk = el.masuk_gaya ?? mj.masuk ?? "fade";
  const hiasan = el.hiasan ?? mj.hiasan ?? "none";
  const j = el.jadwal;
  const baris = bagi(el.teks);
  const hias = progresHias(dtk, j.selesai_masuk + 0.1);
  const strokeW = el.stroke ? px(Number((t.caption as Record<string, number>)?.stroke ?? 6)) : 0;
  const warnaStroke = warna(t, "stroke");
  const gelap = rgba(w.latar === "#FFFFFF" ? "#000000" : w.latar, 1);

  // ---- efek masuk (berlaku untuk seluruh blok) ----
  const spr = spring({ frame: f, fps, config: { damping: 9, stiffness: 140, mass: 0.6 } });
  let transform = "";
  let opacity = 1;
  let klip: string | undefined;
  if (masuk === "pop") {
    transform = `scale(${skalaPersepsi(spr, 0.4)})`;
    opacity = Math.min(1, spr * 3);
  } else if (masuk === "slam") {
    const q = naik(0, 0.22, "tegas");
    transform = `scale(${skalaPersepsi(q, 1.7)})`;
    opacity = Math.min(1, q * 2.5);
  } else if (masuk === "stiker") {
    transform = `rotate(${-6 + 3 * spr}deg) scale(${skalaPersepsi(spr, 0.5)})`;
    opacity = Math.min(1, spr * 3);
  } else if (masuk === "neon") {
    const kedip = dtk < 0.5 ? (Math.floor(dtk * 20) % 3 === 0 ? 0.25 : 1) : 1;
    opacity = Math.min(1, dtk / 0.15) * kedip;
  } else if (masuk === "fade") {
    opacity = naik(0, el.durasi_masuk);
    transform = `translateY(${(1 - opacity) * px(20)}px)`;
  }

  // mesin ketik: jumlah huruf tampil dari jadwal Python (SFX klik di frame yang sama)
  const nTampil = masuk === "ketik" ? j.huruf.filter((x) => x <= dtk).length : Infinity;
  let sisa = nTampil;

  const bayangan: string[] = [];
  if (hiasan === "neon") bayangan.push(`0 0 ${px(10)}px ${rgba(w.aksen, 0.9)}`, `0 0 ${px(28)}px ${rgba(w.aksen, 0.6)}`);
  if (hiasan === "long-shadow") {
    for (let k = 1; k <= 10; k++) bayangan.push(`${px(k * 1.2)}px ${px(k * 1.2)}px 0 ${rgba(gelap, 0.9)}`);
  }
  if (el.stroke) bayangan.push(`0 ${px(4)}px ${px(10)}px rgba(0,0,0,0.45)`);
  const glitch = hiasan === "glitch" && (dtk < 0.35 || (Math.floor(dtk * 8) % 23 === 0));
  const geser = glitch ? px(4 + 6 * random(`g${Math.floor(dtk * 30)}`)) : 0;
  if (glitch) bayangan.push(`${geser}px 0 0 rgba(255,0,80,0.75)`, `${-geser}px 0 0 rgba(0,220,255,0.75)`);

  const gayaTeks: React.CSSProperties = {
    ...font(peran === "judul" ? "judul" : peran === "subjudul" ? "subjudul" : "isi"), fontSize: ukuran, lineHeight: motif.aksen === "kotak" ? 1.24 : 1.12,
    color: w.utama, textAlign: "center", overflowWrap: "anywhere",
    textShadow: bayangan.join(", ") || undefined,
    WebkitTextStroke: strokeW ? `${strokeW}px ${warnaStroke}` : undefined, paintOrder: strokeW ? "stroke fill" : undefined,
  };

  const isi = (
    <div style={gayaTeks}>
      {baris.map((segs, bi) => {
        // garis masker per baris: teks naik dari balik tepi bawah barisnya, baris berikut menyusul
        const q = masuk === "masker" ? naik(bi * 0.12, el.durasi_masuk + 0.15, "standar") : 1;
        return (
          <div key={bi} style={{ overflow: masuk === "masker" ? "hidden" : undefined, paddingBottom: masuk === "masker" ? px(6) : 0 }}>
            <div style={{ transform: masuk === "masker" ? `translateY(${(1 - q) * 110}%)` : undefined }}>
              {segs.map((s, si) => {
                const k = Math.max(0, Math.min(s.t.length, sisa));
                sisa -= s.t.length;
                const teks = Number.isFinite(nTampil) ? s.t.slice(0, k) : s.t;
                if (!teks) return null;
                if (!s.aksen) return <span key={si}>{teks}</span>;
                if (hiasan === "gradien") {
                  const pos = (dtk * 40) % 200;
                  return (
                    <span key={si} style={{ backgroundImage: `linear-gradient(90deg, ${w.aksen}, ${w.aksen2}, ${w.peringatan}, ${w.aksen})`,
                                            backgroundSize: "200% 100%", backgroundPosition: `${pos}% 0`, WebkitBackgroundClip: "text",
                                            backgroundClip: "text", color: "transparent", WebkitTextStroke: "0px transparent",
                                            filter: el.stroke ? `drop-shadow(0 ${px(3)}px ${px(4)}px rgba(0,0,0,0.6))` : undefined }}>{teks}</span>
                  );
                }
                return <HiasKata key={si} jenis={motif.aksen} p={hias} warnaTeks={w.aksen} seed={`j${bi}${si}`}>{teks}</HiasKata>;
              })}
              {masuk === "ketik" && bi === baris.length - 1 && dtk < j.selesai_masuk + 0.8 ? (
                <span style={{ display: "inline-block", width: px(5), height: ukuran * 0.9, marginLeft: px(4), verticalAlign: "-0.1em",
                               background: w.aksen, opacity: Math.floor(dtk * 2.5) % 2 ? 0.2 : 1 }} />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Wadah wadah={wadah}>
      <div style={{ display: "flex", justifyContent: "center", opacity, transform, transformOrigin: "50% 60%" }}>
        {el.latar === "panel" ? (
          <div style={{ display: "inline-block", maxWidth: "100%" }}>
            <Jendela t={t} px={px} w={w} u={u} polos seed={el.teks} padding={px(t.spasi["padding-kartu"]) * 0.8}>{isi}</Jendela>
          </div>
        ) : isi}
      </div>
    </Wadah>
  );
};
