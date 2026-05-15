# Gen AI Bootcamp — Team Project Briefs
> 6 teams · ~6–7 members per team · Build on Sessions 1–3

Each project uses the same boilerplate stack (Next.js · AI SDK · Redux · RAG · Tools).  
Teams pick their AI provider — LM Studio works for everything offline.

---

## Team Assignment Overview

| Team | Project | Core Session Skills Used |
|------|---------|--------------------------|
| **Team 1** | Recipe Assistant & Meal Planner | Session 2 (Chat UX) + Session 3 (RAG + Tools) |
| **Team 2** | Customer Support Agent | Session 1 (Providers) + Session 3 (RAG + Tool calling) |
| **Team 3** | Travel Planner Bot | Session 3 (Tools: weather, datetime) + Session 2 (Settings) |
| **Team 4** | Study Buddy & Quiz Generator | Session 3 (RAG) + Session 2 (Markdown rendering) |
| **Team 5** | Code Review Assistant | Session 3 (RAG + Tools) + Session 2 (Chat UI) |
| **Team 6** | Legal Document Analyzer | Session 3 (RAG + chunking) + Session 2 (Redux settings) |

---

## Delivery Checklist (all teams)

By demo day each team must show:
- [ ] Working chat UI (from Session 2 baseline)
- [ ] At least **2 custom tools** registered in `tools.ts`
- [ ] At least **1 document** uploaded and queried via RAG
- [ ] A **settings panel** with at least one project-specific control
- [ ] A **live demo** — not slides, actual running app

---

---

## Team 1 — Recipe Assistant & Meal Planner

### What You're Building
A chat assistant that knows your recipe library. Users can ask for meal ideas, get nutritional estimates, and plan a week of meals — all grounded in uploaded recipe documents.

### Features to Build

| Feature | Session Skill |
|---------|--------------|
| Upload `.txt` recipe files and chunk them into RAG | Session 3 — `storeDocument()` |
| Ask "what can I make with chicken and rice?" | Session 3 — `retrieveChunks()` |
| `calculate_nutrition` tool — estimates calories given ingredients | Session 3 — `tool()` |
| `get_ingredient_substitutions` tool — suggests swaps (e.g. no eggs) | Session 3 — `tool()` |
| Dietary filter setting (vegan / gluten-free / low-carb) injected into system prompt | Session 2 — `settingsSlice` |
| Render recipes with Markdown — bold headings, bullet ingredient lists | Session 2 — `react-markdown` |

### Files to Create / Edit
```
src/lib/ai/tools.ts          add: calculateNutrition, getSubstitutions
src/lib/ai/rag.ts            existing — wire to recipe docs
src/lib/store/slices/settingsSlice.ts   add: dietaryFilter field
src/app/api/chat/route.ts    inject dietaryFilter into system prompt
src/components/chat/DietaryFilterSelect.tsx   new dropdown
```

### System Prompt Template
```
You are a friendly recipe assistant with access to a personal recipe library.
Always retrieve relevant recipes before answering.
The user's dietary preference is: {{dietaryFilter}}.
Never suggest dishes that conflict with this preference.
Format recipes with Markdown: ## Title, **Ingredients**, steps as numbered list.
```

