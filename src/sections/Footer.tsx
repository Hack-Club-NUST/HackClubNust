import HackClubLogo from '../components/HackClubLogo';
import { VIDEOS } from '../videos';

const SOCIALS = [
  { icon: 'bi-facebook', handle: 'hackclub.nust', href: 'https://facebook.com/hackclub.nust' },
  { icon: 'bi-instagram', handle: 'hackclub.nust', href: 'https://instagram.com/hackclub.nust' },
  {
    icon: 'bi-linkedin',
    handle: 'hackclub-nust',
    href: 'https://linkedin.com/company/hackclub-nust',
  },
];

const WHATSAPP_INVITE = 'https://chat.whatsapp.com/CU9yIl3Ok7pDf5niG4D65U';

export default function Footer() {
  return (
    <footer id="club" className="relative flex min-h-[400px] w-full flex-col overflow-hidden bg-ink md:flex-row">
      <div className="relative h-[300px] w-full md:h-auto md:w-1/2">
        <video
          src={VIDEOS.footer}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-brand-grad opacity-25 mix-blend-overlay" />
      </div>

      <div className="flex w-full flex-col justify-between p-10 sm:p-16 md:w-1/2">
        <div>
          <div className="mb-8 flex items-center gap-2.5 text-white/70">
            <HackClubLogo size={18} />
            <span className="text-[15px] font-medium tracking-tight text-white/70">
              Hack Club NUST
            </span>
          </div>

          <p className="max-w-sm text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            A student-run hack club at NUST. We build in public, break things on purpose, and ship
            games nobody asked for.
          </p>

          <a
            href={WHATSAPP_INVITE}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex h-11 items-center gap-2.5 rounded-full bg-brand-grad px-5 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(235,69,84,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <i className="bi bi-whatsapp text-[16px]" aria-hidden="true" />
            Join our WhatsApp community
          </a>

          <ul className="mt-6 flex flex-col gap-3">
            {SOCIALS.map((social) => (
              <li key={social.icon}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 text-[13px] text-white/40 transition-colors hover:text-brand"
                >
                  <i className={`bi ${social.icon} text-[15px]`} aria-hidden="true" />
                  {social.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-12 text-[12px] text-white/25">
          © 2026 Hack Club NUST. Built by students, in the open.
        </p>
      </div>
    </footer>
  );
}
