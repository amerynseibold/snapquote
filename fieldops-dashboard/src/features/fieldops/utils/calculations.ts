import type { Job } from "../types"

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function getPipelineValue(jobs: Job[]) {
  return jobs
    .filter((job) => job.status !== "Lost" && job.status !== "Paid")
    .reduce((total, job) => total + job.estimatedValue, 0)
}

export function getOpenJobs(jobs: Job[]) {
  return jobs.filter(
    (job) =>
      job.status !== "Completed" &&
      job.status !== "Paid" &&
      job.status !== "Lost"
  ).length
}

export function getScheduledThisWeek(jobs: Job[]) {
  return jobs.filter((job) => job.status === "Scheduled").length
}

export function getConversionRate(jobs: Job[]) {
  const closedJobs = jobs.filter(
    (job) => job.status === "Paid" || job.status === "Lost"
  )

  if (closedJobs.length === 0) {
    return 0
  }

  const wonJobs = closedJobs.filter((job) => job.status === "Paid")

  return Math.round((wonJobs.length / closedJobs.length) * 100)
}

export function getFollowUpJobs(jobs: Job[]) {
  return jobs.filter((job) =>
    ["New Lead", "Quoted", "Approved", "Completed"].includes(job.status)
  )
}