"use client";

import Link from "next/link";
import styles from "./HeidtsEngineeredPerformance.module.css";

export default function HeidtsEngineeredPerformance() {
  return (
    <section className={styles.wrap} aria-label="Engineered performance">
      <div className={styles.container}>
        <h2 className={styles.headline}>
          PROVIDING ENGINEERED PERFORMANCE FOR 30+ YEARS.
        </h2>
        <p className={styles.subhead}>HEIDTS® HOT ROD &amp; MUSCLE CAR PARTS</p>
        <p className={styles.body}>
          We provide the best suspension and related chassis component solutions
          to create a superior buyer experience for the professional and
          hobbyist car builder or installer. We believe the best suspension
          products are derived from field-tested component creation,
          intelligently engineered parts, and absolutely the best quality
          American-made manufacturing possible. We pride ourselves on our
          passionately dedicated and expertly trained sales technicians
          delivering quick and accurate customer solutions that ensure a
          positive sales experience.
        </p>

        <Link href="/about-us" className={styles.cta}>
          READ MORE ABOUT US
        </Link>
      </div>
    </section>
  );
}
