// ── CMS Enums ─────────────────────────────────────────────
export type ComplaintStatus =
  | 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'ASSIGNED'
  | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EvidenceType      = 'SUBMISSION_PHOTO' | 'SUBMISSION_DOC' | 'RESOLUTION_PROOF' | 'OFFICER_NOTE_ATTACHMENT';
export type NotificationType  =
  | 'COMPLAINT_SUBMITTED' | 'COMPLAINT_VERIFIED' | 'COMPLAINT_REJECTED'
  | 'COMPLAINT_ASSIGNED'  | 'OFFICER_UPDATE'     | 'RESOLUTION_READY'
  | 'RESOLUTION_ACCEPTED' | 'RESOLUTION_REJECTED'| 'ESCALATION_ALERT';

// ── Auth / Registration ───────────────────────────────────
export interface ResidentRegisterRequest {
  fullName:   string;
  username:   string;
  password:   string;
  phone:      string;
  wardNumber: number;
}

export interface OtpVerifyRequest {
  phone: string;
  otp:   string;
}

// ── Category ──────────────────────────────────────────────
export interface CategoryResponse {
  id:                  number;
  nameEn:              string;
  nameHi:              string;
  descriptionEn:       string;
  slaDays:             number;
  escalationAfterDays: number;
  defaultPriority:     ComplaintPriority;
  displayOrder:        number;
}

// ── Complaint Summary (list view) ─────────────────────────
export interface ComplaintSummaryResponse {
  id:                   number;
  complaintNumber:      string;
  titleEn:              string;
  titleHi:              string;
  categoryNameEn:       string;
  categoryNameHi:       string;
  wardNumber:           number;
  locationText:         string;
  status:               ComplaintStatus;
  priority:             ComplaintPriority;
  escalationLevel:      number;
  supportCount:         number;
  submitterDisplayName: string;
  assignedOfficerName:  string | null;
  dueDate:              string | null;
  isOverdue:            boolean;
  createdAt:            string;
  updatedAt:            string;
}

// ── Timeline Entry ────────────────────────────────────────
export interface TimelineEntryResponse {
  id:           number;
  fromStatus:   ComplaintStatus | null;
  toStatus:     ComplaintStatus;
  actorRole:    string;
  actorName:    string;
  note:         string;
  isPublicNote: boolean;
  createdAt:    string;
}

// ── Evidence ──────────────────────────────────────────────
export interface EvidenceResponse {
  id:               number;
  evidenceType:     EvidenceType;
  originalFileName: string;
  fileType:         string | null;
  fileSizeKb:       number;
  downloadUrl:      string;
  isPublic:         boolean;
  uploadedByName:   string;
  createdAt:        string;
}

// ── Complaint Detail (full view) ──────────────────────────
export interface ComplaintDetailResponse {
  id:                      number;
  complaintNumber:         string;
  titleEn:                 string;
  titleHi:                 string;
  descriptionEn:           string;
  descriptionHi:           string;
  categoryNameEn:          string;
  categoryNameHi:          string;
  wardNumber:              number;
  locationText:            string;
  latitude:                number | null;
  longitude:               number | null;
  status:                  ComplaintStatus;
  priority:                ComplaintPriority;
  escalationLevel:         number;
  supportCount:            number;
  hasVoted:                boolean | null;
  submitterDisplayName:    string;
  assignedOfficerName:     string | null;
  dueDate:                 string | null;
  isOverdue:               boolean;
  resolutionNote:          string | null;
  resolvedAt:              string | null;
  closedAt:                string | null;
  citizenResponseDeadline: string | null;
  rejectionReason:         string | null;
  isDuplicateFlagged:      boolean;
  duplicateOfNumber:       string | null;
  timeline:                TimelineEntryResponse[];
  isPublic:                boolean;
  evidence:                EvidenceResponse[];
  createdAt:               string;
  updatedAt:               string;
}

// ── Stats ─────────────────────────────────────────────────
export interface ComplaintStatsResponse {
  total:      number;
  submitted:  number;
  verified:   number;
  inProgress: number;
  resolved:   number;
  closed:     number;
  rejected:   number;
  escalated:  number;
  overdue:    number;
  byCategory: { [key: string]: number };
}

// ── Vote ──────────────────────────────────────────────────
export interface VoteResponse {
  voted:           boolean;
  newSupportCount: number;
}

// ── Notification ──────────────────────────────────────────
export interface NotificationResponse {
  id:               number;
  complaintId:      number | null;
  complaintNumber:  string | null;
  notificationType: NotificationType;
  titleEn:          string;
  titleHi:          string;
  messageEn:        string;
  messageHi:        string;
  isRead:           boolean;
  createdAt:        string;
}

// ── Request DTOs ──────────────────────────────────────────
export interface SubmitComplaintRequest {
  categoryId:        number;
  wardNumber:        number;
  titleEn:           string;
  titleHi?:          string;
  descriptionEn:     string;
  descriptionHi?:    string;
  locationText:      string;
  latitude?:         number;
  longitude?:        number;
  priority?:         ComplaintPriority;
  isAnonymousDisplay: boolean;
}

export interface ResolveComplaintRequest {
  resolutionNote: string;
}

export interface PostUpdateRequest {
  note:         string;
  isPublicNote: boolean;
}

export interface AssignComplaintRequest {
  officerId: number;
  dueDate?:  string;
}

export interface RejectComplaintRequest {
  reason: string;
}

export interface ResolutionResponseRequest {
  rejectionReason?: string;
}

// ── Status display helpers ────────────────────────────────
export const STATUS_LABELS: Record<ComplaintStatus, { en: string; hi: string; color: string }> = {
  DRAFT:       { en: 'Draft',       hi: 'मसौदा',       color: '#9e9e9e' },
  SUBMITTED:   { en: 'Submitted',   hi: 'दर्ज',         color: '#1565c0' },
  VERIFIED:    { en: 'Verified',    hi: 'सत्यापित',     color: '#6a1b9a' },
  ASSIGNED:    { en: 'Assigned',    hi: 'सौंपा गया',    color: '#e65100' },
  IN_PROGRESS: { en: 'In Progress', hi: 'प्रगति पर',    color: '#f57f17' },
  RESOLVED:    { en: 'Resolved',    hi: 'समाधान',       color: '#2e7d32' },
  CLOSED:      { en: 'Closed',      hi: 'बंद',          color: '#37474f' },
  REJECTED:    { en: 'Rejected',    hi: 'अस्वीकृत',     color: '#c62828' },
};

export const PRIORITY_LABELS: Record<ComplaintPriority, { en: string; color: string }> = {
  LOW:      { en: 'Low',      color: '#43a047' },
  MEDIUM:   { en: 'Medium',   color: '#fb8c00' },
  HIGH:     { en: 'High',     color: '#e53935' },
  CRITICAL: { en: 'Critical', color: '#b71c1c' },
};
