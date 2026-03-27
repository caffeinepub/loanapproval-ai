import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Float "mo:core/Float";

actor {
  type EmploymentStatus = { #employed; #selfEmployed; #unemployed };
  type Decision = { #approved; #underReview; #denied };
  type EducationLevel = { #highSchool; #bachelor; #master; #doctorate };

  type LoanApplication = {
    name : Text;
    age : Nat;
    annualIncome : Float;
    employmentStatus : EmploymentStatus;
    loanAmount : Float;
    loanTermMonths : Nat;
    creditScore : Nat;
    monthlyDebt : Float;
    educationLevel : EducationLevel;
    numDependents : Nat;
  };

  type KeyFactor = {
    factorName : Text;
    impactScore : Float;
  };

  module KeyFactor {
    public func compare(f1 : KeyFactor, f2 : KeyFactor) : Order.Order {
      switch (Text.compare(f1.factorName, f2.factorName)) {
        case (#equal) { Float.compare(f1.impactScore, f2.impactScore) };
        case (order) { order };
      };
    };
  };

  type PredictionResult = {
    approvalLikelihood : Float;
    decision : Decision;
    keyFactors : [KeyFactor];
  };

  type PredictionRecord = {
    applicant : Principal;
    application : LoanApplication;
    result : PredictionResult;
    timestamp : Time.Time;
  };

  module PredictionRecord {
    public func compare(record1 : PredictionRecord, record2 : PredictionRecord) : Order.Order {
      Int.compare(record1.timestamp, record2.timestamp);
    };
  };

  func computeScore(app : LoanApplication) : Float {
    let creditScoreNormalized = app.creditScore.toFloat() / 850.0;
    let monthlyIncome = app.annualIncome / 12.0;
    let debtToIncome = if (monthlyIncome == 0.0) { 1.0 } else {
      let ratio = app.monthlyDebt / monthlyIncome;
      if (ratio > 1.0) { 1.0 } else { ratio };
    };

    let employmentScore = switch (app.employmentStatus) {
      case (#employed) { 1.0 };
      case (#selfEmployed) { 0.8 };
      case (#unemployed) { 0.4 };
    };

    let loanToIncome = if (app.annualIncome == 0.0) { 1.0 } else {
      let ratio = app.loanAmount / app.annualIncome;
      if (ratio > 1.0) { 1.0 } else { ratio };
    };

    let score = (creditScoreNormalized * 0.35 + (1.0 - debtToIncome) * 0.3 + employmentScore * 0.2 + (1.0 - loanToIncome) * 0.15) * 100.0;
    if (score > 100.0) { 100.0 } else if (score < 0.0) { 0.0 } else { score };
  };

  func getDecision(score : Float) : Decision {
    if (score >= 70.0) { #approved } else if (score >= 40.0) {
      #underReview;
    } else { #denied };
  };

  func computeKeyFactors(app : LoanApplication) : [KeyFactor] {
    let factors = List.empty<KeyFactor>();

    factors.add({
      factorName = "Credit Score";
      impactScore = (app.creditScore.toFloat() / 850.0) * 0.35;
    });

    let monthlyIncome = app.annualIncome / 12.0;
    let debtToIncome = if (monthlyIncome == 0.0) { 1.0 } else {
      let ratio = app.monthlyDebt / monthlyIncome;
      if (ratio > 1.0) { 1.0 } else { ratio };
    };
    factors.add({
      factorName = "Debt-to-Income Ratio";
      impactScore = Float.abs((1.0 - debtToIncome) * 0.3);
    });

    let employmentScore = switch (app.employmentStatus) {
      case (#employed) { 1.0 };
      case (#selfEmployed) { 0.8 };
      case (#unemployed) { 0.4 };
    };
    factors.add({
      factorName = "Employment Status";
      impactScore = employmentScore * 0.2;
    });

    let loanToIncome = if (app.annualIncome == 0.0) { 1.0 } else {
      let ratio = app.loanAmount / app.annualIncome;
      if (ratio > 1.0) { 1.0 } else { ratio };
    };
    factors.add({
      factorName = "Loan-to-Income Ratio";
      impactScore = Float.abs((1.0 - loanToIncome) * 0.15);
    });

    factors.toArray().sort();
  };

  let predictionHistory = List.empty<PredictionRecord>();

  public shared ({ caller }) func submitApplication(application : LoanApplication) : async PredictionResult {
    let score = computeScore(application);
    let decision = getDecision(score);
    let keyFactors = computeKeyFactors(application);

    let prediction = {
      approvalLikelihood = score;
      decision;
      keyFactors;
    };

    let record : PredictionRecord = {
      applicant = caller;
      application;
      result = prediction;
      timestamp = Time.now();
    };

    predictionHistory.add(record);

    if (predictionHistory.size() > 20) {
      ignore predictionHistory.removeLast();
    };

    prediction;
  };

  public query ({ caller }) func getPredictionHistory() : async [PredictionRecord] {
    predictionHistory.toArray().sort();
  };
};
