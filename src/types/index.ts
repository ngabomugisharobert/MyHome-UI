export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'caregiver' | 'doctor' | 'supervisor';
  facilityId?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
  bio?: string;
  avatarUrl?: string;
  licenseNumber?: string;
  specialization?: string;
}

export interface Facility {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  capacity: number;
  status: 'active' | 'inactive' | 'pending';
  ownerId?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  users?: User[];
}

export interface FacilityAccess {
  facilities: Facility[];
  userRole: string;
  currentFacilityId?: string;
}

export interface FacilitySelection {
  facilityId: string | null;
  facility?: Facility;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'caregiver' | 'doctor' | 'supervisor';
  facilityId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface UserListResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: PaginationData;
  };
}

export interface FacilityListResponse {
  success: boolean;
  message: string;
  data: {
    facilities: Facility[];
    pagination: PaginationData;
  };
}
