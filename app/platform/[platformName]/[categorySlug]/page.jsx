import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar1 from "@/components/header/Topbar1";
import { getCategories, getProductsByPlatformId } from "@/lib/queries";
import CategoryContent from '@/context/CategoryContent';
import prisma from '@/lib/prisma';

async function fetchPlatforms() {
  // Your fetchPlatforms logic here
  // Make sure this function returns an array of platforms
}

export default async function CategoryPage({ params }) {
  const { platformName, categorySlug } = params;
  const platforms = await fetchPlatforms();
  
  if (!Array.isArray(platforms)) {
    return <div>Error: Unable to load platform data</div>;
  }

  const currentPlatform = platforms.find(platform => 
    platform.name === platformName
  );

  // Fetch products for the current category
  const products = await prisma.product.findMany({
    where: {
      platformId: currentPlatform?.id,
      category: {
        slug: categorySlug
      }
    },
    include: {
      images: true,
      category: true
    }
  });

  return (
    <>
      <Topbar1 />
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <CategoryContent 
            initialProducts={products} 
            initialCategories={categories}
            platformName={platformName}
            categorySlug={categorySlug}
          />
        </div>
      </div>
      <Footer1 />
    </>
  );
}