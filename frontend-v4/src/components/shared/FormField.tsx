import type { ChangeEvent } from 'react'

interface FormFieldProps {
  name: string
  type?: string
  value: string | number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  min?: string
  max?: string
  step?: string
  error?: string
  className?: string
}

const FormField = ({
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  error,
  className,
}: FormFieldProps) => (
  <div className="form-field-wrapper">
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className={className}
    />
    {error && <span className="form-field-error">{error}</span>}
  </div>
)

export default FormField
