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
   <div>ymm</div>
  );
};

export default VehicleSearch;
