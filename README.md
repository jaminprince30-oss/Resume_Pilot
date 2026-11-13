# ResumePilot

**AI-powered ATS resume builder, checker, and optimizer.**

> Build a resume that gets read. Fill in your details once, polish them with AI, check them against ATS basics, and download a clean, ATS-friendly resume.

**Live website:** https://resume-pilot-53m.pages.dev/

## Features

- **Resume Builder** — Enter your experience, education, projects, and skills with a live preview as you type. One-click **AI Polish** tightens wording and formatting.
- **ATS Checker** — Paste or upload a resume, add the job details, and get an ATS-focused analysis with actionable gaps and a score.
- **AI Review · Improve · ATS Format** — A single end-to-end action that reviews your resume, improves the content, and reformats it to be ATS-friendly.
- **Load example** — Try the full flow instantly with sample data.
- **Download & copy** — Export the final resume in the supported formats or copy the plain text.

## How it works

```text
Browser (public/index.html)
        |
        |  POST /api/ai  (resume text + job details, only when you confirm)
        v
Cloudflare Pages Function (functions/api/ai.js)
        |
        |  validated, length-limited request -> AI provider
        v
Normalized AI response -> back to the browser
```

- `public/index.html` — the whole client: builder, ATS checker, live preview, and downloads.
- `functions/api/ai.js` — the serverless endpoint (`POST /api/ai`). It keeps API credentials server-side, validates and caps input size, and normalizes model output before returning it.
- `wrangler.toml`, `package.json` — Pages configuration and scripts.

## Project structure

```text
Resume_Pilot/
├── public/
│   └── index.html
├── functions/
│   └── api/
│       └── ai.js
├── wrangler.toml
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Deploy with Cloudflare Pages

1. Connect this GitHub repository to Cloudflare Pages.
2. Use `main` as the production branch.
3. Set the build output directory to `public`. No build command is required.
4. Cloudflare Pages automatically detects the `functions/` directory and deploys the AI endpoint.

## Configuration

The AI features are configured with environment variables on the Cloudflare Pages project — no keys in the client code:

1. Open your Cloudflare Pages project.
2. Go to **Settings → Variables and Secrets**.
3. Add your AI provider's **API key** as a **Secret**, and a **model identifier** variable, using the variable names that `functions/api/ai.js` reads (see the top of that file for the exact names).
4. Save and redeploy.

> **Never** put a real API key in `public/index.html`, `wrangler.toml`, or the repository — the key is only accessed server-side by the Pages Function.

## Test the deployed site

1. Open the live [ResumePilot website](https://resume-pilot-53m.pages.dev/).
2. Use **Resume Builder** to enter your details — or load the example — and try **AI Polish**.
3. Use **ATS Checker** to upload or paste a resume and run the ATS analysis.
4. Use **AI Review · Improve · ATS Format** for the full end-to-end pass.
5. Download or copy the final resume.

## Privacy and limitations

- Resume data stays in your browser until you explicitly start an AI action; only then are the resume text and job details sent to the configured AI provider for processing.
- The app does not save resume text to any database.
- Model availability, speed, quality, and rate limits depend on the provider and can change.
- The ATS score is a heuristic checklist, not a prediction from a specific employer's ATS.
- AI must not invent experience or credentials — review all generated content before using it.