### Sample Data — `recipes.txt`
```
SPAGHETTI CARBONARA
Ingredients: 400g spaghetti, 200g pancetta, 4 egg yolks, 100g Pecorino Romano, black pepper
Method:
1. Cook spaghetti in salted boiling water until al dente.
2. Fry pancetta until crispy. Remove pan from heat.
3. Whisk egg yolks with grated Pecorino.
4. Toss hot pasta with pancetta, then quickly add egg mixture off-heat.
5. Add pasta water to loosen. Season generously with black pepper.
Serves: 4 | Calories: ~650 per serving | Time: 25 min
Tags: pasta, egg, pork, quick

---

ROASTED LEMON CHICKEN
Ingredients: 1 whole chicken (1.5kg), 2 lemons, 4 garlic cloves, 2 tbsp olive oil, rosemary, thyme
Method:
1. Preheat oven to 200°C.
2. Rub chicken with olive oil, salt, pepper, rosemary, thyme.
3. Stuff cavity with halved lemons and garlic.
4. Roast 1h 20min, basting every 30 min.
5. Rest 15 min before carving.
Serves: 4 | Calories: ~520 per serving | Time: 95 min
Tags: chicken, gluten-free, roast

---

CHICKPEA & SPINACH CURRY (VEGAN)
Ingredients: 2 cans chickpeas, 200g spinach, 1 can coconut milk, 1 onion, 3 garlic cloves, 2 tsp cumin, 1 tsp turmeric, 1 tsp garam masala, 400g chopped tomatoes
Method:
1. Sauté onion and garlic in oil until soft.
2. Add spices and cook 2 min.
3. Add tomatoes and chickpeas, simmer 15 min.
4. Stir in coconut milk and spinach. Cook 5 min.
5. Serve with rice or naan.
Serves: 4 | Calories: ~380 per serving | Time: 30 min
Tags: vegan, gluten-free, curry, high-protein

---

CLASSIC BEEF BURGER
Ingredients: 500g minced beef (20% fat), 4 brioche buns, lettuce, tomato, red onion, 4 slices cheddar, burger sauce (mayo + ketchup + mustard + pickle)
Method:
1. Season mince with salt and pepper. Form into 4 patties (2cm thick).
2. Cook on hot griddle 3-4 min per side for medium.
3. Add cheese in last 30 seconds.
4. Toast buns. Assemble with sauce, lettuce, tomato, onion.
Serves: 4 | Calories: ~720 per serving | Time: 20 min
Tags: beef, pork-free option, quick

---

AVOCADO & MANGO SALAD (VEGAN, GLUTEN-FREE)
Ingredients: 2 ripe avocados, 1 mango, 200g mixed greens, 1 lime, 2 tbsp olive oil, fresh coriander, chilli flakes
Method:
1. Dice avocado and mango.
2. Whisk lime juice, olive oil, salt, chilli.
3. Toss greens with dressing, top with avocado and mango.
4. Garnish with coriander.
Serves: 2 | Calories: ~320 per serving | Time: 10 min
Tags: vegan, gluten-free, salad, raw, low-carb
```

### Stretch Goals
- Week planner: generate a 7-day meal plan as a Markdown table
- Shopping list tool: aggregates ingredients for a multi-day plan
- Calorie budget setting (e.g. "max 2000 kcal/day") injected into system prompt

---

---

## Team 2 — Customer Support Agent

### What You're Building
An AI-powered support agent for a fictional SaaS product ("Clarify Analytics"). It answers questions from an uploaded knowledge base and can raise support tickets and check subscription status via tools.

### Features to Build

| Feature | Session Skill |
|---------|--------------|
| Upload FAQ + product docs as RAG knowledge base | Session 3 — `storeDocument()` |
| `create_ticket` tool — logs issue to an in-memory store | Session 3 — `tool()` |
| `check_subscription` tool — returns fake plan data for a user ID | Session 3 — `tool()` |
| `escalate_to_human` tool — marks conversation as needing human review | Session 3 — `tool()` |
| Tone setting: Formal / Friendly / Technical (injected into system prompt) | Session 2 — `settingsSlice` |
| Show ticket confirmation as a styled card in the chat | Session 2 — custom message component |

### Files to Create / Edit
```
src/lib/ai/tools.ts       add: createTicket, checkSubscription, escalateToHuman
src/lib/store/tickets.ts  in-memory ticket store (Map)
src/lib/store/slices/settingsSlice.ts  add: supportTone
src/components/chat/TicketCard.tsx     new — styled ticket confirmation
src/app/api/chat/route.ts  inject tone into system prompt
```

### System Prompt Template
```
You are a support agent for Clarify Analytics, a data visualisation SaaS.
Tone: {{supportTone}}.
Always search the knowledge base before answering.
If you cannot find an answer, escalate to a human agent.
When a user reports a bug, always create a support ticket.
Never make up pricing or feature information.
```

