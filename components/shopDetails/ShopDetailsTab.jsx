"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getInstallUrl } from "@/lib/assets";

function FeatureCards({ items }) {
  if (!items) return null;

  let list = [];
  if (Array.isArray(items)) {
    list = items.map((x) => String(x || "").trim()).filter(Boolean);
  } else if (typeof items === "string") {
    const str = items.trim();
    if (!str) return null;

    if (str.includes("<li")) {
      return (
        <div
          className="pdpFeatureCards pdpFeatureCards--html"
          dangerouslySetInnerHTML={{ __html: str }}
        />
      );
    }

    list = str
      .replace(/\r/g, "")
      .split(/\n|•|- |\u2022/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (!list.length) return null;

  return (
    <div className="pdpFeatureCards">
      <div className="pdpFeatureCards__grid">
        {list.slice(0, 24).map((text, idx) => (
          <div className="pdpFeatureCards__card" key={`${idx}-${text}`}>
            <div className="pdpFeatureCards__icon" aria-hidden="true">
              ✓
            </div>
            <div className="pdpFeatureCards__text">{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ShopDetailsTab({ product, vehicles = [] }) {
  const descHtml = product?.Description || "";
  const lines = descHtml.split(/\r?\n/);
  const bulletIndex = lines.findIndex((line) => /^\s*[-•*]\s+/.test(line));
  let descPart = "";
  let featuresArr = [];
  if (bulletIndex !== -1) {
    descPart = lines.slice(0, bulletIndex).join(" ");
    featuresArr = lines
      .slice(bulletIndex)
      .filter((line) => /^\s*[-•*]\s+/.test(line))
      .map((line) => line.replace(/^\s*[-•*]\s+/, "").trim());
  } else {
    descPart = descHtml;
  }

  // Try to normalize features into an array (works for HTML <ul><li>, newline bullets, etc.)
  const normalizeFeatures = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input.filter(Boolean);

    const str = String(input);

    // 1) If it's HTML, try to pull <li>...</li>
    if (/<li[\s>]/i.test(str)) {
      const liMatches = [...str.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
      const cleaned = liMatches
        .map((m) =>
          m[1]
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim(),
        )
        .filter(Boolean);
      if (cleaned.length) return cleaned;
    }

    // 2) Split by new lines and strip common bullet prefixes
    return str
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*[-•*]\s+/, "").trim())
      .filter(Boolean);
  };

  const featuresList =
    normalizeFeatures(product?.Features).length > 0
      ? normalizeFeatures(product?.Features)
      : normalizeFeatures(featuresArr);

  const hasFeatures = featuresList.length > 0;
  const hasPlatforms =
    Array.isArray(product?.platforms) && product.platforms.length > 0;
  const hasFitment =
    (Array.isArray(vehicles) && vehicles.length > 0) || hasPlatforms;
  const hasInstallation =
    product?.Instructions &&
    product?.Instructions !== "0" &&
    product?.Instructions !== 0;

  const tabs = [
    { id: "description", title: "Description" },
    ...(hasFeatures ? [{ id: "features", title: "Features" }] : []),
    ...(hasInstallation ? [{ id: "installation", title: "Installation" }] : []),
    ...(hasFitment ? [{ id: "fitment", title: "Fitment" }] : []),
  ];

  const [currentTab, setCurrentTab] = useState(tabs[0]?.id || "description");
  const [fitmentYear, setFitmentYear] = useState("");
  const [fitmentMake, setFitmentMake] = useState("");
  const [fitmentModel, setFitmentModel] = useState("");
  const [fitmentSubModel, setFitmentSubModel] = useState("");

  const normalizedVehicles = useMemo(() => {
    if (!Array.isArray(vehicles)) return [];
    return vehicles.map((v) => {
      const start = parseInt(String(v?.StartYear ?? "").trim(), 10);
      const end = parseInt(String(v?.EndYear ?? "").trim(), 10);
      const make = String(v?.Make ?? "").trim();
      const model = String(v?.Model ?? "").trim();
      const subModel = v?.SubModel != null ? String(v.SubModel).trim() : "";
      return {
        ...v,
        _start: Number.isFinite(start) ? start : null,
        _end: Number.isFinite(end) ? end : null,
        _make: make,
        _makeLower: make.toLowerCase(),
        _model: model,
        _modelLower: model.toLowerCase(),
        _subModel: subModel,
      };
    });
  }, [vehicles]);

  const selectedYear = fitmentYear ? parseInt(fitmentYear, 10) : null;
  const selectedMakeLower = fitmentMake.toLowerCase();
  const selectedModelLower = fitmentModel.toLowerCase();

  const matchesYear = (vehicle) => {
    if (!selectedYear) return true;
    if (!Number.isFinite(selectedYear)) return false;
    if (!Number.isFinite(vehicle._start) || !Number.isFinite(vehicle._end)) {
      return false;
    }
    return selectedYear >= vehicle._start && selectedYear <= vehicle._end;
  };

  const yearOptions = useMemo(() => {
    const years = new Set();
    normalizedVehicles.forEach((v) => {
      if (!Number.isFinite(v._start) || !Number.isFinite(v._end)) return;
      const start = Math.min(v._start, v._end);
      const end = Math.max(v._start, v._end);
      for (let y = start; y <= end; y += 1) {
        years.add(y);
      }
    });
    return [...years].sort((a, b) => b - a);
  }, [normalizedVehicles]);

  const makeOptions = useMemo(() => {
    const makes = new Set();
    normalizedVehicles.forEach((v) => {
      if (!matchesYear(v)) return;
      if (v._make) makes.add(v._make);
    });
    return [...makes].sort((a, b) => a.localeCompare(b));
  }, [normalizedVehicles, selectedYear]);

  const modelOptions = useMemo(() => {
    if (!fitmentMake) return [];
    const models = new Set();
    normalizedVehicles.forEach((v) => {
      if (!matchesYear(v)) return;
      if (v._makeLower !== selectedMakeLower) return;
      if (v._model) models.add(v._model);
    });
    return [...models].sort((a, b) => a.localeCompare(b));
  }, [normalizedVehicles, selectedYear, selectedMakeLower, fitmentMake]);

  const subModelOptions = useMemo(() => {
    if (!fitmentMake || !fitmentModel) return [];
    const subModels = new Set();
    normalizedVehicles.forEach((v) => {
      if (!matchesYear(v)) return;
      if (v._makeLower !== selectedMakeLower) return;
      if (v._modelLower !== selectedModelLower) return;
      if (v._subModel) subModels.add(v._subModel);
    });
    return [...subModels].sort((a, b) => a.localeCompare(b));
  }, [
    normalizedVehicles,
    selectedYear,
    selectedMakeLower,
    selectedModelLower,
    fitmentMake,
    fitmentModel,
  ]);

  const filteredVehicles = useMemo(() => {
    return normalizedVehicles.filter((v) => {
      if (!matchesYear(v)) return false;
      if (fitmentMake && v._makeLower !== selectedMakeLower) return false;
      if (fitmentModel && v._modelLower !== selectedModelLower) return false;
      if (fitmentSubModel && v._subModel !== fitmentSubModel) return false;
      return true;
    });
  }, [
    normalizedVehicles,
    selectedYear,
    selectedMakeLower,
    selectedModelLower,
    fitmentMake,
    fitmentModel,
    fitmentSubModel,
  ]);

  const handleFitmentYearChange = (event) => {
    setFitmentYear(event.target.value);
    setFitmentMake("");
    setFitmentModel("");
    setFitmentSubModel("");
  };

  const handleFitmentMakeChange = (event) => {
    setFitmentMake(event.target.value);
    setFitmentModel("");
    setFitmentSubModel("");
  };

  const handleFitmentModelChange = (event) => {
    setFitmentModel(event.target.value);
    setFitmentSubModel("");
  };

  const handleFitmentSubModelChange = (event) => {
    setFitmentSubModel(event.target.value);
  };

  return (
    <section
      className="flat-spacing-17 pt_0"
      style={{ maxWidth: "100vw", overflow: "clip", marginTop: "65px" }}
    >
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="widget-tabs style-has-border pdpDetailsTabs">
              <ul className="widget-menu-tab">
                {tabs.map((tab) => (
                  <li
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`item-title ${
                      currentTab === tab.id ? "active" : ""
                    }`}
                  >
                    <span className="inner">{tab.title}</span>
                  </li>
                ))}
              </ul>
              <div className="widget-content-tab">
                {currentTab === "description" && (
                  <div className="widget-content-inner active">
                    <div>
                      <div
                        dangerouslySetInnerHTML={{ __html: descPart }}
                        style={{
                          fontSize: "16px !important",
                          color: "black !important",
                          lineHeight: "25px !important",
                        }}
                      />
                      {hasFeatures && (
                        <>
                          <div className="pdpSectionDivider" />
                          <FeatureCards items={featuresList} />
                        </>
                      )}
                    </div>
                  </div>
                )}
                {currentTab === "features" && hasFeatures && (
                  <div className="widget-content-inner active">
                    <div className="pdpFeatures">
                      <div className="pdpFeatures__header">
                        <p className="pdpFeatures__subtitle">
                          Quick highlights for this part.
                        </p>
                      </div>

                      <div className="pdpFeatures__grid">
                        {featuresList.map((feature, idx) => (
                          <div key={idx} className="pdpFeatures__item">
                            <span className="pdpFeatures__icon" aria-hidden>
                              <i className="bi bi-check2" />
                            </span>
                            <span className="pdpFeatures__text">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {currentTab === "installation" && hasInstallation && (
                  <div className="widget-content-inner active">
                    <div className="pdpInstall">
                      <div className="pdpInstall__card">
                        <div className="pdpInstall__left">
                          <div className="pdpInstall__icon" aria-hidden>
                            <i className="bi bi-file-earmark-pdf" />
                          </div>
                          <div className="pdpInstall__text">
                            <h4 className="pdpInstall__title">
                              Installation Instructions
                            </h4>
                            <p className="pdpInstall__subtitle">
                              PDF instructions for{" "}
                              <strong>{product?.PartNumber}</strong>.
                            </p>
                          </div>
                        </div>

                        <a
                          href={getInstallUrl(product.Instructions)}
                          className="pdpInstall__btn text-decoration-none"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View / Download PDF{" "}
                          <i className="bi bi-arrow-up-right" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                {currentTab === "fitment" && hasFitment && (
                  <div className="widget-content-inner active">
                    <div className="fitment-content">
                      {hasPlatforms && (
                        <div className="fitment-platforms mb-4">
                          <p className="fitment-platforms-title">
                            Fits these platforms:
                          </p>
                          <div className="fitment-pills">
                            {product.platforms.map((pl) => {
                              const slug =
                                pl.slug ||
                                (pl.name || "")
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")
                                  .replace(/\//g, "-");
                              const appStart =
                                product?.StartAppYear &&
                                String(product.StartAppYear).trim() !== "" &&
                                parseInt(product.StartAppYear, 10) > 0
                                  ? product.StartAppYear
                                  : pl.startYear;
                              const appEnd =
                                product?.EndAppYear &&
                                String(product.EndAppYear).trim() !== "" &&
                                parseInt(product.EndAppYear, 10) > 0
                                  ? product.EndAppYear
                                  : pl.endYear;
                              const label =
                                appStart && appEnd && appStart !== "0"
                                  ? `${appStart}-${appEnd} ${pl.name || ""}`
                                  : pl.name || "";
                              return (
                                <Link
                                  key={pl.bodyId ?? pl.BodyID ?? pl.name}
                                  href={`/products/${slug}`}
                                  className="fitment-pill text-decoration-none"
                                >
                                  {label.trim() || slug}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {Array.isArray(vehicles) && vehicles.length > 0 && (
                        <div className="row">
                          <div className="col-12">
                            <div className="fitment-filters mb-3">
                              <div className="row g-2">
                                <div className="col-12 col-md-3">
                                  <select
                                    className="form-select"
                                    value={fitmentYear}
                                    onChange={handleFitmentYearChange}
                                  >
                                    <option value="">Year</option>
                                    {yearOptions.map((year) => (
                                      <option key={year} value={year}>
                                        {year}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-12 col-md-3">
                                  <select
                                    className="form-select"
                                    value={fitmentMake}
                                    onChange={handleFitmentMakeChange}
                                    disabled={!fitmentYear}
                                  >
                                    <option value="">Make</option>
                                    {makeOptions.map((make) => (
                                      <option key={make} value={make}>
                                        {make}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-12 col-md-3">
                                  <select
                                    className="form-select"
                                    value={fitmentModel}
                                    onChange={handleFitmentModelChange}
                                    disabled={!fitmentMake}
                                  >
                                    <option value="">Model</option>
                                    {modelOptions.map((model) => (
                                      <option key={model} value={model}>
                                        {model}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-12 col-md-3">
                                  <select
                                    className="form-select"
                                    value={fitmentSubModel}
                                    onChange={handleFitmentSubModelChange}
                                    disabled={!fitmentModel}
                                  >
                                    <option value="">
                                      Sub Model (optional)
                                    </option>
                                    {subModelOptions.map((subModel) => (
                                      <option key={subModel} value={subModel}>
                                        {subModel}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="table-responsive fitment-table-wrap">
                              <table className="table fitment-table">
                                <thead>
                                  <tr>
                                    <th scope="col">Year Range</th>
                                    <th scope="col">Make</th>
                                    <th scope="col">Model</th>
                                    <th scope="col">Sub Model</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredVehicles.length === 0 && (
                                    <tr>
                                      <td colSpan={4}>
                                        No fitment matches your filters.
                                      </td>
                                    </tr>
                                  )}
                                  {filteredVehicles.map((vehicle, index) => {
                                    const startApp = product?.StartAppYear
                                      ? parseInt(
                                          String(product.StartAppYear).trim(),
                                          10,
                                        )
                                      : 0;
                                    const endApp = product?.EndAppYear
                                      ? parseInt(
                                          String(product.EndAppYear).trim(),
                                          10,
                                        )
                                      : 0;
                                    const useProductYears =
                                      Number.isFinite(startApp) &&
                                      Number.isFinite(endApp) &&
                                      startApp > 0 &&
                                      endApp > 0;
                                    const yearRange = useProductYears
                                      ? `${product.StartAppYear} - ${product.EndAppYear}`
                                      : `${vehicle.StartYear} - ${vehicle.EndYear}`;
                                    const subModel =
                                      vehicle?.SubModel != null
                                        ? String(vehicle.SubModel).trim()
                                        : "";
                                    return (
                                      <tr key={vehicle.VehicleID ?? index}>
                                        <td>
                                          <strong>{yearRange}</strong>
                                        </td>
                                        <td>{vehicle.Make}</td>
                                        <td>{vehicle.Model}</td>
                                        <td>{subModel || "—"}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
