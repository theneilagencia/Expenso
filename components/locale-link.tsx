'use client';

import { Link } from '@/navigation';
import { ReactNode } from 'react';

interface LocaleLinkProps {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

export function LocaleLink({ href, className, style, children }: LocaleLinkProps) {
  return (
    <Link href={href as any} className={className} style={style}>
      {children}
    </Link>
  );
}
