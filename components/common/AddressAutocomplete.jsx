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
  const inputRef = useRef(null);
  const { validateAddress, validationResult } = useAddressValidation();

  // Debounced address validation
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (address.address1 && address.city && address.state && address.zip) {
        setIsValidating(true);
        const result = await validateAddress(address);
        setIsValidating(false);

        if (onValidationComplete) {
          onValidationComplete(result);
        }
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [address, validateAddress, onValidationComplete]);

  const handleInputChange = (field, value) => {
    const newAddress = { ...address, [field]: value };
    onAddressChange(newAddress);

    if (field === "address1" && value.length > 3) {
      // Could integrate with Google Places API for autocomplete here
      // For now, we'll just validate the complete address
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onAddressChange(suggestion);
    setShowSuggestions(false);
  };

  const getValidationStatus = () => {
    if (isValidating) return "validating";
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
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium">{suggestion.address1}</div>
                <div className="text-sm text-gray-600">
                  {suggestion.city}, {suggestion.state} {suggestion.zip}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {validationResult && (
        <div className="mt-2">
          {validationResult.isValid ? (
            <div className="text-green-600 text-sm">
              ✅ Address verified successfully
            </div>
          ) : validationResult.correctedAddress ? (
            <div className="text-yellow-600 text-sm">
              ⚠️ Address corrected: {validationResult.correctedAddress.address1}
              , {validationResult.correctedAddress.city},{" "}
              {validationResult.correctedAddress.state}{" "}
              {validationResult.correctedAddress.zip}
              <button
                type="button"
                className="ml-2 text-blue-600 underline"
                onClick={() =>
                  onAddressChange(validationResult.correctedAddress)
                }
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
        />
      </div>
    </div>
  );
}
