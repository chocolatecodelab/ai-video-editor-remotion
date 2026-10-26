import React from "react";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { Jendela, ElemenUI, pakaiDasar, palet } from "../lib/dasar";

// E23 grid-variasi: "1 workflow → N variasi" — penghitung ikut jumlah ubin yang sudah terisi; ubin berwarna muncul
// pelan → cepat → pelan (jadwal Python, sama dengan tick SFX).
export type GridVariasiElemen = ElemenUI & {
  judul?: string; dari_label?: string; ke: number; label?: string; kolom?: number;
  jadwal: { ubin: number[] };
};
export type GridVariasiProps = PropsDasar<GridVariasiElemen>;

export const GridVariasi: React.FC<GridVariasiProps> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const kolom = el.kolom ?? 12;
  const total = Math.ceil(el.ke / kolom) * kolom;
  const terisi = j.ubin.filter((x) => x <= dtk).length;
  const warna = palet(w);
  return (
    <Wadah wadah={wadah}>
      <Jendela t={t} px={px} w={w} u={u} judul={el.judul}>
        <div style={{ display: "flex", alignItems: "baseline", gap: px(14), marginBottom: px(18) }}>
          <div style={{ ...font("isi"), fontSize: u.kecil, color: w.sekunder }}>{el.dari_label ?? "1 workflow"} →</div>
          <div style={{ ...font("judul"), fontSize: u.sub, color: w.utama, fontVariantNumeric: "tabular-nums" }}>{terisi}</div>
          <div style={{ ...font("isi"), fontSize: u.kecil, color: w.sekunder }}>{el.label ?? "variasi"}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${kolom}, 1fr)`, gap: px(8) }}>
          {Array.from({ length: total }, (_, k) => {
            const a = k < el.ke ? naik(j.ubin[k], 0.15) : 0;
            return (
              <div key={k} style={{ aspectRatio: "1 / 1", borderRadius: px(6),
                                    background: a > 0 ? warna[(k * 7) % warna.length] : rgba(w.utama, 0.07),
                                    transform: `scale(${a > 0 ? skalaPersepsi(a, 0.6) : 1})` }} />
            );
          })}
        </div>
      </Jendela>
    </Wadah>
  );
};
