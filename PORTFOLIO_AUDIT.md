# Portfolio audit & project selection report

_Prepared for the 2026 redesign (branch `redesign`). Target roles: **Data Analyst**, **Business Intelligence Analyst**, **Business Analyst**._

Everything below comes from inspecting the actual repositories (README, file tree,
screenshots, scripts, live GitHub Pages demos) on github.com/JunayedParves and the
Tableau Public profile `junayed.parves`. No figures were invented: every number quoted
on the website comes from a project README, validation script or the résumé.

---

## 1. What was reviewed

| # | Project | Source | Evidence found |
|---|---|---|---|
| 1 | **TakaPay**: digital lending & credit risk | `takapay-lending-dashboard` | Live web app (11 tabs), Python pipeline, 2 out-of-time-validated logistic-regression models, methodology tab with reconciliation. Synthetic data |
| 2 | **Nexora Apparels**: RMG supply chain | `nexora-rmg-supply-chain-powerbi` | PBIP/TMDL (23 tables, 215 measures, 8 DAX UDFs), 8 page screenshots, before/after audit, BigQuery DDL, Python data generator. Synthetic (~3.04M rows) |
| 3 | **Nabanna Bazar**: retail decision intelligence | `nabanna-bazar-retail-intelligence` | PBIP, 9 pages + drill-through, 8 what-if levers, 60 ranked recommendations, model validation page, 9 screenshots. Synthetic (~482k records) |
| 4 | **WellCare Pharma**: executive performance | `wellcare-pharma-powerbi` + `wellcare-pharma-executive-analytics` + `wellcare-executive-dashboard` | Power BI (46 measures, BigQuery source, line-level reconciliation), Python Holt-Winters forecast with 2.9% backtest error, live HTML dashboard |
| 5 | **Project Tollgate**: checkout conversion root cause | `project-tollgate-excel` | Excel workbook with 13 live data-quality checks, z-test break-date scan, 30-segment tests, revenue bridge; Python cross-check; 3 screenshots |
| 6 | **Kinun 11.11**: campaign profitability | `kinun-1111-campaign-powerbi` | PBIP (18 tables, 183 measures), BigQuery source, 6 screenshots, SCR storyline. Synthetic |
| 7 | **Databel**: customer churn | `Databel-Churn-PowerBI` | PBIP, 4 pages, `validate.py` (pandas), live browser replica on GitHub Pages, 4 screenshots |
| 8 | Himalayan Expedition risk | `himalayan_expedition` | Live web visualisation on public Himalayan Database data; README with an insurance-underwriting framing; no methodology or data-prep code |
| 9 | Bank customer churn | `bank-customer-churn-dashboard` | Single HTML page, described in its README as AI-assisted |
| 10 | Pixar film intelligence | `pixar-dashboard` | Single HTML page, described as an AI-assisted experiment |
| 11 | Six Tableau Public dashboards | Tableau Public | Road Accident, Global CO2, Sugar Wagon, Maven Supplies, UFO Sightings, King County |
| 12 | Coffee Shop Sales (Excel) | `Coffee-Shop-Sales-Analysis` | Maven guided project, workbook + dashboard image |
| 13 | SQL + Tableau + Python | `SQL-Tableau-Python-Project` | 365 Data Science course exercises |
| 14 | pandas / Airbnb / Ski shop | 3 repos (2023) | Course exercises, notebooks only |
| 15 | `ParvesJunayed` | repo | An earlier portfolio site; its GitHub Pages URL returns "Site not found" |
| — | `link3_ai_cases`, `ai_work_flow_Rakib` | forks | Someone else's work; excluded |

## 2. Scores (1 = weak, 5 = strong)

Criteria: **R**elevance to target roles · **T**echnical depth · **B**usiness value ·
**A**nalytical depth · **E**vidence quality · **D**ifferentiation · Recruiter **A**ppeal.

