"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiversityAlertsPanel } from "@/components/dashboard/diversity-alerts";
import { useApp } from "@/context/app-context";
import { api, Analytics } from "@/lib/api";

const COLORS = ["#7c5cff", "#22d3ee", "#34d399", "#fbbf24", "#f87171", "#60a5fa"];

const AXIS_TICK = { fill: "#646e80", fontSize: 12 };
const AXIS_LINE = { stroke: "#232a36" };
const TOOLTIP_CONTENT = {
  background: "#14181f",
  border: "1px solid #232a36",
  borderRadius: "10px",
  color: "#e9ecf2",
};
const TOOLTIP_LABEL = { color: "#99a3b4" };
const TOOLTIP_ITEM = { color: "#e9ecf2" };
const TOOLTIP_CURSOR = { fill: "rgba(124,92,255,0.08)" };

export default function AnalyticsPage() {
  const { activeJDId } = useApp();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    api.getAnalytics(activeJDId || undefined).then(setAnalytics).catch(() => {});
  }, [activeJDId]);

  if (!analytics) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 animate-fade-up">
      <h1 className="text-3xl font-bold text-fg gradient-text">Analytics</h1>
      <p className="mt-1 text-muted">Insights from your candidate pipeline</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Score Distribution */}
        <Card>
          <CardHeader><CardTitle>Candidate Score Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.score_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232a36" vertical={false} />
                <XAxis dataKey="range" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_CONTENT} labelStyle={TOOLTIP_LABEL} itemStyle={TOOLTIP_ITEM} cursor={TOOLTIP_CURSOR} />
                <Bar dataKey="count" fill="#7c5cff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Experience Distribution */}
        <Card>
          <CardHeader><CardTitle>Experience Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.experience_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232a36" vertical={false} />
                <XAxis dataKey="range" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_CONTENT} labelStyle={TOOLTIP_LABEL} itemStyle={TOOLTIP_ITEM} cursor={TOOLTIP_CURSOR} />
                <Bar dataKey="count" fill="#7c5cff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Heatmap */}
        <Card>
          <CardHeader><CardTitle>Skill Heatmap</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.skill_heatmap.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#232a36" horizontal={false} />
                <XAxis type="number" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
                <YAxis dataKey="skill" type="category" width={100} tick={{ fill: "#646e80", fontSize: 11 }} axisLine={AXIS_LINE} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_CONTENT} labelStyle={TOOLTIP_LABEL} itemStyle={TOOLTIP_ITEM} cursor={TOOLTIP_CURSOR} />
                <Bar dataKey="count" fill="#7c5cff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Education Breakdown */}
        <Card>
          <CardHeader><CardTitle>Education Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.education_breakdown.slice(0, 6)}
                  dataKey="count"
                  nameKey="institution"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  stroke="#14181f"
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {analytics.education_breakdown.slice(0, 6).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_CONTENT} labelStyle={TOOLTIP_LABEL} itemStyle={TOOLTIP_ITEM} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hiring Funnel */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Hiring Funnel</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <FunnelChart>
                <Tooltip contentStyle={TOOLTIP_CONTENT} labelStyle={TOOLTIP_LABEL} itemStyle={TOOLTIP_ITEM} />
                <Funnel dataKey="count" data={analytics.hiring_funnel} fill="#7c5cff" isAnimationActive>
                  <LabelList position="right" fill="#99a3b4" stroke="none" dataKey="stage" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Diversity Insights */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bias & Diversity Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <DiversityAlertsPanel
              alerts={analytics.diversity_alert_list || []}
              insights={analytics.diversity_insights}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
