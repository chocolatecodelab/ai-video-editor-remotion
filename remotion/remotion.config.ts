import { Config } from "@remotion/cli/config";

// Hanya untuk CLI/Studio (npm run studio/render). Pipeline Python merender lewat render-server.mjs (Node API),
// yang TIDAK membaca file ini — setelan overlay (PNG → ProRes 4444 ber-alpha, bt709) ditulis eksplisit di sana.
Config.setVideoImageFormat("png");
Config.setColorSpace("bt709");
Config.setOverwriteOutput(true);
