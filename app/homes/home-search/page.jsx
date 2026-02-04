import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar2 from "@/components/header/Topbar2";
import PageHeader from "@/components/header/PageHeader";
import SearchResults from "@/components/search/SearchResults";
import SearchInput from "@/components/search/SearchInput";
import { searchAllQuick } from "@/lib/queries";

import React, { Suspense } from "react";

//get search results from the database
async function getSearchResults(searchQuery = "") {
  if (!searchQuery || searchQuery.trim() === "") {
    return {
      products: [],
      categories: [],
      platforms: [],
      vehicles: [],
      brands: [],
    };
  }

  try {
    const results = await searchAllQuick(searchQuery.trim(), {
      products: 80,
      categories: 25,
      platforms: 15,
      vehicles: 25,
      brands: 15,
    });
    return results;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return {
      products: [],
      categories: [],
      platforms: [],
      vehicles: [],
      brands: [],
    };
  }
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const searchQuery = params?.q || "";
  return {
    title: `Search Results | BMR Suspension | ${searchQuery}`,
    description:
      "BMR Suspension - Search for products, categories, vehicles, and brands",
  };
}

export default async function page({ searchParams }) {
  const params = await searchParams;
  const searchQuery = params?.q || "";
  const groupedResults = await getSearchResults(searchQuery);
  const totalResults =
    (groupedResults.products?.length || 0) +
    (groupedResults.categories?.length || 0) +
    (groupedResults.platforms?.length || 0) +
    (groupedResults.vehicles?.length || 0) +
    (groupedResults.brands?.length || 0);

  return (
    <>
      <Topbar2 />
      <Header2 />
      <PageHeader
        title="Search "
        subtitle={searchQuery ? `Results for "${searchQuery}"` : null}
      />

      <div className="container">
        {/* <div className="row justify-content-center mt_5">
          <div className="col-md-8 col-lg-6">
            <Suspense
              fallback={
                <div className="search-input-container">
                  <form className="search-input-wrapper">
                    <div className="search-input-inner">
                      <input
                        type="text"
                        className="form-control search-input-field"
                        placeholder="Search by part # or keyword"
                        defaultValue={searchQuery}
                        disabled
                      />
                    </div>
                  </form>
                </div>
              }
            >
              <SearchInput initialQuery={searchQuery} />
            </Suspense>
          </div>
        </div> */}
        {searchQuery && (
          <div className="text-center mt_3">
            <p className="text-2 text_black-2">
              Found {totalResults} results across all categories
            </p>
          </div>
        )}
      </div>
      <SearchResults
        groupedResults={groupedResults}
        searchQuery={searchQuery}
      />
      <Footer1 />
    </>
  );
}
