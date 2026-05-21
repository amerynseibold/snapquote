import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  LayoutDashboard,
  MessageSquareText,
  TrendingUp,
} from "lucide-react"

import type { ActivityItem, Job } from "../types"
import {
  formatCurrency,
  getConversionRate,
  getFollowUpJobs,
  getOpenJobs,
  getPipelineValue,
  getScheduledThisWeek,
} from "../utils/calculations"

type FieldOpsDashboardProps = {
  jobs: Job[]
  activity: ActivityItem[]
}

export function FieldOpsDashboard({ jobs, activity }: FieldOpsDashboardProps) {
  const followUpJobs = getFollowUpJobs(jobs)

  const stats = [
    {
      label: "Pipeline Value",
      value: formatCurrency(getPipelineValue(jobs)),
      detail: "+12% from last month",
      icon: DollarSign,
    },
    {
      label: "Open Jobs",
      value: getOpenJobs(jobs).toString(),
      detail: `${followUpJobs.length} need attention`,
      icon: BriefcaseBusiness,
    },
    {
      label: "Scheduled This Week",
      value: getScheduledThisWeek(jobs).toString(),
      detail: "4 crews assigned",
      icon: CalendarDays,
    },
    {
      label: "Conversion Rate",
      value: `${getConversionRate(jobs)}%`,
      detail: "+8% over 30 days",
      icon: TrendingUp,
    },
  ]

  return (
    <main className="min-h-screen bg-[#050812] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-white/[0.03] px-5 py-6 lg:block">
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                <LayoutDashboard size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-400">Auxilium Demo</p>
                <h1 className="text-lg font-semibold tracking-tight">
                  FieldOps
                </h1>
              </div>
            </div>
          </div>

          <nav className="space-y-2 text-sm">
            {[
              "Overview",
              "Pipeline",
              "Jobs",
              "Customers",
              "Follow-Ups",
              "Reports",
            ].map((item, index) => (
              <div
                key={item}
                className={`rounded-xl px-4 py-3 ${
                  index === 0
                    ? "bg-cyan-400/10 text-cyan-200"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <section className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-8 flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-5 shadow-2xl shadow-black/20 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-cyan-300">Operations Command Center</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                FieldOps Dashboard
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Track leads, quotes, scheduled jobs, follow-ups, and pipeline
                visibility from one internal workspace.
              </p>
            </div>

            <button className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200">
              Add New Job
            </button>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                      <Icon size={20} />
                    </div>
                    <span className="text-xs text-slate-500">Live Demo</span>
                  </div>

                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-emerald-300">
                    {stat.detail}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Recent Job Activity</h3>
                  <p className="text-sm text-slate-400">
                    Latest quote, scheduling, and job status updates.
                  </p>
                </div>
                <CheckCircle2 className="text-cyan-300" size={22} />
              </div>

              <div className="space-y-3">
                {jobs.slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-medium text-slate-100">
                        {job.customerName}
                      </p>
                      <p className="text-sm text-slate-400">
                        {job.serviceType}
                      </p>
                    </div>

                    <span className="w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
                      {job.status}
                    </span>

                    <p className="font-semibold text-slate-100">
                      {formatCurrency(job.estimatedValue)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Follow-Up Queue</h3>
                  <p className="text-sm text-slate-400">
                    Work that needs attention.
                  </p>
                </div>
                <Clock className="text-cyan-300" size={22} />
              </div>

              <div className="space-y-3">
                {followUpJobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-100">
                          {job.customerName}
                        </p>
                        <p className="text-sm text-slate-400">
                          {job.serviceType}
                        </p>
                      </div>

                      <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-200">
                        {job.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MessageSquareText size={16} />
                      <span>{job.notes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <div className="mb-5">
              <h3 className="text-lg font-semibold">Live Operational Activity</h3>
              <p className="text-sm text-slate-400">
                Recent updates across quotes, jobs, scheduling, and follow-ups.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="font-medium text-slate-100">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    {item.description}
                  </p>
                  <p className="mt-4 text-xs text-cyan-300">
                    {item.timestamp}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}