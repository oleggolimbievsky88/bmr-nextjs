// Country name to ISO 3166-1 alpha-2 country code mapping for UPS API
export const countryCodeMap = {
  "United States": "US",
  Canada: "CA",
  "United Kingdom": "GB",
  Australia: "AU",
  Austria: "AT",
  Belgium: "BE",
  Brazil: "BR",
  China: "CN",
  "Czech Republic": "CZ",
  Czechia: "CZ",
  Denmark: "DK",
  Finland: "FI",
  France: "FR",
  Germany: "DE",
  "Hong Kong": "HK",
  "Hong Kong SAR": "HK",
  India: "IN",
  Ireland: "IE",
  Israel: "IL",
  Italy: "IT",
  Japan: "JP",
  Malaysia: "MY",
  Mexico: "MX",
  Netherlands: "NL",
  "New Zealand": "NZ",
  Norway: "NO",
  Poland: "PL",
  Portugal: "PT",
  Singapore: "SG",
  "South Korea": "KR",
  Spain: "ES",
  Sweden: "SE",
  Switzerland: "CH",
  "United Arab Emirates": "AE",
  Vietnam: "VN",
};

// Get country code from country name
export function getCountryCode(countryName) {
  if (!countryName) return "US";
  // If it's already a 2-letter code, return it
  if (countryName.length === 2 && /^[A-Z]{2}$/.test(countryName)) {
    return countryName;
  }
  // Otherwise, look it up in the map
  return countryCodeMap[countryName] || "US";
}

// List of countries for dropdown (expanded list - sorted alphabetically)
export const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Austria",
  "Belgium",
  "Brazil",
  "China",
  "Czech Republic",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "Hong Kong SAR",
  "India",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Malaysia",
  "Mexico",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Poland",
  "Portugal",
  "Singapore",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Arab Emirates",
  "Vietnam",
];
