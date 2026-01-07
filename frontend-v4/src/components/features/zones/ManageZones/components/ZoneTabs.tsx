/**
 * ZoneTabs Component
 *
 * Scrollable tabs for zone selection.
 */

import { memo, type FC } from 'react';
import { Box, Tabs, Tab, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import type { ZoneTabsProps } from '../types';
import { TABS_STYLE, NAV_BUTTON_STYLE, SCROLLBAR_CONTAINER_STYLE } from '../constants';

const ZoneTabs: FC<ZoneTabsProps> = memo(({
  zones,
  activeTab,
  tabsContainerRef,
  searchText,
  onTabChange,
  onScrollLeft,
  onScrollRight,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f9fa', position: 'relative' }}>
    <IconButton
      onClick={onScrollLeft}
      sx={{ ...NAV_BUTTON_STYLE, borderRight: 1, borderColor: 'divider' }}
      aria-label="Scroll tabs left"
    >
      <ChevronLeft />
    </IconButton>

    <Box ref={tabsContainerRef} sx={SCROLLBAR_CONTAINER_STYLE}>
      {zones.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', width: '100%' }}>
          <Typography variant="body2">
            No se encontraron zonas que coincidan con "{searchText}"
          </Typography>
        </Box>
      ) : (
        <Tabs
          value={activeTab}
          onChange={onTabChange}
          variant="scrollable"
          scrollButtons={false}
          sx={TABS_STYLE}
        >
          {zones.map((zone) => (
            <Tab key={zone.zoneId} label={zone.zoneName} />
          ))}
        </Tabs>
      )}
    </Box>

    <IconButton
      onClick={onScrollRight}
      sx={{ ...NAV_BUTTON_STYLE, borderLeft: 1, borderColor: 'divider' }}
      aria-label="Scroll tabs right"
    >
      <ChevronRight />
    </IconButton>
  </Box>
));

ZoneTabs.displayName = 'ZoneTabs';

export default ZoneTabs;
