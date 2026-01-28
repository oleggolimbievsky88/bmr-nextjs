import { useState, useCallback } from "react";

export const useShippingRates = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState(null);

  const calculateShippingRates = useCallback(
    async (fromAddress, toAddress, packages, productIds = []) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/ups-shipping-rates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromAddress,
            toAddress,
            packages,
            productIds: productIds || [],
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to calculate shipping rates");
        }

        setShippingOptions(result.shippingOptions);

        // Auto-select free shipping if available
        const freeOption = result.shippingOptions.find(
          (option) => option.code === "FREE",
        );
        if (freeOption) {
          setSelectedOption(freeOption);
        } else if (result.shippingOptions.length > 0) {
          setSelectedOption(result.shippingOptions[0]);
        }

        return result;
      } catch (error) {
        console.error("Shipping rates error:", error);
        setError(null); // Don't show error to user, just use fallback options

        // Fallback when UPS API is unavailable: paid options only
        // (free shipping eligibility cannot be determined client-side)
        const fallbackOptions = [
          {
            service: "UPS 3 Day Select",
            code: "12",
            cost: 44.99,
            currency: "USD",
            deliveryDays: "3 business days",
            description: "Guaranteed 3-day delivery",
          },
          {
            service: "UPS 2nd Day Air",
            code: "02",
            cost: 64.99,
            currency: "USD",
            deliveryDays: "2 business days",
            description: "Second business day delivery",
          },
          {
            service: "UPS Next Day Air",
            code: "01",
            cost: 99.99,
            currency: "USD",
            deliveryDays: "1 business day",
            description: "Next business day delivery",
          },
        ];

        setShippingOptions(fallbackOptions);
        setSelectedOption(fallbackOptions[0]);

        return {
          success: true,
          shippingOptions: fallbackOptions,
          error: error.message,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const selectShippingOption = useCallback((option) => {
    setSelectedOption(option);
  }, []);

  const clearShippingRates = useCallback(() => {
    setShippingOptions([]);
    setSelectedOption(null);
    setError(null);
  }, []);

  return {
    calculateShippingRates,
    isLoading,
    shippingOptions,
    selectedOption,
    selectShippingOption,
    error,
    clearShippingRates,
  };
};
