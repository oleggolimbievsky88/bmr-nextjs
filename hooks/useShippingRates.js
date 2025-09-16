import { useState, useCallback } from "react";

export const useShippingRates = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState(null);

  const calculateShippingRates = useCallback(
    async (fromAddress, toAddress, packages) => {
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
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to calculate shipping rates");
        }

        setShippingOptions(result.shippingOptions);

        // Auto-select free shipping if available
        const freeOption = result.shippingOptions.find(
          (option) => option.code === "FREE"
        );
        if (freeOption) {
          setSelectedOption(freeOption);
        } else if (result.shippingOptions.length > 0) {
          setSelectedOption(result.shippingOptions[0]);
        }

        return result;
      } catch (error) {
        console.error("Shipping rates error:", error);
        setError(error.message);

        // Fallback to free shipping
        const fallbackOptions = [
          {
            service: "FREE SHIPPING",
            code: "FREE",
            cost: 0,
            currency: "USD",
            deliveryDays: "1-5 business days",
            description: "Free shipping on all BMR products",
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
    []
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
