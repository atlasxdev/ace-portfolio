import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { DATA } from "@/data/resume";

// Deliberately NOT the edge runtime. Edge can't read from the filesystem, which
// forced the fonts to be fetched over the network — a single failed fetch took
// the whole card down. Node runtime reads them off disk and lets this route
// prerender at build time.

export const alt = `${DATA.name} — Full-Stack & Automation Engineer`;
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

const readPublic = (...segments: string[]) =>
    readFile(join(process.cwd(), "public", ...segments));

const getFontData = async () => {
    try {
        const [cabinetGrotesk, clashDisplay] = await Promise.all([
            readPublic("fonts", "CabinetGrotesk-Medium.ttf"),
            readPublic("fonts", "ClashDisplay-Semibold.ttf"),
        ]);
        return { cabinetGrotesk, clashDisplay };
    } catch (error) {
        console.error("Failed to load fonts:", error);
        return null;
    }
};

// The site's dark-mode tokens (globals.css `.dark`). The card is always dark:
// it's shown inside other apps' chrome, where the site's own theme toggle
// doesn't reach, and the dark ground is what the site opens on.
const INK = {
    background: "#0e0e0e",
    card: "#141414",
    foreground: "#f2f2f2",
    muted: "#a8a8a8",
    faint: "#8f8f8f",
    rule: "#242424",
    available: "#d9a441",
};

// The four hues of #ambient. Satori has no `filter: blur`, so the field is
// built from soft-edged radial gradients instead — same colours, same corners.
const HUES = ["#3178c6", "#3ecf8e", "#d97757", "#ea4b71"] as const;

const ambient = [
    `radial-gradient(circle at 12% 8%, ${HUES[0]}55 0%, transparent 42%)`,
    `radial-gradient(circle at 92% 22%, ${HUES[1]}40 0%, transparent 38%)`,
    `radial-gradient(circle at 74% 96%, ${HUES[2]}55 0%, transparent 44%)`,
    `radial-gradient(circle at 18% 104%, ${HUES[3]}40 0%, transparent 36%)`,
].join(", ");

// Labels in the site are mono, uppercase, 0.12em tracked. There's no mono face
// on disk for Satori, so the tracking and case carry the look on their own.
const label = {
    fontFamily: "Cabinet Grotesk",
    fontSize: "18px",
    fontWeight: 400,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: INK.faint,
} as const;

export default async function Image() {
    try {
        const fontData = await getFontData();
        const host = new URL(DATA.url).host.replace(/^www\./, "");

        return new ImageResponse(
            (
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: INK.background,
                        backgroundImage: ambient,
                        padding: "56px 72px",
                        position: "relative",
                    }}
                >
                    {/* Top row: monogram + discipline label, host on the right */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                            <div
                                style={{
                                    width: "64px",
                                    height: "64px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: INK.card,
                                    border: `1px solid ${INK.rule}`,
                                    color: INK.foreground,
                                    borderRadius: "18px",
                                    fontFamily: "Clash Display",
                                    fontSize: "28px",
                                    fontWeight: 600,
                                    letterSpacing: "-0.03em",
                                }}
                            >
                                AG
                            </div>
                            <div style={label}>Full-stack · Automation · AI</div>
                        </div>
                        <div style={label}>{host}</div>
                    </div>

                    {/* Name + line, set like the hero */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            marginTop: "auto",
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "Clash Display",
                                fontSize: "124px",
                                fontWeight: 600,
                                lineHeight: 1,
                                letterSpacing: "-0.03em",
                                color: INK.foreground,
                            }}
                        >
                            {DATA.name}
                        </div>
                        <div
                            style={{
                                fontFamily: "Cabinet Grotesk",
                                fontSize: "32px",
                                lineHeight: 1.3,
                                color: INK.foreground,
                                marginTop: "28px",
                                maxWidth: "860px",
                            }}
                        >
                            I build production systems end-to-end, from the first stakeholder call to the thing running
                            in production.
                        </div>
                    </div>

                    {/* Footer rule: location on the left, availability on the right */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: "44px",
                            paddingTop: "24px",
                            borderTop: `1px solid ${INK.rule}`,
                        }}
                    >
                        <div style={label}>{`${DATA.location} · Open to remote`}</div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                fontFamily: "Cabinet Grotesk",
                                fontSize: "22px",
                                color: INK.available,
                            }}
                        >
                            <div
                                style={{
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "999px",
                                    backgroundColor: INK.available,
                                }}
                            />
                            Open to full-time and contract work
                        </div>
                    </div>

                    {/* Brand strip along the bottom edge */}
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: "6px",
                            display: "flex",
                        }}
                    >
                        {HUES.map((hue) => (
                            <div key={hue} style={{ flex: 1, backgroundColor: hue }} />
                        ))}
                    </div>
                </div>
            ),
            {
                ...size,
                fonts: fontData
                    ? [
                        {
                            name: "Cabinet Grotesk",
                            data: fontData.cabinetGrotesk,
                            weight: 400,
                            style: "normal",
                        },
                        {
                            name: "Clash Display",
                            data: fontData.clashDisplay,
                            weight: 600,
                            style: "normal",
                        },
                    ]
                    : undefined,
            }
        );
    } catch (error) {
        console.error("Error generating OpenGraph image:", error);
        return new Response(
            `Failed to generate image: ${error instanceof Error ? error.message : "Unknown error"}`,
            {
                status: 500,
            }
        );
    }
}
