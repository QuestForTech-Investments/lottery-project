/**
 * ManageZones Constants
 *
 * Styles and constants for zone management.
 */

// Common button style
export const PILL_BUTTON_STYLE = {
  borderRadius: '30px',
  px: 3,
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
};

// Primary button style
export const PRIMARY_BUTTON_STYLE = {
  ...PILL_BUTTON_STYLE,
  bgcolor: '#51BCDA',
  '&:hover': {
    bgcolor: '#3da8c8',
  },
  '&:disabled': {
    bgcolor: '#b0dae6',
  },
};

// Tabs container style
export const TABS_STYLE = {
  '& .MuiTab-root': {
    fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    minHeight: 48,
  },
  '& .Mui-selected': {
    color: '#51BCDA !important',
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#51BCDA',
    height: 3,
  },
};

// Navigation button style
export const NAV_BUTTON_STYLE = {
  flexShrink: 0,
  width: 40,
  height: 48,
  borderRadius: 0,
  color: '#666',
  '&:hover': {
    bgcolor: 'rgba(0, 0, 0, 0.05)',
    color: '#333',
  },
};

// Chip base style
export const getChipStyle = (isSelected: boolean) => ({
  fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
  fontSize: '11px',
  fontWeight: isSelected ? 600 : 500,
  bgcolor: isSelected ? '#51BCDA' : 'white',
  color: isSelected ? 'white' : '#333',
  border: '1.15px solid',
  borderColor: isSelected ? '#51BCDA' : 'rgb(206, 212, 218)',
  '&:hover': {
    bgcolor: isSelected ? '#3da8c8' : 'rgba(81, 188, 218, 0.1)',
    borderColor: '#51BCDA',
  },
});

// Section container style
export const SECTION_CONTAINER_STYLE = {
  border: 1,
  borderColor: '#e9ecef',
  borderRadius: 1,
  p: 2,
  bgcolor: '#f8f9fa',
  mb: 3,
};

// Search input style
export const SEARCH_INPUT_STYLE = {
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
  },
};

// Scrollbar container style
export const SCROLLBAR_CONTAINER_STYLE = {
  flex: 1,
  overflowX: 'auto',
  overflowY: 'hidden',
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    height: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#ccc',
    borderRadius: '2px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#999',
  },
};
