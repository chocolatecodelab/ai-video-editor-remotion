import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import gaya from "../../../tokens/TOKEN_01_glass-tech_v0.3.json";
import platform from "../../../tokens/TOKEN_00_platform_v0.4.json";

// Composition uji instalasi: judul glass panel dari token yang sama dengan pipeline Python.
export type UjiProps = { teks: string };
export const ujiDefault: UjiProps = { teks: "Remotion siap" };

const [x1, y1, x2, y2] = gaya.easing.standar;
const ease = Easing.bezier(x1, y1, x2, y2);
const z = platform["zona-aman"];

export const Uji: React.FC<UjiProps> = ({ teks }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [0, gaya.durasi.masuk * fps], [0, 1], {
    easing: ease,
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: gaya.warna.latar }}>
      <div
        style={{
          position: "absolute",
          top: z.atas,
          left: z.kiri,
          right: z.kanan,
          padding: gaya.spasi["padding-kartu"],
          borderRadius: gaya.radius.kartu,
          background: `${gaya.warna.panel}${Math.round(gaya.warna["panel-opasitas"] * 255).toString(16)}`,
          border: `2px solid rgba(255,255,255,${gaya.warna["garis-opasitas"]})`,
          opacity: p,
          transform: `translateY(${(1 - p) * gaya.gerak["jarak-naik"]}px)`,
          fontFamily: gaya.font.judul.family,
          fontWeight: gaya.font.judul.weight,
          fontSize: gaya.ukuran.judul,
          color: gaya.warna["teks-utama"],
          textAlign: "center",
        }}
      >
        {teks}
      </div>
    </AbsoluteFill>
  );
};
