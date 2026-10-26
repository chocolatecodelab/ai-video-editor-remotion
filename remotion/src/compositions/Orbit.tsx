import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, Jendela, pakaiDasar } from "../lib/dasar";
import { LatarGaya } from "../lib/latar";
import { Teks } from "../lib/Teks";

// E01 orbit (klip cutaway/broll native): objek utama di tengah (kartu judul), satelit (chip) mengorbit pada elips miring
// — depan membesar & terang, belakang mengecil & redup (parallax), kamera ikut berputar pelan. Bayangan lantai + pantulan.
export type OrbitElemen = ElemenUI & { pusat: string; sub?: string; satelit: string[]; putaran?: number; jadwal: { masuk: number } };
export type OrbitProps = PropsDasar<OrbitElemen>;

export const Orbit: React.FC<OrbitProps> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, motif, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H, durasiFrame, fps } = props;
  const total = durasiFrame / fps;
  const putar = interpolate(dtk, [0, total], [0, (el.putaran ?? 1) * Math.PI * 2], { easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const pm = naik(el.jadwal.masuk, 0.6, "tegas");
  const cx = W / 2;
  const cy = H * 0.44;
  const rx = W * 0.35;
  const ry = W * 0.17;
  const tilt = Math.sin(putar * 0.5) * 6;
  const n = el.satelit.length;
  const satelit = el.satelit.map((s, i) => {
    const a = putar + (i / n) * Math.PI * 2;
    const z = Math.sin(a);
    return { s, i, x: cx + Math.cos(a) * rx * pm, y: cy + z * ry * pm, z, skala: 0.72 + 0.4 * (z + 1) / 2 };
  });
  const chip = (o: (typeof satelit)[number]) => (
    <div key={o.i} style={{ position: "absolute", left: o.x, top: o.y, transform: `translate(-50%, -50%) scale(${o.skala * pm})`,
                            opacity: 0.35 + 0.65 * (o.z + 1) / 2, zIndex: o.z > 0 ? 3 : 1 }}>
      <div style={{ display: "inline-block" }}>
        <Jendela t={t} px={px} w={w} u={u} polos kecil seed={`o${o.i}`} padding={0} radius={motif.bingkai === "hud" ? px(4) : px(999)}>
          <div style={{ padding: `${px(14)}px ${px(28)}px`, ...font("subjudul"), fontSize: u.isi * 1.05, color: w.utama, whiteSpace: "nowrap" }}>
            <Teks teks={o.s} aksen={w.aksen} hias={false} />
          </div>
        </Jendela>
      </div>
    </div>
  );
  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill>
        <LatarGaya t={t} dtk={dtk} W={W} H={H} />
        <AbsoluteFill style={{ transform: `rotate(${tilt * 0.3}deg)` }}>
          <div style={{ position: "absolute", left: cx - rx, top: cy - ry, width: rx * 2, height: ry * 2, borderRadius: "50%",
                        border: `${px(2)}px dashed ${rgba(w.aksen, 0.35 * pm)}` }} />
          <div style={{ position: "absolute", left: cx - W * 0.3, top: cy + W * 0.33, width: W * 0.6, height: W * 0.08, borderRadius: "50%",
                        background: `radial-gradient(ellipse, ${rgba("#000000", 0.4)}, transparent 70%)`, opacity: pm }} />
          {satelit.filter((o) => o.z <= 0).map(chip)}
          <div style={{ position: "absolute", left: cx, top: cy, zIndex: 2, width: W * 0.44,
                        transform: `translate(-50%, -50%) scale(${skalaPersepsi(pm, 0.6)}) rotateY(${Math.sin(putar) * 12}deg)`, opacity: pm }}>
            <Jendela t={t} px={px} w={w} u={u} polos seed="pusat" padding={px(44)}>
              <div style={{ textAlign: "center" }}>
                <div style={{ ...font("judul"), fontSize: u.judul, lineHeight: 1.0, color: w.utama }}>
                  <Teks teks={el.pusat} aksen={w.aksen} />
                </div>
                {el.sub ? <div style={{ ...font("isi"), fontSize: u.kecil, color: w.sekunder, marginTop: px(14) }}>{el.sub}</div> : null}
              </div>
            </Jendela>
            <div style={{ transform: "scaleY(-1)", opacity: 0.12, marginTop: px(10), maskImage: "linear-gradient(transparent 40%, black)",
                          WebkitMaskImage: "linear-gradient(transparent 40%, black)", height: px(90), overflow: "hidden" }}>
              <div style={{ ...font("judul"), fontSize: u.judul, textAlign: "center", color: w.utama }}>{el.pusat.replace(/\*/g, "")}</div>
            </div>
          </div>
          {satelit.filter((o) => o.z > 0).map(chip)}
        </AbsoluteFill>
      </AbsoluteFill>
    </SediaMotif>
  );
};
