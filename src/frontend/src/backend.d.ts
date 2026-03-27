import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface PredictionResult {
    keyFactors: Array<KeyFactor>;
    decision: Decision;
    approvalLikelihood: number;
}
export interface LoanApplication {
    age: bigint;
    loanTermMonths: bigint;
    loanAmount: number;
    name: string;
    annualIncome: number;
    numDependents: bigint;
    creditScore: bigint;
    monthlyDebt: number;
    employmentStatus: EmploymentStatus;
    educationLevel: EducationLevel;
}
export interface KeyFactor {
    impactScore: number;
    factorName: string;
}
export interface PredictionRecord {
    result: PredictionResult;
    applicant: Principal;
    application: LoanApplication;
    timestamp: Time;
}
export enum Decision {
    underReview = "underReview",
    denied = "denied",
    approved = "approved"
}
export enum EducationLevel {
    highSchool = "highSchool",
    bachelor = "bachelor",
    master = "master",
    doctorate = "doctorate"
}
export enum EmploymentStatus {
    unemployed = "unemployed",
    employed = "employed",
    selfEmployed = "selfEmployed"
}
export interface backendInterface {
    getPredictionHistory(): Promise<Array<PredictionRecord>>;
    submitApplication(application: LoanApplication): Promise<PredictionResult>;
}
