import React, { createContext, useContext, useId } from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { Tokens, rgba, warna, skalaPersepsi } from "./kontrak";

// Motif gaya (token `motif`): bingkai perangkat, hiasan kata *kunci*, tekstur, garis bergetar (boil).
// Satu tempat untuk "rasa" gaya → semua perangkat (E18–E25, E01–E17 native) otomatis mengikuti gaya proyek.
export type Motif = {
  bingkai: string; aksen: string; tekstur: string | null; transisi: string; reveal: string; boil: number;
};

export const motifDari = (t: Tokens): Motif => ({
  bingkai: "kaca", aksen: "garis", tekstur: null, transisi: "blur-zoom", reveal: "partikel", boil: 0,
  ...((t.motif as Partial<Motif>) ?? {}),
});

/** Konteks untuk <Teks>/<Aksen>: hiasan kata kunci tergambar mulai detik `mulai` (setelah elemen masuk). */
export type KonteksMotif = { motif: Motif; mulai: number; aksen: string; aksen2: string; utama: string; latar: string; px: (v: number) => number };
export const MotifKonteks = createContext<KonteksMotif | null>(null);

const terang = (hex: string) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5;
};

/** Lapisan tekstur penuh (motif.tekstur) — noise SVG feTurbulence: titik gelap di panel terang, titik terang di panel
 *  gelap; ubin 240 px. SVG inline (bukan background-image url(), yang tidak ditunggu Remotion → frame awal bisa tanpa
 *  tekstur). Ikut radius induk (borderRadius: inherit). */
export const LapisTekstur: React.FC<{ jenis: string | null; panelHex: string }> = ({ jenis, panelHex }) => {
  const id = `tekstur${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  if (!jenis) return null;
  const wadah: React.CSSProperties = { position: "absolute", inset: 0, borderRadius: "inherit", overflow: "hidden", pointerEvents: "none" };
  if (jenis === "scanline") {
    return <div style={{ ...wadah, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 5px)" }} />;
  }
  const [freq, op] = jenis === "kertas" ? [0.85, 0.16] : [1.6, 0.2];
  const c = terang(panelHex) ? 0 : 1;
  return (
    <div style={wadah}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id={`${id}f`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={3} stitchTiles="stitch" />
            <feColorMatrix values={`0 0 0 0 ${c} 0 0 0 0 ${c} 0 0 0 0 ${c} ${op} 0 0 0 0`} />
          </filter>
          <pattern id={`${id}p`} width={240} height={240} patternUnits="userSpaceOnUse">
            <rect width={240} height={240} filter={`url(#${id}f)`} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id}p)`} />
      </svg>
    </div>
  );
};

/** Indeks getar: berubah tiap 1/boil detik (0 = diam). */
export const pakaiBoil = (boil: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return boil > 0 ? Math.floor(f / Math.max(1, fps / boil)) : 0;
};

/** Persegi goyah (viewBox 0–100, dipakai dengan preserveAspectRatio="none" + vectorEffect non-scaling-stroke). */
export const persegiGoyah = (seed: string, amp = 0.7, n = 9) => {
  const sisi: [number, number, number, number][] = [[2, 2, 98, 2], [98, 2, 98, 98], [98, 98, 2, 98], [2, 98, 2, 2]];
  const titik: [number, number][] = [];
  sisi.forEach(([x0, y0, x1, y1], s) => {
    for (let i = 0; i < n; i++) {
      const q = i / n;
      titik.push([x0 + (x1 - x0) * q + (random(`${seed}x${s}.${i}`) - 0.5) * amp * 2,
                  y0 + (y1 - y0) * q + (random(`${seed}y${s}.${i}`) - 0.5) * amp * 2]);
    }
  });
  return kurvaTutup(titik);
};