### Sample Data — `clarify-faq.txt`
```
CLARIFY ANALYTICS — SUPPORT KNOWLEDGE BASE

PRODUCT OVERVIEW
Clarify Analytics is a no-code data visualisation platform. Connect your databases, 
spreadsheets, and APIs to create interactive dashboards in minutes.
Supported data sources: PostgreSQL, MySQL, Google Sheets, Airtable, REST APIs, CSV uploads.
Free plan: up to 3 dashboards, 1 data source, 1 user.
Pro plan ($49/month): unlimited dashboards, 10 data sources, 5 users.
Business plan ($199/month): unlimited everything, SSO, audit logs, priority support.

COMMON ISSUES

Issue: Dashboard not loading
Solution: Clear browser cache (Ctrl+Shift+R). If the issue persists, check that your 
data source connection is active under Settings > Data Sources. Token expiry is the 
most common cause — reconnect the data source.

Issue: CSV upload fails
Solution: Ensure the file is under 50MB and uses UTF-8 encoding. Column headers must 
not contain special characters. Dates must be in ISO format (YYYY-MM-DD).

Issue: Charts show "No data"
Solution: Check your date filter — it may be set to a range with no data. 
Verify the connected data source has rows for the selected period.

Issue: Invite email not received
Solution: Check spam folder. Invites expire after 48 hours. Re-send from 
Settings > Team > Pending Invites.

BILLING FAQ
Q: Can I change plans mid-cycle?
A: Yes. Upgrades are prorated immediately. Downgrades take effect at the next billing date.

Q: Do you offer annual billing?
A: Yes. Annual plans receive a 20% discount. Switch under Settings > Billing > Plan.

Q: What payment methods do you accept?
A: Visa, Mastercard, Amex, and bank transfer for Business plans.

Q: How do I cancel?
A: Settings > Billing > Cancel Subscription. Data is retained for 30 days after cancellation.

API & INTEGRATIONS
The Clarify REST API is available on Pro and Business plans.
API docs: https://docs.clarifyanalytics.io/api
Rate limits: 1000 requests/hour on Pro, 10000/hour on Business.
Webhooks are supported for dashboard events and data refresh completions.

SECURITY
Clarify is SOC 2 Type II certified.
All data is encrypted at rest (AES-256) and in transit (TLS 1.3).
SSO (SAML 2.0, OIDC) is available on Business plan only.
Two-factor authentication is available on all plans.
```

### Stretch Goals
- Show open tickets as a sidebar list (read from in-memory store)
- Sentiment detection: if user seems frustrated, auto-escalate after 3 turns
- `search_docs` tool that returns chunks with source citations

---

---

## Team 3 — Travel Planner Bot

### What You're Building
A conversational travel planner. Users describe a destination and trip style; the bot uses live weather, timezone, and currency tools alongside a RAG knowledge base of destination guides to build an itinerary.

### Features to Build

| Feature | Session Skill |
|---------|--------------|
| `get_weather` tool — current conditions for a city | Session 3 — (reuse from Session 3 tool) |
| `get_datetime` tool — local time + day at destination | Session 3 — (reuse) |
| `convert_currency` tool — simple fx rate lookup | Session 3 — new `tool()` |
| `estimate_flight_time` tool — returns rough duration from city pair | Session 3 — new `tool()` |
| RAG from destination guides (upload `.txt` files) | Session 3 — `retrieveChunks()` |
| Trip style selector: Backpacker / Family / Luxury | Session 2 — `settingsSlice` |
| Render itinerary as a Markdown table | Session 2 — `react-markdown` |

### Files to Create / Edit
```
src/lib/ai/tools.ts       add: convertCurrency, estimateFlightTime
src/lib/store/slices/settingsSlice.ts  add: tripStyle, budget (per day in $)
src/components/chat/TripStyleSelector.tsx
src/app/api/chat/route.ts  inject tripStyle + budget into system prompt
```

