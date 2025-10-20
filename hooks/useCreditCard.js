import { useState, useCallback } from "react";

// Credit card type configurations
const CARD_TYPES = {
  visa: {
    name: "Visa",
    pattern: /^4/,
    lengths: [13, 16, 19],
    icon: "visa",
  },
  mastercard: {
    name: "Mastercard",
    pattern: /^5[1-5]|^2[2-7]/,
    lengths: [16],
    icon: "mastercard",
  },
  amex: {
    name: "American Express",
    pattern: /^3[47]/,
    lengths: [15],
    icon: "amex",
  },
  discover: {
    name: "Discover",
    pattern: /^6(?:011|5)/,
    lengths: [16],
    icon: "discover",
  },
  diners: {
    name: "Diners Club",
    pattern: /^3[0689]/,
    lengths: [14],
    icon: "diners",
  },
  jcb: {
    name: "JCB",
    pattern: /^35/,
    lengths: [16],
    icon: "jcb",
  },
};

export function useCreditCard() {
  const [detectedType, setDetectedType] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  // Format card number with spaces
  const formatCardNumber = useCallback((value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, "");

    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();

    return formatted;
  }, []);

  // Detect credit card type based on number
  const detectCardType = useCallback((cardNumber) => {
    const cleaned = cardNumber.replace(/\D/g, "");

    for (const [type, config] of Object.entries(CARD_TYPES)) {
      if (config.pattern.test(cleaned)) {
        return { type, ...config };
      }
    }

    return null;
  }, []);

  // Luhn algorithm for card number validation
  const luhnCheck = useCallback((cardNumber) => {
    const cleaned = cardNumber.replace(/\D/g, "");

    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    // Process digits from right to left
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }, []);

  // Validate card number
  const validateCardNumber = useCallback(
    (cardNumber) => {
      const cleaned = cardNumber.replace(/\D/g, "");
      const cardType = detectCardType(cardNumber);

      if (!cardType) {
        return {
          isValid: false,
          message: "Invalid card type",
        };
      }

      if (!cardType.lengths.includes(cleaned.length)) {
        return {
          isValid: false,
          message: `Invalid length for ${cardType.name}`,
        };
      }

      if (!luhnCheck(cardNumber)) {
        return {
          isValid: false,
          message: "Invalid card number",
        };
      }

      return {
        isValid: true,
        message: `${cardType.name} card is valid`,
      };
    },
    [detectCardType, luhnCheck]
  );

  // Handle card number change
  const handleCardNumberChange = useCallback(
    (value) => {
      const formatted = formatCardNumber(value);
      const cardType = detectCardType(value);
      const validation = validateCardNumber(value);

      setDetectedType(cardType);
      setIsValid(validation.isValid);
      setValidationMessage(validation.message);

      return formatted;
    },
    [formatCardNumber, detectCardType, validateCardNumber]
  );

  // Format expiry date
  const formatExpiryDate = useCallback((value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, "");

    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }

    return cleaned;
  }, []);

  // Validate expiry date
  const validateExpiryDate = useCallback((expiryDate) => {
    const [month, year] = expiryDate.split("/");

    if (!month || !year) {
      return {
        isValid: false,
        message: "Please enter expiry date",
      };
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt("20" + year);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (monthNum < 1 || monthNum > 12) {
      return {
        isValid: false,
        message: "Invalid month",
      };
    }

    if (
      yearNum < currentYear ||
      (yearNum === currentYear && monthNum < currentMonth)
    ) {
      return {
        isValid: false,
        message: "Card has expired",
      };
    }

    return {
      isValid: true,
      message: "Valid expiry date",
    };
  }, []);

  // Validate CVV
  const validateCVV = useCallback((cvv, cardType) => {
    const cleaned = cvv.replace(/\D/g, "");
    const expectedLength = cardType?.name === "American Express" ? 4 : 3;

    if (cleaned.length !== expectedLength) {
      return {
        isValid: false,
        message: `CVV must be ${expectedLength} digits`,
      };
    }

    return {
      isValid: true,
      message: "Valid CVV",
    };
  }, []);

  return {
    detectedType,
    isValid,
    validationMessage,
    formatCardNumber,
    detectCardType,
    validateCardNumber,
    handleCardNumberChange,
    formatExpiryDate,
    validateExpiryDate,
    validateCVV,
    CARD_TYPES,
  };
}
