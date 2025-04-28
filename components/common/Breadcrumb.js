import Link from "next/link";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="breadcrumb" className="breadcrumb-nav border-0 mb-0">
      <div className="container">
        <ol className="breadcrumb">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li
                key={index}
                className={`breadcrumb-item ${isLast ? "active" : ""}`}
              >
                {isLast ? (
                  <span>{item.label}</span>
                ) : (
                  <Link href={item.link}>{item.label}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
