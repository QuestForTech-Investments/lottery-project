import { useState, useEffect, useCallback, type ChangeEvent, type SyntheticEvent } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
import { useNavigate, useParams } from 'react-router-dom';
import { getBettingPoolById, getBettingPoolConfig, updateBettingPool, updateBettingPoolConfig, handleBettingPoolError, getBettingPools } from '@/services/bettingPoolService';
import { getAllZones } from '@/services/zoneService';
import { savePrizeConfig, getAllBetTypesWithFields, getMergedPrizeData, getBettingPoolPrizeConfigs } from '@/services/prizeService';
import { saveBettingPoolSchedules, transformSchedulesToApiFormat, getBettingPoolSchedules, transformSchedulesToFormFormat } from '@/services/scheduleService';
import { getBettingPoolDraws, saveBettingPoolDraws } from '@/services/sortitionService';
import { getAllDraws } from '@/services/drawService';

// Types and constants extracted for maintainability
import type {
  AutoExpense,
  FormData,
  FormErrors,
  Zone,
  Draw,
  PrizesDraw,
  DrawValuesCache,
  SyntheticEventLike,
  UseEditBettingPoolFormReturn,
  ApiResponse,
  BettingPoolData,
  ConfigResponse,
  DrawApiData,
  BetType,
  PrizeConfig,
  SavePrizeResult,
  PrizeData,
  TemplateFields,
  TemplateBettingPool,
} from './types';
import { DRAW_ORDER } from './constants';
import { INITIAL_FORM_DATA } from './initialState';
import {
  mapConfigToFormData,
  validateFormData,
  hasScheduleChanged,
  hasDrawsChanged,
  generateCopiedSchedules
} from './utils';

/**
 * Custom hook for managing edit betting pool form with ALL 168 fields
 */
