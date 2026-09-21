import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-[3] mt-16 border-t border-white/[0.08] py-14">
      <div className="mx-auto w-[90%] max-w-[1180px]">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-2 font-bold">AIML Club <small className="block text-[.72rem] font-medium text-ink-dim">GEC Ajmer</small></div>
            <p className="text-[.92rem] text-ink-dim">Government Engineering College, Badliya Circle, Ajmer, Rajasthan 305025.</p>
          </div>
          <div>
            <h4 className="mb-3 text-[.73rem] font-semibold uppercase tracking-[.2em] text-ink-faint">Explore</h4>
            <ul className="grid gap-2 text-[.92rem] text-ink-dim">
              <li><Link href="/#events" className="hover:text-white">Events</Link></li>
              <li><Link href="/#gallery" className="hover:text-white">Gallery</Link></li>
              <li><Link href="/#team" className="hover:text-white">Team</Link></li>
              <li><Link href="/#projects" className="hover:text-white">Projects</Link></li>
              <li><Link href="/#achievements" className="hover:text-white">Achievements</Link></li>
              <li><Link href="/#notices" className="hover:text-white">Notices</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-[.73rem] font-semibold uppercase tracking-[.2em] text-ink-faint">Get involved</h4>
            <ul className="grid gap-2 text-[.92rem] text-ink-dim">
              <li><Link href="/#join" className="hover:text-white">Join the club</Link></li>
              <li><a href="mailto:aimlclub@ecajmer.ac.in" className="hover:text-white">aimlclub@ecajmer.ac.in</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-2 border-t border-white/[0.08] pt-5 text-[.83rem] text-ink-faint">
          <span>© {new Date().getFullYear()} AIML Club, GEC Ajmer.</span>
          <span>Built by the club.</span>
        </div>
      </div>
    </footer>
  );
}
