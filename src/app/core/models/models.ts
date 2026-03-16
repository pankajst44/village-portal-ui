// ── Auth ──────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  id?:          number;
  accessToken:  string;
  refreshToken: string;
  tokenType:    string;
  expiresIn:    number;
  username:     string;
  role:         string;
  fullName:     string;
}

// ── Common wrapper ────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T;
}

export interface PageResponse<T> {
  content:          T[];
  totalElements:    number;
  totalPages:       number;
  size:             number;
  number:           number;
  first:            boolean;
  last:             boolean;
  numberOfElements: number;
}

// ── Enums ─────────────────────────────────────────────────
export type Role = 'ADMIN' | 'OFFICER' | 'AUDITOR' | 'RESIDENT';

export type FundSource  = 'CENTRAL_GOVT' | 'STATE_GOVT' | 'PANCHAYAT' | 'OTHER';
export type FundStatus  = 'PENDING' | 'ACTIVE' | 'CLOSED';

export type ProjectType   = 'ROAD' | 'WATER' | 'SANITATION' | 'SCHOOL' | 'ELECTRICITY' | 'HEALTH' | 'OTHER';
export type ProjectStatus = 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';

export type ContractorCategory = 'CIVIL' | 'ELECTRICAL' | 'PLUMBING' | 'CONSTRUCTION' | 'SUPPLY' | 'OTHER';
export type PaymentMode        = 'BANK_TRANSFER' | 'CHEQUE' | 'CASH' | 'UPI' | 'OTHER';
export type DocumentType       = 'PHOTO' | 'SANCTION_ORDER' | 'WORK_ORDER' | 'BILL' | 'COMPLETION_CERT' | 'AGREEMENT' | 'OTHER';
export type AuditAction        = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'FILE_UPLOAD' | 'FILE_DELETE' | 'VERIFY' | 'EXPORT';

// ── User ──────────────────────────────────────────────────
export interface User {
  id:        number;
  username:  string;
  fullName:  string;
  email:     string;
  phone?:    string;
  role:      Role;
  isActive:  boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface CreateUserRequest {
  username:  string;
  password:  string;
  fullName:  string;
  email:     string;
  phone?:    string;
  role:      Role;
}

// ── Fund ─────────────────────────────────────────────────
export interface Fund {
  id:              number;
  schemeNameEn:    string;
  schemeNameHi?:   string;
  fundSource:      FundSource;
  totalAmount:     number;
  amountReceived:  number;
  releaseDate?:    string;
  financialYear:   string;
  referenceNumber?: string;
  descriptionEn?:  string;
  descriptionHi?:  string;
  status:          FundStatus;
  createdByUsername?: string;
  createdAt:       string;
  updatedAt:       string;
}

export interface CreateFundRequest {
  schemeNameEn:    string;
  schemeNameHi?:   string;
  fundSource:      FundSource;
  totalAmount:     number;
  amountReceived?: number;
  releaseDate?:    string;
  financialYear:   string;
  referenceNumber?: string;
  descriptionEn?:  string;
  descriptionHi?:  string;
  status?:         FundStatus;
}

// ── Project ──────────────────────────────────────────────
export interface Project {
  id:                  number;
  fundId?:             number;
  fundSchemeNameEn?:   string;
  fundSchemeNameHi?:   string;
  projectCode:         string;
  nameEn:              string;
  nameHi?:             string;
  descriptionEn?:      string;
  descriptionHi?:      string;
  locationEn?:         string;
  locationHi?:         string;
  projectType:         ProjectType;
  status:              ProjectStatus;
  allocatedBudget:     number;
  totalSpent:          number;
  remainingBudget:     number;
  progressPercent:     number;
  startDate?:          string;
  expectedEndDate?:    string;
  actualEndDate?:      string;
  assignedOfficerId?:  number;
  assignedOfficerName?: string;
  isPublicVisible:     boolean;
  createdAt:           string;
  updatedAt:           string;
}

export interface CreateProjectRequest {
  fundId?:             number;
  projectCode:         string;
  nameEn:              string;
  nameHi?:             string;
  descriptionEn?:      string;
  descriptionHi?:      string;
  locationEn?:         string;
  locationHi?:         string;
  projectType:         ProjectType;
  status?:             ProjectStatus;
  allocatedBudget:     number;
  progressPercent?:    number;
  startDate?:          string;
  expectedEndDate?:    string;
  assignedOfficerId?:  number;
  isPublicVisible?:    boolean;
}

export interface UpdateProgressRequest {
  progressPercent: number;
  status?:         ProjectStatus;
  remarks?:        string;
}

// ── Contractor ───────────────────────────────────────────
export interface Contractor {
  id:                 number;
  nameEn:             string;
  nameHi?:            string;
  registrationNumber: string;
  panNumber?:         string;
  gstNumber?:         string;
  contactPerson?:     string;
  phone?:             string;
  email?:             string;
  addressEn?:         string;
  addressHi?:         string;
  category:           ContractorCategory;
  isBlacklisted:      boolean;
  blacklistReason?:   string;
  createdAt:          string;
}

// ── Expenditure ──────────────────────────────────────────
export interface Expenditure {
  id:                   number;
  projectId:            number;
  projectNameEn?:       string;
  projectNameHi?:       string;
  contractorId?:        number;
  contractorNameEn?:    string;
  voucherNumber?:       string;
  amount:               number;
  paymentDate:          string;
  paymentMode:          PaymentMode;
  paymentReference?:    string;
  descriptionEn?:       string;
  descriptionHi?:       string;
  financialYear:        string;
  isVerified:           boolean;
  verifiedByUsername?:  string;
  verifiedAt?:          string;
  recordedByUsername?:  string;
  createdAt:            string;
}

export interface CreateExpenditureRequest {
  projectId:        number;
  contractorId?:    number;
  voucherNumber?:   string;
  amount:           number;
  paymentDate:      string;
  paymentMode:      PaymentMode;
  paymentReference?: string;
  descriptionEn?:   string;
  descriptionHi?:   string;
  financialYear:    string;
}

// ── Document ─────────────────────────────────────────────
export interface Document {
  id:                  number;
  projectId?:          number;
  projectNameEn?:      string;
  fundId?:             number;
  expenditureId?:      number;
  documentType:        DocumentType;
  titleEn?:            string;
  titleHi?:            string;
  originalFileName:    string;
  fileType:            string;
  fileSizeKb?:         number;
  isPublic:            boolean;
  downloadUrl:         string;
  uploadedByUsername?: string;
  uploadedAt:          string;
}

// ── Audit Log ────────────────────────────────────────────
export interface AuditLog {
  id:                  number;
  tableName:           string;
  recordId?:           number;
  action:              AuditAction;
  changedByUsername?:  string;
  changedByRole?:      string;
  ipAddress?:          string;
  oldValues?:          string;
  newValues?:          string;
  changeSummary?:      string;
  createdAt:           string;
}

// ── Dashboard summary ─────────────────────────────────────
export interface DashboardStats {
  totalFundsReceived:    number;
  totalProjects:         number;
  ongoingProjects:       number;
  completedProjects:     number;
  plannedProjects:       number;
  totalAllocatedBudget:  number;
  totalSpent:            number;
  budgetUtilizationPct:  number;
}
