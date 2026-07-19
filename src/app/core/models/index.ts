export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type UserRole = 'admin' | 'engineer' | 'partner' | 'manager';
export type BadgeStatus = 'live' | 'dev' | 'none';
export type NavStatus = 'live' | 'dev';
export type HealthStatus = 'critical' | 'high' | 'medium' | 'healthy';
export type ContractStatus = 'active' | 'expiring' | 'expired' | 'uncovered';
export type Urgency = 'red' | 'amber' | 'green';

export interface ContractPill {
  id: string;
  label: string;
  daysLeft: number;
  urgency: Urgency;
}
export type DigestItemType = 'advisory' | 'ldos' | 'contract' | 'case';

export interface NavItem {
    id: string;
    label: string;
    icon: string;
    isVisible: boolean;
    isActive: boolean;
    isExpandable: boolean;
    level: number;
    parentId: string | null;
    route: string;
    status: NavStatus;
    badgeCount?: number;
    children?: NavChild[];
    roles: UserRole[];
    metaData?: Record<string, any>;
}

export interface NavSection {
    id: string;
    label: string;
    icon: string;
    path: string;
    roles: UserRole[];
    badge?: BadgeStatus;
    children: NavChild[];
}

export interface Advisory {
    id: string;
    title: string;
    cveId: string | null;
    cvss: number;
    severity: Severity;
    activeExploit: boolean;
    publishedAt: string;
    patchAvailableAt: string | null;
    daysSincePatch: number;
    affectedDeviceIds: string[];
    affectedDeviceCount: number;
    priorityScore: number;
    patchInstructions: string;
}

export interface Device {
    id: string;
    name: string;
    productFamily: string;
    location: string;
    role: string;
    healthStatus: HealthStatus;
    contractStatus: ContractStatus;
    contractExpiry: string | null;
    criticalAdvisoryCount: number;
    highAdvisoryCount: number;
    mediumAdvisoryCount: number;
    lowAdvisoryCount: number;
    daysToLdos: number | null;
    ldosDate: string | null;
    productIconSlug: string;
    ipAddress: string;
    softwareVersion: string;
    latestAvailableVersion: string | null;
}

export interface Contract {
    id: string;
    name: string;
    expiresAt: string;
    daysToExpiry: number;
    affectedDeviceCount: number;
    renewalValueUsd: number;
    accountManager: string;
    urgency: Urgency;
    tier: string;
}

export interface DigestItem {
    id: string;
    type: DigestItemType;
    title: string;
    subtitle: string;
    severity: Severity;
    publishedAt: string;
    route: string;
    isNew?: boolean;
}
export interface NavChild {
    id: string;
    label: string;
    path: string;
    roles: UserRole[];
    badge?: BadgeStatus;
}

export interface UserProfile {
    name: string;
    role: UserRole;
    initials: string;
}

export type AdvisoryStatus = 'open' | 'acknowledged' | 'resolved' | 'suppressed';
export type DeviceTab = 'advisories' | 'device-details' | 'contract-lifecycle' | 'activity-log';
export type ActivityEventType = 'advisory' | 'contract' | 'support' | 'config' | 'sync';

export interface DeviceAdvisory {
    id: string;
    cveId: string | null;
    title: string;
    description: string;
    severity: Severity;
    cvss: number;
    fixedInVersion: string | null;
    status: AdvisoryStatus;
    publishedAt: string;
}

export interface DeviceDetailInfo {
    deviceId: string;
    serialNumber: string;
    macAddress: string;
    managementIp: string;
    configHash: string;
    uptime: string;
    cpuUtilization: number;
    memoryUtilization: number;
    interfaceCount: number;
    lastConfigChange: string;
    lastSynced: string;
}

export interface ActivityLogEvent {
    id: string;
    type: ActivityEventType;
    title: string;
    description: string;
    timestamp: string;
}

export interface RelatedContract {
    id: string;
    daysRemaining: number;
    urgency: Urgency;
}

export interface RelatedDevice {
    id: string;
    name: string;
    healthStatus: HealthStatus;
}

export interface DeviceDetailData {
    advisories:       Record<string, DeviceAdvisory[]>;
    details:          Record<string, DeviceDetailInfo>;
    activityLog:      Record<string, ActivityLogEvent[]>;
    relatedContracts: Record<string, RelatedContract[]>;
    relatedDevices:   Record<string, RelatedDevice[]>;
}