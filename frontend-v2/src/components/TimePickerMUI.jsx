import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, List, ListItemButton, Button, ClickAwayListener } from '@mui/material';

/**
 * TimePickerMUI Component
 * Material-UI compatible time picker dropdown for V2 frontend
 * Two-column design: Hours and Minutes
 * Displays times in 12-hour format with AM/PM and returns same format (HH:MM AM/PM)
 */
const TimePickerMUI = ({ value, onChange, onClose, anchorEl }) => {
  const [selectedHour, setSelectedHour] = useState('12 AM');
  const [selectedMinute, setSelectedMinute] = useState('00');

  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  // Generate hour options in 12-hour format
  const generateHourOptions = () => {
    const hours = [];

    // 12 AM
    hours.push({ display: '12 AM', hour24: 0 });

    // 01 AM - 11 AM
    for (let i = 1; i <= 11; i++) {
      hours.push({
        display: `${String(i).padStart(2, '0')} AM`,
        hour24: i
      });
    }

    // 12 PM
    hours.push({ display: '12 PM', hour24: 12 });

    // 01 PM - 11 PM
    for (let i = 1; i <= 11; i++) {
      hours.push({
        display: `${String(i).padStart(2, '0')} PM`,
        hour24: i + 12
      });
    }

    return hours;
  };

  // Generate minute options (00-59)
  const generateMinuteOptions = () => {
    const minutes = [];
    for (let i = 0; i < 60; i++) {
      minutes.push(String(i).padStart(2, '0'));
    }
    return minutes;
  };

  const hourOptions = generateHourOptions();
  const minuteOptions = generateMinuteOptions();

  useEffect(() => {
    // Parse 12-hour format with AM/PM (e.g., "02:30 PM")
    if (value) {
      const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        const hour = match[1].padStart(2, '0');
        const minute = match[2];
        const period = match[3].toUpperCase();
        setSelectedHour(`${hour} ${period}`);
        setSelectedMinute(minute);
      }
    }
  }, [value]);

  // Scroll to selected items on mount
  useEffect(() => {
    if (hourListRef.current && selectedHour) {
      const selectedIndex = hourOptions.findIndex(h => h.display === selectedHour);
      if (selectedIndex !== -1) {
        const listItem = hourListRef.current.children[selectedIndex];
        if (listItem) {
          listItem.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
      }
    }

    if (minuteListRef.current && selectedMinute) {
      const selectedIndex = minuteOptions.findIndex(m => m === selectedMinute);
      if (selectedIndex !== -1) {
        const listItem = minuteListRef.current.children[selectedIndex];
        if (listItem) {
          listItem.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
      }
    }
  }, []);

  // Close picker when scrolling anywhere in the page (except inside the picker itself)
  useEffect(() => {
    const handleScroll = (event) => {
      // Don't close if scrolling inside the picker's lists
      if (hourListRef.current?.contains(event.target) ||
          minuteListRef.current?.contains(event.target)) {
        return;
      }
      onClose();
    };

    // Listen to scroll events on window and any scrollable containers
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose]);

  const handleHourSelect = (hourOption) => {
    setSelectedHour(hourOption.display);
  };

  const handleMinuteSelect = (minute) => {
    setSelectedMinute(minute);
  };

  const handleConfirm = () => {
    const selectedHourObj = hourOptions.find(h => h.display === selectedHour);
    if (selectedHourObj) {
      // Return 12-hour format with AM/PM (e.g., "02:30 PM")
      const [hour, period] = selectedHour.split(' ');
      const finalTime = `${hour}:${selectedMinute} ${period}`;
      onChange(finalTime);
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // Calculate position based on anchor element
  const getPosition = () => {
    if (!anchorEl) return { top: 100, left: 100 };

    const rect = anchorEl.getBoundingClientRect();
    return {
      top: rect.bottom + 4, // 4px gap below the input
      left: rect.left
    };
  };

  const position = getPosition();

  return (
    <ClickAwayListener onClickAway={onClose}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed', // Changed from 'absolute' to 'fixed' for better positioning
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: 220,
          maxHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1300,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
          {/* Hour Column */}
          <List
            ref={hourListRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 0,
              maxHeight: 320,
              '&::-webkit-scrollbar': {
                width: 6,
              },
              '&::-webkit-scrollbar-track': {
                background: '#f5f5f5',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c0c0c0',
                borderRadius: 3,
                '&:hover': {
                  background: '#909090',
                },
              },
            }}
          >
            {hourOptions.map((hourOption) => (
              <ListItemButton
                key={hourOption.display}
                selected={selectedHour === hourOption.display}
                onClick={() => handleHourSelect(hourOption)}
                sx={{
                  py: 1,
                  px: 1.5,
                  justifyContent: 'center',
                  fontSize: '13px',
                  minHeight: 36,
                  '&.Mui-selected': {
                    backgroundColor: '#6610f2',
                    color: 'white',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#5a0edb',
                    },
                  },
                }}
              >
                {hourOption.display}
              </ListItemButton>
            ))}
          </List>

          {/* Minute Column */}
          <List
            ref={minuteListRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 0,
              maxHeight: 320,
              '&::-webkit-scrollbar': {
                width: 6,
              },
              '&::-webkit-scrollbar-track': {
                background: '#f5f5f5',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c0c0c0',
                borderRadius: 3,
                '&:hover': {
                  background: '#909090',
                },
              },
            }}
          >
            {minuteOptions.map((minute) => (
              <ListItemButton
                key={minute}
                selected={selectedMinute === minute}
                onClick={() => handleMinuteSelect(minute)}
                sx={{
                  py: 1,
                  px: 1.5,
                  justifyContent: 'center',
                  fontSize: '13px',
                  minHeight: 36,
                  '&.Mui-selected': {
                    backgroundColor: '#6610f2',
                    color: 'white',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#5a0edb',
                    },
                  },
                }}
              >
                {minute}
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            p: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: '#fafafa',
          }}
        >
          <Button
            size="small"
            onClick={handleCancel}
            sx={{
              textTransform: 'lowercase',
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            cancel
          </Button>
          <Button
            size="small"
            onClick={handleConfirm}
            sx={{
              textTransform: 'lowercase',
              color: '#6610f2',
              fontWeight: 600,
            }}
          >
            confirmar
          </Button>
        </Box>
      </Paper>
    </ClickAwayListener>
  );
};

export default TimePickerMUI;
