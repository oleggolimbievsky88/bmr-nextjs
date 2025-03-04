"use client";
import { useEffect, useState } from "react";
import CategoryGrid from "@/components/shop/CategoryGrid";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

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
    if (!platformData)
        return <p className="text-center mt-5">Platform not found.</p>;

    return (
        <>
            <PlatformHeader 
                platformData={platformData} 
                title="Select a category to shop through our latest selection of Suspension & Chassis Parts"
            />
            <Breadcrumbs params={params} className="mt-0 pt-0 breadcrumbs-custom" />
            <CategoryGrid 
                // mainCategories={mainCategories}
                platform={platformSlug} 
                isSubCategory={false} 
                categories={mainCategories} 
            />
        </>
    );
}
