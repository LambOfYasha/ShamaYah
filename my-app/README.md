# Shama Yah

Christian community platform for biblical discussion, publishing, lessons, moderation, and member growth workflows built with Next.js, Clerk, Sanity, and AI-assisted safety tooling.

## What this project includes

- Community questions and discussion flows for biblical and theological topics
- Teacher and staff publishing for responses, blogs, and lesson content
- A home page with site stats, verse of the day, search, intro content, and latest teacher videos
- Member dashboards with favorites, activity, analytics, notifications, and settings
- Guest-friendly participation paths with moderation, reports, and support and feedback tools
- Admin panels for moderation, users, teachers, tags, lessons, reports, analytics, and system settings

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js App Router, React 19, TypeScript |
| Auth | Clerk |
| Content platform | Sanity CMS + GROQ |
| UI | Tailwind CSS, Radix UI, shadcn/ui, Lucide icons |
| Editor | TipTap rich text editor |
| AI / safety | OpenAI text and image moderation, appeals, analytics, reporting |
| External content | YouTube Data API, Bible verse API |
| Deployment | Vercel |

## Repository map

| Path | Responsibility |
| --- | --- |
| `app/` | Route groups, pages, layouts, API routes, and the Sanity Studio mount |
| `action/` | Server actions for CRUD, moderation, notifications, lessons, feedback, help, and user management |
| `components/` | Feature UI for admin, blog, comments, community, header, profile, and shared UI primitives |
| `contexts/` | React context for member settings and appearance state |
| `hooks/` | Client hooks for role checks, responsive behavior, compact mode, toasts, and moderation |
| `lib/` | Shared business logic for auth, AI, user services, utilities, and base URL handling |
| `sanity/` | Sanity schema types, clients, queries, structure config, and environment helpers |
| `public/` | Static assets such as logos and favicon |
| `questions/` | Alternate question listing route and client wrapper |
| `scripts/` | Dev helpers for env checking, seeding test data, and admin setup |

## Key files that drive the app

| File | Why it matters |
| --- | --- |
| `app/layout.tsx` | Root HTML shell, metadata, and global styles |
| `app/(app)/layout.tsx` | Main app shell with `ClerkProvider`, settings context, sidebar, header, and footer |
| `app/(app)/page.tsx` | Landing page with search, stats, verse of the day, intro lesson, and YouTube feed |
| `middleware.ts` | Route protection for dashboard, admin, and API paths while allowing guest-safe endpoints |
| `instrumentation.ts` | SSR workaround for broken `localStorage` behavior in newer Node runtimes |
| `next.config.ts` | Build behavior, remote image hosts, compression, and package import optimization |
| `sanity.config.ts` | Sanity Studio configuration mounted at `/studio` |
| `vercel.json` | Vercel install and build commands, API max duration, and security headers |
| `package.json` | Scripts, dependency versions, and the app's default workflow |
| `Project_Overview.md` | Deep engineering notes and historical implementation context |

## Route map

### Public and discovery routes
- `/` for onboarding, discovery, search, stats, daily verse, and featured videos
- `/about`, `/contact`, `/faq`, `/guidelines`, `/privacy`, `/terms` for informational content
- `/blogs` and `/blogs/[slug]` for long-form articles
- `/community-questions` and `/community-questions/[slug]` for Q&A discovery
- `/questions` as an alternate question directory route
- `/lessons` for categorized video lessons and new uploads
- `/members`, `/staff`, `/tags`, `/search`, `/responses/[slug]`, and `/profile/*` for browsing people and content

### Authenticated member routes
- `/sign-in` and `/sign-up` handled by Clerk
- `/dashboard/*` for profile, favorites, questions, blogs, notifications, and settings

### Elevated access routes
- `/admin/*` for moderation, reports, analytics, lesson management, user and teacher management, tags, and system controls
- `/studio` for Sanity authoring

