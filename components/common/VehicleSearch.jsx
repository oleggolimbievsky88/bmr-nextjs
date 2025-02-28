// VehicleSearch.js
import { useState } from "react";
import styles from './VehicleSearch.module.scss';

export default function VehicleSearch() {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const handleYearChange = (e) => setYear(e.target.value);
  const handleMakeChange = (e) => setMake(e.target.value);
  const handleModelChange = (e) => setModel(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Search:", { year, make, model });
  };

  return (
    <div className={styles['vehicle-search-form']}>
        <span className="fw-5" style={{fontSize: "20px", fontFamily:"Impact", textAlign:"center", display:"block", marginRight:"10px", color: "white"}}>SEARCH BY<br /> VEHICLE</span>
      <form onSubmit={handleSubmit} className={styles['search-form']}>
        <input
          type="text"
          placeholder="Year"
          value={year}
          onChange={handleYearChange}
          className={styles['search-input']}
        />
        <input
          type="text"
          placeholder="Make"
          value={make}
          onChange={handleMakeChange}
          className={styles['search-input']}
        />
        <input
          type="text"
          placeholder="Model"
          value={model}
          onChange={handleModelChange}
          className={styles['search-input']}
        />
        <button type="submit" className={styles['search-button']}>
          Search
        </button>
      </form>
    </div>
  );
}
