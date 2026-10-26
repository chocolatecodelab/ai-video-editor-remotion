import React from "react";
import { PropsDasar, rgba } from "../lib/kontrak";
import { Jendela, ElemenUI, pakaiDasar } from "../lib/dasar";

// E19 penghitung: kartu (mis. repo/akun) dengan angka count-up ease-out kubik + label, lalu "pop" kecil saat selesai.
export type PenghitungElemen = ElemenUI & {
  judul?: string; sub?: string; dari?: number; ke: number; label?: string; akhiran?: string; bintang?: boolean;
  jadwal: { mulai_hitung: number; durasi_hitung: number };
};
export type PenghitungProps = PropsDasar<PenghitungElemen>;

const format = (n: number) => Math.round(n).toLocaleString("id-ID");

export const Penghitung: React.FC<PenghitungProps> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const x = Math.min(1, Math.max(0, (dtk - j.mulai_hitung) / j.durasi_hitung));
  const nilai = (el.dari ?? 0) + (el.ke - (el.dari ?? 0)) * (1 - (1 - x) ** 3);
  const selesai = naik(j.mulai_hitung + j.durasi_hitung, 0.25);
  const pantul = 1 + 0.08 * Math.sin(Math.PI * selesai);
  return (
    <Wadah wadah={wadah}>
      <Jendela t={t} px={px} w={w} u={u} judul={el.judul}>
        {el.sub ? <div style={{ ...font("isi"), fontSize: u.kecil, color: w.sekunder, marginBottom: px(10) }}>{el.sub}</div> : null}
        <div style={{ display: "flex", alignItems: "baseline", gap: px(14) }}>
          {el.bintang !== false ? (
            <svg viewBox="0 0 24 24" width={u.judul * 0.7} height={u.judul * 0.7} style={{ alignSelf: "center" }}>
              <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.1l-5.7 3.2 1.2-6.4L2.8 9.5l6.4-.8z"
                    fill={rgba(w.aksen, 0.25 + 0.75 * selesai)} stroke={w.aksen} strokeWidth={1.6} strokeLinejoin="round" />
            </svg>
          ) : null}
          <div style={{ ...font("judul"), fontSize: u.judul, color: w.utama, fontVariantNumeric: "tabular-nums",
                        transform: `scale(${pantul})`, transformOrigin: "0% 70%" }}>
            {format(nilai)}{el.akhiran ?? ""}
          </div>
          {el.label ? <div style={{ ...font("isi"), fontSize: u.kecil, color: w.sekunder }}>{el.label}</div> : null}
        </div>
      </Jendela>
    </Wadah>
  );
};
