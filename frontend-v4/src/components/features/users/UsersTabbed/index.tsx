import React, { useState, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Store as StoreIcon,
} from '@mui/icons-material';

// Import existing components for reuse
import UserAdministratorsContent from './UserAdministratorsContent';
import UserBettingPoolsContent from './UserBettingPoolsContent';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * TabPanel component to show/hide tab content
 */
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`users-tabpanel-${index}`}
      aria-labelledby={`users-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

/**
 * a11y props for tabs
 */
function a11yProps(index: number) {
  return {
    id: `users-tab-${index}`,
    'aria-controls': `users-tabpanel-${index}`,
  };
}

/**
 * UsersTabbedMUI Component
 * Tabbed interface for managing users - Administradores and Bancas
 */
const UsersTabbedMUI: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState<number>(0);

  /**
   * Handle tab change
   */
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" align="center" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
            {t('usersAdmin.listTitle')}
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                py: 2,
                minWidth: { xs: 'auto', sm: 90 },
                px: { xs: 1.25, sm: 2 },
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              },
              '& .Mui-selected': {
                color: '#8b5cf6',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#8b5cf6',
              },
            }}
          >
            <Tab
              icon={<AdminIcon />}
              iconPosition="start"
              label={t('usersAdmin.administrators')}
              {...a11yProps(0)}
            />
            <Tab
              icon={<StoreIcon />}
              iconPosition="start"
              label={t('common.bettingPools')}
              {...a11yProps(1)}
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <UserAdministratorsContent />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <UserBettingPoolsContent />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default memo(UsersTabbedMUI);
