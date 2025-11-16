import { COLORS, SIZES, TRANSITIONS } from './constants';

/**
 * ToggleButtonGroup - Rectangular toggle buttons (ENCENDER/APAGAR/NO CAMBIAR)
 *
 * @param {Object} props
 * @param {string} props.label - Label text for the group
 * @param {string[]} props.options - Array of option strings
 * @param {string} props.value - Currently selected value
 * @param {function} props.onChange - Callback when value changes
 * @param {boolean} props.allowDeselect - Allow clicking selected to deselect (default: false)
 */
const ToggleButtonGroup = ({
  label,
  options = ['ENCENDER', 'APAGAR', 'NO CAMBIAR'],
  value,
  onChange,
  allowDeselect = false
}) => {
  const handleClick = (opt) => {
    if (allowDeselect && value === opt) {
      onChange(null);
    } else {
      onChange(opt);
    }
  };

  const handleMouseEnter = (e, isSelected) => {
    if (isSelected) {
      e.target.style.background = COLORS.selectedHoverBg;
      e.target.style.borderColor = COLORS.selectedHoverBg;
    } else {
      e.target.style.background = COLORS.emerald;
      e.target.style.color = COLORS.textSelected;
    }
  };

  const handleMouseLeave = (e, isSelected) => {
    if (isSelected) {
      e.target.style.background = COLORS.emerald;
      e.target.style.borderColor = COLORS.emerald;
    } else {
      e.target.style.background = COLORS.backgroundWhite;
      e.target.style.color = COLORS.textNormal;
    }
  };

  return (
    <div className="form-group" style={{ alignItems: 'center' }}>
      <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
        {options.map(opt => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              style={{
                fontSize: SIZES.toggleFontSize,
                padding: SIZES.togglePadding,
                borderRadius: SIZES.toggleBorderRadius,
                border: `1px solid ${COLORS.emerald}`,
                background: isSelected ? COLORS.emerald : COLORS.backgroundWhite,
                color: isSelected ? COLORS.textSelected : COLORS.textNormal,
                cursor: 'pointer',
                transition: TRANSITIONS.fast,
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => handleMouseEnter(e, isSelected)}
              onMouseLeave={(e) => handleMouseLeave(e, isSelected)}
              onClick={() => handleClick(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ToggleButtonGroup;
