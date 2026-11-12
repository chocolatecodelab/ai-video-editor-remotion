# GROWING MEANS / HyperFrames

Brand: `panduan/NAZARVERSE_BRAND.md`. Storyboard bilingual approved by the user: “ya jalankan render finalnya”. English main captions, Indonesian secondary.

Final pipeline: `produce.py` builds audio master and RVM alpha from the actual footage, replacing storyboard PNG pilots in the composition. `hf.ps1 check` validates production; `hf.ps1 render` outputs one final MP4. `verify_final.py` checks decoding, format, audio and creates actual-export contact sheets.

Do not run `build_storyboard.py` after production unless intentionally returning to the storyboard: it uses still mask pilots. `produce.py` expects storyboard HTML as input, so deliberate regeneration is required for another production cycle. Do not rerender the approved result without a user request.

Alpha processing is per frame for visible talent: 0–6.6s and 35–43.4s. The ending segment starts its recurrent warmup at 34s. Hidden graphic-only frames are transparent, not an interpolation of visible masks. Source resolution 478×850 limits fine hair detail. Master audio contains the source narration and a quiet original synthesized ambient bed; no third-party music.

Source media, large alpha and audio assets remain local. `out/qa-final.json` records measurements and limits; still review is not a full headphone/playback review. No claim of perfect mask edges on all frames.
