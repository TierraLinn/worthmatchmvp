# WorthMatch

WorthMatch is a polished MVP web app that helps people turn real-life skills and informal experience into paid opportunities, targeted resumes, and quick-apply materials.

## What It Does

- Translates plain-English user input into marketable skills, likely job titles, freelance offers, and ATS keywords.
- Ranks remote, local, hybrid, imported, manual, and seeded opportunities with an opportunity-matching score.
- Generates a master resume, targeted resume, cover letter, short bio, and quick application answers.
- Supports safe intake paths for pasted descriptions, uploaded screenshots or PDFs, imported links, and manually saved opportunity cards.
- Includes a guided demo mode with multiple seeded personas for fast competition demos.
- Tracks applications from discovery through offer with editable next steps and due labels.
- Compares saved opportunities with decision lenses like quick income, best fit, and remote flexibility.
- Generates interview-prep kits with talking points, likely questions, bridge statements, and follow-up email copy.
- Packages translated skills into local or freelance service offers with starter pricing, outreach copy, listing copy, and a 7-day launch plan.
- Includes a dedicated intake desk for pasted descriptions, uploaded screenshots or PDFs, imported links, and manual lead cards, with source stats and import history.
- Adds a workspace page for backup and restore, blank onboarding reset, and local data control so the app can be used by a real person beyond the seeded demo.
- Adds a platform search hub for LinkedIn, Indeed, Handshake, Craigslist, Facebook Marketplace, and local boards through profile-aware search packs, plus live remote search via Remotive and curated live company boards via public Ashby APIs.
- Includes an AI search assistant that runs matched live-source searches, recommends which platforms to open next, and imports the best live matches directly into WorthMatch.
- Includes a gpt-oss-compatible search coach route that can generate model-backed search briefs through a Vercel serverless function when a compatible endpoint is configured, while keeping a built-in fallback strategy engine so the app still works without secrets.
- Adds direct live-source sync panels on the dashboard and opportunity board so fresh matched jobs can be pulled in without leaving the main workflow.
- Adds a quick-jump command palette with `Ctrl+K` so users can move between routes and top matches without hunting through the UI.

## Built Pages

- `/` landing page
- `/demo` guided demo run
- `/onboarding` onboarding wizard
- `/dashboard` results dashboard
- `/intake` intake desk
- `/search` platform search
- `/opportunities` ranked opportunity board
- `/opportunities/:id` opportunity detail
- `/compare` opportunity comparison
- `/interview` interview prep
- `/services` service studio
- `/resume` resume studio
- `/tracker` application tracker
- `/workspace` workspace controls

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Framer Motion
- Lucide React

## Project Structure

```text
src/
  components/   shared UI pieces
  context/      app-wide state and persistence
  data/         seeded personas, demo profile, demo opportunities, connectors
  lib/          matching, translation, resume generation, storage, tracker logic
  pages/        route-level screens
  types.ts      shared domain types
```

## Local Run

```bash
tools\pnpm.exe install
tools\pnpm.exe dev
```

Production build:

```bash
tools\pnpm.exe build
```

Smoke tests:

```bash
tools\pnpm.exe test
```

Full readiness check:

```bash
tools\pnpm.exe check
```

Preview the production build locally:

```bash
tools\pnpm.exe preview
```

## Deployment

WorthMatch is now configured for Vercel deployment.

Local preview deploy:

```bash
tools\node.cmd .\node_modules\vercel\dist\vc.js login
tools\node.cmd .\node_modules\vercel\dist\vc.js --yes
```

Production deploy:

```bash
tools\node.cmd .\node_modules\vercel\dist\vc.js --yes --prod
```

The repository includes:

- `vercel.json` with a portable Vercel build command
- SPA rewrites in `vercel.json` so direct route loads like `/search`, `/resume`, and `/tracker` stay live on refresh
- `.vercelignore` to keep deploy payloads small
- `build:portable` for Linux-based cloud builds

### gpt-oss-compatible assistant mode

WorthMatch works without any secrets by falling back to its built-in strategy engine.
If you want the AI search coach on `/search` to call a gpt-oss-compatible model on Vercel:

1. Copy `.env.example` to a local `.env` only for your own machine if needed.
2. Set `WORTHMATCH_LLM_BASE_URL` to your OpenAI-compatible or self-hosted inference endpoint.
3. Set `WORTHMATCH_LLM_MODEL` to your deployed model, such as `gpt-oss-20b`.
4. Set `WORTHMATCH_LLM_API_STYLE` to `chat-completions` for most gpt-oss-compatible hosts.
5. If your host requires auth, set `WORTHMATCH_LLM_API_KEY`.

The serverless endpoint lives at `api/assistant-brief.js`.

## Demo Tips

- Use `/demo` to launch a judge-friendly walkthrough.
- Switch personas to show different user stories without re-entering data.
- Use `/intake`, `/services`, `/compare`, `/resume`, `/interview`, and `/tracker` as the strongest closing sequence in a short live demo.
- Use `Ctrl+K` anywhere inside the app to jump straight to a route or top matched opportunity.

## Submission Runbook

1. Run `tools\pnpm.exe check`.
2. Run `tools\pnpm.exe dev`.
3. Open `http://localhost:5173/demo` for the fastest judge walkthrough.
4. If needed, move through `/dashboard`, `/intake`, `/opportunities`, `/services`, `/resume`, `/interview`, and `/tracker`.
5. Use `/workspace` to export a backup, restore a saved session, or start with a blank profile.
6. Use `/search` when you want the full AI search assistant, platform-aware external searches, or live remote roles before importing a listing back into WorthMatch.
7. Use the live-source sync panels on `/dashboard` and `/opportunities` when you want to pull in fresh matched jobs without leaving those pages.
8. For current Devpost-style OpenAI hackathon rules, also prepare:
   - a public live app URL
   - a public code repository URL
   - a public demo video link under 3 minutes
   - clear testing instructions
   - clear indication of `gpt-oss` model use if submitting to the Open Model Hackathon

## Submission Files

Ready-to-use submission assets are generated in `submission/`, including:

- a polished PDF summary
- a paste-ready submission answers file
- a contest submission README
- a short demo-video script
- a complete source archive
- a single submission bundle ZIP

## Notes

- State persists in local storage so demo progress survives refreshes.
- Resume PDF export currently uses the browser print flow for a fast MVP-friendly solution.
- Uploaded screenshots and PDFs create opportunity cards now and leave room for future OCR parsing.
- Live remote search currently uses Remotive's public API, and curated company-board search uses browser-accessible public Ashby APIs, with source attribution/link-back preserved on imported live roles.
