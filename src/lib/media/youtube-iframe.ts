const YOUTUBE_IFRAME_API = "https://www.youtube.com/iframe_api";

export const YOUTUBE_STATE = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
} as const;

export interface YouTubePlayerInstance {
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  destroy(): void;
}

let apiPromise: Promise<void> | null = null;

export function youtubeEmbedWithApi(embedUrl: string, autoplay = false): string {
  const url = new URL(embedUrl);
  url.searchParams.set("enablejsapi", "1");
  if (typeof window !== "undefined") {
    url.searchParams.set("origin", window.location.origin);
  }
  if (autoplay) url.searchParams.set("autoplay", "1");
  return url.toString();
}

export function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube iframe API requires a browser"));
  }

  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve();
      else {
        apiPromise = null;
        reject(new Error("YouTube iframe API failed to load"));
      }
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${YOUTUBE_IFRAME_API}"]`,
    );
    if (existing) {
      window.setTimeout(() => {
        if (window.YT?.Player) resolve();
      }, 0);
      return;
    }

    const script = document.createElement("script");
    script.src = YOUTUBE_IFRAME_API;
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error("YouTube iframe API failed to load"));
    };
    document.body.appendChild(script);
  });

  return apiPromise;
}

export function createYouTubePlayer(
  iframe: HTMLIFrameElement,
  events: {
    onReady?: () => void;
    onStateChange?: (state: number) => void;
  },
): YouTubePlayerInstance | null {
  if (!window.YT?.Player) return null;
  return new window.YT.Player(iframe, {
    events: {
      onReady: () => events.onReady?.(),
      onStateChange: (event) => events.onStateChange?.(event.data),
    },
  }) as YouTubePlayerInstance;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLIFrameElement,
        options: {
          events?: {
            onReady?: () => void;
            onStateChange?: (event: { data: number }) => void;
          };
        },
      ) => YouTubePlayerInstance;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}
