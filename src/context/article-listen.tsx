import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface ArticleListenTrack {
  articleId: number | string;
  seed: number | string;
  url: string;
  title?: string;
  coverUrl?: string;
}

export interface ArticleListenEngine {
  toggle: () => void;
  pause: () => void;
}

interface ArticleListenContextValue {
  track: ArticleListenTrack | null;
  isPlaying: boolean;
  durationSeconds: number;
  durationKnown: boolean;
  isCurrent: (articleId: number | string) => boolean;
  start: (track: ArticleListenTrack) => void;
  toggle: () => void;
  close: () => void;
  bindEngine: (engine: ArticleListenEngine) => () => void;
  reportProgress: (isPlaying: boolean, duration?: number) => void;
}

const ArticleListenContext = createContext<ArticleListenContextValue | null>(
  null,
);

export function useArticleListen() {
  return useContext(ArticleListenContext);
}

export function ArticleListenProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<ArticleListenTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [durationKnown, setDurationKnown] = useState(false);
  const engineRef = useRef<ArticleListenEngine | null>(null);

  const isCurrent = useCallback(
    (articleId: number | string) =>
      track != null && String(track.articleId) === String(articleId),
    [track],
  );

  const start = useCallback((next: ArticleListenTrack) => {
    setTrack((current) => {
      if (current && String(current.articleId) === String(next.articleId)) {
        return current;
      }
      setIsPlaying(false);
      setDurationSeconds(0);
      setDurationKnown(false);
      return next;
    });
  }, []);

  const toggle = useCallback(() => {
    engineRef.current?.toggle();
  }, []);

  const close = useCallback(() => {
    engineRef.current?.pause();
    engineRef.current = null;
    setTrack(null);
    setIsPlaying(false);
    setDurationSeconds(0);
    setDurationKnown(false);
  }, []);

  const bindEngine = useCallback((engine: ArticleListenEngine) => {
    engineRef.current = engine;
    return () => {
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, []);

  const reportProgress = useCallback((playing: boolean, duration?: number) => {
    setIsPlaying(playing);
    if (duration != null && duration > 0) {
      setDurationSeconds(duration);
      setDurationKnown(true);
    }
  }, []);

  const value = useMemo(
    () => ({
      track,
      isPlaying,
      durationSeconds,
      durationKnown,
      isCurrent,
      start,
      toggle,
      close,
      bindEngine,
      reportProgress,
    }),
    [
      track,
      isPlaying,
      durationSeconds,
      durationKnown,
      isCurrent,
      start,
      toggle,
      close,
      bindEngine,
      reportProgress,
    ],
  );

  return (
    <ArticleListenContext.Provider value={value}>
      {children}
    </ArticleListenContext.Provider>
  );
}
