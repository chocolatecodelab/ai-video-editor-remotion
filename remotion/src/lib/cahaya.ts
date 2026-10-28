// Arah bayangan searah cahaya rekaman (K10.3). Pipeline (render_menyatu.py) sudah memutar `bayangan.offset`; bayangan
// yang ditulis langsung di komposisi (long-shadow, bayangan stroke) diputar dengan `bayangan.putar` (derajat, + = ke kanan).

import type { Tokens } from "./kontrak";

export const putarBayangan = (t: Tokens, x: number, y: number): [number, number] => {
  const r = ((t.bayangan.putar ?? 0) * Math.PI) / 180;
  if (!r) return [x, y];
  const c = Math.cos(r);
  const s = Math.sin(r);
  // putaran searah jarum jam di layar (y ke bawah): vektor lurus ke bawah (0, 1) → (sin r, cos r)
  return [x * c + y * s, -x * s + y * c];
};