| Project | R | T | B | A | E | D | Ap | **Total /35** |
|---|---|---|---|---|---|---|---|---|
| TakaPay credit risk | 5 | 5 | 5 | 5 | 5 | 5 | 5 | **35** |
| Project Tollgate (Excel RCA) | 5 | 4 | 5 | 5 | 5 | 5 | 5 | **34** |
| Nexora supply chain | 5 | 5 | 5 | 4 | 5 | 5 | 5 | **34** |
| Nabanna retail | 5 | 5 | 5 | 5 | 5 | 4 | 5 | **34** |
| WellCare Pharma | 5 | 5 | 5 | 5 | 5 | 4 | 5 | **34** |
| Kinun 11.11 campaign | 5 | 5 | 5 | 4 | 4 | 4 | 5 | **32** |
| Databel churn | 5 | 4 | 4 | 4 | 5 | 3 | 4 | **29** |
| Himalayan expedition | 3 | 3 | 3 | 3 | 3 | 5 | 3 | **23** |
| Tableau Public set | 4 | 3 | 3 | 3 | 4 | 2 | 3 | **22** |
| Bank churn (web) | 3 | 2 | 3 | 3 | 2 | 2 | 3 | **18** |
| Coffee Shop (Excel) | 3 | 2 | 3 | 2 | 3 | 1 | 2 | **16** |
| SQL + Tableau + Python course | 3 | 3 | 2 | 3 | 2 | 1 | 2 | **16** |
| Pixar (web) | 2 | 2 | 2 | 2 | 2 | 3 | 2 | **15** |
| pandas / Airbnb / Ski shop | 2 | 2 | 2 | 2 | 2 | 1 | 1 | **12** |

## 3. Decisions

**Flagship case studies** (dedicated page each; the first six are featured on the homepage):

| Case study | URL |
|---|---|
| TakaPay: Digital Lending & Credit Risk Intelligence | `/projects/takapay-credit-risk-analytics/` |
| Nexora Apparels: Supply Chain Intelligence | `/projects/nexora-supply-chain-intelligence/` |
| Nabanna Bazar: Retail Decision Intelligence | `/projects/nabanna-retail-decision-intelligence/` |
| WellCare Pharma: Growth, Profit & Outlook | `/projects/wellcare-pharma-performance/` |
| Project Tollgate: Checkout Conversion Root Cause | `/projects/checkout-conversion-root-cause/` |
| Kinun 11.11: Campaign Profitability | `/projects/kinun-campaign-profitability/` |
| Databel: Customer Churn Review (kept and improved: real screenshots replace the blank placeholder) | `/projects/databel-customer-churn/` |

**Secondary gallery** (projects page only, card + link, no case study):
Himalayan Expedition (live demo), the six Tableau Public dashboards, Coffee Shop Sales (Excel).

**Removed from the website** (repos left untouched on GitHub):
- Bank churn and Pixar: described as AI-assisted experiments, with thin methodology. They weaken credibility next to the flagship work.
- The 2023 course exercises (pandas, Airbnb, Ski shop, SQL + Tableau + Python): superseded by the newer work.
- "This portfolio website": not analytical evidence.
- `ParvesJunayed`: broken Pages site. **Recommend archiving the repo** (Settings → Archive) or fixing Pages.

**Worth improving (on GitHub, outside this website):**
- Himalayan Expedition: add a methodology section and the data-prep code to the repo. It could then become a case study (it is the only insurance-themed project).
- Add GitHub "About" descriptions and topics to `wellcare-pharma-executive-analytics`.
- Add screenshots to the TakaPay README. The website uses fresh captures of the live app.

## 4. Capability gaps

| Gap | Why it matters | Recommendation |
|---|---|---|
| **SQL analysis** | Every target role screens for SQL; only Nexora contains SQL (BigQuery DDL) | One SQL-first case study: a documented query set (CTEs, window functions, cohort and funnel analysis) on a public or synthetic dataset, with business questions and results |
| **Insurance domain** | It is the current role and core industry, but there is no portfolio evidence | An anonymised, synthetic insurance KPI case study (premium, renewal, branch, loss-ratio metrics) built **without** any employer data |
| **Business-analysis artefacts** | BA roles look for requirements, process and stakeholder work | One case study showing a BRD/user stories → KPI definitions → process map → dashboard acceptance criteria |

Only the gaps above were judged worth a new project. Forecasting (WellCare), predictive
modelling (TakaPay), prescriptive what-if analysis (Nabanna) and data-quality audits
(Nexora, WellCare, Tollgate) are already well evidenced.

## 5. Data labelling used on the website

| Label | Projects |
|---|---|
| **Synthetic data** | TakaPay, Nexora, Nabanna, Kinun; WellCare inventory/procurement tables |
| **Practice dataset** | WellCare sales (BigQuery practice dataset), Databel, Tollgate, Coffee Shop |
| **Public data** | Himalayan Database, Tableau Public datasets |

No project uses employer data, and no synthetic finding is presented as real business performance.
