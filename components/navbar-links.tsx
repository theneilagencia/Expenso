'use client';

import { Link } from '@/navigation';

export function NavbarLinks() {
  return (
    <nav className="hidden md:flex items-center gap-6">
      <Link 
        href="/pricing" 
        className="text-sm text-white/70 hover:text-white transition-colors"
      >
        Pricing
      </Link>
      <Link 
        href="/addons" 
        className="text-sm text-white/70 hover:text-white transition-colors"
      >
        Addons
      </Link>
      <Link 
        href="/contact" 
        className="text-sm text-white/70 hover:text-white transition-colors"
      >
        Contact
      </Link>
    </nav>
  );
}
