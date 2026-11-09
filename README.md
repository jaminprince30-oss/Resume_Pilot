# ResumePilot — Cloudflare Pages + OpenRouter

Responsive ATS resume builder/checker with OpenRouter AI features deployed using Cloudflare Pages.

## Live website

**ResumePilot:** https://resume-pilot-53m.pages.dev/

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

## Deploy using GitHub

1. Connect the GitHub repository to Cloudflare Pages.
2. Use `main` as the production branch.
3. Set the build output directory to `public`.
4. No build command is required for the current project.
5. Cloudflare Pages automatically detects the `functions/` directory and deploys the AI API endpoint.

## Add the OpenRouter key securely

1. Open your Cloudflare Pages project.
2. Go to **Settings → Variables and Secrets**.
3. Add:
   - Variable name: `OPENROUTER_API_KEY`
   - Type: **Secret**
   - Value: your OpenRouter secret API key
4. Add the model variable:
   - Variable name: `OPENROUTER_MODEL`
   - Value: `openrouter/free`
5. Save the variables and redeploy the project.

Do not put the real API key in `public/index.html`, GitHub, or `wrangler.toml`. The API key is accessed server-side by the Cloudflare Pages Function.

## Test the deployed site

1. Open the live [ResumePilot website](https://resume-pilot-53m.pages.dev/).
2. Use **Resume Builder** to enter resume details or generate/polish a resume with AI.
3. Use **ATS Checker** to upload or paste a resume and run the ATS analysis.
4. Use the AI review/improvement workflow to improve and format the resume.
5. Download the resulting resume in the available supported formats.

The AI endpoint is `/api/ai`.

## Privacy and limitations

- Resume data stays in the browser unless a user explicitly starts an AI action.
- When an AI action is confirmed, resume text and any job description are sent to OpenRouter and the selected upstream model provider for processing.
- The OpenRouter API key stays in a Cloudflare server-side secret.
- The app does not save resume text to its own database.
- Free model availability, speed, quality and rate limits can change. `openrouter/free` selects an available free model when one is available; it does not guarantee unlimited requests.
- The ATS score is a heuristic checklist, not a prediction from a specific employer's ATS.
- AI must not invent experience or credentials; review all generated content before using it.
