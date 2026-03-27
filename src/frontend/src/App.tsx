import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BarChart2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Decision,
  EducationLevel,
  EmploymentStatus,
  type PredictionResult,
} from "./backend";
import { HistoryTab } from "./components/HistoryTab";
import { PredictionDashboard } from "./components/PredictionDashboard";
import { usePredictionHistory, useSubmitApplication } from "./hooks/useQueries";

const queryClient = new QueryClient();

interface FormState {
  name: string;
  age: string;
  annualIncome: string;
  loanAmount: string;
  loanTermMonths: string;
  creditScore: string;
  monthlyDebt: string;
  numDependents: string;
  employmentStatus: string;
  educationLevel: string;
}

const initialForm: FormState = {
  name: "",
  age: "",
  annualIncome: "",
  loanAmount: "",
  loanTermMonths: "",
  creditScore: "",
  monthlyDebt: "",
  numDependents: "",
  employmentStatus: "",
  educationLevel: "",
};

function AppContent() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    annualIncome: number;
    monthlyDebt: number;
    creditScore: number;
    loanAmount: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("predict");
  const { mutate: submitApplication, isPending } = useSubmitApplication();

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): string | null => {
    for (const [k, v] of Object.entries(form)) {
      if (!v.trim()) return `Please fill in all fields (missing: ${k})`;
    }
    const age = Number.parseInt(form.age);
    if (Number.isNaN(age) || age < 18) return "Age must be 18 or older.";
    const cs = Number.parseInt(form.creditScore);
    if (Number.isNaN(cs) || cs < 300 || cs > 850)
      return "Credit score must be between 300 and 850.";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error("Validation Error", { description: err });
      return;
    }

    const annualIncome = Number.parseFloat(form.annualIncome);
    const monthlyDebt = Number.parseFloat(form.monthlyDebt);
    const creditScore = Number.parseInt(form.creditScore);
    const loanAmount = Number.parseFloat(form.loanAmount);

    const empMap: Record<string, EmploymentStatus> = {
      employed: EmploymentStatus.employed,
      selfEmployed: EmploymentStatus.selfEmployed,
      unemployed: EmploymentStatus.unemployed,
    };
    const eduMap: Record<string, EducationLevel> = {
      highSchool: EducationLevel.highSchool,
      bachelor: EducationLevel.bachelor,
      master: EducationLevel.master,
      doctorate: EducationLevel.doctorate,
    };

    submitApplication(
      {
        name: form.name,
        age: BigInt(Number.parseInt(form.age)),
        annualIncome,
        employmentStatus:
          empMap[form.employmentStatus] ?? EmploymentStatus.employed,
        loanAmount,
        loanTermMonths: BigInt(Number.parseInt(form.loanTermMonths)),
        creditScore: BigInt(creditScore),
        monthlyDebt,
        educationLevel: eduMap[form.educationLevel] ?? EducationLevel.bachelor,
        numDependents: BigInt(Number.parseInt(form.numDependents)),
      },
      {
        onSuccess: (data) => {
          setResult(data);
          setSubmittedData({
            annualIncome,
            monthlyDebt,
            creditScore,
            loanAmount,
          });
          const label =
            data.decision === Decision.approved
              ? "Approved ✓"
              : data.decision === Decision.denied
                ? "Denied ✗"
                : "Under Review";
          toast.success(`Prediction complete: ${label}`, {
            description: `Approval likelihood: ${Math.round(data.approvalLikelihood)}%`,
          });
        },
        onError: () => {
          toast.error("Submission failed", {
            description: "Please check your inputs and try again.",
          });
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Fixed dark navy header ── */}
      <header className="nav-bg sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-base tracking-tight">
              LoanPredict AI
            </span>
          </div>

          {/* Nav links */}
          <nav
            className="hidden md:flex items-center gap-1 flex-1"
            aria-label="Main navigation"
          >
            {[
              "Dashboard",
              "New Application",
              "My Applications",
              "Profile",
              "Support",
              "Settings",
            ].map((item, i) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  if (item === "My Applications") setActiveTab("history");
                  if (item === "New Application" || item === "Dashboard")
                    setActiveTab("predict");
                }}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  i === 0
                    ? "text-white font-semibold bg-white/15"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                data-ocid={`nav.${item.toLowerCase().replace(/ /g, "_")}.link`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Sign Out */}
          <button
            type="button"
            className="ml-auto text-sm text-white/70 hover:text-white transition-colors hidden md:block"
            data-ocid="nav.sign_out.link"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Dashboard: Application #LP-{new Date().getFullYear()}-
              {String(new Date().getMonth() + 1).padStart(2, "0")}-
              {String(new Date().getDate()).padStart(2, "0")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Submit applicant details to receive an instant AI-driven loan
              approval prediction.
            </p>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-white border border-border shadow-card h-10">
              <TabsTrigger
                value="predict"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm font-medium"
                data-ocid="tab.predict.tab"
              >
                Predict
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm font-medium"
                data-ocid="tab.history.tab"
              >
                History
              </TabsTrigger>
            </TabsList>

            {/* ── Predict Tab ── */}
            <TabsContent value="predict" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
                {/* LEFT: Applicant Details form */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      <h2 className="text-base font-semibold text-foreground">
                        Applicant Details
                      </h2>
                    </div>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="p-5 flex flex-col gap-3"
                    data-ocid="application.form"
                  >
                    {(
                      [
                        {
                          id: "name",
                          label: "Full Name",
                          type: "text",
                          placeholder: "e.g. Alexandra Carter",
                        },
                        {
                          id: "age",
                          label: "Age",
                          type: "number",
                          placeholder: "e.g. 35",
                        },
                        {
                          id: "annualIncome",
                          label: "Annual Income (USD)",
                          type: "number",
                          placeholder: "e.g. 75000",
                        },
                        {
                          id: "loanAmount",
                          label: "Loan Amount (USD)",
                          type: "number",
                          placeholder: "e.g. 25000",
                        },
                        {
                          id: "creditScore",
                          label: "Credit Score (300–850)",
                          type: "number",
                          placeholder: "e.g. 720",
                        },
                        {
                          id: "monthlyDebt",
                          label: "Monthly Debt (USD)",
                          type: "number",
                          placeholder: "e.g. 500",
                        },
                        {
                          id: "numDependents",
                          label: "Number of Dependents",
                          type: "number",
                          placeholder: "e.g. 2",
                        },
                      ] as {
                        id: keyof FormState;
                        label: string;
                        type: string;
                        placeholder: string;
                      }[]
                    ).map((f) => (
                      <div key={f.id} className="flex flex-col gap-1">
                        <Label
                          htmlFor={f.id}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          {f.label}
                        </Label>
                        <Input
                          id={f.id}
                          type={f.type}
                          placeholder={f.placeholder}
                          value={form[f.id]}
                          onChange={(e) => setField(f.id, e.target.value)}
                          className="h-9 text-sm bg-muted/30 focus:ring-2 focus:ring-primary/30"
                          required
                          data-ocid={`form.${f.id.toLowerCase()}.input`}
                        />
                      </div>
                    ))}

                    {/* Loan Term */}
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Term (Months)
                      </Label>
                      <Select
                        value={form.loanTermMonths}
                        onValueChange={(v) => setField("loanTermMonths", v)}
                        required
                      >
                        <SelectTrigger
                          className="h-9 text-sm bg-muted/30"
                          data-ocid="form.loanTermMonths.select"
                        >
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          {[12, 24, 36, 48, 60, 72, 84].map((m) => (
                            <SelectItem key={m} value={String(m)}>
                              {m} months
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Employment Status */}
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Employment Status
                      </Label>
                      <Select
                        value={form.employmentStatus}
                        onValueChange={(v) => setField("employmentStatus", v)}
                        required
                      >
                        <SelectTrigger
                          className="h-9 text-sm bg-muted/30"
                          data-ocid="form.employmentstatus.select"
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employed">Employed</SelectItem>
                          <SelectItem value="selfEmployed">
                            Self-Employed
                          </SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Education Level */}
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Education Level
                      </Label>
                      <Select
                        value={form.educationLevel}
                        onValueChange={(v) => setField("educationLevel", v)}
                        required
                      >
                        <SelectTrigger
                          className="h-9 text-sm bg-muted/30"
                          data-ocid="form.educationlevel.select"
                        >
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="highSchool">
                            High School
                          </SelectItem>
                          <SelectItem value="bachelor">Bachelor's</SelectItem>
                          <SelectItem value="master">Master's</SelectItem>
                          <SelectItem value="doctorate">Doctorate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      disabled={isPending}
                      className="mt-2 h-10 w-full btn-primary rounded-lg font-semibold text-sm"
                      data-ocid="application.submit_button"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Generate Prediction"
                      )}
                    </Button>

                    {isPending && (
                      <p
                        className="text-center text-xs text-muted-foreground"
                        data-ocid="application.loading_state"
                      >
                        Our model is evaluating your profile…
                      </p>
                    )}
                  </form>
                </motion.div>

                {/* RIGHT: Prediction Dashboard */}
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h2 className="text-base font-semibold text-foreground">
                      Prediction Dashboard
                    </h2>
                  </div>

                  {isPending ? (
                    <div
                      className="flex flex-col gap-4"
                      data-ocid="dashboard.loading_state"
                    >
                      <Skeleton className="h-36 w-full rounded-xl" />
                      <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-24 rounded-xl" />
                        <Skeleton className="h-24 rounded-xl" />
                        <Skeleton className="h-24 rounded-xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-52 rounded-xl" />
                        <Skeleton className="h-52 rounded-xl" />
                      </div>
                    </div>
                  ) : (
                    <PredictionDashboard
                      result={result}
                      submittedData={submittedData}
                    />
                  )}
                </motion.div>
              </div>
            </TabsContent>

            {/* ── History Tab ── */}
            <TabsContent value="history" className="mt-0">
              <HistoryTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              LoanPredict AI
            </span>
          </div>
          <nav className="flex gap-4 text-xs text-muted-foreground">
            <button
              type="button"
              className="hover:text-foreground transition-colors"
            >
              Contact Support
            </button>
            <button
              type="button"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </button>
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Built with love using caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <Toaster richColors />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
