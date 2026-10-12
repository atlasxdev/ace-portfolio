import { Composition } from "remotion";
import { AdmissionsDemo, ADMISSIONS_DURATION } from "./admissions/AdmissionsDemo";
import { AgTikTok, AG_TIKTOK_DURATION } from "./ag/AgTikTok";
import { DmaDemo, DMA_DURATION } from "./dma/DmaDemo";
import { MarginaliaDemo, MARGINALIA_DURATION } from "./marginalia/MarginaliaDemo";
import { MarginaliaNotes, MARGINALIA_NOTES_DURATION } from "./marginalia/MarginaliaNotes";
import { SisDemo, SIS_DURATION } from "./sis/SisDemo";

const film = { fps: 30, width: 1920, height: 1080 } as const;

export const Root = () => (
  <>
    <Composition id="AdmissionsDemo" component={AdmissionsDemo} durationInFrames={ADMISSIONS_DURATION} {...film} />
    <Composition id="SisDemo" component={SisDemo} durationInFrames={SIS_DURATION} {...film} />
    <Composition id="DmaDemo" component={DmaDemo} durationInFrames={DMA_DURATION} {...film} />
    <Composition id="MarginaliaDemo" component={MarginaliaDemo} durationInFrames={MARGINALIA_DURATION} {...film} />
    {/* Vertical, for TikTok. */}
    {/* 4:5: TikTok letterboxes it, so its own UI sits on black, not over the film. */}
    <Composition id="MarginaliaTikTok" component={MarginaliaNotes} durationInFrames={MARGINALIA_NOTES_DURATION} fps={30} width={1080} height={1350} />
    {/* The same story at 16:9, for Facebook. */}
    <Composition id="MarginaliaWide" component={MarginaliaNotes} defaultProps={{ wide: true }} durationInFrames={MARGINALIA_NOTES_DURATION} {...film} />
    <Composition id="AgTikTok" component={AgTikTok} durationInFrames={AG_TIKTOK_DURATION} fps={30} width={1080} height={1920} />
  </>
);
