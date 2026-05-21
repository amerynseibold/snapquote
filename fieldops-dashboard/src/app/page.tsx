import { FieldOpsDashboard } from "@/features/fieldops/components/FieldOpsDashboard"
import { mockActivity, mockJobs } from "@/features/fieldops/data/mockJobs"

export default function Home() {
  return <FieldOpsDashboard jobs={mockJobs} activity={mockActivity} />
}