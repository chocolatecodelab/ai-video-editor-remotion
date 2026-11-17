# Visible — Before the Surface

NazarVerse v1.0. bang-motion 1.19.0 (origin HEAD checked 17 November 2026); HyperFrames 0.9.33 pinned. User granted creative discretion within brand guidelines. Subtitle Indonesian and smooth grounded roto preferences carry over from the chat.

- Source: aset/source.mp4, copied from the user's VISIBLE.mp4 without modifying the original. Source resolution 478×850; crop 478×766 y42 removes the black bars. Audio 46.4365s is preserved.
- Contract: brief.md, manifest.json, hyperframes/DESIGN.md.
- Narrative/timing: beat-sheet.json, audio-plan.json, subtitles.json, naskah-bilingual.md. Original ASR cache/words.json remains unchanged. Three ambiguous phrases were confirmed by the user and aligned to actual audio; caption-confirmation.json records the limited scope. No whole-clip listening audit is claimed.
- Native continuous SVG plant world: seed, water contact, masked ceramic cross-section, connected roots, obstacle detour, incremental growth nodes, unfolding stem/leaves. Artwork is not a shifted generated image. An untimed positioning wrapper controls real transparent video; HyperFrames owns the media clocks.
- Foreground: prepare_roto.py processes all 1392 frames with uninterrupted recurrent state. refine_edges.py removes the sampled hair haze in the head region while retaining the original body/hands below source y500; initial matte remains in D: .sementara/visible for review. Metadata and hashes: cache/roto.json.
- Build: build.py reads the manifest, beat-sheet and confirmed-word cache, then fills hyperframes/composition-template.txt. That template deliberately is not another .html composition root.
- Checks: actual encoded-alpha/caption geometry in qa_geometry.py; full HyperFrames check in out/hyperframes-check.json. Images in out/storyboard are actual HyperFrames snapshots. assemble_storyboard.py makes out/storyboard.html, kontak-storyboard.jpg, fase-motion.jpg, mask-review/edges.jpg and qa-storyboard.md.
- No Studio and no preview MP4. The generated HTML storyboard is a review surface; hyperframes/index.html is production source, not a published preview.

Storyboard/render approval is required separately for this new video. The three transcript confirmations and permission to explore effects do not approve final export. Preserve current storyboard hashes on approval. Prepare/measure the complete audio mix before the single visual render; final delivery is one 1080×1920/30fps H.264/AAC bt709 MP4 with -14 LUFS ±1 and master peak ≤-2 dBTP. Put intermediates under D: .sementara/visible. Actual encoded-file QA and manual normal-speed playback/listening remain for production; stills and geometric metrics cannot prove mask stability or artistic motion quality.

Private source, media and output folders stay local and are ignored by git. The local commit preserves source/data, not the large footage or matte.
