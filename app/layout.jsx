"use client";

import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";

import "../public/scss/main.scss";
import "photoswipe/dist/photoswipe.css";
import "rc-slider/assets/index.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Context from "@/context/Context";
import QuickView from "@/components/modals/QuickView";
import ProductSidebar from "@/components/modals/ProductSidebar";
import QuickAdd from "@/components/modals/QuickAdd";
import Compare from "@/components/modals/Compare";
import ShopCart from "@/components/modals/ShopCart";
import AskQuestion from "@/components/modals/AskQuestion";
import BlogSidebar from "@/components/modals/BlogSidebar";
import ColorCompare from "@/components/modals/ColorCompare";
import DeliveryReturn from "@/components/modals/DeliveryReturn";
import FindSize from "@/components/modals/FindSize";
import Login from "@/components/modals/Login";
import MobileMenu from "@/components/modals/MobileMenu";
import Register from "@/components/modals/Register";
import ResetPass from "@/components/modals/ResetPass";
import SearchModal from "@/components/modals/SearchModal";
import ToolbarBottom from "@/components/modals/ToolbarBottom";
import ToolbarShop from "@/components/modals/ToolbarShop";

import { usePathname } from "next/navigation";
import NewsletterModal from "@/components/modals/NewsletterModal";
import ShareModal from "@/components/modals/ShareModal";
import ScrollTop from "@/components/common/ScrollTop";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.esm").then((bootstrap) => {
        // Optional: You can add any initialization logic here if needed
      });
    }
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector("header");
      if (header) {
        if (window.scrollY > 100) {
          header.classList.add("header-bg");
        } else {
          header.classList.remove("header-bg");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup function to remove event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const [scrollDirection, setScrollDirection] = useState("up");

  useEffect(() => {
    // Ensure header is visible on initial load
    const header = document.querySelector("header");
    if (header) {
      header.style.top = "0px";
      header.style.transform = "translateY(0)";
      header.style.display = "block";
      header.style.visibility = "visible";
      header.style.opacity = "1";
    }

    setScrollDirection("up");
    const lastScrollY = { current: window.scrollY };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 250) {
        if (currentScrollY > lastScrollY.current) {
          // Scrolling down
          setScrollDirection("down");
        } else {
          // Scrolling up
          setScrollDirection("up");
        }
      } else {
        // Below 250px - always show header
        setScrollDirection("up");
      }

      lastScrollY.current = currentScrollY;
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);
  useEffect(() => {
    // Close any open modal
    if (typeof window !== "undefined" && window.bootstrap) {
      const modalElements = document.querySelectorAll(".modal.show");
      modalElements.forEach((modal) => {
        const modalInstance = window.bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      });

      // Close any open offcanvas
      const offcanvasElements = document.querySelectorAll(".offcanvas.show");
      offcanvasElements.forEach((offcanvas) => {
        const offcanvasInstance =
          window.bootstrap.Offcanvas.getInstance(offcanvas);
        if (offcanvasInstance) {
          offcanvasInstance.hide();
        }
      });
    }
  }, [pathname]); // Runs every time the route changes

  useEffect(() => {
    const header = document.querySelector("header");
    if (header && typeof window !== "undefined") {
      // Always show header if near top of page
      if (window.scrollY <= 250) {
        header.style.top = "0px";
        header.style.transform = "translateY(0)";
        header.style.display = "block";
        header.style.visibility = "visible";
        header.style.opacity = "1";
      } else if (scrollDirection === "up") {
        header.style.top = "0px";
        header.style.transform = "translateY(0)";
        header.style.display = "block";
        header.style.visibility = "visible";
        header.style.opacity = "1";
      } else {
        header.style.top = "-185px";
        header.style.transform = "translateY(-185px)";
      }
    }
  }, [scrollDirection]);

  useEffect(() => {
    const WOW = require("@/utlis/wow");
    const wow = new WOW.default({
      mobile: false,
      live: false,
    });
    wow.init();
  }, [pathname]);

  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="preload-wrapper popup-loader">
        <SessionProvider>
          <Context>
            <div id="wrapper">{children}</div>
          {/* <QuickView /> */}
          {/* <QuickAdd /> */}
          <ProductSidebar />
          {/* <Compare /> */}
          <ShopCart />
          <AskQuestion />
          <BlogSidebar />
          <ColorCompare />
          <DeliveryReturn />
          <FindSize />
          <Login />
          <MobileMenu />
          <Register />
          <ResetPass />
          <SearchModal />
          <ToolbarBottom />
          <ToolbarShop />
          <ShareModal />
          </Context>
        </SessionProvider>
        <ScrollTop />
        <Analytics />
        {/* Toast Container for notifications */}
        <div id="toast-container" className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1090 }}></div>
      </body>
    </html>
  );
}
