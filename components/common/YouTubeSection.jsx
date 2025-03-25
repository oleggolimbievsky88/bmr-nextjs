"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const YouTubeSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/youtube");
        if (!response.ok) throw new Error("Failed to fetch videos");
        const data = await response.json();
        setVideos(data.items);
        setError(null);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="tf-section video-section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title-section text-center">
                <h3>Loading videos...</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tf-section video-section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title-section text-center">
                <h3>{error}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tf-section video-section">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="title-section text-center">
              <h3>Latest Videos</h3>
              <p>
                Check out our latest installation guides and product reviews
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          {videos.map((video) => (
            <div key={video.id} className="col-lg-4 col-md-6 mb-4">
              <div className="video-card">
                <div className="video-wrapper">
                  <iframe
                    width="100%"
                    height="215"
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="video-info">
                  <h4>{video.title}</h4>
                  <p>{video.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row mt-4">
          <div className="col-md-12 text-center">
            <Link
              href="https://www.youtube.com/@BMRSuspension"
              className="tf-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="youtube-button">Visit Our YouTube Channel</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeSection;
