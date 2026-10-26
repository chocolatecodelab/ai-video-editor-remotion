import React from "react";
import { AbsoluteFill, interpolate, random, spring } from "remotion";
import { PropsDasar, kurva, rgba, skalaPersepsi, warna } from "../lib/kontrak";
import { ElemenUI, Jendela, pakaiDasar } from "../lib/dasar";
import { LatarGaya } from "../lib/latar";
import { Teks } from "../lib/Teks";

// Efek tambahan (permintaan pengguna 2026-10-26): E37 liquid-glass, E41 headline-storm, E43 growth-curve,
// E44 StudioSet (set untuk efek kamera studio-reveal). Warna, font & bingkai dari token gaya.

// ------------------------------------------------------------------ E37 liquid-glass
// Panel kaca cair: isi sangat tipis (alpha rendah → render.py membiaskan video di baliknya, render_pip._lensa),
// tepi berkilau (sorot dalam atas, pantulan bawah), kilau spekular melintas; masuk dengan "morf" pil → kartu (spring).
export type LiquidGlassElemen = ElemenUI & { judul: string; sub?: string; bentuk?: "pil" | "kartu"; jadwal: { morf: number } };
export const LiquidGlass: React.FC<PropsDasar<LiquidGlassElemen>> = (props) => {
  // masuk dianimasikan sendiri (morf spring) → <Wadah> tidak menambah gerak masuk
  const { f, fps, dtk, px, t, el, w, u, font, Wadah, wadah } = pakaiDasar(props, "atas", { masukSendiri: true });
  const sp = spring({ frame: f - Math.round(el.jadwal.morf * fps), fps, config: { damping: 11, stiffness: 120, mass: 0.7 } });
  const pil = (el.bentuk ?? (el.sub ? "kartu" : "pil")) === "pil";
  const isi = rgba(warna(t, "panel"), Number(el.opasitas ?? 0.24));
  // kilau spekular melintas SEKALI setelah morf mendarat (kilau berulang terus = kesan murahan)
  const kilau = interpolate(dtk, [el.jadwal.morf + 0.35, el.jadwal.morf + 1.25], [0, 1.6], {
    easing: kurva(t, "standar"), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const radius = pil ? px(999) : px(Math.max(36, Number(t.radius.kartu) * 1.4));
  return (
    <Wadah wadah={wadah}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", display: "inline-block", maxWidth: "100%", borderRadius: radius, overflow: "hidden",
                      background: isi, transform: `scale(${skalaPersepsi(sp, 0.6)}, ${skalaPersepsi(sp, 0.85)})`, opacity: Math.min(1, sp * 2),
                      boxShadow: [`inset 0 ${px(2)}px 0 rgba(255,255,255,0.75)`, `inset 0 -${px(1.5)}px 0 rgba(255,255,255,0.25)`,
                                  `inset ${px(1.5)}px 0 0 rgba(255,255,255,0.35)`, `inset -${px(1.5)}px 0 0 rgba(255,255,255,0.2)`,
                                  `inset 0 0 ${px(26)}px rgba(255,255,255,0.14)`, `0 ${px(18)}px ${px(40)}px rgba(0,0,0,0.25)`].join(", ") }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: radius, pointerEvents: "none",
                        background: "radial-gradient(120% 70% at 20% 0%, rgba(255,255,255,0.32), rgba(255,255,255,0) 55%)" }} />
          <div style={{ position: "absolute", top: "-30%", bottom: "-30%", width: "22%", left: `${-30 + kilau * 100}%`, transform: "rotate(18deg)",
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)", pointerEvents: "none" }} />
          <div style={{ position: "relative", padding: pil ? `${px(18)}px ${px(44)}px` : `${px(30)}px ${px(40)}px`, textAlign: pil ? "center" : "left" }}>
            <div style={{ ...font("subjudul"), fontSize: pil ? u.isi * 1.05 : u.sub, lineHeight: 1.08, color: w.utama,
                          textShadow: `0 ${px(2)}px ${px(10)}px rgba(0,0,0,0.35)` }}>
              <Teks teks={el.judul} aksen={w.aksen} />
            </div>
            {el.sub ? <div style={{ ...font("isi"), fontSize: u.kecil, color: w.utama, opacity: 0.85, marginTop: px(10),
                                    textShadow: `0 ${px(1)}px ${px(6)}px rgba(0,0,0,0.35)` }}>{el.sub}</div> : null}
          </div>
        </div>
      </div>
    </Wadah>
  );
};

