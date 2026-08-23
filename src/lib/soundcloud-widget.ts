const SOUNDCLOUD_WIDGET_SCRIPT = "https://w.soundcloud.com/player/api.js";

const SOUNDCLOUD_PLAYER =
  "https://w.soundcloud.com/player/?url={url}&color=%23f98c34&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false";

let scriptPromise: Promise<void> | null = null;

export interface SoundCloudWidgetInstance {
  bind(
    event: string,
    callback: (data?: { currentPosition?: number }) => void,
  ): void;
  play(): void;
  pause(): void;
  toggle(): void;
  seekTo(ms: number): void;
  getDuration(callback: (ms: number) => void): void;
  getPosition(callback: (ms: number) => void): void;
}

export function buildSoundCloudWidgetUrl(pageUrl: string): string {
  return SOUNDCLOUD_PLAYER.replace("{url}", encodeURIComponent(pageUrl));
}

export function isSoundCloudPageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  try {
    const host = new URL(url.trim()).hostname.replace(/^www\./, "").toLowerCase();
    return host === "soundcloud.com" || host === "on.soundcloud.com";
  } catch {
    return false;
  }
}

export function loadSoundCloudWidgetApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("SoundCloud widget requires a browser"));
  }

  if (window.SC?.Widget) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SOUNDCLOUD_WIDGET_SCRIPT}"]`,
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("SoundCloud widget failed to load")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = SOUNDCLOUD_WIDGET_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("SoundCloud widget failed to load"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export function createSoundCloudWidget(
  iframe: HTMLIFrameElement,
): SoundCloudWidgetInstance | null {
  if (!window.SC?.Widget) return null;
  return window.SC.Widget(iframe) as SoundCloudWidgetInstance;
}

declare global {
  interface Window {
    SC?: {
      Widget: {
        (iframe: HTMLIFrameElement): SoundCloudWidgetInstance;
        Events: {
          READY: string;
          PLAY: string;
          PAUSE: string;
          PLAY_PROGRESS: string;
          FINISH: string;
        };
      };
    };
  }
}
