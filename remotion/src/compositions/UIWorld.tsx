import React from "react";
import { AbsoluteFill, Easing, interpolate, random } from "remotion";
import { PropsDasar, rgba } from "../lib/kontrak";
import { ElemenUI, Jendela, pakaiDasar, palet } from "../lib/dasar";
import { LatarGaya } from "../lib/latar";
import { Teks } from "../lib/Teks";

// E03 ui-world (klip cutaway/broll native): ruang 3D berisi panel UI melayang (grafik, daftar, profil) di kedalaman
// berbeda; kamera dolly maju menembus panel, berakhir di panel utama berisi judul + sub di tengah.
export type UIWorldElemen = ElemenUI & { judul: string; sub?: string; jumlah?: number; jadwal: { tiba: number } };
export type UIWorldProps = PropsDasar<UIWorldElemen>;

const Kerangka: React.FC<{ jenis: number; w: ReturnType<typeof pakaiDasar>["w"]; px: (v: number) => number; i: number }> = ({ jenis, w, px, i }) => {
  const p = palet(w);
  if (jenis === 0) {
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: px(10), height: px(120) }}>
        {[0.4, 0.7, 0.5, 0.9, 0.65].map((h, k) => <div key={k} style={{ flex: 1, height: `${h * 100}%`, background: p[(k + i) % p.length], borderRadius: px(4) }} />)}
      </div>
    );
  }
  if (jenis === 1) {
    return (
      <div>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: px(14), marginBottom: px(14) }}>
            <div style={{ width: px(34), height: px(34), borderRadius: px(34), background: p[(k + i) % p.length] }} />
            <div style={{ flex: 1, height: px(14), borderRadius: px(7), background: rgba(w.utama, 0.2) }} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: px(16), alignItems: "center" }}>
      <div style={{ width: px(90), height: px(90), borderRadius: px(90), border: `${px(10)}px solid ${p[i % p.length]}`, borderRightColor: rgba(w.utama, 0.15) }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: px(16), width: "80%", borderRadius: px(8), background: rgba(w.utama, 0.3), marginBottom: px(12) }} />
        <div style={{ height: px(12), width: "55%", borderRadius: px(6), background: rgba(w.utama, 0.16) }} />
      </div>
    </div>
  );
};

export const UIWorld: React.FC<UIWorldProps> = (props) => {
  const { dtk, px, t, el, w, u, font, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H } = props;
  const n = el.jumlah ?? 9;
  const tiba = el.jadwal.tiba;
  const kamera = interpolate(dtk, [0, tiba], [0, 1], { easing: Easing.bezier(0.3, 0, 0.2, 1), extrapolateRight: "clamp" });
  const kedalaman = px(5200);
  const zKamera = kamera * kedalaman;
  const panel = Array.from({ length: n }, (_, i) => ({
    i, x: (random(`ux${i}`) - 0.5) * W * 1.3, y: (random(`uy${i}`) - 0.5) * H * 0.9, z: -((i + 1) / n) * kedalaman * 0.95,
    r: (random(`ur${i}`) - 0.5) * 30, jenis: i % 3,
  }));
  const zUtama = -kedalaman;
  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill>
        <LatarGaya t={t} dtk={dtk} W={W} H={H} />
        <AbsoluteFill style={{ perspective: px(1200), perspectiveOrigin: "50% 45%" }}>
          <div style={{ position: "absolute", left: W / 2, top: H * 0.45, transformStyle: "preserve-3d", transform: `translateZ(${zKamera}px)` }}>
            {panel.map((pn) => {
              const jarak = pn.z + zKamera;
              const op = interpolate(jarak, [-kedalaman, -kedalaman * 0.6, -px(300), px(200)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={pn.i} style={{ position: "absolute", width: W * 0.5, left: pn.x - W * 0.25, top: pn.y, opacity: op,
                                         transform: `translateZ(${pn.z}px) rotateY(${pn.r}deg)` }}>
                  <Jendela t={t} px={px} w={w} u={u} judul={["metrics", "team", "progress"][pn.jenis]} seed={`ui${pn.i}`}>
                    <Kerangka jenis={pn.jenis} w={w} px={px} i={pn.i} />
                  </Jendela>
                </div>
              );
            })}
            <div style={{ position: "absolute", width: W * 0.8, left: -W * 0.4, top: -H * 0.08,
                          transform: `translateZ(${zUtama - px(250)}px)`, opacity: interpolate(kamera, [0.55, 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              <Jendela t={t} px={px} w={w} u={u} judul="hasil" seed="utama" padding={px(40)}>
                <div style={{ ...font("judul"), fontSize: u.judul, lineHeight: 1.02, color: w.utama }}>
                  <Teks teks={el.judul} aksen={w.aksen} tunda={tiba} />
                </div>
                {el.sub ? <div style={{ ...font("isi"), fontSize: u.isi * 0.85, color: w.sekunder, marginTop: px(16) }}>{el.sub}</div> : null}
              </Jendela>
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </SediaMotif>
  );
};
