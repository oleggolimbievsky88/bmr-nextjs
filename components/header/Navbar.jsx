"use client";




import Link from "next/link";
import React from "react";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { products1 } from "@/data/products";
import { ProductCard } from "../shopCards/ProductCard";
import { Navigation } from "swiper/modules";
import {
  allPagesLinks,
  blogLinks,
  homePage,
  productDetailPages,
  productsPages,
  fordLinks,
  moparLinks,
  gmLateModelLinks,
  gmMidMuscleLinks,
  gmClassicMuscleLinks
} from "@/data/menu";
import { usePathname } from "next/navigation";
import { homedir } from "os";

export default function Nav({ isArrow = true, textColor = "", Linkfs = "" }) {
  const pathname = usePathname();
  const isMenuActive = (menuItem) => {
    let active = false;
    if (menuItem.href?.includes("/")) {
      if (menuItem.href?.split("/")[1] == pathname.split("/")[1]) {
        active = true;
      }
    }
    if (menuItem.length) {
      active = menuItem.some(
        (elm) => elm.href?.split("/")[1] == pathname.split("/")[1]
      );
    }
    if (menuItem.length) {
      menuItem.forEach((item) => {
        item.links?.forEach((elm2) => {
          if (elm2.href?.includes("/")) {
            if (elm2.href?.split("/")[1] == pathname.split("/")[1]) {
              active = true;
            }
          }
          if (elm2.length) {
            elm2.forEach((item2) => {
              item2?.links?.forEach((elm3) => {
                if (elm3.href.split("/")[1] == pathname.split("/")[1]) {
                  active = true;
                }
              });
            });
          }
        });
        if (item.href?.includes("/")) {
          if (item.href?.split("/")[1] == pathname.split("/")[1]) {
            active = true;
          }
        }
      });
    }

    return active;
  };
  return (
    <>
      {" "}
      <li className={`menu-item`}>
        <a href="/" className={`item-link  ${Linkfs}`}>
          Home
        </a>
      </li>
      <li className="menu-item">
        <a
          href="#"
          className={`item-link ${Linkfs} ${textColor} ${
            isMenuActive(fordLinks) ? "activeMenu" : ""
          } `}
        >
          Ford
          {isArrow ? <i className="icon icon-arrow-down" /> : ""}
        </a>
        <div className="sub-menu mega-menu">
          <div className="container">
            <div className="row">
              {fordLinks.map((menu, index) => (
                <div className="col-lg-2" key={index}>
                  <div className="mega-menu-item">
                    <div className="menu-heading">{menu.heading}</div>
                    <ul className="menu-list">
                      {menu.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link
                            href={link.href}
                            className={`menu-link-text link ${
                              isMenuActive(link) ? "activeMenu" : ""
                            }`}
                          >
                            {link.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </li>
      <li className="menu-item">
        <a
          href="#"
          className={`item-link ${Linkfs} ${textColor}  ${
            isMenuActive(productDetailPages) ? "activeMenu" : ""
          }`}
        >
          Dodge
          {isArrow ? <i className="icon icon-arrow-down" /> : ""}
        </a>
        <div className="sub-menu mega-menu">
          <div className="container">
            <div className="row">
              <div className="col-lg-2"></div>
              <div className="col-lg-8">
                {moparLinks.map((menuItem, index) => (
                  <div key={index} className="col-lg-2">
                    <div className="mega-menu-item">
                      <div className="menu-heading">{menuItem.heading}</div>
                      <ul className="menu-list">
                        {menuItem.links.map((linkItem, linkIndex) => (
                          <li key={linkIndex}>
                            <Link
                              href={linkItem.href}
                              className={`menu-link-text link position-relative  ${
                                isMenuActive(linkItem) ? "activeMenu" : ""
                              }`}
                            >
                              {linkItem.text}
                              {linkItem.extra}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-2"></div>
          </div>
        </div>
      </li>
      <li className="menu-item position-relative">
        <a
          href="#"
          className={`item-link ${Linkfs} ${textColor}  ${
            isMenuActive(allPagesLinks) ? "activeMenu" : ""
          }`}
        >
          GM
          {isArrow ? <i className="icon icon-arrow-down" /> : ""}
        </a>
        <div className="sub-menu links-default">
          <ul className="menu-list">
          {gmLateModelLinks.map((menuItem, index) => (
                  <div key={index} className="col-lg-2">
                    <div className="mega-menu-item">
                      <div className="menu-heading">{menuItem.heading}</div>
                      <ul className="menu-list">
                        {menuItem.links.map((linkItem, linkIndex) => (
                          <li key={linkIndex}>
                            <Link
                              href={linkItem.href}
                              className={`menu-link-text link position-relative  ${
                                isMenuActive(linkItem) ? "activeMenu" : ""
                              }`}
                            >
                              {linkItem.text}
                              {linkItem.extra}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
          </ul>
        </div>
      </li>
      <li className="menu-item position-relative">
        <a
          href="/installation"
          className={`item-link ${Linkfs} ${textColor}  ${
            isMenuActive(blogLinks) ? "activeMenu" : ""
          }`}
        >
          Installation
        </a>
      </li>
      {/* <li className="menu-item position-relative">
        <a
          href="#"
          className={`item-link ${Linkfs} ${textColor}  ${
            isMenuActive(blogLinks) ? "activeMenu" : ""
          }`}
        >
          Pages
          {isArrow ? <i className="icon icon-arrow-down" /> : ""}
        </a>
        <div className="sub-menu links-default">
          <ul className="menu-list">
            {allPagesLinks.map((linkItem, index) => (
              <li key={index}>
                <Link
                  href={linkItem.href}
                  className={`menu-link-text link text_black-2 ${
                    linkItem.extra ? "position-relative" : ""
                  }  ${isMenuActive(linkItem) ? "activeMenu" : ""}`}
                >
                  {linkItem.text}
                  {linkItem.extra}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </li> */}
      <li className="menu-item position-relative">
        <a
          href="/about-us"
          className={`item-link ${Linkfs} ${textColor}  ${
            isMenuActive(blogLinks) ? "activeMenu" : ""
          }`}
        >
          About Us
        </a>
      </li>
      <li className="menu-item position-relative">
        <a
          href="/contact"
          className={`item-link ${Linkfs} ${textColor}  ${
            isMenuActive(blogLinks) ? "activeMenu" : ""
          }`}
        >
          Contact
        </a>
      </li>
    </>
  );
}
