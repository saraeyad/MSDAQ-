/** Native lazy-load unless this image is the visible LCP cover. */
export function imageLoadProps(priority = false) {
  return priority
    ? {
        loading: "eager" as const,
        fetchPriority: "high" as const,
        decoding: "async" as const,
      }
    : {
        loading: "lazy" as const,
        fetchPriority: "low" as const,
        decoding: "async" as const,
      };
}
