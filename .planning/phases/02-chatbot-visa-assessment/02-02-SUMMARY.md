---
phase: 02-chatbot-visa-assessment
plan: 02-02
subsystem: eligibility
tags:
  - rules-engine
  - eligibility
  - hybrid-assessment
  - seed-data
  - deterministic
requires: []
provides:
  - backend/app/rules_engine.py — deterministic check functions
  - backend/app/models.py — VisaTable eligibility columns
  - backend/app/eligibility.py — hybrid assessment pipeline
  - backend/seed_visa_data.py — 18 visa types across 6 countries
affects: []
tech-stack:
  added:
    - pydantic BaseModel with Field constraints
    - ChatGroq.with_structured_output (EligibilityAssessment)
  patterns:
    - async seed function following seed_db.py pattern
    - Module-level pure functions with Dict[str, Any] return type
    - Hybrid decision pipeline: deterministic → LLM → fallback
decisions: []
key-files:
  created:
    - backend/app/rules_engine.py
    - backend/app/eligibility.py
    - backend/seed_visa_data.py
  modified:
    - backend/app/models.py
metrics:
  duration: ~41 minutes
  completed_date: 2026-05-14
  tasks_completed: 3
  commits: 3
---

# Phase 02 Plan 02: Eligibility Rules Engine + Seed Data

**One-liner:** Deterministic eligibility rules engine with hand-rolled check functions (age, funds, purpose, passport), hybrid assessment pipeline (deterministic → LLM structured output → fallback), VisaTable extended with 9 eligibility columns, and 18 synthetic visa records seeded across 6 countries.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rules engine + models extension | `fefce7d` | `backend/app/rules_engine.py` (CREATE), `backend/app/models.py` (MODIFY) |
| 2 | Seed visa data for 6 countries | `fb4570c` | `backend/seed_visa_data.py` (CREATE) |
| 3 | Hybrid eligibility assessment | `6912df2` | `backend/app/eligibility.py` (CREATE) |

## Files Created/Modified

### Created
- **`backend/app/rules_engine.py`** (144 lines) — Module-level pure functions for deterministic eligibility checks:
  - `check_age()` — validates min/max age requirements
  - `check_funds()` — validates minimum bank balance with formatted feedback
  - `check_purpose()` — case-insensitive purpose matching
  - `check_passport()` — passport number presence check
  - `evaluate_all()` — runs all four checks, computes aggregates (all_passed, passed_count, failed_count, score)
  - `get_actionable_feedback()` — collects detail strings from failed rules

- **`backend/seed_visa_data.py`** (591 lines) — Seeds 18 visa records across 6 countries (US, UK, Canada, Australia, France/Schengen, Japan), each with 3 visa types. Uses index constants for alternative_visa_ids cross-references. Calls `index_from_db()` after seeding to rebuild FAISS.

- **`backend/app/eligibility.py`** (155 lines) — Hybrid assessment pipeline:
  - `EligibilityAssessment` Pydantic model with structured output schema
  - `assess_eligibility()` — Step 1: deterministic rules; Step 2: LLM structured output via ChatGroq if rules pass; Step 3: deterministic fallback on LLM failure

### Modified
- **`backend/app/models.py`** — Added 9 columns to VisaTable: min_age, max_age, min_balance, allowed_purposes, eligibility_rules, description, validity, max_stay_days, fee, alternative_visa_ids. Added set_/get_ accessors for JSON-serialized fields. Updated VisaDB/VisaRequirement Pydantic schemas.

## Success Criteria Verification

| Criteria | Status |
|----------|--------|
| `python backend/seed_visa_data.py` seeds 18+ records | ✅ 18 records across 6 countries |
| FAISS index rebuilt after seeding | ✅ "FAISS index rebuilt successfully" |
| `evaluate_all()` returns all passed for valid data | ✅ |
| `evaluate_all()` returns age failed for age=17 | ✅ actionable message "Minimum age is 18 (provided: 17)" |
| `assess_eligibility()` loads without import errors | ✅ |
| VisaTable has all 9 new columns with working accessors | ✅ |

## Threat Model Compliance

| Threat ID | Status | Notes |
|-----------|--------|-------|
| T-02-02-01 (Tampering — LLM output) | ✅ Mitigated | Structured output enforced by Pydantic schema; fallback on mismatch |
| T-02-02-02 (Info disclosure — Groq API) | ✅ Mitigated | Passport check is purely deterministic; non-PII only sent to LLM |
| T-02-02-03 (Tampering — rule results) | ✅ Mitigated | Deterministic comparison operators only; no eval/exec |
| T-02-02-04 (Info disclosure — seed data) | ✅ Accepted | Synthetic/fictional data only |
| T-02-02-05 (DOS — LLM retries) | ✅ Mitigated | Single LLM attempt; fallback on any exception |
| T-02-02-06 (Info disclosure — VisaTable) | ✅ Accepted | Visa requirements are public/non-sensitive |

## Key Design Patterns Followed

1. **D-04** (hand-rolled Python functions, no rule-engine library) — all checks are explicit Python comparisons
2. **D-06** (hybrid eligibility: deterministic first, LLM for nuanced) — LLM only invoked after all hard rules pass
3. **D-20** (actionable feedback with actual vs required values) — check_funds returns formatted "$10,000 vs $5,000"
4. **T-02-02-02** (passport not sent to LLM) — passport check is purely deterministic in evaluate_all
5. **seed_db.py async seeding pattern** — async function, await init_db(), session.execute(delete(...)), commit, index_from_db()

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None found.

## Self-Check: PASSED

- [x] `backend/app/rules_engine.py` exists and passes all check function assertions
- [x] `backend/app/eligibility.py` exists and imports successfully
- [x] `backend/seed_visa_data.py` exists and seeded 18 records
- [x] VisaTable extensions verify with `set_allowed_purposes()/get_allowed_purposes()` round-trip
- [x] All 3 commits verified in git log
