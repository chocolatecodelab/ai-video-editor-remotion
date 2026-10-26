import React from "react";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { Jendela, ElemenUI, pakaiDasar } from "../lib/dasar";

// E24 form-ganti: formulir konfigurasi (label : nilai); tiap baris bergantian disorot, nilai lama berganti nilai baru,
// lalu lencana "✓ diganti" muncul di kanan.
export type BarisForm = { label: string; lama?: string; baru: string };
export type FormGantiElemen = ElemenUI & {
  judul?: string; baris: BarisForm[]; lencana?: string;
  jadwal: { ganti: number[] };
};
export type FormGantiProps = PropsDasar<FormGantiElemen>;

export const FormGanti: React.FC<FormGantiProps> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  return (
    <Wadah wadah={wadah}>
      <Jendela t={t} px={px} w={w} u={u} judul={el.judul ?? "variant.config"}>
        {el.baris.map((b, i) => {
          const g = naik(j.ganti[i], 0.2);
          const l = naik(j.ganti[i] + 0.2, 0.22);
          const aktif = dtk >= j.ganti[i] && (i === el.baris.length - 1 || dtk < j.ganti[i + 1]);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: px(16), marginBottom: px(12),
                                  padding: `${px(6)}px ${px(10)}px`, borderRadius: px(10),
                                  background: aktif ? rgba(w.aksen, 0.1) : "transparent" }}>
              <div style={{ width: u.kecil * 3.4, ...font("isi"), fontSize: u.kecil * 0.82, color: w.sekunder }}>{b.label}</div>
              <div style={{ flex: 1, position: "relative", height: u.kecil * 1.5, borderRadius: px(10),
                            border: `${px(2)}px solid ${g > 0 ? w.aksen : rgba(w.utama, 0.15)}`, overflow: "hidden" }}>
                <div style={{ position: "absolute", left: px(14), top: "50%", transform: `translateY(${-50 - 60 * g}%)`,
                              opacity: 1 - g, ...font("isi"), fontSize: u.kecil, color: w.sekunder, whiteSpace: "nowrap" }}>
                  {b.lama ?? ""}
                </div>
                <div style={{ position: "absolute", left: px(14), top: "50%", transform: `translateY(${-50 + 60 * (1 - g)}%)`,
                              opacity: g, ...font("subjudul"), fontSize: u.kecil, color: w.utama, whiteSpace: "nowrap" }}>
                  {b.baru}
                </div>
              </div>
              <div style={{ minWidth: u.kecil * 3.6, padding: `${px(4)}px ${px(12)}px`, borderRadius: px(999),
                            background: rgba(w.aksen, 0.18), ...font("isi"), fontSize: u.kecil * 0.82, color: w.aksen,
                            opacity: l, transform: `scale(${skalaPersepsi(l, 0.6)})`, textAlign: "center" }}>
                ✓ {el.lencana ?? "diganti"}
              </div>
            </div>
          );
        })}
      </Jendela>
    </Wadah>
  );
};
