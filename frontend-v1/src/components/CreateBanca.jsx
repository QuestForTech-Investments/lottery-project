import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createBranch, createBranchWithConfig, getNextBranchCode, saveBranchPrizesCommissions, handleBranchError } from '../services/branchService';
import { getActiveZones } from '../services/zoneService';
import { getPrizeFields, saveBancaPrizeConfig } from '../services/prizeFieldService';
import { saveBettingPoolSchedules, transformSchedulesToApiFormat } from '../services/scheduleService';
import { saveBettingPoolDraws } from '../services/sortitionService';
import * as logger from '../utils/logger';
import TimePicker from './TimePicker';
import GastosAutomaticosTab from './tabs/GastosAutomaticosTab';
import PremiosComisionesTab from './tabs/PremiosComisionesTab';
import LotteryMultiselect from './users/LotteryMultiselect';
import '../assets/css/CreateBranchGeneral.css';
import '../assets/css/FormStyles.css';
import '../assets/css/PremiosComisiones.css';
import '../assets/css/HorariosSorteos.css';
import '../assets/css/Sorteos.css';

const CreateBanca = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('General');
  const [formData, setFormData] = useState({
    // General - Exacto como la aplicación original
      branchName: '',
    branchCode: '',
    username: '',
    location: '', // Ubicación como en la original
    password: '',
    reference: '',
    confirmPassword: '',
    comment: '',
    // Configuración
    selectedZone: '',
    fallType: '1', // 1=Off, 2=Cobro, 3=Diaria, 4=Mensual, 5=Semanal con acumulado, 6=Semanal sin acumulado
    commissionRate: '',
    creditLimit: '',
    deactivationBalance: '',
    dailySaleLimit: '',
    todayBalanceLimit: '',
    enableTemporaryBalance: false,
    temporaryAdditionalBalance: '',
    isActive: true,
    winningTicketsControl: false,
    allowPassPot: true,
    printTickets: true,
    printTicketCopy: true,
    smsOnly: false,
    minutesToCancelTicket: '30',
    ticketsToCancelPerDay: '',
    enableRecharges: true,
    printRechargeReceipt: true,
    allowPasswordChange: true,
    printerType: '1', // 1=Driver, 2=Genérico
    discountProvider: '2', // 1=Grupo, 2=Rifero
    discountMode: '1', // 1=Off, 2=Efectivo, 3=Ticket Gratis
    maximumCancelTicketAmount: '',
    maxTicketAmount: '',
    dailyPhoneRechargeLimit: '',
    limitPreference: null, // 1=Banca, 2=Zona, 3=Grupo, null=Usar preferencia de grupo
    // Pies de página
    autoFooter: false,
    footerText1: '',
    footerText2: '',
    footerText3: '',
    footerText4: '',
    showBranchInfo: true,
    showDateTime: true,
    // Premios & Comisiones - Simplified single object
    prizes: {}, // All prize values stored here with field_code as key
    // Horarios de sorteos - Por día de la semana
    domingoInicio: '12:00 AM',
    domingoFin: '11:59 PM',
    lunesInicio: '12:00 AM',
    lunesFin: '11:59 PM',
    martesInicio: '12:00 AM',
    martesFin: '11:59 PM',
    miercolesInicio: '12:00 AM',
    miercolesFin: '11:59 PM',
    juevesInicio: '12:00 AM',
    juevesFin: '11:59 PM',
    viernesInicio: '12:00 AM',
    viernesFin: '11:59 PM',
    sabadoInicio: '12:00 AM',
    sabadoFin: '11:59 PM',
    // Sorteos (selección de sorteos activos)
    selectedLotteries: [],
    anticipatedClosing: '', // Cierre anticipado en minutos
    anticipatedClosingLotteries: [], // Loterías con cierre anticipado
    // Estilos
    sellScreenStyles: 'estilo1', // Estilo punto de venta
    ticketPrintStyles: 'original', // Estilo de impresión
    // Gastos automáticos
    autoExpenses: []
  });
  // Prize fields metadata for dynamic rendering
  const [prizeFieldsMetadata, setPrizeFieldsMetadata] = useState([]);
  // Ya no necesitamos cargar usuarios desde la API
  const [zones, setZones] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedTemplateFields, setSelectedTemplateFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [nextBranchCode, setNextBranchCode] = useState('LAN-0519');
  const [activeTimePicker, setActiveTimePicker] = useState(null); // null o el nombre del campo activo
  const [timePickerPosition, setTimePickerPosition] = useState({ top: 0, left: 0 });

  const tabs = [
    'General',
    'Configuración', 
    'Pies de página',
    'Premios & Comisiones',
    'Horarios de sorteos',
    'Sorteos',
    'Estilos',
    'Gastos automáticos'
  ];

  const templateFields = [
    'CONFIGURACIÓN',
    'PIES DE PÁGINA', 
    'PREMIOS & COMISIONES',
    'HORARIOS DE SORTEOS',
    'SORTEOS',
    'ESTILOS',
    'REGLAS'
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  // Regenerar código cuando se regresa a la página desde otra ruta
  useEffect(() => {
    const regenerateBranchCode = async () => {
      try {
        const codeData = await getNextBranchCode();
        if (codeData && codeData.nextCode) {
          setNextBranchCode(codeData.nextCode);
          setFormData(prev => ({ ...prev, branchCode: codeData.nextCode }));
          logger.info('CREATE_BANCA', 'Código de banca regenerado al regresar a la página', { newCode: codeData.nextCode });
        }
      } catch (error) {
        logger.error('CREATE_BANCA', 'Error regenerando código de banca', { error: error.message });
      }
    };

    // Solo regenerar si estamos en la ruta de crear banca y no es el montaje inicial
    if (location.pathname === '/create-banca') {
      regenerateBranchCode();
    }
  }, [location.pathname]);

  const resetFormToDefaults = (newBranchCode) => {
    // Build default prizes from metadata
    const defaultPrizes = {};
    prizeFieldsMetadata.forEach(betType => {
      betType.prizeFields?.forEach(field => {
        defaultPrizes[field.fieldCode] = field.defaultMultiplier;
      });
    });

    setFormData({
      // General
      branchName: '',
      branchCode: newBranchCode || '',
      username: '',
      location: '',
      password: '',
      reference: '',
      confirmPassword: '',
      comment: '',
      // Configuración
      selectedZone: '',
      fallType: '1',
      commissionRate: '',
      creditLimit: '',
      deactivationBalance: '',
      dailySaleLimit: '',
      todayBalanceLimit: '',
      enableTemporaryBalance: false,
      temporaryAdditionalBalance: '',
      isActive: true,
      winningTicketsControl: false,
      allowPassPot: true,
      printTickets: true,
      printTicketCopy: true,
      smsOnly: false,
      minutesToCancelTicket: '30',
      ticketsToCancelPerDay: '',
      enableRecharges: true,
      printRechargeReceipt: true,
      allowPasswordChange: true,
      printerType: '1',
      discountProvider: '2',
      discountMode: '1',
      maximumCancelTicketAmount: '',
      maxTicketAmount: '',
      dailyPhoneRechargeLimit: '',
      limitPreference: null,
      // Pies de página
      autoFooter: false,
      footerText1: '',
      footerText2: '',
      footerText3: '',
      footerText4: '',
      showBranchInfo: true,
      showDateTime: true,
      // Premios & Comisiones - Single object with defaults
      prizes: defaultPrizes,
      // Horarios (keeping existing defaults)
      domingoInicio: '12:00 AM',
      domingoFin: '11:59 PM',
      lunesInicio: '12:00 AM',
      lunesFin: '11:59 PM',
      martesInicio: '12:00 AM',
      martesFin: '11:59 PM',
      miercolesInicio: '12:00 AM',
      miercolesFin: '11:59 PM',
      juevesInicio: '12:00 AM',
      juevesFin: '11:59 PM',
      viernesInicio: '12:00 AM',
      viernesFin: '11:59 PM',
      sabadoInicio: '12:00 AM',
      sabadoFin: '11:59 PM',
      // Sorteos
      selectedLotteries: [],
      anticipatedClosing: '',
      anticipatedClosingLotteries: [],
      // Estilos
      sellScreenStyles: 'estilo1',
      ticketPrintStyles: 'original',
      // Gastos automáticos
      autoExpenses: []
    });
    // Resetear errores de validación
    setValidationErrors({});
    // Volver al tab General
    setActiveTab('General');
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Obtener próximo código de banca desde la API
      const codeData = await getNextBranchCode();
      if (codeData && codeData.nextCode) {
        setNextBranchCode(codeData.nextCode);
        setFormData(prev => ({ ...prev, branchCode: codeData.nextCode }));
      }

      // Cargar zonas desde la API
      const zonesResponse = await getActiveZones();
      if (zonesResponse.success && zonesResponse.data) {
        setZones(zonesResponse.data);
      }

      // ========== CARGAR DEFAULTS DE PREMIOS (SIMPLIFICADO) ==========
      try {
        logger.info('CREATE_BANCA', 'Cargando valores default de premios');

        // Obtener prize fields con valores default desde la API
        const prizeFieldsResponse = await getPrizeFields();

        // Store metadata for dynamic rendering
        setPrizeFieldsMetadata(prizeFieldsResponse);

        // Build default prizes object directly from API response
        const defaultPrizes = {};
        prizeFieldsResponse.forEach(betType => {
          betType.prizeFields?.forEach(field => {
            defaultPrizes[field.fieldCode] = field.defaultMultiplier;
          });
        });

        logger.info('CREATE_BANCA', 'Defaults de premios cargados', {
          totalFields: Object.keys(defaultPrizes).length,
          betTypes: prizeFieldsResponse.length
        });

        // Actualizar formData con los valores default de premios
        setFormData(prev => ({
          ...prev,
          prizes: defaultPrizes
        }));

      } catch (premioError) {
        logger.error('CREATE_BANCA', 'Error cargando defaults de premios (no crítico)', {
          error: premioError.message
        });
        console.warn('⚠️ Error cargando valores default de premios:', premioError.message);
        // No fallar la carga por error en premios
      }
      // ========== FIN CARGA DEFAULTS PREMIOS ==========

      // Simular carga de bancas para plantilla
      setBranches([
        { branchId: 1, branchName: 'Banca Central 001' },
        { branchId: 2, branchName: 'Banca Norte 002' },
        { branchId: 3, branchName: 'Banca Sur 003' }
      ]);
    } catch (error) {
      logger.error('CREATE_BANCA', 'Error cargando datos iniciales', { error: error.message });
      setError('Error cargando datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' && name === 'limitPreference' ? null : value)
    }));
  };

  const copyScheduleToAll = (day) => {
    const inicioKey = `${day}Inicio`;
    const finKey = `${day}Fin`;
    const inicio = formData[inicioKey];
    const fin = formData[finKey];

    setFormData(prev => ({
      ...prev,
      domingoInicio: inicio,
      domingoFin: fin,
      lunesInicio: inicio,
      lunesFin: fin,
      martesInicio: inicio,
      martesFin: fin,
      miercolesInicio: inicio,
      miercolesFin: fin,
      juevesInicio: inicio,
      juevesFin: fin,
      viernesInicio: inicio,
      viernesFin: fin,
      sabadoInicio: inicio,
      sabadoFin: fin,
    }));
  };

  const openTimePicker = (fieldName, event) => {
    const rect = event.target.getBoundingClientRect();
    setTimePickerPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setActiveTimePicker(fieldName);
  };

  const handleTemplateFieldToggle = (field) => {
    setSelectedTemplateFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const generateNextBranchCode = (existingBranches) => {
    // Encontrar el último número de banca
    const branchNumbers = existingBranches
      .map(branch => {
        const match = branch.branchCode.match(/LAN-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);
    
    const lastNumber = branchNumbers.length > 0 ? Math.max(...branchNumbers) : 518;
    const nextNumber = lastNumber + 1;
    const nextCode = `LAN-${nextNumber.toString().padStart(4, '0')}`;
    
    setNextBranchCode(nextCode);
    setFormData(prev => ({ ...prev, branchCode: nextCode }));
  };

  const generateNextCodeAfterCreation = () => {
    // Incrementar el código actual para la próxima banca
    const currentMatch = nextBranchCode.match(/LAN-(\d+)/);
    if (currentMatch) {
      const currentNumber = parseInt(currentMatch[1]);
      const nextNumber = currentNumber + 1;
      const newCode = `LAN-${nextNumber.toString().padStart(4, '0')}`;
      setNextBranchCode(newCode);
      return newCode;
    }
    return 'LAN-0520';
  };

  const copyFromTemplate = async () => {
    if (!selectedBranch) {
      setError('Debe seleccionar una banca plantilla');
      return;
    }
    
    if (selectedTemplateFields.length === 0) {
      setError('Debe seleccionar al menos un campo para copiar');
      return;
    }
    
    try {
      setLoading(true);
      // Simular obtención de datos de plantilla
      const templateData = { success: true, data: { branchName: 'Plantilla' } };
      
      if (templateData.success) {
        // Copiar campos seleccionados
        const templateBranch = templateData.data;
        const updatedFormData = { ...formData };
        
        selectedTemplateFields.forEach(field => {
          switch (field) {
            case 'CONFIGURACIÓN':
              updatedFormData.maxDailyAmount = templateBranch.maxDailyAmount || '';
              updatedFormData.maxTicketAmount = templateBranch.maxTicketAmount || '';
              updatedFormData.commissionRate = templateBranch.commissionRate || '';
              break;
            case 'PIES DE PÁGINA':
              updatedFormData.footerText1 = templateBranch.footerText1 || '';
              updatedFormData.footerText2 = templateBranch.footerText2 || '';
              updatedFormData.footerText3 = templateBranch.footerText3 || '';
              break;
            case 'PREMIOS & COMISIONES':
              updatedFormData.directPrize = templateBranch.directPrize || '';
              updatedFormData.palePrize = templateBranch.palePrize || '';
              updatedFormData.tripletaPrize = templateBranch.tripletaPrize || '';
              break;
            case 'ESTILOS':
              updatedFormData.sellScreenStyles = templateBranch.sellScreenStyles || 'estilo1';
              updatedFormData.ticketPrintStyles = templateBranch.ticketPrintStyles || 'original';
              break;
            // Agregar más casos según sea necesario
          }
        });
        
        setFormData(updatedFormData);
        setSuccess(`Configuración copiada desde: ${templateBranch.branchName}`);
      }
    } catch (error) {
      logger.error('CREATE_BANCA', 'Error copiando plantilla', { error: error.message, selectedBranch });
      setError('Error al copiar la configuración de la plantilla');
    } finally {
      setLoading(false);
    }
  };

  // Mapear valores del formulario a valores de la API
  const mapFallType = (value) => {
    const map = { '1': 'OFF', '2': 'COBRO', '3': 'DIARIA', '4': 'MENSUAL', '5': 'SEMANAL CON ACUMULADO', '6': 'SEMANAL SIN ACUMULADO' };
    return map[value] || 'OFF';
  };

  const mapPrintMode = (value) => {
    return value === '1' ? 'DRIVER' : 'GENERICO';
  };

  const mapDiscountProvider = (value) => {
    return value === '1' ? 'GRUPO' : 'RIFERO';
  };

  const mapDiscountMode = (value) => {
    const map = { '1': 'OFF', '2': 'EFECTIVO', '3': 'TICKET_GRATIS' };
    return map[value] || 'OFF';
  };

  const mapPaymentMode = (value) => {
    const map = { '1': 'BANCA', '2': 'ZONA', '3': 'GRUPO', null: 'USAR_PREFERENCIA_GRUPO' };
    return map[value] || 'USAR_PREFERENCIA_GRUPO';
  };

  /**
   * Validate form fields before submission
   * @returns {Object} { isValid: boolean, errors: Object, errorFields: Array }
   */
  const validateForm = () => {
    const errors = {};

    // Validate branchName (required, 1-100 chars)
    if (!formData.branchName?.trim()) {
      errors.branchName = 'El nombre de la banca es requerido';
    } else if (formData.branchName.trim().length > 100) {
      errors.branchName = 'El nombre no puede exceder 100 caracteres';
    }

    // Validate username (required if password is provided)
    if (formData.password && !formData.username?.trim()) {
      errors.username = 'El nombre de usuario es requerido cuando se proporciona una contraseña';
    } else if (formData.username && formData.username.trim().length > 100) {
      errors.username = 'El nombre de usuario no puede exceder 100 caracteres';
    }

    // Validate password (required if username is provided, 6-255 chars)
    if (formData.username && !formData.password) {
      errors.password = 'La contraseña es requerida cuando se proporciona un nombre de usuario';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (formData.password && formData.password.length > 255) {
      errors.password = 'La contraseña no puede exceder 255 caracteres';
    }

    // Validate confirmPassword (must match password)
    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validate location (required, max 255 chars)
    if (!formData.location?.trim()) {
      errors.location = 'La ubicación es requerida';
    } else if (formData.location.trim().length > 255) {
      errors.location = 'La ubicación no puede exceder 255 caracteres';
    }

    // Validate reference (required, max 255 chars)
    if (!formData.reference?.trim()) {
      errors.reference = 'La referencia es requerida';
    } else if (formData.reference.trim().length > 255) {
      errors.reference = 'La referencia no puede exceder 255 caracteres';
    }

    // Validate selectedZone (required, >= 1)
    if (!formData.selectedZone || parseInt(formData.selectedZone) < 1) {
      errors.selectedZone = 'Debe seleccionar una zona válida';
    }

    // Map field names to user-friendly labels
    const fieldNames = {
      branchName: 'Nombre',
      username: 'Nombre de usuario',
      password: 'Contraseña',
      confirmPassword: 'Confirmación de contraseña',
      location: 'Ubicación',
      reference: 'Referencia',
      selectedZone: 'Zona'
    };

    // Build list of error field labels
    const errorFields = Object.keys(errors).map(field => fieldNames[field] || field);

    setValidationErrors(errors);

    // If there are errors, scroll to first error field
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors,
      errorFields: errorFields
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 [CREATE BANCA] handleSubmit iniciado');
    setError('');
    setSuccess('');
    setValidationErrors({});

    // Validate form before submitting
    const validation = validateForm();
    console.log('📋 [CREATE BANCA] Resultado validación:', validation);

    if (!validation.isValid) {
      // Build specific error message listing all fields with errors
      const errorMessage = `Por favor corrija los siguientes campos: ${validation.errorFields.join(', ')}`;
      console.log('❌ [CREATE BANCA] Validación fallida:', errorMessage);
      setError(errorMessage);
      return;
    }

    console.log('✅ [CREATE BANCA] Validación pasada, construyendo payload...');

    try {
      setLoading(true);

      // Construir datos básicos de la banca
      const branchData = {
        branchName: formData.branchName.trim(),
        branchCode: formData.branchCode,
        username: formData.username?.trim() || null,
        password: formData.password || null,
        zoneId: formData.selectedZone ? parseInt(formData.selectedZone) : null,
        bankId: null,
        address: null,
        phone: null,
        location: formData.location?.trim() || null,
        reference: formData.reference?.trim() || null,
        comment: formData.comment?.trim() || null,
        isActive: formData.isActive
      };

      // Construir configuración principal (valores en inglés para el backend)
      const config = {
        fallType: formData.fallType === '1' ? 'OFF' :
                  formData.fallType === '2' ? 'COLLECTION' :
                  formData.fallType === '3' ? 'DAILY' :
                  formData.fallType === '4' ? 'MONTHLY' :
                  formData.fallType === '5' ? 'WEEKLY_WITH_ACCUMULATED' :
                  formData.fallType === '6' ? 'WEEKLY_WITHOUT_ACCUMULATED' : 'OFF',
        deactivationBalance: formData.deactivationBalance ? parseFloat(formData.deactivationBalance) : null,
        dailySaleLimit: formData.dailySaleLimit ? parseFloat(formData.dailySaleLimit) : null,
        dailyBalanceLimit: formData.todayBalanceLimit ? parseFloat(formData.todayBalanceLimit) : null,
        temporaryAdditionalBalance: formData.enableTemporaryBalance && formData.temporaryAdditionalBalance ?
          parseFloat(formData.temporaryAdditionalBalance) : null,
        enableTemporaryBalance: formData.enableTemporaryBalance || false,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
        isActive: formData.isActive,
        controlWinningTickets: formData.winningTicketsControl || false,
        allowJackpot: formData.allowPassPot !== undefined ? formData.allowPassPot : true,
        enableRecharges: formData.enableRecharges !== undefined ? formData.enableRecharges : true,
        allowPasswordChange: formData.allowPasswordChange !== undefined ? formData.allowPasswordChange : true,
        cancelMinutes: formData.minutesToCancelTicket ? parseInt(formData.minutesToCancelTicket) : 30,
        dailyCancelTickets: formData.ticketsToCancelPerDay ? parseInt(formData.ticketsToCancelPerDay) : null,
        maxCancelAmount: formData.maximumCancelTicketAmount ? parseFloat(formData.maximumCancelTicketAmount) : null,
        maxTicketAmount: formData.maxTicketAmount ? parseFloat(formData.maxTicketAmount) : null,
        maxDailyRecharge: formData.dailyPhoneRechargeLimit ? parseFloat(formData.dailyPhoneRechargeLimit) : null,
        paymentMode: formData.limitPreference === '1' ? 'POOL' :
                    formData.limitPreference === '2' ? 'ZONE' :
                    formData.limitPreference === '3' ? 'GROUP' : 'USE_GROUP_PREFERENCE'
      };

      // Construir configuración de descuentos (valores en inglés para el backend)
      const discountConfig = {
        discountProvider: formData.discountProvider === '1' ? 'GROUP' :
                         formData.discountProvider === '2' ? 'SELLER' : 'GROUP',
        discountMode: formData.discountMode === '1' ? 'OFF' :
                     formData.discountMode === '2' ? 'CASH' :
                     formData.discountMode === '3' ? 'FREE_TICKET' : 'OFF'
      };

      // Construir configuración de impresión (valores en inglés para el backend)
      const printConfig = {
        printMode: formData.printerType === '1' ? 'DRIVER' :
                  formData.printerType === '2' ? 'GENERIC' : 'DRIVER',
        printEnabled: formData.printTickets !== undefined ? formData.printTickets : true,
        printTicketCopy: formData.printTicketCopy !== undefined ? formData.printTicketCopy : true,
        printRechargeReceipt: formData.printRechargeReceipt !== undefined ? formData.printRechargeReceipt : true,
        smsOnly: formData.smsOnly || false
      };

      console.log('📦 [CREATE BANCA] Payload a enviar:', {
        branchData,
        config,
        discountConfig,
        printConfig
      });

      // Llamar al nuevo endpoint que guarda banca + configuración
      console.log('🌐 [CREATE BANCA] Llamando a createBranchWithConfig...');
      const result = await createBranchWithConfig(branchData, config, discountConfig, printConfig);
      console.log('✅ [CREATE BANCA] Respuesta recibida:', result);

      // La API devuelve directamente el BettingPoolDetailDto o un objeto con { success, data }
      // Verificar si la respuesta es válida
      const isSuccess = result.success || result.bettingPoolId || result.data?.bettingPoolId;

      if (isSuccess) {
        // Obtener el ID de la banca creada de diferentes estructuras posibles
        const createdBranchId = result.data?.bettingPoolId || result.bettingPoolId || result.data?.branchId || result.branchId;

        logger.info('CREATE_BANCA', 'Banca creada exitosamente', { bettingPoolId: createdBranchId, result });

        // ===== PASO 2: GUARDAR PREMIOS & COMISIONES (SIMPLIFICADO) - SI EXISTEN =====
        try {
          // Check if there are custom prize values
          if (formData.prizes && Object.keys(formData.prizes).length > 0) {
            logger.info('CREATE_BANCA', 'Procesando configuración de premios', {
              fieldsCount: Object.keys(formData.prizes).length
            });

            // Build prize config payload directly from prizes object
            const prizePayload = [];

            // Iterate through prizes and build payload
            for (const [fieldCode, value] of Object.entries(formData.prizes)) {
              // Skip empty values
              if (value === '' || value === null || value === undefined) {
                continue;
              }

              // Find the prize field metadata to get the prizeFieldId
              let prizeFieldId = null;
              for (const betType of prizeFieldsMetadata) {
                const field = betType.prizeFields?.find(f => f.fieldCode === fieldCode);
                if (field) {
                  prizeFieldId = field.prizeFieldId;
                  break;
                }
              }

              if (prizeFieldId) {
                prizePayload.push({
                  prizeFieldId: prizeFieldId,
                  fieldCode: fieldCode,
                  customValue: parseFloat(value)
                });
              }
            }

            if (prizePayload.length > 0) {
              logger.info('CREATE_BANCA', 'Premio payload preparado', {
                premioCount: prizePayload.length
              });

              // Guardar configuración de premios en el backend
              const premioResponse = await saveBancaPrizeConfig(createdBranchId, prizePayload);

              logger.info('CREATE_BANCA', 'Configuración de premios guardada exitosamente', {
                saved: premioResponse.savedCount,
                updated: premioResponse.updatedCount
              });

              console.log('✅ Configuración de premios guardada:', premioResponse.message);
            } else {
              logger.info('CREATE_BANCA', 'No hay valores personalizados, usando defaults');
            }
          } else {
            logger.info('CREATE_BANCA', 'No hay configuración de premios personalizada, usando defaults');
          }
        } catch (premioError) {
          // No fallar la creación de banca si hay error en premios
          logger.error('CREATE_BANCA', 'Error procesando premios (no crítico)', { error: premioError.message });
          console.warn('⚠️ Error guardando configuración de premios:', premioError.message);
        }

        // ===== PASO 3: GUARDAR HORARIOS =====
        try {
          logger.info('CREATE_BANCA', 'Guardando horarios de la banca', {
            bettingPoolId: createdBranchId
          });

          // Transform schedule fields to API format
          const schedules = transformSchedulesToApiFormat(formData);

          // Save schedules
          const scheduleResult = await saveBettingPoolSchedules(createdBranchId, schedules);

          if (scheduleResult.success) {
            logger.info('CREATE_BANCA', 'Horarios guardados exitosamente', {
              bettingPoolId: createdBranchId,
              scheduleCount: scheduleResult.data?.length || 7
            });
            console.log('✅ Horarios guardados exitosamente');
          } else {
            logger.warn('CREATE_BANCA', 'No se pudieron guardar los horarios (no crítico)');
            console.warn('⚠️ No se pudieron guardar los horarios');
          }
        } catch (scheduleError) {
          // No fallar la creación de banca si hay error en horarios
          logger.error('CREATE_BANCA', 'Error procesando horarios (no crítico)', { error: scheduleError.message });
          console.warn('⚠️ Error guardando horarios:', scheduleError.message);
        }

        // ===== PASO 4: GUARDAR DRAWS =====
        try {
          if (formData.selectedLotteries && formData.selectedLotteries.length > 0) {
            logger.info('CREATE_BANCA', 'Guardando draws de la banca', {
              bettingPoolId: createdBranchId,
              lotteriesCount: formData.selectedLotteries.length
            });

            const drawsToSave = [];

            // Build draws array for each selected lottery
            formData.selectedLotteries.forEach(lotteryId => {
              const hasAnticipatedClosing = formData.anticipatedClosingLotteries?.includes(lotteryId);
              drawsToSave.push({
                lotteryId: lotteryId,
                isActive: true,  // Changed from isEnabled
                anticipatedClosingMinutes: hasAnticipatedClosing ? parseInt(formData.anticipatedClosing) || null : null,  // Changed from anticipatedClosing
                enabledGameTypeIds: []
              });
            });

            logger.info('CREATE_BANCA', 'Draws payload preparado', {
              drawsCount: drawsToSave.length,
              withAnticipatedClosing: drawsToSave.filter(s => s.anticipatedClosingMinutes).length
            });

            // Save draws
            const drawsResult = await saveBettingPoolDraws(createdBranchId, drawsToSave);

            if (drawsResult.success) {
              logger.info('CREATE_BANCA', 'Draws guardados exitosamente', {
                savedCount: drawsResult.data?.length || drawsToSave.length
              });
              console.log('✅ Draws guardados exitosamente');
            } else {
              logger.warn('CREATE_BANCA', 'No se pudieron guardar los draws (no crítico)');
              console.warn('⚠️ No se pudieron guardar los draws');
            }
          } else {
            logger.info('CREATE_BANCA', 'No hay loterías seleccionadas, omitiendo draws');
          }
        } catch (drawsError) {
          // No fallar la creación de banca si hay error en draws
          logger.error('CREATE_BANCA', 'Error procesando draws (no crítico)', { error: drawsError.message });
          console.warn('⚠️ Error guardando draws:', drawsError.message);
        }

        setSuccess('Banca creada exitosamente');

        // Obtener nuevo código de la API para la siguiente banca
        try {
          const codeData = await getNextBranchCode();
          if (codeData && codeData.nextCode) {
            setNextBranchCode(codeData.nextCode);
            // Reset form to defaults con el nuevo código
            resetFormToDefaults(codeData.nextCode);
            logger.info('CREATE_BANCA', 'Formulario reseteado con nuevo código', { newCode: codeData.nextCode });
          } else {
            // Si no se pudo obtener nuevo código, solo resetear sin código
            resetFormToDefaults('');
          }
        } catch (codeError) {
          logger.error('CREATE_BANCA', 'Error obteniendo nuevo código después de crear banca', { error: codeError.message });
          resetFormToDefaults('');
        }
      } else {
        // Si llegamos aquí, la respuesta no tiene la estructura esperada
        logger.error('CREATE_BANCA', 'Respuesta inesperada de la API', { result });
        setError(result.message || 'Error creando la banca: respuesta inesperada del servidor');
      }
    } catch (error) {
      logger.error('CREATE_BANCA', 'Error en handleSubmit', { error: error.message, branchName: formData.branchName });
      const errorMessage = handleBranchError(error, 'crear banca');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleLotteryToggle = (lotteryId) => {
    setFormData(prev => ({
      ...prev,
      selectedLotteries: prev.selectedLotteries.includes(lotteryId)
        ? prev.selectedLotteries.filter(id => id !== lotteryId)
        : [...prev.selectedLotteries, lotteryId]
    }));
  };

  const handleToggleAllLotteries = () => {
    // Lista completa de sorteos disponibles
    const allLotteries = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      24, 25, 30, 31, 34, 35, 38, 39, 40, 53, 54, 55, 56, 61, 62, 63, 64, 65, 66,
      73, 74, 75, 76, 82, 83, 211, 244, 245, 277, 376, 377, 411, 412, 541, 542,
      607, 608, 609, 610, 673, 674, 675, 970, 1036, 1168, 1300, 1366, 1432
    ];

    setFormData(prev => ({
      ...prev,
      selectedLotteries: prev.selectedLotteries.length === allLotteries.length
        ? [] // Deseleccionar todos si ya están todos seleccionados
        : allLotteries // Seleccionar todos
    }));
  };

  // Expense management now handled in GastosAutomaticosTab via useExpenses hook

  const renderTabContent = () => {
    if (activeTab === 'General') {
      return (
        <div className="form-tab-container">
          <div className="form-row">
            <div className="form-column">
              {/* Columna izquierda */}
              <div className="form-group">
                <label className="form-label">Nombre <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  placeholder="Nombre"
                  className={`form-input ${validationErrors.branchName ? 'error' : ''}`}
                  style={validationErrors.branchName ? { borderColor: 'red' } : {}}
                />
                {validationErrors.branchName && (
                  <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.branchName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Nombre de usuario <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Ingrese nombre de usuario"
                  className={`form-input ${validationErrors.username ? 'error' : ''}`}
                  style={validationErrors.username ? { borderColor: 'red' } : {}}
                />
                {validationErrors.username && (
                  <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.username}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña <span style={{color: 'red'}}>*</span></label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input ${validationErrors.password ? 'error' : ''}`}
                  style={validationErrors.password ? { borderColor: 'red' } : {}}
                />
                {validationErrors.password && (
                  <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.password}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirmación de contraseña <span style={{color: 'red'}}>*</span></label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
                  style={validationErrors.confirmPassword ? { borderColor: 'red' } : {}}
                />
                {validationErrors.confirmPassword && (
                  <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            <div className="form-column">
              {/* Columna derecha */}
              <div className="form-group">
                <label className="form-label">Número</label>
                <input
                  type="text"
                  name="branchCode"
                  value={formData.branchCode}
                  onChange={handleInputChange}
                  className="form-input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ubicación <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ubicación"
                  className={`form-input ${validationErrors.location ? 'error' : ''}`}
                  style={validationErrors.location ? { borderColor: 'red' } : {}}
                />
                {validationErrors.location && (
                  <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.location}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Referencia <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="Referencia"
                  className={`form-input ${validationErrors.reference ? 'error' : ''}`}
                  style={validationErrors.reference ? { borderColor: 'red' } : {}}
                />
                {validationErrors.reference && (
                  <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.reference}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Comentario</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" data-testid="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'CREANDO...' : 'CREAR'}
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'Configuración') {
      return (
        <div className="form-tab-container">
          <div className="form-row">
            <div className="form-column">
              {/* Columna izquierda */}
              <div className="form-group">
                <label className="form-label">Zona <span style={{color: 'red'}}>*</span></label>
                <select
                  name="selectedZone"
                  value={formData.selectedZone || ''}
                  onChange={handleInputChange}
                  className={`form-select ${validationErrors.selectedZone ? 'error' : ''}`}
                  style={validationErrors.selectedZone ? { borderColor: 'red' } : {}}
                  disabled={loading || zones.length === 0}
                >
                  <option value="">Seleccione</option>
                  {zones.map((zone) => (
                    <option key={zone.zoneId} value={zone.zoneId}>
                      {zone.zoneName}
                    </option>
                  ))}
                </select>
                {validationErrors.selectedZone && (
                  <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.selectedZone}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label form-label-bold">Tipo de caída</label>
                <div className="form-button-group">
                  <label className={`form-radio-button ${formData.fallType === '1' ? 'active' : ''}`}>
                    <input type="radio" name="fallType" value="1" checked={formData.fallType === '1'} onChange={handleInputChange} />
                    OFF
                  </label>
                  <label className={`form-radio-button ${formData.fallType === '2' ? 'active' : ''}`}>
                    <input type="radio" name="fallType" value="2" checked={formData.fallType === '2'} onChange={handleInputChange} />
                    COBRO
                  </label>
                  <label className={`form-radio-button ${formData.fallType === '3' ? 'active' : ''}`}>
                    <input type="radio" name="fallType" value="3" checked={formData.fallType === '3'} onChange={handleInputChange} />
                    DIARIA
                  </label>
                  <label className={`form-radio-button ${formData.fallType === '4' ? 'active' : ''}`}>
                    <input type="radio" name="fallType" value="4" checked={formData.fallType === '4'} onChange={handleInputChange} />
                    MENSUAL
                  </label>
                  <label className={`form-radio-button ${formData.fallType === '5' ? 'active' : ''}`}>
                    <input type="radio" name="fallType" value="5" checked={formData.fallType === '5'} onChange={handleInputChange} />
                    SEMANAL CON ACUMULADO
                  </label>
                  <label className={`form-radio-button ${formData.fallType === '6' ? 'active' : ''}`}>
                    <input type="radio" name="fallType" value="6" checked={formData.fallType === '6'} onChange={handleInputChange} />
                    SEMANAL SIN ACUMULADO
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Balance de desactivación</label>
                <input
                  type="number"
                  name="deactivationBalance"
                  value={formData.deactivationBalance}
                  onChange={handleInputChange}
                  placeholder="Balance de desactivación"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Límite de venta diaria</label>
                <input
                  type="number"
                  name="dailySaleLimit"
                  value={formData.dailySaleLimit}
                  onChange={handleInputChange}
                  placeholder="Límite de venta diaria"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Balance límite al día</label>
                <input
                  type="number"
                  name="todayBalanceLimit"
                  value={formData.todayBalanceLimit}
                  onChange={handleInputChange}
                  placeholder="Balance límite al día"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Habilitar balance temporal adicional</label>
                <div className="form-group">
                  <label className="form-toggle">
                    <input
                      type="checkbox"
                      name="enableTemporaryBalance"
                      checked={formData.enableTemporaryBalance}
                      onChange={handleInputChange}
                    />
                    <span className="form-toggle-slider"></span>
                  </label>
                  {formData.enableTemporaryBalance && (
                    <input
                      type="number"
                      name="temporaryAdditionalBalance"
                      value={formData.temporaryAdditionalBalance}
                      onChange={handleInputChange}
                      placeholder="Valor de balance temporal adicional"
                      className="form-input"
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Activa</label>
                <label className="form-toggle">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span className="form-toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Control de tickets ganadores</label>
                <label className="form-toggle">
                  <input
                    type="checkbox"
                    name="winningTicketsControl"
                    checked={formData.winningTicketsControl}
                    onChange={handleInputChange}
                  />
                  <span className="form-toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Permitir pasar bote</label>
                <label className="form-toggle">
                  <input
                    type="checkbox"
                    name="allowPassPot"
                    checked={formData.allowPassPot}
                    onChange={handleInputChange}
                  />
                  <span className="form-toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Imprimir</label>
                <label className="form-toggle">
                  <input
                    type="checkbox"
                    name="printTickets"
                    checked={formData.printTickets}
                    onChange={handleInputChange}
                  />
                  <span className="form-toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Imprimir copia de ticket</label>
                <label className="form-toggle">
                  <input
                    type="checkbox"
                    name="printTicketCopy"
                    checked={formData.printTicketCopy}
                    onChange={handleInputChange}
                  />
                  <span className="form-toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Sólo SMS</label>
                <label className="form-toggle">
                  <input
                    type="checkbox"
                    name="smsOnly"
                    checked={formData.smsOnly}
                    onChange={handleInputChange}
                  />
                  <span className="form-toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Minutos para cancelar tickets</label>
                <input
                  type="number"
                  name="minutesToCancelTicket"
                  value={formData.minutesToCancelTicket}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-bold">Tickets a cancelar por día</label>
                <input
                  type="number"
                  name="ticketsToCancelPerDay"
                  value={formData.ticketsToCancelPerDay}
                  onChange={handleInputChange}
                  className="form-input form-input-small"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Habilitar recargas</label>
                <label className="form-toggle">
                  <input
                    type="checkbox"
                    name="enableRecharges"
                    checked={formData.enableRecharges}
                    onChange={handleInputChange}
                  />
                  <span className="form-toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Imprimir recibo de recargas</label>
                <label className="form-toggle">
                  <input
                    type="checkbox"
                    name="printRechargeReceipt"
                    checked={formData.printRechargeReceipt}
                    onChange={handleInputChange}
                  />
                  <span className="form-toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Permitir cambiar contraseña</label>
                <label className="form-toggle">
                  <input
                    type="checkbox"
                    name="allowPasswordChange"
                    checked={formData.allowPasswordChange}
                    onChange={handleInputChange}
                  />
                  <span className="form-toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="form-column-offset">
              {/* Columna derecha */}
              <div className="form-group">
                <label className="form-label form-label-bold">Modo de impresión</label>
                <div className="form-button-group">
                  <label className={`form-radio-button ${formData.printerType === '1' ? 'active' : ''}`}>
                    <input type="radio" name="printerType" value="1" checked={formData.printerType === '1'} onChange={handleInputChange} />
                    DRIVER
                  </label>
                  <label className={`form-radio-button ${formData.printerType === '2' ? 'active' : ''}`}>
                    <input type="radio" name="printerType" value="2" checked={formData.printerType === '2'} onChange={handleInputChange} />
                    GENÉRICO
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label form-label-bold">Proveedor de descuento</label>
                <div className="form-button-group">
                  <label className={`form-radio-button ${formData.discountProvider === '1' ? 'active' : ''}`}>
                    <input type="radio" name="discountProvider" value="1" checked={formData.discountProvider === '1'} onChange={handleInputChange} />
                    GRUPO
                  </label>
                  <label className={`form-radio-button ${formData.discountProvider === '2' ? 'active' : ''}`}>
                    <input type="radio" name="discountProvider" value="2" checked={formData.discountProvider === '2'} onChange={handleInputChange} />
                    RIFERO
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label form-label-bold">Modo de descuento</label>
                <div className="form-button-group">
                  <label className={`form-radio-button ${formData.discountMode === '1' ? 'active' : ''}`}>
                    <input type="radio" name="discountMode" value="1" checked={formData.discountMode === '1'} onChange={handleInputChange} />
                    OFF
                  </label>
                  <label className={`form-radio-button ${formData.discountMode === '2' ? 'active' : ''}`}>
                    <input type="radio" name="discountMode" value="2" checked={formData.discountMode === '2'} onChange={handleInputChange} />
                    EFECTIVO
                  </label>
                  <label className={`form-radio-button ${formData.discountMode === '3' ? 'active' : ''}`}>
                    <input type="radio" name="discountMode" value="3" checked={formData.discountMode === '3'} onChange={handleInputChange} />
                    TICKET GRATIS
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Monto máximo para cancelar ticket</label>
                <input
                  type="number"
                  name="maximumCancelTicketAmount"
                  value={formData.maximumCancelTicketAmount}
                  onChange={handleInputChange}
                  placeholder="Monto máximo para cancelar ticket"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monto máximo de tickets</label>
                <input
                  type="number"
                  name="maxTicketAmount"
                  value={formData.maxTicketAmount}
                  onChange={handleInputChange}
                  placeholder="Monto máximo de tickets"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monto máximo diario de recargas</label>
                <input
                  type="number"
                  name="dailyPhoneRechargeLimit"
                  value={formData.dailyPhoneRechargeLimit}
                  onChange={handleInputChange}
                  placeholder="Monto máximo diario de recargas"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-bold">Modo de pago de tickets</label>
                <div className="form-button-group">
                  <label className={`form-radio-button ${formData.limitPreference === '1' ? 'active' : ''}`}>
                    <input type="radio" name="limitPreference" value="1" checked={formData.limitPreference === '1'} onChange={handleInputChange} />
                    BANCA
                  </label>
                  <label className={`form-radio-button ${formData.limitPreference === '3' ? 'active' : ''}`}>
                    <input type="radio" name="limitPreference" value="3" checked={formData.limitPreference === '3'} onChange={handleInputChange} />
                    GRUPO
                  </label>
                  <label className={`form-radio-button ${formData.limitPreference === '2' ? 'active' : ''}`}>
                    <input type="radio" name="limitPreference" value="2" checked={formData.limitPreference === '2'} onChange={handleInputChange} />
                    ZONA
                  </label>
                  <label className={`form-radio-button ${formData.limitPreference === null ? 'active' : ''}`}>
                    <input type="radio" name="limitPreference" value="" checked={formData.limitPreference === null} onChange={handleInputChange} />
                    USAR PREFERENCIA DE GRUPO
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" data-testid="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'CREANDO...' : 'CREAR'}
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'Pies de página') {
      return (
        <div className="form-tab-container">
          <div className="form-row">
            <div className="form-column">
              {/* Pie de página automático - Toggle switch */}
              <div className="form-group">
                <label className="form-label">Pie de página automático</label>
                <label className="form-toggle">
                  <input
                    type="checkbox"
                    name="autoFooter"
                    checked={formData.autoFooter || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoFooter: e.target.checked }))}
                  />
                  <span className="form-toggle-slider"></span>
                </label>
              </div>

              {/* Primer pie de página */}
              <div className="form-group">
                <label className="form-label">Primer pie de página</label>
                <input
                  type="text"
                  name="footerText1"
                  value={formData.footerText1}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              {/* Segundo pie de página */}
              <div className="form-group">
                <label className="form-label">Segundo pie de página</label>
                <input
                  type="text"
                  name="footerText2"
                  value={formData.footerText2}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              {/* Tercer pie de página */}
              <div className="form-group">
                <label className="form-label">Tercer pie de página</label>
                <input
                  type="text"
                  name="footerText3"
                  value={formData.footerText3}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              {/* Cuarto pie de página */}
              <div className="form-group">
                <label className="form-label">Cuarto pie de página</label>
                <input
                  type="text"
                  name="footerText4"
                  value={formData.footerText4 || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" data-testid="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'CREANDO...' : 'CREAR'}
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'Premios & Comisiones') {
      return (
        <PremiosComisionesTab
          formData={formData}
          onChange={handleInputChange}
          error={error}
          success={success}
          prizeFieldsMetadata={prizeFieldsMetadata}
        />
      );
    } else if (activeTab === 'Horarios de sorteos') {
      return (
        <div className="horarios-container">
          <div className="horarios-grid">
            {/* Lunes */}
            <div className="horario-row">
              <label className="horario-label">Lunes</label>
              <div className="horario-inputs">
                <input type="text" name="lunesInicio" value={formData.lunesInicio} readOnly onClick={(e) => openTimePicker('lunesInicio', e)} className="horario-input" placeholder="12:00 AM" />
                <span className="horario-arrow">→</span>
                <input type="text" name="lunesFin" value={formData.lunesFin} readOnly onClick={(e) => openTimePicker('lunesFin', e)} className="horario-input" placeholder="11:59 PM" />
                <button type="button" onClick={() => copyScheduleToAll('lunes')} className="copy-button" title="Copiar a todos">⋮</button>
              </div>
            </div>

            {/* Martes */}
            <div className="horario-row">
              <label className="horario-label">Martes</label>
              <div className="horario-inputs">
                <input type="text" name="martesInicio" value={formData.martesInicio} readOnly onClick={(e) => openTimePicker('martesInicio', e)} className="horario-input" placeholder="12:00 AM" />
                <span className="horario-arrow">→</span>
                <input type="text" name="martesFin" value={formData.martesFin} readOnly onClick={(e) => openTimePicker('martesFin', e)} className="horario-input" placeholder="11:59 PM" />
                <button type="button" onClick={() => copyScheduleToAll('martes')} className="copy-button" title="Copiar a todos">⋮</button>
              </div>
            </div>

            {/* Miércoles */}
            <div className="horario-row">
              <label className="horario-label">Miércoles</label>
              <div className="horario-inputs">
                <input type="text" name="miercolesInicio" value={formData.miercolesInicio} readOnly onClick={(e) => openTimePicker('miercolesInicio', e)} className="horario-input" placeholder="12:00 AM" />
                <span className="horario-arrow">→</span>
                <input type="text" name="miercolesFin" value={formData.miercolesFin} readOnly onClick={(e) => openTimePicker('miercolesFin', e)} className="horario-input" placeholder="11:59 PM" />
                <button type="button" onClick={() => copyScheduleToAll('miercoles')} className="copy-button" title="Copiar a todos">⋮</button>
              </div>
            </div>

            {/* Jueves */}
            <div className="horario-row">
              <label className="horario-label">Jueves</label>
              <div className="horario-inputs">
                <input type="text" name="juevesInicio" value={formData.juevesInicio} readOnly onClick={(e) => openTimePicker('juevesInicio', e)} className="horario-input" placeholder="12:00 AM" />
                <span className="horario-arrow">→</span>
                <input type="text" name="juevesFin" value={formData.juevesFin} readOnly onClick={(e) => openTimePicker('juevesFin', e)} className="horario-input" placeholder="11:59 PM" />
                <button type="button" onClick={() => copyScheduleToAll('jueves')} className="copy-button" title="Copiar a todos">⋮</button>
              </div>
            </div>

            {/* Viernes */}
            <div className="horario-row">
              <label className="horario-label">Viernes</label>
              <div className="horario-inputs">
                <input type="text" name="viernesInicio" value={formData.viernesInicio} readOnly onClick={(e) => openTimePicker('viernesInicio', e)} className="horario-input" placeholder="12:00 AM" />
                <span className="horario-arrow">→</span>
                <input type="text" name="viernesFin" value={formData.viernesFin} readOnly onClick={(e) => openTimePicker('viernesFin', e)} className="horario-input" placeholder="11:59 PM" />
                <button type="button" onClick={() => copyScheduleToAll('viernes')} className="copy-button" title="Copiar a todos">⋮</button>
              </div>
            </div>

            {/* Sábado */}
            <div className="horario-row">
              <label className="horario-label">Sábado</label>
              <div className="horario-inputs">
                <input type="text" name="sabadoInicio" value={formData.sabadoInicio} readOnly onClick={(e) => openTimePicker('sabadoInicio', e)} className="horario-input" placeholder="12:00 AM" />
                <span className="horario-arrow">→</span>
                <input type="text" name="sabadoFin" value={formData.sabadoFin} readOnly onClick={(e) => openTimePicker('sabadoFin', e)} className="horario-input" placeholder="11:59 PM" />
                <button type="button" onClick={() => copyScheduleToAll('sabado')} className="copy-button" title="Copiar a todos">⋮</button>
              </div>
            </div>

            {/* Domingo */}
            <div className="horario-row">
              <label className="horario-label">Domingo</label>
              <div className="horario-inputs">
                <input type="text" name="domingoInicio" value={formData.domingoInicio} readOnly onClick={(e) => openTimePicker('domingoInicio', e)} className="horario-input" placeholder="12:00 AM" />
                <span className="horario-arrow">→</span>
                <input type="text" name="domingoFin" value={formData.domingoFin} readOnly onClick={(e) => openTimePicker('domingoFin', e)} className="horario-input" placeholder="11:59 PM" />
                <button type="button" onClick={() => copyScheduleToAll('domingo')} className="copy-button" title="Copiar a todos">⋮</button>
              </div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" data-testid="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'CREANDO...' : 'CREAR'}
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'Sorteos') {
      // Definir todos los sorteos según el JSON con sus IDs y nombres exactos
      const lotteries = [
        // Primera fila (13 sorteos)
        { id: 1, name: 'LA PRIMERA' },
        { id: 2, name: 'NEW YORK DAY' },
        { id: 3, name: 'NEW YORK NIGHT' },
        { id: 4, name: 'FLORIDA AM' },
        { id: 5, name: 'FLORIDA PM' },
        { id: 6, name: 'GANA MAS' },
        { id: 7, name: 'NACIONAL' },
        { id: 8, name: 'QUINIELA PALE' },
        { id: 9, name: 'REAL' },
        { id: 10, name: 'LOTEKA' },
        { id: 11, name: 'FL PICK2 AM' },
        { id: 12, name: 'FL PICK2 PM' },
        { id: 13, name: 'GEORGIA-MID AM' },
        // Segunda fila (12 sorteos)
        { id: 14, name: 'GEORGIA EVENING' },
        { id: 15, name: 'GEORGIA NIGHT' },
        { id: 16, name: 'NEW JERSEY AM' },
        { id: 17, name: 'NEW JERSEY PM' },
        { id: 18, name: 'CONNECTICUT AM' },
        { id: 19, name: 'CONNECTICUT PM' },
        { id: 20, name: 'CALIFORNIA AM' },
        { id: 21, name: 'CALIFORNIA PM' },
        { id: 24, name: 'CHICAGO AM' },
        { id: 25, name: 'CHICAGO PM' },
        { id: 30, name: 'PENN MIDDAY' },
        // Tercera fila (14 sorteos)
        { id: 31, name: 'PENN EVENING' },
        { id: 34, name: 'INDIANA MIDDAY' },
        { id: 35, name: 'INDIANA EVENING' },
        { id: 38, name: 'DIARIA 11AM' },
        { id: 39, name: 'DIARIA 3PM' },
        { id: 40, name: 'DIARIA 9PM' },
        { id: 53, name: 'SUPER PALE TARDE' },
        { id: 54, name: 'SUPER PALE NOCHE' },
        { id: 55, name: 'SUPER PALE NY-FL AM' },
        { id: 56, name: 'SUPER PALE NY-FL PM' },
        // Cuarta fila (14 sorteos)
        { id: 61, name: 'TEXAS MORNING' },
        { id: 62, name: 'TEXAS DAY' },
        { id: 63, name: 'TEXAS EVENING' },
        { id: 64, name: 'TEXAS NIGHT' },
        { id: 65, name: 'VIRGINIA AM' },
        { id: 66, name: 'VIRGINIA PM' },
        { id: 73, name: 'SOUTH CAROLINA AM' },
        { id: 74, name: 'SOUTH CAROLINA PM' },
        { id: 75, name: 'MARYLAND MIDDAY' },
        { id: 76, name: 'MARYLAND EVENING' },
        { id: 82, name: 'MASS AM' },
        // Quinta fila (13 sorteos)
        { id: 83, name: 'MASS PM' },
        { id: 211, name: 'LA SUERTE' },
        { id: 244, name: 'NORTH CAROLINA AM' },
        { id: 245, name: 'NORTH CAROLINA PM' },
        { id: 277, name: 'LOTEDOM' },
        { id: 376, name: 'NY AM 6x1' },
        { id: 377, name: 'NY PM 6x1' },
        { id: 411, name: 'FL AM 6X1' },
        { id: 412, name: 'FL PM 6X1' },
        { id: 541, name: 'King Lottery AM' },
        { id: 542, name: 'King Lottery PM' },
        { id: 607, name: 'L.E. PUERTO RICO 2PM' },
        // Sexta fila (13 sorteos)
        { id: 608, name: 'L.E. PUERTO RICO 10PM' },
        { id: 609, name: 'DELAWARE AM' },
        { id: 610, name: 'DELAWARE PM' },
        { id: 673, name: 'Anguila 1pm' },
        { id: 674, name: 'Anguila 6PM' },
        { id: 675, name: 'Anguila 9pm' },
        { id: 970, name: 'Anguila 10am' },
        { id: 1036, name: 'LA CHICA' },
        { id: 1168, name: 'LA PRIMERA 8PM' },
        { id: 1300, name: 'PANAMA MIERCOLES' },
        { id: 1366, name: 'PANAMA DOMINGO' },
        // Séptima fila (1 sorteo)
        { id: 1432, name: 'LA SUERTE 6:00pm' }
      ];

      // Organizar sorteos en filas para la UI
      const row1 = lotteries.slice(0, 13);
      const row2 = lotteries.slice(13, 25);
      const row3 = lotteries.slice(25, 39);
      const row4 = lotteries.slice(39, 53);
      const row5 = lotteries.slice(53, 66);
      const row6 = lotteries.slice(66, 79);
      const row7 = lotteries.slice(79);

      const allLotteryIds = lotteries.map(l => l.id);
      const allSelected = allLotteryIds.every(id => formData.selectedLotteries.includes(id));

      return (
        <div className="sorteos-container">
          {/* Primera fila */}
          <div className="sorteo-btn-group">
            <div className="sorteo-row">
              {row1.map((lottery, index) => (
                <label
                  key={lottery.id}
                  className={`sorteo-btn-label ${formData.selectedLotteries.includes(lottery.id) ? 'active' : ''}`}
                  style={index === 0 ? { borderRadius: '3.2px 0px 0px 3.2px', marginLeft: 0 } : {}}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedLotteries.includes(lottery.id)}
                    onChange={() => handleLotteryToggle(lottery.id)}
                  />
                  {lottery.name}
                </label>
              ))}
            </div>
          </div>

          {/* Segunda fila */}
          <div className="sorteo-btn-group">
            <div className="sorteo-row">
              {row2.map((lottery, index) => (
                <label
                  key={lottery.id}
                  className={`sorteo-btn-label ${formData.selectedLotteries.includes(lottery.id) ? 'active' : ''}`}
                  style={index === 0 ? { borderRadius: '3.2px 0px 0px 3.2px', marginLeft: 0 } : {}}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedLotteries.includes(lottery.id)}
                    onChange={() => handleLotteryToggle(lottery.id)}
                  />
                  {lottery.name}
                </label>
              ))}
            </div>
          </div>

          {/* Tercera fila */}
          <div className="sorteo-btn-group">
            <div className="sorteo-row">
              {row3.map((lottery, index) => (
                <label
                  key={lottery.id}
                  className={`sorteo-btn-label ${formData.selectedLotteries.includes(lottery.id) ? 'active' : ''}`}
                  style={index === 0 ? { borderRadius: '3.2px 0px 0px 3.2px', marginLeft: 0 } : {}}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedLotteries.includes(lottery.id)}
                    onChange={() => handleLotteryToggle(lottery.id)}
                  />
                  {lottery.name}
                </label>
              ))}
            </div>
          </div>

          {/* Cuarta fila */}
          <div className="sorteo-btn-group">
            <div className="sorteo-row">
              {row4.map((lottery, index) => (
                <label
                  key={lottery.id}
                  className={`sorteo-btn-label ${formData.selectedLotteries.includes(lottery.id) ? 'active' : ''}`}
                  style={index === 0 ? { borderRadius: '3.2px 0px 0px 3.2px', marginLeft: 0 } : {}}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedLotteries.includes(lottery.id)}
                    onChange={() => handleLotteryToggle(lottery.id)}
                  />
                  {lottery.name}
                </label>
              ))}
            </div>
          </div>

          {/* Quinta fila */}
          <div className="sorteo-btn-group">
            <div className="sorteo-row">
              {row5.map((lottery, index) => (
                <label
                  key={lottery.id}
                  className={`sorteo-btn-label ${formData.selectedLotteries.includes(lottery.id) ? 'active' : ''}`}
                  style={index === 0 ? { borderRadius: '3.2px 0px 0px 3.2px', marginLeft: 0 } : {}}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedLotteries.includes(lottery.id)}
                    onChange={() => handleLotteryToggle(lottery.id)}
                  />
                  {lottery.name}
                </label>
              ))}
            </div>
          </div>

          {/* Sexta fila */}
          <div className="sorteo-btn-group">
            <div className="sorteo-row">
              {row6.map((lottery, index) => (
                <label
                  key={lottery.id}
                  className={`sorteo-btn-label ${formData.selectedLotteries.includes(lottery.id) ? 'active' : ''}`}
                  style={index === 0 ? { borderRadius: '3.2px 0px 0px 3.2px', marginLeft: 0 } : {}}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedLotteries.includes(lottery.id)}
                    onChange={() => handleLotteryToggle(lottery.id)}
                  />
                  {lottery.name}
                </label>
              ))}
            </div>
          </div>

          {/* Séptima fila */}
          <div className="sorteo-btn-group">
            <div className="sorteo-row">
              {row7.map((lottery, index) => (
                <label
                  key={lottery.id}
                  className={`sorteo-btn-label ${formData.selectedLotteries.includes(lottery.id) ? 'active' : ''}`}
                  style={index === 0 ? { borderRadius: '3.2px 0px 0px 3.2px', marginLeft: 0 } : {}}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedLotteries.includes(lottery.id)}
                    onChange={() => handleLotteryToggle(lottery.id)}
                  />
                  {lottery.name}
                </label>
              ))}
            </div>
          </div>

          {/* Botón TODOS */}
          <div className="sorteo-todos-container">
            <label
              className={`sorteo-todos-btn ${allSelected ? 'active' : ''}`}
              onClick={handleToggleAllLotteries}
            >
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleToggleAllLotteries}
              />
              Todos
            </label>
          </div>

          {/* Sección de Cierre Anticipado */}
          <div className="cierre-anticipado-section">
            <label className="cierre-anticipado-label">
              Configuración de Cierre Anticipado
            </label>

            {/* Input para minutos */}
            <div className="cierre-anticipado-input-wrapper" style={{ marginBottom: '15px' }}>
              <label htmlFor="anticipatedClosing" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#606266' }}>
                Minutos de Cierre Anticipado
              </label>
              <input
                type="number"
                id="anticipatedClosing"
                name="anticipatedClosing"
                value={formData.anticipatedClosing}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ej: 5, 10, 15..."
                min="0"
                step="1"
                style={{ width: '100%', padding: '8px 12px' }}
              />
              <small style={{ display: 'block', marginTop: '5px', color: '#909399', fontSize: '12px' }}>
                Minutos antes del sorteo para cerrar las ventas
              </small>
            </div>

            {/* Multiselect para loterías */}
            <div className="cierre-anticipado-lotteries-wrapper">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#606266' }}>
                Aplicar cierre anticipado a:
              </label>
              <LotteryMultiselect
                lotteries={lotteries}
                value={formData.anticipatedClosingLotteries || []}
                onChange={(selectedIds) => {
                  setFormData(prev => ({
                    ...prev,
                    anticipatedClosingLotteries: selectedIds
                  }));
                }}
                placeholder="Seleccione las loterías para cierre anticipado"
              />
              <small style={{ display: 'block', marginTop: '5px', color: '#909399', fontSize: '12px' }}>
                Seleccione las loterías que tendrán cierre anticipado
              </small>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" data-testid="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'CREANDO...' : 'CREAR'}
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'Estilos') {
      return (
        <div className="form-tab-container">
          <div className="form-row">
            <div className="form-column">
              {/* Estilo punto de venta */}
              <div className="form-group">
                <label className="form-label">Estilo punto de venta</label>
                <select
                  name="sellScreenStyles"
                  value={formData.sellScreenStyles}
                  onChange={handleInputChange}
                  className="form-select form-input-small"
                >
                  <option value="">Seleccione</option>
                  <option value="estilo1">Estilo 1</option>
                  <option value="estilo2">Estilo 2</option>
                  <option value="estilo3">Estilo 3</option>
                  <option value="estilo4">Estilo 4</option>
                </select>
              </div>

              {/* Estilo de impresión */}
              <div className="form-group">
                <label className="form-label">Estilo de impresión</label>
                <select
                  name="ticketPrintStyles"
                  value={formData.ticketPrintStyles}
                  onChange={handleInputChange}
                  className="form-select form-input-small"
                >
                  <option value="">Seleccione</option>
                  <option value="original">Original</option>
                  <option value="clasico">Clásico</option>
                  <option value="moderno">Moderno</option>
                  <option value="compacto">Compacto</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" data-testid="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'CREANDO...' : 'CREAR'}
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'Gastos automáticos') {
      return (
        <GastosAutomaticosTab
          formData={formData}
          onChange={handleInputChange}
          error={error}
          success={success}
        />
      );
    } else {
      return (
        <div className="tab-placeholder">
          <p>Contenido del tab "{activeTab}" - Por implementar</p>
        </div>
      );
    }
  };

  return (
    <div className="create-branch-container">
      <div className="page-title">
        <h1>Crear banca '{formData.branchCode || '...'}'</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Tabs */}
        <div className="tabs-container">
          {tabs.map((tab) => (
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

        {/* Contenido del tab */}
        <div className="branch-form">
          {renderTabContent()}
        </div>
      </form>

      {/* Sección Copiar de banca plantilla */}
      <div className="copy-template-section">
        <h3>Copiar de banca plantilla</h3>
        
          <div className="template-form">
          <div className="template-field">
            <label>Banca</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="template-select"
            >
              <option value="">Seleccione</option>
              {branches.map(branch => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </option>
              ))}
            </select>
          </div>

          <div className="template-fields">
            <label>Campos de plantilla</label>
            <div className="template-buttons">
              {templateFields.map((field) => (
                <button
                  key={field}
                  type="button"
                  className={`template-btn ${selectedTemplateFields.includes(field) ? 'selected' : ''}`}
                  onClick={() => handleTemplateFieldToggle(field)}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>
          
          <div className="template-actions">
            <button
              type="button"
              className="copy-template-btn"
              onClick={copyFromTemplate}
              disabled={!selectedBranch || selectedTemplateFields.length === 0 || loading}
            >
              {loading ? 'Copiando...' : 'Copiar Configuración'}
            </button>
          </div>
        </div>
      </div>

      {/* TimePicker Modal */}
      {activeTimePicker && (
        <TimePicker
          value={formData[activeTimePicker]}
          onChange={(newValue) => {
            setFormData(prev => ({
              ...prev,
              [activeTimePicker]: newValue
            }));
          }}
          onClose={() => setActiveTimePicker(null)}
          position={timePickerPosition}
        />
      )}
    </div>
  );
};

export default CreateBanca;
