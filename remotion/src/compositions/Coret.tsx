import React from "react";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, Jendela, pakaiDasar } from "../lib/dasar";

// E21 coret: kartu file (ikon dokumen + nama) berisi teks; garis coret digambar kiri→kanan lalu lencana ✕ muncul.
export type CoretElemen = ElemenUI & {
  judul?: string; teks: string;
  jadwal: { coret: number; durasi_coret: number; silang: number };
};
export type CoretProps = PropsDasar<CoretElemen>;

export const Coret: React.FC<CoretProps> = (props) => {
  const { px, t, el, w, u, font, naik, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const gores = naik(j.coret, j.durasi_coret, "tegas");
  const silang = naik(j.silang, 0.22);
  const pantul = 1 + 0.25 * Math.sin(Math.PI * silang);
  const ikon = u.isi * 1.4;
  return (
    <Wadah wadah={wadah}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ display: "inline-block" }}>
        <Jendela t={t} px={px} w={w} u={u} polos seed={el.teks} padding={0}>
        <div style={{ display: "flex", alignItems: "center", gap: px(22), padding: `${px(22)}px ${px(30)}px` }}>
          <svg viewBox="0 0 24 24" width={ikon} height={ikon}>
            <path d="M6 2.5h8l4.5 4.5v14.5H6z M14 2.5V7h4.5 M8.5 12h7 M8.5 15.5h7 M8.5 19h4" fill="none"
                  stroke={w.sekunder} strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <div>
            {el.judul ? <div style={{ ...font("isi"), fontSize: u.kecil, color: w.sekunder }}>{el.judul}</div> : null}
            <div style={{ position: "relative", display: "inline-block", ...font("subjudul"), fontSize: u.isi,
                          color: rgba(w.utama, 1 - 0.35 * gores) }}>
              {el.teks.replace(/\*/g, "")}
              <div style={{ position: "absolute", left: -px(4), top: "54%", height: px(5), borderRadius: px(5),
                            width: `calc(${gores * 100}% + ${px(8) * gores}px)`, background: w.peringatan }} />
            </div>
          </div>
          <div style={{ width: ikon * 0.8, height: ikon * 0.8, borderRadius: ikon, background: w.peringatan,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: silang, transform: `scale(${skalaPersepsi(silang, 0.5) * pantul})` }}>
            <svg viewBox="0 0 24 24" width={ikon * 0.45} height={ikon * 0.45}>
              <path d="M6 6l12 12M18 6L6 18" stroke={w.latar} strokeWidth={3.2} strokeLinecap="round" />
            </svg>
          </div>
        </div>
        </Jendela>
        </div>
      </div>
    </Wadah>
  );
};
