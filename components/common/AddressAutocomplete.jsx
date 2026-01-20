"use client";
import { useState, useEffect, useRef } from "react";
import { useAddressValidation } from "@/hooks/useAddressValidation";

export default function AddressAutocomplete({
  address,
  onAddressChange,
  onValidationComplete,
  label = "Address",
  placeholder = "Enter your address",
  required = true,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [sessionToken] = useState(() =>
    Math.random().toString(36).substring(2, 15)
  );
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);
  const { validateAddress, validationResult } = useAddressValidation();

  // Debounced address validation
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (address.address1 && address.city && address.state && address.zip) {
        try {
          setIsValidating(true);
          const result = await validateAddress(address);
          setIsValidating(false);

          if (onValidationComplete) {
            // If validation succeeded, use the result
            // If it failed due to API issues, consider the address valid if all fields are filled
            if (result.isValid) {
              onValidationComplete(result);
            } else if (result.error && result.error.includes('Permission denied')) {
              // API is unavailable - treat as valid if fields are filled
              onValidationComplete({
                isValid: true,
                apiUnavailable: true,
                correctedAddress: null,
              });
            } else {
              onValidationComplete(result);
            }
          }
        } catch (error) {
          // Silently handle validation errors - API may not be configured
          // Consider address valid if all required fields are filled
          setIsValidating(false);
          if (onValidationComplete) {
            onValidationComplete({
              isValid: true, // Allow checkout to proceed
              apiUnavailable: true,
              error: error.message,
              correctedAddress: null,
            });
          }
        }
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [address, validateAddress, onValidationComplete]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      // Cleanup debounce timer
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Fetch address suggestions from Google Places API
  const fetchSuggestions = async (input) => {
    if (input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `/api/places-autocomplete?input=${encodeURIComponent(
          input
        )}&sessionToken=${sessionToken}`
      );
      const data = await response.json();

      if (data.predictions) {
        setSuggestions(data.predictions);
        setShowSuggestions(true);
      } else {
        // API unavailable or no results - silently continue
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      // Silently handle autocomplete errors - API may not be configured
      // User can still type address manually
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleInputChange = (field, value) => {
    const newAddress = { ...address, [field]: value };
    onAddressChange(newAddress);

    if (field === "address1") {
      // Clear previous debounce timer
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new debounce timer for autocomplete
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300); // 300ms delay
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setIsLoadingSuggestions(true);
    try {
      // Fetch detailed address information
      const response = await fetch(
        `/api/place-details?placeId=${suggestion.place_id}&sessionToken=${sessionToken}`
      );
      const data = await response.json();

      if (data.address) {
        // Merge the new address data with existing address data, ensuring all fields have default values
        const updatedAddress = {
          ...address,
          ...data.address,
          address1: data.address.address1 || "",
          address2: data.address.address2 || "",
          city: data.address.city || "",
          state: data.address.state || "",
          zip: data.address.zip || "",
          country: data.address.country || "United States",
        };
        onAddressChange(updatedAddress);
        setShowSuggestions(false);
      }
    } catch (error) {
      // Silently handle place details errors - user can still enter address manually
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const getValidationStatus = () => {
    if (isValidating) return "validating";
    // If API is unavailable, treat as neutral (no validation feedback)
    if (validationResult?.apiUnavailable) return "neutral";
    if (validationResult?.isValid) return "valid";
    if (validationResult && !validationResult.isValid) return "invalid";
    return "neutral";
  };

  const getStatusColor = () => {
    const status = getValidationStatus();
    switch (status) {
      case "validating":
        return "border-yellow-400";
      case "valid":
        return "border-green-400";
      case "invalid":
        return "border-red-400";
      default:
        return "border-gray-300";
    }
  };

  const getStatusIcon = () => {
    const status = getValidationStatus();
    switch (status) {
      case "validating":
        return "⏳";
      case "valid":
        return "✅";
      case "invalid":
        return "❌";
      default:
        return "";
    }
  };

  return (
    <div className="form-group">
      <label htmlFor="address1">
        {label} {required && <span className="text-red-500">*</span>}
        {getStatusIcon() && (
          <span className="ml-2 text-sm">{getStatusIcon()}</span>
        )}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id="address1"
          value={address.address1 || ""}
          onChange={(e) => handleInputChange("address1", e.target.value)}
          placeholder={placeholder}
          className={`form-control ${getStatusColor()}`}
          required={required}
          autoComplete="street-address"
          suppressHydrationWarning
        />

        {showSuggestions &&
          (suggestions.length > 0 || isLoadingSuggestions) && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {isLoadingSuggestions ? (
                <div className="px-4 py-2 text-gray-500 text-center">
                  Loading suggestions...
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionClick(suggestion);
                    }}
                  >
                    <div className="font-medium text-gray-900">
                      {suggestion.structured_formatting?.main_text ||
                        suggestion.description}
                    </div>
                    <div className="text-sm text-gray-600">
                      {suggestion.structured_formatting?.secondary_text || ""}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
      </div>

      {/* Validation Messages */}
      {validationResult && (
        <div className="mt-2">
          {validationResult.apiUnavailable ? (
            // Don't show any message when API is unavailable - just let user proceed
            null
          ) : validationResult.isValid ? (
            <div className="text-green-600 text-sm">
              ✅ Address verified successfully
            </div>
          ) : validationResult.correctedAddress ? (
            <div className="text-yellow-600 text-sm">
              ⚠️ Address corrected:{" "}
              {validationResult.correctedAddress.address1 || ""}
              {validationResult.correctedAddress.city
                ? `, ${validationResult.correctedAddress.city}`
                : ""}
              {validationResult.correctedAddress.state
                ? `, ${validationResult.correctedAddress.state}`
                : ""}
              {validationResult.correctedAddress.zip
                ? ` ${validationResult.correctedAddress.zip}`
                : ""}
              <button
                type="button"
                className="ml-2 text-blue-600 underline p-1 border-radius-3"
                onClick={() => {
                  const correctedAddress = {
                    ...address,
                    ...validationResult.correctedAddress,
                    address1: validationResult.correctedAddress.address1 || "",
                    address2: validationResult.correctedAddress.address2 || "",
                    city: validationResult.correctedAddress.city || "",
                    state: validationResult.correctedAddress.state || "",
                    zip: validationResult.correctedAddress.zip || "",
                    country:
                      validationResult.correctedAddress.country ||
                      "United States",
                  };
                  onAddressChange(correctedAddress);
                }}
              >
                Use corrected address
              </button>
            </div>
          ) : (
            <div className="text-red-600 text-sm">
              ❌ Please check your address - it may not be deliverable
            </div>
          )}
        </div>
      )}

      {/* Address Line 2 */}
      <div className="mt-3">
        <label htmlFor="address2" className="text-sm text-gray-600">
          Address Line 2 (Optional)
        </label>
        <input
          type="text"
          id="address2"
          value={address.address2 || ""}
          onChange={(e) => handleInputChange("address2", e.target.value)}
          placeholder="Apartment, suite, unit, building, floor, etc."
          className="form-control mt-1"
          autoComplete="address-line2"
          suppressHydrationWarning
        />
      </div>
    </div>
  );
}