const useEditBettingPoolForm = (): UseEditBettingPoolFormReturn => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Form state - uses INITIAL_FORM_DATA from initialState.ts
  const [formData, setFormData] = useState<FormData>({ ...INITIAL_FORM_DATA });

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingBasicData, setLoadingBasicData] = useState<boolean>(true); // ⚡ PROGRESSIVE LOADING: Basic data (General tab)
  const [loadingPrizes, setLoadingPrizes] = useState<boolean>(false); // ⚡ PROGRESSIVE LOADING: Prize data (background)
  const [loadingZones, setLoadingZones] = useState<boolean>(true);
  const [loadingDraws, setLoadingDraws] = useState<boolean>(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]); // ⚡ PERFORMANCE: Load once, share between tabs
  const [prizesDraws, setPrizesDraws] = useState<PrizesDraw[]>([]); // Formatted draws for PrizesTab
  const [drawValuesCache, setDrawValuesCache] = useState<DrawValuesCache>({}); // ⚡ PERFORMANCE: Cache draw-specific values by lotteryId
  const [activeTab, setActiveTab] = useState<number>(0);

  // ⚡ DIRTY TRACKING: Store initial values to detect changes
  const [initialFormData, setInitialFormData] = useState<FormData | null>(null);

  // ========================================
  // 🆕 TEMPLATE COPY STATE
  // ========================================
  const [templateBettingPools, setTemplateBettingPools] = useState<TemplateBettingPool[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [loadingTemplateData, setLoadingTemplateData] = useState<boolean>(false);
  const [templateFields, setTemplateFields] = useState<TemplateFields>({
    configuration: true,
    footers: true,
    prizesAndCommissions: true,
    drawSchedules: true,
    draws: true,
    styles: true,
    rules: true,
  });

  /**
   * Load initial data (zones and bettingPool data)
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps -- loadInitialData should only run when id changes
  useEffect(() => {
    loadInitialData();
  }, [id]);

  /**
   * Load zones and bettingPool data
   * ⚡ PROGRESSIVE LOADING: Two-phase approach
   * Phase 1: Load basic data (zones + betting pool) - FAST, show form immediately
   * Phase 2: Load prizes in background - SLOW, show loading indicators in tabs
   */
  const loadInitialData = async (): Promise<void> => {
    const startTime = performance.now();

    try {
      setLoadingZones(true);
      setLoadingBasicData(true);

      if (id) {
        // ⚡ PHASE 1: Load zones, basic betting pool data, and configuration (FAST)

        // ⚡ PERFORMANCE: Parallelize all API calls (including draws for tabs)
        const apiStartTime = performance.now();

        const [zonesResponse, bettingPoolResponse, configResponse, schedulesResponse, drawsResponse, allDrawsResponse] = await Promise.all([
          getAllZones(),
          getBettingPoolById(id),
          getBettingPoolConfig(id),
          getBettingPoolSchedules(id),
          getBettingPoolDraws(id),  // Returns betting pool draws config
          getAllDraws({ loadAll: true }) // ⚡ Load all draws once for both DrawsTab and PrizesTab
        ]) as unknown as [
          ApiResponse<Zone[]>,
          ApiResponse<BettingPoolData>,
          ApiResponse<ConfigResponse>,
          { success: boolean; data: Array<{ dayOfWeek: number; openingTime: string | null; closingTime: string | null }> },
          ApiResponse<DrawApiData[]>,
          ApiResponse<Draw[]>
        ];

        const apiEndTime = performance.now();
        const apiDuration = apiEndTime - apiStartTime;

        // Start processing data
        const processingStartTime = performance.now();

        // Process zones
        if (zonesResponse.success && zonesResponse.data) {
          setZones(zonesResponse.data);
        }
        setLoadingZones(false);

        // Process all draws (for DrawsTab and PrizesTab)
        if (allDrawsResponse.success && allDrawsResponse.data) {
          // Sort draws according to DRAW_ORDER (for DrawsTab)
          const sortedDraws = allDrawsResponse.data.sort((a, b) => {
            const indexA = DRAW_ORDER.indexOf(a.drawName);
            const indexB = DRAW_ORDER.indexOf(b.drawName);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          setDraws(sortedDraws);

          // Format draws for PrizesTab (with 'General' tab)
          const formattedForPrizes = sortedDraws.map(draw => ({
            id: `draw_${draw.drawId}`,
            name: draw.drawName,
            drawId: draw.drawId
          }));
          setPrizesDraws([
            { id: 'general', name: 'General' }, // Always include "General" first
            ...formattedForPrizes
          ]);

        }
        setLoadingDraws(false);

        // Process betting pool basic data
        if (bettingPoolResponse.success && bettingPoolResponse.data) {
          const branch = bettingPoolResponse.data;

          // ⚡ OPTIMIZATION: Update form with basic data first
          const basicFormData: Partial<FormData> = {
            bettingPoolName: branch.bettingPoolName || '',
            branchCode: branch.bettingPoolCode || branch.branchCode || '',
            username: branch.username || '',
            location: branch.location || '',
            reference: branch.reference || '',
            comment: branch.comment || '',
            selectedZone: String(branch.zoneId ?? ''),
            zoneId: String(branch.zoneId ?? ''), // ✅ FIX: Also set zoneId for GeneralTab
            isActive: branch.isActive !== undefined ? branch.isActive : true
          };

          // ✅ NEW: Map configuration data from API response to form fields
          let configFormData: Partial<FormData> = {};
          if (configResponse && configResponse.success && configResponse.data) {
            configFormData = mapConfigToFormData(configResponse.data);
          }

          // ✅ Process schedules data (now loaded in parallel)
          let scheduleFormData: Partial<FormData> = {};
          try {
            if (schedulesResponse.success && schedulesResponse.data && schedulesResponse.data.length > 0) {
              scheduleFormData = transformSchedulesToFormFormat(schedulesResponse.data as Parameters<typeof transformSchedulesToFormFormat>[0]) as Partial<FormData>;
            }
          } catch (scheduleError) {
            console.error('[ERROR] Error processing schedules:', scheduleError);
            // Don't fail the whole form if schedules fail to load
          }

          // ✅ Process draws data (NEW API format)
          let drawsFormData: { selectedDraws: number[]; anticipatedClosing: string; anticipatedClosingDraws: number[] } = { selectedDraws: [], anticipatedClosing: '', anticipatedClosingDraws: [] };
          try {
            if (drawsResponse.success && drawsResponse.data && drawsResponse.data.length > 0) {
              // NEW API: Response already contains drawId directly! No mapping needed!
              // Format: { bettingPoolDrawId, drawId, drawName, lotteryId, isActive, anticipatedClosingMinutes, ... }

              // Extract enabled draws (active draws)
              const enabledDraws = drawsResponse.data.filter(d => d.isActive);
              const enabledDrawIds = enabledDraws.map(d => d.drawId);

              // Extract draws with anticipated closing
              const drawsWithClosing = drawsResponse.data
                .filter(d => d.anticipatedClosingMinutes != null && d.anticipatedClosingMinutes > 0);

              const drawIdsWithClosing = drawsWithClosing.map(d => d.drawId);

              // Use the first value found (or empty if none) - convert to String like V1
              const anticipatedClosing = drawsWithClosing.length > 0
                ? String(drawsWithClosing[0].anticipatedClosingMinutes)
                : '';

              drawsFormData = {
                selectedDraws: enabledDrawIds,
                anticipatedClosing: anticipatedClosing,
                anticipatedClosingDraws: drawIdsWithClosing
              };

            } else {
              console.warn('[WARN] [DEBUG] No draws data found or empty array');
            }
          } catch (drawsError) {
            console.error('[ERROR] Error processing draws:', drawsError);
            // Don't fail the whole form if draws fail to load
          }

          // ✅ Merge basic data + configuration data + schedule data + draws data
          const completeFormData: FormData = {
            ...formData,
            ...basicFormData,
            ...configFormData,
            ...scheduleFormData,
            ...drawsFormData
          } as FormData;

          setFormData(completeFormData);

          // ⚡ DIRTY TRACKING: Save initial state for comparison
          setInitialFormData(completeFormData);

          const processingEndTime = performance.now();
          const processingDuration = processingEndTime - processingStartTime;

          const phase1Time = (performance.now() - startTime).toFixed(2);

          // ⚡ UNLOCK UI: User can now see and interact with the form
          setLoadingBasicData(false);

          // ⚡ PHASE 2: Load prizes in background (SLOW, doesn't block UI)
          setLoadingPrizes(true);

          loadPrizeValues(id, allDrawsResponse?.data || [])
            .then(prizeValues => {
              if (Object.keys(prizeValues).length > 0) {

                setFormData(prev => ({
                  ...prev,
                  ...prizeValues
                }) as FormData);

                // Update initial form data with prizes
                setInitialFormData(prev => prev ? ({
                  ...prev,
                  ...prizeValues
                }) as FormData : prev);
              }

              const phase2Time = (performance.now() - startTime).toFixed(2);
            })
            .catch(error => {
              console.error('[ERROR] Error loading prize values:', error);
              // Don't fail the whole form if prizes fail to load
            })
            .finally(() => {
              setLoadingPrizes(false);
              const totalTime = (performance.now() - startTime).toFixed(2);
            });
        }
      } else {
        // No ID provided, only load zones
        const zonesResp = await getAllZones() as ApiResponse<Zone[]>;
        if (zonesResp.success && zonesResp.data) {
          setZones(zonesResp.data);
        }
        setLoadingZones(false);
        setLoadingBasicData(false);
      }

    } catch (error) {
      console.error('[ERROR] Error loading initial data:', error);
      setErrors({ submit: 'Error cargando datos del betting pool' });
      setLoadingBasicData(false);
    }
  };

  /**
   * Handle form field changes
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | SyntheticEventLike): void => {
    const { name, value, type, checked } = e.target as { name: string; value: string | number | boolean | number[] | AutoExpense[]; type?: string; checked?: boolean };

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' && name === 'limitPreference' ? null : value)
    }) as FormData);
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (_event: SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  /**
   * Copy schedule to all days - uses generateCopiedSchedules from utils.ts
   */
  const copyScheduleToAll = (day: string): void => {
    const updates = generateCopiedSchedules(formData, day);
    setFormData(prev => ({ ...prev, ...updates }));
  };

  /**
   * Save prize configurations for a betting pool
   * Supports both general configs and lottery-specific configs
   *
   * General configs: POST /betting-pools/{id}/prize-config
   * Draw-specific: POST /betting-pools/{id}/draws/{drawId}/prize-config
   *
   * IMPORTANT: For lottery-specific configs (lottery_XX_), we need to map
   * lotteryId -> drawId. Currently uses the FIRST draw of each lottery.
   *
   * Body format:
   * {
   *   prizeConfigs: [
   *     { prizeTypeId: 15, fieldCode: "DIRECTO_PRIMER_PAGO", value: 80 }
   *   ]
   * }
   *
   * @param allowDrawSpecific - If true, allows saving draw-specific fields (draw_XX_*).
   *                            Set to true when called from savePrizeConfigForSingleDraw().
   *                            Default is false (only saves general_* fields).
   */
  const savePrizeConfigurations = async (
    bettingPoolId: string | undefined,
    currentFormData: FormData | Record<string, string | number | boolean | number[] | AutoExpense[] | null>,
    initialData: FormData | null = null,
    allowDrawSpecific: boolean = false
  ): Promise<SavePrizeResult> => {
    const startTime = performance.now();

    try {
      // Get all bet types to build fieldCode -> prizeTypeId map
      const betTypes = await getAllBetTypesWithFields();

      // Build a map: fieldCode -> prizeTypeId
      const fieldCodeToId: Record<string, number> = {};
      (betTypes as BetType[]).forEach(betType => {
        if (betType.prizeFields) {
          betType.prizeFields.forEach(field => {
            fieldCodeToId[field.fieldCode] = field.prizeTypeId;
          });
        }
      });


      // Group configs by lottery (general vs lottery_XX)
      const configsByLottery: Record<string, PrizeConfig[]> = {};
      const prizeFieldSet = new Set(Object.keys(fieldCodeToId));

      // ⚡ OPTIMIZED: More efficient filtering + DIRTY TRACKING
      // Group fields by lottery ID
      // 🔥 IMPORTANT: Only save "general_*" fields in main form submit
      // Draw-specific fields (draw_XX_*) are saved via "ACTUALIZAR" button only

      let debugCount = 0;
      Object.keys(currentFormData).forEach(key => {
        // Skip non-prize type fields
        const fieldValue = currentFormData[key];
        if (!key.includes('_') || fieldValue === '' || fieldValue === null || fieldValue === undefined) {
          return;
        }

        // Prize type fields have format:
        //   - V1: BETTYPE_FIELDCODE (e.g., "DIRECTO_DIRECTO_PRIMER_PAGO")
        //   - V2: {lotteryId}_{betTypeCode}_{fieldCode} (e.g., "general_DIRECTO_DIRECTO_PRIMER_PAGO")

        let cleanKey = key;
        let lotteryId = null;

        // ✅ FIX: Remove lottery prefix if present
        const parts = key.split('_');

        // Check for "general_" prefix - ONLY process general fields in main save
        if (parts[0] === 'general' && parts.length >= 4) {
          lotteryId = 'general';
          cleanKey = parts.slice(1).join('_'); // Remove "general_"
        }
        // Draw-specific fields (draw_XX_*) - only process if allowDrawSpecific is true
        else if (parts[0] === 'draw' && parts.length >= 5) {
          if (!allowDrawSpecific) {
            // Skip - draw-specific configs are saved separately via savePrizeConfigForSingleDraw()
            return;
          }
          lotteryId = `${parts[0]}_${parts[1]}`; // "draw_43"
          cleanKey = parts.slice(2).join('_'); // Remove "draw_XX_"
        }
        // Lottery-specific fields (lottery_XX_*) - legacy format, only process if allowDrawSpecific
        else if (parts[0] === 'lottery' && parts.length >= 5) {
          if (!allowDrawSpecific) {
            // Skip - lottery-specific configs are saved separately
            return;
          }
          lotteryId = `${parts[0]}_${parts[1]}`; // "lottery_43"
          cleanKey = parts.slice(2).join('_'); // Remove "lottery_XX_"
        }
        // V1 format without prefix - treat as general
        else if (parts.length >= 3) {
          lotteryId = 'general';
          cleanKey = key;
        }

        // Now extract betTypeCode and fieldCode from cleanKey
        const cleanParts = cleanKey.split('_');
        if (cleanParts.length >= 3) {
          const fieldCode = cleanParts.slice(1).join('_'); // "DIRECTO_PRIMER_PAGO"

          // Check if this fieldCode exists in our bet types
          if (prizeFieldSet.has(fieldCode)) {
            const prizeTypeId = fieldCodeToId[fieldCode];
            const rawValue = currentFormData[key];
            const currentValue = parseFloat(String(rawValue));
            const initialValue = initialData?.[key as keyof FormData];
            const initialValueParsed = parseFloat(String(initialValue ?? ''));

            // Debug first 3 fields
            if (debugCount < 3 && key.startsWith('general_')) {
              debugCount++;
            }

            // ⚡ DIRTY TRACKING: Only include if value changed
            const hasChanged = !initialData ||
                               initialData[key as keyof FormData] === undefined ||
                               parseFloat(String(initialData[key as keyof FormData])) !== currentValue;

            if (hasChanged && lotteryId) {
              if (!configsByLottery[lotteryId]) {
                configsByLottery[lotteryId] = [];
              }

              configsByLottery[lotteryId].push({
                prizeTypeId: prizeTypeId,
                fieldCode: fieldCode,
                value: currentValue
              });
            }
          }
        }
      });

      if (Object.keys(configsByLottery).length === 0) {
        return { success: true, message: 'No changes', skipped: true };
      }


      // ⚡ OPTIMIZED: Use batch endpoint for draw-specific configs
      // Collect all draw configs into a single batch request
      let totalSaved = 0;
      let totalFailed = 0;
      const results: { success: boolean; lottery: string; count?: number; error?: string }[] = [];

      // Separate general from draw-specific configs
      const generalConfigs = configsByLottery['general'] || [];
      const drawConfigs: { drawId: number; prizeConfigs: PrizeConfig[] }[] = [];

      for (const [lotteryIdKey, prizeConfigs] of Object.entries(configsByLottery)) {
        if (lotteryIdKey === 'general') {
          continue; // Handle separately
        } else if (lotteryIdKey.startsWith('draw_')) {
          const drawId = parseInt(lotteryIdKey.split('_')[1]);
          drawConfigs.push({ drawId, prizeConfigs });
        }
        // Skip legacy lottery_XX format - not commonly used
      }

      // Save general configs (1 request)
      if (generalConfigs.length > 0) {
        try {
          await savePrizeConfig(bettingPoolId || '', generalConfigs);
          totalSaved += generalConfigs.length;
          results.push({ success: true, lottery: 'general', count: generalConfigs.length });
        } catch (error) {
          console.error(`[ERROR] Error saving general configs:`, error);
          totalFailed += generalConfigs.length;
          results.push({ success: false, lottery: 'general', error: (error as Error).message });
        }
      }

      // ⚡ OPTIMIZED: Save all draw configs in ONE batch request (instead of 70+ individual)
      if (drawConfigs.length > 0) {
        try {
          const response = await fetch(`${API_BASE}/betting-pools/${bettingPoolId}/draws/prize-config/batch`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              drawConfigs: drawConfigs
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const batchResult = await response.json();
          totalSaved += batchResult.totalConfigsSaved + batchResult.totalConfigsUpdated;
          results.push({
            success: true,
            lottery: `batch_${drawConfigs.length}_draws`,
            count: batchResult.totalConfigsSaved + batchResult.totalConfigsUpdated
          });
        } catch (error) {
          console.error(`[ERROR] Error in batch save for ${drawConfigs.length} draws:`, error);
          const totalDrawConfigs = drawConfigs.reduce((sum, dc) => sum + dc.prizeConfigs.length, 0);
          totalFailed += totalDrawConfigs;
          results.push({ success: false, lottery: 'batch_draws', error: (error as Error).message });
        }
      }

      const endTime = performance.now();
      const saveTime = (endTime - startTime).toFixed(2);

      if (totalFailed === 0) {
        console.log(`[INFO] ⚡ Prize configurations saved in ${saveTime}ms (optimized batch)`);
      } else {
        console.warn(`[WARN] Prize configurations partially saved: ${totalSaved} succeeded, ${totalFailed} failed`);
      }

      return {
        success: totalFailed === 0,
        total: totalSaved + totalFailed,
        successful: totalSaved,
        failed: totalFailed,
        results
      };
    } catch (err) {
      const error = err as Error;
      const endTime = performance.now();
      const saveTime = (endTime - startTime).toFixed(2);
      console.error(`[ERROR] Error saving prize configurations after ${saveTime}ms:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  /**
   * Load prize values for the betting pool
   * Merges default values from bet types with custom values from banca_prize_configs
   */
  const loadPrizeValues = async (bettingPoolId: string, drawsList?: Draw[]): Promise<Record<string, string | number>> => {
    try {

      // Get merged prize data (defaults + custom values)
      const prizeData = await getMergedPrizeData(bettingPoolId) as PrizeData | null;

      if (!prizeData || !prizeData.betTypes) {
        return {};
      }

      // Build formData object from prize data
      const prizeFormData: Record<string, string | number> = {};
      const customMap = (prizeData.customMap || {}) as Record<string, number>;

      // Process each bet type
      (prizeData.betTypes ?? []).forEach((betType: BetType) => {
        if (!betType.prizeFields || betType.prizeFields.length === 0) {
          return;
        }

        // Process each prize type field
        betType.prizeFields.forEach(field => {
          // ✅ FIX: Use "general_" prefix to match PrizesTab format
          const fieldKey = `general_${betType.betTypeCode}_${field.fieldCode}`;
          const customKey = `${betType.betTypeCode}_${field.fieldCode}`;

          // Start with default value from the field
          let value: string | number = field.defaultMultiplier || '';

          // Override with custom value if it exists
          if (customMap[customKey] !== undefined) {
            value = customMap[customKey];
          } else {
          }

          // Store in formData format with "general_" prefix
          prizeFormData[fieldKey] = value;
        });
      });

      // 🆕 Also load commission values from prizes-commissions endpoint
      const commissionFormData = await loadCommissionValues(bettingPoolId, drawsList);

      return { ...prizeFormData, ...commissionFormData };
    } catch (error) {
      console.error('Error loading prize values:', error);
      return {};
    }
  };

  /**
   * 🆕 Load commission values from the prizes-commissions endpoint
   * Maps backend column names to frontend formData keys
   */
  const loadCommissionValues = async (bettingPoolId: string, drawsList?: Draw[]): Promise<Record<string, string | number>> => {
    try {
      const response = await fetch(`${API_BASE}/betting-pools/${bettingPoolId}/prizes-commissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return {};
      }

      const commissions = await response.json();
      if (!Array.isArray(commissions) || commissions.length === 0) {
        return {};
      }

      const commissionFormData: Record<string, string | number> = {};

      // Map backend GameType to frontend betTypeCode
      const gameTypeMap: Record<string, string> = {
        'DIRECTO': 'DIRECTO',
        'PALE': 'PALÉ',
        'TRIPLETA': 'TRIPLETA',
        'CASH3_STRAIGHT': 'CASH3_STRAIGHT',
        'CASH3_BOX': 'CASH3_BOX',
        'PLAY4_STRAIGHT': 'PLAY4 STRAIGHT',
        'PLAY4_BOX': 'PLAY4 BOX',
        'SUPER_PALE': 'SUPER_PALE',
        'BOLITA_1': 'BOLITA 1',
        'BOLITA_2': 'BOLITA 2',
        'SINGULACION_1': 'SINGULACIÓN 1',
        'SINGULACION_2': 'SINGULACIÓN 2',
        'SINGULACION_3': 'SINGULACIÓN 3',
        'PICK5_STRAIGHT': 'PICK5 STRAIGHT',
        'PICK5_BOX': 'PICK5 BOX',
        'PICK_TWO': 'PICK TWO',
        'PICK2': 'PICK2',
        'CASH3_FRONT_STRAIGHT': 'CASH3 FRONT STRAIGHT',
        'CASH3_FRONT_BOX': 'CASH3_FRONT_BOX',
        'CASH3_BACK_STRAIGHT': 'CASH3_BACK_STRAIGHT',
        'CASH3_BACK_BOX': 'CASH3 BACK BOX',
        'PICK_TWO_FRONT': 'PICK TWO FRONT',
        'PICK_TWO_BACK': 'PICK TWO BACK',
        'PICK_TWO_MIDDLE': 'PICK TWO MIDDLE',
        'SINGULACION': 'SINGULACION',
        'PANAMA': 'PANAMA',
      };

      // Build lotteryId -> drawIds mapping from available draws
      const lotteryToDrawIds: Record<number, number[]> = {};
      const availableDraws = drawsList || draws;
      availableDraws.forEach(d => {
        if (d.lotteryId) {
          if (!lotteryToDrawIds[d.lotteryId]) lotteryToDrawIds[d.lotteryId] = [];
          lotteryToDrawIds[d.lotteryId].push(d.drawId);
        }
      });

      // Process each commission record
      commissions.forEach((record: {
        gameType: string;
        lotteryId: number | null;
        commissionDiscount1: number | null;
        commissionDiscount2: number | null;
        commissionDiscount3: number | null;
        commissionDiscount4: number | null;
        commission2Discount1: number | null;
        commission2Discount2: number | null;
        commission2Discount3: number | null;
        commission2Discount4: number | null;
      }) => {
        // Map GameType to betTypeCode
        const betTypeCode = gameTypeMap[record.gameType] || record.gameType;

        // Build list of prefixes: general or one per drawId matching this lotteryId
        const prefixes: string[] = [];
        if (record.lotteryId === null) {
          prefixes.push('general');
        } else {
          const drawIds = lotteryToDrawIds[record.lotteryId];
          if (drawIds && drawIds.length > 0) {
            drawIds.forEach(dId => prefixes.push(`draw_${dId}`));
          } else {
            // Fallback: use lotteryId directly (legacy)
            prefixes.push(`draw_${record.lotteryId}`);
          }
        }

        // Create formData keys for each prefix
        prefixes.forEach(prefix => {
          // Map commission fields (Comisiones tab)
          if (record.commissionDiscount1 !== null && record.commissionDiscount1 !== 0) {
            commissionFormData[`${prefix}_COMMISSION_${betTypeCode}_COMMISSION_DISCOUNT_1`] = record.commissionDiscount1;
          }
          if (record.commissionDiscount2 !== null && record.commissionDiscount2 !== 0) {
            commissionFormData[`${prefix}_COMMISSION_${betTypeCode}_COMMISSION_DISCOUNT_2`] = record.commissionDiscount2;
          }
          if (record.commissionDiscount3 !== null && record.commissionDiscount3 !== 0) {
            commissionFormData[`${prefix}_COMMISSION_${betTypeCode}_COMMISSION_DISCOUNT_3`] = record.commissionDiscount3;
          }
          if (record.commissionDiscount4 !== null && record.commissionDiscount4 !== 0) {
            commissionFormData[`${prefix}_COMMISSION_${betTypeCode}_COMMISSION_DISCOUNT_4`] = record.commissionDiscount4;
          }

          // Map commission 2 fields (Comisiones 2 tab)
          if (record.commission2Discount1 !== null && record.commission2Discount1 !== 0) {
            commissionFormData[`${prefix}_COMMISSION2_${betTypeCode}_COMMISSION_2_DISCOUNT_1`] = record.commission2Discount1;
          }
          if (record.commission2Discount2 !== null && record.commission2Discount2 !== 0) {
            commissionFormData[`${prefix}_COMMISSION2_${betTypeCode}_COMMISSION_2_DISCOUNT_2`] = record.commission2Discount2;
          }
          if (record.commission2Discount3 !== null && record.commission2Discount3 !== 0) {
            commissionFormData[`${prefix}_COMMISSION2_${betTypeCode}_COMMISSION_2_DISCOUNT_3`] = record.commission2Discount3;
          }
          if (record.commission2Discount4 !== null && record.commission2Discount4 !== 0) {
            commissionFormData[`${prefix}_COMMISSION2_${betTypeCode}_COMMISSION_2_DISCOUNT_4`] = record.commission2Discount4;
          }
        });
      });

      return commissionFormData;
    } catch (error) {
      console.error('Error loading commission values:', error);
      return {};
    }
  };

  /**
   * 🆕 Save commission configurations to the prizes-commissions endpoint
   * Extracts commission fields from formData and saves them via API
   */
  /**
   * ⚡ OPTIMIZED: Save commission configurations using batch endpoint
   * Previous: 200+ sequential API requests (90+ seconds)
   * Now: 1 batch request (< 3 seconds)
   */
  const saveCommissionConfigurations = async (
    bettingPoolId: string | undefined,
    currentFormData: FormData | Record<string, string | number | boolean | number[] | AutoExpense[] | null>,
    initialData: FormData | null = null,
    drawId: string = 'general'
  ): Promise<void> => {
    if (!bettingPoolId) return;

    try {
      // Reverse map: frontend betTypeCode -> backend GameType
      const betTypeToGameType: Record<string, string> = {
        'DIRECTO': 'DIRECTO',
        'PALÉ': 'PALE',
        'TRIPLETA': 'TRIPLETA',
        'CASH3_STRAIGHT': 'CASH3_STRAIGHT',
        'CASH3_BOX': 'CASH3_BOX',
        'PLAY4 STRAIGHT': 'PLAY4_STRAIGHT',
        'PLAY4 BOX': 'PLAY4_BOX',
        'SUPER_PALE': 'SUPER_PALE',
        'BOLITA 1': 'BOLITA_1',
        'BOLITA 2': 'BOLITA_2',
        'SINGULACIÓN 1': 'SINGULACION_1',
        'SINGULACIÓN 2': 'SINGULACION_2',
        'SINGULACIÓN 3': 'SINGULACION_3',
        'PICK5 STRAIGHT': 'PICK5_STRAIGHT',
        'PICK5 BOX': 'PICK5_BOX',
        'PICK TWO': 'PICK_TWO',
        'PICK2': 'PICK2',
        'CASH3 FRONT STRAIGHT': 'CASH3_FRONT_STRAIGHT',
        'CASH3_FRONT_BOX': 'CASH3_FRONT_BOX',
        'CASH3_BACK_STRAIGHT': 'CASH3_BACK_STRAIGHT',
        'CASH3 BACK BOX': 'CASH3_BACK_BOX',
        'PICK TWO FRONT': 'PICK_TWO_FRONT',
        'PICK TWO BACK': 'PICK_TWO_BACK',
        'PICK TWO MIDDLE': 'PICK_TWO_MIDDLE',
        'SINGULACION': 'SINGULACION',
        'PANAMA': 'PANAMA',
      };

      // ⚡ OPTIMIZED: Collect ALL commission items in memory, then send in ONE batch request
      interface BatchItem {
        lotteryId: number | null;
        gameType: string;
        commissionDiscount1?: number;
        commission2Discount1?: number;
      }
      const batchItems: BatchItem[] = [];

      // Helper to collect commissions for a specific prefix
      const collectCommissionsForPrefix = (
        keyPrefix: string,
        targetLotteryId: number | null
      ): void => {
        const commissions: Record<string, {
          commissionDiscount1?: number;
          commission2Discount1?: number;
        }> = {};

        const escapedPrefix = keyPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const commissionPattern = new RegExp(`^${escapedPrefix}_COMMISSION_(.+)_COMMISSION_DISCOUNT_(\\d)$`);
        const commission2Pattern = new RegExp(`^${escapedPrefix}_COMMISSION2_(.+)_COMMISSION_2_DISCOUNT_(\\d)$`);

        Object.keys(currentFormData).forEach(key => {
          const value = currentFormData[key];
          if (value === '' || value === null || value === undefined) return;

          const commissionMatch = key.match(commissionPattern);
          if (commissionMatch) {
            const betTypeCode = commissionMatch[1];
            const discountNum = commissionMatch[2];
            const gameType = betTypeToGameType[betTypeCode] || betTypeCode;
            if (!commissions[gameType]) commissions[gameType] = {};
            const fieldName = `commissionDiscount${discountNum}` as keyof typeof commissions[typeof gameType];
            (commissions[gameType] as Record<string, number>)[fieldName] = parseFloat(String(value));
            return;
          }

          const commission2Match = key.match(commission2Pattern);
          if (commission2Match) {
            const betTypeCode = commission2Match[1];
            const discountNum = commission2Match[2];
            const gameType = betTypeToGameType[betTypeCode] || betTypeCode;
            if (!commissions[gameType]) commissions[gameType] = {};
            const fieldName = `commission2Discount${discountNum}` as keyof typeof commissions[typeof gameType];
            (commissions[gameType] as Record<string, number>)[fieldName] = parseFloat(String(value));
            return;
          }
        });

        // Add to batch items
        for (const [gameType, commissionData] of Object.entries(commissions)) {
          batchItems.push({
            lotteryId: targetLotteryId,
            gameType,
            ...commissionData
          });
        }
      };

      // When saving from General tab, collect BOTH general AND all draw-specific commissions
      if (drawId === 'general') {
        // Collect general commissions (lotteryId = null)
        collectCommissionsForPrefix('general', null);

        // Extract all unique draw prefixes and collect each
        const drawPrefixes = new Set<string>();
        Object.keys(currentFormData).forEach(key => {
          const match = key.match(/^(draw_\d+)_COMMISSION/);
          if (match) drawPrefixes.add(match[1]);
        });

        for (const drawPrefix of drawPrefixes) {
          const drawIdNum = parseInt(drawPrefix.split('_')[1]);
          const draw = draws.find(d => d.drawId === drawIdNum);
          const lotteryId = draw?.lotteryId ?? null;
          if (lotteryId !== null) {
            collectCommissionsForPrefix(drawPrefix, lotteryId);
          }
        }
      } else if (drawId.startsWith('draw_')) {
        // For specific draw, only collect that draw's commissions
        const drawIdNum = parseInt(drawId.split('_')[1]);
        const draw = draws.find(d => d.drawId === drawIdNum);
        const lotteryId = draw?.lotteryId ?? null;
        if (lotteryId !== null) {
          collectCommissionsForPrefix(drawId, lotteryId);
        }
      }

      // ⚡ OPTIMIZED: Send all items in ONE batch request
      if (batchItems.length > 0) {
        const response = await fetch(`${API_BASE}/betting-pools/${bettingPoolId}/prizes-commissions/batch`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ items: batchItems })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
      }

    } catch (error) {
      console.error('Error saving commission configurations:', error);
      throw error;
    }
  };

  /**
   * 🔥 NEW: Load draw-specific prize values with caching
   * ⚡ PERFORMANCE: Caches loaded values to avoid duplicate API calls
   * @param {number} lotteryId - The lottery ID (e.g., 43 for "LA PRIMERA")
   * @param {number} bettingPoolId - The betting pool ID
   */
  const loadDrawSpecificValues = async (drawId: number, bettingPoolId: number | string): Promise<Record<string, string | number>> => {
    try {
      // ⚡ PERFORMANCE: Check cache first
      if (drawValuesCache[drawId]) {
        return drawValuesCache[drawId];
      }


      // ⚡ OPTIMIZED: Use /resolved endpoint which has inheritance (draw → banca → system default)
      // This allows us to only save general values while draws inherit correctly
      const configResponse = await fetch(`${API_BASE}/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config/resolved`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!configResponse.ok) {
        return {};
      }

      const configs = await configResponse.json();

      if (!configs || configs.length === 0) {
        return {};
      }

      // Build formData with draw_XX_ prefix (matches the save format)
      const drawFormData: Record<string, string | number> = {};
      (configs as Array<{ fieldCode: string; customValue: string | number }>).forEach(config => {
        // Extract betTypeCode from fieldCode (first part before underscore)
        const parts = config.fieldCode.split('_');
        const betTypeCode = parts[0]; // e.g., "DIRECTO" from "DIRECTO_PRIMER_PAGO"

        // Build key: draw_181_DIRECTO_DIRECTO_PRIMER_PAGO (matches save format)
        const fieldKey = `draw_${drawId}_${betTypeCode}_${config.fieldCode}`;
        // ✅ FIX: API returns 'customValue', not 'value'
        drawFormData[fieldKey] = config.customValue;

      });

      // ⚡ PERFORMANCE: Store in cache for future use
      setDrawValuesCache(prev => ({
        ...prev,
        [drawId]: drawFormData
      }));

      return drawFormData;

    } catch (error) {
      console.error(`[ERROR] Error loading draw-specific values for draw ${drawId}:`, error);
      return {};
    }
  };

  /**
   * Validate form and set errors state
   * Uses pure validateFormData from utils.ts
   */
  const validateForm = (): boolean => {
    const newErrors = validateFormData(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Check if schedule data has changed
   * Uses pure hasScheduleChanged from utils.ts
   */
  const hasScheduleDataChanged = (): boolean => {
    return hasScheduleChanged(formData, initialFormData);
  };

  /**
   * Check if draws data has changed
   * Uses pure hasDrawsChanged from utils.ts
   */
  const hasDrawsDataChanged = (): boolean => {
    return hasDrawsChanged(formData, initialFormData);
  };

  /**
   * Handle form submission
   * ✅ FIX: Uses TWO endpoints - one for basic data, one for config
   * ✅ FIX: Updates initialFormData after successful save
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const startTime = performance.now();

    setLoading(true);
    setErrors({});

    try {
      // Map form values to API format
      const fallTypeMap: Record<string, string> = {
        '1': 'OFF',
        '2': 'COLLECTION',
        '3': 'DAILY',
        '4': 'MONTHLY',
        '5': 'WEEKLY_ACCUMULATED',     // Semanal con acumulado
        '6': 'WEEKLY_NO_ACCUMULATED'   // Semanal sin acumulado
      };
      const printModeMap: Record<string, string> = { '1': 'DRIVER', '2': 'GENERIC' };
      const discountProviderMap: Record<string, string> = { '1': 'GROUP', '2': 'SELLER' };
      const discountModeMap: Record<string, string> = { '1': 'OFF', '2': 'CASH', '3': 'FREE_TICKET' };
      // ✅ NEW: Payment mode map (frontend limitPreference → API paymentMode)
      const paymentModeMap: Record<string, string> = { '1': 'BANCA', '2': 'ZONA', '3': 'GRUPO' };

      // ========================================
      // 1️⃣ BASIC DATA - PUT /api/betting-pools/{id}
      // ========================================
      const basicData = {
        bettingPoolName: formData.bettingPoolName,
        location: formData.location || null,
        reference: formData.reference || null,
        comment: formData.comment || null,
        zoneId: parseInt(formData.selectedZone),
        username: formData.username || null,
        password: formData.password || null,
        isActive: formData.isActive
      };

      // ========================================
      // 2️⃣ CONFIGURATION DATA - POST /api/betting-pools/{id}/config
      // ========================================
      const configData = {
        config: {
          fallType: fallTypeMap[formData.fallType] || 'OFF',
          deactivationBalance: formData.deactivationBalance ? parseFloat(formData.deactivationBalance) : null,
          dailySaleLimit: formData.dailySaleLimit ? parseFloat(formData.dailySaleLimit) : null,
          dailyBalanceLimit: formData.dailyBalanceLimit ? parseFloat(formData.dailyBalanceLimit) : null,
          temporaryAdditionalBalance: formData.enableTemporaryBalance && formData.temporaryAdditionalBalance ?
            parseFloat(formData.temporaryAdditionalBalance) : null,
          enableTemporaryBalance: formData.enableTemporaryBalance || false,
          creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
          controlWinningTickets: formData.controlWinningTickets || false,
          allowJackpot: formData.allowJackpot !== undefined ? formData.allowJackpot : true,
          enableRecharges: formData.enableRecharges !== undefined ? formData.enableRecharges : true,
          allowPasswordChange: formData.allowPasswordChange !== undefined ? formData.allowPasswordChange : true,
          cancelMinutes: formData.minutesToCancelTicket ? parseInt(formData.minutesToCancelTicket) : 30,
          dailyCancelTickets: formData.ticketsToCancelPerDay ? parseInt(formData.ticketsToCancelPerDay) : null,
          maxCancelAmount: formData.maximumCancelTicketAmount ? parseFloat(formData.maximumCancelTicketAmount) : null,
          maxTicketAmount: formData.maxTicketAmount ? parseFloat(formData.maxTicketAmount) : null,
          maxDailyRecharge: formData.dailyPhoneRechargeLimit ? parseFloat(formData.dailyPhoneRechargeLimit) : null,
          // ✅ FIX: Use dynamic paymentMode from limitPreference field
          paymentMode: formData.limitPreference ? paymentModeMap[formData.limitPreference] : undefined,
          // ✅ NEW: Future sales configuration
          allowFutureSales: formData.allowFutureSales !== undefined ? formData.allowFutureSales : true,
          maxFutureDays: formData.maxFutureDays ? parseInt(formData.maxFutureDays) : 7
        },
        discountConfig: {
          discountProvider: discountProviderMap[formData.discountProvider] || 'GRUPO',
          discountMode: discountModeMap[formData.discountMode] || 'OFF'
        },
        printConfig: {
          printMode: printModeMap[formData.printerType] || 'DRIVER',
          printEnabled: formData.printEnabled !== undefined ? formData.printEnabled : true,
          printTicketCopy: formData.printTicketCopy !== undefined ? formData.printTicketCopy : true,
          printRechargeReceipt: formData.printRechargeReceipt !== undefined ? formData.printRechargeReceipt : true,
          smsOnly: formData.smsOnly || false
        },
        footer: {
          autoFooter: formData.autoFooter || false,
          footerLine1: formData.footerText1 || '',
          footerLine2: formData.footerText2 || '',
          footerLine3: formData.footerText3 || '',
          footerLine4: formData.footerText4 || '',
          showBranchInfo: formData.showBranchInfo !== undefined ? formData.showBranchInfo : true,
          showDateTime: formData.showDateTime !== undefined ? formData.showDateTime : true
        }
      };

      // ========================================
      // 3️⃣ CALL BOTH ENDPOINTS IN PARALLEL
      // ========================================

      const bettingPoolId = id as string;
      const [basicResponse, configResponse] = await Promise.all([
        updateBettingPool(bettingPoolId, basicData),
        updateBettingPoolConfig(bettingPoolId, configData)
      ]);


      if (basicResponse.success && configResponse.success) {
        // ========================================
        // 4️⃣ SAVE PRIZE CONFIGURATIONS
        // ========================================

        try {
          const prizeResult = await savePrizeConfigurations(id, formData, initialFormData);

          if (prizeResult.success) {
            if (prizeResult.skipped) {
            } else {
            }
          } else {
            console.warn(`[WARN] Some prize configurations failed to save: ${prizeResult.failed} of ${prizeResult.total}`);
          }
        } catch (prizeError) {
          console.error('Error saving prize configurations:', prizeError);
          // Don't fail the whole operation if prizes fail to save
        }

        // ========================================
        // 4.5️⃣ SAVE COMMISSION CONFIGURATIONS
        // ========================================
        try {
          await saveCommissionConfigurations(id, formData, initialFormData);
        } catch (commissionError) {
          console.error('Error saving commission configurations:', commissionError);
          // Don't fail the whole operation if commissions fail to save
        }

        // ========================================
        // 5️⃣ SAVE SCHEDULES IF CHANGED
        // ========================================
        const scheduleChanged = hasScheduleDataChanged();

        if (scheduleChanged) {
          try {
            const schedules = transformSchedulesToApiFormat(formData as unknown as Parameters<typeof transformSchedulesToApiFormat>[0]);
            const scheduleResult = await saveBettingPoolSchedules(id || '', schedules);
            if (scheduleResult.success) {
            }
          } catch (scheduleError) {
            console.error('[ERROR] [HOOK] Error saving schedules:', scheduleError);
            // Don't fail the whole operation if schedules fail to save
          }
        } else {
        }

        // ========================================
        // 🎯 PASO 6: SAVE DRAWS IF CHANGED
        // ========================================
        const drawsChanged = hasDrawsDataChanged();

        if (drawsChanged) {
          try {
            console.log('[LIST] [HOOK] FormData antes de guardar:', {
              selectedDraws: formData.selectedDraws,
              anticipatedClosing: formData.anticipatedClosing,
              anticipatedClosingDraws: formData.anticipatedClosingDraws
            });

            // Build draws array from formData (NEW API format)
            interface DrawToSave {
              drawId: number;
              isActive: boolean;
              anticipatedClosingMinutes: number | null;
              enabledGameTypeIds: number[];
            }
            const drawsToSave: DrawToSave[] = [];

            formData.selectedDraws.forEach(drawId => {
              const hasAnticipatedClosing = formData.anticipatedClosingDraws?.includes(drawId);
              drawsToSave.push({
                drawId: drawId,  // NEW: drawId instead of lotteryId
                isActive: true,  // NEW: isActive instead of isEnabled
                anticipatedClosingMinutes: hasAnticipatedClosing ? parseInt(formData.anticipatedClosing) || null : null,  // NEW: anticipatedClosingMinutes
                enabledGameTypeIds: []
              });
            });


            const drawsResult = await saveBettingPoolDraws(id || '', drawsToSave);
            if (drawsResult.success) {
            }
          } catch (drawsError) {
            console.error('[ERROR] [HOOK] Error saving draws:', drawsError);
            // Don't fail the whole operation if draws fail to save
          }
        } else {
        }

        // ========================================
        // 7️⃣ ✅ FIX: UPDATE initialFormData WITH NEW VALUES
        // ========================================
        setInitialFormData({ ...formData });

        const endTime = performance.now();
        const saveTime = (endTime - startTime).toFixed(2);

        // Show success message and navigate to betting pools list
        setSuccessMessage('✅ Banca actualizada exitosamente');

        // Navigate to betting pools list after a short delay
        setTimeout(() => {
          navigate('/betting-pools/list');
        }, 500);
      }
    } catch (error) {
      console.error('[ERROR] Error updating betting pool:', error);
      const endTime = performance.now();
      const saveTime = (endTime - startTime).toFixed(2);

      const errorMessage = handleBettingPoolError(error, 'update betting pool');
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔥 NEW: Save prize config for a single draw only (for ACTUALIZAR button)
   * @param {string} drawId - The draw ID (e.g., "general" or "draw_43")
   *
   * When saving from "general" tab, this will save to ALL draws
   * (propagating the general values to every sorteo)
   */
  const savePrizeConfigForSingleDraw = async (drawId: string): Promise<SavePrizeResult> => {

    try {
      // Filter formData to only include fields for this specific draw
      const filteredFormData: Record<string, string | number | boolean | number[] | AutoExpense[] | null> = {};

      if (drawId === 'general') {
        // ⚡ OPTIMIZED: When saving from General tab, only include general_* fields
        // Draw-specific values inherit from general at runtime - no need to save 70×14×4 = 3920 items
        // This reduces save time from ~30s to ~1s
        Object.keys(formData).forEach(key => {
          if (key.startsWith('general_')) {
            filteredFormData[key] = formData[key as keyof FormData];
          }
        });
      } else {
        // For specific draw, only include that draw's fields
        const prefix = `${drawId}_`;
        Object.keys(formData).forEach(key => {
          if (key.startsWith(prefix)) {
            filteredFormData[key] = formData[key as keyof FormData];
          }
        });
      }


      // Call the existing savePrizeConfigurations function
      // but with filtered data containing only this draw's fields
      // Pass allowDrawSpecific=true to allow saving draw-specific fields
      const result = await savePrizeConfigurations(id, filteredFormData, initialFormData, true);

      // Save commission configurations for any tab (general or draw-specific)
      // When saving from general, also save commissions for all draws
      await saveCommissionConfigurations(id, filteredFormData, initialFormData, drawId);

      if (result.success) {
        // Show success message and navigate to betting pools list
        setSuccessMessage('✅ Configuración de premios actualizada exitosamente');

        // Navigate to betting pools list after a short delay
        setTimeout(() => {
          navigate('/betting-pools/list');
        }, 500);
      }

      return result;
    } catch (error) {
      console.error(`[ERROR] [SINGLE DRAW SAVE] Error saving config for ${drawId}:`, error);
      throw error;
    }
  };

  // Clear messages functions for Snackbar
  const clearSuccessMessage = (): void => {
    setSuccessMessage('');
  };

  const clearErrors = (): void => {
    setErrors({});
  };

  // ========================================
  // 🆕 TEMPLATE COPY FUNCTIONS
  // ========================================

  /**
   * Load all betting pools for template selection
   */
  const loadTemplateBettingPools = useCallback(async (): Promise<void> => {
    setLoadingTemplates(true);
    try {
      // Use large pageSize to get all betting pools
      const response = await getBettingPools({ pageSize: 500 });
      if (response && response.items) {
        // Exclude current betting pool from template list
        const filteredPools = response.items
          .filter(pool => String(pool.bettingPoolId) !== id)
          .map(pool => ({
            bettingPoolId: pool.bettingPoolId,
            bettingPoolName: pool.bettingPoolName,
            bettingPoolCode: pool.bettingPoolCode,
          }));
        setTemplateBettingPools(filteredPools);
      }
    } catch (error) {
      console.error('[TEMPLATE] Error loading betting pools:', error);
    } finally {
      setLoadingTemplates(false);
    }
  }, [id]);

  /**
   * Load template betting pools on mount
   */
  useEffect(() => {
    loadTemplateBettingPools();
  }, [loadTemplateBettingPools]);

  /**
   * Handle template selection
   */
  const handleTemplateSelect = (templateId: number | null): void => {
    setSelectedTemplateId(templateId);
  };

  /**
   * Handle template field checkbox change
   */
  const handleTemplateFieldChange = (field: keyof TemplateFields, checked: boolean): void => {
    setTemplateFields(prev => ({
      ...prev,
      [field]: checked,
    }));
  };

  /**
   * Apply template data to form
   * Fetches data from selected template and copies to current form
   */
  const applyTemplate = async (): Promise<void> => {
    if (!selectedTemplateId) {
      console.warn('[TEMPLATE] No template selected');
      return;
    }

    setLoadingTemplateData(true);

    try {
      // Fetch all data in parallel
      const promises: Promise<unknown>[] = [];
      const dataTypes: string[] = [];

      // Always fetch config (needed for configuration, footers, styles)
      promises.push(getBettingPoolConfig(String(selectedTemplateId)));
      dataTypes.push('config');

      // Fetch prizes if selected
      if (templateFields.prizesAndCommissions) {
        promises.push(getBettingPoolPrizeConfigs(String(selectedTemplateId)));
        dataTypes.push('prizes');
      }

      // Fetch schedules if selected
      if (templateFields.drawSchedules) {
        promises.push(getBettingPoolSchedules(String(selectedTemplateId)));
        dataTypes.push('schedules');
      }

      // Fetch draws if selected
      if (templateFields.draws) {
        promises.push(getBettingPoolDraws(String(selectedTemplateId)));
        dataTypes.push('draws');
      }

      const results = await Promise.allSettled(promises);

      // Process results
      const updates: Partial<FormData> = {};

      results.forEach((result, index) => {
        const dataType = dataTypes[index];
        if (result.status === 'fulfilled' && result.value) {
          const response = result.value as ApiResponse<unknown>;

          if (dataType === 'config' && response.success && response.data) {
            const configData = response.data as ConfigResponse;

            // Configuration fields
            if (templateFields.configuration) {
              const configUpdates = mapConfigToFormData(configData);
              Object.assign(updates, configUpdates);
            }

            // Footers fields
            if (templateFields.footers && configData.footer) {
              updates.autoFooter = configData.footer.autoFooter ?? false;
              updates.footerText1 = configData.footer.footerLine1 ?? '';
              updates.footerText2 = configData.footer.footerLine2 ?? '';
              updates.footerText3 = configData.footer.footerLine3 ?? '';
              updates.footerText4 = configData.footer.footerLine4 ?? '';
              updates.showBranchInfo = configData.footer.showBranchInfo ?? true;
              updates.showDateTime = configData.footer.showDateTime ?? true;
            }

            // Styles fields (from print config)
            if (templateFields.styles && configData.printConfig) {
              updates.printerType = configData.printConfig.printMode === 'GENERIC' ? '2' : '1';
              updates.printEnabled = configData.printConfig.printEnabled ?? true;
              updates.printTicketCopy = configData.printConfig.printTicketCopy ?? true;
              updates.printRechargeReceipt = configData.printConfig.printRechargeReceipt ?? true;
              updates.smsOnly = configData.printConfig.smsOnly ?? false;
            }
          }

          // Process prizes
          if (dataType === 'prizes' && response.success && response.data) {
            const prizeConfigs = response.data as Array<{ betTypeCode: string; fieldCode: string; value: number }>;
            prizeConfigs.forEach(config => {
              const key = `general_${config.betTypeCode}_${config.fieldCode}`;
              (updates as Record<string, unknown>)[key] = config.value;
            });
          }

          // Process schedules
          if (dataType === 'schedules' && response.success && response.data) {
            const schedulesData = response.data as Array<{ dayOfWeek: number; openingTime: string | null; closingTime: string | null }>;
            if (schedulesData.length > 0) {
              const scheduleUpdates = transformSchedulesToFormFormat(schedulesData) as Partial<FormData>;
              Object.assign(updates, scheduleUpdates);
            }
          }

          // Process draws
          if (dataType === 'draws' && response.success && response.data) {
            const drawsData = response.data as DrawApiData[];
            const enabledDraws = drawsData.filter(d => d.isActive);
            const enabledDrawIds = enabledDraws.map(d => d.drawId);

            const drawsWithClosing = drawsData
              .filter(d => d.anticipatedClosingMinutes != null && d.anticipatedClosingMinutes > 0);
            const drawIdsWithClosing = drawsWithClosing.map(d => d.drawId);
            const anticipatedClosing = drawsWithClosing.length > 0
              ? String(drawsWithClosing[0].anticipatedClosingMinutes)
              : '';

            updates.selectedDraws = enabledDrawIds;
            updates.anticipatedClosing = anticipatedClosing;
            updates.anticipatedClosingDraws = drawIdsWithClosing;
          }
        } else if (result.status === 'rejected') {
          console.error(`[TEMPLATE] Error loading ${dataType}:`, result.reason);
        }
      });

      // Apply all updates to form
      setFormData(prev => ({
        ...prev,
        ...updates,
      }) as FormData);

      setSuccessMessage('✅ Plantilla aplicada correctamente');

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('[TEMPLATE] Error applying template:', error);
      setErrors({ submit: 'Error al aplicar la plantilla' });
    } finally {
      setLoadingTemplateData(false);
    }
  };

  // Auto-apply template when selectedTemplateId changes (live preview)
  useEffect(() => {
    if (selectedTemplateId) {
      applyTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplateId]);

  // Auto-apply template when templateFields change (live preview of selected fields)
  useEffect(() => {
    if (selectedTemplateId) {
      applyTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateFields]);

  return {
    formData,
    loading,
    loadingBasicData, // ⚡ PROGRESSIVE LOADING: Basic data (shows loading screen)
    loadingPrizes, // ⚡ PROGRESSIVE LOADING: Prize data (shows indicator in tabs)
    loadingZones,
    loadingDraws, // ⚡ PERFORMANCE: Draws loading state
    errors,
    successMessage,
    zones,
    draws, // ⚡ PERFORMANCE: Draws for DrawsTab (loaded once)
    prizesDraws, // ⚡ PERFORMANCE: Formatted draws for PrizesTab (loaded once)
    drawValuesCache, // ⚡ PERFORMANCE: Cached draw-specific values by lotteryId
    activeTab,
    handleChange,
    handleTabChange,
    handleSubmit,
    copyScheduleToAll,
    loadDrawSpecificValues, // 🔥 NEW: Load draw-specific prize values (with caching)
    savePrizeConfigForSingleDraw, // 🔥 NEW: Save prize config for single draw (for ACTUALIZAR button)
    clearSuccessMessage, // 🔔 SNACKBAR: Clear success message
    clearErrors, // 🔔 SNACKBAR: Clear error message
    // 🆕 TEMPLATE COPY
    templateBettingPools,
    loadingTemplates,
    selectedTemplateId,
    templateFields,
    loadingTemplateData,
    handleTemplateSelect,
    handleTemplateFieldChange,
    applyTemplate,
  };
};

export default useEditBettingPoolForm;
