import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/chrome/Footer";
import { Markdown } from "@/components/chat/Markdown";
import { getAllSlugs, getProject } from "@/lib/projects";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Not found" };
  const { title, company } = project.frontmatter;
  return {
    title: `${title} — askhemanth`,
    description: `${title} · ${company}`,
  };
}

const STATUS_LABEL: Record<string, string> = {
  active: "active",
  "paper-trading": "paper-trading",
  completed: "completed",
};

function StatusPill({ status }: { status: string }) {
  const isActive = status === "active" || status === "paper-trading";
  const color = isActive
    ? "var(--color-accent)"
    : "var(--color-muted)";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="font-mono-label text-[var(--color-fg)]">
        {STATUS_LABEL[status] ?? status}
      </span>
    </span>
  );
}

function StackPill({ children }: { children: string }) {
  return (
    <span className="font-mono-label rounded-[3px] border border-[var(--color-border)] px-2 py-1 text-[var(--color-fg)]">
      {children}
    </span>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const fm = project.frontmatter;
  const hasGithub = fm.links?.github?.trim();
  const hasWriteup = fm.links?.writeup?.trim();

  return (
    <>
      <main className="relative flex flex-1 flex-col">
        <div className="sticky top-0 z-10 backdrop-blur-[2px]">
          <div className="mx-auto flex max-w-[960px] items-center justify-between px-6 py-4 md:px-10">
            <Link
              href="/"
              className="font-mono-label text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              ← askhemanth
            </Link>
            <Link
              href="/chat"
              className="font-mono-label text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              ask the agent
            </Link>
          </div>
        </div>

        <article className="mx-auto w-full max-w-[720px] px-6 pt-6 pb-16 md:px-10">
          <header className="flex flex-col gap-5 border-b border-[var(--color-border)] pb-10">
            <span className="font-mono-label text-[var(--color-muted)]">
              {fm.year}
              {fm.company ? ` · ${fm.company}` : ""}
            </span>
            <h1 className="text-display text-[var(--color-fg)]">{fm.title}</h1>

            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={fm.status} />
              {fm.stack.slice(0, 8).map((s) => (
                <StackPill key={s}>{s}</StackPill>
              ))}
            </div>

            {(hasGithub || hasWriteup) && (
              <div className="flex flex-wrap gap-3">
                {hasGithub && (
                  <a
                    href={fm.links!.github!}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono-label rounded-[4px] border border-[var(--color-border)] px-3 py-2 text-[var(--color-fg)] transition-colors hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface)]"
                  >
                    github ↗
                  </a>
                )}
                {hasWriteup && (
                  <a
                    href={fm.links!.writeup!}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono-label rounded-[4px] border border-[var(--color-border)] px-3 py-2 text-[var(--color-fg)] transition-colors hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface)]"
                  >
                    writeup ↗
                  </a>
                )}
              </div>
            )}

            {project.coverPublicPath && (
              <div className="mt-4 overflow-hidden rounded-[6px] border border-[var(--color-border)]">
                <Image
                  src={project.coverPublicPath}
                  alt={`${fm.title} cover`}
                  width={1280}
                  height={720}
                  className="h-auto w-full"
                />
              </div>
            )}
          </header>

          <div className="pt-8">
            <Markdown text={project.body} variant="prose" />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
