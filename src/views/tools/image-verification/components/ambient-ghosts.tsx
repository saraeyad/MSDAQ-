const GHOST_URLS = [
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=120&h=80&fit=crop",
  "https://images.unsplash.com/photo-1495020689067-379b3ac09acb?w=120&h=80&fit=crop",
  "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=120&h=80&fit=crop",
];

export default function AmbientGhosts() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {GHOST_URLS.map((url, index) => (
        <div
          key={url}
          className="image-verification-ghost absolute rounded-lg opacity-[0.04] blur-sm"
          style={{
            width: 100 + index * 20,
            height: 70 + index * 10,
            top: `${15 + index * 25}%`,
            insetInlineStart: `${10 + index * 30}%`,
            animationDelay: `${index * 4}s`,
            backgroundImage: `url(${url})`,
            backgroundSize: "cover",
          }}
        />
      ))}
    </div>
  );
}
