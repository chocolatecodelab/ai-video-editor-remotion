# Today’s Failure

Bang-motion 1.19.0 (latest origin/main verified 15 November 2026), HyperFrames 0.9.33, NazarVerse 1.0.

- Source: aset/source.mp4. Original preserved; cropped media copy: hyperframes/assets/talent.mp4.
- Approved direction: brief.md, rundown.json, hyperframes/DESIGN.md.
- Production: hyperframes/index.html. Native articulated SVG book/route, timeline registered under window.__timelines.main, one muted video track and detached source audio. HyperFrames owns media clocks.
- Build: build_composition.py; template: hyperframes/composition-template.txt. Extension deliberately avoids a second HyperFrames root HTML.
- Captions: subtitles.json, naskah-bilingual.md; original ASR cache/words.json is not overwritten. User confirmed “not who you are”; confirmation is recorded in caption-confirmation.json.
- R2 mask: hyperframes/assets/talent-roto.webm, 1483 actual video-matting frames. See revision-mask-r2.md and cache/roto-video-r2.json for processing details, including a warm restart inside the invisible book cutaway.
- Checks: out/hyperframes-check-r2.json. CLI check passes with six minimum-hold craft warnings and no lint/runtime/layout/motion/contrast errors. These warnings are documented, not hidden.
- Evidence: out/snapshots-r2.json, 23 actual HyperFrames stills; out/storyboard-r2.html (also out/storyboard.html), kontak-storyboard-r2.jpg, qa-storyboard-r2.md, mask-review/edges-r2.jpg and hands-r2.jpg. R1 is superseded and retained as an archive.
- Geometry: out/mask-review/alpha-geometry-check.json checks the encoded alpha across all frames. No caption/talent overlap or missing bottom contact was found; this does not prove subjective temporal quality.
- assemble_roto_storyboard.py assembles the R2 review from real snapshots; it does not render a video or approve the storyboard.

User approved storyboard R2 and final render with “jalankan render” on 15 November 2026. The exact composition, beat-sheet and subtitles are hash-locked in out/render-approval.json. No Studio or preview MP4 was started. render_final.py prepares and measures audio first, runs the pinned HyperFrames CLI, then attaches the prepared AAC and bt709 metadata by stream copy. All intermediates stay in D: .sementara/todays-failure-final. qa_final.py verifies the actual encoded MP4 and writes out/qa-report.md; manual playback/listening remains separate. Final target: out/2026-11_todays-failure.mp4, 1080×1920 H.264/AAC bt709.

Source resolution is only 478×850. Upscaling to 1080×1920 does not reconstruct missing detail. R2 removes the room and keeps the masked body attached to the frame bottom/sides. Hair, shoulders and moving hands have been inspected in sampled stills on navy and ivory. Full playback stability, listening and final export remain unverified.

## Hasil final

out/2026-11_todays-failure.mp4: 49.467s, 1484 frames, 1080×1920/30fps. QA teknis LULUS; audio -14.38 LUFS dan -2.32 dBTP. Bukti: out/qa-report.md, out/kontak-final.jpg, delivery.json. Playback dan dengar manual tetap belum dicentang. Jangan menjalankan ulang assembler storyboard historis di atas status final tanpa revisi baru.
