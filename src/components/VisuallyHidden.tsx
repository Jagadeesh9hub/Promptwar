import type { ReactNode } from 'react';

interface VisuallyHiddenProps {
  children: ReactNode;
}

/** Renders content for screen readers only (hidden visually via the .sr-only class). */
export function VisuallyHidden({ children }: VisuallyHiddenProps): JSX.Element {
  return <span className="sr-only">{children}</span>;
}