### System Prompt Template
```
You are an expert travel planner.
Trip style: {{tripStyle}}. Daily budget: ${{budget}} per person.
Always check the weather at the destination before suggesting activities.
Always confirm the local time before suggesting time-sensitive activities.
When creating itineraries, format them as a Markdown table with columns:
Day | Morning | Afternoon | Evening | Est. Cost.
Ground answers in the destination guide documents when available.
```

### Sample Data — `athens-guide.txt`
```
ATHENS, GREECE — DESTINATION GUIDE

OVERVIEW
Athens is the capital of Greece and one of the world's oldest cities, with recorded 
history spanning over 3,400 years. Population: ~3.1 million (metro area).
Language: Greek. Currency: Euro (EUR). Time zone: EET (UTC+2), EEST in summer (UTC+3).
Best time to visit: April–June and September–October (mild, less crowded).
Avoid: July–August (extreme heat, 35°C+, heavy tourist crowds).

TOP ATTRACTIONS
1. Acropolis & Parthenon — iconic ancient citadel. Open daily 08:00–20:00. Entry €20.
   Tip: arrive at opening time to beat crowds and heat.
2. Acropolis Museum — world-class exhibits of Parthenon sculptures. Entry €10.
3. Plaka neighbourhood — charming old town, tavernas, souvenir shops. Free to walk.
4. National Archaeological Museum — largest collection of ancient Greek artefacts. Entry €12.
5. Monastiraki Flea Market — open-air market, best on Sundays. Free to browse.
6. Cape Sounion — temple of Poseidon, stunning sunset views. 1h drive from city centre.
7. Syntagma Square — watch the Changing of the Guard at the Hellenic Parliament (every hour).

FOOD & DRINK
Must-try dishes: moussaka, souvlaki, spanakopita, loukoumades (honey donuts), fresh seafood.
Budget meal: €8–12 (gyros or souvlaki wrap + drink).
Mid-range taverna: €20–35 per person.
Fine dining: €60–100+ per person.
Local wine: Assyrtiko (white), Xinomavro (red). Local beer: Mythos, Fix.
Neighbourhood for food: Monastiraki, Psiri (nightlife), Kolonaki (upscale).

TRANSPORT
Metro: 3 lines, covers most tourist areas. Day pass €4.50.
Taxi: use Beat app (like Uber). Airport to city centre ~€40, 40 min.
Airport: Athens International "Eleftherios Venizelos" (ATH). 
Metro line 3 to city: €10, 40 min.
Ferries to Greek islands depart from Piraeus port (30 min by metro from city).

ACCOMMODATION
Budget: Monastiraki / Omonia area, hostels from €25/night.
Mid-range: Plaka, boutique hotels €80–150/night.
Luxury: Kolonaki, Grande Bretagne hotel from €350/night.

PRACTICAL TIPS
- Tap water is safe to drink.
- Most museums are free on the first Sunday of each month (Nov–Mar).
- Tipping: 5–10% in restaurants is appreciated but not mandatory.
- Emergency number: 112 (EU standard).
- Pharmacies are marked with a green cross and are plentiful.
```

### Stretch Goals
- Multi-destination trip: chain cities together with travel days between them
- Packing list tool based on weather and trip duration
- Save / export itinerary as downloadable Markdown

---

---

## Team 4 — Study Buddy & Quiz Generator

### What You're Building
An AI tutor that reads your uploaded study notes and textbook chapters, explains concepts on demand, generates quizzes, and tracks which questions you got wrong.

### Features to Build

| Feature | Session Skill |
|---------|--------------|
| Upload study notes as RAG knowledge base | Session 3 — `storeDocument()` |
| `generate_quiz` tool — returns N multiple-choice questions as JSON | Session 3 — `tool()` |
| `check_answer` tool — validates user answer and explains correct one | Session 3 — `tool()` |
| `summarise_topic` tool — returns a bullet-point summary of a topic | Session 3 — `tool()` |
| Difficulty setting: Beginner / Intermediate / Expert | Session 2 — `settingsSlice` |
| Render quiz questions as interactive Markdown with numbered options | Session 2 — `react-markdown` |
| Score tracker (number correct / total) in chat sidebar | Session 2 — Redux state |

