# ResumePilot — Netlify + OpenRouter

Responsive ATS resume builder/checker with OpenRouter AI features deployed using Netlify Functions.

## Project structure

```text
resumepilot-netlify/
├── public/
│   └── index.html
├── netlify/
│   └── functions/
│       └── ai.js
├── netlify.toml
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Deploy using GitHub (recommended)

1. Extract this ZIP.
2. Create a GitHub repository, for example `resumepilot`.
3. Upload the CONTENTS of this folder to the repository root (not the outer ZIP folder).
4. In Netlify, choose **Add new project → Import an existing project**.
5. Choose GitHub, authorize Netlify if asked, and select your `resumepilot` repository.
6. Netlify reads `netlify.toml`. Confirm the publish directory is `public` and functions directory is `netlify/functions`. No build command is needed.
7. Before or immediately after the first deploy, add the environment variables described below. Redeploy after adding them.

Netlify documentation: https://docs.netlify.com/start/quickstarts/deploy-from-repository/

## Add the OpenRouter key securely

1. Open your Netlify project dashboard.
2. Go to **Project configuration → Environment variables** (the exact menu wording can vary slightly).
3. Add:
   - Key: `OPENROUTER_API_KEY`
   - Value: your OpenRouter secret API key
4. Optional second variable:
   - Key: `OPENROUTER_MODEL`
   - Value: `openrouter/free`
5. If Netlify asks for variable scopes, make sure the key is available to **Functions** (or all scopes).
6. Save, then trigger a new deploy so the function receives the new value.

Do not put the real key in `public/index.html`, GitHub, or `netlify.toml`. Netlify environment variables are accessed by the function via `process.env`.

Netlify docs: https://docs.netlify.com/build/functions/environment-variables/

## Test the deployed site

1. Open the Netlify site URL.
2. Open **ATS Checker**, paste a short sample resume, and run the local ATS analysis.
3. Click **AI review & improve resume** and confirm the privacy prompt.
4. Try the AI resume generator from **Resume Builder**.
5. To tailor a resume, add a job description and use the AI review action.
6. If an AI call fails, open the Netlify project dashboard → Functions → `ai` → logs, then check the OpenRouter key, model availability, and free-tier limits.

The AI endpoint is `/.netlify/functions/ai`.

## Optional local test

Install Node.js 18 or newer. From this folder:

```bash
npx netlify-cli dev
```

Open the local URL printed by the CLI. For local function tests, make sure the environment variable `OPENROUTER_API_KEY` is available in your terminal environment. For example, in macOS/Linux:

```bash
export OPENROUTER_API_KEY="your-key"
npx netlify-cli dev
```

In Windows PowerShell:

```powershell
$env:OPENROUTER_API_KEY="your-key"
npx netlify-cli dev
```

## Privacy and limitations

- Resume data stays in the browser unless a user explicitly clicks an AI action and confirms the prompt.
- When an AI action is confirmed, resume text and any job description are sent to OpenRouter and the selected upstream model provider for processing.
- The API key stays in a Netlify server-side environment variable.
- The app does not save resume text to its own database.
- Free model availability, speed, quality and rate limits can change. `openrouter/free` selects an available free model when one is available; it does not guarantee unlimited requests.
- Netlify synchronous functions have a 60-second execution limit. This function aborts an upstream request after 50 seconds to leave time to return a response.
- The ATS score is a heuristic checklist, not a prediction from a specific employer's ATS.
- AI must not invent experience or credentials; review all generated content before using it.
