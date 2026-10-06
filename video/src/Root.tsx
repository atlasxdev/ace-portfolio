import { Composition } from "remotion";
import { AdmissionsDemo, ADMISSIONS_DURATION } from "./admissions/AdmissionsDemo";
import { SisDemo, SIS_DURATION } from "./sis/SisDemo";

const film = { fps: 30, width: 1920, height: 1080 } as const;

export const Root = () => (
  <>
    <Composition id="AdmissionsDemo" component={AdmissionsDemo} durationInFrames={ADMISSIONS_DURATION} {...film} />
    <Composition id="SisDemo" component={SisDemo} durationInFrames={SIS_DURATION} {...film} />
  </>
);
