import { COLORS, SIZES, TRANSITIONS } from './constants';

/**
 * SelectableBadgeGroup - Multi-select badge buttons (for sorteos, bancas, zonas)
 *
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {Array} props.items - Array of items with { id, name } structure
 * @param {Array} props.selectedIds - Array of selected IDs
 * @param {function} props.onToggle - Callback when item is toggled (receives id)
 * @param {function} props.onSelectAll - Optional callback for "select all" button
 * @param {number} props.maxHeight - Max height of container (default: 200px)
 * @param {string} props.idKey - Key to use for ID (default: 'id')
 * @param {string} props.nameKey - Key to use for name (default: 'name')
 */
const SelectableBadgeGroup = ({
  title,
  items = [],
  selectedIds = [],
  onToggle,
  onSelectAll,
  maxHeight = 200,
  idKey = 'id',
  nameKey = 'name'
}) => {
  const badgeStyle = {
    padding: SIZES.badgePadding,
    border: `1px solid ${COLORS.emerald}`,
    borderRadius: SIZES.badgeBorderRadius,
    cursor: 'pointer',
    fontSize: SIZES.badgeFontSize,
    background: COLORS.backgroundWhite,
    color: COLORS.textNormal,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    display: 'inline-block',
    margin: SIZES.badgeMargin,
    transition: TRANSITIONS.fast
  };

  const badgeSelectedStyle = {
    ...badgeStyle,
    background: COLORS.emerald,
    color: COLORS.textSelected
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

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div style={{ marginTop: '15px' }}>
      <h6 style={{
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '10px',
        color: COLORS.textDark
      }}>
        {title}
      </h6>
      <div style={{
        maxHeight: `${maxHeight}px`,
        overflowY: 'auto',
        padding: '10px',
        border: `1px solid ${COLORS.borderLight}`,
        borderRadius: '4px',
        background: COLORS.backgroundLight
      }}>
        {items.map(item => {
          const itemId = item[idKey];
          const itemName = item[nameKey];
          const isSelected = selectedIds.includes(itemId);

          return (
            <span
              key={itemId}
              style={isSelected ? badgeSelectedStyle : badgeStyle}
              onMouseEnter={(e) => handleMouseEnter(e, isSelected)}
              onMouseLeave={(e) => handleMouseLeave(e, isSelected)}
              onClick={() => onToggle(itemId)}
            >
              {itemName}
            </span>
          );
        })}
        {onSelectAll && (
          <span
            style={{
              ...(allSelected ? badgeSelectedStyle : badgeStyle),
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => handleMouseEnter(e, allSelected)}
            onMouseLeave={(e) => handleMouseLeave(e, allSelected)}
            onClick={onSelectAll}
          >
            TODOS
          </span>
        )}
      </div>
    </div>
  );
};

export default SelectableBadgeGroup;
