/**
 * Mock Data - Temporary data while API endpoints are fixed
 * Based on actual database structure
 */

/**
 * Mock Zones Data
 * Structure matches: zones table
 */
export const mockZones = [
  {
    zoneId: 1,
    zoneName: 'Zona Norte',
    name: 'Zona Norte',
    description: 'Zona Norte de operaciones',
    isActive: true
  },
  {
    zoneId: 2,
    zoneName: 'Zona Sur',
    name: 'Zona Sur',
    description: 'Zona Sur de operaciones',
    isActive: true
  },
  {
    zoneId: 3,
    zoneName: 'Zona Este',
    name: 'Zona Este',
    description: 'Zona Este de operaciones',
    isActive: true
  },
  {
    zoneId: 4,
    zoneName: 'Zona Oeste',
    name: 'Zona Oeste',
    description: 'Zona Oeste de operaciones',
    isActive: true
  },
  {
    zoneId: 5,
    zoneName: 'Zona Central',
    name: 'Zona Central',
    description: 'Zona Central de operaciones',
    isActive: true
  }
]

/**
 * Mock Branches Data (Bancas)
 * Structure matches: branches table
 * Each branch belongs to a zone
 */
export const mockBranches = [
  // Zona Norte (zoneId: 1)
  {
    branchId: 1,
    branchName: 'Banca Norte 1',
    name: 'Banca Norte 1',
    branchCode: 'BN001',
    zoneId: 1,
    zoneName: 'Zona Norte',
    bankId: 1,
    address: 'Calle Principal Norte 123',
    phone: '809-555-0101',
    isActive: true
  },
  {
    branchId: 2,
    branchName: 'Banca Norte 2',
    name: 'Banca Norte 2',
    branchCode: 'BN002',
    zoneId: 1,
    zoneName: 'Zona Norte',
    bankId: 1,
    isActive: true
  },
  
  // Zona Sur (zoneId: 2)
  {
    branchId: 3,
    branchName: 'Banca Sur 1',
    name: 'Banca Sur 1',
    branchCode: 'BS001',
    zoneId: 2,
    zoneName: 'Zona Sur',
    bankId: 2,
    isActive: true
  },
  {
    branchId: 4,
    branchName: 'Banca Sur 2',
    name: 'Banca Sur 2',
    branchCode: 'BS002',
    zoneId: 2,
    zoneName: 'Zona Sur',
    bankId: 2,
    isActive: true
  },
  
  // Zona Este (zoneId: 3)
  {
    branchId: 5,
    branchName: 'Banca Este 1',
    name: 'Banca Este 1',
    branchCode: 'BE001',
    zoneId: 3,
    zoneName: 'Zona Este',
    bankId: 3,
    isActive: true
  },
  
  // Zona Oeste (zoneId: 4)
  {
    branchId: 6,
    branchName: 'Banca Oeste 1',
    name: 'Banca Oeste 1',
    branchCode: 'BO001',
    zoneId: 4,
    zoneName: 'Zona Oeste',
    bankId: 4,
    isActive: true
  },
  
  // Zona Central (zoneId: 5)
  {
    branchId: 7,
    branchName: 'Banca Central 1',
    name: 'Banca Central 1',
    branchCode: 'BC001',
    zoneId: 5,
    zoneName: 'Zona Central',
    bankId: 5,
    address: 'Avenida Central 456',
    phone: '809-555-0201',
    isActive: true
  }
]

/**
 * Get branches by zone ID
 * @param {number} zoneId - Zone ID
 * @returns {Array} - Filtered branches
 */
export const getBranchesByZone = (zoneId) => {
  if (!zoneId) return []
  return mockBranches.filter(b => b.zoneId === zoneId && b.isActive)
}

export default {
  mockZones,
  mockBranches,
  getBranchesByZone
}

