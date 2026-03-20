import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar2 from "@/components/header/Topbar2";
import SearchResults from "@/components/search/SearchResults";
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

  return (
    <>
      <Topbar2 />
      <Header2 />
      <SearchResults
        groupedResults={groupedResults}
        searchQuery={searchQuery}
      />
      <Footer1 />
    </>
  );
}
