import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSortition, getLotteries, getGameTypes, handleSortitionError } from '../services/sortitionService';
import { getBranches } from '../services/branchService';
import * as logger from '../utils/logger';
import './CreateSorteo.css';

const CreateSorteo = () => {
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    bettingPoolId: '',
    lotteryId: '',
    gameTypeIds: [],
    specificConfig: '{}'
  });

  // Options state
  const [branches, setBranches] = useState([]);
  const [lotteries, setLotteries] = useState([]);
  const [gameTypes, setGameTypes] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Load initial data (branches, lotteries, game types)
   */
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);

        // Load branches
        const branchesResponse = await getBranches({ page: 1, pageSize: 1000, isActive: true });
        if (branchesResponse.data) {
          setBranches(branchesResponse.data);
        }

        // Load lotteries
        const lotteriesResponse = await getLotteries();
        if (lotteriesResponse.success && lotteriesResponse.data) {
          setLotteries(lotteriesResponse.data);
        }

        // Load game types
        const gameTypesResponse = await getGameTypes();
        if (gameTypesResponse.success && gameTypesResponse.data) {
          setGameTypes(gameTypesResponse.data);
        }

        setLoadingData(false);
      } catch (err) {
        logger.error('CREATE_SORTEO', 'Error cargando datos iniciales', { error: err.message });
        setError('Error cargando datos iniciales: ' + err.message);
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Handle game type checkbox toggle
   */
  const handleGameTypeToggle = (gameTypeId) => {
    setFormData(prev => {
      const currentIds = prev.gameTypeIds;
      const isSelected = currentIds.includes(gameTypeId);

      return {
        ...prev,
        gameTypeIds: isSelected
          ? currentIds.filter(id => id !== gameTypeId)
          : [...currentIds, gameTypeId]
      };
    });

    // Clear validation error for gameTypeIds
    if (validationErrors.gameTypeIds) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.gameTypeIds;
        return newErrors;
      });
    }
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.bettingPoolId) {
      errors.bettingPoolId = 'Debe seleccionar una banca';
    }

    if (!formData.lotteryId) {
      errors.lotteryId = 'Debe seleccionar una lotería';
    }

    if (formData.gameTypeIds.length === 0) {
      errors.gameTypeIds = 'Debe seleccionar al menos un tipo de juego';
    }

    // Validate JSON if provided
    if (formData.specificConfig && formData.specificConfig.trim() !== '') {
      try {
        JSON.parse(formData.specificConfig);
      } catch (e) {
        errors.specificConfig = 'El JSON de configuración no es válido';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!validateForm()) {
      setError('Por favor corrija los errores en el formulario');
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API
      const drawData = {
        bettingPoolId: parseInt(formData.bettingPoolId),
        lotteryId: parseInt(formData.lotteryId),
        gameTypeIds: formData.gameTypeIds.map(id => parseInt(id)),
        specificConfig: formData.specificConfig && formData.specificConfig.trim() !== ''
          ? JSON.parse(formData.specificConfig)
          : null
      };

      logger.info('CREATE_SORTEO', 'Creando sorteo', drawData);

      const result = await createSortition(drawData);

      if (result.success) {
        setSuccess('Sorteo creado exitosamente');
        logger.success('CREATE_SORTEO', 'Sorteo creado exitosamente', { drawId: result.data?.drawId || result.data?.sortitionId });

        // Reset form
        setTimeout(() => {
          setFormData({
            bettingPoolId: '',
            lotteryId: '',
            gameTypeIds: [],
            specificConfig: '{}'
          });
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      logger.error('CREATE_SORTEO', 'Error creando sorteo', { error: err.message });
      const errorMessage = handleSortitionError(err, 'crear sorteo');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    navigate('/sorteos/lista');
  };

  return (
    <div className="create-sorteo-container">
      <div className="page-title">
        <h1>Crear Sorteo</h1>
      </div>

      {loadingData ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="sr-only">Cargando datos...</span>
          </div>
          <p className="mt-3">Cargando opciones...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="sorteo-form">
          <div className="card">
            <div className="card-body">
              {/* Banca Selection */}
              <div className="form-group">
                <label className="form-label">
                  Banca <span className="required">*</span>
                </label>
                <select
                  name="bettingPoolId"
                  value={formData.bettingPoolId}
                  onChange={handleInputChange}
                  className={`form-select ${validationErrors.bettingPoolId ? 'error' : ''}`}
                  disabled={loading}
                >
                  <option value="">Seleccione una banca</option>
                  {branches.map((branch) => (
                    <option key={branch.bettingPoolId} value={branch.bettingPoolId}>
                      {branch.bettingPoolName} ({branch.bettingPoolCode})
                    </option>
                  ))}
                </select>
                {validationErrors.bettingPoolId && (
                  <span className="error-message">{validationErrors.bettingPoolId}</span>
                )}
              </div>

              {/* Lottery Selection */}
              <div className="form-group">
                <label className="form-label">
                  Lotería <span className="required">*</span>
                </label>
                <select
                  name="lotteryId"
                  value={formData.lotteryId}
                  onChange={handleInputChange}
                  className={`form-select ${validationErrors.lotteryId ? 'error' : ''}`}
                  disabled={loading}
                >
                  <option value="">Seleccione una lotería</option>
                  {lotteries.map((lottery) => (
                    <option key={lottery.lotteryId} value={lottery.lotteryId}>
                      {lottery.lotteryName}
                    </option>
                  ))}
                </select>
                {validationErrors.lotteryId && (
                  <span className="error-message">{validationErrors.lotteryId}</span>
                )}
              </div>

              {/* Game Types Selection */}
              <div className="form-group">
                <label className="form-label">
                  Tipos de Juegos <span className="required">*</span>
                </label>
                <div className={`game-types-grid ${validationErrors.gameTypeIds ? 'error' : ''}`}>
                  {gameTypes.map((gameType) => (
                    <label key={gameType.gameTypeId} className="game-type-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.gameTypeIds.includes(gameType.gameTypeId)}
                        onChange={() => handleGameTypeToggle(gameType.gameTypeId)}
                        disabled={loading}
                      />
                      <span className="game-type-label">{gameType.gameTypeName}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.gameTypeIds && (
                  <span className="error-message">{validationErrors.gameTypeIds}</span>
                )}
              </div>

              {/* Specific Configuration (JSON) */}
              <div className="form-group">
                <label className="form-label">
                  Configuración Específica (JSON)
                </label>
                <textarea
                  name="specificConfig"
                  value={formData.specificConfig}
                  onChange={handleInputChange}
                  className={`form-textarea ${validationErrors.specificConfig ? 'error' : ''}`}
                  rows="6"
                  placeholder='{"ejemplo": "valor"}'
                  disabled={loading}
                />
                {validationErrors.specificConfig && (
                  <span className="error-message">{validationErrors.specificConfig}</span>
                )}
                <small className="form-text text-muted">
                  Ingrese configuración adicional en formato JSON válido (opcional)
                </small>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateSorteo;
