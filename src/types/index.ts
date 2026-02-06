export interface BackendAsset {
    asset_id: string;
    asset_type: 'application_profile' | 'strike';
    name: string;
    description: string | null;
    category: string | null;
    status: string;
    created_at: string;
    created_by: string | null;
    // ... other fields if needed, but these are the primary ones for the UI
}

export interface ApplicationProfile {
    id: string;
    name: string;
    description: string;
    status?: string;
    category?: string;
}

export interface Strike {
    id: string;
    name: string;
    type: string;
    description: string;
    status?: string;
    category?: string;
}

export interface ApplicationProfileList {
    id: string;
    name: string;
    description: string;
    profileIds: string[];
    createdAt: string;
    owner: string;
}

export interface StrikeList {
    id: string;
    name: string;
    description: string;
    strikeIds: string[];
    createdAt: string;
    owner: string;
}

export interface ComponentSettings {
    current: number;
    original: number;
    percentChange: number;
}

export interface TestCase {
    id: string;
    name: string;
    description: string;
    applicationListId: string;
    strikeListId: string;
    settings: {
        bandwidth: ComponentSettings;
        concurrentFlows: ComponentSettings;
        totalAttacks: ComponentSettings;
    };
    deviceUnderTest: string;
    lockToUser: boolean;
    createdAt: string;
    owner: string;
}

// Dummy Data
export const DUMMY_PROFILES: ApplicationProfile[] = [
    { id: 'A-2025-1111', name: 'Teams Call Simulation', description: 'Microsoft Teams Video Call Traffic' },
    { id: 'A-2025-1234', name: 'Zoom Meeting', description: 'Standard Zoom Video Conference' },
    { id: 'A-2025-2222', name: 'Google Search Engine', description: 'Using Google Search Engine' },
    { id: 'A-2025-3333', name: 'Netflix Streaming', description: '4K Content Streaming Simulation' },
    { id: 'A-2025-4444', name: 'FTP Upload', description: 'Large file transfer simulation' },
];

export const DUMMY_STRIKES: Strike[] = [
    { id: 'M-2025-1111', name: 'Malware-11', type: 'Ransomware', description: 'Wanna Cry Malware' },
    { id: 'M-2025-2222', name: 'DDoS Attack', type: 'Flood', description: 'ICMP Flood Simulation' },
    { id: 'M-2025-3333', name: 'SQL Injection', type: 'Exploit', description: 'Generic SQLi payload' },
    { id: 'M-2025-4444', name: 'Brute Force', type: 'Auth', description: 'SSH Brute Force Simulation' },
];
