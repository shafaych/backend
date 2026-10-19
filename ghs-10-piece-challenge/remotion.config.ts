import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setPixelFormat("yuv420p");
// Use a locally installed Chromium when set (offline / CI). Falls back to Remotion's managed browser.
if (process.env.CHROME_PATH) Config.setBrowserExecutable(process.env.CHROME_PATH);
