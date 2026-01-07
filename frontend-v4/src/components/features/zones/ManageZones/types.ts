/**
 * ManageZones Types
 *
 * Type definitions for zone management component.
 */

export interface Zone {
  zoneId: number;
  zoneName: string;
  isActive?: boolean;
}

export interface BettingPool {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
}

export interface ZoneSelection {
  bettingPools: number[];
  users: number[];
}

export interface ZoneSelections {
  [zoneId: number]: ZoneSelection;
}

// API Response types
export interface ZonesApiResponse {
  success?: boolean;
  data?: Zone[];
}

export interface BettingPoolApiItem {
  bettingPoolId: number;
  bettingPoolName?: string;
  branchCode?: string;
}

export interface BettingPoolApiResponse {
  success?: boolean;
  data?: BettingPoolApiItem[];
  items?: BettingPoolApiItem[];
}

export interface UserApiItem {
  userId: number;
  username: string;
}

export interface UserApiResponse {
  success?: boolean;
  data?: UserApiItem[];
  items?: UserApiItem[];
}

export interface AssignResult {
  success?: boolean;
  summary?: {
    totalAssignments?: number;
    successful?: number;
    failed?: number;
  };
}

// Component props
export interface SearchBarProps {
  searchText: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  resultCount: number;
}

export interface ZoneTabsProps {
  zones: Zone[];
  activeTab: number;
  tabsContainerRef: React.RefObject<HTMLDivElement>;
  searchText: string;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

export interface SelectionSectionProps {
  title: string;
  items: Array<{ id: number; label: string }>;
  selectedIds: number[];
  emptyMessage: string;
  onToggle: (id: number) => void;
}

export interface FormActionsProps {
  saving: boolean;
  onCancel: () => void;
}
