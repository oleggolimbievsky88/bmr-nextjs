export async function generateMetadata({ params }) {
  const { id } = params;

  return {
    title: `YouTube Video | BMR Suspension`,
    description: "BMR Suspension installation and product videos on YouTube",
  };
}

export default function VideoPage({ params }) {
  const { id } = params;

  // In a production app, you would fetch video data from your database
  // For now, we'll create a simple placeholder

  return (
    <div className="container my-5">
      <h1 className="mb-4">YouTube Video</h1>
      <div className="ratio ratio-16x9">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title="BMR Suspension YouTube Video"
          allowFullScreen
        ></iframe>
      </div>
      <div className="mt-4">
        <p>YouTube Video ID: {id}</p>
        <p>
          All videos are hosted on YouTube for optimal streaming performance.
        </p>
      </div>
    </div>
  );
}
