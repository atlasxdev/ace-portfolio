import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { remarkCodeMeta } from "./src/lib/remark-code-meta";

const posts = defineCollection({
    name: "posts",
    directory: "content",
    include: "**/*.mdx",
    schema: z.object({
        title: z.string(),
        publishedAt: z.string(),
        updatedAt: z.string().optional(),
        author: z.string().optional(),
        summary: z.string(),
        image: z.string().optional(),
        // On-page cover art. Separate from `image` on purpose: `image` feeds
        // openGraph/twitter, and overriding those would swap the generated
        // card — which carries the title and branding — for a bare photo.
        cover: z.string().optional(),
        content: z.string(),
        // Case-study frames. Optional: only the pieces of work with a real
        // before-and-after carry them, and a post without them renders exactly
        // as it did. Hiring managers read for these four beats, and in prose
        // they're spread across 900 words.
        problem: z.string().optional(),
        constraint: z.string().optional(),
        decision: z.string().optional(),
        outcome: z.string().optional(),
    }),
    transform: async (document, context) => {
        const mdx = await compileMDX(context, document, {
            remarkPlugins: [remarkGfm, remarkCodeMeta],
        });
        return {
        ...document,
            mdx,
        };
    },
});

export default defineConfig({
    collections: [posts],
});

