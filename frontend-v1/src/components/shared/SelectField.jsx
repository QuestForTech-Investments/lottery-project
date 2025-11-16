import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable select field component with label and error handling
 * Supports both simple arrays and object arrays as options
 */
const SelectField = React.memo(({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Seleccione...',
  required = false,
  disabled = false,
  error,
  className = '',
  valueKey = 'value',
  labelKey = 'label'
}) => {
  const selectId = `select-${name}`;

  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="form-select"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${selectId}-error` : undefined}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => {
          // Support both simple strings and objects
          const optionValue = typeof option === 'object' ? option[valueKey] : option;
          const optionLabel = typeof option === 'object' ? option[labelKey] : option;

          return (
            <option key={index} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      {error && (
        <span id={`${selectId}-error`} className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

SelectField.displayName = 'SelectField';

SelectField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string
      })
    ])
  ),
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  valueKey: PropTypes.string,
  labelKey: PropTypes.string
};

export default SelectField;