### API surface
- `app/api/search` for unified search across blogs, questions, responses, and comments
- `app/api/moderation` and `app/api/moderation/image` for text and image moderation
- `app/api/blogs`, `app/api/communities`, `app/api/comments`, `app/api/reports`, `app/api/tags`, and `app/api/user` for application data
- `app/api/appeals`, `app/api/guidelines`, `app/api/site-stats`, `app/api/verse-of-the-day`, and `app/api/youtube-feed`
- `app/api/webhooks/clerk` for syncing new Clerk users into Sanity

## Feature guide and use cases

| Feature | What it does | Typical use cases |
| --- | --- | --- |
| Home and discovery | Combines verse of the day, site stats, search, intro content, and latest teacher videos | Onboarding new visitors, highlighting fresh content, giving members a quick starting point |
| Community questions | Lets users create and browse spiritual questions with discussion threads | Asking biblical questions, gathering community insight, starting topical discussions |
| Responses and comments | Supports teacher and member responses plus standard and embedded comments | Teaching through long-form answers, follow-up discussion, clarifying doctrine or interpretation |
| Blogs | Publishes tagged articles with images, read-time estimates, and role-gated authoring | Devotionals, teaching articles, announcements, long-form apologetics, or doctrine pieces |
| Lessons | Organizes video teachings by category and supplements them with newest YouTube uploads | Structured study plans, ministry teaching libraries, category-based learning paths |
| Search | Searches blogs, community questions, responses, and comments from one endpoint | Researching a topic, finding past answers, locating related discussions quickly |
| Dashboard | Shows personal stats, activity, favorites, notifications, and analytics | Member self-service, reviewing saved content, monitoring personal engagement |
| Profiles, members, staff, and tags | Gives directory and taxonomy views across people and content | Browsing teachers, discovering members, filtering content by topic, building trust in contributors |
| Guest participation | Allows unauthenticated flows for guest-safe actions through dedicated endpoints | Lower-friction participation, first-time question submission, guest comments, or guest reports |
| Settings and personalization | Stores theme, compact mode, reduced motion, notification, and privacy preferences | Accessibility tuning, mobile-friendly usage, and visual preference control |
| Feedback | Collects bug reports, feature requests, UI and UX suggestions, and anonymous submissions | Product improvement, issue intake, and qualitative user research |
| Help center | Creates and tracks support tickets with status, category, and priority | Account support, bug escalation, platform assistance, and operational follow-up |
| Moderation, reports, and appeals | Reviews content with AI support, allows reporting, and supports decision appeals | Keeping discussions safe, enforcing guidelines, and revisiting disputed moderation outcomes |
| Admin suite | Provides role-gated management for users, teachers, lessons, tags, reports, analytics, and settings | Platform operations, content governance, team workflows, and data oversight |
| Sanity Studio | Serves as the CMS and schema-backed authoring environment | Editing content models, managing published data, and staff authoring workflows |

## Role and access model

The role ladder defined in `lib/auth/roles.ts` is:

- `guest`
- `member`
- `junior_teacher`
- `teacher`
- `moderator`
- `senior_teacher`
- `lead_teacher`
- `dev`
- `admin`

Practical access rules in this checkout:

- Guests can browse content, comment, create community questions, use search, and access guest-specific APIs.
- Members gain dashboard access, favorites, editable profiles, and saved settings.
- Teacher-tier roles can create responses, manage blogs, and access growing levels of admin tools.
- Moderation and management privileges expand at `moderator`, `senior_teacher`, `lead_teacher`, `dev`, and `admin`.
- `middleware.ts` protects `/dashboard`, `/admin`, and major API areas while explicitly allowing guest-safe endpoints such as `/api/moderation`, `/api/user/guest`, `/api/comments/guest`, and `/api/communities/guest`.

## Content model

The app stores content in Sanity rather than a separate SQL database. The current schema index wires up these 18 core types:

- `user`
- `teacher`
- `post`
- `comment`
- `embeddedComment`
- `favorite`
- `blog`
- `communityQuestion`
- `tag`
- `report`
- `notification`
- `adminSettings`
- `specialty`
- `guestQuestion`
- `helpTicket`
- `feedback`
- `lessonCategory`
- `lesson`

