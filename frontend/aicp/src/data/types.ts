export type Role = 'clerk' | 'staff_hod' | 'principal' | 'institute_authority' | 'government_authority';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  institute_id: string;
  avatar?: string;
}

export interface Institute {
  id: string;
  name: string;
  code: string;
  type: string;
  location: string;
  totalDocuments: number;
  complianceScore: number;
}

export type DocumentStatus = 'valid' | 'expiring' | 'expired';
export type ApprovalStatus = 'pending_review' | 'pending_approval' | 'pending_verification' | 'approved' | 'rejected';

export interface ComplianceDocument {
  id: string;
  name: string;
  category: string;
  institute_id: string;
  instituteName: string;
  uploadedBy: string;
  responsibleUser: string;
  uploadDate: string;
  expiryDate: string;
  status: DocumentStatus;
  approvalStatus: ApprovalStatus;
  fileType: string;
  fileSize: string;
}

export interface Approval {
  id: string;
  documentId: string;
  documentName: string;
  instituteName: string;
  submittedBy: string;
  submittedDate: string;
  currentStep: string;
  status: ApprovalStatus;
  comments?: string;
}

export interface ActivityItem {
  id: string;
  type: 'upload' | 'approval' | 'reminder' | 'expiry' | 'review';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
}

export const ROLE_LABELS: Record<Role, string> = {
  clerk: 'Clerk',
  staff_hod: 'Staff / HOD',
  principal: 'Principal',
  institute_authority: 'Institute Authority',
  government_authority: 'Government Authority',
};

export const CATEGORIES = [
  'NAAC Accreditation',
  'AICTE Approval',
  'Affiliation Certificate',
  'Fire Safety',
  'Building Compliance',
  'Faculty Credentials',
  'Financial Audit',
  'Anti-Ragging',
  'UGC Compliance',
  'ISO Certification',
  'Environmental Clearance',
  'Sports Infrastructure',
];
