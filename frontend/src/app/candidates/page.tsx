"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Download, ChevronLeft, ChevronRight, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useApp } from "@/context/app-context";
import { api, CandidateListItem } from "@/lib/api";
import { getScoreColor, formatScore } from "@/lib/utils";

export default function CandidatesPage() {
  const { activeJDId } = useApp();
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [hiddenGemsOnly, setHiddenGemsOnly] = useState(false);
  const [minScore, setMinScore] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [maxExperience, setMaxExperience] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const pageSize = 20;

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await api.listCandidates({
        job_description_id: activeJDId || "",
        search,
        hidden_gems_only: hiddenGemsOnly,
        sort_by: sortBy,
        page,
        page_size: pageSize,
        ...(minScore ? { min_score: Number(minScore) } : {}),
        ...(minExperience ? { min_experience: Number(minExperience) } : {}),
        ...(maxExperience ? { max_experience: Number(maxExperience) } : {}),
        ...(requiredSkills ? { required_skills: requiredSkills } : {}),
      });
      setCandidates(res.items);
      setTotal(res.total);
    } catch {
      /* ignore */
    }
  }, [activeJDId, search, hiddenGemsOnly, minScore, minExperience, maxExperience, requiredSkills, sortBy, page]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold text-fg">Candidates</h1>
          <p className="mt-1 text-muted">{total} candidates in pool</p>
        </div>
        <div className="flex gap-2">
          <a href={api.exportCSV(activeJDId || undefined)}>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </a>
          <a href={api.exportPDF(activeJDId || undefined)}>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </a>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <Input
                  className="pl-10"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <select
                className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:ring-1 focus:ring-accent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rank">Sort by Rank</option>
                <option value="score">Sort by Score</option>
                <option value="name">Sort by Name</option>
                <option value="experience">Sort by Experience</option>
              </select>
              <Button
                variant={hiddenGemsOnly ? "default" : "outline"}
                size="sm"
                onClick={() => { setHiddenGemsOnly(!hiddenGemsOnly); setPage(1); }}
              >
                <Gem className="h-4 w-4 mr-1" /> Hidden Gems
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 border-t pt-4 border-line">
              <div className="flex items-center gap-2">
                <span className="label text-faint">Min Score:</span>
                <Input
                  className="w-24"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={minScore}
                  onChange={(e) => { setMinScore(e.target.value); setPage(1); }}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="label text-faint">Min Exp (Yrs):</span>
                <Input
                  className="w-24"
                  type="number"
                  min={0}
                  max={50}
                  placeholder="0"
                  value={minExperience}
                  onChange={(e) => { setMinExperience(e.target.value); setPage(1); }}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="label text-faint">Max Exp (Yrs):</span>
                <Input
                  className="w-24"
                  type="number"
                  min={0}
                  max={50}
                  placeholder="50"
                  value={maxExperience}
                  onChange={(e) => { setMaxExperience(e.target.value); setPage(1); }}
                />
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <span className="label text-faint">Skills:</span>
                <Input
                  className="flex-1"
                  placeholder="e.g. Python, React, FastAPI (comma separated)"
                  value={requiredSkills}
                  onChange={(e) => { setRequiredSkills(e.target.value); setPage(1); }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="label pb-3 pr-4 text-faint">Rank</th>
                  <th className="label pb-3 pr-4 text-faint">Name</th>
                  <th className="label pb-3 pr-4 text-faint">Score</th>
                  <th className="label pb-3 pr-4 text-faint">Experience</th>
                  <th className="label pb-3 pr-4 text-faint">Top Skills</th>
                  <th className="label pb-3 text-faint">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-elevated transition-colors">
                    <td className="num py-3 pr-4 font-medium text-fg">#{c.rank ?? "-"}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/candidates/${c.id}`} className="font-medium text-accent hover:underline">
                        {c.name}
                      </Link>
                      {c.is_hidden_gem && (
                        <Badge variant="gem" className="ml-2">
                          <Gem className="h-3 w-3 mr-1" /> Gem
                        </Badge>
                      )}
                    </td>
                    <td className={`num py-3 pr-4 font-semibold ${getScoreColor(c.overall_score)}`}>
                      {formatScore(c.overall_score)}
                    </td>
                    <td className="num py-3 pr-4 text-muted">{c.years_of_experience} years</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {c.top_skills.slice(0, 4).map((s) => (
                          <Badge key={s} variant="secondary">{s}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant={c.status === "ranked" ? "success" : "secondary"}>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted">Page <span className="num">{page}</span> of <span className="num">{totalPages}</span></p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
