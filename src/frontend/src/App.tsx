import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BarChart2,
  Briefcase,
  Calendar,
  CreditCard,
  DollarSign,
  GraduationCap,
  Loader2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Decision,
  EducationLevel,
  EmploymentStatus,
  type PredictionResult,
} from "./backend";
import { PredictionDashboard } from "./components/PredictionDashboard";
import { useSubmitApplication } from "./hooks/useQueries";

const queryClient = new QueryClient();

interface FormState {
  name: string;
  age: string;
  employmentStatus: string;
  annualIncome: string;
  creditScore: string;
  loanAmount: string;
  loanTermMonths: string;
  monthlyDebt: string;
  educationLevel: string;
  numDependents: string;
}

const initialForm: FormState = {
  name: "",
  age: "",
  employmentStatus: "",
  annualIncome: "",
  creditScore: "",
  loanAmount: "",
  loanTermMonths: "",
  monthlyDebt: "",
  educationLevel: "",
  numDependents: "",
};

function AppContent() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState({
    annualIncome: 0,
    monthlyDebt: 0,
  });
  const { mutate: submitApplication, isPending } = useSubmitApplication();

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const annualIncome = Number.parseFloat(form.annualIncome) || 0;
    const monthlyDebt = Number.parseFloat(form.monthlyDebt) || 0;

    const empMap: Record<string, EmploymentStatus> = {
      employed: EmploymentStatus.employed,
      partTime: EmploymentStatus.employed,
      selfEmployed: EmploymentStatus.selfEmployed,
      unemployed: EmploymentStatus.unemployed,
      retired: EmploymentStatus.unemployed,
    };

    const eduMap: Record<string, EducationLevel> = {
      highSchool: EducationLevel.highSchool,
      bachelor: EducationLevel.bachelor,
      master: EducationLevel.master,
      doctorate: EducationLevel.doctorate,
      other: EducationLevel.highSchool,
    };

    submitApplication(
      {
        name: form.name,
        age: BigInt(Number.parseInt(form.age) || 0),
        employmentStatus:
          empMap[form.employmentStatus] ?? EmploymentStatus.employed,
        annualIncome,
        creditScore: BigInt(Number.parseInt(form.creditScore) || 650),
        loanAmount: Number.parseFloat(form.loanAmount) || 0,
        loanTermMonths: BigInt(Number.parseInt(form.loanTermMonths) || 36),
        monthlyDebt,
        educationLevel: eduMap[form.educationLevel] ?? EducationLevel.bachelor,
        numDependents: BigInt(Number.parseInt(form.numDependents) || 0),
      },
      {
        onSuccess: (data) => {
          setResult(data);
          setLastSubmitted({ annualIncome, monthlyDebt });
          const decisionLabel =
            data.decision === Decision.approved
              ? "Approved ✓"
              : data.decision === Decision.denied
                ? "Denied ✗"
                : "Under Review";
          toast.success(`Prediction complete: ${decisionLabel}`, {
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

  const formFields = [
    {
      id: "name",
      label: "Full Name",
      icon: <User className="w-4 h-4" />,
      type: "text",
      placeholder: "e.g. Alexandra Carter",
      ocid: "form.name.input",
    },
    {
      id: "age",
      label: "Age",
      icon: <Calendar className="w-4 h-4" />,
      type: "number",
      placeholder: "18 – 80",
      ocid: "form.age.input",
    },
    {
      id: "annualIncome",
      label: "Annual Income ($)",
      icon: <DollarSign className="w-4 h-4" />,
      type: "number",
      placeholder: "e.g. 75000",
      ocid: "form.annual_income.input",
    },
    {
      id: "creditScore",
      label: "Credit Score (300–850)",
      icon: <CreditCard className="w-4 h-4" />,
      type: "number",
      placeholder: "e.g. 720",
      ocid: "form.credit_score.input",
    },
    {
      id: "loanAmount",
      label: "Loan Amount Requested ($)",
      icon: <DollarSign className="w-4 h-4" />,
      type: "number",
      placeholder: "e.g. 25000",
      ocid: "form.loan_amount.input",
    },
    {
      id: "monthlyDebt",
      label: "Existing Monthly Debt ($)",
      icon: <TrendingUp className="w-4 h-4" />,
      type: "number",
      placeholder: "e.g. 500",
      ocid: "form.monthly_debt.input",
    },
    {
      id: "numDependents",
      label: "Number of Dependents",
      icon: <Users className="w-4 h-4" />,
      type: "number",
      placeholder: "0 – 10",
      ocid: "form.dependents.input",
    },
  ];

  const navLinks = ["Dashboard", "New Prediction", "Resources", "Support"];
  const footerLinks = ["Dashboard", "Resources", "Support", "Privacy"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">
              LoanApproval AI
            </span>
          </div>

          <nav
            className="hidden md:flex items-center gap-6 text-sm font-medium"
            aria-label="Main navigation"
          >
            {navLinks.map((item) => (
              <button
                key={item}
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-ocid={`nav.${item.toLowerCase().replace(" ", "_")}.link`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs btn-gradient text-white font-semibold">
                AC
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              className="btn-gradient text-white border-0 hover:opacity-90 hidden sm:flex"
              data-ocid="nav.apply_now.primary_button"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-gradient py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold bg-white/15 text-white/90 mb-4 border border-white/20">
            AI-Powered Financial Analysis
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Loan Approval Prediction
          </h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            Submit your financial profile and receive an instant AI-driven
            prediction on your loan approval likelihood.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-card-lg border border-border overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: Form */}
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-full btn-gradient flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Applicant Information
                  </h2>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                  data-ocid="application.form"
                >
                  {formFields.map((field) => (
                    <div key={field.id} className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={field.id}
                        className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                      >
                        {field.label}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {field.icon}
                        </span>
                        <Input
                          id={field.id}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={form[field.id as keyof FormState]}
                          onChange={(e) =>
                            setField(
                              field.id as keyof FormState,
                              e.target.value,
                            )
                          }
                          className="pl-10 h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/30"
                          required
                          data-ocid={field.ocid}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Employment Status */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Employment Status
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                        <Briefcase className="w-4 h-4" />
                      </span>
                      <Select
                        value={form.employmentStatus}
                        onValueChange={(v) => setField("employmentStatus", v)}
                        required
                      >
                        <SelectTrigger
                          className="pl-10 h-11 bg-muted/30"
                          data-ocid="form.employment.select"
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employed">
                            Employed Full-time
                          </SelectItem>
                          <SelectItem value="partTime">
                            Employed Part-time
                          </SelectItem>
                          <SelectItem value="selfEmployed">
                            Self-Employed
                          </SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Loan Term
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                        <Calendar className="w-4 h-4" />
                      </span>
                      <Select
                        value={form.loanTermMonths}
                        onValueChange={(v) => setField("loanTermMonths", v)}
                        required
                      >
                        <SelectTrigger
                          className="pl-10 h-11 bg-muted/30"
                          data-ocid="form.loan_term.select"
                        >
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          {[12, 24, 36, 48, 60].map((m) => (
                            <SelectItem key={m} value={String(m)}>
                              {m} months
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Education Level */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Education Level
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                        <GraduationCap className="w-4 h-4" />
                      </span>
                      <Select
                        value={form.educationLevel}
                        onValueChange={(v) => setField("educationLevel", v)}
                        required
                      >
                        <SelectTrigger
                          className="pl-10 h-11 bg-muted/30"
                          data-ocid="form.education.select"
                        >
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="highSchool">
                            High School
                          </SelectItem>
                          <SelectItem value="bachelor">Bachelor's</SelectItem>
                          <SelectItem value="master">Master's</SelectItem>
                          <SelectItem value="doctorate">PhD</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="mt-2 h-12 w-full btn-gradient text-white border-0 hover:opacity-90 text-base font-semibold rounded-xl"
                    data-ocid="application.submit_button"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing Application...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>

                  {isPending && (
                    <p
                      className="text-center text-xs text-muted-foreground animate-pulse"
                      data-ocid="application.loading_state"
                    >
                      Our AI is evaluating your financial profile…
                    </p>
                  )}
                </form>
              </div>

              {/* Vertical Divider */}
              <Separator
                orientation="vertical"
                className="hidden lg:block absolute left-1/2 h-full"
              />

              {/* Right: Dashboard */}
              <div className="p-6 sm:p-8 bg-muted/20 border-t lg:border-t-0 lg:border-l border-border">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-full btn-gradient flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Prediction &amp; Dashboard
                  </h2>
                </div>
                <PredictionDashboard
                  result={result}
                  annualIncome={lastSubmitted.annualIncome}
                  monthlyDebt={lastSubmitted.monthlyDebt}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg btn-gradient flex items-center justify-center">
                <BarChart2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-foreground">LoanApproval AI</span>
            </div>
            <nav className="flex gap-5 text-sm text-muted-foreground">
              {footerLinks.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="hover:text-foreground transition-colors"
                >
                  {item}
                </button>
              ))}
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
