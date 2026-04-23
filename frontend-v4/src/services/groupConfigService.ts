import api from './api';

export interface GroupDefaultConfig {
  gameType: string;
  prizePayment1?: number | null;
  prizePayment2?: number | null;
  prizePayment3?: number | null;
  prizePayment4?: number | null;
  commission1?: number | null;
  commission2?: number | null;
  commission3?: number | null;
  commission4?: number | null;
}

export const getGroupDefaults = async (): Promise<GroupDefaultConfig[]> => {
  return await api.get('/group-config/defaults') as GroupDefaultConfig[] || [];
};

export const saveGroupDefaults = async (configs: GroupDefaultConfig[]): Promise<void> => {
  await api.put('/group-config/defaults', { configs });
};

export interface AllowedValuesGroup {
  gameType: string;
  fieldKey: string;
  values: number[];
}

export const getAllowedValues = async (): Promise<AllowedValuesGroup[]> => {
  return await api.get('/group-config/allowed-values') as AllowedValuesGroup[] || [];
};

export const saveAllowedValues = async (groups: AllowedValuesGroup[]): Promise<void> => {
  await api.put('/group-config/allowed-values', { groups });
};

export interface FooterLine {
  lineNumber: number;
  lineText: string;
}

export const getFooterDefaults = async (): Promise<FooterLine[]> => {
  return await api.get('/group-config/footer') as FooterLine[] || [];
};

export const saveFooterDefaults = async (lines: FooterLine[]): Promise<void> => {
  await api.put('/group-config/footer', { lines });
};

export type BpDefaultsMap = Record<string, string>;

export const getBpDefaults = async (): Promise<BpDefaultsMap> => {
  return await api.get('/group-config/bp-defaults') as BpDefaultsMap || {};
};

export const saveBpDefaults = async (values: BpDefaultsMap): Promise<void> => {
  await api.put('/group-config/bp-defaults', { values });
};