// ------------------------------------------------------------------ E41 headline-storm (cutaway)
// Badai judul berita: puluhan potongan judul melesat dari segala arah (rotasi, blur gerak), layar bergetar, lalu
// semuanya meredup & satu judul utama menghentak di tengah.
export type HeadlineStormElemen = ElemenUI & { judul_judul: string[]; utama: string; jadwal: { potongan: number[]; utama: number } };
export const HeadlineStorm: React.FC<PropsDasar<HeadlineStormElemen>> = (props) => {
  const { f, fps, dtk, px, t, el, w, u, font, naik, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H } = props;
  const j = el.jadwal;
  const pu = naik(j.utama, 0.3, "tegas");
  const getar = dtk < j.utama + 0.25 ? Math.sin(f * 1.7) * px(6) * Math.min(1, dtk / 0.4) * (1 - pu) : 0;
  const sumber = ["BERITA", "TERKINI", "VIRAL", "TRENDING", "UPDATE", "EKSKLUSIF"];
  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <LatarGaya t={t} dtk={dtk} W={W} H={H} />
        <AbsoluteFill style={{ transform: `translate(${getar}px, ${-getar * 0.6}px)`, filter: `blur(${pu * px(5)}px)`, opacity: 1 - 0.55 * pu }}>
          {j.potongan.map((a, i) => {
            const teks = el.judul_judul[i % el.judul_judul.length];
            const sudut = random(`a${i}`) * Math.PI * 2;
            const jauh = Math.max(W, H) * 0.9;
            const tx = W * (0.12 + 0.76 * random(`x${i}`));
            const ty = H * (0.14 + 0.72 * random(`y${i}`));
            const sp = spring({ frame: f - Math.round(a * fps), fps, config: { damping: 14, stiffness: 160, mass: 0.6 } });
            const x = tx + Math.cos(sudut) * jauh * (1 - sp);
            const y = ty + Math.sin(sudut) * jauh * (1 - sp);
            const rot = (random(`r${i}`) - 0.5) * 24 * (1.4 - 0.4 * sp);
            const cepat = Math.abs(1 - sp) > 0.08;
            return (
              <div key={i} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                                    width: W * 0.52, opacity: dtk < a ? 0 : 1, filter: cepat ? `blur(${px(3)}px)` : undefined }}>
                <Jendela t={t} px={px} w={w} u={u} polos kecil seed={`hs${i}`} padding={px(16)}>
                  <div style={{ ...font("isi"), fontSize: u.kecil * 0.8, color: w.aksen, letterSpacing: px(1) }}>{sumber[i % sumber.length]}</div>
                  <div style={{ ...font("subjudul"), fontSize: u.kecil * 1.05, lineHeight: 1.1, color: w.utama }}>
                    <Teks teks={teks} aksen={w.aksen} hias={false} />
                  </div>
                </Jendela>
              </div>
            );
          })}
        </AbsoluteFill>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: `0 ${W * 0.08}px` }}>
          <div style={{ transform: `scale(${skalaPersepsi(pu, 1.8, 1.0)})`, opacity: pu, width: "100%" }}>
            <Jendela t={t} px={px} w={w} u={u} polos seed="utama" padding={px(34)}>
              <div style={{ ...font("judul"), fontSize: u.judul * 0.9, lineHeight: 1.1, color: w.utama, textAlign: "center" }}>
                <Teks teks={el.utama} aksen={w.aksen} tunda={j.utama} />
              </div>
            </Jendela>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </SediaMotif>
  );
};

