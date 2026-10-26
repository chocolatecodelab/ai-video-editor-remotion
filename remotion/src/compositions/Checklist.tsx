import React from "react";
import { interpolate, random, spring, useCurrentFrame } from "remotion";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { Jendela, pakaiDasar } from "../lib/dasar";
import { Teks } from "../lib/Teks";

// E07 checklist: panel → judul → item ber-stagger; tiap item: baris masuk, centang tergambar (0,3 s), bounce.
// E40 checklist-pop (`pop: true`): item memantul masuk (spring), kotak terisi penuh aksen + percikan saat tercentang.
// Bingkai & hiasan kata mengikuti motif gaya. Latar transparan; kaca (backdrop blur) dikomposit Python.
export type ChecklistElemen = {
  judul?: string;
  item: string[];
  stagger: number; // detik antar item (di-resolve Python, dicek QA E07.3)
  pop?: boolean;
};
export type ChecklistProps = PropsDasar<ChecklistElemen>;

const CENTANG = 0.3; // detik, dari pustaka efek E07
const BOUNCE = 0.25;

export const waktuItem = (el: ChecklistElemen & { durasi_masuk: number }, i: number) =>
  el.durasi_masuk * 0.5 + i * el.stagger;

export const Checklist: React.FC<ChecklistProps> = (props) => {
  const { px, t, el, w, u, font, ease, motif, Wadah, wadah } = pakaiDasar(
    props as unknown as PropsDasar<ChecklistElemen & { jadwal: Record<string, unknown> }>);
  const f = useCurrentFrame();
  const s = (detik: number) => detik * props.fps;
  const jarak = px(Number(t.gerak["jarak-naik"]));
  const kotak = u.isi * 0.95;
  const bulat = ["spidol", "pensil", "kertas", "kolase"].includes(motif.bingkai);
  return (
    <Wadah wadah={wadah}>
      <Jendela t={t} px={px} w={w} u={u} polos seed={el.judul ?? "checklist"} padding={px(t.spasi["padding-kartu"])}>
        {el.judul ? (
          <div style={{ ...font("subjudul"), fontSize: u.sub, color: w.utama, lineHeight: 1.1, marginBottom: px(t.spasi["jarak-item"]) * 1.3 }}>
            <Teks teks={el.judul} aksen={w.aksen} />
          </div>
        ) : null}
        {el.item.map((teks, i) => {
          const mulai = s(waktuItem(el, i));
          const baris = interpolate(f, [mulai, mulai + s(0.25)], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const cMulai = mulai + s(0.15);
          const goresan = interpolate(f, [cMulai, cMulai + s(CENTANG)], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const bAwal = cMulai + s(CENTANG);
          const b = interpolate(f, [bAwal, bAwal + s(BOUNCE)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const pantul = 1 + (el.pop ? 0.32 : 0.18) * Math.sin(Math.PI * b);
          const sp = el.pop ? spring({ frame: f - Math.round(mulai), fps: props.fps, config: { damping: 8, stiffness: 170, mass: 0.6 } }) : 1;
          const masukPop = el.pop ? `scale(${skalaPersepsi(sp, 0.5)}) rotate(${(1 - sp) * -6}deg)` : `translateY(${(1 - baris) * jarak * 0.5}px)`;
          return (
            <div key={i} style={{ position: "relative", display: "flex", alignItems: "center", gap: px(18), marginTop: i ? px(t.spasi["jarak-item"]) : 0,
                                  opacity: el.pop ? Math.min(1, sp * 2) : baris, transform: masukPop, transformOrigin: "0% 50%" }}>
              {el.pop && b > 0 && b < 1 ? Array.from({ length: 7 }, (_, k) => {
                const a = (k / 7) * Math.PI * 2 + random(`c${i}${k}`);
                const r = kotak * (0.6 + 0.9 * b);
                return <div key={k} style={{ position: "absolute", left: kotak / 2 + Math.cos(a) * r - px(4), top: "50%",
                                             marginTop: Math.sin(a) * r - px(4), width: px(8), height: px(8), borderRadius: px(8),
                                             background: k % 2 ? w.aksen : w.aksen2, opacity: 1 - b }} />;
              }) : null}
              <div style={{ width: kotak, height: kotak, flexShrink: 0, transform: `scale(${pantul})`,
                            borderRadius: motif.bingkai === "hud" || motif.bingkai === "brutal" ? 0 : bulat ? kotak : kotak * 0.28,
                            border: `${px(3)}px solid ${goresan > 0 ? w.aksen : rgba(w.sekunder, 0.6)}`,
                            background: rgba(w.aksen, (el.pop ? 1 : 0.18) * goresan), display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 24 24" width={kotak * 0.8} height={kotak * 0.8}>
                  <path d="M5 12.5 L10 17 L19 7.5" fill="none" stroke={el.pop ? w.latar : w.aksen} strokeWidth={3.2} strokeLinecap="round"
                        strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - goresan} />
                </svg>
              </div>
              <div style={{ ...font("isi"), fontSize: u.isi, color: w.sekunder, lineHeight: 1.15 }}>
                <Teks teks={teks} aksen={w.aksen} tunda={waktuItem(el, i)} />
              </div>
            </div>
          );
        })}
      </Jendela>
    </Wadah>
  );
};
