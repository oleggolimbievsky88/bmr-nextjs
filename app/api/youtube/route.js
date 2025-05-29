import { NextResponse } from "next/server";

// Number of videos to fetch
const VIDEOS_TO_FETCH = 6;

export async function GET() {
  try {
    // Replace with your actual YouTube API key
    const API_KEY = process.env.YOUTUBE_API_KEY;
    // Replace with your YouTube channel ID
    const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

    if (!API_KEY || !CHANNEL_ID) {
      throw new Error("YouTube API key or Channel ID not configured");
    }

    // First, get the channel's uploads playlist ID
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
    );

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error("Failed to fetch channel data:", errorText);
      throw new Error("Failed to fetch channel data: " + errorText);
    }

    const channelData = await channelResponse.json();
    const uploadsPlaylistId =
      channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Then, get the latest videos from that playlist
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${VIDEOS_TO_FETCH}&key=${API_KEY}`
    );

    if (!videosResponse.ok) {
      const errorText = await videosResponse.text();
      console.error("Failed to fetch videos:", errorText);
      throw new Error("Failed to fetch videos: " + errorText);
    }

    const videosData = await videosResponse.json();

    // Transform the response to include only the data we need
    const videos = videosData.items.map((item) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description.slice(0, 100) + "...",
      thumbnail: {
        url: `https://i.ytimg.com/vi/${item.snippet.resourceId.videoId}/hqdefault.jpg`,
      },
      publishedAt: item.snippet.publishedAt,
    }));

    return NextResponse.json({ items: videos });
  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch YouTube videos" },
      { status: 500 }
    );
  }
}
