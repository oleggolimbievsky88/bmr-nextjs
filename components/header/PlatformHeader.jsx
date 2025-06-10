export default function PlatformHeader({
  platformData,
  title = "Select a category to shop through our latest selection of Suspension & Chassis Partss",
  subtitle,
}) {
  if (!platformData) return null;

  // Format the year display
  const yearDisplay =
    platformData.StartYear === platformData.EndYear
      ? platformData.StartYear
      : `${platformData.StartYear}-${platformData.EndYear}`;

  console.log("platformData.HeaderImage", platformData.HeaderImage);

  const headerStyle = {
    backgroundImage: platformData.HeaderImage
      ? `url(${encodeURI(platformData.HeaderImage)})`
      : "none",
    backgroundSize: "100% 100%",
    backgroundPosition: "top center",
    backgroundRepeat: "no-repeat",
    minHeight: "200px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  };

  return (
    <div style={{ backgroundColor: "#000", padding: "0px" }}>
      <div style={headerStyle}>
        <div className="container">
          <div
            className="heading text-center"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.97)",
              padding: "10px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              margin: "20px",
            }}
          >
            {platformData.Image && (
              <img
                src={encodeURI(
                  `https://bmrsuspension.com/siteart/cars/${platformData.Image}`
                )}
                alt={platformData.Name}
                style={{ width: "95px", height: "60px", marginBottom: "10px" }}
              />
            )}
            <h1 className="mb-0 header-main-title">
              {yearDisplay} {platformData.Name}
            </h1>
            <p
              className="text-center mt-2 mb-3"
              style={{ color: "#666", fontSize: "1.5rem" }}
            >
              {subtitle || title}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
