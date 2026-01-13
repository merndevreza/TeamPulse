/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
import "whatwg-fetch";

// --- Mock next/image to behave like a normal <img> ---
import React from "react";
vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) => {
    return React.createElement("img", props);
  },
}));

// --- Mock next/link to render a normal <a> for RTL clicks ---
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children?: React.ReactNode;
  }) => React.createElement("a", { href, ...rest }, children),
}));

// --- Mock lottie-react to avoid rendering complexities ---
vi.mock('lottie-react', () => ({
  default: (props: any) => React.createElement('div', { 'data-testid': 'mock-lottie', ...props }),
}));


(globalThis as any).ResizeObserver = class MockResizeObserver
  implements ResizeObserver
{
  private callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(_target: Element, _options?: ResizeObserverOptions) {
    // Mock observe method
  }
  unobserve(_target: Element) {
    // Mock unobserve method
  }
  disconnect() {
    // Mock disconnect method
  }
  takeRecords(): ResizeObserverEntry[] {
    return [];
  }
};

// --- Minimal mocks for App Router navigation APIs ---
vi.mock("next/navigation", () => {
  const push = vi.fn();
  const replace = vi.fn();
  const back = vi.fn();
  const forward = vi.fn();
  const refresh = vi.fn();
  const prefetch = vi.fn();

  return {
    useRouter: () => ({
      push,
      replace,
      back,
      forward,
      refresh,
      prefetch,
      // pathname & query are useful in tests
      pathname: "/",
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  };
});

// --- Minimal mocks for headers/cookies if your components use them ---
vi.mock("next/headers", () => {
  return {
    headers: () => new Headers(),
    cookies: () => ({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn().mockReturnValue([]),
    }),
  };
});

// If you write tests that hit /api/* or external URLs, enable this.
// Comment out if you don't need it yet.
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { setupServer } from "msw/node";

export const mswServer = setupServer();
beforeAll(() => mswServer.listen({ onUnhandledRequest: "warn" }));
afterEach(() => mswServer.resetHandlers());
afterAll(() => mswServer.close());
