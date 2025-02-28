import React from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";

const Header = () => {
  return (
    <div>
      {/* Top Bar */}
      <div className="bg-dark text-white py-2 text-center small">
        <span>Call us today! (813) 986-9302 | FREE SHIPPING TO THE 48 CONTINENTAL US STATES FOR ALL BMR PRODUCTS</span>
      </div>

      {/* Main Header */}
      <header className="bg-black text-white p-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h1 className="h4 fw-bold me-4">BMR Suspension</h1>
          <input
            type="text"
            placeholder="Search by part # or keyword"
            className="form-control w-50"
          />
        </div>
        <nav>
          <ul className="nav">
            <li className="nav-item"><Link className="nav-link text-white" href="#">Contacts</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" href="#">About Us</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" href="#">Account</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" href="#">Deals</Link></li>
          </ul>
        </nav>
      </header>

      {/* Navigation Links */}
      <nav className="bg-secondary text-white p-2">
        <div className="container d-flex justify-content-center gap-3">
          <Link className="text-white text-decoration-none" href="#">Ford</Link>
          <Link className="text-white text-decoration-none" href="#">GM Late Model</Link>
          <Link className="text-white text-decoration-none" href="#">GM Mid Muscle</Link>
          <Link className="text-white text-decoration-none" href="#">GM Classic Muscle</Link>
          <Link className="text-white text-decoration-none" href="#">Mopar</Link>
          <Link className="text-white text-decoration-none" href="#">Merch</Link>
          <Link className="text-white text-decoration-none" href="#">Installation</Link>
          <Link className="text-white text-decoration-none" href="#">Cart</Link>
        </div>
      </nav>
    </div>
  );
};

export default Header;
