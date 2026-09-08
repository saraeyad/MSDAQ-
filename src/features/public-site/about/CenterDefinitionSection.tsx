const COLLAGE_IMAGE = "/about/center-collage.png";

export function CenterDefinitionSection({ alt }: { alt: string }) {
  return (
    <section className="container-page overflow-hidden py-6">
      <img
        src={COLLAGE_IMAGE}
        alt={alt}
        className="mx-auto h-auto w-full max-w-5xl rounded-2xl object-cover object-center"
        decoding="async"
      />
    </section>
  );
}
