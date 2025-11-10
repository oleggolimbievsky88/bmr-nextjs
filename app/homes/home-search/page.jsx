import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar2 from "@/components/header/Topbar2";
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
      vehicles: [],
      brands: [],
    };
  }

  try {
    const results = await searchAllQuick(searchQuery.trim(), {
      products: 50,
      categories: 20,
      vehicles: 20,
      brands: 20,
    });
    return results;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return {
      products: [],
      categories: [],
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
    groupedResults.products.length +
    groupedResults.categories.length +
    groupedResults.vehicles.length +
    groupedResults.brands.length;

  return (
    <>
      <Topbar2 />
      <Header2 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div
            className="heading text-center"
            style={{
              fontFamily: "Impact",
              fontWeight: "600",
              textTransform: "uppercase",
              color: "#000000",
              letterSpacing: "2px",
              margin: "10px 0",
            }}
          >
            Search Products
          </div>
          <div className="row justify-content-center mt_5">
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
          </div>
          {searchQuery && (
            <div className="text-center mt_3">
              <h5>
                Search Results for
                <span className="text-muted"> "{searchQuery}"</span>
              </h5>
              <p className="text-2 text_black-2">
                Found {totalResults} results across all categories
              </p>
            </div>
          )}
        </div>
      </div>
      <SearchResults
        groupedResults={groupedResults}
        searchQuery={searchQuery}
      />
      <Footer1 />
    </>
  );
}
