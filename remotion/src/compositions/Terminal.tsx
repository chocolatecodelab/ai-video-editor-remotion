import React from "react";
import { PropsDasar, rgba } from "../lib/kontrak";
import { Jendela, ElemenUI, pakaiDasar } from "../lib/dasar";
import { Teks } from "../lib/Teks";

// E20 terminal: perintah diketik setelah "›", Enter, lalu baris keluaran muncul satu per satu. Baris berawalan "✓"
// diwarnai aksen (selesai). Jadwal huruf/baris dari Python → klik ketik & tick jatuh tepat di frame.
export type TerminalElemen = ElemenUI & {
  judul?: string; perintah: string; keluaran?: string[];
  jadwal: { ketik: number[]; enter: number; baris: number[] };
};
export type TerminalProps = PropsDasar<TerminalElemen>;

export const Terminal: React.FC<TerminalProps> = (props) => {
  const { dtk, px, t, el, w, u, naik, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const mono = { fontFamily: "Consolas, 'Cascadia Mono', monospace", fontWeight: 600 } as const;
  const polos = el.perintah.replace(/\*/g, "");
  const n = j.ketik.filter((x) => x <= dtk).length;
  const kursor = dtk < j.enter && (n < polos.length && n > 0 ? 1 : Math.floor(dtk * 2) % 2 === 0 ? 1 : 0);
  return (
    <Wadah wadah={wadah}>
      <Jendela t={t} px={px} w={w} u={u} judul={el.judul ?? "terminal"}>
        <div style={{ ...mono, fontSize: u.kecil * 1.05, color: w.utama, lineHeight: 1.45 }}>
          <span style={{ color: w.aksen }}>› </span>
          {polos.slice(0, n)}
          <span style={{ display: "inline-block", width: px(12), height: u.kecil, marginLeft: px(2), verticalAlign: "text-bottom",
                         background: w.aksen, opacity: kursor ? 1 : 0 }} />
        </div>
        {(el.keluaran ?? []).map((baris, i) => {
          const a = naik(j.baris[i], 0.22);
          const selesai = baris.trimStart().startsWith("✓");
          return (
            <div key={i} style={{ ...mono, fontSize: u.kecil, lineHeight: 1.45, opacity: a,
                                  transform: `translateX(${(1 - a) * px(16)}px)`,
                                  color: selesai ? w.aksen : rgba(w.utama, 0.82) }}>
              {selesai ? null : <span style={{ color: w.sekunder }}>• </span>}
              <Teks teks={baris} aksen={w.aksen} />
            </div>
          );
        })}
      </Jendela>
    </Wadah>
  );
};
