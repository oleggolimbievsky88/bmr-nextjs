"use client";
import { useState, useEffect } from "react";
import vehicles from "../../data/vehicles"; // import your vehiclesObject.js

const VehicleSearch = () => {
  const [years, setYears] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMake, setSelectedMake] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  // Function to populate the years dropdown
  useEffect(() => {
    const uniqueYears = Array.from(
      new Set(
        Object.values(vehicles).flatMap((make) =>
          Object.values(make).flatMap((model) =>
            model.map((vehicle) => vehicle.year)
          )
        )
      )
    ).sort((a, b) => b - a);
    setYears(uniqueYears);
  }, []);

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);

    // Filter makes based on the selected year
    const filteredMakes = Object.keys(vehicles).filter((make) =>
      Object.keys(vehicles[make]).some((model) =>
        vehicles[make][model].some((vehicle) => vehicle.year === year)
      )
    );
    setMakes(filteredMakes);
    setModels([]); // Reset models when year changes
  };

  const handleMakeChange = (e) => {
    const make = e.target.value;
    setSelectedMake(make);

    // Filter models based on selected year and make
    const filteredModels = Object.keys(vehicles[make]).filter((model) =>
      vehicles[make][model].some((vehicle) => vehicle.year === selectedYear)
    );
    setModels(filteredModels);
  };

  const handleModelChange = (e) => {
    const model = e.target.value;
    setSelectedModel(model);
  };

  const handleSubmit = () => {
    if (selectedYear && selectedMake && selectedModel) {
      const selectedVehicle = vehicles[selectedMake][selectedModel].find(
        (vehicle) => vehicle.year === selectedYear
      );
      if (selectedVehicle && selectedVehicle.platform) {
        // Redirect to the platform page
        window.location.href = `/products/${selectedVehicle.platform}`;
      }
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12 mt-3 text-center">
          <h4 className="fw-medium display-6">Search by Vehicle</h4>
          <p className="text-body-secondary fs-6">
            Filter your results by entering your Vehicle to ensure you find the
            parts that fit.
          </p>
        </div>
      </div>

      <form className="container mt-3 p-3 border rounded-3 bg-dark text-white" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-3 mb-3">
            <label htmlFor="year" className="form-label">
              Year
            </label>
            <select
              id="year"
              className="form-control"
              onChange={handleYearChange}
            >
              <option value="">Select Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="make" className="form-label">
              Make
            </label>
            <select
              id="make"
              className="form-control"
              onChange={handleMakeChange}
              disabled={!selectedYear}
            >
              <option value="">Select Make</option>
              {makes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="model" className="form-label">
              Model
            </label>
            <select
              id="model"
              className="form-control"
              onChange={handleModelChange}
              disabled={!selectedMake}
            >
              <option value="">Select Model</option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 mb-3 d-flex align-items-end">
            <button
              type="submit"
              className="btn btn-danger w-100"
              style={{
                backgroundColor: "var(--primary)",
                borderColor: "var(--primary)",
                color: "white",
              }}
              onClick={handleSubmit}
            >
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VehicleSearch;
