const COLLAGE_IMAGE = "/about/center-collage.webp";

export function CenterDefinitionSection({ alt }: { alt: string }) {
  return (
    <section className="container-page py-6">
      <img
        src={COLLAGE_IMAGE}
        alt={alt}
        width={1024}
        height={550}
        className="mx-auto h-auto w-full max-w-5xl rounded-2xl object-contain object-center"
        decoding="async"
      />
    </section>
  );
}
