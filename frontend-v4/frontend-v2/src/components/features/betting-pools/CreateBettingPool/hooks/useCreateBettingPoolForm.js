import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBettingPool, getNextBettingPoolCode, handleBettingPoolError } from '@/services/bettingPoolService';
import { getAllZones } from '@/services/zoneService';

/**
 * Custom hook for managing create betting pool form state and operations
 * Simplified version focusing on essential fields
 */
const useCreateBettingPoolForm = () => {
  const navigate = useNavigate();

  // Form state - Essential fields only
  const [formData, setFormData] = useState({
    // General - Required fields
    bettingPoolName: '',
    branchCode: '',
    username: '',
    password: '',
    confirmPassword: '',
    location: '',
    reference: '',
    comment: '',
    zoneId: '',

    // Configuration - Basic settings
    commissionRate: '',
    creditLimit: '',
    deactivationBalance: '',
    dailySaleLimit: '',
    dailyBalanceLimit: '',
    temporaryAdditionalBalance: '',

    // Toggles
    isActive: true,
    controlWinningTickets: false,
    allowJackpot: true,
    printEnabled: true,
    printTicketCopy: true,

    // Dropdown settings
    fallType: 'OFF',
    printMode: 'DRIVER',
    discountProvider: 'GRUPO',
    discountMode: 'OFF',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingZones, setLoadingZones] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [zones, setZones] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  /**
   * Load initial data
   */
  useEffect(() => {
    loadInitialData();
  }, []);

  /**
   * Load zones and next bettingPool code
   */
  const loadInitialData = async () => {
    try {
      setLoadingZones(true);

      // Load zones
      const zonesResponse = await getAllZones();
      if (zonesResponse.success && zonesResponse.data) {
        setZones(zonesResponse.data);
      }

      // Get next bettingPool code
      const codeData = await getNextBettingPoolCode();
      if (codeData && codeData.nextCode) {
        setFormData(prev => ({ ...prev, branchCode: codeData.nextCode }));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setErrors({ submit: 'Error cargando datos iniciales' });
    } finally {
      setLoadingZones(false);
    }
  };

  /**
   * Handle form field changes
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Clear field error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Handle zone change
   */
  const handleZoneChange = (zoneId) => {
    setFormData(prev => ({ ...prev, zoneId }));
    if (errors.zoneId) {
      setErrors(prev => ({ ...prev, zoneId: null }));
    }
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.bettingPoolName.trim()) {
      newErrors.bettingPoolName = 'El nombre del betting pool es requerido';
    }

    if (!formData.branchCode.trim()) {
      newErrors.branchCode = 'El código del betting pool es requerido';
    }

    if (!formData.zoneId) {
      newErrors.zoneId = 'Debe seleccionar una zona';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Username required if password provided
    if (formData.password && !formData.username) {
      newErrors.username = 'El usuario es requerido si se proporciona una contraseña';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare data for API
      const bettingPoolData = {
        bettingPoolName: formData.bettingPoolName,
        branchCode: formData.branchCode,
        username: formData.username || null,
        password: formData.password || null,
        location: formData.location || null,
        reference: formData.reference || null,
        comment: formData.comment || null,
        zoneId: parseInt(formData.zoneId),

        // Configuration
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : null,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null,
        deactivationBalance: formData.deactivationBalance ? parseFloat(formData.deactivationBalance) : null,
        dailySaleLimit: formData.dailySaleLimit ? parseFloat(formData.dailySaleLimit) : null,
        dailyBalanceLimit: formData.dailyBalanceLimit ? parseFloat(formData.dailyBalanceLimit) : null,
        temporaryAdditionalBalance: formData.temporaryAdditionalBalance ? parseFloat(formData.temporaryAdditionalBalance) : null,

        // Settings
        fallType: formData.fallType,
        printMode: formData.printMode,
        discountProvider: formData.discountProvider,
        discountMode: formData.discountMode,

        // Toggles
        controlWinningTickets: formData.controlWinningTickets,
        allowJackpot: formData.allowJackpot,
        printEnabled: formData.printEnabled,
        printTicketCopy: formData.printTicketCopy,
      };

      const response = await createBettingPool(bettingPoolData);

      if (response.success) {
        setSuccess(true);

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/bettingPools/list');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating betting pool:', error);
      const errorMessage = handleBettingPoolError(error, 'create betting pool');
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return {
    // Form data
    formData,

    // UI state
    loading,
    loadingZones,
    errors,
    success,
    zones,
    activeTab,

    // Handlers
    handleChange,
    handleZoneChange,
    handleTabChange,
    handleSubmit,
  };
};

export default useCreateBettingPoolForm;
