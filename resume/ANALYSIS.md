# Resume Analysis & Rebuild — Ace Guevarra

Analysis of `Ace Guevarra Resume (Updated v.2).pdf` and the reasoning behind every change in the three rebuilt versions.

---

## 1. Executive summary

**The problem is not your experience. It is the packaging.**

Your source material is genuinely strong for someone ~1.5 years in. Most junior-to-mid resumes contain zero real numbers; yours has 1,539 applications, 888 guardians, 11,368 documents, 3-day → same-day, 80%, 25%, 100+/week. That is the hard part, and you already had it.

What the old resume did was hide the three things that actually differentiate you:

1. **Your AI engineering work appears nowhere.** A custom MCP server built before an official one existed, and Claude Code driving the full SDLC. This is the single most valuable thing on your CV for the companies you're targeting, and it was 100% absent.
2. **Your integration surface appears nowhere.** Eleven production third-party platforms, plus full GoHighLevel CRM configuration. Absent.
3. **Your engineering rigor appears nowhere.** Testing (Vitest, Cypress), cloud deploys (Vercel, Azure App Service), CI/CD, auth, webhooks. Absent or buried.

Net effect: a recruiter's six-second scan of the old document returned *"React developer, does some n8n."* That is precisely the read you asked me to eliminate.

---

## 2. Weakness audit

### A. Positioning — the most damaging category

| # | Weakness | Why it matters |
|---|---|---|
| A1 | **No headline under your name.** The document went straight from "Ace Guevarra" to "SKILLS". | A recruiter screening 200 resumes needs your role category in under 2 seconds. With no headline they assign one from the first thing they see — which was a skills list dominated by React. |
| A2 | **No summary section.** | You have three distinct capability clusters (build, automate, AI). Without a summary the reader has to synthesize that themselves. They won't. |
| A3 | **No ownership or scope signal.** Bullets describe *what shipped*, never that you drove it from requirements to deploy. | "Delivers independently, talks to stakeholders" is a top-decile signal for remote roles. It was invisible. |
| A4 | **`(B1)` band code in the job title.** | Internal HR jargon. Means nothing externally and reads as clutter. |

### B. Structure & layout

| # | Weakness | Why it matters |
|---|---|---|
| B1 | **Internship placed above Work Experience.** | This is the most costly structural error in the document. It puts a 5-month 2024 Laravel internship in front of 1.5 years of production systems ownership. |
| B2 | **QR code block in the upper third of page one.** | Prime real estate spent on something an ATS cannot read, a recruiter won't scan on a laptop screen, and that a plain URL replaces for free. |
| B3 | **Skills placed above Experience, with no summary to frame them.** | Skills-first is defensible for early career, but only *after* a summary. Leading with a raw tech list frames you as a tool user rather than a problem solver. |
| B4 | **`INTERNSHIP/S` as a section heading.** | Non-standard string. ATS parsers key on canonical headings — `EXPERIENCE`, `EDUCATION`, `SKILLS`, `PROJECTS`. Unusual headings can drop a section into an unclassified bucket. |
| B5 | **Internship prose is one dense block, not bullets.** | Scans poorly and buries what you actually built. |

### C. Contactability

