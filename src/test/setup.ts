import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom has no ResizeObserver, which Recharts' ResponsiveContainer requires.
globalThis.ResizeObserver = class {
  observe(): void {/* no-op in jsdom */}
  unobserve(): void {/* no-op in jsdom */}
  disconnect(): void {/* no-op in jsdom */}
} as unknown as typeof ResizeObserver;

// Unmount React trees and reset storage between tests for full isolation.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