// ------------------------------------------------------------------ E43 growth-curve
// Kurva pertumbuhan: garis eksponensial tergambar dengan cahaya + isian gradien, titik ujung membawa gelembung angka
// yang menghitung naik, penanda tonggak muncul saat garis melewatinya.
export type Tonggak = { x: number; label: string };
export type GrowthCurveElemen = ElemenUI & {
  judul?: string; ke: number; dari?: number; akhiran?: string; label_x?: [string, string]; tonggak?: Tonggak[]; catatan?: string;
  jadwal: { gambar: number; durasi_gambar: number; catatan: number };
};
const fmt = (n: number) => (Math.abs(n) >= 100 ? Math.round(n).toLocaleString("id-ID") : (Math.round(n * 10) / 10).toLocaleString("id-ID"));
export const GrowthCurve: React.FC<PropsDasar<GrowthCurveElemen>> = (props) => {
  const { px, t, el, w, u, font, naik, motif, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const p = naik(j.gambar, j.durasi_gambar, "standar");
  const lebar = 600;
  const tinggi = 300;
  const kurva = (x: number) => (Math.exp(3 * x) - 1) / (Math.exp(3) - 1);
  const N = 60;
  const titik = Array.from({ length: N + 1 }, (_, i) => i / N).filter((x) => x <= p + 1e-6)
    .map((x) => [x * lebar, tinggi - kurva(x) * tinggi * 0.92] as const);
  const d = titik.length ? `M${titik.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L")}` : "";
  const ujung = titik[titik.length - 1] ?? [0, tinggi];
  const nilai = (el.dari ?? 0) + (el.ke - (el.dari ?? 0)) * kurva(p);
  const kaca = motif.bingkai === "kaca" || motif.bingkai === "jendela" || motif.bingkai === "hud";
  return (
    <Wadah wadah={wadah}>
      <Jendela t={t} px={px} w={w} u={u} judul={el.judul ?? "pertumbuhan"} seed={el.judul ?? "growth"}>
        <svg viewBox={`-20 -60 ${lebar + 60} ${tinggi + 110}`} style={{ width: "100%", overflow: "visible" }}>
          <defs>
            <linearGradient id="isiKurva" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={w.aksen} stopOpacity={0.45} />
              <stop offset="100%" stopColor={w.aksen} stopOpacity={0} />
            </linearGradient>
            <filter id="cahaya"><feGaussianBlur stdDeviation="6" /></filter>
          </defs>
          {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={0} x2={lebar} y1={tinggi - g * tinggi * 0.92} y2={tinggi - g * tinggi * 0.92}
                                                  stroke={rgba(w.utama, 0.1)} strokeWidth={1.5} />)}
          <line x1={0} x2={lebar} y1={tinggi} y2={tinggi} stroke={rgba(w.utama, 0.3)} strokeWidth={2} />
          {d ? <path d={`${d} L${ujung[0]} ${tinggi} L0 ${tinggi} Z`} fill="url(#isiKurva)" /> : null}
          {d && kaca ? <path d={d} fill="none" stroke={w.aksen} strokeWidth={10} opacity={0.5} filter="url(#cahaya)" /> : null}
          {d ? <path d={d} fill="none" stroke={w.aksen} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /> : null}
          {(el.tonggak ?? []).map((tg, i) => {
            const on = p >= tg.x;
            const ty = tinggi - kurva(tg.x) * tinggi * 0.92;
            return (
              <g key={i} opacity={on ? 1 : 0.25}>
                <circle cx={tg.x * lebar} cy={ty} r={on ? 9 : 6} fill={on ? w.aksen2 : rgba(w.utama, 0.3)} />
                <text x={tg.x * lebar} y={ty + 34} textAnchor="middle" fontSize={22} fill={w.sekunder}
                      style={font("isi")}>{tg.label}</text>
              </g>
            );
          })}
          {p > 0 ? (
            <g transform={`translate(${ujung[0]} ${ujung[1]})`}>
              <circle r={12} fill={w.aksen} />
              <circle r={22 + 6 * Math.sin(p * 20)} fill="none" stroke={w.aksen} strokeWidth={2} opacity={0.5} />
              <g transform="translate(-8 -46)">
                <rect x={-70} y={-36} width={150} height={48} rx={motif.bingkai === "brutal" ? 0 : 14} fill={w.aksen} />
                <text x={5} y={-3} textAnchor="middle" fontSize={30} fill={w.latar} style={font("judul")}>{fmt(nilai)}{el.akhiran ?? ""}</text>
              </g>
            </g>
          ) : null}
          {el.label_x ? (
            <>
              <text x={0} y={tinggi + 40} fontSize={22} fill={w.sekunder} style={font("isi")}>{el.label_x[0]}</text>
              <text x={lebar} y={tinggi + 40} textAnchor="end" fontSize={22} fill={w.sekunder} style={font("isi")}>{el.label_x[1]}</text>
            </>
          ) : null}
        </svg>
        {el.catatan ? (
          <div style={{ ...font("isi"), fontSize: u.kecil, color: w.utama, marginTop: px(10), opacity: naik(j.catatan, 0.3) }}>
            <Teks teks={el.catatan} aksen={w.aksen} tunda={j.catatan - el.durasi_masuk - 0.15} />
          </div>
        ) : null}
      </Jendela>
    </Wadah>
  );
};

