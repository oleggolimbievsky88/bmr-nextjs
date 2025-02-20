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

        fetchData();
    }, [platformSlug]);

    if (loading) return <p className="text-center mt-5">Loading...</p>;
    if (!platformData) return <p className="text-center mt-5">Platform not found.</p>;

    return (
        <div className="container">
            {/* Platform Banner */}
            <div className="platform-banner">
  {/* Full-width background */}
  <div
    className="platform-banner-bg"
    style={{ marginBottom: "60px", textAlign: "center" }}
  >
    <div className="platform-banner-overlay">
      <div className="platform-banner-content">
        <img
          src={`https://www.bmrsuspension.com/siteart/cars/${platformData.platformImage}`}
          alt={platformData.formattedName}
          className="platform-main-image"
        />
        <h1 className="platform-title">{platformData.formattedName}</h1>
        <p className="platform-subtitle">
          Select a category to shop through our latest selection of Suspension & Chassis Parts
        </p>
      </div>
    </div>
  </div>
</div>




            {/* Category Grid */}
            <CategoryGrid mainCategories={mainCategories} platform={platformSlug} />
        </div>
    );
}