/** Elips goyah sedikit tak tertutup (seperti dilingkari spidol), viewBox 0–100. */
export const elipsGoyah = (seed: string, amp = 2.2, n = 14) => {
  const titik: [number, number][] = [];
  for (let i = 0; i <= n + 2; i++) {
    const a = -Math.PI * 0.85 + (i / n) * Math.PI * 2;
    const r = 1 + (random(`${seed}r${i}`) - 0.5) * amp * 0.04;
    titik.push([50 + 48 * r * Math.cos(a), 50 + 46 * r * Math.sin(a) + (random(`${seed}y${i}`) - 0.5) * amp]);
  }
  return kurvaBuka(titik);
};

/** Garis goyah horizontal (viewBox 0–100 × 0–10). */
export const garisGoyah = (seed: string, amp = 1.6, n = 8) => {
  const titik: [number, number][] = Array.from({ length: n + 1 }, (_, i) =>
    [i * (100 / n), 5 + (random(`${seed}g${i}`) - 0.5) * amp * 2] as [number, number]);
  return kurvaBuka(titik);
};

/** Skala path viewBox 0–100 ke piksel (w×h). Garis yang dianimasikan dengan dash (pathLength) WAJIB memakai ini
 *  — vectorEffect non-scaling-stroke merusak dash di Chrome (garis tampil putus-putus). */
export const kePx = (d: string, w: number, h: number) => {
  let i = 0;
  return d.replace(/-?\d+(\.\d+)?/g, (n) => (i++ % 2 === 0 ? (parseFloat(n) * w / 100) : (parseFloat(n) * h / 100)).toFixed(1));
};

const tengah = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const kurvaTutup = (p: [number, number][]) => {
  const m0 = tengah(p[p.length - 1], p[0]);
  let d = `M${m0[0].toFixed(2)} ${m0[1].toFixed(2)}`;
  p.forEach((q, i) => {
    const m = tengah(q, p[(i + 1) % p.length]);
    d += ` Q${q[0].toFixed(2)} ${q[1].toFixed(2)} ${m[0].toFixed(2)} ${m[1].toFixed(2)}`;
  });
  return d + " Z";
};
const kurvaBuka = (p: [number, number][]) => {
  let d = `M${p[0][0].toFixed(2)} ${p[0][1].toFixed(2)}`;
  for (let i = 1; i < p.length - 1; i++) {
    const m = tengah(p[i], p[i + 1]);
    d += ` Q${p[i][0].toFixed(2)} ${p[i][1].toFixed(2)} ${m[0].toFixed(2)} ${m[1].toFixed(2)}`;
  }
  const z = p[p.length - 1];
  return d + ` L${z[0].toFixed(2)} ${z[1].toFixed(2)}`;
};

/** Tepi sobek (clip-path polygon) untuk kolase. */
const tepiSobek = (seed: string) => {
  const t: string[] = [];
  const n = 18;
  for (let i = 0; i <= n; i++) t.push(`${(i / n) * 100}% ${random(`${seed}a${i}`) * 1.6}%`);
  for (let i = 1; i <= 6; i++) t.push(`${100 - random(`${seed}b${i}`) * 1.2}% ${(i / 6) * 100}%`);
  for (let i = n; i >= 0; i--) t.push(`${(i / n) * 100}% ${100 - random(`${seed}c${i}`) * 1.8}%`);
  for (let i = 5; i >= 1; i--) t.push(`${random(`${seed}d${i}`) * 1.2}% ${(i / 6) * 100}%`);
  return `polygon(${t.join(", ")})`;
};

const MONO = "Consolas, 'Cascadia Mono', monospace";

type BingkaiProps = {
  t: Tokens; px: (v: number) => number;
  w: { aksen: string; aksen2: string; utama: string; sekunder: string; latar: string; panel: string; garis: string; bayangan: string };
  u: { isi: number; sub: number; judul: number; kecil: number };
  judul?: string; kanan?: React.ReactNode; polos?: boolean; kecil?: boolean; seed?: string; padding?: number; radius?: number;
  children: React.ReactNode;
};

