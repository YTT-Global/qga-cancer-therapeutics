import { useEffect, useState } from 'react'
import {
  Atom,
  Dna,
  FlaskConical,
  ShieldCheck,
  Cpu,
  Github,
  Terminal,
  Activity,
  Sparkles,
  AlertTriangle,
  XCircle,
  Sun,
  Moon,
  Monitor,
  ExternalLink,
  ArrowRight,
  Boxes,
  Network,
  GitBranch,
  Zap,
  Layers,
  Scale,
} from 'lucide-react'

const REPO_URL = 'https://github.com/YTT-Global/qga-cancer-therapeutics'

const DRUG_REGISTRY = ['Dabrafenib', 'Trametinib', 'Alpelisib', 'Everolimus']

const PIPELINE_STEPS = [
  {
    icon: Dna,
    title: 'Encode Candidates as Qubits',
    description:
      'Each drug in the registry is mapped to one qubit. A 4-drug combination search space becomes a 4-qubit register instead of 16 sequential classical evaluations.',
  },
  {
    icon: Atom,
    title: 'Quantum Superposition Sampling',
    description:
      'NVIDIA CUDA-Q applies Ry rotation gates and samples the circuit (cudaq.sample), returning many candidate bitstrings from a single quantum state in one pass.',
  },
  {
    icon: Scale,
    title: 'Multi-Objective Clinical Fitness',
    description:
      'Every sampled bitstring is scored on efficacy, pairwise drug synergy, and multi-organ toxicity (liver, kidney, bone marrow) — with a hard rejection if it violates a patient\'s ADME genetic profile.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance Agent Justification',
    description:
      'The winning combination is passed to a rule-based Medical Compliance Agent, which outputs a structured, plain-language justification report — approved or rejected on safety grounds.',
  },
]

const FITNESS_TERMS = [
  {
    icon: Activity,
    label: 'Efficacy',
    detail: 'Weighted baseline potency of each drug against the targeted mutation profile.',
    weight: 'w = 0.40',
  },
  {
    icon: Network,
    label: 'Synergy',
    detail: 'Quadratic interaction term (xᵀ·S·x) — positive pairs amplify, negative pairs antagonize.',
    weight: 'w = 0.40',
  },
  {
    icon: AlertTriangle,
    label: 'Toxicity',
    detail: 'Cumulative organ-system stress across liver, kidney, and bone marrow; hard cutoff at threshold.',
    weight: 'w = 0.20',
  },
  {
    icon: XCircle,
    label: 'ADME Penalty',
    detail: 'Score drops to −100 immediately if a candidate conflicts with the patient\'s inherited drug-metabolism genes.',
    weight: 'hard constraint',
  },
]

const STACK = [
  { icon: Cpu, label: 'NVIDIA CUDA-Q', detail: 'Quantum kernel + sampling (GPU or qpp-cpu fallback)' },
  { icon: Boxes, label: 'NumPy', detail: 'Classical fitness math — efficacy, synergy, toxicity' },
  { icon: GitBranch, label: 'Python 3.10', detail: 'Agent orchestration (coordinator + compliance agent)' },
  { icon: Zap, label: 'React + Vite', detail: 'This console — a static, presentational landing page' },
]

const LIMITATIONS = [
  'The drug registry, synergy matrix, and toxicity profiles are a small, fixed mock dataset (4 drugs) — not a live connection to GDSC, CCLE, or any real pharmacological database.',
  'The "evolution" loop in the coordinator is a 4-epoch hill-climb that nudges rotation angles toward the best-seen bitstring each round — it does not implement crossover, mutation, or population selection, so calling it a full genetic algorithm overstates it.',
  'The patient record is a single hardcoded JSON object in coordinator.py, not a real .vcf/.bam ingestion pipeline — data/processors/genomic_parser.py exists as an empty placeholder for that future work.',
  'cudaq is only importable on Linux with NVIDIA GPU drivers (or inside the provided Docker container) — there is currently no CPU-only mock/stub, so contributors without that hardware cannot run the quantum kernel locally.',
  'This is a research demonstrator, not a validated clinical decision-support tool. Nothing here has undergone regulatory review and it should not inform real treatment decisions.',
]

