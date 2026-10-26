import { useState } from "react";
import { cancelRender, continueRender, delayRender, getRemotionEnvironment, staticFile } from "remotion";
import { Tokens } from "./kontrak";

// Font token dimuat dari file (public/fonts/, disalin remotion_jembatan.siapkan_font) dengan nama alias per peran
// ("tok-judul", "tok-isi", …) → teks Remotion memakai file font yang sama dengan render.py.
// Saat RENDER (pipeline) file yang gagal dimuat = render dihentikan: font cadangan diam-diam membuat ukuran/lebar teks
// berbeda dari render.py & QA. Di Studio cukup peringatan (family sistem jadi cadangan bila file belum disalin).
const dimuat = new Map<string, Promise<void>>();

const muat = (alias: string, file: string, weight: number) => {
  const kunci = `${alias}|${file}|${weight}`;
  if (!dimuat.has(kunci)) {
    // variable font: descriptor rentang → font-weight CSS memilih titik sumbu wght (Inter, Baloo 2, Playfair)
    const variabel = /variable/i.test(file);
    const ff = new FontFace(alias, `url(${staticFile(`fonts/${encodeURIComponent(file)}`)})`, { weight: variabel ? "100 900" : String(weight) });
    dimuat.set(kunci, ff.load().then((f) => { document.fonts.add(f); }).catch((e) => {
      const pesan = `font token '${file}' (${alias}) gagal dimuat dari public/fonts: ${e}`;
      if (getRemotionEnvironment().isRendering) cancelRender(new Error(pesan));
      console.warn(pesan);
    }));
  }
  return dimuat.get(kunci)!;
};

/** Token dengan family font = alias file token + family sistem sebagai cadangan; menahan render sampai font siap. */
export const pakaiFontToken = (t: Tokens): Tokens => {
  const [tunggu] = useState(() => {
    const h = delayRender("font token");
    const font = t.font as Record<string, { family: string; weight: number; file?: string }>;
    Promise.all(Object.entries(font).filter(([, v]) => v.file).map(([peran, v]) => muat(`tok-${peran}`, v.file!, v.weight)))
      .then(() => continueRender(h));
    return h;
  });
  void tunggu;
  const font: Tokens["font"] = {};
  for (const [peran, v] of Object.entries(t.font as Record<string, { family: string; weight: number; file?: string }>)) {
    font[peran] = { ...v, family: v.file ? `'tok-${peran}', '${v.family}'` : v.family };
  }
  return { ...t, font };
};
