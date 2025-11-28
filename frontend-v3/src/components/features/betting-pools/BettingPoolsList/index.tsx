import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Typography,
  InputAdornment,
  Toolbar,
  Tooltip,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material'
import {
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useBettingPools, useZones } from '@/hooks/useBettingPools'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { BettingPoolListDto } from '@/types/bettingPool'

/**
 * Betting Pools List Component
 * Modern Material-UI table with search, filters, sorting, and pagination
 */
const BettingPoolsList: React.FC = () => {
  const navigate = useNavigate()

  // Filters state
  const [searchText, setSearchText] = useState('')
  const [selectedZones, setSelectedZones] = useState<string[]>(['all'])

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Sorting state
  const [orderBy, setOrderBy] = useState<keyof BettingPoolListDto>('bettingPoolCode')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  // Debounced search text
  const debouncedSearch = useDebouncedValue(searchText, 300)

  // Fetch betting pools - load all for client-side filtering
  const { data: bettingPoolsData, isLoading, error, refetch } = useBettingPools({
    pageSize: 1000, // Load all
  })

  // Fetch zones
  const { data: zonesData } = useZones()

  // Extract data from React Query response
  const allBettingPools = bettingPoolsData?.data || []
  const zones = zonesData?.data || []

  // Get unique zones from betting pools
  const availableZones = useMemo(() => {
    const uniqueZones = [...new Set(allBettingPools.map((b) => b.zoneName || 'Sin zona'))]
    return uniqueZones.sort()
  }, [allBettingPools])

  // Filter betting pools
  const filteredBettingPools = useMemo(() => {
    return allBettingPools.filter((pool) => {
      // Zone filter
      const matchesZone =
        selectedZones.includes('all') || selectedZones.includes(pool.zoneName || 'Sin zona')

      // Search filter
      const searchLower = debouncedSearch.toLowerCase()
      const matchesSearch =
        debouncedSearch === '' ||
        pool.bettingPoolCode.toLowerCase().includes(searchLower) ||
        pool.bettingPoolName.toLowerCase().includes(searchLower) ||
        pool.zoneName?.toLowerCase().includes(searchLower) ||
        pool.reference?.toLowerCase().includes(searchLower) ||
        pool.username?.toLowerCase().includes(searchLower)

      return matchesZone && matchesSearch
    })
  }, [allBettingPools, selectedZones, debouncedSearch])

  // Sort betting pools
  const sortedBettingPools = useMemo(() => {
    const sorted = [...filteredBettingPools]

    sorted.sort((a, b) => {
      const aValue = a[orderBy] ?? ''
      const bValue = b[orderBy] ?? ''

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase())
        return order === 'asc' ? comparison : -comparison
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue
      }

      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return order === 'asc'
          ? aValue === bValue
            ? 0
            : aValue
              ? 1
              : -1
          : aValue === bValue
            ? 0
            : aValue
              ? -1
              : 1
      }

      return 0
    })

    return sorted
  }, [filteredBettingPools, orderBy, order])

  // Paginate betting pools
  const paginatedBettingPools = useMemo(() => {
    const start = page * rowsPerPage
    const end = start + rowsPerPage
    return sortedBettingPools.slice(start, end)
  }, [sortedBettingPools, page, rowsPerPage])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
    setPage(0)
  }

  const handleClearSearch = () => {
    setSearchText('')
    setPage(0)
  }

  const handleZoneChange = (event: any) => {
    const value = event.target.value as string[]
    setSelectedZones(value)
    setPage(0)
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleRequestSort = (property: keyof BettingPoolListDto) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleEdit = (bettingPoolId: number) => {
    navigate(`/betting-pools/edit/${bettingPoolId}`)
  }

  const handleCreate = () => {
    navigate('/betting-pools/new')
  }

  const handleToggleActive = async (bettingPoolId: number) => {
    console.log(`Toggle active status for betting pool ${bettingPoolId}`)
    // TODO: Implement API call to update betting pool status
    // await toggleBettingPoolActive(bettingPoolId)
    // refetch()
  }

  const createSortHandler = (property: keyof BettingPoolListDto) => () => {
    handleRequestSort(property)
  }

  // Table columns configuration
  const columns: Array<{
    id: keyof BettingPoolListDto
    label: string
    sortable: boolean
    align?: 'left' | 'right' | 'center'
  }> = [
    { id: 'bettingPoolCode', label: 'Código', sortable: true, align: 'left' },
    { id: 'bettingPoolName', label: 'Nombre', sortable: true, align: 'left' },
    { id: 'reference', label: 'Referencia', sortable: true, align: 'left' },
    { id: 'username', label: 'Usuario', sortable: true, align: 'left' },
    { id: 'zoneName', label: 'Zona', sortable: true, align: 'left' },
    { id: 'isActive', label: 'Activa', sortable: true, align: 'center' },
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" align="center">
            Lista de Bancas
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => refetch()}
                  startIcon={<RefreshIcon />}
                >
                  Reintentar
                </Button>
              }
            >
              {error instanceof Error ? error.message : 'Error al cargar las bancas'}
            </Alert>
          </Box>
        )}

        {/* Toolbar with filters and search */}
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          {/* Zone Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Zonas</InputLabel>
            <Select
              multiple
              value={selectedZones}
              onChange={handleZoneChange}
              input={<OutlinedInput label="Zonas" />}
              renderValue={(selected) => {
                if (selected.includes('all')) {
                  return `${availableZones.length} seleccionadas`
                }
                return `${selected.length} seleccionadas`
              }}
            >
              <MenuItem value="all">
                <Checkbox checked={selectedZones.includes('all')} />
                <ListItemText primary="Todas" />
              </MenuItem>
              {availableZones.map((zone) => (
                <MenuItem key={zone} value={zone}>
                  <Checkbox checked={selectedZones.includes(zone)} />
                  <ListItemText primary={zone} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Search */}
          <TextField
            size="small"
            placeholder="Buscar por código, nombre, zona..."
            value={searchText}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                textTransform: 'none',
              }}
            >
              Nueva Banca
            </Button>
            <Tooltip title="Actualizar">
              <IconButton onClick={() => refetch()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>

        {/* Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align}>
                    {column.sortable ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={createSortHandler(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center">
                    <Box sx={{ p: 3 }}>
                      <CircularProgress size={40} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginatedBettingPools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center">
                    <Box sx={{ p: 3 }}>
                      <Typography color="text.secondary">No se encontraron bancas</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBettingPools.map((pool) => (
                  <TableRow key={pool.bettingPoolId} hover>
                    <TableCell>{pool.bettingPoolCode}</TableCell>
                    <TableCell>{pool.bettingPoolName}</TableCell>
                    <TableCell>{pool.reference || '-'}</TableCell>
                    <TableCell>{pool.username || '-'}</TableCell>
                    <TableCell>{pool.zoneName || 'Sin zona'}</TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={pool.isActive}
                        onChange={() => handleToggleActive(pool.bettingPoolId)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(pool.bettingPoolId)}
                          sx={{ color: '#51cbce' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={sortedBettingPools.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>
    </Box>
  )
}

export default BettingPoolsList
