This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Adding New YouTube Feeds

The site-wide `New Videos` feed is powered by `GET /api/youtube-feed`.
That route reads teacher channel IDs from Sanity and then fetches recent uploads from the YouTube Data API.

### Requirements

- `YOUTUBE_API_KEY` must be configured in the environment where the app runs.
- The source record in Sanity must have a `youtubeChannelId` value.
- If you are using a `user` document, the `role` must be one of:
  - `teacher`
  - `junior_teacher`
  - `senior_teacher`
  - `lead_teacher`

### How to add a new feed

1. Open the teacher record in Sanity Studio or the admin teacher/user management UI.
2. Find the `YouTube Channel ID` field.
3. Paste the raw YouTube channel ID, for example `UCxxxxxxxxxxxxxxxxxxxxxxxx`.
4. Do **not** paste a full YouTube URL or an `@handle` in that field.
5. Save and publish the record.

### Which records are included

- `teacher` documents with a non-empty `youtubeChannelId`
- `user` documents with a teacher role and a non-empty `youtubeChannelId`
- Records marked as deleted are ignored
- Duplicate channel IDs are deduplicated automatically

### Where the videos appear

- Home page `New Videos` section
- Lessons page `New Videos` tab
- Direct API response from `/api/youtube-feed?limit=12`

### Cache and verification

- The YouTube feed route is cached for 30 minutes
- After updating a channel ID, allow up to 30 minutes for refreshed results to appear
- To verify the setup, open `/api/youtube-feed?limit=12` and confirm the new channel's videos are included

## Changelog

### 2026-03-30 00:59 UTC-04:00

- Fixed a hydration mismatch in the shared app shell by delaying client-only header and mobile sidebar UI until after hydration.
- Fixed an invalid Clerk/Radix composition in `components/header/header.tsx` by letting `SignInButton` wrap `Button` instead of using `Button asChild` around Clerk.
- Why this was happening: the server HTML for the header could differ from the first client render when Clerk- and Radix-driven UI generated different initial markup or attributes.
- Why this fix works: the server and first client render now stay structurally consistent, and the sign-in button renders a stable DOM node before Clerk enhances it.
