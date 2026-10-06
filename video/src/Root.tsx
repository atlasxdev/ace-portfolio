import { Composition } from "remotion";
import { AdmissionsDemo, ADMISSIONS_DURATION } from "./admissions/AdmissionsDemo";
import { AgTikTok, AG_TIKTOK_DURATION } from "./ag/AgTikTok";
import { DmaDemo, DMA_DURATION } from "./dma/DmaDemo";
import { SisDemo, SIS_DURATION } from "./sis/SisDemo";

const film = { fps: 30, width: 1920, height: 1080 } as const;

export const Root = () => (
  <>
    <Composition id="AdmissionsDemo" component={AdmissionsDemo} durationInFrames={ADMISSIONS_DURATION} {...film} />
    <Composition id="SisDemo" component={SisDemo} durationInFrames={SIS_DURATION} {...film} />
    <Composition id="DmaDemo" component={DmaDemo} durationInFrames={DMA_DURATION} {...film} />
    {/* Vertical, for TikTok. */}
    <Composition id="AgTikTok" component={AgTikTok} durationInFrames={AG_TIKTOK_DURATION} fps={30} width={1080} height={1920} />
  </>
);
