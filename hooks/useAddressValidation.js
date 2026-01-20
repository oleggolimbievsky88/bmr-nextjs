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
        // Check if it's an API availability issue (suspended, disabled, etc.)
        const errorMsg = result.error || "Address validation failed";
        const isApiUnavailable = errorMsg.includes('Permission denied') ||
          errorMsg.includes('suspended') ||
          errorMsg.includes('disabled') ||
          errorMsg.includes('REQUEST_DENIED') ||
          response.status === 403;

        if (isApiUnavailable) {
          // API is unavailable - don't block checkout
          const fallbackResult = {
            isValid: true,
            apiUnavailable: true,
            error: errorMsg,
            correctedAddress: null,
          };
          setValidationResult(fallbackResult);
          return fallbackResult;
        }

        throw new Error(errorMsg);
      }

      setValidationResult(result);
      return result;
    } catch (error) {
      // Silently handle validation errors - API may not be configured
      // Don't block checkout if API is unavailable
      const fallbackResult = {
        isValid: true,
        apiUnavailable: true,
        error: error.message,
        correctedAddress: null,
      };
      setValidationResult(fallbackResult);
      return fallbackResult;
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
