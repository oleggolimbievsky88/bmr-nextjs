"use client";

import { useState } from "react";

export default function SocialMediaContent({ type = "video" }) {
  const [socialMediaPosts] = useState([
    {
      PostID: 1,
      Title: "Post 1",
      Thumbnail: "https://via.placeholder.com/360",
      Description: "Description for Video 1",
    },
    {
      PostID: 2,
      Title: "Post 2",
      Thumbnail: "https://via.placeholder.com/360",
      Description: "Description for Video 2",
    },
    // Add more dummy social media post data as needed
  ]);

  return (
    <div className="container">
      <div className="row">
        {socialMediaPosts.map((post) => (
          <div key={post.PostID} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card">
              <img
                src={post.Thumbnail}
                className="card-img-top"
                alt={post.Title}
              />
              <div className="card-body">
                <h5 className="card-title">{post.Title}</h5>
                <p className="card-text">{post.Description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
