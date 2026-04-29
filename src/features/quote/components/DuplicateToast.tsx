type DuplicateToastProps = {
  show: boolean
}

export function DuplicateToast({ show }: DuplicateToastProps) {
  return (
    <div
      className={`fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded shadow-lg z-50 transition-all duration-300 transform ${
        show
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      Quote duplicated — ready to edit
    </div>
  )
}