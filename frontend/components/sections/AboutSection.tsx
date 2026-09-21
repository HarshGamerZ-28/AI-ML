import Reveal from "@/components/Reveal";

const PILLARS = [
  ["01", "Learn in the open", "Every session is recorded and every notebook is pushed. Nobody restarts from scratch."],
  ["02", "Ship over theory", "A working demo beats a finished playlist. Squads present at the end of every semester."],
  ["03", "Teach what you learn", "Seniors run the workshops. Explaining it is how you find out whether you understood it."],
  ["04", "Open to everyone", "No screening, no fees, no branch requirement. Curiosity is the only filter."],
];

const STATS = [["240+", "Active members"], ["38", "Sessions run"], ["17", "Projects shipped"], ["6", "Hackathon wins"]];

export default function AboutSection() {
  return (
    <section id="about" className="scroll-mt-28 py-24">
      <div className="mx-auto w-[90%] max-w-[1180px]">
        <Reveal className="mb-10 max-w-2xl">
          <span className="eyebrow">About the club</span>
          <h2 className="font-display text-4xl">A campus lab for people who&apos;d rather build than watch</h2>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <Reveal className="grid gap-4 text-ink-dim">
            <p>AIML Club began with a handful of second-year students meeting in a lab after hours to work through a machine learning course together. It grew because the format worked: learn something, build something small with it, show it to everyone, repeat.</p>
            <p>We run on a semester rhythm — foundation workshops for newcomers, project squads that ship by the end of term, paper circles, hackathon prep nights, and alumni talks in between.</p>
            <p>There&apos;s no entrance test and no attendance register. Members come from CS, IT, ECE and beyond, across all four years.</p>
          </Reveal>

          <div className="grid gap-3">
            {PILLARS.map(([n, title, desc], i) => (
              <Reveal key={n} delay={i * 0.06} className="glass flex gap-4 p-5">
                <span className="font-display text-xl text-lilac">{n}</span>
                <div><h3 className="font-medium">{title}</h3><p className="mt-1 text-sm text-ink-faint">{desc}</p></div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map(([value, label], i) => (
            <Reveal key={label} delay={i * 0.05} className="glass p-6 text-center">
              <div className="font-display text-3xl iris-text">{value}</div>
              <div className="mt-1 text-xs uppercase tracking-[.08em] text-ink-faint">{label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
