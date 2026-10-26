import React, { useContext } from "react";
import { HiasKata, MotifKonteks, pakaiProgresHias } from "./motif";

// Markup sama dengan render.py: *kata* = warna aksen (boleh melintasi kata, tanda baca setelah * tetap menempel).
// Di dalam perangkat (MotifKonteks), kata aksen diberi hiasan motif gaya (kilau, stabilo, lingkar, target, …).
export const Teks: React.FC<{ teks: string; aksen: string; tunda?: number; hias?: boolean }> = ({ teks, aksen, tunda = 0, hias = true }) => {
  const k = useContext(MotifKonteks);
  const p = pakaiProgresHias(tunda);
  const bagian = teks.split("*");
  return (
    <>
      {bagian.map((b, i) =>
        i % 2 === 1 ? (
          k && hias ? (
            <HiasKata key={i} jenis={k.motif.aksen} p={p} warnaTeks={aksen} seed={`${b}${i}`}>{b}</HiasKata>
          ) : (
            <span key={i} style={{ color: aksen }}>{b}</span>
          )
        ) : (
          <React.Fragment key={i}>{b}</React.Fragment>
        ),
      )}
    </>
  );
};

export const polos = (teks: string) => teks.replace(/\*/g, "");
