type FormFieldProps = {
  label: string
  className?: string
  children: React.ReactNode
}

export default function FormField({ label, className = '', children }: FormFieldProps) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      {children}
    </label>
  )
}
