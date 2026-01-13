/* eslint-disable @typescript-eslint/no-explicit-any */
function combinedSignal({
  parent,
  timeoutMs,
}: {
  parent?: AbortSignal;
  timeoutMs: number;
}): { signal: AbortSignal; cleanup: () => void } {
  // Prefer native AbortSignal.any/timeout when available
  const Any: any = AbortSignal as any;
  if (Any?.any && (AbortSignal as any)?.timeout) {
    const timeout = (AbortSignal as any).timeout(timeoutMs);
    const signal = Any.any(parent ? [parent, timeout] : [timeout]);
    // nothing to clean when using native combinators
    return { signal, cleanup: () => {} };
  }

  // Fallback: manual controller
  const controller = new AbortController();

  // forward parent abort
  const onParentAbort = () => controller.abort();
  if (parent) parent.addEventListener("abort", onParentAbort);

  // timeout
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // cleanup hook
  const cleanup = () => {
    clearTimeout(timer);
    if (parent) parent.removeEventListener("abort", onParentAbort);
  };

  return { signal: controller.signal, cleanup };
}

export default combinedSignal;
