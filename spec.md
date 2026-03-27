# LoanApproval AI

## Current State
Empty workspace — new project.

## Requested Changes (Diff)

### Add
- Full-stack loan approval prediction app
- Applicant details form with 10+ fields (name, age, income, loan amount, term, credit score, employment, existing debt, etc.)
- Rule-based classification model in the backend scoring credit score, debt-to-income ratio, employment status, loan-to-income ratio
- Prediction result: Approved / Under Review / Denied with confidence score
- Dashboard: approval status badge, key financial factor cards (credit score, DTI ratio, income-to-loan ratio), bar chart of application distribution, line chart of credit score vs approval probability
- Prediction history: store and list past submissions

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend (Motoko): store applicant records, classification logic, expose submitApplication and getHistory endpoints
2. Frontend: applicant form, prediction dashboard with status badge, 3 KPI cards, 2 charts (recharts), history tab
