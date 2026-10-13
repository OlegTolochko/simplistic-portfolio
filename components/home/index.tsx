import Link from "next/link";
import { IBM_Plex_Mono, Newsreader } from "next/font/google";

import ConvexMesh from "@/components/convex-mesh";
import {
  education,
  honours,
  isExternal,
  otherProjects,
  period,
  positions,
  profile,
  projects,
  publications,
  publicationsNote,
  type Link as SiteLink,
  type Project,
} from "@/content/site";
import s from "./home.module.css";

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--serif",
});
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400"], variable: "--mono" });

function A({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  if (isExternal(href) || href.endsWith(".pdf")) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function LinkRow({ links }: { links: SiteLink[] }) {
  if (links.length === 0) return null;
  return (
    <p className={s.links}>
      {links.map((l) => (
        <A key={l.href} href={l.href}>
          [{l.label.toLowerCase()}]
        </A>
      ))}
    </p>
  );
}

function Thumb({ project }: { project: Project }) {
  if (project.image?.endsWith(".bin")) {
    return (
      <div className={s.thumb}>
        <ConvexMesh
          src={project.image}
          poster={project.image.replace(/\.bin$/, ".webp")}
          label={project.imageAlt ?? project.title}
          className={s.canvas}
        />
      </div>
    );
  }
  if (!project.image) return <div className={s.thumb} />;
  return (
    <div className={s.thumb}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={project.image} alt={project.imageAlt ?? ""} loading="lazy" width={960} height={640} />
    </div>
  );
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function Home() {
  const stamp = `${profile.domain}  [cs.CV]  ${formatDate(new Date())}`;

  return (
    <div className={`${s.root} ${serif.variable} ${mono.variable}`}>
      <div className={s.stamp} aria-hidden>
        {stamp}
      </div>

      <main className={s.page}>
        <header className={s.titleBlock}>
          <h1 className={s.title}>{profile.name}</h1>
          <p className={s.affiliations}>
            Technical University of Munich<sup>1</sup>
            <span className={s.sep} />
            University of Cambridge<sup>2</sup>
          </p>
          <p className={s.contact}>
            <a href={`mailto:${profile.email}`} className={s.email}>
              {profile.email}
            </a>
          </p>
          <p className={s.contact}>
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <span className={s.dot}>·</span>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </p>
        </header>

        <figure className={s.teaser}>
          <div className={s.teaserImages}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.photos.portrait} alt="Portrait of Oleg Tolochko" width={960} height={1200} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.photos.casual}
              alt="Oleg wearing a blue IKEA bucket hat that covers one eye"
              width={960}
              height={1200}
            />
          </div>
          <figcaption>
            <b>Figure 1.</b> Left: the author. Right: also the author.
          </figcaption>
        </figure>

        <section className={s.abstract} aria-labelledby="abstract">
          <h2 id="abstract">Abstract</h2>
          {profile.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>

        <section className={s.section} aria-labelledby="publications">
          <h2 id="publications">
            <span>1.</span> Publications
          </h2>
          {publications.length === 0 ? (
            <p className={s.empty}>{publicationsNote}</p>
          ) : (
            <ol className={s.refs}>
              {publications.map((p, i) => (
                <li key={p.title}>
                  <span className={s.refNo}>[{i + 1}]</span>
                  <span>
                    {p.authors.map((a, k) => (
                      <span key={a}>
                        {a === profile.name ? <b>{a}</b> : a}
                        {k < p.authors.length - 1 ? ", " : ". "}
                      </span>
                    ))}
                    {p.title}. <i>{p.venue}</i>, {p.year}.{" "}
                    {p.links.map((l) => (
                      <A key={l.href} href={l.href}>
                        [{l.label.toLowerCase()}]
                      </A>
                    ))}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className={s.section} aria-labelledby="research">
          <h2 id="research">
            <span>2.</span> Research and projects
          </h2>
          <div className={s.projects}>
            {projects.map((p) => (
              <article key={p.slug} className={s.project}>
                <Thumb project={p} />
                <div className={s.projectText}>
                  <h3>{p.title}</h3>
                  <p className={s.venue}>
                    {p.context}, {period(p.period)}
                    {p.status ? <span className={s.status}> · {p.status}</span> : null}
                  </p>
                  <p className={s.summary}>{p.summary}</p>
                  <LinkRow links={p.links} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={s.section} aria-labelledby="education">
          <h2 id="education">
            <span>3.</span> Education and positions
          </h2>
          <figure className={s.tableWrap}>
            <figcaption>
              <b>Table 1.</b> Degrees and research positions, most recent first.
            </figcaption>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Degree / role</th>
                  <th>Institution</th>
                </tr>
              </thead>
              <tbody>
                {education.map((e) => (
                  <tr key={e.degree}>
                    <td className={s.num}>{period(e.period, "now")}</td>
                    <td>
                      {e.degree}
                      <span className={s.instInline}>{e.institution}</span>
                      {e.detail ? <span className={s.detail}>{e.detail}</span> : null}
                    </td>
                    <td>{e.institution}</td>
                  </tr>
                ))}
              </tbody>
              <tbody className={s.group}>
                {positions.map((p) => (
                  <tr key={p.organisation}>
                    <td className={s.num}>{period(p.period, "now")}</td>
                    <td>
                      {p.role}
                      <span className={s.instInline}>{p.organisation}</span>
                    </td>
                    <td>{p.organisation}</td>
                  </tr>
                ))}
                {honours.map((h) => (
                  <tr key={h.title}>
                    <td className={s.num}>{h.year}</td>
                    <td>
                      Scholarship
                      <span className={s.instInline}>{h.title}</span>
                    </td>
                    <td>{h.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
        </section>

        <footer className={s.footnotes}>
          <hr />
          <p className={s.footHead}>Side projects</p>
          {otherProjects.map((o, i) => (
            <p key={o.href}>
              <sup>{String.fromCharCode(97 + i)}</sup>
              <A href={o.href}>{o.label}</A>: {o.note} ({o.year}).
            </p>
          ))}
          <p className={s.colophon}>
            <span>© {new Date().getFullYear()} {profile.name}</span>
            <Link href="/impressum">Impressum</Link>
          </p>
          <p className={s.pageNo}>1</p>
        </footer>
      </main>
    </div>
  );
}
