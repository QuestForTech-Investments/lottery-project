import React, { useState, memo, useCallback } from 'react';
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
  const [tabValue, setTabValue] = useState<number>(0);

  /**
   * Handle tab change
   */
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" align="center">
            Lista de usuarios
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                py: 2,
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
              label="Administradores"
              {...a11yProps(0)}
            />
            <Tab
              icon={<StoreIcon />}
              iconPosition="start"
              label="Bancas"
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
