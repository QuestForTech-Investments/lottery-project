/**
 * CreateTicket Constants
 *
 * Styles and constants for ticket creation.
 */

// Primary color
export const PRIMARY_COLOR = '#8b5cf6';
export const PRIMARY_HOVER = '#7c3aed';

// Button styles
export const ADD_LINE_BUTTON_STYLE = {
  bgcolor: '#28a745',
  '&:hover': { bgcolor: '#218838' }
};

export const CREATE_BUTTON_STYLE = (hasLines: boolean) => ({
  bgcolor: hasLines ? PRIMARY_COLOR : '#ccc',
  '&:hover': { bgcolor: hasLines ? PRIMARY_HOVER : '#ccc' }
});

export const RESET_BUTTON_STYLE = {
  color: '#6c757d',
  borderColor: '#6c757d',
  '&:hover': {
    borderColor: '#5a6268',
    bgcolor: 'rgba(108, 117, 125, 0.04)'
  }
};

// Table header style
export const TABLE_HEADER_STYLE = {
  bgcolor: PRIMARY_COLOR,
  color: '#fff'
};

// Commission rate
export const COMMISSION_RATE = 0.10; // 10%

// Preview container style
export const PREVIEW_CONTAINER_STYLE = {
  flex: '0 0 350px',
  position: 'sticky',
  top: 20,
  maxHeight: '90vh',
  overflowY: 'auto'
};

export const PREVIEW_PAPER_STYLE = {
  border: `2px dashed ${PRIMARY_COLOR}`,
  padding: 2,
  textAlign: 'center'
};

// Section title style
export const SECTION_TITLE_STYLE = {
  marginBottom: 2,
  color: PRIMARY_COLOR
};
