export const metadata = {
  title: "BMR Merchandise | BMR Suspension",
  description: "Browse and shop BMR branded merchandise and apparel",
};

export default function BmrMerchandisePage() {
  return (
    <div className="container my-5">
      <h1 className="mb-4">BMR Merchandise</h1>
      <div className="row">
        <div className="col-12">
          <div className="alert alert-info">
            <p>BMR merchandise is currently unavailable.</p>
            <p>Check back soon for BMR branded merchandise and apparel!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
