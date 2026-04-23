import { getGroupDefaults, getAllowedValues, getFooterDefaults, getBpDefaults, type GroupDefaultConfig } from './groupConfigService';
import { getAllBetTypesWithFields } from './prizeService';
import { PRIZE_FIELDS_CONFIG } from '@components/features/my-group/GroupConfiguration/constants';

interface PrizeField {
  prizeTypeId: number;
  fieldCode: string;
  fieldName: string;
  defaultValue?: number;
}

interface BetTypeWithFields {
  betTypeId: number;
  betTypeCode: string;
  betTypeName: string;
  prizeFields: PrizeField[];
}

const normalize = (s: string): string =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Produce formData updates for General tab using the group default configs.
 * Maps `prizePayment1..4` to prize fields in display order,
 * and `commission1` to the primary commission.
 *
 * Returns a record of `general_*` keys with numeric values.
 */
const BP_BOOLEAN_KEYS = new Set([
  'enableTemporaryBalance', 'controlWinningTickets', 'allowJackpot',
  'printEnabled', 'printTicketCopy', 'smsOnly', 'enableRecharges',
  'printRechargeReceipt', 'allowPasswordChange', 'useCentralLogo',
  'enableAutoLogout', 'showStatsPanel',
  'statCredit', 'statSales', 'statPercentage', 'statPrize', 'statNet',
  'statDiscount', 'statFinal', 'statBalance', 'statFall', 'statAccumulatedFall',
]);

export const buildPrefillFromGroupDefaults = async (): Promise<Record<string, number | string | boolean>> => {
  const [defaults, betTypes, footerLines, bpDefaults] = await Promise.all([
    getGroupDefaults(),
    getAllBetTypesWithFields() as Promise<BetTypeWithFields[]>,
    getFooterDefaults(),
    getBpDefaults(),
  ]);

  if ((!defaults || defaults.length === 0) && (!footerLines || footerLines.length === 0) && (!bpDefaults || Object.keys(bpDefaults).length === 0)) return {};

  const defaultsByNormGameType = new Map<string, GroupDefaultConfig>();
  (defaults || []).forEach(d => defaultsByNormGameType.set(normalize(d.gameType), d));

  const updates: Record<string, number | string | boolean> = {};

  footerLines.forEach(l => {
    if (l.lineNumber >= 1 && l.lineNumber <= 6 && l.lineText) {
      updates[`footerText${l.lineNumber}`] = l.lineText;
    }
  });

  if (bpDefaults) {
    Object.entries(bpDefaults).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      updates[k] = BP_BOOLEAN_KEYS.has(k) ? v === 'true' : v;
    });
  }

  betTypes.forEach(bt => {
    const key = normalize(bt.betTypeCode);
    const def = defaultsByNormGameType.get(key);
    if (!def) return;

    const prizeSlots = [def.prizePayment1, def.prizePayment2, def.prizePayment3, def.prizePayment4];
    const fields = [...(bt.prizeFields || [])];
    fields.forEach((field, i) => {
      const val = prizeSlots[i];
      if (val != null) {
        updates[`general_${bt.betTypeCode}_${field.fieldCode}`] = val;
      }
    });

    if (def.commission1 != null) {
      updates[`general_COMMISSION_${bt.betTypeCode}_COMMISSION_DISCOUNT_1`] = def.commission1;
    }
  });

  return updates;
};

/**
 * Build a map of allowed values keyed by `{betTypeCode}__{fieldCode}`.
 * Used in Create/Edit Banca to restrict prize input to configured values.
 * Returns empty map if no group-level allowed values are configured.
 */
export const buildAllowedValuesMap = async (): Promise<Record<string, number[]>> => {
  const [allowed, betTypes] = await Promise.all([
    getAllowedValues(),
    getAllBetTypesWithFields() as Promise<BetTypeWithFields[]>,
  ]);

  if (!allowed || allowed.length === 0 || !betTypes || betTypes.length === 0) return {};

  // Index allowed values by normalized game type + UI field key
  const byGameField = new Map<string, number[]>();
  allowed.forEach(g => byGameField.set(`${normalize(g.gameType)}__${g.fieldKey}`, g.values));

  // Build positional mapping for each (betTypeCode, fieldCode) using PRIZE_FIELDS_CONFIG
  const result: Record<string, number[]> = {};
  betTypes.forEach(bt => {
    const normCode = normalize(bt.betTypeCode);
    const cfg = PRIZE_FIELDS_CONFIG.find(c => normalize(c.gameType) === normCode);
    if (!cfg) return;
    const fieldKeys = Object.keys(cfg.fields);
    const fields = [...(bt.prizeFields || [])];
    fields.forEach((field, i) => {
      const uiFieldKey = fieldKeys[i];
      if (!uiFieldKey) return;
      const vals = byGameField.get(`${normCode}__${uiFieldKey}`);
      if (vals && vals.length > 0) {
        result[`${bt.betTypeCode}__${field.fieldCode}`] = vals;
      }
    });
  });

  return result;
};
