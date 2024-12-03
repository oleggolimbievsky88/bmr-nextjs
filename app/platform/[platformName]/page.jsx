import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar1 from "@/components/header/Topbar1";
import ShopDefault from "@/components/shop/ShopDefault";
import Subcollections from "@/components/shop/Subcollections";
import React from "react";
import { getBodies, getCategories } from "@/lib/queries";

export const metadata = {
  title:
    "Product Collection Sub | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default async function PlatformPage({ params }) {
  const { platformName } = params;
  const platforms = await getBodies();
  
  // Debug the incoming platformName
  console.log('Looking for platform:', platformName);
  
  // Get the current platform with better matching logic
  const currentPlatform = platforms.find(platform => {
    // Handle special cases first
    if (platform.Name.toLowerCase().includes('miscellaneous') || 
        platform.Name.toLowerCase().includes('t-shirts') || 
        platform.Name.toLowerCase().includes('other')) {
      return false; // Skip these special categories
    }
    
    // Create the slug in the exact format of the URL
    let platformSlug;
    if (platform.EndYear === '0' || platform.EndYear === platform.StartYear) {
      // Single year format (like "2024-mustang")
      platformSlug = `${platform.StartYear}-${platform.Name.toLowerCase().replace(/\s+/g, '-')}`;
    } else {
      // Year range format (like "2015-2023-mustang")
      platformSlug = `${platform.StartYear}-${platform.EndYear}-${platform.Name.toLowerCase().replace(/\s+/g, '-')}`;
    }
    
    console.log('Comparing:', platformSlug, 'with:', platformName);
    return platformSlug === platformName;
  });

  if (!currentPlatform) {
    console.error('Available platforms:', platforms.map(p => ({
      name: p.Name,
      start: p.StartYear,
      end: p.EndYear
    })));
    
    return (
      <>
        <Topbar1 />
        <Header2 />
        <div className="tf-page-title">
          <div className="container-full">
            <div className="heading text-center">
              Platform Not Found: {platformName}
            </div>
          </div>
        </div>
        <Footer1 />
      </>
    );
  }

  const categories = await getCategories(currentPlatform.BodyID);

  return (
    <>
      <Topbar1 />
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">
            {`${currentPlatform?.StartYear}${currentPlatform?.EndYear !== '0' ? '-' + currentPlatform.EndYear : ''} ${currentPlatform.Name}`.toUpperCase()}
          </div>
          
          {/* Categories Grid */}
          <div className="categories-grid mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {categories && categories.map((category) => (
              <a 
                key={category.MainCatID} 
                href={`/platform/${platformName}/${category.MainCatID}`}
                className="category-card p-4 border rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square relative mb-2" key={category.CatID}>
                  {category.MainCatImage && category.MainCatImage !== '0' ? (
                    <img 
                      src={`https://bmrsuspension.com/siteart/categories/${category.MainCatImage}`} 
                      alt={category.MainCatName || 'Category'}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <h5 className="text-center text-sm font-medium">
                  {(category.MainCatName || 'Unnamed Category').toUpperCase()}
                </h5>
              </a>
            ))}
            {(!categories || categories.length === 0) && (
              <div className="col-span-full text-center py-8">
                No categories found for this platform
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer1 />
    </>
  );
}

