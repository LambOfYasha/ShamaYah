import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export const revalidate = 1800; // Cache for 30 minutes

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  teacherUsername?: string;
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
    channelTitle: string;
    channelId: string;
    publishedAt: string;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 12;

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    // Fetch teacher YouTube channel IDs from Sanity (from both user and teacher types)
    const teacherChannels: { youtubeChannelId: string; username: string }[] = await client.fetch(`
      *[
        (
          (_type == "user" && role in ["teacher", "junior_teacher", "senior_teacher", "lead_teacher"])
          || _type == "teacher"
        )
        && defined(youtubeChannelId)
        && youtubeChannelId != ""
        && isDeleted != true
      ] {
        youtubeChannelId,
        username
      }
    `);

    if (!teacherChannels || teacherChannels.length === 0) {
      return NextResponse.json({ videos: [], message: 'No teacher YouTube channels configured' });
    }

    // Deduplicate channel IDs
    const channelMap = new Map<string, string>();
    for (const tc of teacherChannels) {
      if (tc.youtubeChannelId && !channelMap.has(tc.youtubeChannelId)) {
        channelMap.set(tc.youtubeChannelId, tc.username);
      }
    }

    // Fetch recent videos from each channel using YouTube Data API v3
    const videosPerChannel = Math.max(3, Math.ceil(limit / channelMap.size));
    const allVideos: YouTubeVideo[] = [];

    const fetchPromises = Array.from(channelMap.entries()).map(
      async ([channelId, teacherUsername]) => {
        try {
          const url = new URL('https://www.googleapis.com/youtube/v3/search');
          url.searchParams.set('part', 'snippet');
          url.searchParams.set('channelId', channelId);
          url.searchParams.set('maxResults', String(videosPerChannel));
          url.searchParams.set('order', 'date');
          url.searchParams.set('type', 'video');
          url.searchParams.set('key', YOUTUBE_API_KEY);

          const res = await fetch(url.toString(), { next: { revalidate: 1800 } });

          if (!res.ok) {
            console.error(`YouTube API error for channel ${channelId}:`, res.status, await res.text());
            return [];
          }

          const data = await res.json();

          return (data.items || []).map((item: YouTubeSearchItem) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail:
              item.snippet.thumbnails.high?.url ||
              item.snippet.thumbnails.medium?.url ||
              item.snippet.thumbnails.default?.url ||
              '',
            channelTitle: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
            publishedAt: item.snippet.publishedAt,
            teacherUsername,
          }));
        } catch (err) {
          console.error(`Error fetching videos for channel ${channelId}:`, err);
          return [];
        }
      }
    );

    const results = await Promise.all(fetchPromises);
    for (const vids of results) {
      allVideos.push(...vids);
    }

    // Sort by publish date descending and limit
    allVideos.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const videos = allVideos.slice(0, limit);

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error in youtube-feed API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch YouTube feed' },
      { status: 500 }
    );
  }
}
