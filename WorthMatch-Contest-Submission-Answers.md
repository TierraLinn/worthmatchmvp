# WorthMatch Submission Answers

Prepared: April 28, 2026

Submission status note: the live app URL below is already deployed and reachable. The public repo URL and public video URL still need to be replaced from placeholder values before final contest submission.

## Project title

WorthMatch

## One-line tagline

WorthMatch turns real-life skills and informal experience into matched paid opportunities, targeted application materials, and trackable next steps.

## Project URL / Try it out

https://2026-04-20-build-a-polished-mvp-web.vercel.app

## Demo URL

https://2026-04-20-build-a-polished-mvp-web.vercel.app/demo

## Public code repository URL

REQUIRED: replace this placeholder with a real public repo before final submission.

https://github.com/TierraLinn/worthmatchmvp
## Demo video URL

REQUIRED: replace this placeholder with a public video URL before final submission.

https://youtu.be/1uFUjjhBnxM

## Project description

WorthMatch is a polished web app for people who know how to do useful things but struggle to describe their value professionally, find the right opportunities quickly, or generate application materials fast enough to act on them.

The app starts by translating plain-English strengths, help requests, experience notes, and work preferences into marketable skills, possible job titles, ATS keywords, and service offers. From there, WorthMatch ranks opportunities by fit, pay potential, urgency, work-mode alignment, and experience match. It also supports safe intake paths for pasted descriptions, uploaded screenshots or PDFs, imported links, manual lead cards, and live matched search results from approved public sources.

WorthMatch then helps the user move from discovery into action. It can generate a master resume, a targeted resume for a selected opportunity, a cover letter, a short bio, quick-apply answers, interview prep, side-by-side opportunity comparison, a direct-service offer studio, and a tracker for keeping the application pipeline moving.

## What makes this strong

- It solves a real problem for students, career changers, and people with informal or hard-to-describe experience.
- It connects translation, search, matching, resume generation, and follow-through in one product.
- It supports both jobs and direct paid services, which makes it useful for people who need income now, not just ideal long-term roles.
- It is fully demoable with seeded personas and also usable as a blank-start local-first app.
- It includes live matched searches through Remotive and curated public Ashby boards, plus profile-aware external platform search actions for LinkedIn, Indeed, Handshake, Craigslist, Facebook Marketplace, and local boards.

## OpenAI usage

WorthMatch now includes a gpt-oss-compatible search coach path on `/search`. The serverless endpoint is designed to work with OpenAI-compatible or self-hosted inference endpoints and defaults the model name to `gpt-oss-20b`. When a compatible endpoint is configured on Vercel, the app can generate a concise search strategy brief based on the current profile, recommended platforms, and strongest live matches. When no model endpoint is configured, the app falls back to a built-in strategy engine so the flow remains testable.

Important: for the Open Model Hackathon, the final public submission should make the gpt-oss testing path explicit in the repo README and deployed environment.

## Tech stack

- React
- TypeScript
- Vite
- React Router
- Framer Motion
- Lucide React
- Vercel deployment
- gpt-oss-compatible inference adapter

## Testing instructions

1. Open the live app at https://2026-04-20-build-a-polished-mvp-web.vercel.app
2. Use `/demo` for the fastest guided walkthrough
3. Use `/search` to run matched live searches and platform actions
4. Import a live result into WorthMatch
5. Open `/opportunities`, `/resume`, `/interview`, and `/tracker`
6. Use `/workspace` to back up, restore, or reset the session

## Fastest judge path

1. `https://2026-04-20-build-a-polished-mvp-web.vercel.app/demo`
2. `https://2026-04-20-build-a-polished-mvp-web.vercel.app/dashboard`
3. `https://2026-04-20-build-a-polished-mvp-web.vercel.app/search`
4. `https://2026-04-20-build-a-polished-mvp-web.vercel.app/opportunities`
5. `https://2026-04-20-build-a-polished-mvp-web.vercel.app/resume`
6. `https://2026-04-20-build-a-polished-mvp-web.vercel.app/tracker`

## Notes

- The app is already deployed and publicly reachable.
- The included submission ZIP is a convenience bundle, not a substitute for the public repo and public video links many contest forms still require.
- Use `WorthMatch-Thumbnail.png` for the gallery thumbnail image upload field if needed.
- The Open Model Hackathon specifically requires clear indication of `gpt-oss` model use, so do not submit with the placeholder repo/video fields still in place.