### Files to Create / Edit
```
src/lib/ai/tools.ts       add: generateQuiz, checkAnswer, summariseTopic
src/lib/store/slices/settingsSlice.ts  add: difficulty, quizSize
src/lib/store/slices/quizSlice.ts      new — track score, wrong answers
src/components/chat/ScoreWidget.tsx    new — shows X/Y correct
src/app/api/chat/route.ts  inject difficulty into system prompt
```

### System Prompt Template
```
You are an expert study tutor.
Difficulty level: {{difficulty}}.
Always retrieve relevant notes before explaining a concept.
When generating quizzes, return structured JSON with this shape:
{ "questions": [{ "q": "...", "options": ["A)...","B)...","C)...","D)..."], "answer": "A" }] }
Explain WHY an answer is correct, not just what it is.
Adapt your language to the difficulty level:
- Beginner: simple analogies, no jargon
- Intermediate: standard terminology, brief background
- Expert: assume deep prior knowledge, skip fundamentals
```

### Sample Data — `machine-learning-notes.txt`
```
MACHINE LEARNING — STUDY NOTES

MODULE 1: WHAT IS MACHINE LEARNING?
Machine learning (ML) is a subset of artificial intelligence where systems learn 
patterns from data rather than being explicitly programmed.

Types of ML:
1. Supervised Learning — model learns from labelled data (input → output pairs).
   Examples: email spam detection, house price prediction, image classification.
2. Unsupervised Learning — model finds patterns in unlabelled data.
   Examples: customer segmentation, anomaly detection, topic modelling.
3. Reinforcement Learning — agent learns by receiving rewards/penalties for actions.
   Examples: game-playing AI (AlphaGo), robotic control, recommendation systems.

MODULE 2: KEY ALGORITHMS
Linear Regression
- Predicts a continuous output from one or more input features.
- Equation: y = mx + b (slope-intercept form).
- Loss function: Mean Squared Error (MSE) = (1/n) Σ(y_pred - y_actual)²
- Best for: predicting house prices, sales forecasting.

Logistic Regression
- Classifies inputs into two categories (binary classification).
- Uses sigmoid function: σ(x) = 1 / (1 + e^(-x)), output is a probability 0–1.
- Decision boundary: predict class 1 if σ(x) > 0.5.
- Best for: spam detection, disease diagnosis.

Decision Trees
- Tree-like structure where each node splits data based on a feature.
- Split criterion: Gini impurity or Information Gain (entropy).
- Pros: interpretable, handles non-linear relationships.
- Cons: prone to overfitting on training data.

Random Forests
- Ensemble of many decision trees, each trained on a random data subset.
- Final prediction = majority vote (classification) or average (regression).
- Reduces overfitting compared to a single tree.

Neural Networks
- Layers of interconnected nodes (neurons) with learned weights.
- Activation functions: ReLU (hidden layers), Softmax (output for multi-class).
- Training: backpropagation + gradient descent to minimise loss.
- Deep learning = neural networks with many hidden layers.

MODULE 3: OVERFITTING & UNDERFITTING
Overfitting: model memorises training data, performs poorly on new data.
Signs: high training accuracy, low test accuracy.
Solutions: more data, regularisation (L1/L2), dropout, early stopping.

Underfitting: model too simple to capture the pattern.
Signs: low training AND test accuracy.
Solutions: more features, more complex model, reduce regularisation.

Bias-Variance Tradeoff:
- High bias = underfitting (model too simple).
- High variance = overfitting (model too complex).
- Goal: find the sweet spot with low bias AND low variance.

MODULE 4: EVALUATION METRICS
Classification:
- Accuracy = correct predictions / total predictions
- Precision = TP / (TP + FP) — how many positives are actually positive
- Recall = TP / (TP + FN) — how many actual positives did we find
- F1 Score = 2 × (Precision × Recall) / (Precision + Recall)

Regression:
- MAE (Mean Absolute Error) — average absolute difference
- MSE (Mean Squared Error) — average squared difference (penalises large errors)
- R² (R-squared) — proportion of variance explained by the model (1.0 = perfect)

MODULE 5: TRAIN / VALIDATION / TEST SPLIT
- Training set (~70%): model learns from this.
- Validation set (~15%): tune hyperparameters, detect overfitting.
- Test set (~15%): final evaluation — never look at this until the very end.
Cross-validation: rotate which fold is the test set, average the results.
```

