import { COLORS, SIZES, TRANSITIONS } from './constants';

/**
 * IPhoneToggle - iOS-style toggle switch
 *
 * @param {Object} props
 * @param {string} props.label - Label text for the toggle
 * @param {boolean} props.value - Current boolean value
 * @param {function} props.onChange - Callback when value changes
 * @param {boolean} props.labelOnLeft - Show label on left (default: true)
 */
const IPhoneToggle = ({
  label,
  value = false,
  onChange,
  labelOnLeft = true
}) => {
  const toggleElement = (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: SIZES.iphoneToggleWidth,
        height: SIZES.iphoneToggleHeight,
        borderRadius: '12px',
        background: value ? COLORS.emerald : COLORS.gray,
        position: 'relative',
        cursor: 'pointer',
        transition: TRANSITIONS.medium,
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <div
        style={{
          width: SIZES.iphoneToggleKnobSize,
          height: SIZES.iphoneToggleKnobSize,
          borderRadius: '50%',
          background: COLORS.backgroundWhite,
          position: 'absolute',
          top: '2px',
          left: value ? '22px' : '2px',
          transition: TRANSITIONS.medium,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }}
      />
    </div>
  );

  const labelElement = label && (
    <span style={{
      fontSize: SIZES.labelFontSize,
      color: COLORS.textDark,
      fontWeight: SIZES.labelFontWeight
    }}>
      {label}
    </span>
  );

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      {labelOnLeft ? (
        <>
          {labelElement}
          {toggleElement}
        </>
      ) : (
        <>
          {toggleElement}
          {labelElement}
        </>
      )}
    </div>
  );
};

export default IPhoneToggle;
