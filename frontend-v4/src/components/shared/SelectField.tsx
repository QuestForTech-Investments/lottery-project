import type { ChangeEvent } from 'react'

interface SelectFieldProps<Option extends object> {
  name: string
  value: string | number
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  options: Option[]
  placeholder?: string
  valueKey?: keyof Option
  labelKey?: keyof Option
  error?: string
  className?: string
}

const SelectField = <Option extends object>({
  name,
  value,
  onChange,
  options,
  placeholder,
  valueKey = 'value' as keyof Option,
  labelKey = 'label' as keyof Option,
  error,
  className,
}: SelectFieldProps<Option>) => (
  <div className="select-field-wrapper">
    <select name={name} value={value} onChange={onChange} className={className}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={String(option[valueKey as keyof Option])} value={String(option[valueKey as keyof Option])}>
          {String(option[labelKey as keyof Option])}
        </option>
      ))}
    </select>
    {error && <span className="select-field-error">{error}</span>}
  </div>
)

export default SelectField
