"use client";

import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import Context from "@/context/Context";
import ShopCart from "@/components/modals/ShopCart";
import QuickAdd from "@/components/modals/QuickAdd";
import QuickView from "@/components/modals/QuickView";
import AskQuestion from "@/components/modals/AskQuestion";
import DeliveryReturn from "@/components/modals/DeliveryReturn";
import Login from "@/components/modals/Login";
import MobileMenu from "@/components/modals/MobileMenu";
import Register from "@/components/modals/Register";
import ResetPass from "@/components/modals/ResetPass";
import SearchModal from "@/components/modals/SearchModal";
import ToolbarBottom from "@/components/modals/ToolbarBottom";
import ScrollTop from "@/components/common/ScrollTop";
import { Analytics } from "@vercel/analytics/react";

export default function ClientProviders({ children }) {
  const pathname = usePathname();
  const [scrollDirection, setScrollDirection] = useState("up");
  const wowInstanceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.esm");
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
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
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
          setScrollDirection("down");
        } else {
          setScrollDirection("up");
        }
      } else {
        setScrollDirection("up");
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Close Bootstrap modals/offcanvas on route change before paint to reduce
  // chance of DOM/node ownership mismatch and removeChild errors during unmount.
  useLayoutEffect(() => {
    if (typeof window === "undefined" || !window.bootstrap) return;
    const modalElements = document.querySelectorAll(".modal.show");
    modalElements.forEach((modal) => {
      if (modal.classList.contains("admin-edit-modal")) return;
      const inst = window.bootstrap.Modal.getInstance(modal);
      if (inst) inst.hide();
    });
    const offcanvasElements = document.querySelectorAll(".offcanvas.show");
    offcanvasElements.forEach((oc) => {
      const inst = window.bootstrap.Offcanvas.getInstance(oc);
      if (inst) inst.hide();
    });
  }, [pathname]);

  useEffect(() => {
    const header = document.querySelector("header");
    if (header && typeof window !== "undefined") {
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

  // WOW.js: only run on non-admin routes so we never hold refs to admin DOM.
  // Stop previous instance on route change to avoid "removeChild" errors when navigating.
  useEffect(() => {
    const isAdmin = pathname?.startsWith("/admin");
    if (isAdmin) {
      if (wowInstanceRef.current) {
        try {
          wowInstanceRef.current.stop();
        } catch (_) {}
        wowInstanceRef.current = null;
      }
      return;
    }
    const id = setTimeout(() => {
      const WOW = require("@/utlis/wow");
      const wow = new WOW.default({ mobile: false, live: false });
      wowInstanceRef.current = wow;
      wow.init();
    }, 0);
    return () => {
      clearTimeout(id);
      if (wowInstanceRef.current) {
        try {
          wowInstanceRef.current.stop();
        } catch (_) {}
        wowInstanceRef.current = null;
      }
    };
  }, [pathname]);

  return (
    <>
      <SessionProvider refetchInterval={60} refetchOnWindowFocus={false}>
        <Context>
          <div id="wrapper">{children}</div>
          <ShopCart />
          <QuickAdd />
          <QuickView />
          <AskQuestion />
          <DeliveryReturn />
          <Login />
          <MobileMenu />
          <Register />
          <ResetPass />
          <SearchModal />
          <ToolbarBottom />
        </Context>
      </SessionProvider>
      <ScrollTop />
      <Analytics />
      <div
        id="toast-container"
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 1090 }}
      />
    </>
  );
}