### Stretch Goals
- Wrong answers review: after a quiz, show only questions the user got wrong with explanations
- Flashcard mode: tool generates term/definition pairs from notes
- Export quiz as a PDF or shareable link

---

---

## Team 5 — Code Review Assistant

### What You're Building
An AI pair reviewer. Developers paste code into the chat or upload files. The assistant reviews for bugs, security issues, and style problems — using tools to check complexity and RAG to search your team's coding standards.

### Features to Build

| Feature | Session Skill |
|---------|--------------|
| Upload coding standards / style guide as RAG | Session 3 — `storeDocument()` |
| `analyse_complexity` tool — estimates cyclomatic complexity from code snippet | Session 3 — `tool()` |
| `detect_security_issues` tool — flags common patterns (hardcoded secrets, SQL injection etc.) | Session 3 — `tool()` |
| `suggest_tests` tool — generates a list of unit test cases for a function | Session 3 — `tool()` |
| Language selector: TypeScript / Python / Go / Java | Session 2 — `settingsSlice` |
| Review strictness: Lenient / Standard / Strict (affects system prompt) | Session 2 — `settingsSlice` |
| Render code diffs and suggestions in fenced code blocks | Session 2 — `rehype-highlight` |

### Files to Create / Edit
```
src/lib/ai/tools.ts       add: analyseComplexity, detectSecurityIssues, suggestTests
src/lib/store/slices/settingsSlice.ts  add: language, reviewStrictness
src/app/api/chat/route.ts  inject language + strictness into system prompt
```

### System Prompt Template
```
You are a senior software engineer performing a code review.
Language focus: {{language}}. Strictness: {{reviewStrictness}}.
Check the team's coding standards in the knowledge base before reviewing.
Structure every review as:
## Summary (1-2 sentences)
## Issues Found (severity: 🔴 Critical / 🟡 Warning / 🟢 Suggestion)
## Improved Code (full rewrite if needed, in a fenced code block)
## Test Cases to Add
Be constructive. Explain WHY something is a problem, not just WHAT.
```

### Sample Data — `typescript-coding-standards.txt`
```
TYPESCRIPT CODING STANDARDS — v2.1

NAMING CONVENTIONS
- Variables and functions: camelCase (getUserById, totalCount)
- Classes and interfaces: PascalCase (UserService, ApiResponse)
- Constants: SCREAMING_SNAKE_CASE (MAX_RETRY_COUNT, API_BASE_URL)
- Private class members: prefix with underscore (_userId)
- Boolean variables: prefix with is/has/can (isLoading, hasPermission, canDelete)
- Generic type parameters: single uppercase letter or descriptive (T, TEntity, TResponse)

FUNCTIONS
- Keep functions under 20 lines. Extract helpers if longer.
- Maximum 3 parameters. Use an options object for more.
  GOOD: createUser({ name, email, role }: CreateUserOptions)
  BAD: createUser(name: string, email: string, role: string, isAdmin: boolean)
- Always declare return types explicitly.
- Prefer const arrow functions for utilities; function declarations for named exports.
- Avoid deeply nested callbacks — use async/await.

ERROR HANDLING
- Never swallow errors silently (empty catch blocks are forbidden).
- Wrap external API calls in try/catch and return typed Result objects.
- Use custom error classes that extend Error for domain errors.
  Example: class NotFoundError extends Error { constructor(entity: string) { super(`${entity} not found`); } }
- Log errors with context: console.error('[ServiceName]', error, { userId, operation });

SECURITY RULES (CRITICAL — violation blocks PR)
1. Never hardcode secrets, API keys, or passwords in source code.
2. Never use eval() or new Function() with user input.
3. Always validate and sanitise user input at API boundaries using Zod or similar.
4. Use parameterised queries — never concatenate user input into SQL strings.
5. Set appropriate CORS headers — do not use wildcard (*) in production.
6. Never log sensitive data (passwords, tokens, PII) even at debug level.
7. Dependencies must be pinned to exact versions in package.json.

TYPESCRIPT SPECIFICS
- Enable strict mode in tsconfig.json (no exceptions).
- No use of `any` type — use `unknown` and narrow, or define a proper type.
- Prefer interfaces over type aliases for object shapes.
- Use readonly for arrays and objects that should not be mutated.
- Enums are discouraged — use string union types instead.
  GOOD: type Status = 'pending' | 'active' | 'cancelled'
  BAD: enum Status { Pending, Active, Cancelled }

IMPORTS
- Group imports: 1) React/Next.js, 2) third-party, 3) internal (@/), 4) relative.
- No barrel re-exports from index.ts in feature folders (causes circular deps).
- Use path aliases (@/) rather than relative paths more than 2 levels deep.

TESTING REQUIREMENTS
- All utility functions must have unit tests (Jest).
- API route handlers must have integration tests.
- Minimum coverage: 80% lines for new code.
- Test file naming: *.test.ts co-located with the file under test.
- Use descriptive test names: it('returns 404 when user does not exist')
```

