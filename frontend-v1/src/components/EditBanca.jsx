import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBranchWithConfig, updateBranchConfig, updateBranch } from '../services/branchService';
import { getActiveZones } from '../services/zoneService';
import { getResolvedDrawPrizeConfig, saveDrawPrizeConfig, getPrizeFields, saveBancaPrizeConfig, getBancaPrizeConfig, patchBancaPrizeConfig } from '../services/prizeFieldService';
import { saveBettingPoolSchedules, transformSchedulesToApiFormat, getBettingPoolSchedules, transformSchedulesToFormFormat } from '../services/scheduleService';
import { getBettingPoolDraws, saveBettingPoolDraws } from '../services/sortitionService';
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
import '../assets/css/PremioConfig.css';

const EditBanca = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
    // Premios & Comisiones - Pick 3 (Columna 1)
    pick3FirstPayment: '',
    pick3SecondPayment: '',
    pick3ThirdPayment: '',
    pick3Doubles: '',
    // Pick 3 Super (Columna 2)
    pick3SuperAllSequence: '',
    pick3SuperFirstPayment: '',
    pick3SuperSecondPayment: '',
    pick3SuperThirdPayment: '',
    // Pick 4 (Columna 3)
    pick4FirstPayment: '',
    pick4SecondPayment: '',
    // Pick 4 Super (Columna 4)
    pick4SuperAllSequence: '',
    pick4SuperDoubles: '',
    // Pick 3 NY (Columna 5)
    pick3NY_3Way2Identical: '',
    pick3NY_6Way3Unique: '',
    // Pick 4 NY (Columna 6)
    pick4NY_AllSequence: '',
    pick4NY_Doubles: '',
    // Pick 4 Extra (Columna 1)
    pick4_24Way4Unique: '',
    pick4_12Way2Identical: '',
    pick4_6Way2Identical: '',
    pick4_4Way3Identical: '',
    // Pick 5 Mega (Columna 2)
    pick5MegaFirstPayment: '',
    // Pick 5 NY (Columna 3)
    pick5NYFirstPayment: '',
    // Pick 5 Bronx (Columna 4)
    pick5BronxFirstPayment: '',
    // Pick 5 Brooklyn (Columna 5)
    pick5BrooklynFirstPayment: '',
    // Pick 5 Queens (Columna 6)
    pick5QueensFirstPayment: '',
    // Pick 5 Extra (Columna 1)
    pick5FirstPayment: '',
    // Pick 5 Super (Columna 2)
    pick5SuperAllSequence: '',
    pick5SuperDoubles: '',
    // Pick 5 Super Extra (Columna 3)
    pick5Super_5Way4Identical: '',
    pick5Super_10Way3Identical: '',
    pick5Super_20Way3Identical: '',
    pick5Super_30Way2Identical: '',
    pick5Super_60Way2Identical: '',
    pick5Super_120Way5Unique: '',
    // Pick 6 Miami (Columna 4)
    pick6MiamiFirstPayment: '',
    pick6MiamiDoubles: '',
    // Pick 6 California (Columna 5)
    pick6CaliforniaAllSequence: '',
    pick6CaliforniaTriples: '',
    // Pick 6 New York (Columna 6)
    pick6NY_3Way2Identical: '',
    pick6NY_6Way3Unique: '',
    // Pick 6 Extra (Columna 1)
    pick6AllSequence: '',
    pick6Triples: '',
    // Pick 6 California Extra (Columna 2)
    pick6Cali_3Way2Identical: '',
    pick6Cali_6Way3Unique: '',
    // Lotto Classic (Columna 3)
    lottoClassicFirstPayment: '',
    lottoClassicDoubles: '',
    // Lotto Plus (Columna 4)
    lottoPlusFirstPayment: '',
    lottoPlusDoubles: '',
    // Mega Millions (Columna 5)
    megaMillionsFirstPayment: '',
    megaMillionsDoubles: '',
    // Powerball (Columna 6)
    powerball4NumbersFirstRound: '',
    powerball3NumbersFirstRound: '',
    powerball2NumbersFirstRound: '',
    powerballLastNumberFirstRound: '',
    powerball4NumbersSecondRound: '',
    powerball3NumbersSecondRound: '',
    powerballLast2NumbersSecondRound: '',
    powerballLastNumberSecondRound: '',
    powerball4NumbersThirdRound: '',
    powerball3NumbersThirdRound: '',
    powerballLast2NumbersThirdRound: '',
    powerballLastNumberThirdRound: '',
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
    anticipatedClosing: '', // Minutos de cierre anticipado
    anticipatedClosingLotteries: [], // Loterías a las que se aplica el cierre anticipado
    // Estilos
    sellScreenStyles: 'estilo1', // Estilo punto de venta
    ticketPrintStyles: 'original', // Estilo de impresión
    // Gastos automáticos
    autoExpenses: []
  });
  const [zones, setZones] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedTemplateFields, setSelectedTemplateFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [initialFormData, setInitialFormData] = useState(null); // Track initial values for change detection
  const [activeTimePicker, setActiveTimePicker] = useState(null); // null o el nombre del campo activo
  const [timePickerPosition, setTimePickerPosition] = useState({ top: 0, left: 0 });

  // Estados para configuración de premios por sorteo
  const [showDrawPrizeModal, setShowDrawPrizeModal] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [drawPrizeConfig, setDrawPrizeConfig] = useState([]);
  const [loadingDrawPrizes, setLoadingDrawPrizes] = useState(false);
  const [savingDrawPrizes, setSavingDrawPrizes] = useState(false);

  // Estado para almacenar valores por defecto de premios (para comparación)
  const [defaultPrizeValues, setDefaultPrizeValues] = useState({});

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

  // Cargar datos de la banca con configuración
  useEffect(() => {
    const loadBranchData = async () => {
      if (!id) {
        logger.error('EDIT_BANCA', 'ID de banca no encontrado');
        setError('ID de banca no encontrado');
        return;
      }

      setLoading(true);
      setError('');

      try {
        logger.info('EDIT_BANCA', 'Cargando banca con configuración', { id });
        const result = await getBranchWithConfig(id);

        if (result.success && result.data) {
          const branch = result.data;
          const config = branch.config || {};
          const discountConfig = branch.discountConfig || {};
          const printConfig = branch.printConfig || {};
          const footer = branch.footer || {};

          // Mapear fallType: string del backend (inglés) → number para radio buttons
          let fallTypeValue = '1'; // Default OFF
          if (config.fallType === 'COLLECTION') fallTypeValue = '2';
          else if (config.fallType === 'DAILY') fallTypeValue = '3';
          else if (config.fallType === 'MONTHLY') fallTypeValue = '4';
          else if (config.fallType === 'WEEKLY_WITH_ACCUMULATED') fallTypeValue = '5';
          else if (config.fallType === 'WEEKLY_WITHOUT_ACCUMULATED') fallTypeValue = '6';

          // Mapear discountProvider (inglés)
          let discountProviderValue = '1'; // Default GROUP
          if (discountConfig.discountProvider === 'SELLER') discountProviderValue = '2';

          // Mapear discountMode (inglés)
          let discountModeValue = '1'; // Default OFF
          if (discountConfig.discountMode === 'CASH') discountModeValue = '2';
          else if (discountConfig.discountMode === 'FREE_TICKET') discountModeValue = '3';

          // Mapear printerType (inglés)
          let printerTypeValue = '1'; // Default DRIVER
          if (printConfig.printMode === 'GENERIC') printerTypeValue = '2';

          // Mapear limitPreference (paymentMode en inglés)
          let limitPreferenceValue = null; // Default USE_GROUP_PREFERENCE
          if (config.paymentMode === 'POOL') limitPreferenceValue = '1';
          else if (config.paymentMode === 'ZONE') limitPreferenceValue = '2';
          else if (config.paymentMode === 'GROUP') limitPreferenceValue = '3';

          console.log('🔍 [EDIT_BANCA] Loading branch data from API:', {
            branchName: branch.bettingPoolName,
            location: branch.location,
            branchCode: branch.bettingPoolCode,
            reference: branch.reference,
            zoneId: branch.zoneId,
            zoneIdType: typeof branch.zoneId
          });

          setFormData({
            // Datos básicos
            branchName: branch.bettingPoolName || '',
            location: branch.location || '',
            branchCode: branch.bettingPoolCode || '',
            reference: branch.reference || '',
            comment: branch.comment || '',
            selectedZone: branch.zoneId ? String(branch.zoneId) : '',
            isActive: branch.isActive !== undefined ? branch.isActive : true,

            // Config (17 campos)
            fallType: fallTypeValue,
            deactivationBalance: config.deactivationBalance ? String(config.deactivationBalance) : '',
            dailySaleLimit: config.dailySaleLimit ? String(config.dailySaleLimit) : '',
            todayBalanceLimit: config.dailyBalanceLimit ? String(config.dailyBalanceLimit) : '',
            temporaryAdditionalBalance: config.temporaryAdditionalBalance ? String(config.temporaryAdditionalBalance) : '',
            enableTemporaryBalance: config.enableTemporaryBalance !== undefined ? config.enableTemporaryBalance : false,
            creditLimit: config.creditLimit ? String(config.creditLimit) : '',
            winningTicketsControl: config.controlWinningTickets || false,
            allowPassPot: config.allowJackpot !== undefined ? config.allowJackpot : true,
            enableRecharges: config.enableRecharges !== undefined ? config.enableRecharges : true,
            allowPasswordChange: config.allowPasswordChange !== undefined ? config.allowPasswordChange : true,
            minutesToCancelTicket: config.cancelMinutes ? String(config.cancelMinutes) : '30',
            ticketsToCancelPerDay: config.dailyCancelTickets ? String(config.dailyCancelTickets) : '',
            maximumCancelTicketAmount: config.maxCancelAmount ? String(config.maxCancelAmount) : '',
            maxTicketAmount: config.maxTicketAmount ? String(config.maxTicketAmount) : '',
            dailyPhoneRechargeLimit: config.maxDailyRecharge ? String(config.maxDailyRecharge) : '',

            // DiscountConfig (2 campos)
            discountProvider: discountProviderValue,
            discountMode: discountModeValue,

            // PrintConfig (5 campos)
            printerType: printerTypeValue,
            printTickets: printConfig.printEnabled !== undefined ? printConfig.printEnabled : true,
            printTicketCopy: printConfig.printTicketCopy !== undefined ? printConfig.printTicketCopy : true,
            printRechargeReceipt: printConfig.printRechargeReceipt !== undefined ? printConfig.printRechargeReceipt : true,
            smsOnly: printConfig.smsOnly || false,

            // Limit preference for compatibility
            limitPreference: limitPreferenceValue,

            // Pies de página
            autoFooter: footer.autoFooter !== undefined ? footer.autoFooter : false,
            footerText1: footer.footerLine1 || '',
            footerText2: footer.footerLine2 || '',
            footerText3: footer.footerLine3 || '',
            footerText4: footer.footerLine4 || '',
            showBranchInfo: true,
            showDateTime: true,

            // Premios & Comisiones - Todos los campos vacíos por ahora
            pick3FirstPayment: '',
            pick3SecondPayment: '',
            pick3ThirdPayment: '',
            pick3Doubles: '',
            pick3SuperAllSequence: '',
            pick3SuperFirstPayment: '',
            pick3SuperSecondPayment: '',
            pick3SuperThirdPayment: '',
            pick4FirstPayment: '',
            pick4SecondPayment: '',
            pick4SuperAllSequence: '',
            pick4SuperDoubles: '',
            pick3NY_3Way2Identical: '',
            pick3NY_6Way3Unique: '',
            pick4NY_AllSequence: '',
            pick4NY_Doubles: '',
            pick4_24Way4Unique: '',
            pick4_12Way2Identical: '',
            pick4_6Way2Identical: '',
            pick4_4Way3Identical: '',
            pick5MegaFirstPayment: '',
            pick5NYFirstPayment: '',
            pick5BronxFirstPayment: '',
            pick5BrooklynFirstPayment: '',
            pick5QueensFirstPayment: '',
            pick5FirstPayment: '',
            pick5SuperAllSequence: '',
            pick5SuperDoubles: '',
            pick5Super_5Way4Identical: '',
            pick5Super_10Way3Identical: '',
            pick5Super_20Way3Identical: '',
            pick5Super_30Way2Identical: '',
            pick5Super_60Way2Identical: '',
            pick5Super_120Way5Unique: '',
            pick6MiamiFirstPayment: '',
            pick6MiamiDoubles: '',
            pick6CaliforniaAllSequence: '',
            pick6CaliforniaTriples: '',
            pick6NY_3Way2Identical: '',
            pick6NY_6Way3Unique: '',
            pick6AllSequence: '',
            pick6Triples: '',
            pick6Cali_3Way2Identical: '',
            pick6Cali_6Way3Unique: '',
            lottoClassicFirstPayment: '',
            lottoClassicDoubles: '',
            lottoPlusFirstPayment: '',
            lottoPlusDoubles: '',
            megaMillionsFirstPayment: '',
            megaMillionsDoubles: '',

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
            anticipatedClosing: '',

            // Estilos
            sellScreenStyles: 'estilo1',
            ticketPrintStyles: 'original',

            // Gastos automáticos
            autoExpenses: []
          });

          // Capture initial state for change detection (after all basic data is loaded)
          setFormData(prev => {
            setInitialFormData(prev);
            console.log('🔍 [EDIT_BANCA] FormData después de cargar:', {
              selectedZone: prev.selectedZone,
              selectedZoneType: typeof prev.selectedZone
            });
            return prev;
          });

          // Cargar horarios desde la API
          try {
            logger.info('EDIT_BANCA', 'Cargando horarios de la banca', { id });
            const schedulesResult = await getBettingPoolSchedules(id);

            if (schedulesResult.success && schedulesResult.data && schedulesResult.data.length > 0) {
              const scheduleData = transformSchedulesToFormFormat(schedulesResult.data);

              // Actualizar formData con los horarios reales
              setFormData(prev => {
                const updatedData = { ...prev, ...scheduleData };
                // También actualizar initialFormData para que tenga los horarios correctos
                setInitialFormData(updatedData);
                return updatedData;
              });

              logger.success('EDIT_BANCA', 'Horarios cargados exitosamente', {
                horarios: Object.keys(scheduleData).length
              });
            } else {
              logger.info('EDIT_BANCA', 'No hay horarios configurados, usando valores por defecto');
            }
          } catch (scheduleError) {
            logger.error('EDIT_BANCA', 'Error cargando horarios', { error: scheduleError.message });
            // No fallar toda la carga si solo fallan los horarios
            console.warn('Error al cargar horarios, usando valores por defecto:', scheduleError);
          }

          // Cargar draws desde la API
          try {
            logger.info('EDIT_BANCA', 'Cargando draws de la banca', { id });
            const drawsResult = await getBettingPoolDraws(id);

            if (drawsResult.success && drawsResult.data && drawsResult.data.length > 0) {
              // Transformar draws de la API a formato del formulario
              const enabledLotteries = drawsResult.data
                .filter(s => s.isActive || s.isEnabled)  // Support both old and new API
                .map(s => s.lotteryId);

              const lotteriesWithClosing = drawsResult.data
                .filter(s => {
                  const closing = s.anticipatedClosingMinutes ?? s.anticipatedClosing;
                  return closing != null && closing > 0;
                })
                .map(s => ({
                  lotteryId: s.lotteryId,
                  minutes: s.anticipatedClosingMinutes ?? s.anticipatedClosing
                }));

              logger.info('EDIT_BANCA', '🔍 Loterías con cierre anticipado:', lotteriesWithClosing);

              // Usar el primer valor encontrado (o vacío si no hay ninguno)
              const anticipatedClosing = lotteriesWithClosing.length > 0 ? String(lotteriesWithClosing[0].minutes) : '';

              logger.info('EDIT_BANCA', '🔍 Valor de cierre anticipado:', {
                anticipatedClosingValue: anticipatedClosing,
                totalLotteriesWithClosing: lotteriesWithClosing.length
              });

              const drawsData = {
                selectedLotteries: enabledLotteries,
                anticipatedClosing: anticipatedClosing,
                anticipatedClosingLotteries: lotteriesWithClosing.map(l => l.lotteryId)
              };

              // Actualizar formData con los draws
              setFormData(prev => {
                const updatedData = { ...prev, ...drawsData };
                // También actualizar initialFormData para detectar cambios correctamente
                setInitialFormData(updatedData);
                return updatedData;
              });

              logger.success('EDIT_BANCA', 'Draws cargados exitosamente', {
                selectedLotteries: enabledLotteries.length,
                anticipatedClosing: anticipatedClosing,
                anticipatedClosingLotteries: lotteriesWithClosing.length
              });
            } else {
              logger.info('EDIT_BANCA', 'No hay draws configurados, usando valores por defecto');
            }
          } catch (drawError) {
            logger.error('EDIT_BANCA', 'Error cargando draws', { error: drawError.message });
            // No fallar toda la carga si solo fallan los draws
            console.warn('Error al cargar draws, usando valores por defecto:', drawError);
          }

          logger.info('EDIT_BANCA', 'Datos de banca cargados exitosamente', {
            branchId: id,
            branchName: branch.bettingPoolName
          });
        } else {
          setError('No se pudo cargar los datos de la banca');
          logger.error('EDIT_BANCA', 'Response sin datos', { result });
        }
      } catch (error) {
        logger.error('EDIT_BANCA', 'Error cargando banca', {
          branchId: id,
          error: error.message
        });
        setError(`Error al cargar la banca: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadBranchData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Cargar zonas desde la API
      const zonesResponse = await getActiveZones();
      if (zonesResponse.success && zonesResponse.data) {
        console.log('🔍 [EDIT_BANCA] Zonas cargadas:', zonesResponse.data.map(z => ({ zoneId: z.zoneId, zoneName: z.zoneName })));
        setZones(zonesResponse.data);
      }

      // Simular carga de bancas para plantilla
      setBranches([
        { branchId: 1, branchName: 'Banca Central 001' },
        { branchId: 2, branchName: 'Banca Norte 002' },
        { branchId: 3, branchName: 'Banca Sur 003' }
      ]);
    } catch (error) {
      logger.error('EDIT_BANCA', 'Error cargando datos iniciales', { error: error.message });
      setError('Error cargando datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name && name.startsWith('general_')) {
      console.log('📝 [PREMIO INPUT] Campo editado:', name, '→', value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' && name === 'limitPreference' ? null : value)
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
      logger.error('EDIT_BANCA', 'Error copiando plantilla', { error: error.message, selectedBranch });
      setError('Error al copiar la configuración de la plantilla');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate branchName (required, 1-100 chars)
    if (!formData.branchName?.trim()) {
      errors.branchName = 'El nombre de la banca es requerido';
    } else if (formData.branchName.trim().length > 100) {
      errors.branchName = 'El nombre no puede exceder 100 caracteres';
    }

    // Validate location (optional, but max 255 chars if provided)
    if (formData.location && formData.location.trim().length > 255) {
      errors.location = 'La ubicación no puede exceder 255 caracteres';
    }

    // Validate reference (optional, but max 255 chars if provided)
    if (formData.reference && formData.reference.trim().length > 255) {
      errors.reference = 'La referencia no puede exceder 255 caracteres';
    }

    // Validate selectedZone (required, >= 1)
    if (!formData.selectedZone || parseInt(formData.selectedZone) < 1) {
      errors.selectedZone = 'Debe seleccionar una zona válida';
    }

    // Map field names to user-friendly labels
    const fieldNames = {
      branchName: 'Nombre',
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

  // Helper functions to detect changes in different sections
  const hasBasicDataChanged = () => {
    if (!initialFormData) {
      logger.info('EDIT_BANCA', '📊 hasBasicDataChanged: NO initialFormData - guardando todo');
      return true; // If no initial data, save everything
    }

    const basicFields = ['branchName', 'selectedZone', 'location', 'reference', 'comment', 'isActive'];
    const changedFields = basicFields.filter(field => formData[field] !== initialFormData[field]);

    if (changedFields.length > 0) {
      logger.info('EDIT_BANCA', `📊 hasBasicDataChanged: SÍ - ${changedFields.length} cambios`, {
        campos: changedFields,
        valores: changedFields.map(f => ({
          campo: f,
          anterior: initialFormData[f],
          nuevo: formData[f]
        }))
      });
    } else {
      logger.info('EDIT_BANCA', '📊 hasBasicDataChanged: NO - sin cambios');
    }

    return changedFields.length > 0;
  };

  const hasConfigDataChanged = () => {
    if (!initialFormData) {
      logger.info('EDIT_BANCA', '📊 hasConfigDataChanged: NO initialFormData - guardando todo');
      return true;
    }

    const configFields = [
      'fallType', 'commissionRate', 'creditLimit', 'deactivationBalance',
      'dailySaleLimit', 'todayBalanceLimit', 'enableTemporaryBalance', 'temporaryAdditionalBalance',
      'winningTicketsControl', 'allowPassPot', 'printTickets', 'printTicketCopy', 'smsOnly',
      'minutesToCancelTicket', 'ticketsToCancelPerDay', 'enableRecharges', 'printRechargeReceipt',
      'allowPasswordChange', 'printerType', 'discountProvider', 'discountMode',
      'maximumCancelTicketAmount', 'maxTicketAmount', 'dailyPhoneRechargeLimit', 'limitPreference',
      'autoFooter', 'footerText1', 'footerText2', 'footerText3', 'footerText4',
      'showBranchInfo', 'showDateTime'
    ];

    const changedFields = configFields.filter(field => formData[field] !== initialFormData[field]);

    if (changedFields.length > 0) {
      logger.info('EDIT_BANCA', `📊 hasConfigDataChanged: SÍ - ${changedFields.length} cambios`, {
        campos: changedFields
      });
    } else {
      logger.info('EDIT_BANCA', '📊 hasConfigDataChanged: NO - sin cambios');
    }

    return changedFields.length > 0;
  };

  const hasPrizeDataChanged = () => {
    if (!initialFormData) {
      logger.info('EDIT_BANCA', '📊 hasPrizeDataChanged: NO initialFormData - guardando todo');
      return true;
    }

    // Check all fields that start with 'general_' OR 'lottery_'
    const prizeFields = Object.keys(formData).filter(key =>
      key.startsWith('general_') || key.startsWith('lottery_')
    );
    const changedFields = prizeFields.filter(field => {
      const currentVal = formData[field];
      const initialVal = initialFormData[field];
      const isDifferent = currentVal !== initialVal;

      // Debug primeros 3 campos para ver qué está pasando
      if (prizeFields.indexOf(field) < 3) {
        console.log(`🔍 [DEBUG COMPARISON] ${field}:`, {
          current: currentVal,
          currentType: typeof currentVal,
          initial: initialVal,
          initialType: typeof initialVal,
          isDifferent
        });
      }

      return isDifferent;
    });

    if (changedFields.length > 0) {
      logger.info('EDIT_BANCA', `📊 hasPrizeDataChanged: SÍ - ${changedFields.length} cambios`, {
        primeros5: changedFields.slice(0, 5),
        ejemplos: changedFields.slice(0, 3).map(f => ({
          campo: f,
          actual: formData[f],
          inicial: initialFormData[f]
        }))
      });
    } else {
      logger.info('EDIT_BANCA', '📊 hasPrizeDataChanged: NO - sin cambios');
      console.log(`📊 [DEBUG] Total prize fields: ${prizeFields.length}`);
      console.log(`📊 [DEBUG] Primeros 5 campos:`, prizeFields.slice(0, 5));
    }

    return changedFields.length > 0;
  };

  const hasScheduleDataChanged = () => {
    if (!initialFormData) {
      logger.info('EDIT_BANCA', '📊 hasScheduleDataChanged: NO initialFormData - guardando todo');
      return true;
    }

    const scheduleFields = [
      'domingoInicio', 'domingoFin',
      'lunesInicio', 'lunesFin',
      'martesInicio', 'martesFin',
      'miercolesInicio', 'miercolesFin',
      'juevesInicio', 'juevesFin',
      'viernesInicio', 'viernesFin',
      'sabadoInicio', 'sabadoFin'
    ];

    const changedFields = scheduleFields.filter(field => formData[field] !== initialFormData[field]);

    if (changedFields.length > 0) {
      logger.info('EDIT_BANCA', `📊 hasScheduleDataChanged: SÍ - ${changedFields.length} cambios`, {
        campos: changedFields
      });
    } else {
      logger.info('EDIT_BANCA', '📊 hasScheduleDataChanged: NO - sin cambios');
    }

    return changedFields.length > 0;
  };

  const hasDrawsDataChanged = () => {
    if (!initialFormData) {
      logger.info('EDIT_BANCA', '📊 hasDrawsDataChanged: NO initialFormData - guardando todo');
      return true;
    }

    // Compare selected lotteries (draws)
    const prevLotteries = initialFormData.selectedLotteries || [];
    const currLotteries = formData.selectedLotteries || [];

    if (prevLotteries.length !== currLotteries.length) {
      logger.info('EDIT_BANCA', `📊 hasDrawsDataChanged: SÍ - lottery count changed (${prevLotteries.length} → ${currLotteries.length})`);
      return true;
    }

    // Compare Sets to handle order-independent comparison
    const prevSet = new Set(prevLotteries);
    const currSet = new Set(currLotteries);
    if (!Array.from(prevSet).every(id => currSet.has(id))) {
      logger.info('EDIT_BANCA', '📊 hasDrawsDataChanged: SÍ - different lotteries selected');
      return true;
    }

    // Compare anticipated closing value
    const prevClosing = initialFormData.anticipatedClosing || '';
    const currClosing = formData.anticipatedClosing || '';
    if (prevClosing !== currClosing) {
      logger.info('EDIT_BANCA', `📊 hasDrawsDataChanged: SÍ - anticipated closing changed (${prevClosing} → ${currClosing})`);
      return true;
    }

    // Compare anticipated closing lotteries
    const prevClosingLotteries = initialFormData.anticipatedClosingLotteries || [];
    const currClosingLotteries = formData.anticipatedClosingLotteries || [];
    if (prevClosingLotteries.length !== currClosingLotteries.length) {
      logger.info('EDIT_BANCA', `📊 hasDrawsDataChanged: SÍ - closing lotteries count changed`);
      return true;
    }

    const prevClosingSet = new Set(prevClosingLotteries);
    const currClosingSet = new Set(currClosingLotteries);
    if (!Array.from(prevClosingSet).every(id => currClosingSet.has(id))) {
      logger.info('EDIT_BANCA', '📊 hasDrawsDataChanged: SÍ - different closing lotteries selected');
      return true;
    }

    logger.info('EDIT_BANCA', '📊 hasDrawsDataChanged: NO - sin cambios');
    return false;
  };

  // 🔥 FIX: Callback que se ejecuta cuando los valores custom de premios terminan de cargar
  // Actualiza initialFormData con los valores FINALES (customs) SOLO en la primera carga
  const handlePrizeValuesLoaded = () => {
    logger.info('EDIT_BANCA', '🔥 [PREMIO FIX] Valores custom cargados');

    setFormData(prev => {
      setInitialFormData(prev);
      logger.success('EDIT_BANCA', '✅ initialFormData actualizado con valores custom', {
        totalCampos: Object.keys(prev).length,
        camposPremio: Object.keys(prev).filter(k => k.startsWith('general_')).length
      });
      return prev;
    });
  };

  /**
   * 🔥 NEW: Load lottery-specific prize values
   * @param {number} lotteryId - The lottery ID (e.g., 43 for "LA PRIMERA")
   */
  const loadLotterySpecificValues = async (lotteryId) => {
    try {
      console.log(`🎰 [V1] Loading lottery-specific values for lottery ${lotteryId}...`);

      // Step 1: Get all draws for this lottery
      const response = await fetch(`/api/draws/lottery/${lotteryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ [V1] No draws found for lottery ${lotteryId} (${response.status})`);
        return {};
      }

      const draws = await response.json();
      if (!draws || draws.length === 0) {
        console.log(`ℹ️ [V1] No draws available for lottery ${lotteryId}`);
        return {};
      }

      // Step 2: Use first draw to get prize config
      const firstDraw = draws[0];
      const drawId = firstDraw.drawId;
      console.log(`  → [V1] Using draw ${drawId} (${firstDraw.drawName || 'N/A'})`);

      // Step 3: Get prize config for this draw
      const configResponse = await fetch(`/api/betting-pools/${id}/draws/${drawId}/prize-config`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!configResponse.ok) {
        console.log(`ℹ️ [V1] No custom prize config found for draw ${drawId}`);
        return {};
      }

      const configs = await configResponse.json();
      console.log(`  → [V1] Raw API response:`, configs);

      if (!configs || configs.length === 0) {
        console.log(`ℹ️ [V1] No custom values for lottery ${lotteryId}`);
        return {};
      }

      // Step 4: Build formData with lottery_XX_ prefix
      const lotteryFormData = {};
      configs.forEach(config => {
        // ✅ FIX: fieldCode ya incluye betTypeCode, NO duplicar
        // Build key: lottery_43_DIRECTO_PRIMER_PAGO (sin duplicación)
        const fieldKey = `lottery_${lotteryId}_${config.fieldCode}`;
        // ✅ FIX: API returns 'customValue', not 'value'
        lotteryFormData[fieldKey] = config.customValue;

        console.log(`  ✓ [V1] Loaded: ${fieldKey} = ${config.customValue}`);
      });

      console.log(`✅ [V1] Loaded ${Object.keys(lotteryFormData).length} lottery-specific values`);
      return lotteryFormData;

    } catch (error) {
      console.error(`❌ [V1] Error loading lottery-specific values for lottery ${lotteryId}:`, error);
      return {};
    }
  };

  const handleSubmit = async (e) => {
    console.log('💾 handleSubmit called - Stack trace:', new Error().stack);
    e.preventDefault();

    if (loading) {
      logger.warn('EDIT_BANCA', 'Ya hay una operación en proceso');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors({});

    // Validate form before submitting
    const validation = validateForm();

    if (!validation.isValid) {
      // Build specific error message listing all fields with errors
      const errorMessage = `Por favor corrija los siguientes campos: ${validation.errorFields.join(', ')}`;
      setError(errorMessage);
      setLoading(false);
      return;
    }

    try {
      logger.info('EDIT_BANCA', 'Guardando cambios de banca y configuración', { branchId: id });

      // Detect changes in different sections
      const basicChanged = hasBasicDataChanged();
      const configChanged = hasConfigDataChanged();
      const prizeChanged = hasPrizeDataChanged();
      const scheduleChanged = hasScheduleDataChanged();
      const drawsChanged = hasDrawsDataChanged();

      logger.info('EDIT_BANCA', 'Detección de cambios', {
        basicChanged,
        configChanged,
        prizeChanged,
        scheduleChanged,
        drawsChanged
      });

      // PASO 1: Actualizar datos básicos de la banca (solo si cambiaron)
      if (basicChanged) {
        const branchUpdateData = {
          bettingPoolName: formData.branchName,
          zoneId: formData.selectedZone ? parseInt(formData.selectedZone) : null,
          location: formData.location || null,
          reference: formData.reference || null,
          comment: formData.comment || null,
          isActive: formData.isActive
        };

        logger.info('EDIT_BANCA', 'Actualizando datos básicos de la banca', { branchUpdateData });
        const branchResult = await updateBranch(id, branchUpdateData);

        if (!branchResult || branchResult.error) {
          throw new Error(branchResult?.error || 'Error al actualizar datos básicos de la banca');
        }

        logger.success('EDIT_BANCA', 'Datos básicos actualizados exitosamente');
      } else {
        logger.info('EDIT_BANCA', 'Sin cambios en datos básicos, omitiendo actualización');
      }

      // PASO 2: Actualizar configuración completa (solo si cambió)
      if (configChanged) {
        // 🔍 DEBUG: Valores de dropdown ANTES de conversión
        console.log('🔍 DROPDOWN VALUES ANTES DE ENVIAR A API:', {
          fallType: formData.fallType,
          discountProvider: formData.discountProvider,
          discountMode: formData.discountMode,
          printerType: formData.printerType,
          limitPreference: formData.limitPreference
        });

        // Construir configuración principal (17 campos) - valores en inglés para DB
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

        // Construir configuración de descuentos (2 campos) - valores en inglés
        const discountConfig = {
          discountProvider: formData.discountProvider === '1' ? 'GROUP' :
                           formData.discountProvider === '2' ? 'SELLER' : 'GROUP',
          discountMode: formData.discountMode === '1' ? 'OFF' :
                       formData.discountMode === '2' ? 'CASH' :
                       formData.discountMode === '3' ? 'FREE_TICKET' : 'OFF'
        };

        // Construir configuración de impresión (5 campos) - valores en inglés
        const printConfig = {
          printMode: formData.printerType === '1' ? 'DRIVER' :
                    formData.printerType === '2' ? 'GENERIC' : 'DRIVER',
          printEnabled: formData.printTickets !== undefined ? formData.printTickets : true,
          printTicketCopy: formData.printTicketCopy !== undefined ? formData.printTicketCopy : true,
          printRechargeReceipt: formData.printRechargeReceipt !== undefined ? formData.printRechargeReceipt : true,
          smsOnly: formData.smsOnly || false
        };

        // Construir configuración de pie de página
        const footer = {
          autoFooter: formData.autoFooter !== undefined ? formData.autoFooter : false,
          footerLine1: formData.footerText1 || null,
          footerLine2: formData.footerText2 || null,
          footerLine3: formData.footerText3 || null,
          footerLine4: formData.footerText4 || null
        };

        // 🔍 DEBUG: Valores CONVERTIDOS que se envían a la API
        console.log('🔍 DROPDOWN VALUES CONVERTIDOS PARA API:', {
          fallType: config.fallType,
          discountProvider: discountConfig.discountProvider,
          discountMode: discountConfig.discountMode,
          printMode: printConfig.printMode,
          paymentMode: config.paymentMode
        });

        logger.info('EDIT_BANCA', 'Actualizando configuración de la banca');
        const configResult = await updateBranchConfig(id, config, discountConfig, printConfig, footer);

        if (configResult.success) {
          logger.success('EDIT_BANCA', 'Banca y configuración actualizadas exitosamente', { branchId: id });
        } else {
          throw new Error('Error al actualizar la configuración de la banca');
        }
      } else {
        logger.info('EDIT_BANCA', 'Sin cambios en configuración, omitiendo actualización');
      }

      // PASO 3: Guardar valores de Premios & Comisiones (solo si cambiaron)
      if (prizeChanged) {
        try {
          const t0 = performance.now();
          logger.info('EDIT_BANCA', '🚀 [OPTIMIZADO] Guardando configuración de premios con PATCH');

          // Obtener todos los prize fields para construir el lookup map (se hace solo una vez)
          const t1 = performance.now();
          const prizeFieldsResponse = await getPrizeFields();
          const t2 = performance.now();
          logger.info('EDIT_BANCA', `⏱️ getPrizeFields() tardó ${(t2 - t1).toFixed(0)}ms`);

          // Construir lookup maps
          const t3 = performance.now();
          const fieldCodeToId = {};
          const fieldCodeToDefaultValue = {};
          if (prizeFieldsResponse && Array.isArray(prizeFieldsResponse)) {
            prizeFieldsResponse.forEach(betType => {
              const prizeFields = betType.prizeFields || betType.PrizeFields || [];
              prizeFields.forEach(field => {
                const fieldCode = field.fieldCode || field.FieldCode;
                const prizeFieldId = field.prizeFieldId || field.PrizeFieldId;
                const defaultValue = field.defaultValue || field.DefaultValue;
                if (fieldCode && prizeFieldId) {
                  fieldCodeToId[fieldCode] = prizeFieldId;
                  fieldCodeToDefaultValue[fieldCode] = parseFloat(defaultValue) || 0;
                }
              });
            });
          }
          const t4 = performance.now();
          logger.info('EDIT_BANCA', `⏱️ Construcción de lookup maps tardó ${(t4 - t3).toFixed(0)}ms`);

          // 🎯 DETECCIÓN GRANULAR: Comparar formData actual vs initialFormData
          const t5 = performance.now();
          const changedGeneralFields = [];
          const changedLotteryFields = {}; // Agrupados por lotería

          // Procesar campos GENERAL
          const generalPremioKeys = Object.keys(formData).filter(key => key.startsWith('general_'));
          generalPremioKeys.forEach(key => {
            const currentValue = formData[key];
            const initialValue = initialFormData ? initialFormData[key] : undefined;

            console.log(`🔍 [PREMIO DEBUG GENERAL] Campo: ${key}`, {
              currentValue,
              initialValue,
              sonDiferentes: currentValue !== initialValue
            });

            // Solo procesar si el valor REALMENTE cambió
            if (currentValue !== initialValue && currentValue !== '' && currentValue !== null && currentValue !== undefined) {
              // ✅ FIX: Formato input ahora es "general_DIRECTO_PRIMER_PAGO" (sin duplicación)
              // Simplemente quitar el prefijo "general_"
              const fieldCode = key.replace('general_', ''); // "DIRECTO_PRIMER_PAGO"

              const parsedValue = parseFloat(currentValue) || 0;
              const defaultValue = fieldCodeToDefaultValue[fieldCode] || 0;

              if (fieldCodeToId[fieldCode] && parsedValue !== defaultValue) {
                changedGeneralFields.push({
                  prizeFieldId: fieldCodeToId[fieldCode],
                  fieldCode: fieldCode,
                  value: parsedValue
                });
                logger.info('EDIT_BANCA', `✓ [GENERAL] Campo CAMBIADO: ${fieldCode} = ${parsedValue}`);
              }
            }
          });

          // Procesar campos LOTTERY_XX_
          const lotteryPremioKeys = Object.keys(formData).filter(key => key.startsWith('lottery_'));
          lotteryPremioKeys.forEach(key => {
            const currentValue = formData[key];
            const initialValue = initialFormData ? initialFormData[key] : undefined;

            console.log(`🔍 [PREMIO DEBUG LOTTERY] Campo: ${key}`, {
              currentValue,
              initialValue,
              sonDiferentes: currentValue !== initialValue
            });

            // Solo procesar si el valor REALMENTE cambió
            if (currentValue !== initialValue && currentValue !== '' && currentValue !== null && currentValue !== undefined) {
              // ✅ FIX: Formato input ahora es "lottery_43_DIRECTO_PRIMER_PAGO" (sin duplicación)
              // Extraer lotteryId y fieldCode
              const parts = key.split('_');
              const lotteryId = parts[1]; // "43"
              const fieldCode = parts.slice(2).join('_'); // "DIRECTO_PRIMER_PAGO"

              const parsedValue = parseFloat(currentValue) || 0;

              if (fieldCodeToId[fieldCode]) {
                if (!changedLotteryFields[lotteryId]) {
                  changedLotteryFields[lotteryId] = [];
                }
                changedLotteryFields[lotteryId].push({
                  prizeFieldId: fieldCodeToId[fieldCode],
                  fieldCode: fieldCode,
                  value: parsedValue
                });
                logger.info('EDIT_BANCA', `✓ [LOTTERY ${lotteryId}] Campo CAMBIADO: ${fieldCode} = ${parsedValue}`);
              }
            }
          });

          const t6 = performance.now();
          logger.info('EDIT_BANCA', `⏱️ Detección de cambios tardó ${(t6 - t5).toFixed(0)}ms`);
          logger.info('EDIT_BANCA', `  - General: ${changedGeneralFields.length} campos`);
          logger.info('EDIT_BANCA', `  - Loterías: ${Object.keys(changedLotteryFields).length} loterías con cambios`);

          // 🚀 GUARDAR campos GENERAL con PATCH
          if (changedGeneralFields.length > 0) {
            logger.info('EDIT_BANCA', `📤 Guardando ${changedGeneralFields.length} campo(s) GENERAL`);
            const t7 = performance.now();
            const result = await patchBancaPrizeConfig(id, changedGeneralFields);
            const t8 = performance.now();
            logger.success('EDIT_BANCA', `✅ GENERAL guardado: ${result?.updatedCount || 0} actualizados, ${result?.savedCount || 0} nuevos`);
            logger.info('EDIT_BANCA', `⏱️ PATCH request tardó ${(t8 - t7).toFixed(0)}ms`);
          }

          // 🚀 GUARDAR campos LOTTERY-SPECIFIC con POST
          for (const [lotteryId, fields] of Object.entries(changedLotteryFields)) {
            try {
              logger.info('EDIT_BANCA', `📤 Guardando ${fields.length} campo(s) para lotería ${lotteryId}`);

              // Obtener draws de esta lotería
              const drawsResponse = await fetch(`/api/draws/lottery/${lotteryId}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                  'Content-Type': 'application/json'
                }
              });

              if (!drawsResponse.ok) {
                logger.error('EDIT_BANCA', `No se pudieron obtener draws para lotería ${lotteryId}`);
                continue;
              }

              const draws = await drawsResponse.json();
              if (!draws || draws.length === 0) {
                logger.error('EDIT_BANCA', `No hay draws disponibles para lotería ${lotteryId}`);
                continue;
              }

              const firstDraw = draws[0];
              const drawId = firstDraw.drawId;

              // Guardar en draw-specific endpoint
              const saveResponse = await fetch(`/api/betting-pools/${id}/draws/${drawId}/prize-config`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prizeConfigs: fields })
              });

              if (!saveResponse.ok) {
                logger.error('EDIT_BANCA', `Error guardando lotería ${lotteryId}: ${saveResponse.status}`);
                continue;
              }

              logger.success('EDIT_BANCA', `✅ Lotería ${lotteryId} guardada correctamente (${fields.length} campos)`);
            } catch (error) {
              logger.error('EDIT_BANCA', `Error guardando lotería ${lotteryId}:`, error);
            }
          }

          if (changedGeneralFields.length === 0 && Object.keys(changedLotteryFields).length === 0) {
            logger.info('EDIT_BANCA', '⊝ No hay cambios reales en premios');
          }

          const tTotal = performance.now();
          logger.info('EDIT_BANCA', `⏱️ ⚡ TIEMPO TOTAL de actualización de premios: ${(tTotal - t0).toFixed(0)}ms`);
        } catch (premioError) {
          logger.error('EDIT_BANCA', 'Error al guardar configuración de premios', { error: premioError.message });
          // No fallar toda la operación si solo fallan los premios
          console.warn('Error al guardar premios, pero la banca se actualizó correctamente:', premioError);
        }
      } else {
        logger.info('EDIT_BANCA', 'Sin cambios en premios, omitiendo actualización');
      }

      // PASO 4: Actualizar horarios (solo si cambiaron)
      if (scheduleChanged) {
        try {
          logger.info('EDIT_BANCA', 'Actualizando horarios de la banca');
          const schedules = transformSchedulesToApiFormat(formData);
          const result = await saveBettingPoolSchedules(id, schedules);

          if (result.success) {
            logger.success('EDIT_BANCA', 'Horarios actualizados exitosamente');
          } else {
            throw new Error('Error al guardar horarios');
          }
        } catch (scheduleError) {
          logger.error('EDIT_BANCA', 'Error al guardar horarios', { error: scheduleError.message });
          // No fallar toda la operación si solo fallan los horarios
          console.warn('Error al guardar horarios, pero la banca se actualizó correctamente:', scheduleError);
        }
      } else {
        logger.info('EDIT_BANCA', 'Sin cambios en horarios, omitiendo actualización');
      }

      // PASO 5: Actualizar draws (solo si cambiaron)
      if (drawsChanged) {
        try {
          logger.info('EDIT_BANCA', 'Actualizando draws de la banca');

          // Build draws array from formData
          const drawsToSave = [];

          formData.selectedLotteries.forEach(lotteryId => {
            const hasAnticipatedClosing = formData.anticipatedClosingLotteries?.includes(lotteryId);
            drawsToSave.push({
              lotteryId: lotteryId,
              isActive: true,  // Changed from isEnabled
              anticipatedClosingMinutes: hasAnticipatedClosing ? parseInt(formData.anticipatedClosing) || null : null,  // Changed from anticipatedClosing
              enabledGameTypeIds: []
            });
          });

          logger.info('EDIT_BANCA', `Guardando ${drawsToSave.length} draws`);
          logger.info('EDIT_BANCA', '📋 Datos de cierre anticipado:', {
            anticipatedClosing: formData.anticipatedClosing,
            anticipatedClosingLotteries: formData.anticipatedClosingLotteries,
            drawsPayload: drawsToSave
          });
          const result = await saveBettingPoolDraws(id, drawsToSave);

          if (result.success) {
            logger.success('EDIT_BANCA', 'Draws actualizados exitosamente');
          } else {
            throw new Error('Error al guardar draws');
          }
        } catch (drawError) {
          logger.error('EDIT_BANCA', 'Error al guardar draws', { error: drawError.message });
          // No fallar toda la operación si solo fallan los draws
          console.warn('Error al guardar draws, pero la banca se actualizó correctamente:', drawError);
        }
      } else {
        logger.info('EDIT_BANCA', 'Sin cambios en draws, omitiendo actualización');
      }

      // If no sections changed at all, notify the user
      if (!basicChanged && !configChanged && !prizeChanged && !scheduleChanged && !drawsChanged) {
        setSuccess('No se detectaron cambios para guardar');
        setLoading(false);
        return;
      }

      setSuccess('Banca actualizada exitosamente');
      // Mantenerse en el formulario para permitir ediciones adicionales
    } catch (error) {
      logger.error('EDIT_BANCA', 'Error actualizando banca', {
        branchId: id,
        error: error.message
      });
      setError(`Error al actualizar: ${error.message}`);
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

  // Funciones para configuración de premios por sorteo
  const openDrawPrizeConfig = async (draw) => {
    setSelectedDraw(draw);
    setShowDrawPrizeModal(true);
    setLoadingDrawPrizes(true);

    try {
      // Cargar configuración resuelta (con prioridad en cascada)
      const resolvedConfig = await getResolvedDrawPrizeConfig(id, draw.id);
      setDrawPrizeConfig(resolvedConfig);
      logger.success('DRAW_PRIZE_CONFIG', `Loaded config for draw ${draw.name}`, { count: resolvedConfig.length });
    } catch (error) {
      logger.error('DRAW_PRIZE_CONFIG_ERROR', `Failed to load config for draw ${draw.name}`, { error });
      setDrawPrizeConfig([]);
    } finally {
      setLoadingDrawPrizes(false);
    }
  };

  const closeDrawPrizeModal = () => {
    setShowDrawPrizeModal(false);
    setSelectedDraw(null);
    setDrawPrizeConfig([]);
  };

  const handleDrawPrizeValueChange = (prizeFieldId, newValue) => {
    setDrawPrizeConfig(prev =>
      prev.map(field =>
        field.prizeFieldId === prizeFieldId
          ? { ...field, customValue: parseFloat(newValue) || 0 }
          : field
      )
    );
  };

  const handleSaveDrawPrizeConfig = async () => {
    if (!selectedDraw) return;

    setSavingDrawPrizes(true);

    try {
      // Filtrar solo los campos que tienen configuración específica del sorteo (source === 'draw_specific')
      // O los que fueron modificados manualmente
      const configsToSave = drawPrizeConfig
        .filter(field => field.source === 'draw_specific' || field.configId > 0)
        .map(field => ({
          prizeFieldId: field.prizeFieldId,
          fieldCode: field.fieldCode,
          value: field.customValue
        }));

      await saveDrawPrizeConfig(id, selectedDraw.id, configsToSave);

      logger.success('DRAW_PRIZE_CONFIG_SAVED', `Saved config for draw ${selectedDraw.name}`, {
        count: configsToSave.length
      });

      setSuccess(`Configuración de premios guardada para ${selectedDraw.name}`);
      setTimeout(() => setSuccess(''), 3000);

      closeDrawPrizeModal();
    } catch (error) {
      logger.error('DRAW_PRIZE_CONFIG_SAVE_ERROR', `Failed to save config for draw ${selectedDraw.name}`, { error });
      setError('Error al guardar la configuración de premios del sorteo');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSavingDrawPrizes(false);
    }
  };

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
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
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
                  style={validationErrors.selectedZone ? { borderColor: 'red', fontSize: '12px' } : { fontSize: '12px' }}
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
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
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
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
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
          bancaId={parseInt(id)}
          onPrizeValuesLoaded={handlePrizeValuesLoaded}
          loadLotterySpecificValues={loadLotterySpecificValues}
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
              </div>
            </div>

            {/* Martes */}
            <div className="horario-row">
              <label className="horario-label">Martes</label>
              <div className="horario-inputs">
                <input type="text" name="martesInicio" value={formData.martesInicio} readOnly onClick={(e) => openTimePicker('martesInicio', e)} className="horario-input" placeholder="12:00 AM" />
                <span className="horario-arrow">→</span>
                <input type="text" name="martesFin" value={formData.martesFin} readOnly onClick={(e) => openTimePicker('martesFin', e)} className="horario-input" placeholder="11:59 PM" />
              </div>
            </div>

            {/* Miércoles */}
            <div className="horario-row">
              <label className="horario-label">Miércoles</label>
              <div className="horario-inputs">
                <input type="text" name="miercolesInicio" value={formData.miercolesInicio} readOnly onClick={(e) => openTimePicker('miercolesInicio', e)} className="horario-input" placeholder="12:00 AM" />
                <span className="horario-arrow">→</span>
                <input type="text" name="miercolesFin" value={formData.miercolesFin} readOnly onClick={(e) => openTimePicker('miercolesFin', e)} className="horario-input" placeholder="11:59 PM" />
              </div>
            </div>

            {/* Jueves */}
            <div className="horario-row">
              <label className="horario-label">Jueves</label>
              <div className="horario-inputs">
                <input type="text" name="juevesInicio" value={formData.juevesInicio} readOnly onClick={(e) => openTimePicker('juevesInicio', e)} className="horario-input" placeholder="12:00 AM" />
                <span className="horario-arrow">→</span>
                <input type="text" name="juevesFin" value={formData.juevesFin} readOnly onClick={(e) => openTimePicker('juevesFin', e)} className="horario-input" placeholder="11:59 PM" />
              </div>
            </div>

            {/* Viernes */}
            <div className="horario-row">
              <label className="horario-label">Viernes</label>
              <div className="horario-inputs">
                <input type="text" name="viernesInicio" value={formData.viernesInicio} readOnly onClick={(e) => openTimePicker('viernesInicio', e)} className="horario-input" placeholder="12:00 AM" />
                <span className="horario-arrow">→</span>
                <input type="text" name="viernesFin" value={formData.viernesFin} readOnly onClick={(e) => openTimePicker('viernesFin', e)} className="horario-input" placeholder="11:59 PM" />
              </div>
            </div>

            {/* Sábado */}
            <div className="horario-row">
              <label className="horario-label">Sábado</label>
              <div className="horario-inputs">
                <input type="text" name="sabadoInicio" value={formData.sabadoInicio} readOnly onClick={(e) => openTimePicker('sabadoInicio', e)} className="horario-input" placeholder="12:00 AM" />
                <span className="horario-arrow">→</span>
                <input type="text" name="sabadoFin" value={formData.sabadoFin} readOnly onClick={(e) => openTimePicker('sabadoFin', e)} className="horario-input" placeholder="11:59 PM" />
              </div>
            </div>

            {/* Domingo */}
            <div className="horario-row">
              <label className="horario-label">Domingo</label>
              <div className="horario-inputs">
                <input type="text" name="domingoInicio" value={formData.domingoInicio} readOnly onClick={(e) => openTimePicker('domingoInicio', e)} className="horario-input" placeholder="12:00 AM" />
                <span className="horario-arrow">→</span>
                <input type="text" name="domingoFin" value={formData.domingoFin} readOnly onClick={(e) => openTimePicker('domingoFin', e)} className="horario-input" placeholder="11:59 PM" />
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
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
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

      const allLotteryIds = lotteries.map(l => l.id);
      const allSelected = allLotteryIds.every(id => formData.selectedLotteries.includes(id));

      return (
        <div className="sorteos-container">
          {/* Todos los sorteos en un solo grupo unificado */}
          <div className="sorteo-btn-group-unified">
            {lotteries.map((lottery) => (
              <div key={lottery.id} style={{ position: 'relative', display: 'inline-block' }}>
                <label
                  className={`sorteo-btn-label ${formData.selectedLotteries.includes(lottery.id) ? 'active' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedLotteries.includes(lottery.id)}
                    onChange={() => handleLotteryToggle(lottery.id)}
                  />
                  {lottery.name}
                </label>
                {formData.selectedLotteries.includes(lottery.id) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDrawPrizeConfig(lottery);
                    }}
                    style={{
                      position: 'absolute',
                      right: '2px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '0 4px',
                      opacity: 0.7,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                    onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                    title={`Configurar premios de ${lottery.name}`}
                  >
                    ⚙️
                  </button>
                )}
              </div>
            ))}
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
                placeholder="Seleccionar loterías..."
              />
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
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
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
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
        <h1>Actualizar banca '{formData.branchName || '...'} ({formData.branchCode || '...'})'</h1>
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

      {/* Draw Prize Config Modal */}
      {showDrawPrizeModal && selectedDraw && (
        <div
          className="modal-overlay"
          onClick={closeDrawPrizeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                Configuración de Premios - {selectedDraw.name}
              </h2>
              <button
                onClick={closeDrawPrizeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            {loadingDrawPrizes ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Cargando configuración...</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Campo de Premio</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Valor</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Origen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drawPrizeConfig.map((field) => (
                        <tr key={field.prizeFieldId} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>
                            {field.fieldCode}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={field.customValue}
                              onChange={(e) => handleDrawPrizeValueChange(field.prizeFieldId, e.target.value)}
                              style={{
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                width: '120px',
                                fontSize: '14px'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor:
                                field.source === 'draw_specific' ? '#d4edda' :
                                field.source === 'banca_default' ? '#fff3cd' :
                                '#f8d7da',
                              color:
                                field.source === 'draw_specific' ? '#155724' :
                                field.source === 'banca_default' ? '#856404' :
                                '#721c24'
                            }}>
                              {field.source === 'draw_specific' ? 'Sorteo' :
                               field.source === 'banca_default' ? 'Banca' :
                               'Sistema'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={closeDrawPrizeModal}
                    style={{
                      padding: '10px 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDrawPrizeConfig}
                    disabled={savingDrawPrizes}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: savingDrawPrizes ? '#ccc' : '#007bff',
                      color: 'white',
                      cursor: savingDrawPrizes ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {savingDrawPrizes ? 'Guardando...' : 'Guardar Configuración'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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

export default EditBanca;
