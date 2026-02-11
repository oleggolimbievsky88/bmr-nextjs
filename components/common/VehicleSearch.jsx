// VehicleSearch.js
"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "./VehicleSearch.module.scss";

export default function VehicleSearch() {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [subModel, setSubModel] = useState("");

  const [years, setYears] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [subModels, setSubModels] = useState([]);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vehicles-for-search")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (list.length === 0) return;
    const uniqueYears = [...new Set(list.map((v) => v.year))].sort(
      (a, b) => b - a,
    );
    setYears(uniqueYears);
  }, [list]);

  const handleYearChange = (e) => {
    const yearValue = e.target.value;
    setYear(yearValue);

    if (yearValue) {
      const yearNum = parseInt(yearValue, 10);
      const filteredMakes = [
        ...new Set(
          list
            .filter((v) => v.year === yearNum)
            .map((v) => v.make)
            .filter(Boolean),
        ),
      ].sort();
      setMakes(filteredMakes);
      setMake(filteredMakes.length === 1 ? filteredMakes[0] : "");
      setModel("");
      setModels([]);
      setSubModel("");
      setSubModels([]);
    }
  };

  const handleMakeChange = (e) => {
    const makeValue = e.target.value;
    setMake(makeValue);

    if (makeValue && year) {
      const yearNum = parseInt(year, 10);
      const filteredModels = [
        ...new Set(
          list
            .filter((v) => v.year === yearNum && v.make === makeValue)
            .map((v) => v.model)
            .filter(Boolean),
        ),
      ].sort();
      setModels(filteredModels);
      setModel(filteredModels.length === 1 ? filteredModels[0] : "");
      setSubModel("");
      setSubModels([]);
    }
  };

  const handleModelChange = (e) => {
    const modelValue = e.target.value;
    setModel(modelValue);

    if (modelValue && year && make) {
      const yearNum = parseInt(year, 10);
      const matches = list.filter(
        (v) => v.year === yearNum && v.make === make && v.model === modelValue,
      );
      const filteredSubModels = [
        ...new Set(matches.map((v) => v.subModel).filter(Boolean)),
      ].sort();
      setSubModels(filteredSubModels);
      setSubModel(filteredSubModels.length === 1 ? filteredSubModels[0] : "");
    }
  };

  const handleSubModelChange = (e) => {
    setSubModel(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!year || !make || !model) return;

    const yearNum = parseInt(year, 10);
    const match = list.find(
      (v) =>
        v.year === yearNum &&
        v.make === make &&
        v.model === model &&
        (subModel ? v.subModel === subModel : true),
    );
    if (match?.platformSlug) {
      window.location.href = `/products/${match.platformSlug}`;
    }
  };

  useEffect(() => {
    if (years.length && year && makes.length === 1) {
      setMake(makes[0]);
    }
  }, [years, year, makes]);

  useEffect(() => {
    if (models.length === 1 && model === "") {
      setModel(models[0]);
    }
  }, [models]);

  useEffect(() => {
    if (subModels.length === 1 && subModel === "") {
      setSubModel(subModels[0]);
    }
  }, [subModels]);

  return (
    <div className={styles["vehicle-search-form"]}>
      <form onSubmit={handleSubmit} className={styles["search-form"]}>
        <div className={styles["vehicle-search-header"]}>
          <h5 className={styles["vehicle-search-title"]}>SEARCH BY VEHICLE</h5>
        </div>
        <div className={styles["form-row"]}>
          <select
            value={year}
            onChange={handleYearChange}
            className={styles["search-input"]}
            suppressHydrationWarning
            name="year"
            disabled={loading}
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className={styles["form-row"]}>
          <select
            value={make}
            onChange={handleMakeChange}
            className={styles["search-input"]}
            disabled={!year}
            name="make"
            suppressHydrationWarning
          >
            <option value="">Make</option>
            {makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className={styles["form-row"]}>
          <select
            value={model}
            onChange={handleModelChange}
            className={styles["search-input"]}
            disabled={!make}
            suppressHydrationWarning
            name="model"
          >
            <option value="">Model</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className={`${styles["form-row"]} ${styles["sub-model-row"]}`}>
          <select
            value={subModel}
            onChange={handleSubModelChange}
            className={styles["search-input"]}
            disabled={!model}
            suppressHydrationWarning
            name="subModel"
          >
            <option value="">Sub Model (optional)</option>
            {subModels.map((sm) => (
              <option key={sm} value={sm}>
                {sm}
              </option>
            ))}
          </select>
        </div>

        <div
          className={`${styles["form-row"]} ${styles["button-row"]} ${styles["mb-md-5"]}`}
        >
          <button type="submit" className={styles["search-button"]}>
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
