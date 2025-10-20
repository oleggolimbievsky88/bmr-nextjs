export default function CreditCardIcons({ detectedType, className = "" }) {
  const getCardIcon = (cardType) => {
    switch (cardType) {
      case "visa":
        return (
          <svg
            width="40"
            height="25"
            viewBox="0 0 40 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="25" rx="4" fill="#1A1F71" />
            <text
              x="20"
              y="16"
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontWeight="bold"
            >
              VISA
            </text>
          </svg>
        );
      case "mastercard":
        return (
          <svg
            width="40"
            height="25"
            viewBox="0 0 40 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="25" rx="4" fill="#EB001B" />
            <circle cx="15" cy="12.5" r="6" fill="#F79E1B" />
            <circle cx="25" cy="12.5" r="6" fill="#FF5F00" />
            <text
              x="20"
              y="20"
              textAnchor="middle"
              fill="white"
              fontSize="6"
              fontWeight="bold"
            >
              mastercard
            </text>
          </svg>
        );
      case "amex":
        return (
          <svg
            width="40"
            height="25"
            viewBox="0 0 40 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="25" rx="4" fill="#006FCF" />
            <text
              x="20"
              y="10"
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontWeight="bold"
            >
              AMEX
            </text>
            <text x="20" y="18" textAnchor="middle" fill="white" fontSize="6">
              American Express
            </text>
          </svg>
        );
      case "discover":
        return (
          <svg
            width="40"
            height="25"
            viewBox="0 0 40 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="25" rx="4" fill="#FF6000" />
            <text
              x="20"
              y="10"
              textAnchor="middle"
              fill="white"
              fontSize="6"
              fontWeight="bold"
            >
              discover
            </text>
            <text x="20" y="18" textAnchor="middle" fill="white" fontSize="4">
              DISCOVER
            </text>
          </svg>
        );
      case "diners":
        return (
          <svg
            width="40"
            height="25"
            viewBox="0 0 40 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="25" rx="4" fill="#0079BE" />
            <text
              x="20"
              y="10"
              textAnchor="middle"
              fill="white"
              fontSize="6"
              fontWeight="bold"
            >
              Diners
            </text>
            <text x="20" y="18" textAnchor="middle" fill="white" fontSize="4">
              Club
            </text>
          </svg>
        );
      case "jcb":
        return (
          <svg
            width="40"
            height="25"
            viewBox="0 0 40 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="25" rx="4" fill="#003E7E" />
            <text
              x="20"
              y="15"
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontWeight="bold"
            >
              JCB
            </text>
          </svg>
        );
      default:
        return (
          <svg
            width="40"
            height="25"
            viewBox="0 0 40 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="25" rx="4" fill="#6c757d" />
            <text x="20" y="15" textAnchor="middle" fill="white" fontSize="6">
              CARD
            </text>
          </svg>
        );
    }
  };

  return (
    <div className={`credit-card-icons ${className}`}>
      {detectedType ? (
        <div className="detected-card">
          {getCardIcon(detectedType.type)}
          <span className="card-name">{detectedType.name}</span>
        </div>
      ) : (
        <div className="all-cards">
          {getCardIcon("visa")}
          {getCardIcon("mastercard")}
          {getCardIcon("amex")}
          {getCardIcon("discover")}
        </div>
      )}
    </div>
  );
}
