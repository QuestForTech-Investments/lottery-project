import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordModal from './modals/PasswordModal';
import { getBranches, handleBranchError } from '../services/branchService';
import { getAllZones } from '../services/zoneService';

const BancasList = () => {
  const navigate = useNavigate();
  const [selectedZones, setSelectedZones] = useState(['all']);
  const [entriesPerPage, setEntriesPerPage] = useState('20');
  const [quickFilter, setQuickFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMultiselect, setShowMultiselect] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState('');

  // Estados para datos de la API
  const [bancas, setBancas] = useState([]);
  const [zonesMap, setZonesMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInitialData();
  }, []);

  // Función para cargar datos iniciales (zonas y bancas)
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar zonas primero
      const zonesResponse = await getAllZones();

      let zMap = {};
      if (zonesResponse.success && zonesResponse.data) {
        // Crear mapa de zoneId -> zoneName
        zonesResponse.data.forEach(zone => {
          zMap[zone.zoneId] = zone.name;
        });
        setZonesMap(zMap);
      }

      // Luego cargar bancas usando el mapa de zonas
      await loadBancas(zMap);

    } catch (err) {
      const errorMessage = handleBranchError(err, 'cargar datos iniciales');
      setError(errorMessage);
      console.error('Error cargando datos iniciales:', err);
      setIsLoading(false);
    }
  };

  // Función para cargar bancas desde la API
  const loadBancas = async (zoneMap = zonesMap) => {
    try {
      const response = await getBranches({
        page: 1,
        pageSize: 1000 // Cargar todas las bancas
      });

      // Transformar datos de la API al formato del componente
      const transformedBancas = response.items.map(branch => {
        // Extraer solo números del bettingPoolCode, eliminando texto y ceros a la izquierda
        // Ejemplo: "LAN-0001" -> "0001" -> 1
        const numericCode = branch.bettingPoolCode.replace(/\D/g, ''); // Elimina todo excepto dígitos
        const numero = parseInt(numericCode) || 0; // Convierte a entero (elimina ceros a la izquierda)

        return {
          id: branch.bettingPoolId,
          numero: numero,
          nombre: branch.bettingPoolName,
          referencia: branch.reference || '',
          // Convertir username (string) a array para compatibilidad con UI
          usuarios: branch.username ? [branch.username] : [],
          activa: branch.isActive,
          // Usar el zoneName que viene directamente de la API
          zona: branch.zoneName || 'Sin zona',
          balance: 0, // Inicializar en 0 como se solicitó
          caidaAcumulada: 0, // Inicializar en 0 como se solicitó
          prestamos: 0 // Inicializar en 0 como se solicitó
        };
      });

      setBancas(transformedBancas);
      setTotalRecords(response.totalCount || transformedBancas.length);
      setIsLoading(false);

    } catch (err) {
      const errorMessage = handleBranchError(err, 'cargar bancas');
      setError(errorMessage);
      console.error('Error cargando bancas:', err);
      setIsLoading(false);
    }
  };

  // Datos de bancas hardcodeados (respaldo por si falla la API)
  const bancasBackup = [
    { 
      id: 28, 
      numero: 1, 
      nombre: 'LA CENTRAL 01', 
      referencia: 'GILBERTO ISLA GORDA TL', 
      usuarios: ['001'], 
      activa: true, 
      zona: 'GRUPO GILBERTO TL', 
      balance: 238.07, 
      caidaAcumulada: 0, 
      prestamos: 0 
    },
    { 
      id: 37, 
      numero: 10, 
      nombre: 'LA CENTRAL 10', 
      referencia: 'GILBERTO TL', 
      usuarios: ['010'], 
      activa: true, 
      zona: 'GRUPO GILBERTO TL', 
      balance: 4465.77, 
      caidaAcumulada: 0, 
      prestamos: 0 
    },
    { 
      id: 43, 
      numero: 16, 
      nombre: 'LA CENTRAL 16', 
      referencia: 'CHINO TL', 
      usuarios: ['016'], 
      activa: false, 
      zona: 'GRUPO KENDRICK TL', 
      balance: 756.32, 
      caidaAcumulada: null, 
      prestamos: 0 
    },
    { 
      id: 90, 
      numero: 63, 
      nombre: 'LA CENTRAL  63', 
      referencia: 'NELL TL', 
      usuarios: ['063'], 
      activa: false, 
      zona: 'GRUPO KENDRICK TL', 
      balance: 902.16, 
      caidaAcumulada: null, 
      prestamos: 0 
    },
    { 
      id: 133, 
      numero: 101, 
      nombre: 'LA CENTRAL 101', 
      referencia: 'FELO TL', 
      usuarios: ['101'], 
      activa: false, 
      zona: 'GRUPO KENDRICK TL', 
      balance: 1681.16, 
      caidaAcumulada: null, 
      prestamos: 0 
    },
    { 
      id: 153, 
      numero: 119, 
      nombre: 'LA CENTRAL 119', 
      referencia: 'EUDDY (GF)', 
      usuarios: ['119'], 
      activa: true, 
      zona: 'GRUPO GUYANA (DANI)', 
      balance: 455.28, 
      caidaAcumulada: 0, 
      prestamos: 0 
    },
    { 
      id: 169, 
      numero: 135, 
      nombre: 'LA CENTRAL 135', 
      referencia: 'MORENA D (GF)', 
      usuarios: ['135'], 
      activa: true, 
      zona: 'GRUPO GUYANA (DANI)', 
      balance: 498.40, 
      caidaAcumulada: -2458.8, 
      prestamos: 0 
    },
    { 
      id: 184, 
      numero: 150, 
      nombre: 'LA CENTRAL 150', 
      referencia: 'DANNY (GF)', 
      usuarios: ['150'], 
      activa: true, 
      zona: 'GRUPO GUYANA (DANI)', 
      balance: 18.55, 
      caidaAcumulada: 0, 
      prestamos: 0 
    },
    { 
      id: 199, 
      numero: 165, 
      nombre: 'LA CENTRAL 165', 
      referencia: 'MANUELL (GF)', 
      usuarios: ['165'], 
      activa: true, 
      zona: 'GRUPO GUYANA (DANI)', 
      balance: 298.32, 
      caidaAcumulada: -2887.08, 
      prestamos: 0 
    },
    { 
      id: 216, 
      numero: 182, 
      nombre: 'LA CENTRAL182', 
      referencia: 'TONA (GF)', 
      usuarios: ['182'], 
      activa: true, 
      zona: 'GRUPO GUYANA (DANI)', 
      balance: 12.38, 
      caidaAcumulada: 0, 
      prestamos: 0 
    },
    { 
      id: 219, 
      numero: 185, 
      nombre: 'LA CENTRAL 185', 
      referencia: 'JUDELAINE (GF)', 
      usuarios: ['185'], 
      activa: false, 
      zona: 'GUYANA (JUDELAINE)', 
      balance: 747.68, 
      caidaAcumulada: 0, 
      prestamos: 0 
    },
    { 
      id: 228, 
      numero: 194, 
      nombre: 'LA CENTRAL 194', 
      referencia: 'HAITI (GF)', 
      usuarios: ['194'], 
      activa: true, 
      zona: 'GRUPO GUYANA (DANI)', 
      balance: 681.78, 
      caidaAcumulada: 0, 
      prestamos: 0 
    },
    { 
      id: 236, 
      numero: 201, 
      nombre: 'LA CENTRAL 201', 
      referencia: 'CLOTILDE (GF)', 
      usuarios: ['201'], 
      activa: true, 
      zona: 'GRUPO GUYANA (ROSA KOUROU)', 
      balance: 243.31, 
      caidaAcumulada: 0, 
      prestamos: 0 
    },
    { 
      id: 253, 
      numero: 203, 
      nombre: 'LA CENTRAL 203', 
      referencia: 'IVAN (GF)', 
      usuarios: ['203'], 
      activa: true, 
      zona: 'GUYANA (JUDELAINE)', 
      balance: 699.40, 
      caidaAcumulada: -360.4, 
      prestamos: 0 
    },
    { 
      id: 317, 
      numero: 230, 
      nombre: 'LA CENTRAL 230', 
      referencia: 'YAN (GF)', 
      usuarios: ['230'], 
      activa: true, 
      zona: 'GRUPO GUYANA (ROSA KOUROU)', 
      balance: 318.60, 
      caidaAcumulada: 0, 
      prestamos: 0 
    },
    { 
      id: 6848, 
      numero: 254, 
      nombre: 'LA CENTRAL 254', 
      referencia: 'DENIS (GF)', 
      usuarios: ['254'], 
      activa: true, 
      zona: 'GRUPO GUYANA (ROSA KOUROU)', 
      balance: 300.40, 
      caidaAcumulada: 0, 
      prestamos: 0 
    },
    { 
      id: 10967, 
      numero: 264, 
      nombre: 'CARIBBEAN 264', 
      referencia: 'RAFAEL (FR)', 
      usuarios: ['264'], 
      activa: true, 
      zona: 'GRUPO GUYANA (OMAR)', 
      balance: 86.40, 
      caidaAcumulada: 0, 
      prestamos: 0 
    },
    { 
      id: 11084, 
      numero: 269, 
      nombre: 'LA CENTRAL 269', 
      referencia: 'JONATHAN TL', 
      usuarios: ['269'], 
      activa: true, 
      zona: 'GRUPO KENDRICK TL', 
      balance: 1158.36, 
      caidaAcumulada: null, 
      prestamos: 0 
    },
    { 
      id: 11094, 
      numero: 279, 
      nombre: 'CARIBBEAN 279', 
      referencia: 'MIKI(FR)', 
      usuarios: ['279'], 
      activa: true, 
      zona: 'GRUPO GUYANA (OMAR)', 
      balance: 209.60, 
      caidaAcumulada: 0, 
      prestamos: 0 
    },
    { 
      id: 11115, 
      numero: 300, 
      nombre: 'LA CENTRAL 300', 
      referencia: 'NATIVIDAD (GF)', 
      usuarios: ['300'], 
      activa: true, 
      zona: 'GUYANA (JUDELAINE)', 
      balance: 360.64, 
      caidaAcumulada: 0, 
      prestamos: 0 
    }
  ];

  const zonas = [
    'GRUPO GUYANA (JHON)',
    'GRUPO KENDRICK TL',
    'GRUPO GILBERTO TL',
    'GRUPO GUYANA (OMAR)',
    'GRUPO GUYANA (DANI)',
    'GRUPO GUYANA (EL GUARDIA)',
    'GRUPO GUYANA (COGNON)',
    'GRUPO GUYANA (ROSA KOUROU)',
    'GUYANA (JUDELAINE)',
  ];

  const filteredBancas = bancas.filter(banca => 
    banca.numero.toString().includes(quickFilter.toLowerCase()) ||
    banca.nombre.toLowerCase().includes(quickFilter.toLowerCase()) ||
    banca.referencia.toLowerCase().includes(quickFilter.toLowerCase()) ||
    banca.zona.toLowerCase().includes(quickFilter.toLowerCase())
  );

  const itemsPerPage = entriesPerPage === '0' ? filteredBancas.length : parseInt(entriesPerPage);
  const totalPages = Math.ceil(filteredBancas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedBancas = filteredBancas.slice(startIndex, startIndex + itemsPerPage);

  const handleRefresh = () => {
    // Recargar datos completos (zonas y bancas)
    loadInitialData();
  };

  const handleEdit = (bancaId) => {
    // Navegar a la página de edición de la banca
    navigate(`/bancas/editar/${bancaId}`);
  };

  const handleToggleActiva = (bancaId) => {
    // Simular cambio de estado activo/inactivo
    console.log(`Cambiando estado de banca con ID: ${bancaId}`);
    // Aquí se podría hacer una llamada a la API para actualizar el estado
  };

  const handlePassword = (username) => {
    setSelectedUsername(username);
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUsername('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="margin-left-right-auto">
      <div className="card card-task">
        <div className="card-header">
          <h3 className="header text-center">Lista de bancas</h3>
        </div>
        
        <div className="card-body">
          {/* Filtros */}
          <div className="row">
            <div className="col-md-4 col-lg-3 col-xl-2 col-12">
              <div className="form-row form-group">
                <label className="col-12 col-form-label">Zonas</label>
                <div className="col">
                  <div className="multiselect" onClick={() => setShowMultiselect(!showMultiselect)}>
                    <div className="multiselect__select"></div>
                    <div className="multiselect__tags">
                      <span className="multiselect__single">9 seleccionadas</span>
                      <div className="multiselect__spinner" style={{display: 'none'}}></div>
                      <input 
                        name="" 
                        id="" 
                        type="text" 
                        autoComplete="nope" 
                        placeholder="Seleccione" 
                        tabIndex="0" 
                        className="multiselect__input" 
                        style={{width: '0px', position: 'absolute', padding: '0px'}}
                      />
                    </div>
                    {showMultiselect && (
                      <div className="multiselect__content-wrapper" style={{maxHeight: '300px', display: 'block'}}>
                        <ul className="multiselect__content" style={{display: 'inline-block'}}>
                          <li className="multiselect__element">
                            <span className="multiselect__option multiselect__option--group multiselect__option--highlight multiselect__option--group-selected">
                              <span>Todos</span>
                            </span>
                          </li>
                          {zonas.map((zona, index) => (
                            <li key={index} className="multiselect__element">
                              <span className="multiselect__option multiselect__option--selected">
                                <span>{zona}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón Refrescar */}
          <div className="row">
            <div className="col-md-4 col-lg-3 col-xl-2 col-12">
              <button
                type="button"
                className="btn btn-round btn-block btn-info"
                id="get-sales-button"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? 'Cargando...' : 'Refrescar'}
              </button>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="row mt-3">
              <div className="col-12">
                <div className="alert alert-danger" role="alert">
                  <strong>Error:</strong> {error}
                  <button
                    type="button"
                    className="close"
                    onClick={() => setError(null)}
                    aria-label="Cerrar"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Controles de Tabla */}
          <div className="row">
            <div className="col">
              <div className="mt-2">
                <div className="container-fluid">
                  <div className="row">
                    <div className="pr-0 col-4">
                      <div id="betting-pools-table-page-select-wrapper" className="float-left">
                        <div className="form-group">
                          <label htmlFor="pageInput" className="d-block">Entradas por página</label>
                          <div>
                            <select 
                              name="pageInput" 
                              className="custom-select custom-select-sm" 
                              value={entriesPerPage}
                              onChange={(e) => {
                                setEntriesPerPage(e.target.value);
                                setCurrentPage(1);
                              }}
                            >
                              <option value="5">5</option>
                              <option value="10">10</option>
                              <option value="20">20</option>
                              <option value="50">50</option>
                              <option value="100">100</option>
                              <option value="0">Todos</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-8 align-self-center">
                      <div id="betting-pools-table-quick-filter-wrapper" className="float-right">
                        <div className="form-group">
                          <div>
                            <div className="input-group">
                              <input 
                                name="quickFilterInput" 
                                type="text" 
                                placeholder="Filtrado rápido" 
                                className="form-control form-control-sm" 
                                value={quickFilter}
                                onChange={(e) => setQuickFilter(e.target.value)}
                              />
                              <div className="input-group-append">
                                <button
                                  type="button"
                                  className={`btn btn-sm clear-quick-filter btn-info ${!quickFilter ? 'disabled' : ''}`}
                                  disabled={!quickFilter}
                                  onClick={() => setQuickFilter('')}
                                  style={{ height: '31px', padding: '0.25rem 0.5rem' }}
                                >
                                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="backspace" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="svg-inline--fa fa-backspace fa-w-20" style={{ width: '16px', height: '16px' }}>
                                    <path fill="currentColor" d="M576 64H205.26A63.97 63.97 0 0 0 160 82.75L9.37 233.37c-12.5 12.5-12.5 32.76 0 45.25L160 429.25c12 12 28.28 18.75 45.25 18.75H576c35.35 0 64-28.65 64-64V128c0-35.35-28.65-64-64-64zm-84.69 254.06c6.25 6.25 6.25 16.38 0 22.63l-22.62 22.62c-6.25 6.25-16.38 6.25-22.63 0L384 301.25l-62.06 62.06c-6.25 6.25-16.38 6.25-22.63 0l-22.62-22.62c-6.25-6.25-6.25-16.38 0-22.63L338.75 256l-62.06-62.06c-6.25-6.25-6.25-16.38 0-22.63l22.62-22.62c6.25-6.25 16.38-6.25 22.63 0L384 210.75l62.06-62.06c6.25-6.25 16.38-6.25 22.63 0l22.62 22.62c6.25 6.25 6.25 16.38 0 22.63L429.25 256l62.06 62.06z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="table-responsive table-centered">
            <table id="betting-pools-table" role="table" aria-busy={isLoading} aria-colcount="10" className="table b-table table-striped table-hover table-sm">
              <thead role="rowgroup">
                <tr role="row">
                  <th role="columnheader" scope="col" tabIndex="0" aria-colindex="1" aria-label="Click to sort Descending" aria-sort="ascending">Número</th>
                  <th role="columnheader" scope="col" tabIndex="0" aria-colindex="2" aria-label="Click to sort Ascending" aria-sort="none">Nombre</th>
                  <th role="columnheader" scope="col" tabIndex="0" aria-colindex="3" aria-label="Click to sort Ascending" aria-sort="none">Referencia</th>
                  <th role="columnheader" scope="col" tabIndex="0" aria-colindex="4" aria-label="Click to clear sorting">Usuarios</th>
                  <th role="columnheader" scope="col" tabIndex="0" aria-colindex="5" aria-label="Click to clear sorting">Activa</th>
                  <th role="columnheader" scope="col" tabIndex="0" aria-colindex="6" aria-label="Click to sort Ascending" aria-sort="none">Zona</th>
                  <th role="columnheader" scope="col" tabIndex="0" aria-colindex="7" aria-label="Click to sort Ascending" aria-sort="none">Balance</th>
                  <th role="columnheader" scope="col" tabIndex="0" aria-colindex="8" aria-label="Click to sort Ascending" aria-sort="none">Caida acumulada</th>
                  <th role="columnheader" scope="col" tabIndex="0" aria-colindex="9" aria-label="Click to sort Ascending" aria-sort="none">Prestamos</th>
                  <th role="columnheader" scope="col" tabIndex="0" aria-colindex="10" aria-label="Actions: Click to clear sorting" className="nc-icon nc-settings-gear-65"></th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {isLoading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <div className="spinner-border text-info" role="status">
                        <span className="sr-only">Cargando bancas...</span>
                      </div>
                      <p className="mt-2">Cargando bancas...</p>
                    </td>
                  </tr>
                ) : displayedBancas.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <p>No se encontraron bancas.</p>
                    </td>
                  </tr>
                ) : (
                  displayedBancas.map((banca, index) => (
                  <tr key={banca.id} role="row" id={`betting-pools-table__row_${banca.id}`} tabIndex="0" data-pk={banca.id} aria-rowindex={index + 1}>
                    <td role="cell" aria-colindex="1">{banca.numero}</td>
                    <td role="cell" aria-colindex="2">{banca.nombre}</td>
                    <td role="cell" aria-colindex="3">{banca.referencia}</td>
                    <td role="cell" aria-colindex="4">
                      <ul className="text-left mb-0">
                        {banca.usuarios.map((usuario, idx) => (
                          <li key={idx} id={`betting-pool-${banca.id}-user-${usuario}`}>
                            <a 
                              href="#" 
                              className="user-link"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePassword(usuario);
                              }}
                            >
                              {usuario}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td role="cell" aria-colindex="5">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={banca.activa}
                          onChange={() => handleToggleActiva(banca.id)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </td>
                    <td role="cell" aria-colindex="6">{banca.zona}</td>
                    <td role="cell" aria-colindex="7" className="positive-amount">{formatCurrency(banca.balance)}</td>
                    <td role="cell" aria-colindex="8" className={banca.caidaAcumulada < 0 ? 'negative-amount' : 'positive-amount'}>
                      {banca.caidaAcumulada === null ? (
                        <span>-</span>
                      ) : (
                        <div className="text-center p-8">
                          {formatCurrency(banca.caidaAcumulada)}
                        </div>
                      )}
                    </td>
                    <td role="cell" aria-colindex="9">{formatCurrency(banca.prestamos)}</td>
                    <td role="cell" aria-colindex="10">
                      <button 
                        type="button"
                        className="edit-button"
                        onClick={() => handleEdit(banca.id)}
                        title="Editar banca"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="white"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="container-fluid">
            <div className="row flex-row justify-content-between">
              <div>
                Mostrando {filteredBancas.length} de {bancas.length} entradas
              </div>
              <div>
                <ul role="menubar" aria-disabled="false" aria-label="Pagination" className="pagination b-pagination justify-content-end">
                  <li role="presentation" aria-hidden="true" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <span 
                      role="menuitem" 
                      aria-label="Go to first page" 
                      aria-controls="betting-pools-table" 
                      aria-disabled={currentPage === 1} 
                      className="page-link"
                      onClick={() => currentPage > 1 && setCurrentPage(1)}
                    >«</span>
                  </li>
                  <li role="presentation" aria-hidden="true" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <span 
                      role="menuitem" 
                      aria-label="Go to previous page" 
                      aria-controls="betting-pools-table" 
                      aria-disabled={currentPage === 1} 
                      className="page-link"
                      onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                    >‹</span>
                  </li>
                  {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <li key={pageNum} role="presentation" className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                        <a 
                          role="menuitemradio" 
                          aria-controls="betting-pools-table" 
                          aria-label={`Go to page ${pageNum}`} 
                          aria-checked={currentPage === pageNum} 
                          aria-posinset={pageNum} 
                          aria-setsize={totalPages} 
                          tabIndex={currentPage === pageNum ? "0" : "-1"} 
                          target="_self" 
                          href="#" 
                          className="page-link"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                        >{pageNum}</a>
                      </li>
                    );
                  })}
                  {totalPages > 7 && (
                    <>
                      <li role="separator" className="page-item disabled bv-d-xs-down-none">
                        <span className="page-link">…</span>
                      </li>
                      <li role="presentation" className="page-item">
                        <a 
                          role="menuitem" 
                          tabIndex="-1" 
                          aria-label="Go to next page" 
                          aria-controls="betting-pools-table" 
                          target="_self" 
                          href="#" 
                          className="page-link"
                          onClick={(e) => {
                            e.preventDefault();
                            currentPage < totalPages && setCurrentPage(currentPage + 1);
                          }}
                        >›</a>
                      </li>
                      <li role="presentation" className="page-item">
                        <a 
                          role="menuitem" 
                          tabIndex="-1" 
                          aria-label="Go to last page" 
                          aria-controls="betting-pools-table" 
                          target="_self" 
                          href="#" 
                          className="page-link"
                          onClick={(e) => {
                            e.preventDefault();
                            currentPage < totalPages && setCurrentPage(totalPages);
                          }}
                        >»</a>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de contraseña */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        username={selectedUsername}
      />
    </div>
  );
};

export default BancasList;