### Stretch Goals
- Diff view: show before/after side-by-side using a diff library
- PR summary mode: paste a list of changed files, generate a PR description
- Security score badge rendered in the chat for each review

---

---

## Team 6 — Legal Document Analyzer

### What You're Building
An assistant that reads uploaded contracts and policy documents, answers questions about clauses, identifies risky terms, and compares two documents side-by-side.

### Features to Build

| Feature | Session Skill |
|---------|--------------|
| Upload contracts and policies as RAG | Session 3 — `storeDocument()`, `retrieveChunks()` |
| `extract_clauses` tool — returns named sections from a document | Session 3 — `tool()` |
| `flag_risky_terms` tool — scans for common red-flag phrases | Session 3 — `tool()` |
| `calculate_deadline` tool — takes an effective date + duration → returns deadline | Session 3 — `tool()` |
| Reading level selector: Layperson / Professional / Expert | Session 2 — `settingsSlice` |
| Document scope selector: which uploaded doc to focus on | Session 2 — `settingsSlice` |
| Render extracted clauses in a styled table (Markdown) | Session 2 — `react-markdown` |

### Files to Create / Edit
```
src/lib/ai/tools.ts       add: extractClauses, flagRiskyTerms, calculateDeadline
src/lib/store/slices/settingsSlice.ts  add: readingLevel, activeDocumentTitle
src/components/chat/DocumentSelector.tsx   new — pick which doc is in scope
src/app/api/chat/route.ts  inject readingLevel + docTitle into system prompt
```

### System Prompt Template
```
You are a legal document analyst. You are NOT a lawyer — always recommend 
professional legal advice for important decisions.
Reading level: {{readingLevel}}.
Active document: {{activeDocumentTitle}}.
Always retrieve relevant clauses before answering.
When explaining clauses:
- Layperson: use plain English, avoid jargon, use analogies.
- Professional: standard legal terminology, note jurisdiction implications.
- Expert: assume full legal knowledge, focus on edge cases and risks.
Flag any clause that could be disadvantageous with ⚠️.
Format clause extracts as a Markdown table: | Clause | Plain English | Risk Level |
```

