export interface Profile {
    id: number;
    firstName: string;
    middleName?: string;
    lastName: string;
    gender: string;
    dob: string;
    education?: string;
    occupation?: string;
    bio?: string;
    profilePicture?: string;

    // User ID for connection
    userId: number;
    email?: string;
    phone?: string;

    // Location
    city?: string;
    state?: string;
    country?: string;

    // Status
    isShortlisted?: boolean;
    isConnected?: boolean;
    connectionId?: string; // ID of the relevant connection record
    connectionStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'NONE';

    // Details
    height?: number;
    maritalStatus?: string;
    diet?: string;
    liveWithFamily?: boolean;
    highestQualification?: string;
    collegeName?: string;
    incomeRange?: string;
    workAs?: string;
    workAt?: string;

    // Community
    subCaste?: string;
    gotra?: string;
    nativePlace?: string;
    religion?: string;
    community?: string;
}
