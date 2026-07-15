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
              <Link href="/about" className="hover:text-accent">
                The Gallery Function
              </Link>
            </li>
            <li>
              <Link href="/our-story" className="hover:text-accent">
                Our Story
              </Link>
            </li>
            <li>
              <Link href="/toolkit" className="hover:text-accent">
                Musician Toolkit
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
