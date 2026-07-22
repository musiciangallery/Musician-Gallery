import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-rule px-6 md:px-[52px] py-12">
      <div className="grid md:grid-cols-3 gap-10 pb-10">
        <div>
          <p className="font-serif text-lg">Musician Gallery</p>
          <p className="text-xs text-mid mt-2">
            A home for Aotearoa, New Zealand musicians
          </p>
          <div className="flex items-center gap-4 mt-5">
            <a
              href="mailto:contact@musiciangallery.co.nz"
              aria-label="Email Musician Gallery"
              className="text-mid hover:text-accent transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" />
                <path d="M3 6.5l9 6.5 9-6.5" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/musiciangallery_nz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Musician Gallery on Instagram"
              className="text-mid hover:text-accent transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61591558377661"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Musician Gallery on Facebook"
              className="text-mid hover:text-accent transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.5v-7.5h2.7l.5-3.5h-3.2V7.8c0-.98.42-1.55 1.62-1.55H15V3z" />
              </svg>
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-[10px] tracking-[0.18em] uppercase text-mid mb-3">
            Platform
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/gallery" className="hover:text-accent">
                Browse Musicians
              </Link>
            </li>
            <li>
              <Link href="/join" className="hover:text-accent">
                Join
              </Link>
            </li>
            <li>
              <Link href="/toolkit" className="hover:text-accent">
                Musician Toolkit
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-accent">
                The Gallery Function
              </Link>
            </li>
            <li>
              <Link href="/our-story" className="hover:text-accent">
                Our Story
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] tracking-[0.18em] uppercase text-mid mb-3">
            Contact
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="mailto:contact@musiciangallery.co.nz" className="hover:text-accent">
                contact@musiciangallery.co.nz
              </a>
            </li>
            <li>
              <Link href="/terms" className="hover:text-accent">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-accent">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-2 border-t border-rule pt-6 text-xs text-mid">
        <p>&copy; 2026 Musician Gallery &middot; Aotearoa, New Zealand</p>
        <a href="mailto:contact@musiciangallery.co.nz" className="hover:text-accent">
          contact@musiciangallery.co.nz
        </a>
      </div>
    </footer>
  );
}
