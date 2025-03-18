"use client";
import { useEffect, useState } from "react";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function PlatformPage({ params }) {
    const { platform } = params;
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/platforms/${platform}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch platform data');
                }
                const result = await response.json();
                console.log('Fetched Data:', result); // Debug log
                setData(result);
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [platform]);

    if (loading) {
        return <div className="text-center py-5">Loading...</div>;
    }

    if (error || !data) {
        return <div className="text-center py-5 text-danger">Error loading platform data</div>;
    }

    const { mainCategories, platformInfo, featuredProducts } = data;

    return (
        <div className="p-0 m-0">
            <PlatformHeader 
                platformData={{
                    HeaderImage: platformInfo?.headerImage,
                    Name: platformInfo?.name,
                    StartYear: platformInfo?.startYear,
                    EndYear: platformInfo?.endYear,
                    Image: platformInfo?.platformImage
                }}
            />

            <div className="container">
                <Breadcrumbs 
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Products', href: '/products' },
                        { label: platformInfo?.name || platform, href: '#' }
                    ]}
                />

                <CategoryGrid categories={mainCategories} />

                {featuredProducts && featuredProducts.length > 0 && (
                    <div className="mt-4">
                        <div className="text-center position-relative mb-3">
                            <h3 className="mb-2" style={{ fontSize: '1.5rem' }}>Featured Products</h3>
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '-5px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '60px',
                                    height: '2px',
                                    backgroundColor: 'var(--bs-danger)'
                                }}
                            ></div>
                        </div>
                        <ProductGrid products={featuredProducts} />
                    </div>
                )}
            </div>
        </div>
    );
}
