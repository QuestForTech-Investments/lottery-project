/**
 * CleanPendingPayments Component
 *
 * Refactored component with modular architecture.
 * - Types extracted to ./types.ts
 * - State/logic extracted to ./hooks/useCleanPendingPayments.ts
 * - UI components extracted to ./components/
 */

import React, { useState, memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { useCleanPendingPayments } from './hooks/useCleanPendingPayments';
import {
  BettingPoolsListTab,
  ReportTab,
  CleanPaymentsModal
} from './components';

const CleanPendingPayments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const {
    loading,
    error,
    bettingPools,
    searchTerm,
    orderBy,
    order,
    filteredAndSortedData,
    setSearchTerm,
    handleSort,
    reportStartDate,
    reportEndDate,
    reportBancaId,
    reportData,
    reportSearchTerm,
    reportOrderBy,
    reportOrder,
    loadingReport,
    filteredAndSortedReportData,
    reportTotals,
    setReportStartDate,
    setReportEndDate,
    setReportBancaId,
    setReportSearchTerm,
    handleReportSort,
    handleSearchReport,
    modalOpen,
    selectedPool,
    cleanDate,
    cleanSummary,
    cleaning,
    setCleanDate,
    handleOpenModal,
    handleCloseModal,
    handleCleanPayments,
    loadBettingPools,
  } = useCleanPendingPayments();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography color="error" variant="h6">
              Error: {error}
            </Typography>
            <Button onClick={loadBettingPools} sx={{ mt: 2 }}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label="Lista" />
            <Tab label="Reporte" />
          </Tabs>

          {activeTab === 0 && (
            <BettingPoolsListTab
              filteredData={filteredAndSortedData}
              totalCount={bettingPools.length}
              searchTerm={searchTerm}
              orderBy={orderBy}
              order={order}
              onSearchChange={setSearchTerm}
              onSort={handleSort}
              onOpenModal={handleOpenModal}
            />
          )}

          {activeTab === 1 && (
            <ReportTab
              bettingPools={bettingPools}
              startDate={reportStartDate}
              endDate={reportEndDate}
              bancaId={reportBancaId}
              searchTerm={reportSearchTerm}
              orderBy={reportOrderBy}
              order={reportOrder}
              loading={loadingReport}
              filteredData={filteredAndSortedReportData}
              totalCount={reportData.length}
              totals={reportTotals}
              onStartDateChange={setReportStartDate}
              onEndDateChange={setReportEndDate}
              onBancaIdChange={setReportBancaId}
              onSearchTermChange={setReportSearchTerm}
              onSort={handleReportSort}
              onSearch={handleSearchReport}
            />
          )}
        </CardContent>
      </Card>

      <CleanPaymentsModal
        open={modalOpen}
        selectedPool={selectedPool}
        cleanDate={cleanDate}
        cleanSummary={cleanSummary}
        cleaning={cleaning}
        onDateChange={setCleanDate}
        onClose={handleCloseModal}
        onClean={handleCleanPayments}
      />
    </Box>
  );
};

export default memo(CleanPendingPayments);