/** Bingkai perangkat sesuai motif gaya. `polos` = tanpa bar judul (kartu, kotak prompt, pil). */
export const Bingkai: React.FC<BingkaiProps> = ({ t, px, w, u, judul, kanan, polos, kecil, seed = "b", padding, radius, children }) => {
  const m = motifDari(t);
  const dtk = useCurrentFrame() / useVideoConfig().fps;
  const getar = pakaiBoil(m.boil);
  const r = radius ?? px(t.radius.kartu);
  const pad = padding ?? px(t.spasi["padding-kartu"]) * 0.7;
  const garisPanel = warna(t, "garis-panel");
  const lapisTekstur = <LapisTekstur jenis={m.tekstur} panelHex={warna(t, "panel")} />;
  const label = (gaya: React.CSSProperties = {}) => (judul ? (
    <div style={{ fontFamily: t.font.isi.family, fontWeight: t.font.isi.weight, fontSize: u.kecil, color: w.sekunder,
                  whiteSpace: "nowrap", ...gaya }}>{judul}</div>
  ) : null);
  const isi = <div style={{ position: "relative", padding: pad }}>{children}</div>;
  const dasar: React.CSSProperties = { position: "relative", boxSizing: "border-box", width: "100%", background: w.panel };

  switch (m.bingkai) {
    case "jendela":
      return (
        <div style={{ ...dasar, borderRadius: r, border: w.garis, boxShadow: w.bayangan, overflow: "hidden" }}>
          {lapisTekstur}
          {polos ? null : (
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: px(10), padding: `${px(14)}px ${px(22)}px`,
                          borderBottom: `${px(1.5)}px solid ${rgba(w.utama, 0.08)}` }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                <div key={c} style={{ width: px(14), height: px(14), borderRadius: px(14), background: c, opacity: 0.85 }} />
              ))}
              {label({ marginLeft: px(10) })}
              <div style={{ flex: 1 }} />
              {kanan}
            </div>
          )}
          {isi}
        </div>
      );
    case "kinetik":
      return (
        <div style={{ ...dasar, borderRadius: px(8), border: `${px(3)}px solid ${w.utama}`, boxShadow: w.bayangan,
                      overflow: "hidden", transform: `rotate(${polos ? -0.6 : -1.1}deg)` }}>
          {lapisTekstur}
          {polos ? null : (
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: px(14), padding: `${px(10)}px ${px(22)}px`,
                          background: w.aksen }}>
              {label({ color: w.latar, fontFamily: t.font.judul.family, fontWeight: t.font.judul.weight,
                       textTransform: "uppercase", letterSpacing: px(1.5) })}
              <div style={{ flex: 1 }} />
              {kanan}
              <div style={{ width: px(40), height: px(10), background: w.latar, transform: "skewX(-20deg)" }} />
            </div>
          )}
          {isi}
        </div>
      );
    case "hud": {
      const c = px(24);
      const sudut = (gaya: React.CSSProperties) => (
        <div style={{ position: "absolute", width: px(30), height: px(30), borderColor: w.aksen, borderStyle: "solid",
                      borderWidth: 0, ...gaya }} />
      );
      const pindai = ((dtk % 3.2) / 3.2) * 130 - 15;
      return (
        <div style={{ position: "relative", width: "100%" }}>
          <div style={{ ...dasar, clipPath: `polygon(${c}px 0, 100% 0, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, 0 100%, 0 ${c}px)`,
                        boxShadow: `inset 0 0 0 ${px(1.5)}px ${rgba(w.aksen, 0.45)}`,
                        backgroundImage: `repeating-linear-gradient(0deg, ${rgba(w.aksen, 0.05)} 0 ${px(2)}px, transparent ${px(2)}px ${px(6)}px)` }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: `${pindai}%`, height: px(60), pointerEvents: "none",
                          background: `linear-gradient(180deg, transparent, ${rgba(w.aksen, 0.12)}, transparent)` }} />
            {polos ? null : (
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: px(12), padding: `${px(12)}px ${px(26)}px`,
                            borderBottom: `${px(1.5)}px solid ${rgba(w.aksen, 0.35)}` }}>
                <div style={{ color: w.aksen, fontFamily: MONO, fontSize: u.kecil * 0.9, fontWeight: 700 }}>▸</div>
                {label({ fontFamily: MONO, fontWeight: 700, color: w.aksen, textTransform: "uppercase", letterSpacing: px(2) })}
                <div style={{ flex: 1 }} />
                {kanan}
                <div style={{ fontFamily: MONO, fontSize: u.kecil * 0.75, color: w.sekunder, letterSpacing: px(1) }}>
                  {`ID-${String(Math.floor(random(seed) * 90) + 10)}`}
                </div>
                <div style={{ width: px(12), height: px(12), background: w.aksen, opacity: Math.floor(dtk * 2.5) % 2 ? 1 : 0.25 }} />
              </div>
            )}
            {isi}
          </div>
          {sudut({ left: -px(8), top: -px(8), borderLeftWidth: px(3), borderTopWidth: px(3) })}
          {sudut({ right: -px(8), top: -px(8), borderRightWidth: px(3), borderTopWidth: px(3) })}
          {sudut({ left: -px(8), bottom: -px(8), borderLeftWidth: px(3), borderBottomWidth: px(3) })}
          {sudut({ right: -px(8), bottom: -px(8), borderRightWidth: px(3), borderBottomWidth: px(3) })}
        </div>
      );
    }
    case "kertas": {
      const lipat = kecil ? 0 : px(44);
      const miring = (random(`${seed}m`) - 0.5) * 2.2;
      return (
        <div style={{ position: "relative", width: "100%", transform: `rotate(${miring}deg)`,
                      filter: `drop-shadow(0 ${px(12)}px ${px(16)}px rgba(0,0,0,0.22))` }}>
          <div style={{ ...dasar, borderRadius: px(10),
                        clipPath: `polygon(0 0, calc(100% - ${lipat}px) 0, 100% ${lipat}px, 100% 100%, 0 100%)` }}>
            {lapisTekstur}
            {polos ? null : (
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: px(12), padding: `${px(16)}px ${px(26)}px 0` }}>
                <div style={{ width: px(14), height: px(14), borderRadius: px(14), background: w.aksen }} />
                {label({ fontFamily: t.font.subjudul.family, fontWeight: t.font.subjudul.weight })}
                <div style={{ flex: 1 }} />
                {kanan}
              </div>
            )}
            {isi}
          </div>
          <div style={{ position: "absolute", right: 0, top: 0, width: lipat, height: lipat, borderBottomLeftRadius: px(8),
                        background: `linear-gradient(225deg, transparent 50%, ${rgba(w.utama, 0.16)} 50%)` }} />
        </div>
      );
    }
    case "minimal":
      return (
        <div style={{ ...dasar, borderRadius: px(6) }}>
          {lapisTekstur}
          {polos ? null : (
            <div style={{ position: "relative", padding: `${px(18)}px ${px(26)}px 0` }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {label({ textTransform: "uppercase", letterSpacing: px(4), fontSize: u.kecil * 0.85 })}
                <div style={{ flex: 1 }} />
                {kanan}
              </div>
              <div style={{ marginTop: px(12), height: px(1.5), background: rgba(w.utama, 0.12), position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: px(48), background: w.aksen }} />
              </div>
            </div>
          )}
          {isi}
        </div>
      );
    case "brutal":
      return (
        <div style={{ ...dasar, borderRadius: 0, border: `${px(5)}px solid ${garisPanel}`,
                      boxShadow: `${px(12)}px ${px(12)}px 0 ${garisPanel}` }}>
          {lapisTekstur}
          {polos ? null : (
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: px(12), padding: `${px(10)}px ${px(20)}px`,
                          background: w.aksen, borderBottom: `${px(5)}px solid ${garisPanel}` }}>
              {label({ fontFamily: MONO, fontWeight: 700, color: garisPanel, textTransform: "uppercase", letterSpacing: px(1) })}
              <div style={{ flex: 1 }} />
              {kanan}
              <div style={{ width: px(70), height: px(18), border: `${px(3)}px solid ${garisPanel}`,
                            backgroundImage: `repeating-linear-gradient(45deg, ${garisPanel} 0 ${px(4)}px, transparent ${px(4)}px ${px(10)}px)` }} />
            </div>
          )}
          {isi}
        </div>
      );
    case "editorial":
      return (
        <div style={{ ...dasar, borderRadius: 0, borderTop: `${px(5)}px solid ${w.utama}`, borderBottom: `${px(1.5)}px solid ${w.utama}`,
                      boxShadow: w.bayangan }}>
          {lapisTekstur}
          {polos ? null : (
            <div style={{ position: "relative", display: "flex", alignItems: "baseline", gap: px(14), padding: `${px(16)}px ${px(26)}px ${px(10)}px`,
                          borderBottom: `${px(1)}px solid ${rgba(w.utama, 0.35)}` }}>
              {label({ fontFamily: t.font.subjudul.family, fontWeight: t.font.subjudul.weight, color: w.utama,
                       textTransform: "uppercase", letterSpacing: px(5), fontSize: u.kecil * 0.85 })}
              <div style={{ flex: 1 }} />
              {kanan ?? <div style={{ fontFamily: t.font.subjudul.family, fontStyle: "italic", fontSize: u.kecil * 0.85,
                                       color: w.aksen }}>{`No. ${String(Math.floor(random(seed) * 40) + 1).padStart(2, "0")}`}</div>}
            </div>
          )}
          {isi}
        </div>
      );
    case "kolase": {
      const miring = (random(`${seed}m`) - 0.5) * 4;
      const selotip = (kiri: boolean) => (
        <div style={{ position: "absolute", top: -px(16), [kiri ? "left" : "right"]: px(24), width: px(120), height: px(38),
                      background: rgba(w.aksen2, 0.55), transform: `rotate(${kiri ? -8 : 7}deg)`,
                      boxShadow: `0 ${px(2)}px ${px(4)}px rgba(0,0,0,0.15)`,
                      clipPath: "polygon(3% 0, 97% 4%, 100% 50%, 96% 100%, 2% 96%, 0 50%)" }} />
      );
      return (
        <div style={{ position: "relative", width: "100%", transform: `rotate(${miring}deg)`,
                      filter: `drop-shadow(${px(6)}px ${px(10)}px ${px(8)}px rgba(0,0,0,0.25))` }}>
          <div style={{ ...dasar, clipPath: kecil ? undefined : tepiSobek(seed) }}>
            {lapisTekstur}
            {polos ? null : (
              <div style={{ position: "relative", padding: `${px(22)}px ${px(26)}px 0`, display: "flex", alignItems: "center" }}>
                <div style={{ padding: `${px(4)}px ${px(14)}px`, background: w.utama, transform: "rotate(-1.5deg)" }}>
                  {label({ color: w.latar, fontFamily: t.font.judul.family, fontWeight: t.font.judul.weight, textTransform: "uppercase" })}
                </div>
                <div style={{ flex: 1 }} />
                {kanan}
              </div>
            )}
            {isi}
          </div>
          {kecil ? null : selotip(true)}
          {kecil ? null : selotip(false)}
        </div>
      );
    }
    case "spidol":
    case "pensil": {
      const spidol = m.bingkai === "spidol";
      const garis = (s: string, tebal: number, op: number) => (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: -px(3), width: `calc(100% + ${px(6)}px)`,
                                                                        height: `calc(100% + ${px(6)}px)`, overflow: "visible", pointerEvents: "none" }}>
          <path d={persegiGoyah(`${seed}${s}${getar}`, spidol ? 0.9 : 0.6)} fill="none" stroke={rgba(w.utama, op)} strokeWidth={tebal}
                vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      );
      return (
        <div style={{ ...dasar, borderRadius: r }}>
          {lapisTekstur}
          {spidol ? garis("a", px(4.5), 1) : <>{garis("a", px(1.8), 0.85)}{garis("b", px(1.2), 0.55)}</>}
          {spidol ? null : (
            <div style={{ position: "absolute", right: px(14), bottom: px(14), width: px(70), height: px(40), pointerEvents: "none",
                          backgroundImage: `repeating-linear-gradient(-50deg, ${rgba(w.utama, 0.35)} 0 ${px(1.4)}px, transparent ${px(1.4)}px ${px(9)}px)` }} />
          )}
          {polos ? null : (
            <div style={{ position: "relative", padding: `${px(18)}px ${px(26)}px 0`, display: "flex", alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                {label({ fontFamily: t.font.subjudul.family, fontWeight: t.font.subjudul.weight, color: w.utama, fontSize: u.kecil * 1.1 })}
                <svg viewBox="0 0 100 10" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: -px(8),
                                                                              width: "100%", height: px(10), overflow: "visible" }}>
                  <path d={garisGoyah(`${seed}u${getar}`)} fill="none" stroke={w.aksen} strokeWidth={px(spidol ? 4 : 2)}
                        vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ flex: 1 }} />
              {kanan}
            </div>
          )}
          {isi}
        </div>
      );
    }
    default: // kaca
      return (
        <div style={{ ...dasar, borderRadius: r, border: w.garis, boxShadow: w.bayangan, overflow: "hidden",
                      backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 40%)` }}>
          {lapisTekstur}
          {polos ? null : (
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: px(12), padding: `${px(14)}px ${px(24)}px` }}>
              <div style={{ width: px(10), height: px(10), borderRadius: px(10), background: w.aksen,
                            boxShadow: `0 0 ${px(12)}px ${w.aksen}` }} />
              {label({ fontFamily: MONO, letterSpacing: px(1) })}
              <div style={{ flex: 1 }} />
              {kanan}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: px(1.5),
                            background: `linear-gradient(90deg, ${rgba(w.aksen, 0.8)}, ${rgba(w.aksen, 0)} 70%)` }} />
            </div>
          )}
          {isi}
        </div>
      );
  }
};

/** Hiasan satu kata kunci sesuai motif.aksen; `p` 0–1 = progres tergambar. */
export const HiasKata: React.FC<{ jenis: string; p: number; warnaTeks: string; children: React.ReactNode; seed?: string }> = ({
  jenis, p, warnaTeks, children, seed = "k",
}) => {
  const k = useContext(MotifKonteks);
  const getar = pakaiBoil(k?.motif.boil ?? 0);
  if (!k || p <= 0) return <span style={{ color: warnaTeks }}>{children}</span>;
  const { aksen2, px } = k;
  const dasar: React.CSSProperties = { position: "relative", color: warnaTeks, whiteSpace: "nowrap" };
  switch (jenis) {
    case "kilau": {
      const pos = 130 - 160 * Math.min(1, p * 1.4);
      return (
        <span style={{ ...dasar, backgroundImage: `linear-gradient(100deg, ${warnaTeks} 0%, ${warnaTeks} 40%, #FFFFFF 50%, ${warnaTeks} 60%, ${warnaTeks} 100%)`,
                       backgroundSize: "250% 100%", backgroundPosition: `${pos}% 0`, WebkitBackgroundClip: "text", backgroundClip: "text",
                       color: "transparent" }}>{children}</span>
      );
    }
    case "kotak": { // kotak highlight: blok aksen di belakang kata, huruf berwarna latar (kontras terjamin token)
      return (
        <span style={{ ...dasar, color: k.latar,
                       backgroundImage: `linear-gradient(${warnaTeks}, ${warnaTeks})`, backgroundRepeat: "no-repeat",
                       backgroundSize: `${p * 100}% 100%`, padding: `0 ${px(8)}px`, margin: `0 ${px(2)}px`,
                       WebkitTextStroke: "0px transparent", textShadow: "none", boxDecorationBreak: "clone" }}>{children}</span>
      );
    }
    case "stabilo":
      return (
        <span style={{ ...dasar, backgroundImage: `linear-gradient(${rgba(aksen2, 0.42)}, ${rgba(aksen2, 0.42)})`,
                       backgroundRepeat: "no-repeat", backgroundPosition: "0 78%", backgroundSize: `${p * 100}% 42%`,
                       padding: `0 ${px(4)}px`, margin: `0 -${px(4)}px` }}>{children}</span>
      );
    case "garis":
      return (
        <span style={{ ...dasar, backgroundImage: `linear-gradient(${warnaTeks}, ${warnaTeks})`, backgroundRepeat: "no-repeat",
                       backgroundPosition: "0 96%", backgroundSize: `${p * 100}% ${px(5)}px`, paddingBottom: px(4) }}>{children}</span>
      );
    case "arsir":
      return (
        <span style={dasar}>
          {children}
          <span style={{ position: "absolute", left: 0, bottom: -px(6), height: px(12), width: `${p * 100}%`,
                         backgroundImage: `repeating-linear-gradient(-55deg, ${warnaTeks} 0 ${px(1.6)}px, transparent ${px(1.6)}px ${px(7)}px)` }} />
        </span>
      );
    case "selotip":
      return (
        <span style={{ ...dasar, isolation: "isolate" }}>
          <span style={{ position: "absolute", left: -px(10), right: -px(10), top: "8%", bottom: "4%", zIndex: -1,
                         background: rgba(aksen2, 0.5), transform: `rotate(-2deg) scaleX(${p})`, transformOrigin: "0 50%",
                         clipPath: "polygon(2% 0, 98% 6%, 100% 50%, 97% 100%, 1% 94%, 0 50%)" }} />
          {children}
        </span>
      );
    case "target": {
      const s = skalaPersepsi(Math.min(1, p), 1.5);
      const L = (g: React.CSSProperties) => (
        <span style={{ position: "absolute", width: px(16), height: px(16), borderColor: warnaTeks, borderStyle: "solid", borderWidth: 0,
                       opacity: Math.min(1, p * 2), ...g }} />
      );
      return (
        <span style={dasar}>
          <span style={{ position: "absolute", inset: `-${px(6)}px -${px(10)}px`, transform: `scale(${s})` }}>
            {L({ left: 0, top: 0, borderLeftWidth: px(3), borderTopWidth: px(3) })}
            {L({ right: 0, top: 0, borderRightWidth: px(3), borderTopWidth: px(3) })}
            {L({ left: 0, bottom: 0, borderLeftWidth: px(3), borderBottomWidth: px(3) })}
            {L({ right: 0, bottom: 0, borderRightWidth: px(3), borderBottomWidth: px(3) })}
          </span>
          {children}
        </span>
      );
    }
    case "lingkar":
      return (
        <span style={dasar}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", left: "-14%", top: "-30%", width: "128%",
                                                                         height: "160%", overflow: "visible", transform: `scale(${skalaPersepsi(p, 0.85)})` }}>
            <path d={elipsGoyah(`${seed}${getar}`)} fill="none" stroke={warnaTeks} strokeWidth={px(4)} vectorEffect="non-scaling-stroke"
                  strokeLinecap="round" opacity={Math.min(1, p * 1.6)} />
          </svg>
          {children}
        </span>
      );
    default:
      return <span style={{ color: warnaTeks }}>{children}</span>;
  }
};

/** Progres hiasan kata (0–1) tanpa konteks (dipakai di badan komposisi, di luar <Wadah>): mulai detik `mulai`. */
export const progresHias = (dtk: number, mulai: number) => {
  const x = (dtk - mulai) / 0.45;
  return Math.max(0, Math.min(1, 1 - (1 - Math.min(1, Math.max(0, x))) ** 3));
};

/** Progres hiasan kata (0–1) dari konteks: tergambar 0,45 s mulai `mulai` (+ tunda). Hanya di DALAM <Wadah>/<SediaMotif>. */
export const pakaiProgresHias = (tunda = 0) => {
  const k = useContext(MotifKonteks);
  const dtk = useCurrentFrame() / useVideoConfig().fps;
  if (!k) return 0;
  const x = (dtk - k.mulai - tunda) / 0.45;
  return Math.max(0, Math.min(1, 1 - (1 - x) ** 3));
};
