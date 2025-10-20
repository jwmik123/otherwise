# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 + Sanity CMS monorepo starter template with real-time visual editing capabilities. The project uses npm workspaces with two main packages:
- **frontend**: Next.js 15 app with App Router, React 19, and Tailwind CSS
- **studio**: Sanity Studio for content management

## Development Commands

### Running the project
```bash
npm run dev                    # Run both frontend and studio concurrently
npm run dev:next              # Run Next.js frontend only (localhost:3000)
npm run dev:studio            # Run Sanity Studio only (localhost:3333)
```

### Building and type checking
```bash
npm run build                 # Build both workspaces
npm run type-check            # Type check all workspaces
npm run lint                  # Lint frontend code (runs in frontend workspace)
npm run format                # Format code with Prettier
```

### Sanity-specific commands
```bash
npm run import-sample-data    # Import sample data (runs from studio/)
cd studio && npx sanity deploy           # Deploy Sanity Studio
cd studio && npx sanity schema extract   # Extract schema types
cd frontend && npm run typegen           # Generate TypeScript types from Sanity schema
```

## Architecture

### Monorepo Structure
This is an npm workspaces monorepo. Always use workspace-specific commands (e.g., `npm run dev --workspace=frontend`) when working with individual packages, or run from the root for both.

### Frontend Architecture

#### Data Fetching Strategy
- **Live Content API**: Uses `defineLive` from `next-sanity` (frontend/sanity/lib/live.ts:10) for real-time content updates
- **sanityFetch**: Primary data fetching method that automatically handles revalidation
- **Draft Mode**: Enables preview of unpublished content via `/api/draft-mode/enable`

#### Page Rendering
- **Dynamic Pages**: `frontend/app/[slug]/page.tsx` handles dynamic pages using Sanity's `page` document type
- **Posts**: `frontend/app/posts/[slug]/page.tsx` handles blog posts
- **Page Builder**: Component-based page building system in `frontend/app/components/PageBuilder.tsx:80`
  - Uses `useOptimistic` hook for instant UI updates during Studio edits
  - Renders blocks dynamically via `BlockRenderer` component
  - Supports drag-and-drop reordering with reference reconciliation

#### Content Components
Key components in `frontend/app/components/`:
- **BlockRenderer**: Orchestrates rendering of different block types from pageBuilder field
- **PortableText**: Renders rich text content from Sanity
- **Posts**, **InfoSection**, **Cta**: Reusable content blocks

### Studio Architecture

#### Schema Organization (studio/src/schemaTypes/)
- **documents/**: Main content types (page, post, person)
- **objects/**: Reusable schema objects (callToAction, infoSection, link, blockContent)
- **singletons/**: Single-instance documents (settings)

#### Studio Configuration (studio/sanity.config.ts)
- **Presentation Tool**: Visual editing with live preview (lines 56-121)
  - Main documents resolver maps routes to Sanity documents
  - Locations resolver shows where content is used across the site
- **Structure Tool**: Custom studio navigation (studio/src/structure/index.ts)
  - Settings treated as singleton
  - Document type titles pluralized automatically
- **Plugins**: Unsplash integration, AI Assist, Vision (GROQ playground)

#### URL Resolution
The `resolveHref` function (studio/sanity.config.ts:35) maps document types to frontend routes:
- `post` → `/posts/{slug}`
- `page` → `/{slug}`

### Environment Variables
- **Studio**: `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, `SANITY_STUDIO_PREVIEW_URL`
- **Frontend**: Sanity credentials stored in `frontend/sanity/lib/api.ts` and token in `frontend/sanity/lib/token.ts`

### Type Generation
Both workspaces use Sanity's type generation:
- Frontend runs `typegen` before dev/build (prebuild/predev scripts)
- Studio runs `extract-types` before build
- Generated types appear in `sanity.types.ts` files

## Key Integration Points

### Real-time Visual Editing Flow
1. User opens Presentation Tool in Studio (localhost:3333)
2. Studio loads frontend preview via `SANITY_STUDIO_PREVIEW_URL`
3. Frontend enables draft mode via `/api/draft-mode/enable`
4. `SanityLive` component (from defineLive) establishes WebSocket connection
5. `useOptimistic` hook in PageBuilder updates UI instantly on edits
6. Changes sync bidirectionally between Studio and frontend preview

### Adding New Content Types
1. Create schema in `studio/src/schemaTypes/`
2. Add to `schemaTypes` array in `studio/src/schemaTypes/index.ts`
3. Add route mapping in `studio/sanity.config.ts` (mainDocuments and locations)
4. Add URL resolution case in `resolveHref` function
5. Create corresponding frontend page/component
6. Run type generation to update TypeScript types

## Testing and Deployment

- **Local Testing**: Run `npm run dev` and access frontend at localhost:3000, Studio at localhost:3333
- **Studio Deployment**: Use `npx sanity deploy` from studio directory
- **Frontend Deployment**: Deploy to Vercel with root directory set to `frontend/`
- **Environment Setup**: Configure environment variables for both deployments
