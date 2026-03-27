# LoanApproval AI

## Current State
New project — no existing application.

## Requested Changes (Diff)

### Add
- Loan application form with applicant personal and financial details
- Rule-based classification model (Motoko backend) that predicts loan approval likelihood
- Prediction result dashboard with gauge, factor impact chart, and debt-to-income donut chart
- Prediction history storage per session

### Modify
- N/A

### Remove
- N/A

## Implementation Plan

### Backend (Motoko)
- `submitApplication(applicant: ApplicantData) : async PredictionResult`
  - Fields: name, age, income, employmentStatus, loanAmount, loanTerm, creditScore, existingDebt, maritalStatus, dependents, education
  - Rule-based scoring: creditScore weight 35%, debt-to-income ratio 30%, employment status 20%, loan amount vs income 15%
  - Returns: approvalLikelihood (0-100), decision (Approved/Review/Denied), factors (array of impacting fields with scores)
- `getPredictionHistory() : async [PredictionRecord]`
  - Store last 10 predictions in stable memory

### Frontend
- Navbar with brand name, nav links, user avatar placeholder
- Hero banner with gradient (navy to teal-green)
- Two-column main panel:
  - Left: applicant info form (name, age, employment, income, credit score, loan amount, loan term, existing debt, education, dependents)
  - Right: prediction dashboard (gauge card, key factor impact bar chart, debt-to-income donut chart)
- Submit triggers backend call and updates right panel
- Responsive layout
