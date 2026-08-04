const COLLAGE_IMAGE = "/about/center-collage.png";

export function CenterDefinitionSection() {
  return (
    <section className="w-full overflow-hidden">
      <img
        src={COLLAGE_IMAGE}
        alt="تعريف المركز — أنشطة وفعاليات مركز الإعلام المجتمعي"
        className="h-auto w-full object-cover object-center"
        decoding="async"
      />
    </section>
  );
}
