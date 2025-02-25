"use client";
import { useEffect, useState } from "react";
import CategoryGrid from "@/components/shop/CategoryGrid";

export default function PlatformPage({ params }) {
    const platformSlug = Array.isArray(params.platform) ? params.platform[0] : params.platform;
  const [mainCategories, setMainCategories] = useState([]);
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch platform details
        const platformRes = await fetch(`/api/platforms/${platformSlug}`);
        if (!platformRes.ok) throw new Error("Platform not found");
        const platformData = await platformRes.json();

        // Fetch main categories
        const categoryRes = await fetch(`/api/maincategories/${platformSlug}`);
        if (!categoryRes.ok) throw new Error("No categories found");
        const categories = await categoryRes.json();

        setPlatformData(platformData);
        setMainCategories(categories);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    console.log("platformData", platformData);
    fetchData();
  }, [platformSlug]);

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (!platformData)
    return <p className="text-center mt-5">Platform not found.</p>;

  return (
    <>
      <div className="tf-page-title">
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
            <img
              src={`https://bmrsuspension.com/siteart/cars/${platformData.platformImage}`}
              alt={platformData.name}
              style={{ width: "175px", height: "100px" }}
            />{" "}
            {platformData.formattedName}
          </div>
          <p className="text-center text-1 mt_15 pt_15">
            <br></br>
            Select a category to shop through our latest selection of Suspension
            & Chassis Parts
          </p>
        </div>
      </div>

      <CategoryGrid categories={mainCategories} platform={platformSlug} isSubCategory={false} />




      </>
  );
}
