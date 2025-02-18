import Link from "next/link";
import Image from "next/image";
import styles from './ProductCategories.module.css'; // Assuming the CSS file contains hover effects

const ProductCategories = () => {
  return (
    <div className="container mt-5">
      <div className="row mt-4">
        
        {/* Card for New Products */}
        <div className="col-md-4 mb-4">
          <Link href="/new-products" className={styles.cardLink}>
            <div className={`card ${styles.cardHover}`}>
              <Image
                className="card-img-top"
                src="/images/shop-categories/NewProductsGradient.jpg"
                alt="New Products"
                width={800}
                height={450}
              />
              <div className="card-body text-center">
                <p className="card-text fs-5">New Products</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Card for BMR Merchandise */}
        <div className="col-md-4 mb-4">
          <Link href="/bmr-merchandise" className={styles.cardLink}>
            <div className={`card ${styles.cardHover}`}>
              <Image
                className="card-img-top"
                src="/images/shop-categories/MerchGradient.jpg"
                alt="BMR Merchandise"
                width={800}
                height={450}
              />
              <div className="card-body text-center">
                <p className="card-text fs-5">BMR Merchandise</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Card for BMR Gift Cards */}
        <div className="col-md-4 mb-4">
          <Link href="/gift-cards" className={styles.cardLink}>
            <div className={`card ${styles.cardHover}`}>
              <Image
                className="card-img-top"
                src="/images/shop-categories/GiftCardsGradient.jpg"
                alt="BMR Gift Cards"
                width={800}
                height={450}
              />
              <div className="card-body text-center">
                <p className="card-text fs-5">BMR Gift Cards</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCategories;
