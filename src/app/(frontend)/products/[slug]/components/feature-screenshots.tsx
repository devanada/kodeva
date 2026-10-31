interface FeatureScreenshotsProps {
  productName: string;
  features: string[];
}

// Stand-ins for real product screenshots (dummy data per the brief); swap the gradient for next/image later.
function FeatureScreenshots({ productName, features }: FeatureScreenshotsProps) {
  return (
    <section aria-label={`Fitur ${productName}`} className='mt-10'>
      <h2 className='mb-4 text-xl font-semibold'>Fitur unggulan</h2>
      <ul className='-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0'>
        {features.map((feature, index) => (
          <li key={feature} className='w-64 shrink-0 snap-start sm:w-auto'>
            <div
              role='img'
              aria-label={`Tangkapan layar: ${feature}`}
              className='from-primary/20 to-primary/5 flex aspect-video items-end rounded-xl bg-gradient-to-br p-3'
            >
              <span className='bg-background/80 rounded px-2 py-0.5 text-xs'>Layar {index + 1}</span>
            </div>
            <p className='mt-2 text-sm'>{feature}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { FeatureScreenshots };