### Sample Data — `saas-subscription-agreement.txt`
```
SAAS SUBSCRIPTION AGREEMENT
Last updated: 1 January 2026

1. DEFINITIONS
"Service" means the cloud-based software platform provided by Vendor at the URL 
specified in the Order Form.
"Customer Data" means all data submitted by Customer or its users through the Service.
"Effective Date" means the date on which Customer accepts these terms.
"Subscription Term" means the period specified in the Order Form, typically 12 months.

2. GRANT OF LICENSE
Subject to payment of all fees, Vendor grants Customer a limited, non-exclusive, 
non-transferable, non-sublicensable license to access and use the Service during 
the Subscription Term solely for Customer's internal business purposes.

3. PAYMENT TERMS
3.1 Customer shall pay all fees specified in the Order Form within 30 days of invoice date.
3.2 All fees are non-refundable except as expressly stated herein.
3.3 Vendor reserves the right to suspend Service access for accounts 15 or more days 
overdue without notice.
3.4 Fees are subject to increase by up to 10% annually with 30 days written notice.

4. DATA AND PRIVACY
4.1 Customer retains all ownership of Customer Data.
4.2 Vendor may use aggregated, anonymised Customer Data for product improvement and 
benchmark reporting.
4.3 Customer Data will be deleted within 90 days of contract termination.
4.4 Vendor shall maintain industry-standard security measures but does not guarantee 
any specific security outcome.

5. INTELLECTUAL PROPERTY
5.1 Vendor retains all rights to the Service, including all modifications and 
improvements, even if suggested by Customer.
5.2 Customer grants Vendor a perpetual, irrevocable, royalty-free license to use 
Customer's name and logo in marketing materials.

6. LIMITATION OF LIABILITY
6.1 IN NO EVENT SHALL VENDOR BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, 
CONSEQUENTIAL OR PUNITIVE DAMAGES.
6.2 VENDOR'S TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID BY CUSTOMER IN THE 
12 MONTHS PRECEDING THE CLAIM.
6.3 These limitations apply regardless of whether Vendor has been advised of the 
possibility of such damages.

7. TERMINATION
7.1 Either party may terminate with 30 days written notice.
7.2 Vendor may terminate immediately for material breach, which includes non-payment.
7.3 Upon termination, Customer's license to use the Service ends immediately.
7.4 Sections 5, 6, and 8 survive termination indefinitely.

8. GOVERNING LAW AND DISPUTES
8.1 This Agreement is governed by the laws of the State of Delaware, USA.
8.2 All disputes shall be resolved by binding arbitration in Wilmington, Delaware.
8.3 Customer waives the right to participate in class action lawsuits.
8.4 The prevailing party shall be entitled to recover reasonable attorneys' fees.

9. AUTO-RENEWAL
9.1 Subscriptions automatically renew for successive 12-month terms unless Customer 
provides written notice of non-renewal at least 60 days prior to the end of the 
then-current Subscription Term.
9.2 Failure to provide timely notice results in automatic commitment to the next 
12-month term at the then-current pricing.

10. MISCELLANEOUS
10.1 This Agreement constitutes the entire agreement between the parties.
10.2 Vendor may update these terms with 30 days notice; continued use constitutes acceptance.
10.3 If any provision is found unenforceable, the remaining provisions remain in effect.
```

### Stretch Goals
- Side-by-side comparison: upload two contracts and diff the key clauses
- Risk score: overall red/amber/green rating for the whole document
- Clause bookmark: let users star important clauses and export as a summary report

---

---

## Appendix — Shared Setup for All Teams

### Install Extra Dependencies
```bash
# All teams need these from Session 3
pnpm add @xenova/transformers js-tiktoken

# Teams using Markdown tables (all)
pnpm add react-markdown remark-gfm rehype-highlight
pnpm add @tailwindcss/typography

# Teams adding new Redux slices
# Already included via @reduxjs/toolkit
```

### Recommended Demo Script (5 min per team)
1. **Show the upload flow** — drag a `.txt` file, confirm chunking message
2. **Ask a question only answerable from the doc** — demonstrate RAG working
3. **Trigger a tool call** — ask something that requires the tool (weather, ticket, quiz)
4. **Change a setting** — show it affects the next response (tone, difficulty, etc.)
5. **Break something on purpose** — disable RAG, ask the same question — model doesn't know

### Judging Criteria (if running a demo competition)

| Criterion | Weight |
|-----------|--------|
| Working RAG — answers grounded in uploaded docs | 30% |
| Custom tools — at least 2, clearly triggered in chat | 25% |
| UX quality — settings panel, clean chat rendering | 20% |
| Code quality — typed, no `any`, clean components | 15% |
| Stretch goals completed | 10% |
