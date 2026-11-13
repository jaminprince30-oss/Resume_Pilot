# ResumePilot

**Build, review, and refine a resume with AI assistance and transparent ATS-style feedback.**

ResumePilot is a browser-based resume builder and checker. Create a clean resume, compare its content against a target job description, review suggestions, and export a polished version without creating an account.

**[Try ResumePilot](https://resume-pilot-53m.pages.dev/)**

> **About the score:** ResumePilot calculates a **heuristic ATS-readiness checklist**, not a score from an employer's applicant tracking system or a prediction of interview success. A clearer resume does not always produce a higher number.

## What you can do

| Feature | Description |
| --- | --- |
| **Resume Builder** | Enter contact details, a summary, skills, experience, education, projects, and certifications with a live preview. |
| **AI Polish** | Refine supported wording and presentation, then compare the original and revised checklist scores. |
| **ATS Checker** | Paste text or extract content from a PDF, DOCX, or TXT resume and review specific structural and content signals. |
| **Job-description comparison** | Compare terms in a target job description with those in the resume. Include only skills you actually have. |
| **AI Review · Improve · ATS Format** | Get a written review, a revised resume, and a before/after checklist comparison with suggestions for missing evidence. |
| **Export** | Copy text or download supported resume versions as PDF, DOCX, or TXT. |
| **Example resume** | Explore the interface with built-in sample data; replace it with your own information before applying to a job. |

## How the ATS checklist works

The score is calculated **in the browser** from extracted resume text. The checks look for:

- **Contact details** — recognizable email address and phone number.
- **Sections and structure** — common headings such as Experience, Education, Skills, and Projects.
- **Keyword relevance** — overlap with terms from a job description, when provided.
- **Impact and readability** — action-oriented language, bullets, length, and recognizable outcome indicators.
- **Formatting signals** — simple text-based indicators that might affect readability.

With a job description, these categories contribute to a score out of 100. Without one, keyword relevance is marked **N/A** and the remaining checklist is normalized to 100.

A score can stay the same—or decrease—after AI editing. ResumePilot reports the result rather than artificially boosting it. The checker cannot fully determine how a particular employer's ATS will interpret the original file's layout, tables, or graphics.

## AI assistance and factual accuracy

The AI features are optional and use a **server-side AI integration**. They aim to improve clarity and organization while keeping the candidate's information accurate.

- Existing employers, qualifications, dates, links, and measurable results should be preserved.
- The backend checks for several types of factual changes, including removed sample labels, changed email addresses or links, and unsupported years or numerical results.
- If a detectable factual inconsistency is found, the AI response is rejected instead of being offered as the finished resume.
- Missing outcomes and job-specific evidence should be treated as **questions for the candidate**, not details to invent.

These checks are limited: **always review every AI-generated statement before using a resume.**

## Getting started

1. Open **[ResumePilot](https://resume-pilot-53m.pages.dev/)**.
2. Choose **Resume Builder** to create a resume, or **ATS Checker** to paste or upload one.
3. In the ATS Checker, optionally paste a **target job description** for keyword comparison.
4. Select **Analyze resume** to see the initial checklist score and recommendations.
5. Select **AI Review · Improve · ATS Format** for a revised draft and before/after results, or use **AI Polish** in the builder.
6. Review every change and export the version you want to use.

The PDF and DOCX readers load parsing libraries over the network. If extraction fails, paste the resume's text instead. Older `.doc` files are not supported by the checker.

## Project structure

```text
Resume_Pilot/
├── public/
│   └── index.html            # UI, builder, local ATS checks, and exports
├── functions/
│   └── api/
│       └── ai.js             # Cloudflare Pages AI endpoint
├── netlify/
│   └── functions/
│       └── ai.js             # Alternative serverless implementation
├── tests/                   # ATS and AI-integrity regression tests
├── worker.js                # Additional worker implementation
├── .env.example             # Example server-side configuration
├── netlify.toml
├── wrangler.toml
├── package.json
└── README.md
```

The client is built with HTML, CSS, and JavaScript. The ATS checklist runs locally; AI-assisted actions send a request to the serverless endpoint at `POST /api/ai`.

## Local development

No frontend build step is required. To preview the UI locally, serve the `public` directory using a static file server:

```bash
python3 -m http.server 8000 --directory public
```

Open **http://localhost:8000**. Resume building and local checklist analysis work without an AI endpoint; AI actions require a configured serverless backend and will not work with the static server alone.

To run the available automated regression tests:

```bash
npm test
```

The tests use Node.js's built-in test runner.

## Deploying

### Cloudflare Pages

1. Connect this repository to your Cloudflare Pages project.
2. Set the production branch to `main` and the output directory to `public`.
3. Leave the build command empty; the site is static.
4. Configure the **server-side API key** as a secret and the **model identifier** as a project environment variable. Refer to `.env.example` for the variable names expected by the backend.
5. Redeploy and verify that both local ATS checks and AI actions work.

The `functions/api/ai.js` file provides the `/api/ai` endpoint. Keep credentials in the hosting environment—**never in client-side JavaScript or GitHub commits**.

An alternative Netlify function is included in the repository. If using that platform, verify the function routing to `/api/ai` and configure the corresponding server-side environment variables before deploying.

## Privacy and limitations

- Uploaded PDF/DOCX/TXT files are read in the browser for checklist analysis; extracted text is not automatically submitted for AI processing.
- **AI actions require confirmation** before sending resume content and an optional job description to the configured AI service.
- The project does not include a database for storing resumes.
- Results depend on text extraction, input completeness, and the available AI service.
- The checklist is informational—not a certification of ATS compatibility or a hiring guarantee.
- AI can improve clarity, but cannot truthfully supply missing experience, skills, or achievements.

## Contributing

Suggestions and improvements are welcome through GitHub issues and pull requests. For scoring or AI-related changes, include a reproducible example and update the regression tests when relevant.
