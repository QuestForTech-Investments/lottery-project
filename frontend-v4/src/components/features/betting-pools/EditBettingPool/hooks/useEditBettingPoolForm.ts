import { useState, useEffect, useCallback, type ChangeEvent, type SyntheticEvent } from 'react';
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
  const _navigate = useNavigate();
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
    console.log('[INFO] [HOOK] useEffect running, id:', id);
    loadInitialData();
  }, [id]);

  /**
   * Load zones and bettingPool data
   * ⚡ PROGRESSIVE LOADING: Two-phase approach
   * Phase 1: Load basic data (zones + betting pool) - FAST, show form immediately
   * Phase 2: Load prizes in background - SLOW, show loading indicators in tabs
   */
  const loadInitialData = async (): Promise<void> => {
    console.log('[OK] [HOOK] loadInitialData() called, id:', id);
    const startTime = performance.now();
    console.log('[START] [PHASE 1] Loading basic data (zones + betting pool)...');

    try {
      setLoadingZones(true);
      setLoadingBasicData(true);

      if (id) {
        // ⚡ PHASE 1: Load zones, basic betting pool data, and configuration (FAST)
        console.log('[TIMING] Phase 1: Loading zones, betting pool, and configuration in parallel...');

        // ⚡ PERFORMANCE: Parallelize all API calls (including draws for tabs)
        const apiStartTime = performance.now();
        console.log('[TIMING] [TIMING] Starting parallel API calls at', apiStartTime.toFixed(2), 'ms');

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
        console.log('[PERF] [TIMING] All 6 parallel API calls completed in', apiDuration.toFixed(2), 'ms');

        // Start processing data
        const processingStartTime = performance.now();
        console.log('[TIMING] [TIMING] Starting data processing...');

        // Process zones
        if (zonesResponse.success && zonesResponse.data) {
          setZones(zonesResponse.data);
          console.log(`[SUCCESS] Loaded ${zonesResponse.data.length} zones`);
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

          console.log('[DEBUG] [DEBUG] First 3 all draws structure:', sortedDraws.slice(0, 3).map(d => ({
            drawId: d.drawId,
            lotteryId: d.lotteryId,
            drawName: d.drawName
          })));

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

          console.log(`[SUCCESS] Loaded ${sortedDraws.length} draws for tabs`);
        }
        setLoadingDraws(false);

        // Process betting pool basic data
        if (bettingPoolResponse.success && bettingPoolResponse.data) {
          const branch = bettingPoolResponse.data;
          console.log('[SUCCESS] Loaded betting pool data');

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
            console.log('[SUCCESS] Loaded configuration data');
          }

          // ✅ Process schedules data (now loaded in parallel)
          let scheduleFormData: Partial<FormData> = {};
          try {
            if (schedulesResponse.success && schedulesResponse.data && schedulesResponse.data.length > 0) {
              scheduleFormData = transformSchedulesToFormFormat(schedulesResponse.data as Parameters<typeof transformSchedulesToFormFormat>[0]) as Partial<FormData>;
              console.log('[SUCCESS] Loaded schedule data for all 7 days');
            }
          } catch (scheduleError) {
            console.error('[ERROR] Error processing schedules:', scheduleError);
            // Don't fail the whole form if schedules fail to load
          }

          // ✅ Process draws data (NEW API format)
          console.log('[WARN] [HOOK] Processing draws data...');
          console.log('[DEBUG] [DEBUG] drawsResponse from /betting-pools/draws:', drawsResponse.data);
          let drawsFormData: { selectedDraws: number[]; anticipatedClosing: string; anticipatedClosingDraws: number[] } = { selectedDraws: [], anticipatedClosing: '', anticipatedClosingDraws: [] };
          try {
            if (drawsResponse.success && drawsResponse.data && drawsResponse.data.length > 0) {
              // NEW API: Response already contains drawId directly! No mapping needed!
              // Format: { bettingPoolDrawId, drawId, drawName, lotteryId, isActive, anticipatedClosingMinutes, ... }

              // Extract enabled draws (active draws)
              const enabledDraws = drawsResponse.data.filter(d => d.isActive);
              const enabledDrawIds = enabledDraws.map(d => d.drawId);

              console.log('[DEBUG] [DEBUG] enabledDrawIds (from /draws API):', enabledDrawIds);
              console.log('[DEBUG] [DEBUG] enabledDraws:', enabledDraws.map(d => ({
                drawId: d.drawId,
                drawName: d.drawName,
                lotteryId: d.lotteryId
              })));

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

              console.log('[DEBUG] [DEBUG] drawsFormData:', drawsFormData);
              console.log(`[SUCCESS] Loaded ${drawsFormData.selectedDraws.length} selected draws, ${drawsFormData.anticipatedClosingDraws.length} with anticipated closing`);
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
          console.log('[PERF] [TIMING] Data processing completed in', processingDuration.toFixed(2), 'ms');

          const phase1Time = (performance.now() - startTime).toFixed(2);
          console.log(`[SUCCESS] [PHASE 1] Basic data loaded in ${phase1Time}ms (API: ${apiDuration.toFixed(2)}ms + Processing: ${processingDuration.toFixed(2)}ms)`);

          // ⚡ UNLOCK UI: User can now see and interact with the form
          setLoadingBasicData(false);

          // ⚡ PHASE 2: Load prizes in background (SLOW, doesn't block UI)
          console.log('[SYNC] [PHASE 2] Loading prize data in background...');
          setLoadingPrizes(true);

          loadPrizeValues(id)
            .then(prizeValues => {
              if (Object.keys(prizeValues).length > 0) {
                console.log(`[SUCCESS] Loaded ${Object.keys(prizeValues).length} prize values`);

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
              console.log(`[SUCCESS] [PHASE 2] Prize data loaded in ${phase2Time}ms`);
            })
            .catch(error => {
              console.error('[ERROR] Error loading prize values:', error);
              // Don't fail the whole form if prizes fail to load
            })
            .finally(() => {
              setLoadingPrizes(false);
              const totalTime = (performance.now() - startTime).toFixed(2);
              console.log(`[SUCCESS] All data loaded successfully in ${totalTime}ms`);
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
   */
  const savePrizeConfigurations = async (
    bettingPoolId: string | undefined,
    currentFormData: FormData | Record<string, string | number | boolean | number[] | AutoExpense[] | null>,
    initialData: FormData | null = null
  ): Promise<SavePrizeResult> => {
    const startTime = performance.now();
    console.log('[SAVE] Building prize configurations to save...');

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

      console.log(`Built fieldCode map with ${Object.keys(fieldCodeToId).length} prize types`);

      // Group configs by lottery (general vs lottery_XX)
      const configsByLottery: Record<string, PrizeConfig[]> = {};
      const prizeFieldSet = new Set(Object.keys(fieldCodeToId));

      // ⚡ OPTIMIZED: More efficient filtering + DIRTY TRACKING
      // Group fields by lottery ID
      console.log('[DEBUG] [DEBUG] Starting prize change detection...');
      console.log('[DEBUG] [DEBUG] initialData exists?', !!initialData);
      console.log('[DEBUG] [DEBUG] currentFormData keys count:', Object.keys(currentFormData).length);

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

        // Check for "general_" prefix
        if (parts[0] === 'general' && parts.length >= 4) {
          lotteryId = 'general';
          cleanKey = parts.slice(1).join('_'); // Remove "general_"
        }
        // Check for "draw_XX_" prefix (new format from PrizesTab)
        else if (parts[0] === 'draw' && parts.length >= 5) {
          lotteryId = `${parts[0]}_${parts[1]}`; // "draw_43"
          cleanKey = parts.slice(2).join('_'); // Remove "draw_XX_"
        }
        // Check for "lottery_XX_" prefix (legacy format)
        else if (parts[0] === 'lottery' && parts.length >= 5) {
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
              console.log(`[DEBUG] [DEBUG #${debugCount + 1}] Field: ${key}`);
              console.log(`  - currentValue (raw): "${rawValue}" (type: ${typeof rawValue})`);
              console.log(`  - currentValue (parsed): ${currentValue}`);
              console.log(`  - initialValue (raw): "${initialValue}" (type: ${typeof initialValue})`);
              console.log(`  - initialValue (parsed): ${initialValueParsed}`);
              console.log(`  - initialData[key] exists? ${initialValue !== undefined}`);
              console.log(`  - Are they equal? ${initialValueParsed === currentValue}`);
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
              console.log(`[OK] Changed [${lotteryId}]: ${key} -> ${fieldCode} = ${rawValue} (was: ${initialValue ?? 'N/A'})`);
            }
          }
        }
      });

      if (Object.keys(configsByLottery).length === 0) {
        console.log('[OK] No prize values changed - skipping save');
        return { success: true, message: 'No changes', skipped: true };
      }

      console.log(`[SAVE] Saving prize configurations for ${Object.keys(configsByLottery).length} lottery groups...`);

      // Save each lottery's configs
      const savePromises: Promise<{ success: boolean; lottery: string; count?: number; error?: string }>[] = [];
      let totalSaved = 0;
      let totalFailed = 0;

      for (const [lotteryIdKey, prizeConfigs] of Object.entries(configsByLottery)) {
        if (lotteryIdKey === 'general') {
          // Save general configs
          console.log(`[SAVE] Saving ${prizeConfigs.length} general prize config(s)...`);
          savePromises.push(
            savePrizeConfig(bettingPoolId || '', prizeConfigs)
              .then(() => {
                console.log(`[SUCCESS] General configs saved successfully`);
                totalSaved += prizeConfigs.length;
                return { success: true, lottery: 'general', count: prizeConfigs.length };
              })
              .catch((error: Error) => {
                console.error(`[ERROR] Error saving general configs:`, error);
                totalFailed += prizeConfigs.length;
                return { success: false, lottery: 'general', error: error.message };
              })
          );
        } else if (lotteryIdKey.startsWith('draw_')) {
          // New format: "draw_XX" where XX is the drawId directly
          const drawId = parseInt(lotteryIdKey.split('_')[1]);

          console.log(`[SAVE] Saving ${prizeConfigs.length} prize config(s) for draw ${drawId}...`);

          // Directly save to draw-specific endpoint (no need to lookup)
          savePromises.push(
            fetch(`/api/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ prizeConfigs })
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
              })
              .then(() => {
                console.log(`[SUCCESS] Draw ${drawId} configs saved successfully`);
                totalSaved += prizeConfigs.length;
                return { success: true, lottery: lotteryIdKey, count: prizeConfigs.length };
              })
              .catch((error: Error) => {
                console.error(`[ERROR] Error saving draw ${drawId} configs:`, error);
                totalFailed += prizeConfigs.length;
                return { success: false, lottery: lotteryIdKey, error: error.message };
              })
          );
        } else {
          // Legacy format: "lottery_XX" where XX is the lotteryId (need to lookup drawId)
          const lotteryIdNum = parseInt(lotteryIdKey.split('_')[1]);

          console.log(`[SAVE] Saving ${prizeConfigs.length} prize config(s) for lottery ${lotteryIdNum}...`);

          // For lottery-specific: Get first draw ID, then save
          savePromises.push(
            fetch(`/api/draws/lottery/${lotteryIdNum}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              }
            })
              .then(res => res.json())
              .then(draws => {
                if (!draws || draws.length === 0) {
                  throw new Error(`No draws found for lottery ${lotteryIdNum}`);
                }

                // Use first draw
                const firstDraw = draws[0];
                const drawId = firstDraw.drawId;

                console.log(`  -> Using draw ${drawId} (${firstDraw.drawName || 'N/A'}) for lottery ${lotteryIdNum}`);

                // Save to draw-specific endpoint
                return fetch(`/api/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ prizeConfigs })
                });
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
              })
              .then(() => {
                console.log(`[SUCCESS] Lottery ${lotteryIdNum} configs saved successfully`);
                totalSaved += prizeConfigs.length;
                return { success: true, lottery: lotteryIdKey, count: prizeConfigs.length };
              })
              .catch((error: Error) => {
                console.error(`[ERROR] Error saving lottery ${lotteryIdNum} configs:`, error);
                totalFailed += prizeConfigs.length;
                return { success: false, lottery: lotteryIdKey, error: error.message };
              })
          );
        }
      }

      // Wait for all saves to complete
      const results = await Promise.all(savePromises);

      const endTime = performance.now();
      const saveTime = (endTime - startTime).toFixed(2);

      if (totalFailed === 0) {
        console.log(`[SUCCESS] All prize configurations saved successfully in ${saveTime}ms`);
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
  const loadPrizeValues = async (bettingPoolId: string): Promise<Record<string, string | number>> => {
    try {
      console.log(`Loading prize values for betting pool ${bettingPoolId}...`);

      // Get merged prize data (defaults + custom values)
      const prizeData = await getMergedPrizeData(bettingPoolId as unknown as null) as PrizeData | null;

      if (!prizeData || !prizeData.betTypes) {
        console.log('No prize data available');
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
            console.log(`Found custom value for ${fieldKey}: ${value} (overriding default: ${field.defaultMultiplier})`);
          } else {
            console.log(`Using default value for ${fieldKey}: ${value}`);
          }

          // Store in formData format with "general_" prefix
          prizeFormData[fieldKey] = value;
        });
      });

      console.log(`Loaded ${Object.keys(prizeFormData).length} prize type values`);
      return prizeFormData;
    } catch (error) {
      console.error('Error loading prize values:', error);
      return {};
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
        console.log(`[PERF] Using cached values for draw ${drawId} (skipping API calls)`);
        return drawValuesCache[drawId];
      }

      console.log(`[DRAW] Loading draw-specific values for draw ${drawId}...`);

      // 🔥 FIX: Directly call the prize-config endpoint with the drawId
      // The old code was calling /api/draws/lottery/${lotteryId} which doesn't exist
      const configResponse = await fetch(`/api/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!configResponse.ok) {
        console.log(`[INFO] No custom prize config found for draw ${drawId} (status: ${configResponse.status})`);
        return {};
      }

      const configs = await configResponse.json();
      console.log(`  -> Raw API response:`, configs);

      if (!configs || configs.length === 0) {
        console.log(`[INFO] No custom values for draw ${drawId}`);
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

        console.log(`  [OK] Loaded: ${fieldKey} = ${config.customValue}`);
      });

      // ⚡ PERFORMANCE: Store in cache for future use
      setDrawValuesCache(prev => ({
        ...prev,
        [drawId]: drawFormData
      }));

      console.log(`[SUCCESS] Loaded ${Object.keys(drawFormData).length} draw-specific values (cached for future use)`);
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
    console.log('[START] Starting save operation...');

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
          paymentMode: formData.limitPreference ? paymentModeMap[formData.limitPreference] : undefined
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
      console.log('[SEND] Calling 2 endpoints in parallel...');
      console.log('  - PUT /api/betting-pools/' + id, basicData);
      console.log('  - POST /api/betting-pools/' + id + '/config', configData);

      const bettingPoolId = id as string;
      const [basicResponse, configResponse] = await Promise.all([
        updateBettingPool(bettingPoolId, basicData),
        updateBettingPoolConfig(bettingPoolId, configData)
      ]);

      console.log('[SUCCESS] Basic data response:', basicResponse);
      console.log('[SUCCESS] Config response:', configResponse);

      if (basicResponse.success && configResponse.success) {
        // ========================================
        // 4️⃣ SAVE PRIZE CONFIGURATIONS
        // ========================================
        console.log(`Betting pool updated with ID: ${id}. Saving prize configurations...`);

        try {
          const prizeResult = await savePrizeConfigurations(id, formData, initialFormData);

          if (prizeResult.success) {
            if (prizeResult.skipped) {
              console.log(`[OK] No prize changes to save`);
            } else {
              console.log(`[SUCCESS] ${prizeResult.total} prize configuration(s) saved successfully`);
            }
          } else {
            console.warn(`[WARN] Some prize configurations failed to save: ${prizeResult.failed} of ${prizeResult.total}`);
          }
        } catch (prizeError) {
          console.error('Error saving prize configurations:', prizeError);
          // Don't fail the whole operation if prizes fail to save
        }

        // ========================================
        // 5️⃣ SAVE SCHEDULES IF CHANGED
        // ========================================
        console.log('[DEBUG] [HOOK] Checking schedule changes...');
        console.log('[DEBUG] [HOOK] Current formData schedules:', {
          domingoInicio: formData.domingoInicio,
          domingoFin: formData.domingoFin,
          lunesInicio: formData.lunesInicio,
          lunesFin: formData.lunesFin
        });
        console.log('[DEBUG] [HOOK] Initial formData schedules:', {
          domingoInicio: initialFormData?.domingoInicio,
          domingoFin: initialFormData?.domingoFin,
          lunesInicio: initialFormData?.lunesInicio,
          lunesFin: initialFormData?.lunesFin
        });

        const scheduleChanged = hasScheduleDataChanged();
        console.log(`[DEBUG] [HOOK] Schedule changed: ${scheduleChanged}`);

        if (scheduleChanged) {
          try {
            console.log('[SCHEDULE] [HOOK] Updating schedules...');
            const schedules = transformSchedulesToApiFormat(formData as unknown as Parameters<typeof transformSchedulesToApiFormat>[0]);
            console.log('[SCHEDULE] [HOOK] Transformed schedules:', schedules);
            const scheduleResult = await saveBettingPoolSchedules(id || '', schedules);
            if (scheduleResult.success) {
              console.log('[SUCCESS] [HOOK] Schedules updated successfully');
            }
          } catch (scheduleError) {
            console.error('[ERROR] [HOOK] Error saving schedules:', scheduleError);
            // Don't fail the whole operation if schedules fail to save
          }
        } else {
          console.log('[OK] [HOOK] No schedule changes to save');
        }

        // ========================================
        // 🎯 PASO 6: SAVE DRAWS IF CHANGED
        // ========================================
        const drawsChanged = hasDrawsDataChanged();
        console.log(`[DEBUG] [HOOK] Draws changed: ${drawsChanged}`);

        if (drawsChanged) {
          try {
            console.log('[TARGET] [HOOK] Updating draws...');
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

            console.log('[SEND] [HOOK] Draws payload (NEW format):', drawsToSave);
            console.log(`[SEND] [HOOK] Enviando ${drawsToSave.length} draws al endpoint`);

            const drawsResult = await saveBettingPoolDraws(id || '', drawsToSave);
            if (drawsResult.success) {
              console.log('[SUCCESS] [HOOK] Draws updated successfully');
            }
          } catch (drawsError) {
            console.error('[ERROR] [HOOK] Error saving draws:', drawsError);
            // Don't fail the whole operation if draws fail to save
          }
        } else {
          console.log('[OK] [HOOK] No draw changes to save');
        }

        // ========================================
        // 7️⃣ ✅ FIX: UPDATE initialFormData WITH NEW VALUES
        // ========================================
        setInitialFormData({ ...formData });
        console.log('[SUCCESS] initialFormData updated with new values');

        const endTime = performance.now();
        const saveTime = (endTime - startTime).toFixed(2);
        console.log(`[SUCCESS] Save operation completed successfully in ${saveTime}ms`);

        // Show success message and stay on form
        setSuccessMessage('✅ Banca actualizada exitosamente');

        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('[ERROR] Error updating betting pool:', error);
      const endTime = performance.now();
      const saveTime = (endTime - startTime).toFixed(2);
      console.log(`[ERROR] Save operation failed after ${saveTime}ms`);

      const errorMessage = handleBettingPoolError(error, 'update betting pool');
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔥 NEW: Save prize config for a single draw only (for ACTUALIZAR button)
   * @param {string} drawId - The draw ID (e.g., "general" or "draw_43")
   */
  const savePrizeConfigForSingleDraw = async (drawId: string): Promise<SavePrizeResult> => {
    console.log(`[SAVE] [SINGLE DRAW SAVE] Saving prize config for draw: ${drawId}`);

    try {
      // Filter formData to only include fields for this specific draw
      const filteredFormData: Record<string, string | number | boolean | number[] | AutoExpense[] | null> = {};
      const prefix = drawId === 'general' ? 'general_' : `${drawId}_`;

      Object.keys(formData).forEach(key => {
        if (key.startsWith(prefix)) {
          filteredFormData[key] = formData[key as keyof FormData];
        }
      });

      console.log(`[SAVE] [SINGLE DRAW SAVE] Found ${Object.keys(filteredFormData).length} fields for ${drawId}`);

      // Call the existing savePrizeConfigurations function
      // but with filtered data containing only this draw's fields
      const result = await savePrizeConfigurations(id, filteredFormData, initialFormData);

      if (result.success) {
        console.log(`[SUCCESS] [SINGLE DRAW SAVE] Successfully saved config for ${drawId}`);
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
        console.log(`[TEMPLATE] Loaded ${filteredPools.length} betting pools for template selection`);
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
    console.log(`[TEMPLATE] Applying template from betting pool ${selectedTemplateId}...`);

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
              console.log('[TEMPLATE] Applied configuration fields');
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
              console.log('[TEMPLATE] Applied footer fields');
            }

            // Styles fields (from print config)
            if (templateFields.styles && configData.printConfig) {
              updates.printerType = configData.printConfig.printMode === 'GENERIC' ? '2' : '1';
              updates.printEnabled = configData.printConfig.printEnabled ?? true;
              updates.printTicketCopy = configData.printConfig.printTicketCopy ?? true;
              updates.printRechargeReceipt = configData.printConfig.printRechargeReceipt ?? true;
              updates.smsOnly = configData.printConfig.smsOnly ?? false;
              console.log('[TEMPLATE] Applied styles fields');
            }
          }

          // Process prizes
          if (dataType === 'prizes' && response.success && response.data) {
            const prizeConfigs = response.data as Array<{ betTypeCode: string; fieldCode: string; value: number }>;
            prizeConfigs.forEach(config => {
              const key = `general_${config.betTypeCode}_${config.fieldCode}`;
              (updates as Record<string, unknown>)[key] = config.value;
            });
            console.log(`[TEMPLATE] Applied ${prizeConfigs.length} prize configurations`);
          }

          // Process schedules
          if (dataType === 'schedules' && response.success && response.data) {
            const schedulesData = response.data as Array<{ dayOfWeek: number; openingTime: string | null; closingTime: string | null }>;
            if (schedulesData.length > 0) {
              const scheduleUpdates = transformSchedulesToFormFormat(schedulesData) as Partial<FormData>;
              Object.assign(updates, scheduleUpdates);
              console.log('[TEMPLATE] Applied schedule fields');
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
            console.log(`[TEMPLATE] Applied ${enabledDrawIds.length} draws, ${drawIdsWithClosing.length} with anticipated closing`);
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

      console.log('[TEMPLATE] Template applied successfully');
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
