import { useState, useCallback } from "react";

export const useAddressValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const validateAddress = useCallback(async (address) => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch("/api/validate-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Address validation failed");
      }

      setValidationResult(result);
      return result;
    } catch (error) {
      // Silently handle validation errors - API may not be configured
      // Validation is optional, so we don't log errors to avoid console noise
      setValidationResult({
        isValid: false,
        error: error.message,
        correctedAddress: null,
      });
      return {
        isValid: false,
        error: error.message,
        correctedAddress: null,
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validateAddress,
    isValidating,
    validationResult,
    clearValidation,
  };
};
