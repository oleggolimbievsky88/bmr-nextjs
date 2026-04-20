import SplitHeroBanner from "./SplitHeroBanner";

/**
 * Renders brand-driven homepage marketing blocks (e.g. split hero for Heidts).
 */
export default function HomeMarketingSections({ brand }) {
  const sections = Array.isArray(brand?.homepageSections)
    ? brand.homepageSections
    : [];
  if (sections.length === 0) return null;

  return (
    <div className="brand-home-marketing">
      {sections.map((section, i) => {
        if (section?.type === "splitHero") {
          return (
            <SplitHeroBanner
              key={`${section.type}-${i}`}
              section={section}
              brand={brand}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