const THEME_KEY = 'qga-theme'
const THEME_OPTIONS = [
  { key: 'system', icon: Monitor, label: 'Use system theme' },
  { key: 'light', icon: Sun, label: 'Light theme' },
  { key: 'dark', icon: Moon, label: 'Dark theme' },
]

// Three-way theme: 'system' follows the OS (and live-updates if the OS
// theme changes while the page is open), 'light'/'dark' are explicit
// overrides. Persisted so a reload doesn't reset the choice. The matching
// inline script in index.html applies the stored value before React mounts
// so there's no flash of the wrong theme on load.
function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'system'
    return window.localStorage.getItem(THEME_KEY) || 'system'
  })

  useEffect(() => {
    const apply = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const isLight = theme === 'light' || (theme === 'system' && !prefersDark)
      document.documentElement.classList.toggle('light', isLight)
    }
    apply()

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      media.addEventListener('change', apply)
      return () => media.removeEventListener('change', apply)
    }
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  return [theme, setTheme]
}

function GlowCard({ children, className = '' }) {
  return (
    <div
      className={`quantum-card-glow rounded-2xl border border-emerald-500/20 bg-gray-900/60 light:bg-white light:border-gray-200 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  )
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 p-1 light:border-gray-200">
      {THEME_OPTIONS.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => setTheme(key)}
          aria-label={label}
          aria-pressed={theme === key}
          title={label}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            theme === key
              ? 'bg-emerald-500 text-[#0B0F19]'
              : 'text-gray-400 hover:text-emerald-400 light:text-gray-500'
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}

function StatusBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400 light:bg-amber-50 light:border-amber-200 light:text-amber-700">
      <Sparkles size={14} />
      Research Proof-of-Concept — Not for Clinical Use
    </div>
  )
}

function Header({ theme, setTheme }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md light:bg-white/80 light:border-gray-200">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 light:bg-emerald-50 light:text-emerald-700">
            <Atom size={20} />
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold tracking-wide text-white light:text-gray-900">QGA Oncology</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-400/80 light:text-emerald-700/80">
              YTT Global
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#0B0F19] transition-colors hover:bg-emerald-400"
          >
            <Github size={16} />
            <span className="hidden sm:inline">View on GitHub</span>
          </a>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="bg-grid-pattern relative overflow-hidden pb-20 pt-20 sm:pb-28 sm:pt-28">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <StatusBadge />
        <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl light:text-gray-900">
          A Quantum Genetic Algorithm for{' '}
          <span className="text-emerald-400 light:text-emerald-700">Multi-Drug Cancer Therapy</span>{' '}
          Optimization
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-gray-400 light:text-gray-600">
          Matching a mutated tumor genome against combination therapies is a combinatorial explosion problem.
          This project explores encoding candidate drug combinations as qubits and sampling them with NVIDIA
          CUDA-Q, scored by a multi-objective efficacy/synergy/toxicity fitness engine — as an open, inspectable
          research demonstrator, not a production clinical tool.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-[#0B0F19] transition-all hover:-translate-y-0.5 hover:bg-emerald-400 sm:text-base"
          >
            <Github size={18} />
            Explore the Source
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/10 px-7 py-3.5 text-sm font-semibold text-gray-200 transition-colors hover:border-emerald-500/40 hover:text-emerald-400 sm:text-base light:border-gray-200 light:text-gray-700"
          >
            How It Works
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}

function ProblemSection() {
  return (
    <section className="border-t border-white/5 py-20 sm:py-28 light:border-gray-200">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-700">
              The Problem
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold text-white sm:text-4xl light:text-gray-900">
              Combination therapy search space grows exponentially
            </h2>
            <p className="mt-5 leading-relaxed text-gray-400 light:text-gray-600">
              Matching a heavily mutated tumor genome against a large library of candidate drugs means the
              number of possible combinations grows exponentially with the drug count. Classical, sequential
              search methods can get stuck evaluating local minima, missing globally better combinations.
            </p>
            <p className="mt-4 leading-relaxed text-gray-400 light:text-gray-600">
              On top of that, drugs interact — some combinations amplify each other's effect (synergy), others
              compound toxicity in the same organ system. A workable answer has to search efficiently{' '}
              <em>and</em> respect hard clinical safety constraints at the same time.
            </p>
          </div>
          <GlowCard className="p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-700">
              This Demo's Search Space
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {DRUG_REGISTRY.map((drug) => (
                <div
                  key={drug}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center light:border-gray-200 light:bg-gray-50"
                >
                  <FlaskConical size={16} className="mx-auto text-emerald-400 light:text-emerald-700" />
                  <p className="mt-2 text-sm font-medium text-gray-200 light:text-gray-800">{drug}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-gray-500 light:text-gray-500">
              4 drugs → 4 qubits → up to 15 non-empty combinations sampled in a single quantum pass, each
              scored against a mock synergy/toxicity dataset (see Known Limitations below).
            </p>
          </GlowCard>
        </div>
      </div>
    </section>
  )
}

function PipelineSection() {
  return (
    <section id="how-it-works" className="border-t border-white/5 py-20 sm:py-28 light:border-gray-200">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-700">
            How It Works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-white sm:text-4xl light:text-gray-900">
            Four stages, from qubits to a justification report
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE_STEPS.map(({ icon: Icon, title, description }, i) => (
            <GlowCard key={title} className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 light:bg-emerald-50 light:text-emerald-700">
                <Icon size={20} strokeWidth={2} />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-500">Step {i + 1}</p>
              <h3 className="mt-1 text-base font-semibold text-white light:text-gray-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400 light:text-gray-600">{description}</p>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  )
}

function FitnessFunctionSection() {
  return (
    <section className="border-t border-white/5 py-20 sm:py-28 light:border-gray-200">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-700">
            The Fitness Function
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-white sm:text-4xl light:text-gray-900">
            Every candidate is scored, not just guessed
          </h2>
        </div>

        <GlowCard className="mx-auto mt-10 max-w-3xl px-6 py-8 text-center sm:px-10">
          <code className="block overflow-x-auto whitespace-pre text-sm text-emerald-300 sm:text-base light:text-emerald-700">
            F(x) = w₁·Efficacy(x) + w₂·Synergy(x) − w₃·Toxicity(x) − Penalty_ADME(x)
          </code>
        </GlowCard>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {FITNESS_TERMS.map(({ icon: Icon, label, detail, weight }) => (
            <div
              key={label}
              className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 light:border-gray-200 light:bg-gray-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 light:bg-emerald-50 light:text-emerald-700">
                <Icon size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white light:text-gray-900">{label}</p>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono text-gray-400 light:bg-gray-200 light:text-gray-600">
                    {weight}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-gray-400 light:text-gray-600">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Every bitstring/score pair below was computed by actually running
// ClinicalFitnessEngine against the mock PT-A77B9 patient (adme_blacklist=[0]
// for the Dabrafenib conflict) — not invented. [0110] (Trametinib+Alpelisib),
// for example, looks like a plausible "getting better" step but actually
// scores -50.0 (a toxicity threshold breach), so it's deliberately not shown
// here as if it were a good result. 0010 (Alpelisib alone, 0.2133) is the
// true global optimum for this patient — verified against
// quantum.baseline.brute_force_search, not just the pipeline's own output.
const DEMO_FRAMES = [
  { text: '🧬 Orchestrating Quantum-Classical Engine Pipeline for Patient: PT-A77B9', tone: 'info' },
  { text: '🛰️ Initiating Quantum State Evolution across available registers...', tone: 'info' },
  { text: '├── Epoch 1: Optimized Bitstring Vector [0100] | Fitness Score: 0.1200', tone: 'muted' },
  { text: '├── Epoch 2: Optimized Bitstring Vector [0001] | Fitness Score: 0.1000', tone: 'muted' },
  { text: '├── Epoch 3: Optimized Bitstring Vector [0010] | Fitness Score: 0.2133', tone: 'muted' },
  { text: '├── Epoch 4: Optimized Bitstring Vector [0010] | Fitness Score: 0.2133', tone: 'muted' },
  { text: '📜 Compliance Agent: status = APPROVED', tone: 'success' },
  { text: '   recommended_cocktail = ["Alpelisib"]', tone: 'success' },
]

function DemoConsole() {
  const [visible, setVisible] = useState(1)

  useEffect(() => {
    if (visible >= DEMO_FRAMES.length) {
      const reset = setTimeout(() => setVisible(1), 3200)
      return () => clearTimeout(reset)
    }
    const next = setTimeout(() => setVisible((v) => v + 1), 900)
    return () => clearTimeout(next)
  }, [visible])

  return (
    <section className="border-t border-white/5 py-20 sm:py-28 light:border-gray-200">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-700">
            Simulated Output
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-white sm:text-4xl light:text-gray-900">
            What a run looks like
          </h2>
          <p className="mt-4 text-balance text-gray-400 light:text-gray-600">
            Replayed console output from <code className="text-emerald-400 light:text-emerald-700">coordinator.py</code>{' '}
            using the mock patient record shipped in this repo — not a live backend, and not a real patient.
          </p>
        </div>

        <GlowCard className="mx-auto mt-10 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3 light:border-gray-200 light:bg-gray-100">
            <Terminal size={14} className="text-gray-500" />
            <span className="font-mono text-xs text-gray-500">python -m agents.coordinator</span>
          </div>
          <div className="min-h-[220px] space-y-2 p-6 font-mono text-xs sm:text-sm">
            {DEMO_FRAMES.slice(0, visible).map((frame, i) => (
              <p
                key={i}
                className={`animate-log-entry ${
                  frame.tone === 'success'
                    ? 'text-emerald-400 light:text-emerald-700'
                    : frame.tone === 'muted'
                      ? 'text-gray-400 light:text-gray-600'
                      : 'text-gray-200 light:text-gray-800'
                }`}
              >
                {frame.text}
              </p>
            ))}
          </div>
        </GlowCard>
      </div>
    </section>
  )
}

function StackSection() {
  return (
    <section className="border-t border-white/5 py-20 sm:py-28 light:border-gray-200">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-700">
            Stack
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-white sm:text-4xl light:text-gray-900">
            Built on
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map(({ icon: Icon, label, detail }) => (
            <div key={label} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 light:bg-emerald-50 light:text-emerald-700">
                <Icon size={22} />
              </div>
              <p className="mt-3 text-sm font-semibold text-white light:text-gray-900">{label}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LimitationsSection() {
  return (
    <section className="border-t border-white/5 py-20 sm:py-28 light:border-gray-200">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 light:bg-amber-50 light:text-amber-700">
            <AlertTriangle size={20} />
          </div>
          <h2 className="text-balance text-2xl font-bold text-white sm:text-3xl light:text-gray-900">
            Known Limitations
          </h2>
        </div>
        <p className="mt-4 text-gray-400 light:text-gray-600">
          Read this before deciding what to build on top of this repo. Full detail in{' '}
          <code className="text-emerald-400 light:text-emerald-700">docs/features.md</code>.
        </p>
        <ul className="mt-6 space-y-4">
          {LIMITATIONS.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-gray-400 light:text-gray-600">
              <Layers size={16} className="mt-0.5 shrink-0 text-amber-400/70" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-14 light:border-gray-200">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 text-center sm:px-8">
        <div className="flex items-center gap-2 text-gray-400 light:text-gray-600">
          <Atom size={18} className="text-emerald-400 light:text-emerald-700" />
          <span className="text-sm font-medium">QGA Cancer Therapeutics — Open Source</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-400 transition-colors hover:text-emerald-400 light:text-gray-600"
          >
            <Github size={14} />
            Repository
          </a>
          <a
            href={`${REPO_URL}/blob/main/LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-400 transition-colors hover:text-emerald-400 light:text-gray-600"
          >
            MIT License
          </a>
          <a
            href="https://www.linkedin.com/company/yttglobalservices"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-400 transition-colors hover:text-emerald-400 light:text-gray-600"
          >
            YTT Global
            <ExternalLink size={12} />
          </a>
        </div>
        <p className="max-w-xl text-xs leading-relaxed text-gray-600">
          Research proof-of-concept. Not a medical device, not clinically validated, and not intended to
          inform real treatment decisions.
        </p>
      </div>
    </footer>
  )
}

export default function App() {
  const [theme, setTheme] = useTheme()

  return (
    <div className="min-h-screen bg-[#0B0F19] light:bg-[#F9FAFB]">
      <Header theme={theme} setTheme={setTheme} />
      <main>
        <Hero />
        <ProblemSection />
        <PipelineSection />
        <FitnessFunctionSection />
        <DemoConsole />
        <StackSection />
        <LimitationsSection />
      </main>
      <Footer />
    </div>
  )
}
