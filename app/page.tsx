import { Wordmark } from "@/components/chrome/Wordmark";
import { StatusPill } from "@/components/chrome/StatusPill";
import { Footer } from "@/components/chrome/Footer";
import { HeroTile } from "@/components/bento/HeroTile";
import { NowTile } from "@/components/bento/NowTile";
import { RoleTile } from "@/components/bento/RoleTile";
import { GitHubTile } from "@/components/bento/GitHubTile";
import { ProjectsTile } from "@/components/bento/ProjectsTile";
import { ArticleTile } from "@/components/bento/ArticleTile";
import { SkillsTile } from "@/components/bento/SkillsTile";
import { ContactTile } from "@/components/bento/ContactTile";

export default function Home() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col gap-6 px-4 pt-6 md:px-8 md:pt-8 lg:px-10">
        <header className="flex items-center justify-between">
          <Wordmark />
          <StatusPill />
        </header>

        <section
          aria-label="Bento overview"
          className="grid grid-cols-1 gap-2 md:grid-cols-12 md:[grid-template-rows:auto_auto_auto_auto_auto] md:[grid-auto-rows:minmax(0,auto)]"
        >
          <HeroTile index={0} />
          <RoleTile index={1} />
          <NowTile index={2} />
          <GitHubTile index={3} />
          <ProjectsTile index={4} />
          <ArticleTile index={5} />
          <SkillsTile index={6} />
          <ContactTile index={7} />
        </section>
      </main>
      <Footer />
    </>
  );
}
