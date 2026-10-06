import { DATA } from "@/data/resume";
import { FilmFan, type Film } from "@/components/film-fan";

/**
 * The homepage's Projects section: launch films for the projects that have
 * one (`DATA.projects[].video`, built in /video with Remotion), shown as a
 * fan. The front film plays, the rest are posters tilted behind it, and
 * picking one swings it to the front. Only the front card ever loads video.
 * The full list lives on /projects.
 */
const FILMS: Film[] = DATA.projects.flatMap((p) =>
  p.video
    ? [{ title: p.title, src: p.video.src, poster: p.video.poster, blurb: p.video.blurb, link: p.links[0] }]
    : [],
);

/*
 * Search engines only see the front film as a <video>; the rest are posters
 * until picked. So every film is also described as a VideoObject (the same
 * facts the sitemap lists), which is what makes them eligible for video
 * results: title, description, thumbnail, file, duration and upload date.
 */
const abs = (path: string) => `${DATA.url}${path}`;
const VIDEO_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": DATA.projects.flatMap((p) =>
    p.video
      ? [
          {
            "@type": "VideoObject",
            name: `${p.title}: launch film`,
            description: `${p.video.blurb} The film shows ${p.video.shows}`,
            thumbnailUrl: abs(p.video.poster),
            contentUrl: abs(p.video.src),
            uploadDate: p.video.uploadDate,
            duration: `PT${p.video.duration}S`,
            inLanguage: "en",
            creator: { "@type": "Person", name: DATA.name, url: DATA.url },
          },
        ]
      : [],
  ),
}).replace(/</g, "\\u003c");

export function ProjectFilms() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: VIDEO_LD }} />
      <FilmFan films={FILMS} />
    </>
  );
}
