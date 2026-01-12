import Topbar4 from "@/components/header/Topbar4";
import Header18 from "@/components/header/Header18";

export default function InstallationPage() {
  return (
    <div>
      <Topbar4 />
      <Header18 showVehicleSearch={false} />
      <div className="container py-5 mt-5">
        <h1 className="home-title text-center mb-4">Installation Guides</h1>
        <div className="row mb-5">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body p-5">
                <h2>Installation Resources</h2>
                <p className="lead">
                  Find detailed installation instructions for all BMR Suspension
                  products.
                </p>
                <p>
                  Our step-by-step guides and videos will help you install your
                  suspension components correctly.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-md-3 g-4">
          <div className="col">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Video Tutorials</h5>
                <p className="card-text">
                  Watch our detailed video instructions for proper installation
                  techniques.
                </p>
                <a href="#" className="btn btn-danger">
                  View Videos
                </a>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">PDF Instructions</h5>
                <p className="card-text">
                  Download printable PDF installation guides for your specific
                  product.
                </p>
                <a href="#" className="btn btn-danger">
                  Download PDFs
                </a>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Technical Support</h5>
                <p className="card-text">
                  Contact our technical support team for installation
                  assistance.
                </p>
                <a href="#" className="btn btn-danger">
                  Get Help
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
