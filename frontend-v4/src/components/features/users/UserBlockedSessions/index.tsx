import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Toolbar,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import useUserBlockedSessions from './hooks/useUserBlockedSessions';

/**
 * UserBlockedSessionsMUI Component
 * Modern Material-UI version of UserBlockedSessions
 */
const UserBlockedSessionsMUI = () => {
  const { t } = useTranslation();
  const {
    currentTabData,
    totalRecords,
    activeTab,
    searchText,
    page,
    rowsPerPage,
    handleTabChange,
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleUnlock,
  } = useUserBlockedSessions();

  const isIPTab = activeTab === 'ip';

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Paper elevation={3}>
        {/* Header */}
        <Toolbar sx={{ pl: { xs: 1.5, sm: 2 }, pr: { xs: 1, sm: 1 }, py: 2 }}>
          <Typography
            sx={{ flex: '1 1 100%', fontSize: { xs: '1rem', sm: '1.25rem' } }}
            variant="h6"
            component="div"
          >
            {t('usersAdmin.blockedSessionsTitle')}
          </Typography>
        </Toolbar>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ '& .MuiTab-root': { minWidth: { xs: 'auto', sm: 90 }, px: { xs: 1.25, sm: 2 } } }}>
            <Tab label={t('usersAdmin.tabByPassword')} value="contrasena" />
            <Tab label={t('usersAdmin.tabByPin')} value="pin" />
            <Tab label={t('usersAdmin.tabIpAddresses')} value="ip" />
          </Tabs>
        </Box>

        {/* Search Filter */}
        <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            placeholder={t('common.filterQuick')}
            value={searchText}
            onChange={handleSearchChange}
            fullWidth
            sx={{ minWidth: { xs: 0, sm: 300 }, maxWidth: { xs: '100%', sm: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Table */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 500, sm: 'auto' } }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>{isIPTab ? t('usersAdmin.ipAddress') : t('usersAdmin.user')}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t('usersAdmin.blockedAt')}</strong>
                </TableCell>
                <TableCell>
                  <strong>
                    {isIPTab ? t('usersAdmin.userDuringBlock') : t('usersAdmin.ipDuringBlock')}
                  </strong>
                </TableCell>
                <TableCell align="center">
                  <strong>{t('usersAdmin.unblockColumn')}</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentTabData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      {t('common.noEntries')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                currentTabData.map((item) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    <TableCell>
                      {isIPTab ? item.ip : item.usuario}
                    </TableCell>
                    <TableCell>{item.bloqueadoEn}</TableCell>
                    <TableCell>
                      {isIPTab ? item.usuario : item.ip}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<LockOpenIcon />}
                        onClick={() => handleUnlock(item)}
                      >
                        {t('usersAdmin.unblock')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {currentTabData.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            component="div"
            count={totalRecords}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t('usersAdmin.entriesPerPage')}
            labelDisplayedRows={({ from, to, count }) =>
              count !== -1
                ? t('usersAdmin.showingFromToOfEntries', { from, to, count })
                : t('usersAdmin.fromToMoreThan', { from, to })
            }
          />
        )}

        {/* Show info even when empty */}
        {currentTabData.length === 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              {t('usersAdmin.showingEmpty')}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default memo(UserBlockedSessionsMUI);
