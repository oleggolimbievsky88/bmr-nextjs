export default function PlatformHeader({ 
  platformData, 
  title = "Select a category to shop through our latest selection", 
  subtitle 
}) {
  if (!platformData) return null;

  return (
    <div className="tf-page-title platform-header">
      <div className="container-full">
        <div
          className="heading text-center"
          style={{
            backgroundColor: "white",
            margin: "0px",
            padding: "0px",
            width: "100%",
          }}
        >
          {platformData.platformImage && (
            <img
              src={`https://bmrsuspension.com/siteart/cars/${platformData.platformImage}`}
              alt={platformData.name}
              style={{ width: "175px", height: "100px" }}
            />
          )}{" "}
          {platformData.formattedName || `${platformData.startYear}-${platformData.endYear} ${platformData.name}`}
        </div>
        <p className="text-center text-1 mt_15 pt_15">
          {subtitle || (
            <>
              <br />
              {title}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
