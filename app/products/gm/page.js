export default function GMPage() {
  return (
    <div className="container py-5">
      <h1 className="home-title text-center mb-4">GM Products</h1>
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body text-center p-5">
              <h2>Explore General Motors Platform Products</h2>
              <p className="lead">
                Browse our complete catalog of high-quality suspension
                components for GM vehicles.
              </p>
              <div className="mt-4">
                <h3>GM Categories</h3>
                <ul className="list-group text-start">
                  <li className="list-group-item">GM Late Model Cars</li>
                  <li className="list-group-item">GM Mid Muscle Cars</li>
                  <li className="list-group-item">GM Classic Muscle Cars</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
