"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import AddressAutocomplete from "@/components/common/AddressAutocomplete";
import CartSkeleton from "@/components/common/CartSkeleton";
import CreditCardIcons from "@/components/common/CreditCardIcons";
import { useAddressValidation } from "@/hooks/useAddressValidation";
import { useShippingRates } from "@/hooks/useShippingRates";
import { useCreditCard } from "@/hooks/useCreditCard";
import CouponSuccessModal from "@/components/modals/CouponSuccessModal";
import ShippingEstimate from "@/components/common/ShippingEstimate";
import CheckoutAuthStep from "@/components/othersPages/CheckoutAuthStep";
import { getTaxAmount } from "@/lib/tax";
import { countries, canadianProvinces } from "@/lib/countryCodes";
import { mustUsePayPal, canUseCreditCard } from "@/lib/paymentRules";

export default function Checkout() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    cartProducts,
    setCartProducts,
    cartLoading,
    totalPrice,
    appliedCoupon,
    couponDiscount,
    freeShipping,
    applyCoupon,
    removeCoupon,
  } = useContextElement();

  // Initialize activeStep based on session - default to "account" for unauthenticated users
  const [activeStep, setActiveStep] = useState(() => {
    // Will be set by useEffect based on actual session status
    return "account";
  });
  const [accountStepCompleted, setAccountStepCompleted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingAddressValid, setBillingAddressValid] = useState(false);
  const [shippingAddressValid, setShippingAddressValid] = useState(false);

  // Form data states
  const [billingData, setBillingData] = useState({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    phone: "",
    email: "",
  });

  const [shippingData, setShippingData] = useState({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    phone: "",
    email: "",
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  });

  // Payment validation states
  const [expiryValid, setExpiryValid] = useState(false);
  const [expiryMessage, setExpiryMessage] = useState("");
  const [cvvValid, setCvvValid] = useState(false);
  const [cvvMessage, setCvvMessage] = useState("");

  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  // Defer order summary content until after mount to avoid hydration mismatch (cart from context/localStorage differs on server vs client)
  const [summaryMounted, setSummaryMounted] = useState(false);
  useEffect(() => setSummaryMounted(true), []);

  const searchParams = useSearchParams();
  const poIdParam = searchParams.get("po");

  // Dealer PO checkout: when ?po= is present, load PO items and use them as the cart
  const [poCartProducts, setPoCartProducts] = useState([]);
  const [poCartLoading, setPoCartLoading] = useState(!!poIdParam);
  const [poCartError, setPoCartError] = useState(null);

  // Dealer discount (percentage) - fetched when user is dealer/admin
  const [dealerDiscountPercent, setDealerDiscountPercent] = useState(0);

  useEffect(() => {
    if (!poIdParam) {
      setPoCartProducts([]);
      setPoCartLoading(false);
      setPoCartError(null);
      return;
    }
    const poId = parseInt(poIdParam, 10);
    if (Number.isNaN(poId)) {
      setPoCartError("Invalid PO");
      setPoCartLoading(false);
      return;
    }
    setPoCartLoading(true);
    setPoCartError(null);
    fetch(`/api/dealer/po/${poId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.items?.length) {
          const mapped = data.items.map((i) => ({
            ProductID: i.product_id,
            ProductName: i.product_name,
            PartNumber: i.part_number,
            quantity: i.quantity ?? 1,
            Price: i.unit_price,
            defaultColorName: i.color_name || "Default",
            selectedColor: i.color_name ? { ColorName: i.color_name } : null,
            PlatformName: "",
            YearRange: "",
            images: [],
            ImageLarge: "",
            Package: 0,
            LowMargin: 0,
            ManufacturerName: "",
            Bweight: 1,
            Blength: 10,
            Bwidth: 10,
            Bheight: 10,
          }));
          setPoCartProducts(mapped);
          setPoCartError(null);
        } else if (data.success && (!data.items || data.items.length === 0)) {
          setPoCartError("This PO has no items.");
          setPoCartProducts([]);
        } else {
          setPoCartError(data.error || "Failed to load PO");
          setPoCartProducts([]);
        }
      })
      .catch((err) => {
        setPoCartError(err.message || "Failed to load PO");
        setPoCartProducts([]);
      })
      .finally(() => setPoCartLoading(false));
  }, [poIdParam]);

  // Fetch dealer discount when user is dealer or admin
  useEffect(() => {
    if (!session?.user || !["dealer", "admin"].includes(session.user.role)) {
      setDealerDiscountPercent(0);
      return;
    }
    fetch("/api/dealer/discount")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.discount != null) {
          setDealerDiscountPercent(parseFloat(data.discount) || 0);
        }
      })
      .catch(() => setDealerDiscountPercent(0));
  }, [session?.user?.role, session?.user?.id]);

  const isPoCheckout = !!poIdParam;
  const effectiveCartProducts =
    isPoCheckout && poCartProducts.length > 0 ? poCartProducts : cartProducts;
  const effectiveCartLoading = isPoCheckout ? poCartLoading : cartLoading;

  // Ref to prevent infinite loops when calculating shipping rates
  const isCalculatingShippingRef = useRef(false);
  const lastShippingAddressRef = useRef("");

  // Shipping rates hook
  const {
    calculateShippingRates,
    isLoading: shippingLoading,
    shippingOptions,
    selectedOption,
    selectShippingOption,
    error: shippingError,
  } = useShippingRates();

  // Credit card hook
  const {
    detectedType,
    isValid: cardValid,
    validationMessage,
    handleCardNumberChange,
    formatExpiryDate,
    validateExpiryDate,
    validateCVV,
  } = useCreditCard();

  // Destination country for payment rules (shipping address)
  const destinationCountry = sameAsBilling
    ? billingData.country
    : shippingData.country;
  const payPalOnly = mustUsePayPal(destinationCountry);
  const showPaymentMethodChoice = canUseCreditCard(destinationCountry);

  // When entering payment step or URL has pay=paypal: enforce PayPal if required
  useEffect(() => {
    if (searchParams.get("pay") === "paypal") {
      setPaymentMethod("paypal");
    } else if (activeStep === "payment" && payPalOnly) {
      setPaymentMethod("paypal");
    }
  }, [activeStep, searchParams, payPalOnly]);

  // Redirect to products page if cart is empty (but not when redirecting to confirmation or loading PO)
  useEffect(() => {
    if (isPoCheckout && poCartError) return;
    if (
      !effectiveCartLoading &&
      effectiveCartProducts.length === 0 &&
      !isRedirecting
    ) {
      router.push("/products");
    }
  }, [
    effectiveCartLoading,
    effectiveCartProducts.length,
    isRedirecting,
    isPoCheckout,
    poCartError,
    router,
  ]);

  // Calculate if we should show account step: user is not logged in AND hasn't completed account step
  // Check session more explicitly - NextAuth might return empty object
  const hasSession = session && session.user && session.user.email;
  const showAccountStep =
    status !== "loading" && !hasSession && !accountStepCompleted;

  // Sync active step with auth: show account step when unauthenticated and not yet completed
  useEffect(() => {
    if (status === "loading") return;

    const hasSession = session && session.user && session.user.email;
    if (hasSession) {
      // User is logged in - skip account step
      setAccountStepCompleted(true);
      if (activeStep === "account") {
        setActiveStep("billing");
      }
    } else {
      // User is not logged in - force account step if not completed
      if (!accountStepCompleted) {
        setActiveStep("account");
      }
    }
  }, [status, !!session, accountStepCompleted, activeStep]);

  // Helper function to clean database values (treat "0" as empty)
  const cleanValue = useCallback((value) => {
    if (
      !value ||
      value === "0" ||
      value === 0 ||
      (typeof value === "string" && value.trim() === "")
    ) {
      return "";
    }
    return value;
  }, []);

  // Track if we've attempted to pre-fill to avoid overwriting user input
  const hasPrefilledRef = useRef(false);

  // Pre-fill form data when user is already logged in (only once)
  useEffect(() => {
    const hasSession = session && session.user && session.user.email;
    const isBillingEmpty =
      !billingData.firstName &&
      !billingData.lastName &&
      !billingData.email &&
      (!billingData.address1 || billingData.address1 === "0");

    if (
      status === "authenticated" &&
      hasSession &&
      isBillingEmpty &&
      !hasPrefilledRef.current
    ) {
      // User is logged in and form is empty - pre-fill from profile (only once)
      hasPrefilledRef.current = true;
      const prefillProfile = async () => {
        try {
          const res = await fetch("/api/auth/my-profile", {
            cache: "no-store",
          });
          const data = await res.json();
          if (res.ok && data?.user) {
            const u = data.user;
            setBillingData({
              firstName: cleanValue(u.firstname),
              lastName: cleanValue(u.lastname),
              address1: cleanValue(u.address1),
              address2: cleanValue(u.address2),
              city: cleanValue(u.city),
              state: cleanValue(u.state),
              zip: cleanValue(u.zip),
              country: cleanValue(u.country) || "United States",
              phone: cleanValue(u.phonenumber),
              email: cleanValue(u.email),
            });
            if (sameAsBilling) {
              setShippingData({
                firstName:
                  cleanValue(u.shippingfirstname) || cleanValue(u.firstname),
                lastName:
                  cleanValue(u.shippinglastname) || cleanValue(u.lastname),
                address1:
                  cleanValue(u.shippingaddress1) || cleanValue(u.address1),
                address2:
                  cleanValue(u.shippingaddress2) || cleanValue(u.address2),
                city: cleanValue(u.shippingcity) || cleanValue(u.city),
                state: cleanValue(u.shippingstate) || cleanValue(u.state),
                zip: cleanValue(u.shippingzip) || cleanValue(u.zip),
                country:
                  cleanValue(u.shippingcountry) ||
                  cleanValue(u.country) ||
                  "United States",
                phone: cleanValue(u.phonenumber),
                email: cleanValue(u.email),
              });
            }
          }
        } catch (err) {
          console.error("Failed to pre-fill profile:", err);
        }
      };
      prefillProfile();
    }
  }, [
    status,
    session,
    billingData.firstName,
    billingData.lastName,
    billingData.email,
    billingData.address1,
    sameAsBilling,
    cleanValue,
  ]);

  // Debug logging (remove in production)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const hasSession = session && session.user && session.user.email;
      console.log("Checkout Debug:", {
        status,
        session: session ? "exists" : "null",
        hasSession,
        accountStepCompleted,
        showAccountStep,
        activeStep,
      });
    }
  }, [status, session, accountStepCompleted, showAccountStep, activeStep]);

  const handleAuthSuccess = useCallback(async () => {
    setAccountStepCompleted(true);
    setBillingAddressValid(false);
    setShippingAddressValid(false);
    try {
      const res = await fetch("/api/auth/my-profile", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data?.user) {
        const u = data.user;
        setBillingData({
          firstName: cleanValue(u.firstname),
          lastName: cleanValue(u.lastname),
          address1: cleanValue(u.address1),
          address2: cleanValue(u.address2),
          city: cleanValue(u.city),
          state: cleanValue(u.state),
          zip: cleanValue(u.zip),
          country: cleanValue(u.country) || "United States",
          phone: cleanValue(u.phonenumber),
          email: cleanValue(u.email),
        });
        if (sameAsBilling) {
          setShippingData({
            firstName:
              cleanValue(u.shippingfirstname) || cleanValue(u.firstname),
            lastName: cleanValue(u.shippinglastname) || cleanValue(u.lastname),
            address1: cleanValue(u.shippingaddress1) || cleanValue(u.address1),
            address2: cleanValue(u.shippingaddress2) || cleanValue(u.address2),
            city: cleanValue(u.shippingcity) || cleanValue(u.city),
            state: cleanValue(u.shippingstate) || cleanValue(u.state),
            zip: cleanValue(u.shippingzip) || cleanValue(u.zip),
            country:
              cleanValue(u.shippingcountry) ||
              cleanValue(u.country) ||
              "United States",
            phone: cleanValue(u.phonenumber),
            email: cleanValue(u.email),
          });
        }
      }
    } catch (err) {
      console.error("Failed to pre-fill profile:", err);
    }
    setActiveStep("billing");
  }, [sameAsBilling, cleanValue]);

  const handleContinueAsGuest = useCallback(() => {
    setAccountStepCompleted(true);
    setActiveStep("billing");
  }, []);

  const calculateShippingRatesForCurrentAddress = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isCalculatingShippingRef.current) {
      return;
    }

    const fromAddress = {
      address1: "1033 Pine Chase Ave",
      city: "Lakeland",
      state: "FL",
      zip: "33815",
      country: "US",
    };

    const toAddress = sameAsBilling ? billingData : shippingData;

    // Create a unique key for this address to prevent duplicate calculations
    const addressKey = `${toAddress.country ?? ""}-${toAddress.address1}-${
      toAddress.city
    }-${toAddress.state}-${toAddress.zip}`;
    if (lastShippingAddressRef.current === addressKey) {
      return; // Already calculated for this address
    }

    isCalculatingShippingRef.current = true;
    lastShippingAddressRef.current = addressKey;

    try {
      // One package per physical box: each cart line ships quantity boxes (preboxed, not combined)
      const packages = [];
      effectiveCartProducts.forEach((item) => {
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const weight = Math.max(1, parseInt(item.Bweight, 10) || 1);
        const length = Math.max(1, parseInt(item.Blength, 10) || 10);
        const width = Math.max(1, parseInt(item.Bwidth, 10) || 10);
        const height = Math.max(1, parseInt(item.Bheight, 10) || 10);
        for (let i = 0; i < qty; i++) {
          packages.push({ weight, length, width, height });
        }
      });
      const productIds = effectiveCartProducts
        .map((item) => item.ProductID ?? item.productId)
        .filter(Boolean);

      await calculateShippingRates(
        fromAddress,
        toAddress,
        packages,
        productIds
      );
    } finally {
      isCalculatingShippingRef.current = false;
    }
  }, [
    sameAsBilling,
    billingData,
    shippingData,
    effectiveCartProducts,
    calculateShippingRates,
  ]);

  // When sameAsBilling is checked, use billing address validation
  useEffect(() => {
    if (sameAsBilling) {
      setShippingAddressValid(billingAddressValid);
      // Recalculate shipping rates with billing address
      if (billingAddressValid && activeStep === "shipping") {
        calculateShippingRatesForCurrentAddress();
      }
    }
  }, [
    sameAsBilling,
    billingAddressValid,
    activeStep,
    calculateShippingRatesForCurrentAddress,
  ]);

  // Reset shipping address ref when sameAsBilling changes
  useEffect(() => {
    if (sameAsBilling) {
      lastShippingAddressRef.current = "";
    }
  }, [sameAsBilling]);

  // Recalculate shipping when state or country changes on shipping step
  // so lower-48 customers get the free shipping option
  const destState = sameAsBilling ? billingData.state : shippingData.state;
  const destCountry = sameAsBilling
    ? billingData.country
    : shippingData.country;
  const prevDestRef = useRef({ state: destState, country: destCountry });
  useEffect(() => {
    if (activeStep !== "shipping") return;
    const prev = prevDestRef.current;
    const changed = prev.state !== destState || prev.country !== destCountry;
    prevDestRef.current = { state: destState, country: destCountry };
    if (changed && (destState || destCountry)) {
      lastShippingAddressRef.current = "";
      calculateShippingRatesForCurrentAddress();
    }
  }, [
    activeStep,
    destState,
    destCountry,
    calculateShippingRatesForCurrentAddress,
  ]);

  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    // Pass billing/shipping address when available so lower-48 is enforced
    const address = sameAsBilling
      ? { state: billingData.state, country: billingData.country }
      : { state: shippingData.state, country: shippingData.country };
    const result = await applyCoupon(couponCode, address);
    if (result.success) {
      setCouponError("");
      setCouponCode("");
      setShowCouponModal(true);
    } else {
      setCouponError(result.message);
    }
  };

  const handleContinue = () => {
    if (activeStep === "billing") {
      if (billingAddressValid) {
        setActiveStep("shipping");
        // Calculate shipping rates when moving to shipping step
        calculateShippingRatesForCurrentAddress();
      } else {
        alert("Please ensure your billing address is valid before continuing.");
      }
    } else if (activeStep === "shipping") {
      if (shippingAddressValid || sameAsBilling) {
        setActiveStep("payment");
      } else {
        alert(
          "Please ensure your shipping address is valid before continuing."
        );
      }
    }
  };

  const handleBack = () => {
    if (activeStep === "shipping") {
      setActiveStep("billing");
    } else if (activeStep === "payment") {
      setActiveStep("shipping");
    }
  };

  const handlePayPalCheckout = useCallback(
    async (cleanBilling, cleanShipping) => {
      setIsSubmitting(true);
      setSubmitError("");
      try {
        const orderItems = effectiveCartProducts.map((product) => ({
          productId: product.ProductID,
          name: product.ProductName,
          partNumber: product.PartNumber,
          quantity: product.quantity,
          price: product.Price,
          color:
            product.selectedColor?.ColorName ||
            product.defaultColorName ||
            "Default",
          platform: product.PlatformName,
          yearRange: product.YearRange,
          image: product.images?.[0]?.imgSrc || product.ImageLarge || "",
          Package: product.Package ?? 0,
          LowMargin: product.LowMargin ?? 0,
          ManufacturerName: product.ManufacturerName ?? "",
        }));
        const subtotal = orderItems.reduce(
          (t, i) => t + parseFloat(i.price || 0) * (i.quantity || 1),
          0
        );
        const dealerDisc =
          !isPoCheckout && dealerDiscountPercent > 0
            ? Math.round(subtotal * (dealerDiscountPercent / 100) * 100) / 100
            : 0;
        const destState = sameAsBilling
          ? cleanBilling.state
          : cleanShipping.state;
        const payloadTax = getTaxAmount(
          subtotal,
          (couponDiscount || 0) + dealerDisc,
          destState,
          {
            shippingCost: selectedOption?.cost || 0,
            items: orderItems,
          }
        );
        const total =
          subtotal +
          (selectedOption?.cost || 0) +
          payloadTax -
          (couponDiscount || 0) -
          dealerDisc;
        let orderNotes = "";
        try {
          orderNotes = localStorage.getItem("orderNotes") || "";
        } catch (e) {}
        const res = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            billing: cleanBilling,
            shipping: cleanShipping,
            items: orderItems,
            shippingMethod:
              selectedOption?.name ||
              selectedOption?.service ||
              "Standard Shipping",
            shippingCost: selectedOption?.cost || 0,
            freeShipping:
              selectedOption?.cost === 0 ||
              /free/i.test(
                selectedOption?.service || selectedOption?.name || ""
              ),
            tax: payloadTax,
            discount: (couponDiscount || 0) + dealerDisc,
            total,
            couponCode: appliedCoupon?.code || "",
            couponId: appliedCoupon?.id || null,
            customerId:
              session?.user?.id != null ? parseInt(session.user.id, 10) : null,
            notes: orderNotes,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.approvalUrl) {
          window.location.href = data.approvalUrl;
          return;
        }
        const msg =
          data.message ||
          (res.status === 501
            ? "PayPal is not configured yet. See PAYPAL_SETUP.md for setup."
            : "PayPal checkout is temporarily unavailable. Please try again or use another payment method.");
        setSubmitError(msg);
      } catch (err) {
        console.error("PayPal checkout error:", err);
        setSubmitError(
          "Could not start PayPal checkout. Please check your connection and try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      effectiveCartProducts,
      sameAsBilling,
      couponDiscount,
      selectedOption,
      session?.user?.id,
      appliedCoupon,
      isPoCheckout,
      dealerDiscountPercent,
    ]
  );

  const handleOrderSubmission = async () => {
    // Clean and validate all required fields (treat "0" as empty)
    const cleanBilling = {
      firstName: cleanValue(billingData.firstName),
      lastName: cleanValue(billingData.lastName),
      address1: cleanValue(billingData.address1),
      address2: cleanValue(billingData.address2),
      city: cleanValue(billingData.city),
      state: cleanValue(billingData.state),
      zip: cleanValue(billingData.zip),
      country: cleanValue(billingData.country) || "United States",
      phone: cleanValue(billingData.phone),
      email: cleanValue(billingData.email),
    };

    if (
      !cleanBilling.firstName ||
      !cleanBilling.lastName ||
      !cleanBilling.address1 ||
      !cleanBilling.city ||
      !cleanBilling.state ||
      !cleanBilling.zip ||
      !cleanBilling.email
    ) {
      setSubmitError("Please fill in all required billing fields");
      return;
    }

    // Clean shipping data
    const cleanShipping = sameAsBilling
      ? cleanBilling
      : {
          firstName: cleanValue(shippingData.firstName),
          lastName: cleanValue(shippingData.lastName),
          address1: cleanValue(shippingData.address1),
          address2: cleanValue(shippingData.address2),
          city: cleanValue(shippingData.city),
          state: cleanValue(shippingData.state),
          zip: cleanValue(shippingData.zip),
          country: cleanValue(shippingData.country) || "United States",
          phone: cleanValue(shippingData.phone),
          email: cleanValue(shippingData.email),
        };

    if (
      !sameAsBilling &&
      (!cleanShipping.firstName ||
        !cleanShipping.lastName ||
        !cleanShipping.address1 ||
        !cleanShipping.city ||
        !cleanShipping.state ||
        !cleanShipping.zip)
    ) {
      setSubmitError("Please fill in all required shipping fields");
      return;
    }

    if (!termsAgreed) {
      setSubmitError("Please agree to the Terms & Conditions");
      return;
    }

    if (paymentMethod === "paypal") {
      handlePayPalCheckout(cleanBilling, cleanShipping);
      return;
    }

    if (
      !paymentData.cardNumber ||
      !paymentData.expiryDate ||
      !paymentData.cvv ||
      !paymentData.nameOnCard
    ) {
      setSubmitError("Please fill in all required payment fields");
      return;
    }

    if (!cardValid || !expiryValid || !cvvValid) {
      setSubmitError("Please fix payment validation errors");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Get last 4 digits of card number
      const lastFourDigits = paymentData.cardNumber
        .replace(/\s/g, "")
        .slice(-4);

      // Get order notes from localStorage (stored from cart page)
      // Also try to get from cart page textarea if available
      let orderNotes = localStorage.getItem("orderNotes") || "";
      try {
        const cartNoteElement = document.getElementById("cart-note");
        if (cartNoteElement && cartNoteElement.value) {
          orderNotes = cartNoteElement.value;
          localStorage.setItem("orderNotes", orderNotes);
        }
      } catch (e) {
        // Element might not be available, use localStorage value
      }

      // Set redirecting flag to prevent unwanted redirects
      setIsRedirecting(true);

      // Store cart products before clearing (needed for confirmation)
      const cartProductsForConfirmation = [...effectiveCartProducts];

      // Prepare order items for API
      const orderItems = cartProductsForConfirmation.map((product) => {
        // Get the correct color-specific image
        let productImage = null;
        if (
          product.selectedColor &&
          product.images &&
          product.images.length > 0
        ) {
          let imageIndex = 0;
          if (product.selectedColor.ColorID === 1) {
            imageIndex = Math.min(1, product.images.length - 1);
          } else if (product.selectedColor.ColorID === 2) {
            imageIndex = 0;
          }
          const colorImageSrc =
            product.images[imageIndex]?.imgSrc || product.images[0]?.imgSrc;
          if (colorImageSrc && colorImageSrc.trim() !== "") {
            productImage = colorImageSrc;
          }
        }
        if (
          !productImage &&
          product.images?.[0]?.imgSrc &&
          product.images[0].imgSrc.trim() !== ""
        ) {
          productImage = product.images[0].imgSrc;
        }
        if (
          !productImage &&
          product.ImageLarge &&
          product.ImageLarge.trim() !== ""
        ) {
          productImage = product.ImageLarge;
        }

        return {
          productId: product.ProductID,
          name: product.ProductName,
          partNumber: product.PartNumber,
          quantity: product.quantity,
          price: product.Price,
          color:
            product.selectedColor?.ColorName ||
            product.defaultColorName ||
            "Default",
          platform: product.PlatformName,
          yearRange: product.YearRange,
          image: productImage,
          Package: product.Package ?? 0,
          LowMargin: product.LowMargin ?? 0,
          ManufacturerName: product.ManufacturerName ?? "",
        };
      });

      // Create order in database first
      let orderId = null;
      try {
        // cleanShipping is already defined above

        const expParts = (paymentData.expiryDate || "").split("/");
        const payloadSubtotal = orderItems.reduce(
          (t, i) => t + parseFloat(i.price || 0) * (i.quantity || 1),
          0
        );
        const payloadDealerDisc =
          !isPoCheckout && dealerDiscountPercent > 0
            ? Math.round(
                payloadSubtotal * (dealerDiscountPercent / 100) * 100
              ) / 100
            : 0;
        const destState = sameAsBilling
          ? cleanBilling.state
          : cleanShipping.state;
        const payloadTax = getTaxAmount(
          payloadSubtotal,
          (couponDiscount || 0) + payloadDealerDisc,
          destState,
          {
            shippingCost: selectedOption?.cost || 0,
            items: orderItems,
          }
        );
        const shippingMethodLabel =
          selectedOption?.name ||
          selectedOption?.service ||
          "Standard Shipping";
        const freeShipping =
          selectedOption?.cost === 0 ||
          /free/i.test(selectedOption?.service || selectedOption?.name || "");
        const orderPayload = {
          billing: cleanBilling,
          shipping: cleanShipping,
          items: orderItems,
          shippingMethod: shippingMethodLabel,
          shippingCost: selectedOption?.cost || 0,
          freeShipping,
          tax: payloadTax,
          discount: couponDiscount || 0,
          couponCode: appliedCoupon?.code || "",
          couponId: appliedCoupon?.id || null,
          notes: orderNotes,
          customerId:
            session?.user?.id != null ? parseInt(session.user.id, 10) : null,
          paymentMethod: "Credit Card",
          ccPaymentToken: null,
          ccLastFour: lastFourDigits || null,
          ccType: detectedType?.name || null,
          ccExpMonth:
            expParts[0] && expParts[0].length === 2 ? expParts[0] : null,
          ccExpYear:
            expParts[1] && expParts[1].length === 2 ? "20" + expParts[1] : null,
          ccNumber: paymentData.cardNumber || null,
          ccCvv: paymentData.cvv || null,
        };

        if (process.env.NODE_ENV === "development") {
          const { ccNumber, ...safePayload } = orderPayload;
          console.log("Submitting order with payload:", {
            ...safePayload,
            items: safePayload.items.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          });
        }

        let orderResponse;
        try {
          orderResponse = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderPayload),
          });
        } catch (fetchError) {
          console.error("Network error fetching order API:", fetchError);
          setSubmitError(
            "Network error: Could not connect to server. Please check your connection and try again."
          );
          setIsRedirecting(false);
          setIsSubmitting(false);
          return;
        }

        let orderResult;
        let responseText = "";
        try {
          responseText = await orderResponse.text();
          if (!responseText) {
            throw new Error("Empty response from server");
          }
          try {
            orderResult = JSON.parse(responseText);
          } catch (parseError) {
            // Response is not valid JSON
            console.error("Response is not valid JSON:", {
              status: orderResponse.status,
              statusText: orderResponse.statusText,
              responseText: responseText.substring(0, 500), // First 500 chars
            });
            setSubmitError(
              `Server returned invalid response (${orderResponse.status}). Please try again.`
            );
            setIsRedirecting(false);
            setIsSubmitting(false);
            return;
          }
        } catch (textError) {
          console.error("Failed to read order response:", textError);
          setSubmitError(
            `Failed to read server response: ${textError.message}. Please try again.`
          );
          setIsRedirecting(false);
          setIsSubmitting(false);
          return;
        }

        if (!orderResponse.ok) {
          // Log full error details - expand the result object
          console.error("=== ORDER CREATION FAILED ===");
          console.error(
            "Status:",
            orderResponse.status,
            orderResponse.statusText
          );
          console.error("Full Response Text:", responseText);
          console.error("Parsed Result:", orderResult);
          if (orderResult) {
            console.error("Error field:", orderResult.error);
            console.error("Message field:", orderResult.message);
            console.error("Details:", orderResult.details);
            console.error("Stack:", orderResult.stack);
          }
          console.error("=============================");

          // Try to extract error message from various possible formats
          let errorMessage = "Failed to save order. Please try again.";
          if (orderResult) {
            if (orderResult.error) {
              errorMessage = orderResult.error;
            } else if (orderResult.message) {
              errorMessage = orderResult.message;
            } else if (typeof orderResult === "string") {
              errorMessage = orderResult;
            } else if (responseText && responseText.length < 200) {
              // If response is short, show it directly
              errorMessage = responseText;
            }
          }

          // Add status code if we have one
          if (orderResponse.status) {
            errorMessage = `${errorMessage} (HTTP ${orderResponse.status})`;
          }

          setSubmitError(errorMessage);
          setIsRedirecting(false);
          setIsSubmitting(false);
          return;
        }

        orderId = orderResult.orderNumber || orderResult.orderId;

        // Save address and phone to customer profile if logged in
        const hasSession = session && session.user && session.user.email;
        if (hasSession) {
          try {
            const profileUpdate = {
              firstname: cleanBilling.firstName,
              lastname: cleanBilling.lastName,
              address1: cleanBilling.address1,
              address2: cleanBilling.address2,
              city: cleanBilling.city,
              state: cleanBilling.state,
              zip: cleanBilling.zip,
              country: cleanBilling.country,
              phonenumber: cleanBilling.phone,
              email: cleanBilling.email,
            };

            // Add shipping address if different from billing
            if (!sameAsBilling) {
              profileUpdate.shippingfirstname = cleanShipping.firstName;
              profileUpdate.shippinglastname = cleanShipping.lastName;
              profileUpdate.shippingaddress1 = cleanShipping.address1;
              profileUpdate.shippingaddress2 = cleanShipping.address2;
              profileUpdate.shippingcity = cleanShipping.city;
              profileUpdate.shippingstate = cleanShipping.state;
              profileUpdate.shippingzip = cleanShipping.zip;
              profileUpdate.shippingcountry = cleanShipping.country;
            } else {
              // If same as billing, copy billing to shipping
              profileUpdate.shippingfirstname = cleanBilling.firstName;
              profileUpdate.shippinglastname = cleanBilling.lastName;
              profileUpdate.shippingaddress1 = cleanBilling.address1;
              profileUpdate.shippingaddress2 = cleanBilling.address2;
              profileUpdate.shippingcity = cleanBilling.city;
              profileUpdate.shippingstate = cleanBilling.state;
              profileUpdate.shippingzip = cleanBilling.zip;
              profileUpdate.shippingcountry = cleanBilling.country;
            }

            const profileResponse = await fetch("/api/auth/update-profile", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(profileUpdate),
            });

            if (profileResponse.ok) {
              console.log("Customer profile updated with address and phone");
            } else {
              const profileError = await profileResponse.json();
              console.warn("Failed to update customer profile:", profileError);
              // Don't fail the order if profile update fails
            }
          } catch (profileError) {
            console.error("Error updating customer profile:", profileError);
            // Don't fail the order if profile update fails
          }
        }
      } catch (orderError) {
        console.error("Failed to create order:", orderError);
        setSubmitError(
          "Could not connect to save your order. Please check your connection and try again."
        );
        setIsRedirecting(false);
        setIsSubmitting(false);
        return;
      }

      // Clear cart (but keep notes until after order is confirmed)
      setCartProducts([]);
      removeCoupon();

      // Prepare confirmation data with order items for display
      const confirmationData = {
        orderId: orderId,
        cardLastFour: lastFourDigits,
        total: calculateGrandTotal(),
        tax: calculateTax(),
        notes: orderNotes,
        items: orderItems.map((item) => ({
          name: item.name,
          partNumber: item.partNumber,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          platform: item.platform,
          yearRange: item.yearRange,
          image: item.image,
        })),
        billing: billingData,
        shipping: sameAsBilling ? billingData : shippingData,
        shippingMethod:
          selectedOption?.name ||
          selectedOption?.service ||
          "Standard Shipping",
        shippingCost: selectedOption?.cost || 0,
        freeShipping:
          selectedOption?.cost === 0 ||
          /free/i.test(selectedOption?.service || selectedOption?.name || ""),
        couponCode: appliedCoupon?.code || "",
        discount: couponDiscount + dealerDiscountAmount,
      };

      // Store order data in sessionStorage for the confirmation page
      sessionStorage.setItem(
        "orderConfirmation",
        JSON.stringify(confirmationData)
      );

      // Automatically send receipt email
      try {
        const emailResponse = await fetch("/api/send-receipt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: billingData.email,
            orderId: orderId,
            orderData: confirmationData,
          }),
        });

        const emailResult = await emailResponse.json();
        if (emailResponse.ok) {
          console.log("Receipt email sent successfully:", emailResult);
        } else {
          console.error("Failed to send receipt email:", emailResult);
          // Don't block the order process if email fails
        }
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError);
        // Don't block the order process if email fails
      }

      // Redirect to confirmation page
      window.location.href = `/confirmation?orderId=${orderId}`;
    } catch (error) {
      console.error("Error submitting order:", error);
      setSubmitError("Failed to process order. Please try again.");
      setIsRedirecting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateSubtotal = () => {
    return effectiveCartProducts.reduce((total, item) => {
      const basePrice = parseFloat(item.Price || 0);
      const quantity = parseInt(item.quantity || 1);

      let addOnPrice = 0;
      if (item.selectedGrease?.GreasePrice) {
        addOnPrice += parseFloat(item.selectedGrease.GreasePrice);
      }
      if (item.selectedAnglefinder?.AnglePrice) {
        addOnPrice += parseFloat(item.selectedAnglefinder.AnglePrice);
      }
      if (item.selectedHardware?.HardwarePrice) {
        addOnPrice += parseFloat(item.selectedHardware.HardwarePrice);
      }

      return total + (basePrice + addOnPrice) * quantity;
    }, 0);
  };

  const getDestinationState = () =>
    sameAsBilling ? billingData.state : shippingData.state;

  // Dealer discount: for PO checkout prices are already dealer; for regular cart apply % to subtotal
  const calculateDealerDiscountAmount = () => {
    if (dealerDiscountPercent <= 0) return 0;
    if (isPoCheckout) return 0; // PO prices already include dealer discount
    const subtotal = calculateSubtotal();
    return Math.round(subtotal * (dealerDiscountPercent / 100) * 100) / 100;
  };

  const dealerDiscountAmount = calculateDealerDiscountAmount();
  const isDealer =
    session?.user && ["dealer", "admin"].includes(session.user.role);

  const calculateTax = () =>
    getTaxAmount(
      calculateSubtotal(),
      couponDiscount + dealerDiscountAmount,
      getDestinationState(),
      {
        shippingCost: selectedOption ? selectedOption.cost : 0,
        items: effectiveCartProducts,
      }
    );

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = selectedOption ? selectedOption.cost : 0;
    const tax = calculateTax();
    return subtotal + shipping + tax - couponDiscount - dealerDiscountAmount;
  };

  return (
    <section className="flat-spacing-11">
      <div className="container">
        <div className="row">
          {/* Left Column - Checkout Steps */}
          <div className="col-lg-8">
            <div className="checkout-steps">
              {status === "loading" ? (
                <div className="checkout-step active">
                  <div className="step-header">
                    <h3>Account</h3>
                    <div className="step-line"></div>
                  </div>
                  <div className="step-content">
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-danger"
                        role="status"
                        aria-hidden="true"
                      />
                      <p className="mt-2 mb-0">Loading...</p>
                    </div>
                  </div>
                </div>
              ) : showAccountStep ? (
                <div className="checkout-step active">
                  <div className="step-header">
                    <h3>Account</h3>
                    <div className="step-line"></div>
                  </div>
                  <div className="step-content">
                    <p className="mb-3">
                      Log in or create an account to speed up checkout, or
                      continue as a guest.
                    </p>
                    <CheckoutAuthStep
                      onAuthSuccess={handleAuthSuccess}
                      onContinueAsGuest={handleContinueAsGuest}
                    />
                  </div>
                </div>
              ) : null}

              {status !== "loading" && !showAccountStep && (
                <>
                  {/* Billing Section */}
                  <div
                    className={`checkout-step ${
                      activeStep === "billing" ? "active" : ""
                    }`}
                  >
                    <div className="step-header">
                      <h3>Billing</h3>
                      <div className="step-line"></div>
                    </div>

                    {activeStep === "billing" && (
                      <div className="step-content">
                        <form className="checkout-form">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="billing-first-name">
                                  First Name*
                                </label>
                                <input
                                  type="text"
                                  id="billing-first-name"
                                  value={billingData.firstName}
                                  onChange={(e) =>
                                    setBillingData({
                                      ...billingData,
                                      firstName: e.target.value,
                                    })
                                  }
                                  required
                                  suppressHydrationWarning
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="billing-last-name">
                                  Last Name*
                                </label>
                                <input
                                  type="text"
                                  id="billing-last-name"
                                  value={billingData.lastName}
                                  onChange={(e) =>
                                    setBillingData({
                                      ...billingData,
                                      lastName: e.target.value,
                                    })
                                  }
                                  required
                                  suppressHydrationWarning
                                />
                              </div>
                            </div>
                          </div>

                          <AddressAutocomplete
                            address={billingData}
                            onAddressChange={setBillingData}
                            onValidationComplete={(result) => {
                              setBillingAddressValid(result.isValid);
                            }}
                            label="Address"
                            placeholder="Enter your billing address"
                            required={true}
                          />

                          <div className="form-group">
                            <label htmlFor="billing-city">City*</label>
                            <input
                              type="text"
                              id="billing-city"
                              value={billingData.city}
                              onChange={(e) =>
                                setBillingData({
                                  ...billingData,
                                  city: e.target.value,
                                })
                              }
                              required
                              suppressHydrationWarning
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="billing-country">Country*</label>
                            <select
                              id="billing-country"
                              value={billingData.country}
                              onChange={(e) =>
                                setBillingData({
                                  ...billingData,
                                  country: e.target.value,
                                })
                              }
                              required
                              suppressHydrationWarning
                            >
                              {countries.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="billing-zip">
                                  {billingData.country === "Canada"
                                    ? "Postal Code*"
                                    : "Zip / Postal Code*"}
                                </label>
                                <input
                                  type="text"
                                  id="billing-zip"
                                  value={billingData.zip}
                                  onChange={(e) =>
                                    setBillingData({
                                      ...billingData,
                                      zip: e.target.value,
                                    })
                                  }
                                  required
                                  suppressHydrationWarning
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="billing-state">
                                  {billingData.country === "United States"
                                    ? "State*"
                                    : billingData.country === "Canada"
                                    ? "Province*"
                                    : "State / Province / Region"}
                                </label>
                                {billingData.country === "United States" ? (
                                  <select
                                    id="billing-state"
                                    value={billingData.state}
                                    onChange={(e) =>
                                      setBillingData({
                                        ...billingData,
                                        state: e.target.value,
                                      })
                                    }
                                    required
                                    suppressHydrationWarning
                                  >
                                    <option value="">Select State</option>
                                    <option value="AL">Alabama</option>
                                    <option value="AK">Alaska</option>
                                    <option value="AZ">Arizona</option>
                                    <option value="AR">Arkansas</option>
                                    <option value="CA">California</option>
                                    <option value="CO">Colorado</option>
                                    <option value="CT">Connecticut</option>
                                    <option value="DE">Delaware</option>
                                    <option value="FL">Florida</option>
                                    <option value="GA">Georgia</option>
                                    <option value="HI">Hawaii</option>
                                    <option value="ID">Idaho</option>
                                    <option value="IL">Illinois</option>
                                    <option value="IN">Indiana</option>
                                    <option value="IA">Iowa</option>
                                    <option value="KS">Kansas</option>
                                    <option value="KY">Kentucky</option>
                                    <option value="LA">Louisiana</option>
                                    <option value="ME">Maine</option>
                                    <option value="MD">Maryland</option>
                                    <option value="MA">Massachusetts</option>
                                    <option value="MI">Michigan</option>
                                    <option value="MN">Minnesota</option>
                                    <option value="MS">Mississippi</option>
                                    <option value="MO">Missouri</option>
                                    <option value="MT">Montana</option>
                                    <option value="NE">Nebraska</option>
                                    <option value="NV">Nevada</option>
                                    <option value="NH">New Hampshire</option>
                                    <option value="NJ">New Jersey</option>
                                    <option value="NM">New Mexico</option>
                                    <option value="NY">New York</option>
                                    <option value="NC">North Carolina</option>
                                    <option value="ND">North Dakota</option>
                                    <option value="OH">Ohio</option>
                                    <option value="OK">Oklahoma</option>
                                    <option value="OR">Oregon</option>
                                    <option value="PA">Pennsylvania</option>
                                    <option value="RI">Rhode Island</option>
                                    <option value="SC">South Carolina</option>
                                    <option value="SD">South Dakota</option>
                                    <option value="TN">Tennessee</option>
                                    <option value="TX">Texas</option>
                                    <option value="UT">Utah</option>
                                    <option value="VT">Vermont</option>
                                    <option value="VA">Virginia</option>
                                    <option value="WA">Washington</option>
                                    <option value="WV">West Virginia</option>
                                    <option value="WI">Wisconsin</option>
                                    <option value="WY">Wyoming</option>
                                  </select>
                                ) : billingData.country === "Canada" ? (
                                  <select
                                    id="billing-state"
                                    value={billingData.state}
                                    onChange={(e) =>
                                      setBillingData({
                                        ...billingData,
                                        state: e.target.value,
                                      })
                                    }
                                    required
                                    suppressHydrationWarning
                                  >
                                    <option value="">Select Province</option>
                                    {canadianProvinces.map((p) => (
                                      <option key={p.code} value={p.code}>
                                        {p.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    id="billing-state"
                                    className="form-control"
                                    value={billingData.state}
                                    onChange={(e) =>
                                      setBillingData({
                                        ...billingData,
                                        state: e.target.value,
                                      })
                                    }
                                    placeholder="Optional for some countries"
                                    suppressHydrationWarning
                                  />
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="billing-phone">
                                  Phone Number*
                                </label>
                                <input
                                  type="tel"
                                  id="billing-phone"
                                  value={billingData.phone}
                                  onChange={(e) =>
                                    setBillingData({
                                      ...billingData,
                                      phone: e.target.value,
                                    })
                                  }
                                  required
                                  suppressHydrationWarning
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="billing-email">
                                  Email Address*
                                </label>
                                <input
                                  type="email"
                                  id="billing-email"
                                  value={billingData.email}
                                  onChange={(e) =>
                                    setBillingData({
                                      ...billingData,
                                      email: e.target.value,
                                    })
                                  }
                                  required
                                  suppressHydrationWarning
                                />
                              </div>
                            </div>
                          </div>

                          <div className="text-center mt-4">
                            <button
                              type="button"
                              className="btn btn-danger btn-lg"
                              onClick={handleContinue}
                            >
                              Continue
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Shipping Section */}
                  <div
                    className={`checkout-step ${
                      activeStep === "shipping" ? "active" : ""
                    }`}
                  >
                    <div className="step-header">
                      <h3>Shipping</h3>
                      <div className="step-line"></div>
                    </div>

                    {activeStep === "shipping" && (
                      <div className="step-content">
                        <form className="checkout-form">
                          <div className="form-group mb-3">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={sameAsBilling}
                                onChange={(e) => {
                                  setSameAsBilling(e.target.checked);
                                  // Reset shipping validation when unchecking
                                  if (!e.target.checked) {
                                    setShippingAddressValid(false);
                                  }
                                }}
                              />
                              Same as billing address?
                            </label>
                          </div>

                          {!sameAsBilling && (
                            <>
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label htmlFor="shipping-first-name">
                                      First Name*
                                    </label>
                                    <input
                                      type="text"
                                      id="shipping-first-name"
                                      value={shippingData.firstName}
                                      onChange={(e) =>
                                        setShippingData({
                                          ...shippingData,
                                          firstName: e.target.value,
                                        })
                                      }
                                      required
                                      suppressHydrationWarning
                                    />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label htmlFor="shipping-last-name">
                                      Last Name*
                                    </label>
                                    <input
                                      type="text"
                                      id="shipping-last-name"
                                      value={shippingData.lastName}
                                      onChange={(e) =>
                                        setShippingData({
                                          ...shippingData,
                                          lastName: e.target.value,
                                        })
                                      }
                                      required
                                      suppressHydrationWarning
                                    />
                                  </div>
                                </div>
                              </div>

                              <AddressAutocomplete
                                address={shippingData}
                                onAddressChange={setShippingData}
                                onValidationComplete={(result) => {
                                  setShippingAddressValid(result.isValid);
                                  // Recalculate shipping rates when address is validated
                                  if (result.isValid) {
                                    calculateShippingRatesForCurrentAddress();
                                  }
                                }}
                                label="Shipping Address"
                                placeholder="Enter your shipping address"
                                required={true}
                              />

                              <div className="form-group">
                                <label htmlFor="shipping-city">City*</label>
                                <input
                                  type="text"
                                  id="shipping-city"
                                  value={shippingData.city}
                                  onChange={(e) =>
                                    setShippingData({
                                      ...shippingData,
                                      city: e.target.value,
                                    })
                                  }
                                  required
                                  suppressHydrationWarning
                                />
                              </div>

                              <div className="form-group">
                                <label htmlFor="shipping-country">
                                  Country*
                                </label>
                                <select
                                  id="shipping-country"
                                  value={shippingData.country}
                                  onChange={(e) =>
                                    setShippingData({
                                      ...shippingData,
                                      country: e.target.value,
                                    })
                                  }
                                  required
                                  suppressHydrationWarning
                                >
                                  {countries.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="row">
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label htmlFor="shipping-zip">
                                      {shippingData.country === "Canada"
                                        ? "Postal Code*"
                                        : "Zip / Postal Code*"}
                                    </label>
                                    <input
                                      type="text"
                                      id="shipping-zip"
                                      value={shippingData.zip}
                                      onChange={(e) =>
                                        setShippingData({
                                          ...shippingData,
                                          zip: e.target.value,
                                        })
                                      }
                                      required
                                      suppressHydrationWarning
                                    />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label htmlFor="shipping-state">
                                      {shippingData.country === "United States"
                                        ? "State*"
                                        : shippingData.country === "Canada"
                                        ? "Province*"
                                        : "State / Province / Region"}
                                    </label>
                                    {shippingData.country ===
                                    "United States" ? (
                                      <select
                                        id="shipping-state"
                                        value={shippingData.state}
                                        onChange={(e) =>
                                          setShippingData({
                                            ...shippingData,
                                            state: e.target.value,
                                          })
                                        }
                                        required
                                        suppressHydrationWarning
                                      >
                                        <option value="">Select State</option>
                                        <option value="AL">Alabama</option>
                                        <option value="AK">Alaska</option>
                                        <option value="AZ">Arizona</option>
                                        <option value="AR">Arkansas</option>
                                        <option value="CA">California</option>
                                        <option value="CO">Colorado</option>
                                        <option value="CT">Connecticut</option>
                                        <option value="DE">Delaware</option>
                                        <option value="FL">Florida</option>
                                        <option value="GA">Georgia</option>
                                        <option value="HI">Hawaii</option>
                                        <option value="ID">Idaho</option>
                                        <option value="IL">Illinois</option>
                                        <option value="IN">Indiana</option>
                                        <option value="IA">Iowa</option>
                                        <option value="KS">Kansas</option>
                                        <option value="KY">Kentucky</option>
                                        <option value="LA">Louisiana</option>
                                        <option value="ME">Maine</option>
                                        <option value="MD">Maryland</option>
                                        <option value="MA">
                                          Massachusetts
                                        </option>
                                        <option value="MI">Michigan</option>
                                        <option value="MN">Minnesota</option>
                                        <option value="MS">Mississippi</option>
                                        <option value="MO">Missouri</option>
                                        <option value="MT">Montana</option>
                                        <option value="NE">Nebraska</option>
                                        <option value="NV">Nevada</option>
                                        <option value="NH">
                                          New Hampshire
                                        </option>
                                        <option value="NJ">New Jersey</option>
                                        <option value="NM">New Mexico</option>
                                        <option value="NY">New York</option>
                                        <option value="NC">
                                          North Carolina
                                        </option>
                                        <option value="ND">North Dakota</option>
                                        <option value="OH">Ohio</option>
                                        <option value="OK">Oklahoma</option>
                                        <option value="OR">Oregon</option>
                                        <option value="PA">Pennsylvania</option>
                                        <option value="RI">Rhode Island</option>
                                        <option value="SC">
                                          South Carolina
                                        </option>
                                        <option value="SD">South Dakota</option>
                                        <option value="TN">Tennessee</option>
                                        <option value="TX">Texas</option>
                                        <option value="UT">Utah</option>
                                        <option value="VT">Vermont</option>
                                        <option value="VA">Virginia</option>
                                        <option value="WA">Washington</option>
                                        <option value="WV">
                                          West Virginia
                                        </option>
                                        <option value="WI">Wisconsin</option>
                                        <option value="WY">Wyoming</option>
                                      </select>
                                    ) : shippingData.country === "Canada" ? (
                                      <select
                                        id="shipping-state"
                                        value={shippingData.state}
                                        onChange={(e) =>
                                          setShippingData({
                                            ...shippingData,
                                            state: e.target.value,
                                          })
                                        }
                                        required
                                        suppressHydrationWarning
                                      >
                                        <option value="">
                                          Select Province
                                        </option>
                                        {canadianProvinces.map((p) => (
                                          <option key={p.code} value={p.code}>
                                            {p.name}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        type="text"
                                        id="shipping-state"
                                        className="form-control"
                                        value={shippingData.state}
                                        onChange={(e) =>
                                          setShippingData({
                                            ...shippingData,
                                            state: e.target.value,
                                          })
                                        }
                                        placeholder="Optional for some countries"
                                        suppressHydrationWarning
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="row">
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label htmlFor="shipping-phone">
                                      Phone Number*
                                    </label>
                                    <input
                                      type="tel"
                                      id="shipping-phone"
                                      value={shippingData.phone}
                                      onChange={(e) =>
                                        setShippingData({
                                          ...shippingData,
                                          phone: e.target.value,
                                        })
                                      }
                                      required
                                      suppressHydrationWarning
                                    />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label htmlFor="shipping-email">
                                      Email Address*
                                    </label>
                                    <input
                                      type="email"
                                      id="shipping-email"
                                      value={shippingData.email}
                                      onChange={(e) =>
                                        setShippingData({
                                          ...shippingData,
                                          email: e.target.value,
                                        })
                                      }
                                      required
                                      suppressHydrationWarning
                                    />
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          <div className="form-group">
                            <div className="shipping-options-header">
                              <h4>Choose Your Shipping Speed</h4>
                              {shippingOptions.length > 1 && (
                                <span className="shipping-note">
                                  Need it faster? Select an expedited option
                                  below
                                </span>
                              )}
                            </div>
                            {shippingLoading ? (
                              <div className="text-center py-3">
                                <div
                                  className="spinner-border text-primary"
                                  role="status"
                                >
                                  <span className="sr-only">
                                    Loading shipping rates...
                                  </span>
                                </div>
                                <p className="mt-2">
                                  Calculating shipping rates...
                                </p>
                              </div>
                            ) : shippingOptions.length > 0 ? (
                              <div className="shipping-options">
                                {shippingOptions.map((option, index) => (
                                  <div
                                    key={index}
                                    className={`shipping-option ${
                                      option.cost === 0 ? "free-shipping" : ""
                                    } ${
                                      option.code === "01"
                                        ? "express-shipping"
                                        : ""
                                    }`}
                                  >
                                    {option.cost === 0 && (
                                      <span className="shipping-badge">
                                        Most Popular
                                      </span>
                                    )}
                                    {option.code === "01" && (
                                      <span className="shipping-badge">
                                        Fastest
                                      </span>
                                    )}
                                    <label className="shipping-option-label">
                                      <input
                                        type="radio"
                                        name="shipping-option"
                                        value={option.code}
                                        checked={
                                          selectedOption?.code === option.code
                                        }
                                        onChange={() =>
                                          selectShippingOption(option)
                                        }
                                      />
                                      <div className="shipping-option-details">
                                        <div className="shipping-info">
                                          <div className="shipping-service">
                                            {option.service}
                                            {option.cost === 0 && (
                                              <span className="free-badge">
                                                FREE
                                              </span>
                                            )}
                                          </div>
                                          <div className="shipping-details">
                                            {option.description}
                                          </div>
                                          <div className="shipping-delivery">
                                            <span className="delivery-icon">
                                              📦
                                            </span>
                                            {option.deliveryDays}
                                          </div>
                                        </div>
                                        <div className="shipping-price">
                                          {option.cost === 0 ? (
                                            <span className="shipping-cost-free">
                                              $0.00
                                            </span>
                                          ) : (
                                            <span className="shipping-cost">
                                              ${option.cost.toFixed(2)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-3">
                                <p className="text-muted">
                                  Free shipping on BMR products (lower 48 US
                                  only) when eligible. Enter your address to see
                                  rates.
                                </p>
                              </div>
                            )}
                            {shippingError && (
                              <div className="alert alert-warning mt-2">
                                {shippingError}
                              </div>
                            )}
                          </div>

                          <div className="d-flex justify-content-between mt-4">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={handleBack}
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-lg"
                              onClick={handleContinue}
                            >
                              Continue
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Payment Section */}
                  <div
                    className={`checkout-step ${
                      activeStep === "payment" ? "active" : ""
                    }`}
                  >
                    <div className="step-header">
                      <h3>Payment</h3>
                      <div className="step-line"></div>
                    </div>

                    {activeStep === "payment" && (
                      <div className="step-content">
                        {payPalOnly && (
                          <div className="alert alert-info mb-4" role="alert">
                            Orders shipping outside the US and Canada must be
                            paid with PayPal.
                          </div>
                        )}
                        {showPaymentMethodChoice && !payPalOnly && (
                          <div className="checkout-payment-methods">
                            <label className="checkout-payment-methods__label">
                              Payment method
                            </label>
                            <div className="checkout-payment-methods__list">
                              <button
                                type="button"
                                onClick={() => setPaymentMethod("paypal")}
                                className={`checkout-payment-method ${
                                  paymentMethod === "paypal"
                                    ? "checkout-payment-method--selected"
                                    : ""
                                }`}
                                aria-pressed={paymentMethod === "paypal"}
                              >
                                <span className="checkout-payment-method__logo checkout-payment-method__logo--paypal">
                                  <Image
                                    src="/images/logo/PayPal_Logo.png"
                                    alt="PayPal"
                                    width={120}
                                    height={32}
                                  />
                                </span>
                                <span className="checkout-payment-method__desc">
                                  Pay with PayPal or pay in 4 installments
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentMethod("credit_card")}
                                className={`checkout-payment-method ${
                                  paymentMethod === "credit_card"
                                    ? "checkout-payment-method--selected"
                                    : ""
                                }`}
                                aria-pressed={paymentMethod === "credit_card"}
                              >
                                <span className="checkout-payment-method__logo checkout-payment-method__logo--card">
                                  <svg
                                    width="40"
                                    height="28"
                                    viewBox="0 0 40 28"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden
                                  >
                                    <rect
                                      width="40"
                                      height="28"
                                      rx="4"
                                      fill="#1a1f71"
                                    />
                                    <rect
                                      x="4"
                                      y="12"
                                      width="20"
                                      height="3"
                                      rx="1"
                                      fill="white"
                                      opacity="0.9"
                                    />
                                    <rect
                                      x="4"
                                      y="18"
                                      width="12"
                                      height="2"
                                      rx="1"
                                      fill="white"
                                      opacity="0.6"
                                    />
                                  </svg>
                                </span>
                                <span className="checkout-payment-method__text">
                                  <span className="checkout-payment-method__title">
                                    Debit or Credit Card{" "}
                                  </span>
                                  <span
                                    className="checkout-card-logos"
                                    aria-label="Accepted cards"
                                  >
                                    <CreditCardIcons className="checkout-card-logos__icons" />
                                  </span>
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                        {paymentMethod === "paypal" && (
                          <div className="checkout-paypal-notice mb-4">
                            <p className="mb-0">
                              You will be redirected to PayPal to complete
                              payment securely.
                            </p>
                          </div>
                        )}
                        {paymentMethod === "credit_card" && (
                          <form className="checkout-form">
                            <div className="form-group">
                              <label htmlFor="card-number">Card Number*</label>
                              <div className="card-input-wrapper">
                                <input
                                  type="text"
                                  id="card-number"
                                  placeholder="1234 5678 9012 3456"
                                  value={paymentData.cardNumber}
                                  onChange={(e) => {
                                    const formatted = handleCardNumberChange(
                                      e.target.value
                                    );
                                    setPaymentData({
                                      ...paymentData,
                                      cardNumber: formatted,
                                    });
                                  }}
                                  className={`form-control ${
                                    paymentData.cardNumber &&
                                    (cardValid ? "is-valid" : "is-invalid")
                                  }`}
                                  required
                                />
                                <div className="card-icons">
                                  <CreditCardIcons
                                    detectedType={detectedType}
                                  />
                                </div>
                                {paymentData.cardNumber && (
                                  <div
                                    className={`validation-message ${
                                      cardValid ? "valid" : "invalid"
                                    }`}
                                  >
                                    {validationMessage}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="row">
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label htmlFor="expiry-date">
                                    Expiry Date*
                                  </label>
                                  <input
                                    type="text"
                                    id="expiry-date"
                                    placeholder="MM/YY"
                                    value={paymentData.expiryDate}
                                    onChange={(e) => {
                                      const formatted = formatExpiryDate(
                                        e.target.value
                                      );
                                      const validation =
                                        validateExpiryDate(formatted);
                                      setPaymentData({
                                        ...paymentData,
                                        expiryDate: formatted,
                                      });
                                      setExpiryValid(validation.isValid);
                                      setExpiryMessage(validation.message);
                                    }}
                                    className={`form-control ${
                                      paymentData.expiryDate &&
                                      (expiryValid ? "is-valid" : "is-invalid")
                                    }`}
                                    required
                                  />
                                  {paymentData.expiryDate && (
                                    <div
                                      className={`validation-message ${
                                        expiryValid ? "valid" : "invalid"
                                      }`}
                                    >
                                      {expiryMessage}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label htmlFor="cvv">CVV*</label>
                                  <input
                                    type="text"
                                    id="cvv"
                                    placeholder={
                                      detectedType?.name === "American Express"
                                        ? "1234"
                                        : "123"
                                    }
                                    value={paymentData.cvv}
                                    onChange={(e) => {
                                      const cleaned = e.target.value.replace(
                                        /\D/g,
                                        ""
                                      );
                                      const validation = validateCVV(
                                        cleaned,
                                        detectedType
                                      );
                                      setPaymentData({
                                        ...paymentData,
                                        cvv: cleaned,
                                      });
                                      setCvvValid(validation.isValid);
                                      setCvvMessage(validation.message);
                                    }}
                                    className={`form-control ${
                                      paymentData.cvv &&
                                      (cvvValid ? "is-valid" : "is-invalid")
                                    }`}
                                    maxLength={
                                      detectedType?.name === "American Express"
                                        ? 4
                                        : 3
                                    }
                                    required
                                  />
                                  {paymentData.cvv && (
                                    <div
                                      className={`validation-message ${
                                        cvvValid ? "valid" : "invalid"
                                      }`}
                                    >
                                      {cvvMessage}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="form-group">
                              <label htmlFor="name-on-card">
                                Name on Card*
                              </label>
                              <input
                                type="text"
                                id="name-on-card"
                                value={paymentData.nameOnCard}
                                onChange={(e) =>
                                  setPaymentData({
                                    ...paymentData,
                                    nameOnCard: e.target.value,
                                  })
                                }
                                className={`form-control ${
                                  paymentData.nameOnCard &&
                                  (paymentData.nameOnCard.trim().length > 0
                                    ? "is-valid"
                                    : "is-invalid")
                                }`}
                                required
                              />
                              {paymentData.nameOnCard && (
                                <div
                                  className={`validation-message ${
                                    paymentData.nameOnCard.trim().length > 0
                                      ? "valid"
                                      : "invalid"
                                  }`}
                                >
                                  {paymentData.nameOnCard.trim().length > 0
                                    ? "Valid name"
                                    : "Please enter a valid name"}
                                </div>
                              )}
                            </div>
                          </form>
                        )}

                        {submitError && (
                          <div className="alert alert-danger mt-3">
                            {submitError}
                          </div>
                        )}

                        <div className="terms-checkbox mt-4 mb-3">
                          <label className="d-flex align-items-start gap-2">
                            <input
                              type="checkbox"
                              checked={termsAgreed}
                              onChange={(e) => setTermsAgreed(e.target.checked)}
                              className="mt-1"
                            />
                            <span>
                              I agree to BMR Suspension&apos;s{" "}
                              <Link
                                href="/terms-conditions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary"
                              >
                                Terms &amp; Conditions
                              </Link>
                            </span>
                          </label>
                        </div>

                        <div className="d-flex flex-wrap gap-3 align-items-center mt-3">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={handleBack}
                            disabled={isSubmitting}
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            className={`btn ${
                              paymentMethod === "paypal"
                                ? "btn-paypal btn-paypal--compact"
                                : "btn-lg btn-danger"
                            } `}
                            onClick={handleOrderSubmission}
                            disabled={isSubmitting || !termsAgreed}
                          >
                            {isSubmitting ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                />
                                {paymentMethod === "paypal"
                                  ? "Redirecting to PayPal..."
                                  : "Processing Order..."}
                              </>
                            ) : paymentMethod === "paypal" ? (
                              <span className="checkout-paypal-btn__content">
                                <Image
                                  src="/images/logo/PayPal_Logo.png"
                                  alt=""
                                  width={32}
                                  height={10}
                                />
                                <span>Pay with PayPal</span>
                              </span>
                            ) : (
                              "Place order (credit card)"
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="col-lg-4">
            <div className="order-summary">
              <div className="summary-header">
                <h5>ORDER SUMMARY</h5>
                <Link
                  href={
                    isPoCheckout
                      ? `/dealers-portal/po/${poIdParam}`
                      : "/view-cart"
                  }
                  className="edit-cart-link"
                >
                  {isPoCheckout ? "VIEW PO" : "EDIT CART"}
                </Link>
              </div>

              {isPoCheckout && poCartError && (
                <div className="alert alert-danger mb-3">
                  {poCartError}
                  <Link
                    href="/dealers-portal/orders"
                    className="btn btn-sm btn-outline-primary ms-2"
                  >
                    Back to Orders
                  </Link>
                </div>
              )}

              <div className="summary-items">
                {!summaryMounted || effectiveCartLoading ? (
                  <CartSkeleton />
                ) : (
                  effectiveCartProducts.map((item, index) => (
                    <div key={index} className="summary-item">
                      <div className="item-image">
                        <Image
                          alt={item.ProductName || "Product"}
                          src={(() => {
                            if (
                              item.selectedColor &&
                              item.images &&
                              item.images.length > 0
                            ) {
                              let imageIndex = 0;
                              if (item.selectedColor.ColorID === 1) {
                                imageIndex = Math.min(
                                  1,
                                  item.images.length - 1
                                );
                              } else if (item.selectedColor.ColorID === 2) {
                                imageIndex = 0;
                              }
                              const colorImageSrc =
                                item.images[imageIndex]?.imgSrc ||
                                item.images[0]?.imgSrc;
                              if (
                                colorImageSrc &&
                                colorImageSrc.trim() !== ""
                              ) {
                                return colorImageSrc;
                              }
                            }
                            if (
                              item.images?.[0]?.imgSrc &&
                              item.images[0].imgSrc.trim() !== ""
                            ) {
                              return item.images[0].imgSrc;
                            }
                            if (
                              item.ImageLarge &&
                              item.ImageLarge.trim() !== "" &&
                              item.ImageLarge !== "0"
                            ) {
                              return `https://bmrsuspension.com/siteart/products/${item.ImageLarge}`;
                            }
                            return "/images/logo/bmr_logo_square_small.webp";
                          })()}
                          width={80}
                          height={80}
                        />
                      </div>
                      <div className="item-details">
                        <h6>
                          <Link
                            href={`/product/${item.ProductID}`}
                            className="text-decoration-none text-body"
                          >
                            {item.ProductName}
                          </Link>
                        </h6>
                        <p className="item-part">Part #: {item.PartNumber}</p>
                        <p className="item-platform">{item.PlatformName}</p>
                        <p className="item-color">
                          {item.selectedColor
                            ? item.selectedColor.ColorName
                            : item.defaultColorName || "Default"}
                        </p>
                        <div className="quantity-controls">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity > 1) {
                                const updatedCart = effectiveCartProducts.map(
                                  (cartItem, i) =>
                                    i === index
                                      ? {
                                          ...cartItem,
                                          quantity: cartItem.quantity - 1,
                                        }
                                      : cartItem
                                );
                                if (isPoCheckout)
                                  setPoCartProducts(updatedCart);
                                else setCartProducts(updatedCart);
                              }
                            }}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedCart = effectiveCartProducts.map(
                                (cartItem, i) =>
                                  i === index
                                    ? {
                                        ...cartItem,
                                        quantity: cartItem.quantity + 1,
                                      }
                                    : cartItem
                              );
                              if (isPoCheckout) setPoCartProducts(updatedCart);
                              else setCartProducts(updatedCart);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="item-price">
                        $
                        {(
                          (parseFloat(item.Price) || 0) * item.quantity
                        ).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Avoid hydration mismatch: defer client-only cart loading state */}
              {!summaryMounted ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading cart...</span>
                  </div>
                  <p className="mt-2">Loading your cart...</p>
                </div>
              ) : effectiveCartLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading cart...</span>
                  </div>
                  <p className="mt-2">
                    {isPoCheckout
                      ? "Loading PO items..."
                      : "Loading your cart..."}
                  </p>
                </div>
              ) : (
                <div className="shipping-estimate-section mb-4">
                  <ShippingEstimate inline={true} />
                </div>
              )}

              <div className="coupon-section">
                <p>Have a coupon code? Enter it here!</p>
                <div className="coupon-input">
                  <input
                    type="text"
                    placeholder="Type here..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={handleCouponApply}
                    className="btn btn-sm btn-primary"
                    style={{
                      borderRadius: "8px",
                    }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-danger">{couponError}</p>}
                {appliedCoupon && (
                  <div className="mt-2">
                    <p
                      className="mb-1"
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#333",
                      }}
                    >
                      <strong>Coupon:</strong> {appliedCoupon.code}
                    </p>
                    {appliedCoupon.name && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "0",
                        }}
                      >
                        {appliedCoupon.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="order-totals">
                {!summaryMounted ? (
                  /* Placeholder so server and client match (avoids hydration error) */
                  <>
                    <div className="total-line">
                      <span>Subtotal:</span>
                      <span>$—</span>
                    </div>
                    <div className="total-line">
                      <span>Shipping:</span>
                      <span>$—</span>
                    </div>
                    <div className="total-line">
                      <span>Gift Certificate:</span>
                      <span>$0.00</span>
                    </div>
                    <div className="total-line">
                      <span>Tax:</span>
                      <span>$—</span>
                    </div>
                    <div className="total-line grand-total">
                      <span>Grand Total:</span>
                      <span>$—</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="total-line">
                      <span>Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="total-line">
                      <span>Shipping:</span>
                      <span>
                        $
                        {selectedOption
                          ? selectedOption.cost.toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                    {isDealer && dealerDiscountPercent > 0 && (
                      <div
                        className="d-flex justify-content-between mb-2 text-success total-line"
                        style={{ fontSize: "14px" }}
                      >
                        <span>Dealer discount ({dealerDiscountPercent}%):</span>
                        <span>
                          {isPoCheckout
                            ? "Reflected in item prices"
                            : `-$${dealerDiscountAmount.toFixed(2)}`}
                        </span>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div
                        className="d-flex justify-content-between mb-2 text-danger total-line"
                        style={{ fontSize: "14px" }}
                      >
                        <span>Coupon ({appliedCoupon.code}):</span>
                        <span>-${couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="total-line">
                      <span>Gift Certificate:</span>
                      <span>$0.00</span>
                    </div>
                    <div className="total-line">
                      <span>Tax:</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="total-line grand-total">
                      <span>Grand Total:</span>
                      <span>${calculateGrandTotal().toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="terms-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    required
                    suppressHydrationWarning
                  />
                  I agree to BMR Suspension's{" "}
                  <Link href="/terms-conditions">Terms & Conditions</Link>
                </label>
              </div>

              <div className="email-consent-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={emailConsent}
                    onChange={(e) => setEmailConsent(e.target.checked)}
                    suppressHydrationWarning
                  />
                  I agree to receive texts and emails from BMR
                </label>
              </div>

              <button
                className={`btn w-100 place-order-btn ${
                  paymentMethod === "paypal"
                    ? "place-order-btn--paypal place-order-btn--paypal-compact"
                    : "btn-lg"
                }`}
                onClick={handleOrderSubmission}
                disabled={
                  activeStep !== "payment" || isSubmitting || !termsAgreed
                }
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {paymentMethod === "paypal"
                      ? "Redirecting to PayPal..."
                      : "Processing Order..."}
                  </>
                ) : paymentMethod === "paypal" ? (
                  <span className="checkout-paypal-btn__content">
                    <div className="checkout-paypal-btn__content-text"></div>
                    <Image
                      src="/images/logo/PayPal_Logo.png"
                      alt=""
                      width={32}
                      height={10}
                    />
                    <span>Pay with PayPal</span>
                  </span>
                ) : (
                  "PLACE ORDER"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CouponSuccessModal
        coupon={appliedCoupon}
        show={showCouponModal}
        onClose={() => setShowCouponModal(false)}
      />
    </section>
  );
}
