/**
 * Sales Reports Service
 * Handles all sales report-related API calls
 *
 * ⚠️ NOTA: Este servicio usa datos MOCK temporalmente.
 * Una vez que se implemente el endpoint real en la API (.NET),
 * descomentar la llamada real y eliminar los datos mock.
 * Ver: /docs/API_SALES_REPORTS.md
 */

import api from './api';

/**
 * Get sales report by betting pool and draw
 * @param {Object} params - Filter parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {number[]} params.drawIds - Draw IDs to filter (optional)
 * @param {number[]} params.zoneIds - Zone IDs to filter (optional)
 * @param {number} params.groupId - Group ID to filter (optional)
 * @returns {Promise} - Sales report data
 */
export const getSalesByBettingPoolAndDraw = async (params) => {
  try {
    console.log('📊 getSalesByBettingPoolAndDraw params:', params);

    // ✅ Real API endpoint (implemented 2025-11-26)
    const response = await api.post('/reports/sales/by-betting-pool-draw', params);
    return {
      success: true,
      data: response,
      isMockData: false
    };

    // 🎭 MOCK DATA (archived - uncomment if API is unavailable)
    // console.warn('⚠️ Using MOCK data for sales report. Real endpoint not yet implemented.');
    // await new Promise(resolve => setTimeout(resolve, 500));
    // const mockData = generateMockSalesData(params);
    // return {
    //   success: true,
    //   data: mockData,
    //   isMockData: true
    // };
  } catch (error) {
    console.error('❌ Error getting sales report:', error);
    throw error;
  }
};

/**
 * Generate mock sales data for testing
 * This simulates the expected response from the API
 */
function generateMockSalesData(params) {
  const mockBancas = [
    {
      bettingPoolId: 380,
      bettingPoolName: 'LIDIA (GF)',
      bettingPoolCode: 'LAN-0380',
      zoneId: 1,
      zoneName: 'GRUPO GUYANA (OMAR)',
      totalSold: 8841.40,
      totalPrizes: 5335.00,
      totalCommissions: 1768.28,
      totalNet: 1738.12
    },
    {
      bettingPoolId: 475,
      bettingPoolName: 'LEIDY(GF)',
      bettingPoolCode: 'LAN-0475',
      zoneId: 1,
      zoneName: 'GRUPO GUYANA (OMAR)',
      totalSold: 5745.20,
      totalPrizes: 13687.50,
      totalCommissions: 1149.04,
      totalNet: -9091.34
    },
    {
      bettingPoolId: 464,
      bettingPoolName: 'MONTJOLY (GF)',
      bettingPoolCode: 'LAN-0464',
      zoneId: 1,
      zoneName: 'GRUPO GUYANA (OMAR)',
      totalSold: 488.00,
      totalPrizes: 35.00,
      totalCommissions: 97.60,
      totalNet: 355.40
    },
    {
      bettingPoolId: 493,
      bettingPoolName: 'CARMELIO (GF)',
      bettingPoolCode: 'LAN-0493',
      zoneId: 1,
      zoneName: 'GRUPO GUYANA (OMAR)',
      totalSold: 383.60,
      totalPrizes: 0.00,
      totalCommissions: 76.72,
      totalNet: 306.88
    },
    {
      bettingPoolId: 517,
      bettingPoolName: 'PRUEBA TL',
      bettingPoolCode: 'LAN-0517',
      zoneId: 2,
      zoneName: 'GRUPO ISLA GORDA TL',
      totalSold: 23.00,
      totalPrizes: 0.00,
      totalCommissions: 4.60,
      totalNet: 18.40
    },
    {
      bettingPoolId: 513,
      bettingPoolName: 'KIRSY (GF)',
      bettingPoolCode: 'LAN-0513',
      zoneId: 1,
      zoneName: 'GRUPO GUYANA (OMAR)',
      totalSold: 2220.00,
      totalPrizes: 3190.00,
      totalCommissions: 444.00,
      totalNet: -1414.00
    },
    {
      bettingPoolId: 409,
      bettingPoolName: 'LA NEGRA(GF)',
      bettingPoolCode: 'LAN-0409',
      zoneId: 1,
      zoneName: 'GRUPO GUYANA (OMAR)',
      totalSold: 6731.16,
      totalPrizes: 3940.00,
      totalCommissions: 1346.23,
      totalNet: 1444.93
    },
    {
      bettingPoolId: 488,
      bettingPoolName: 'MAGUI (GF)',
      bettingPoolCode: 'LAN-0488',
      zoneId: 1,
      zoneName: 'GRUPO GUYANA (OMAR)',
      totalSold: 197.00,
      totalPrizes: 0.00,
      totalCommissions: 39.40,
      totalNet: 157.60
    },
    {
      bettingPoolId: 119,
      bettingPoolName: 'EUDDY (GF)',
      bettingPoolCode: 'LAN-0119',
      zoneId: 3,
      zoneName: 'GRUPO GUYANA (DANI)',
      totalSold: 5371.00,
      totalPrizes: 4815.00,
      totalCommissions: 1074.20,
      totalNet: -518.20
    },
    {
      bettingPoolId: 374,
      bettingPoolName: 'ANGELA ÑAÑA (GF)',
      bettingPoolCode: 'LAN-0374',
      zoneId: 1,
      zoneName: 'GRUPO GUYANA (OMAR)',
      totalSold: 2753.00,
      totalPrizes: 1565.00,
      totalCommissions: 550.60,
      totalNet: 637.40
    }
  ];

  // Calculate totals
  const summary = mockBancas.reduce((acc, banca) => ({
    totalSold: acc.totalSold + banca.totalSold,
    totalPrizes: acc.totalPrizes + banca.totalPrizes,
    totalCommissions: acc.totalCommissions + banca.totalCommissions,
    totalNet: acc.totalNet + banca.totalNet
  }), {
    totalSold: 0,
    totalPrizes: 0,
    totalCommissions: 0,
    totalNet: 0
  });

  return {
    startDate: params.startDate,
    endDate: params.endDate,
    totalNet: summary.totalNet,
    bettingPools: mockBancas,
    totalCount: mockBancas.length,
    summary
  };
}

export default {
  getSalesByBettingPoolAndDraw
};
