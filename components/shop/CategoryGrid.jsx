// "use client";
// import { useEffect, useState } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination } from "swiper/modules";
// import Link from "next/link";
// import Subcollections from "./Subcollections";

// export default function CategoryGrid({ platformSlug }) {
//   const [categories, setCategories] = useState([]);
//   const [mainCategories, setMainCategories] = useState([]);
//   const [selectedMainCategory, setSelectedMainCategory] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [vehicle, setVehicle] = useState(null);
//   const [platformImage, setPlatformImage] = useState(null);
//   const [mainCategoryImage, setMainCategoryImage] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!platformSlug) return;

//       setLoading(true);
//       setError(null);
//       try {
//         const response = await fetch(
//           `/api/categories?platform=${encodeURIComponent(platformSlug)}`
//         );
//         if (!response.ok) throw new Error("Failed to fetch data");

//         const data = await response.json();
//         console.log("Received data:", data);

//         if (data.error) {
//           throw new Error(data.error);
//         }

//         setCategories(data.categories || []);
//         setMainCategories(data.mainCategories || []);
//         setMainCategoryImage(data.image || []);
//         setVehicle(data.vehicle || null);
//         setPlatformImage(data.platformImage || null);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [platformSlug]);

//   if (loading) return <div>Loading...</div>;

//   const shouldShowArrows =
//     mainCategories.length > 5 || window.innerWidth < 1400;

//   return (
//     <section className="flat-spacing-3 pb_0">
//       <div className="container position-relative">
//         <Subcollections />

//         <Swiper
//           slidesPerView={5}
//           spaceBetween={30}
//           breakpoints={{
//             1400: { slidesPerView: 5, spaceBetween: 30 },
//             1024: { slidesPerView: 4, spaceBetween: 30 },
//             768: { slidesPerView: 3, spaceBetween: 30 },
//             576: { slidesPerView: 2, spaceBetween: 30 },
//             0: { slidesPerView: 1, spaceBetween: 30 },
//           }}
//           loop={false}
//           autoplay={false}
//           modules={[Navigation, Pagination]}
//           navigation={{
//             prevEl: ".snbp306",
//             nextEl: ".snbn306",
//           }}
//           pagination={{ clickable: true, el: ".spd306" }}
//         >
//           {mainCategories.map((category) => (
//             <SwiperSlide key={category.id}>
//               <div className="collection-item style-2 hover-img">
//                 <div className="collection-inner">
//                   <Link
//                     href={`/shop/${category.name
//                       .toLowerCase()
//                       .replace(/\s+/g, "-")}`}
//                     className="collection-image img-style"
//                   >
//                     <img
//                       src={`https://www.bmrsuspension.com/siteart/categories/${category.image}`}
//                       alt={category.name}
//                       className="card-img-top"
//                     />
//                   </Link>
//                   <div className="text-center mt-2">
//                     <Link
//                       href={`/shop/${category.name
//                         .toLowerCase()
//                         .replace(/\s+/g, "-")}`}
//                       className="tf-btn collection-title hover-icon fs-15"
//                     >
//                       <i className="icon icon-arrow1-top-left" />
//                       {category.name}
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </SwiperSlide>
//           ))}
//         </Swiper>
//         {shouldShowArrows && (
//           <>
//             <div className="nav-sw nav-next-slider nav-next-collection box-icon w_46 round snbp306 position-absolute top-50 start-0 translate-middle-y">
//               <span className="icon icon-arrow-left" />
//             </div>
//             <div className="nav-sw nav-prev-slider nav-prev-collection box-icon w_46 round snbn306 position-absolute top-50 end-0 translate-middle-y">
//               <span className="icon icon-arrow-right" />
//             </div>
//           </>
//         )}
//         <div className="sw-dots style-2 sw-pagination-collection justify-content-center spd306" />
//       </div>
//     </section>
//   );
// }

import Link from "next/link";
import Image from "next/image";

export default function CategoryGrid({
  categories = [],
  platform,
  isSubCategory = false,
  mainCategory,
}) {
  console.log("Categories:", categories); // Debug log
  const safeCategories = Array.isArray(categories) ? categories : [];
  return (
    <div className="container m-0 p-0">
      <div className="row m-0 p-0">
        {safeCategories.map((category, index) => {
          // For main categories, use name property
          // For subcategories, use CatName or name property
          const categoryName = category.name || category.CatName;
          const categoryId = category.id || category.CatID;
          const categoryImage = category.image || category.CatImage;
          const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-");
          const href = isSubCategory
            ? `/products/${platform}/${mainCategory}/${categoryId}`
            : `/products/${platform}/${categorySlug}`;

          if (!categoryName) {
            console.warn(`⚠️ Skipping category at index ${index}:`, category);
            return null;
          }

          return (
            <div
              key={categoryId || index}
              className="col-12 col-md-6 col-lg-4 col-xl-3 col-xxl-3 mb-4"
            >
              <div className="card category-card flex-row align-items-center rounded-4 w-100 p-2">
                <Link
                  href={href}
                  className="d-flex align-items-center text-decoration-none"
                >
                  {categoryImage && (
                    <Image
                      src={`https://www.bmrsuspension.com/siteart/categories/${categoryImage}`}
                      alt={categoryName}
                      width={100}
                      height={90}
                      className="category-card-img flex-shrink-0 me-3"
                      style={{
                        objectFit: "contain",
                        width: "100px",
                        height: "90px",
                        borderRadius: "0.75rem",
                        background: "#ffffff",
                      }}
                    />
                  )}
                  <span className="category-title">{categoryName}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
