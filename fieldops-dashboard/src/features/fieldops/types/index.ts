export type JobStatus =
  | "New Lead"
  | "Quoted"
  | "Approved"
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Paid"
  | "Lost"

export type JobPriority = "Low" | "Medium" | "High"

export type Job = {
  id: string
  customerName: string
  serviceType: string
  status: JobStatus
  priority: JobPriority
  estimatedValue: number
  address: string
  phone: string
  email?: string
  createdAt: string
  quoteSentAt?: string
  followUpDate?: string
  scheduledDate?: string
  completedDate?: string
  notes?: string
}

export type ActivityItem = {
  id: string
  jobId: string
  title: string
  description: string
  timestamp: string
}