// ------------------------------------------------------------------ E44 StudioSet (untuk kamera studio-reveal)
// Set studio virtual warna gaya: dinding gradien, strip LED aksen, lampu softbox, meja, pantulan lantai, dan LAYAR besar
// bertepi dengan lubang transparan (lubang = [x0,y0,x1,y1] 0–1) tempat render.py memasang rekaman.
export type StudioSetElemen = ElemenUI & { lubang: [number, number, number, number]; judul?: string };
export const StudioSet: React.FC<PropsDasar<StudioSetElemen>> = (props) => {
  const { dtk, px, t, el, w, font } = pakaiDasar(props);
  const { W, H } = props;
  const [hx0, hy0, hx1, hy1] = el.lubang;
  const lx0 = hx0 * W, ly0 = hy0 * H, lx1 = hx1 * W, ly1 = hy1 * H;
  const bez = px(18);
  const latar = warna(t, "latar");
  // dinding = 4 persegi di sekitar lubang (lubang tetap transparan)
  const dinding: React.CSSProperties = { position: "absolute", background: `linear-gradient(180deg, ${rgba(latar, 1)} 0%, ${rgba(latar, 1)} 60%, ${rgba("#000000", 1)} 140%)` };
  const tepi = { left: lx0 - bez, top: ly0 - bez, width: lx1 - lx0 + 2 * bez, height: ly1 - ly0 + 2 * bez };
  return (
    <AbsoluteFill>
      <div style={{ ...dinding, left: 0, top: 0, width: W, height: ly0 }} />
      <div style={{ ...dinding, left: 0, top: ly1, width: W, height: H - ly1 }} />
      <div style={{ ...dinding, left: 0, top: ly0, width: lx0, height: ly1 - ly0 }} />
      <div style={{ ...dinding, left: lx1, top: ly0, width: W - lx1, height: ly1 - ly0 }} />
      {/* strip LED vertikal kiri-kanan */}
      {[0.06, 0.94].map((x) => (
        <div key={x} style={{ position: "absolute", left: x * W - px(6), top: H * 0.08, width: px(12), height: H * 0.62, borderRadius: px(6),
                              background: w.aksen, boxShadow: `0 0 ${px(40)}px ${px(10)}px ${rgba(w.aksen, 0.45)}` }} />
      ))}
      {/* lampu softbox */}
      {[0.14, 0.86].map((x, i) => (
        <div key={x} style={{ position: "absolute", left: x * W - px(70), top: H * 0.78, width: px(140), height: px(110),
                              background: "linear-gradient(180deg, #F4F4F4, #BDBDBD)", borderRadius: px(8),
                              transform: `perspective(${px(600)}px) rotateY(${i ? -25 : 25}deg)`, boxShadow: `0 0 ${px(60)}px rgba(255,255,255,0.35)` }} />
      ))}
      {/* bezel layar + bayangan */}
      <div style={{ position: "absolute", ...tepi, borderRadius: px(14), border: `${bez}px solid #0E0F12`,
                    boxShadow: `0 ${px(30)}px ${px(60)}px rgba(0,0,0,0.55), 0 0 0 ${px(2)}px ${rgba(w.aksen, 0.6)}` }} />
      {/* meja & lantai mengkilap */}
      <div style={{ position: "absolute", left: W * 0.18, width: W * 0.64, top: ly1 + px(70), height: px(46), borderRadius: px(10),
                    background: `linear-gradient(180deg, ${rgba(w.utama, 0.25)}, ${rgba("#000000", 0.6)})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.86, bottom: 0,
                    background: `linear-gradient(180deg, ${rgba(w.aksen, 0.12)}, transparent)` }} />
      {el.judul ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: ly1 + px(140), textAlign: "center", ...font("judul"),
                      fontSize: px(52), color: w.utama, letterSpacing: px(2), textShadow: `0 0 ${px(18)}px ${rgba(w.aksen, 0.6)}` }}>{el.judul}</div>
      ) : null}
    </AbsoluteFill>
  );
};

