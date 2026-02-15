/**
 * Reusable Section Header - used across homepage sections.
 * Markup: sectionHeader (light) or sectionHeader sectionHeader--dark (dark bg)
 */
export default function SectionHeader({ title, subtitle, dark = false }) {
  return (
    <div className={`sectionHeader${dark ? " sectionHeader--dark" : ""}`}>
      <div className="sectionHeader__bar" />
      <h2 className="sectionHeader__title">{title}</h2>
      {subtitle && <p className="sectionHeader__subtitle">{subtitle}</p>}
    </div>
  );
}
