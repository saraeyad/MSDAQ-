const COLLAGE_IMAGE = "/about/center-collage.png";

export function CenterDefinitionSection({ alt }: { alt: string }) {
  return (
    <section className="w-full overflow-hidden">
      <img
        src={COLLAGE_IMAGE}
        alt={alt}
        className="h-auto w-full object-cover object-center"
        decoding="async"
      />
    </section>
  );
}
