// VehicleSearch.js
'use client'
import { useState, useEffect } from "react"
import styles from './VehicleSearch.module.scss'
import vehicles from "../../data/vehicles"

export default function VehicleSearch() {
  // State for form inputs
  const [year, setYear] = useState("")
  const [make, setMake] = useState("")
  const [model, setModel] = useState("")

  // State for dropdown options
  const [years, setYears] = useState([])
  const [makes, setMakes] = useState([])
  const [models, setModels] = useState([])

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
    ).sort((a, b) => b - a)
    setYears(uniqueYears)
  }, [])

  // Handle year input change
  const handleYearChange = (e) => {
    const yearValue = e.target.value
    setYear(yearValue)

    if (yearValue) {
      const yearNum = parseInt(yearValue)
      // Filter makes based on the selected year
      const filteredMakes = Object.keys(vehicles).filter((make) =>
        Object.keys(vehicles[make]).some((model) =>
          vehicles[make][model].some((vehicle) => vehicle.year === yearNum)
        )
      )
      setMakes(filteredMakes)
      setMake("") // Reset make
      setModel("") // Reset model
    }
  }

  // Handle make input change
  const handleMakeChange = (e) => {
    const makeValue = e.target.value
    setMake(makeValue)

    if (makeValue && year) {
      // Filter models based on selected year and make
      const yearNum = parseInt(year)
      const filteredModels = Object.keys(vehicles[makeValue]).filter((model) =>
        vehicles[makeValue][model].some((vehicle) => vehicle.year === yearNum)
      )
      setModels(filteredModels)
      setModel("") // Reset model
    }
  }

  // Handle model input change
  const handleModelChange = (e) => {
    setModel(e.target.value)
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (year && make && model) {
      const yearNum = parseInt(year)
      const selectedVehicle = vehicles[make][model].find(
        (vehicle) => vehicle.year === yearNum
      )
      if (selectedVehicle && selectedVehicle.platform) {
        window.location.href = `/products/${selectedVehicle.platform}`
      }
    }
  }

  return (
    <div className={styles['vehicle-search-form']}>
      <span className="fw-5" style={{fontSize: "20px", fontFamily:"Impact", textAlign:"center", display:"block", marginRight:"15px", color: "white"}}>SEARCH BY<br /> VEHICLE</span>
      <form onSubmit={handleSubmit} className={styles['search-form']}>
        <select
          value={year}
          onChange={handleYearChange}
          className={styles['search-input']}
        >
          <option value="">Select Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={make}
          onChange={handleMakeChange}
          className={styles['search-input']}
          disabled={!year}
        >
          <option value="">Select Make</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={model}
          onChange={handleModelChange}
          className={styles['search-input']}
          disabled={!make}
        >
          <option value="">Select Model</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <button type="submit" className={styles['search-button']}>
          Search
        </button>
      </form>
    </div>
  )
}
