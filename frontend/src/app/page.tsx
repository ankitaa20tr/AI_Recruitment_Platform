"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileSearch, Brain, Shield, Sparkles, BarChart3, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, Gem, AlertTriangle, FileText } from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Semantic CV Matching",
    description: "Vector-based similarity scoring — no keyword matching. Rank candidates by true fit.",
  },
  {
    icon: Brain,
    title: "AI Explainability",
    description: "Understand strengths, gaps, risks, and growth potential for every candidate.",
  },
  {
    icon: Shield,
    title: "Bias & Diversity Analysis",
    description: "Surface educational and employer concentration without inferring protected attributes.",
  },
  {
    icon: MessageSquare,
    title: "Recruiter Copilot",
    description: "Ask questions about your candidate pool with RAG-powered chat.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-gem/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-1.5 text-sm font-medium text-accent ring-1 ring-inset ring-accent/25">
              <Sparkles className="h-4 w-4" />
              AI-Augmented Recruitment
            </span>
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-fg md:text-6xl">
              Screen 1,000 CVs.{" "}
              <span className="gradient-text">Surface the 10 who matter.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
              RecruitIQ AI semantically evaluates candidates, ranks them, explains rankings,
              flags diversity concerns, and generates tailored interview questions.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Launch Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" size="lg">
                  View Analytics
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total CVs Processed" value="1,000+" icon={FileText} color="bg-accent" delay={0.1} />
          <StatCard title="Candidates Ranked" value="950+" icon={Users} color="bg-info" delay={0.2} />
          <StatCard title="Hidden Gems Found" value="47" icon={Gem} color="bg-gem" delay={0.3} />
          <StatCard title="Diversity Alerts" value="12" icon={AlertTriangle} color="bg-warn" delay={0.4} />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-fg">Platform Capabilities</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="surface group p-8 transition-colors hover:border-line-strong"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft ring-1 ring-inset ring-accent/25">
                <f.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-fg">{f.title}</h3>
              <p className="mt-2 text-muted">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="surface relative overflow-hidden p-12 text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
          <BarChart3 className="relative mx-auto h-12 w-12 text-accent" />
          <h2 className="relative mt-4 text-3xl font-bold text-fg">Ready to transform your hiring?</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-muted">
            Upload a job description and batch of CVs to get AI-powered rankings in minutes.
          </p>
          <Link href="/dashboard" className="mt-8 inline-block">
            <Button size="lg">Start Screening</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