| # | Weakness | Why it matters |
|---|---|---|
| C1 | **No LinkedIn URL. No GitHub URL.** Only email, phone, city. | For remote international roles this is close to disqualifying friction. Recruiters source and verify on LinkedIn; engineering managers check GitHub. You had both ([linkedin.com/in/ace-guevarra](https://linkedin.com/in/ace-guevarra), [github.com/atlasxdev](https://github.com/atlasxdev)) and neither was on the page. |
| C2 | **No remote-availability signal, no country.** "Calamba City, Laguna" alone means nothing to a recruiter in Berlin or SF. | Remote-first companies filter on location and work authorization. Say the country, say you're open to remote. |

### D. Skills taxonomy

| # | Weakness | Why it matters |
|---|---|---|
| D1 | **Supabase filed under "Languages & Databases."** | Supabase is a backend platform, not a language. Miscategorization reads as shallow understanding to a technical reviewer. |
| D2 | **Slack, Microsoft 365, ClickUp listed as technical skills.** | These actively dilute the profile. Listing Slack as a skill is a junior tell. (ClickUp and Discord earn their place in the *integrations* line instead, where they demonstrate real API work.) |
| D3 | **No Cloud, Testing, AI, or Backend category at all.** | Vercel, Azure App Service, CI/CD, Vitest, Cypress, REST API design, auth, and webhooks were missing entirely — despite being real experience. |
| D4 | **"Key Strengths" row.** | A buzzword row that duplicates what the bullets already prove. Proof beats assertion. |
| D5 | **Tailwind CSS missing.** | You use it in every project and it's a high-frequency ATS keyword. |
| D6 | **`ShadCN UI`** | Minor: the library's own name is `shadcn/ui`. Small detail, but technical reviewers notice. |

### E. Bullet quality

| # | Weakness | Why it matters |
|---|---|---|
| E1 | **Metrics buried at sentence end.** e.g. *"...accelerating candidate screening from 3 days to same-day for 200+ monthly applicants."* | Under a partial scan, the reader sees the setup and misses the payoff. Numbers should land early. |
| E2 | **SIS bullet 1 is descriptive, not accomplishment-driven.** Three lines of what the system *is*, with no outcome. | Every bullet should end in a result. |
| E3 | **Tech stacks absent from project blocks.** The Recruitment and SIS projects name almost no technology. | ATS scoring weights keywords appearing *in context* higher than keywords in a list. You lost matches you'd earned. |
| E4 | **"Reduced manual staff intervention" style phrasing without the mechanism.** | Stating the mechanism (Pending Actions dashboard, validated uploads) is what makes an outcome credible. |

### F. Content gaps — the largest category by value

Entirely missing from the old resume, all of it real:

- Custom **Fathom AI MCP server**, built pre-official-integration
- **Claude Code across the full SDLC** — requirements, architecture, context engineering, sprint planning, testing, CI/CD, deploy, maintain
- **Anthropic API** integration
- **GoHighLevel CRM** configuration (pipelines, opportunities, workflows, calendars, forms, funnels, snapshots, email/SMS campaigns, custom fields) and its n8n integration
- The **eleven production integrations**: GoHighLevel, Manatal, Supabase, Anthropic, Cloudinary, Outlook, Discord, Resend, Calendly, ClickUp, Fathom AI
- **Cloud**: Vercel, Azure App Service
- **Testing**: Vitest, Cypress
- **Auth, webhooks, REST API design**
- **Tailwind CSS**
- Personal projects demonstrating LLM application work

---

## 3. Scorecard

Weighted across the dimensions a recruiter and an ATS actually evaluate.

| Dimension | Weight | Original | Rebuilt | Δ |
|---|---:|---:|---:|---:|
| Positioning & headline | 15% | 2.0 | 9.0 | +7.0 |
| ATS parseability | 15% | 6.0 | 9.5 | +3.5 |
| Keyword coverage | 15% | 5.0 | 9.0 | +4.0 |
| Bullet quality | 15% | 7.5 | 9.0 | +1.5 |
| Quantification | 10% | 8.0 | 9.0 | +1.0 |
| Technical depth signal | 10% | 4.0 | 9.0 | +5.0 |
| Scope & ownership signal | 10% | 3.0 | 8.5 | +5.5 |
| Visual hierarchy & density | 5% | 5.5 | 9.0 | +3.5 |
| Contactability | 5% | 3.0 | 10.0 | +7.0 |
| **Weighted total** | | **5.0 / 10** | **9.1 / 10** | **+4.1** |

**Reading the numbers.** The original scores highest exactly where it deserves to — quantification (8.0) and bullet quality (7.5). Those are the hard-won parts and they were already good. Every point of the gap comes from structure, coverage, and positioning, not from any deficiency in your actual work. That is the best possible diagnosis to receive: nothing needed to be invented, only surfaced.

**Why 9.1 and not 10.** Two ceilings you can't paper over at 1.5 years: no formal team-leadership or mentoring signal, and no open-source contribution or public technical writing footprint. Both are addressable — see §8.

---

## 4. What changed, and why

### Added a headline + summary
A recruiter's first fixation lands under your name. Three role-tuned headlines now occupy that spot, each followed by a 3-line summary that states capability, stack, and proof numbers before the reader reaches any section. **Why:** it removes the reader's need to infer your category — which they will otherwise get wrong.

### Moved Experience above the Internship; renamed the section
`WORK EXPERIENCE` and `INTERNSHIP/S` merged into one canonical `EXPERIENCE` section, real work first, internship compressed to a single bullet at the bottom. **Why:** chronology and weight now match reality, and the heading string is one an ATS reliably classifies.

### Killed the QR code, added the links
Portfolio, LinkedIn, and GitHub now appear as text URLs in the contact line — machine-readable, clickable in the PDF, legible on paper. **Why:** you reclaim ~25mm of page-one real estate and become findable.

### Restructured skills into 7–8 real categories
Languages / Frontend / Backend & Data / Cloud & DevOps / Testing / AI Engineering / Automation / CMS. Slack, Microsoft 365, and Teams dropped. **Why:** a technical reviewer reads your *taxonomy* as evidence of how you think about systems. Correct categories signal depth; a flat list signals a bootcamp graduate.

### Added a `Stack:` line to every project
**Why:** ATS keyword scoring weights in-context matches above list matches, and it lets a hiring manager judge technical fit per project rather than guessing which tools went where.

### Rewrote every bullet as action → mechanism → quantified outcome
Metrics moved forward in the sentence; mechanisms named so outcomes are credible; the descriptive SIS bullet turned into a consolidation-and-outcome claim. **Why:** partial scans still land on the number.

### Surfaced ownership explicitly
A scope line under VizServe: *"Own delivery of three production systems end-to-end — stakeholder requirements gathering, architecture and stack selection, phased build, testing, deployment, and maintenance."* **Why:** this is the sentence that reclassifies you from *implementer* to *engineer who can be handed a problem*. For remote roles it is worth more than any individual bullet.

### Added the integrations line
One dense line naming all eleven platforms. **Why:** maximum keyword density per millimetre, and it proves breadth no single project bullet could.

### Added AI engineering content
Present in all three variants, sized to the audience: a one-line note in the automation version, a dedicated section in the AI version. **Why:** this is your sharpest differentiator, and it was entirely missing.

### Added country + remote availability
**Why:** removes a filter step for international recruiters.

### Format: single-column HTML → PDF
No tables, no text boxes, no multi-column layout, no images or icons carrying information, no header/footer regions. Canonical section headings. **Why:** all five of those are the classic ways a resume gets mangled or silently dropped by an applicant tracking system.

---

## 5. Truthfulness ledger — what I did *not* add

You asked for zero exaggeration, so here is the explicit accounting.

**Deliberately excluded despite appearing in your portfolio data** ([src/data/resume.tsx](../src/data/resume.tsx)), because they were absent from the technical-experience brief you gave me: Express.js, MongoDB, JWT, Directus, Framer Motion.

**Excluded as profile-diluting:** Slack, Microsoft 365, Teams, ClickUp and Discord as *skills* (the last two survive only in the integrations line, where they represent genuine API work).

**Laravel** stays in the internship bullet, where it is factual, but is deliberately kept out of the skills block — one 5-month internship is not a skill claim.

**No number was changed, rounded, or inflated.** 1,539 / 888 / 11,368 / 3 days → same-day / 200+ / 80% / 100+ / 25% are all reproduced exactly as you supplied them.

**No new claim was manufactured.** Every added line traces to your brief: the MCP server, the Claude Code SDLC workflow, the GoHighLevel configuration list, the integrations list, the cloud and testing tools. The only fact sourced from your portfolio rather than your brief is Google Gemini in the Diabetes Meal Assistant ([resume.tsx:188](../src/data/resume.tsx#L188)) — flagged because your brief listed Anthropic but not Google.

**Cut for the one-page constraint, not for truthfulness:** Shop Quickie, and your portfolio site itself. Once real production systems carry the page, a personal e-commerce demo competes with them for space and loses. The Diabetes Meal Assistant survives only in the AI variant, where it earns its place as LLM application evidence. Your GitHub URL is in the contact line of all three, so nothing is hidden — it's one click away.

**One softening, on purpose.** I did not write "sole engineer" or "solo-delivered" for the VizServe systems. Your brief establishes that you own the workflow end-to-end, which is what I wrote; it does not establish that you were the only engineer. If you *were* the sole engineer on those systems, tell me and I'll strengthen that line — it's a meaningful upgrade.

---

## 6. Files

| File | Target roles |
|---|---|
| `ace-guevarra-fullstack-engineer.html` | Full-Stack Engineer, Software Engineer, Product Engineer, Frontend-heavy full-stack |
| `ace-guevarra-automation-engineer.html` | Automation Engineer, Integrations Engineer, Solutions Engineer, RevOps/Technical Consultant, Implementation Engineer |
| `ace-guevarra-ai-engineer.html` | AI Engineer, AI-Augmented SWE, Forward-Deployed Engineer, Developer Tooling, AI startup generalist |
| `resume.css` | Shared print stylesheet for all three |

All three carry the identical fact base. They differ in headline, summary, section order, skills-row order, project order, and which optional block appears.

### Keyword coverage by variant

| Variant | ATS terms it now matches |
|---|---|
| **Full-Stack** | Full-Stack Engineer · Software Engineer · TypeScript · React · Next.js · PostgreSQL · REST API · authentication · CI/CD · Vercel · testing · end-to-end delivery |
| **Automation** | Automation Engineer · Integrations Engineer · Solutions Engineer · n8n · workflow automation · business process automation · CRM configuration · ATS configuration · webhooks · REST API integration · GoHighLevel · Manatal |
| **AI** | AI Engineer · MCP · Model Context Protocol · Anthropic API · LLM integration · Claude Code · context engineering · AI-augmented development · full-stack |

---

## 7. How to use these

**Export to PDF**

1. Open the `.html` file in Chrome or Edge.
2. `Ctrl + P` → Destination **Save as PDF** → Paper **A4** → Margins **None** → **Background graphics ON**.
3. The preview should show **exactly one page** (already verified — see below).

If you ever edit content and a variant spills to page two, `resume.css` has three density knobs at the top of the file, listed in the order you should reach for them. Use them one at a time; `--fs-base` has a `9.2pt` floor below which the page reads cramped.

**Name the file for the human reading it**, not for your filesystem:
`Ace-Guevarra-Full-Stack-Engineer.pdf` · `Ace-Guevarra-Automation-Engineer.pdf` · `Ace-Guevarra-AI-Engineer.pdf`

**Which one to send**

- Job title contains *Full-Stack, Software Engineer, Product Engineer, Frontend* → full-stack version
- Job title contains *Automation, Integration, Solutions, Implementation, Technical Consultant, RevOps* → automation version
- Company is an AI startup, or the posting mentions *LLM, agents, MCP, AI tooling, developer experience* → AI version
- Genuinely ambiguous → full-stack version. It's the safest default.

**Tailor per application (5 minutes, high ROI).** Mirror 3–5 exact phrases from the job description into your summary and skills rows — same wording they used. ATS matching is literal: "REST API design" and "RESTful services" do not always score as the same token.

### Verification performed

Each variant was rendered to PDF headlessly and the text layer extracted back out — the practical proxy for what an ATS sees.

| Check | Result |
|---|---|
| Page count (A4) | 1 page — all three |
| Content height vs. A4 budget | 1062 / 1099 / 1104 px against a 1122 px budget |
| Section order in the text layer | Summary → Skills → (AI) → Experience → Education, correct in all three |
| Bullets attached to the right project | Correct in all three |
| Extractable text volume | ~3,900–4,100 characters per page |
| Every source metric present | 1,539 · 888 · 11,368 · 3-days-to-same-day · 200+ · 80% · 100+ · 25% — all present in all three |
| Stray/unsourced numbers | None |

One defect found and fixed during this pass, worth knowing about if you ever restyle these: bullets were originally drawn with an absolutely-positioned `::before`. That is visually identical but makes Chrome emit **every list item at the very end of the PDF's text stream** — so an ATS read the bullets detached from their projects, dumped after Education. The stylesheet now uses native `::marker` bullets instead, and there is a comment in `resume.css` explaining why. Don't reintroduce the `::before` pattern.

A cosmetic note on extraction: some tools render `—` and `·` as `?`. That is a limitation of those extractors, not of the file — the PDF's character maps were inspected directly and encode both correctly.

---

## 8. Open items for you

1. ~~**Job title mismatch.**~~ **Resolved — and it was never a mismatch.** You joined as *Associate System Developer* in Jan 2025 and were promoted to *System Engineer I* in Jan 2026. All three resumes now show the progression:

   ```
   VizServe Private Limited                        Jan 2025 – Present
     System Engineer I                             Jan 2026 – Present
     Associate System Developer                    Jan 2025 – Jan 2026
   ```

   This is a meaningful upgrade, not just a correction. **A promotion inside 12 months is one of the strongest signals a junior engineer can put on a resume** — it's third-party evidence that someone who worked with you daily decided you'd outgrown your level. No self-description competes with that. It was completely invisible before.

   Still worth doing: make sure LinkedIn shows both roles as separate entries under VizServe rather than one overwritten title, so the promotion is visible there too. LinkedIn is where a recruiter cross-checks first, and a single current title hides the progression exactly the way the old resume did.

2. **Directus.** It's in your real admission-system description ([resume.tsx:143](../src/data/resume.tsx#L143)) but not in your skills brief. Say the word and I'll add it to Backend & Data.

3. **Were you the sole engineer** on the admission system, SIS, and recruitment automation? If yes, that line gets materially stronger — see §5.

4. **Two ceilings worth attacking** over the next 6–12 months, since they're the reason the score is 9.1 and not higher: (a) any leadership or mentoring signal — onboarding a junior, owning a technical decision for a team, running a review process; (b) a public footprint — open-source contribution, or writing up the Fathom MCP server as a post on your blog. The MCP server in particular is a genuinely interesting story and it is currently invisible to anyone who hasn't read your resume.

5. **Update the portfolio summary.** [resume.tsx:17](../src/data/resume.tsx#L17) still describes you as focused on "admission systems and recruitment process automation" with "full-stack development and workflow automation." It's now behind the resume — no AI, no MCP, no integrations breadth. Worth syncing so the two documents tell the same story.
