type AppToastVariant = "success" | "error" | "info"

type DuplicateToastProps = {
  show: boolean
  message: string
  variant?: AppToastVariant
}

const variantClasses: Record<AppToastVariant, string> = {
  success: "border-[#cfe2bf] bg-white text-gray-900",
  error: "border-red-200 bg-white text-gray-900",
  info: "border-[#d9dfd1] bg-white text-gray-900",
}

const dotClasses: Record<AppToastVariant, string> = {
  success: "bg-[#5f9534]",
  error: "bg-red-500",
  info: "bg-[#101522]",
}

export function DuplicateToast({
  show,
  message,
  variant = "info",
}: DuplicateToastProps) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex min-w-[240px] items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-[0_18px_45px_rgba(15,23,42,0.18)] transition-all duration-300 ${
        variantClasses[variant]
      } ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
      role="status"
      aria-live="polite"
    >
      <span className={`h-2 w-2 rounded-full ${dotClasses[variant]}`} />
      <span className="font-medium">{message}</span>
    </div>
  )
}
