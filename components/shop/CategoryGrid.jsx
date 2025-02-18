"use client";
import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Link from "next/link";
import Subcollections from "./Subcollections";

export default function CategoryGrid({ categoriesSlug, platformSlug }) {
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [platformImage, setPlatformImage] = useState(null);
  const [mainCategoryImage, setMainCategoryImage] = useState(null);

  console.log("categoriesSlug=%o", categoriesSlug);
  console.log("platformSlug=%o", platformSlug);

  useEffect(() => {
    const fetchData = async () => {
      if (!platformSlug) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/categories?platform=${encodeURIComponent(platformSlug)}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        console.log("Received data:", data);

        if (data.error) {
          throw new Error(data.error);
        }

        setCategories(data.categories || []);
        setMainCategories(data.mainCategories || []);
        setMainCategoryImage(data.image || []);
        setVehicle(data.vehicle || null);
        setPlatformImage(data.platformImage || null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platformSlug]);

  if (loading) return <div className="text-center mt-5 mb-5">Loading...</div>;

  return (
    <section className="flat-spacing-3 pb_0 mb_10">
      <Container className="position-relative">
        <Subcollections />

        <Row>
          {mainCategories.map((category) => (
            <Col key={category.id} className="mb-4 custom-col">
              <div className="collection-item style-2 hover-img">
                <div className="collection-inner">
                  <Link
                    href={`/platform/${platformSlug}/${category.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="collection-image img-style"
                  >
                    <img
                      src={`https://www.bmrsuspension.com/siteart/categories/${category.image}`}
                      alt={category.name}
                      className="card-img-top"
                    />
                  </Link>
                  <div className="text-center mt-2">
                    <Link
                      href={`/platform/${platformSlug}/${category.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className="tf-btn collection-title hover-icon fs-15"
                    >
                      {category.name}
                      <i className="icon icon-arrow1-top-left mr-20" />
                    </Link>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