In practice, that means the same CMS layer backs users, publishing, moderation artifacts, support tickets, taxonomy, and lessons.

## Environment variables

### Required by the code in this repo
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
NEXT_PUBLIC_SANITY_API_VERSION=2025-07-05
SANITY_ADMIN_API_TOKEN=
CLERK_WEBHOOK_SECRET=
OPENAI_API_KEY=
YOUTUBE_API_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Also required for Clerk to run
Use the standard Clerk Next.js environment variables for your app instance:

- publishable key for the browser
- secret key for the server

### Runtime notes
- `OPENAI_API_KEY` is optional in local development if you are okay with the built-in dev moderation fallback.
- `YOUTUBE_API_KEY` is only required for live teacher-channel syncing; the lessons area still has Sanity and fallback content paths.
- `VERCEL_ENV` and `VERCEL_PROJECT_PRODUCTION_URL` are used during production and Vercel runtime flows.
- `SANITY_ADMIN_API_TOKEN` is required for write actions, role changes, lesson management, and Clerk-to-Sanity syncing.

## Getting started

### Prerequisites
- A current Node.js version compatible with Next.js 16
- A Sanity project and dataset
- A Clerk application
- Optional but recommended: OpenAI API access and a YouTube Data API key

### Install
The repo contains both `package-lock.json` and `pnpm-lock.yaml`, but `vercel.json` is wired for `npm install` and `npm run build:prod`, so `npm` is the safest default.

```bash
npm install
```

### Configure environment
Create `my-app/.env.local` with the variables above, then make sure:

- Clerk redirects and webhook settings point back to this app
- Sanity has the expected schemas deployed and generated
- Any teacher records that should power the YouTube feed have a `youtubeChannelId`

### Start the app
```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Standard production build |
| `npm run build:prod` | Deployment-oriented build with lint and type checks skipped |
| `npm run build:force` | Force build path used for harder deployment recovery cases |
| `npm run start` | Start the production server |
| `npm run lint` | Run linting |
| `npm run lint:fix` | Auto-fix lint issues where possible |
| `npm run typegen` | Extract and generate Sanity schema typings |

## Deployment notes

- Vercel is the intended host and reads `vercel.json`.
- Production builds use `npm run build:prod`.
- `next.config.ts` allows remote images from Clerk and Sanity CDNs.
- `instrumentation.ts` guards server rendering against Node `localStorage` issues.
- The Clerk webhook endpoint is `/api/webhooks/clerk`.
- This codebase includes test and debug routes and helper scripts; review them before exposing every route publicly in production.

## Git branches

The local Git metadata currently shows these branches:

- `main`
- `shamayah-bug`
- `shamayah-new_feature`
- `shamayah-ui`
- `shamayah-ux`
- `shamayah-experimental`

Important context for this checkout: every local branch above currently points to the same commit (`15a4c07`) and each feature-named branch was created from `main`. That means the branch names currently describe workflow intent more than unique code snapshots.

| Branch | Observed role in this repo | Good use cases |
| --- | --- | --- |
| `main` | Baseline branch and remote tracking target | Stable integration, release candidate prep, and merge target for completed work |
| `shamayah-bug` | Bug-fix lane created from `main` | Isolating regressions, hotfix work, and targeted QA validation |
| `shamayah-new_feature` | Feature-development lane created from `main` | Adding routes, APIs, schemas, or other product capabilities |
| `shamayah-ui` | UI-focused lane created from `main` | Component styling, visual refreshes, layout changes, and design system work |
| `shamayah-ux` | UX-focused lane created from `main` | Improving flows, onboarding, navigation, discoverability, accessibility, or content ergonomics |
| `shamayah-experimental` | Experimental lane created from `main`; also the current checked-out branch | Spikes, prototypes, riskier refactors, and validating ideas before promoting them elsewhere |

### Contribution rules

Branch-specific rules and contribution workflow live in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Related documentation

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contribution workflow, branch rules, and collaboration expectations
- `Project_Overview.md` for deeper architecture notes, implementation history, and subsystem summaries
- [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for framework-specific deployment guidance
