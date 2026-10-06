import { Composition } from "remotion";
import { AdmissionsDemo, ADMISSIONS_DURATION } from "./admissions/AdmissionsDemo";

export const Root = () => (
  <Composition
    id="AdmissionsDemo"
    component={AdmissionsDemo}
    durationInFrames={ADMISSIONS_DURATION}
    fps={30}
    width={1920}
    height={1080}
  />
);
