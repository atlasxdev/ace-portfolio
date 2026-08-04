/* eslint-disable @next/next/no-img-element -- These routes render to PNG
   server-side via Satori (next/og), not to the DOM. next/image cannot run
   inside ImageResponse; a plain <img> with an inlined data URI is correct
   here. See the getAvatar() helper below. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { DATA } from "@/data/resume";

// Deliberately NOT the edge runtime. Edge can't read from the filesystem, which
// forced the fonts and the avatar to be fetched over the network — the avatar
// was pulled from the live domain on every request, and a single failed fetch
// took the whole card down. Node runtime reads both off disk and lets this
// route prerender at build time.

export const alt = DATA.name;
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

// Satori needs the bytes, not a URL. Reading the local file and inlining it as
// a data URI keeps this route independent of the deployed site being reachable.
const getAvatar = async () => {
    if (!DATA.avatarUrl) return undefined;
    try {
        const file = DATA.avatarUrl.replace(/^\//, "");
        const bytes = await readPublic(file);
        const ext = file.split(".").pop()?.toLowerCase();
        const mime = ext === "png" ? "image/png" : "image/jpeg";
        return `data:${mime};base64,${bytes.toString("base64")}`;
    } catch (error) {
        console.error("Failed to load avatar:", error);
        return undefined;
    }
};

const styles = {
    outerWrapper: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        position: "relative",
    },
    middleWrapper: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        position: "relative",
        padding: "40px",
    },
    wrapper: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fafafa",
        position: "relative",
        padding: "40px",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
    },
    imageSection: {
        position: "absolute",
        top: "40px",
        left: "40px",
        display: "flex",
        alignItems: "center",
        zIndex: "2",
    },
    // Brand mark, opposite the avatar.
    monogram: {
        position: "absolute",
        top: "40px",
        right: "40px",
        width: "72px",
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#141414",
        color: "#fafafa",
        borderRadius: "16px",
        fontFamily: "Clash Display",
        fontSize: "31px",
        fontWeight: "600",
        letterSpacing: "-0.03em",
        zIndex: "2",
    },
    mainContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        height: "100%",
        width: "100%",
        position: "relative",
        zIndex: "1",
    },
    image: {
        width: "140px",
        height: "140px",
        borderRadius: "24px",
        border: "4px solid #e5e5e5",
        objectFit: "cover",
    },
    title: {
        fontFamily: "Clash Display",
        fontSize: "48px",
        fontWeight: "600",
        lineHeight: "1.1",
        textAlign: "left",
        color: "#000000",
        marginBottom: "16px",
        letterSpacing: "-0.02em",
        maxWidth: "900px",
    },
    description: {
        fontSize: "20px",
        fontWeight: "400",
        lineHeight: "1.5",
        textAlign: "left",
        maxWidth: "800px",
        color: "#404040",
        marginBottom: "32px",
        textWrap: "balance",
    },
} as const;

export default async function Image() {
    try {
        const fontData = await getFontData();
        const avatar = await getAvatar();

        return new ImageResponse(
            (
                <div style={styles.outerWrapper}>
                    <div style={styles.middleWrapper}>
                        <div style={styles.wrapper}>
                            {avatar && (
                                <div style={styles.imageSection}>
                                    <img src={avatar} alt={DATA.name} style={styles.image} />
                                </div>
                            )}
                            <div style={styles.monogram}>AG</div>
                            <div style={styles.mainContainer}>
                                <div style={styles.title}>{DATA.name}</div>
                                {DATA.description && (
                                    <div style={styles.description}>{DATA.description}</div>
                                )}
                            </div>
                        </div>
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
                            name: "Cabinet Grotesk",
                            data: fontData.cabinetGrotesk,
                            weight: 700,
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


