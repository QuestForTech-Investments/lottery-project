import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@services/api';
import '../assets/css/FormStyles.css';
import '../assets/css/CreateBranchGeneral.css';
import {
  ToggleButtonGroup,
  IPhoneToggle,
  SelectableBadgeGroup,
  COLORS
} from '@components/common/form';

const MassEditBancas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Configuración');

  // Data from API
  const [zones, setZones] = useState([]);
  const [draws, setDraws] = useState([]);
  const [bettingPools, setBettingPools] = useState([]);
  const [betTypes, setBetTypes] = useState([]);
  const [loadingBetTypes, setLoadingBetTypes] = useState(false);
  const [prizesSubTab, setPrizesSubTab] = useState('premios'); // premios, comisiones, comisiones2

  // Form state
  const [formData, setFormData] = useState({
    zoneId: '',
    fallType: null,
    deactivationBalance: '',
    dailySaleLimit: '',
    minutesToCancelTicket: '',
    ticketsToCancelPerDay: '',
    printTicketCopy: 'NO CAMBIAR',
    isActive: 'NO CAMBIAR',
    winningTicketControl: 'NO CAMBIAR',
    useNormalizedPrizes: 'NO CAMBIAR',
    allowPassingPlays: 'NO CAMBIAR',
    canChangePassword: 'NO CAMBIAR',
    updateGeneralValues: false,
    language: null,
    printMode: null,
    discountProvider: null,
    discountMode: null,
    // Footers tab
    autoFooter: false,
    footer1: '',
    footer2: '',
    footer3: '',
    footer4: '',
  });

  // Selection state
  const [selectedDraws, setSelectedDraws] = useState([]);
  const [selectedBettingPools, setSelectedBettingPools] = useState([]);
  const [selectedZones, setSelectedZones] = useState([]);

  const tabs = ['Configuración', 'Pies de página', 'Premios & Comisiones', 'Sorteos'];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [zonesData, drawsData, poolsData] = await Promise.all([
        api.get('/zones'),
        api.get('/draws'),
        api.get('/betting-pools')
      ]);
      setZones(zonesData?.items || zonesData || []);
      setDraws(drawsData?.items || drawsData || []);
      setBettingPools(poolsData?.items || poolsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDrawToggle = (drawId) => {
    setSelectedDraws(prev =>
      prev.includes(drawId)
        ? prev.filter(id => id !== drawId)
        : [...prev, drawId]
    );
  };

  const handlePoolToggle = (poolId) => {
    setSelectedBettingPools(prev =>
      prev.includes(poolId)
        ? prev.filter(id => id !== poolId)
        : [...prev, poolId]
    );
  };

  const handleZoneToggle = (zoneId) => {
    setSelectedZones(prev =>
      prev.includes(zoneId)
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const handleSelectAllDraws = () => {
    if (selectedDraws.length === draws.length) {
      setSelectedDraws([]);
    } else {
      setSelectedDraws(draws.map(d => d.drawId || d.id));
    }
  };

  // Load bet types when Premios & Comisiones tab is activated
  const loadBetTypes = async () => {
    if (betTypes.length > 0) return; // Already loaded
    setLoadingBetTypes(true);
    try {
      const data = await api.get('/bet-types/with-fields');
      // Transform prizeTypes to prizeFields
      const transformed = (data || []).map(bt => ({
        ...bt,
        prizeFields: bt.prizeTypes || []
      }));
      setBetTypes(transformed);
    } catch (error) {
      console.error('Error loading bet types:', error);
    } finally {
      setLoadingBetTypes(false);
    }
  };

  // Handle prize field change
  const handlePrizeFieldChange = (betTypeCode, fieldCode, value) => {
    const key = `prize_${betTypeCode}_${fieldCode}`;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCommissionChange = (betTypeCode, value) => {
    const key = `commission_${betTypeCode}`;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleGeneralCommissionChange = (value) => {
    setFormData(prev => ({ ...prev, generalCommission: value }));
  };

  const handleCommissionTypeChange = (value) => {
    setFormData(prev => ({ ...prev, commissionType: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedBettingPools.length === 0) {
      alert('Debe seleccionar al menos una banca');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        bettingPoolIds: selectedBettingPools,
        drawIds: selectedDraws,
        zoneIds: selectedZones,
        configuration: formData
      };
      await api.patch('/betting-pools/mass-update', payload);
      alert('Bancas actualizadas exitosamente');
    } catch (error) {
      console.error('Error updating:', error);
      alert('Error al actualizar las bancas');
    } finally {
      setSaving(false);
    }
  };

  // Normalize data for SelectableBadgeGroup
  const normalizedDraws = draws.map(d => ({
    id: d.drawId || d.id,
    name: d.drawName || d.name
  }));

  const normalizedPools = bettingPools.map(p => ({
    id: p.bettingPoolId || p.id,
    name: p.bettingPoolName || p.name || `Pool ${p.bettingPoolId || p.id}`
  }));

  const normalizedZones = zones.map(z => ({
    id: z.zoneId || z.id,
    name: z.zoneName || z.name
  }));

  if (loading) {
    return (
      <div className="create-branch-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>Cargando...</div>
      </div>
    );
  }

  return (
    <div className="create-branch-container">
      <div className="page-title">
        <h1>Actualizar banca</h1>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab}
            type="button"
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="branch-form">
        <form onSubmit={handleSubmit}>
          {activeTab === 'Configuración' && (
            <div className="form-tab-container" style={{ maxWidth: '100%' }}>
              {/* SECTION 1: Full width fields */}
              <div style={{ marginBottom: '20px' }}>
                {/* Zona */}
                <div className="form-group">
                  <label className="form-label">Zona</label>
                  <select
                    className="form-control form-select"
                    style={{ maxWidth: '400px', fontSize: '14px' }}
                    value={formData.zoneId}
                    onChange={(e) => handleInputChange('zoneId', e.target.value)}
                  >
                    <option value="">Seleccione</option>
                    {zones.map(zone => (
                      <option key={zone.zoneId || zone.id} value={zone.zoneId || zone.id}>
                        {zone.zoneName || zone.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de caída - Full width for all 6 buttons */}
                <ToggleButtonGroup
                  label="Tipo de caída"
                  options={['OFF', 'COBRO', 'DIARIA', 'MENSUAL', 'SEMANAL CON ACUMULADO', 'SEMANAL SIN ACUMULADO']}
                  value={formData.fallType}
                  onChange={(val) => handleInputChange('fallType', val)}
                  allowDeselect={true}
                />

                {/* Balance de desactivación */}
                <div className="form-group">
                  <label className="form-label">Balance de desactivación</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: '300px', fontSize: '14px' }}
                    value={formData.deactivationBalance}
                    onChange={(e) => handleInputChange('deactivationBalance', e.target.value)}
                    placeholder="Balance de desactivación"
                  />
                </div>

                {/* Límite de venta diaria */}
                <div className="form-group">
                  <label className="form-label">Límite de venta diaria</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: '300px', fontSize: '14px' }}
                    value={formData.dailySaleLimit}
                    onChange={(e) => handleInputChange('dailySaleLimit', e.target.value)}
                    placeholder="Límite de venta diaria"
                  />
                </div>
              </div>

              {/* SECTION 2: Two columns side by side */}
              <div style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
                {/* Left Column */}
                <div style={{ flex: '1' }}>
                  <ToggleButtonGroup
                    label="Imprimir copia de ticket"
                    value={formData.printTicketCopy}
                    onChange={(val) => handleInputChange('printTicketCopy', val)}
                  />

                  <ToggleButtonGroup
                    label="Activa"
                    value={formData.isActive}
                    onChange={(val) => handleInputChange('isActive', val)}
                  />

                  <ToggleButtonGroup
                    label="Control de tickets ganadores"
                    value={formData.winningTicketControl}
                    onChange={(val) => handleInputChange('winningTicketControl', val)}
                  />

                  <ToggleButtonGroup
                    label="Usar premios normalizados"
                    value={formData.useNormalizedPrizes}
                    onChange={(val) => handleInputChange('useNormalizedPrizes', val)}
                  />

                  <ToggleButtonGroup
                    label="Permitir pasar bote"
                    value={formData.allowPassingPlays}
                    onChange={(val) => handleInputChange('allowPassingPlays', val)}
                  />

                  <div className="form-group">
                    <label className="form-label">Minutos para cancelar tickets</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ maxWidth: '200px', fontSize: '14px' }}
                      value={formData.minutesToCancelTicket}
                      onChange={(e) => handleInputChange('minutesToCancelTicket', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tickets a cancelar por día</label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ maxWidth: '200px', fontSize: '14px' }}
                      value={formData.ticketsToCancelPerDay}
                      onChange={(e) => handleInputChange('ticketsToCancelPerDay', e.target.value)}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div style={{ flex: '1' }}>
                  <ToggleButtonGroup
                    label="Idioma"
                    options={['ESPAÑOL', 'INGLÉS']}
                    value={formData.language}
                    onChange={(val) => handleInputChange('language', val)}
                    allowDeselect={true}
                  />

                  <ToggleButtonGroup
                    label="Modo de impresión"
                    options={['DRIVER', 'GENÉRICO']}
                    value={formData.printMode}
                    onChange={(val) => handleInputChange('printMode', val)}
                    allowDeselect={true}
                  />

                  <ToggleButtonGroup
                    label="Proveedor de descuento"
                    options={['GRUPO', 'RIFERO']}
                    value={formData.discountProvider}
                    onChange={(val) => handleInputChange('discountProvider', val)}
                    allowDeselect={true}
                  />

                  <ToggleButtonGroup
                    label="Modo de descuento"
                    options={['OFF', 'EFECTIVO', 'TICKET GRATIS']}
                    value={formData.discountMode}
                    onChange={(val) => handleInputChange('discountMode', val)}
                    allowDeselect={true}
                  />

                  <ToggleButtonGroup
                    label="Permitir cambiar contraseña"
                    value={formData.canChangePassword}
                    onChange={(val) => handleInputChange('canChangePassword', val)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Pies de página' && (
            <div className="form-tab-container" style={{ maxWidth: '600px' }}>
              {/* Pie de página automático */}
              <div className="form-group">
                <label className="form-label">Pie de página automático</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IPhoneToggle
                    value={formData.autoFooter}
                    onChange={(val) => handleInputChange('autoFooter', val)}
                    showLabel={false}
                  />
                </div>
              </div>

              {/* Primer pie de página */}
              <div className="form-group">
                <label className="form-label">Primer pie de página</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '14px' }}
                  value={formData.footer1}
                  onChange={(e) => handleInputChange('footer1', e.target.value)}
                  placeholder="Texto del primer pie de página"
                />
              </div>

              {/* Segundo pie de página */}
              <div className="form-group">
                <label className="form-label">Segundo pie de página</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '14px' }}
                  value={formData.footer2}
                  onChange={(e) => handleInputChange('footer2', e.target.value)}
                  placeholder="Texto del segundo pie de página"
                />
              </div>

              {/* Tercer pie de página */}
              <div className="form-group">
                <label className="form-label">Tercer pie de página</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '14px' }}
                  value={formData.footer3}
                  onChange={(e) => handleInputChange('footer3', e.target.value)}
                  placeholder="Texto del tercer pie de página"
                />
              </div>

              {/* Cuarto pie de página */}
              <div className="form-group">
                <label className="form-label">Cuarto pie de página</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '14px' }}
                  value={formData.footer4}
                  onChange={(e) => handleInputChange('footer4', e.target.value)}
                  placeholder="Texto del cuarto pie de página"
                />
              </div>
            </div>
          )}

          {activeTab === 'Premios & Comisiones' && (
            <div className="form-tab-container" style={{ padding: '20px' }}>
              {/* Load bet types when tab is activated */}
              {betTypes.length === 0 && !loadingBetTypes && loadBetTypes()}

              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${prizesSubTab === 'premios' ? 'btn-info' : 'btn-outline-secondary'}`}
                  onClick={() => setPrizesSubTab('premios')}
                >
                  Premios
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${prizesSubTab === 'comisiones' ? 'btn-info' : 'btn-outline-secondary'}`}
                  onClick={() => setPrizesSubTab('comisiones')}
                >
                  Comisiones
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${prizesSubTab === 'comisiones2' ? 'btn-info' : 'btn-outline-secondary'}`}
                  onClick={() => setPrizesSubTab('comisiones2')}
                >
                  Comisiones 2
                </button>
              </div>

              {loadingBetTypes ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  Cargando tipos de apuesta...
                </div>
              ) : (
                <>
                  {/* Premios Sub-tab */}
                  {prizesSubTab === 'premios' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                      {betTypes.map(betType => (
                        <div key={betType.betTypeId} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#fafafa' }}>
                          <h6 style={{ color: '#51cbce', fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' }}>
                            {betType.betTypeName}
                          </h6>
                          {(betType.prizeFields || []).map(field => {
                            const fieldKey = `prize_${betType.betTypeCode}_${field.fieldCode}`;
                            return (
                              <div key={field.prizeTypeId} style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                                  {field.fieldName}
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  style={{ fontSize: '13px', height: '30px' }}
                                  value={formData[fieldKey] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    // Only allow numbers and decimal point
                                    if (val === '' || /^[\d.]*$/.test(val)) {
                                      handlePrizeFieldChange(betType.betTypeCode, field.fieldCode, val);
                                    }
                                  }}
                                  placeholder={field.defaultMultiplier?.toString() || ''}
                                />
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comisiones Sub-tab */}
                  {prizesSubTab === 'comisiones' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* General Commission */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '12px', borderBottom: '1px solid #ddd' }}>
                        <label style={{ minWidth: '200px', fontSize: '13px', fontWeight: '500', color: '#555' }}>
                          General
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          style={{ maxWidth: '150px', fontSize: '13px', height: '32px' }}
                          value={formData.generalCommission || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^[\d.]*$/.test(val)) {
                              handleGeneralCommissionChange(val);
                            }
                          }}
                          placeholder="0"
                        />
                      </div>
                      {/* Per Bet Type Commissions */}
                      {loadingBetTypes ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                          <span className="spinner-border spinner-border-sm" role="status" />
                          <span style={{ marginLeft: '10px' }}>Cargando tipos de apuesta...</span>
                        </div>
                      ) : (
                        betTypes.map(betType => (
                          <div key={betType.betTypeId} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <label style={{ minWidth: '200px', fontSize: '13px', fontWeight: '500', color: '#555' }}>
                              {betType.betTypeName}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              style={{ maxWidth: '150px', fontSize: '13px', height: '32px' }}
                              value={formData[`commission_${betType.betTypeCode}`] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || /^[\d.]*$/.test(val)) {
                                  handleCommissionChange(betType.betTypeCode, val);
                                }
                              }}
                              placeholder="0"
                            />
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Comisiones 2 Sub-tab */}
                  {prizesSubTab === 'comisiones2' && (
                    <div style={{ padding: '10px 0' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '15px', color: '#555' }}>
                        Tipo de comisión
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                          <input
                            type="radio"
                            name="commissionType"
                            value="general"
                            checked={formData.commissionType === 'general'}
                            onChange={(e) => handleCommissionTypeChange(e.target.value)}
                            style={{ width: '16px', height: '16px' }}
                          />
                          General
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                          <input
                            type="radio"
                            name="commissionType"
                            value="por_jugada"
                            checked={formData.commissionType === 'por_jugada'}
                            onChange={(e) => handleCommissionTypeChange(e.target.value)}
                            style={{ width: '16px', height: '16px' }}
                          />
                          Por jugada
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'Sorteos' && (
            <div className="form-tab-container" style={{ padding: '20px', color: '#999' }}>
              En desarrollo...
            </div>
          )}

          {/* Sorteos Selection - using SelectableBadgeGroup */}
          <SelectableBadgeGroup
            title="Sorteos"
            items={normalizedDraws}
            selectedIds={selectedDraws}
            onToggle={handleDrawToggle}
            onSelectAll={handleSelectAllDraws}
            maxHeight={200}
          />

          {/* Bancas Selection - using SelectableBadgeGroup */}
          <SelectableBadgeGroup
            title="Bancas"
            items={normalizedPools}
            selectedIds={selectedBettingPools}
            onToggle={handlePoolToggle}
            maxHeight={150}
          />

          {/* Zonas Selection - using SelectableBadgeGroup */}
          <SelectableBadgeGroup
            title="Zonas"
            items={normalizedZones}
            selectedIds={selectedZones}
            onToggle={handleZoneToggle}
            maxHeight={150}
          />

          {/* iPhone-style toggle - aligned left below zonas */}
          <div style={{ marginTop: '15px' }}>
            <IPhoneToggle
              label="Actualizar valores generales"
              value={formData.updateGeneralValues}
              onChange={(val) => handleInputChange('updateGeneralValues', val)}
            />
          </div>

          {/* Submit button - using standard .create-button class */}
          <div className="form-actions">
            <button type="submit" className="create-button" disabled={saving}>
              {saving ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MassEditBancas;
