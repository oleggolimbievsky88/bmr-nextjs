// VehicleSearch.js
"use client";
import { useState, useEffect } from "react";
import styles from "./VehicleSearch.module.scss";
import vehicles from "../../data/vehicles";

export default function VehicleSearch() {
  // State for form inputs
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [subModel, setSubModel] = useState("");

  // State for dropdown options
  const [years, setYears] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [subModels, setSubModels] = useState([]);

  // Populate years on component mount
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

  // Handle year input change
  const handleYearChange = (e) => {
    const yearValue = e.target.value;
    setYear(yearValue);

    if (yearValue) {
      const yearNum = parseInt(yearValue);
      // Filter makes based on the selected year
      const filteredMakes = Object.keys(vehicles).filter((make) =>
        Object.keys(vehicles[make]).some((model) =>
          vehicles[make][model].some((vehicle) => vehicle.year === yearNum)
        )
      );
      setMakes(filteredMakes);
      if (filteredMakes.length === 1) {
        setMake(filteredMakes[0]);
      } else {
        setMake("");
      }
      setModel("");
      setModels([]);
      setSubModel("");
      setSubModels([]);
    }
  };

  // Handle make input change
  const handleMakeChange = (e) => {
    const makeValue = e.target.value;
    setMake(makeValue);

    if (makeValue && year) {
      const yearNum = parseInt(year);
      // Filter models based on selected year and make
      const filteredModels = Object.keys(vehicles[makeValue]).filter((model) =>
        vehicles[makeValue][model].some((vehicle) => vehicle.year === yearNum)
      );
      setModels(filteredModels);
      if (filteredModels.length === 1) {
        setModel(filteredModels[0]);
      } else {
        setModel("");
      }
      setSubModel("");
      setSubModels([]);
    }
  };

  // Handle model input change
  const handleModelChange = (e) => {
    const modelValue = e.target.value;
    setModel(modelValue);

    if (modelValue && year && make) {
      const yearNum = parseInt(year);
      // Filter sub models based on selected year, make, and model
      const filteredSubModels = vehicles[make][modelValue]
        .filter((vehicle) => vehicle.year === yearNum && vehicle.subModel)
        .map((vehicle) => vehicle.subModel)
        .filter(
          (subModel, idx, arr) => subModel && arr.indexOf(subModel) === idx
        );
      setSubModels(filteredSubModels);
      if (filteredSubModels.length === 1) {
        setSubModel(filteredSubModels[0]);
      } else {
        setSubModel("");
      }
    }
  };

  // Handle sub model input change
  const handleSubModelChange = (e) => {
    setSubModel(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (year && make && model) {
      const yearNum = parseInt(year);
      let selectedVehicle;
      if (subModel) {
        selectedVehicle = vehicles[make][model].find(
          (vehicle) => vehicle.year === yearNum && vehicle.subModel === subModel
        );
      } else {
        selectedVehicle = vehicles[make][model].find(
          (vehicle) => vehicle.year === yearNum
        );
      }
      if (selectedVehicle && selectedVehicle.platform) {
        window.location.href = `/products/${selectedVehicle.platform}`;
      }
    }
  };

  // useEffect to auto-select make/model/subModel if only one option after options update
  useEffect(() => {
    if (years.length && year && makes.length === 1) {
      setMake(makes[0]);
    }
  }, [years, year, makes]);

  useEffect(() => {
    if (models.length && model === "" && models.length === 1) {
      setModel(models[0]);
    }
  }, [models]);

  useEffect(() => {
    if (subModels.length && subModel === "" && subModels.length === 1) {
      setSubModel(subModels[0]);
    }
  }, [subModels]);

  return (
    <div className={styles["vehicle-search-form"]}>
      <span
        className="fw-5"
        style={{
          fontSize: "20px",
          fontFamily: "Impact",
          textAlign: "center",
          display: "block",
          marginRight: "15px",
          color: "white",
        }}
      >
        SEARCH BY
        <br /> VEHICLE
      </span>
      <form onSubmit={handleSubmit} className={styles["search-form"]}>
        <select
          value={year}
          onChange={handleYearChange}
          className={styles["search-input"]}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={make}
          onChange={handleMakeChange}
          className={styles["search-input"]}
          disabled={!year}
        >
          <option value="">Make</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={model}
          onChange={handleModelChange}
          className={styles["search-input"]}
          disabled={!make}
        >
          <option value="">Model</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={subModel}
          onChange={handleSubModelChange}
          className={styles["search-input"]}
          disabled={!model || subModels.length === 0}
        >
          <option value="">Sub Model (optional)</option>
          {subModels.map((sm) => (
            <option key={sm} value={sm}>
              {sm}
            </option>
          ))}
        </select>

        <button type="submit" className={styles["search-button"]}>
          Search
        </button>
      </form>
    </div>
  );
}
