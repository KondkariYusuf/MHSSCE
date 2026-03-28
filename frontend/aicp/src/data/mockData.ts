import { User, Institute, ComplianceDocument, Approval, ActivityItem } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Fatima Khan', email: 'fatima@anjuman.edu', role: 'clerk', institute_id: 'i1' },
  { id: 'u2', name: 'Ahmed Siddiqui', email: 'ahmed@anjuman.edu', role: 'staff_hod', institute_id: 'i1' },
  { id: 'u3', name: 'Dr. Naeem Ansari', email: 'naeem@anjuman.edu', role: 'principal', institute_id: 'i1' },
  { id: 'u4', name: 'Prof. Zainab Ali', email: 'zainab@anjuman.edu', role: 'institute_authority', institute_id: 'i1' },
  { id: 'u5', name: 'Mr. Raza Sheikh', email: 'raza@gov.in', role: 'government_authority', institute_id: 'i1' },
  { id: 'u6', name: 'Salim Patel', email: 'salim@anjuman.edu', role: 'clerk', institute_id: 'i2' },
  { id: 'u7', name: 'Dr. Hina Joshi', email: 'hina@anjuman.edu', role: 'principal', institute_id: 'i3' },
];

export const mockInstitutes: Institute[] = [
  { id: 'i1', name: 'Anjuman-I-Islam College of Engineering', code: 'AICE', type: 'Engineering', location: 'Mumbai', totalDocuments: 24, complianceScore: 87 },
  { id: 'i2', name: 'M.H. Saboo Siddik College of Engineering', code: 'MHSS', type: 'Engineering', location: 'Mumbai', totalDocuments: 18, complianceScore: 72 },
  { id: 'i3', name: 'Anjuman-I-Islam Degree College', code: 'AIDC', type: 'Arts & Science', location: 'Mumbai', totalDocuments: 15, complianceScore: 91 },
  { id: 'i4', name: 'Anjuman-I-Islam Polytechnic', code: 'AIP', type: 'Polytechnic', location: 'Mumbai', totalDocuments: 12, complianceScore: 65 },
  { id: 'i5', name: 'Anjuman-I-Islam School of Architecture', code: 'AISA', type: 'Architecture', location: 'Mumbai', totalDocuments: 10, complianceScore: 78 },
  { id: 'i6', name: 'Akbar Peerbhoy College of Commerce', code: 'APCC', type: 'Commerce', location: 'Mumbai', totalDocuments: 20, complianceScore: 83 },
  { id: 'i7', name: 'Anjuman-I-Islam Urdu High School', code: 'AIUHS', type: 'School', location: 'Pune', totalDocuments: 8, complianceScore: 95 },
  { id: 'i8', name: 'Allana College of Pharmacy', code: 'ACP', type: 'Pharmacy', location: 'Pune', totalDocuments: 14, complianceScore: 69 },
];

const today = new Date();
const daysFromNow = (d: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + d);
  return date.toISOString().split('T')[0];
};
const daysAgo = (d: number) => daysFromNow(-d);

export const mockDocuments: ComplianceDocument[] = [
  { id: 'd1', name: 'NAAC Accreditation Certificate', category: 'NAAC Accreditation', institute_id: 'i1', instituteName: 'Anjuman-I-Islam College of Engineering', uploadedBy: 'Fatima Khan', responsibleUser: 'Dr. Naeem Ansari', uploadDate: daysAgo(120), expiryDate: daysFromNow(400), status: 'valid', approvalStatus: 'approved', fileType: 'PDF', fileSize: '2.4 MB' },
  { id: 'd2', name: 'AICTE Approval Letter 2024-25', category: 'AICTE Approval', institute_id: 'i1', instituteName: 'Anjuman-I-Islam College of Engineering', uploadedBy: 'Fatima Khan', responsibleUser: 'Ahmed Siddiqui', uploadDate: daysAgo(60), expiryDate: daysFromNow(75), status: 'expiring', approvalStatus: 'approved', fileType: 'PDF', fileSize: '1.8 MB' },
  { id: 'd3', name: 'Fire Safety Certificate', category: 'Fire Safety', institute_id: 'i1', instituteName: 'Anjuman-I-Islam College of Engineering', uploadedBy: 'Fatima Khan', responsibleUser: 'Ahmed Siddiqui', uploadDate: daysAgo(400), expiryDate: daysAgo(10), status: 'expired', approvalStatus: 'approved', fileType: 'PDF', fileSize: '0.9 MB' },
  { id: 'd4', name: 'University Affiliation Certificate', category: 'Affiliation Certificate', institute_id: 'i2', instituteName: 'M.H. Saboo Siddik College of Engineering', uploadedBy: 'Salim Patel', responsibleUser: 'Dr. Hina Joshi', uploadDate: daysAgo(30), expiryDate: daysFromNow(200), status: 'valid', approvalStatus: 'pending_approval', fileType: 'PDF', fileSize: '3.1 MB' },
  { id: 'd5', name: 'Building Stability Certificate', category: 'Building Compliance', institute_id: 'i3', instituteName: 'Anjuman-I-Islam Degree College', uploadedBy: 'Fatima Khan', responsibleUser: 'Prof. Zainab Ali', uploadDate: daysAgo(15), expiryDate: daysFromNow(45), status: 'expiring', approvalStatus: 'pending_review', fileType: 'PDF', fileSize: '5.2 MB' },
  { id: 'd6', name: 'Anti-Ragging Committee Report', category: 'Anti-Ragging', institute_id: 'i1', instituteName: 'Anjuman-I-Islam College of Engineering', uploadedBy: 'Fatima Khan', responsibleUser: 'Dr. Naeem Ansari', uploadDate: daysAgo(5), expiryDate: daysFromNow(360), status: 'valid', approvalStatus: 'pending_review', fileType: 'PDF', fileSize: '1.2 MB' },
  { id: 'd7', name: 'ISO 9001 Certification', category: 'ISO Certification', institute_id: 'i4', instituteName: 'Anjuman-I-Islam Polytechnic', uploadedBy: 'Salim Patel', responsibleUser: 'Ahmed Siddiqui', uploadDate: daysAgo(200), expiryDate: daysAgo(5), status: 'expired', approvalStatus: 'approved', fileType: 'PDF', fileSize: '2.7 MB' },
  { id: 'd8', name: 'Faculty Qualification Documents', category: 'Faculty Credentials', institute_id: 'i5', instituteName: 'Anjuman-I-Islam School of Architecture', uploadedBy: 'Fatima Khan', responsibleUser: 'Dr. Naeem Ansari', uploadDate: daysAgo(45), expiryDate: daysFromNow(320), status: 'valid', approvalStatus: 'approved', fileType: 'ZIP', fileSize: '12.5 MB' },
  { id: 'd9', name: 'Financial Audit Report 2023-24', category: 'Financial Audit', institute_id: 'i6', instituteName: 'Akbar Peerbhoy College of Commerce', uploadedBy: 'Salim Patel', responsibleUser: 'Prof. Zainab Ali', uploadDate: daysAgo(90), expiryDate: daysFromNow(270), status: 'valid', approvalStatus: 'pending_verification', fileType: 'PDF', fileSize: '4.8 MB' },
  { id: 'd10', name: 'Environmental Clearance NOC', category: 'Environmental Clearance', institute_id: 'i7', instituteName: 'Anjuman-I-Islam Urdu High School', uploadedBy: 'Fatima Khan', responsibleUser: 'Ahmed Siddiqui', uploadDate: daysAgo(10), expiryDate: daysFromNow(85), status: 'expiring', approvalStatus: 'pending_approval', fileType: 'PDF', fileSize: '1.5 MB' },
  { id: 'd11', name: 'UGC Recognition Letter', category: 'UGC Compliance', institute_id: 'i3', instituteName: 'Anjuman-I-Islam Degree College', uploadedBy: 'Salim Patel', responsibleUser: 'Dr. Hina Joshi', uploadDate: daysAgo(300), expiryDate: daysFromNow(65), status: 'expiring', approvalStatus: 'approved', fileType: 'PDF', fileSize: '0.8 MB' },
  { id: 'd12', name: 'Sports Infrastructure Report', category: 'Sports Infrastructure', institute_id: 'i8', instituteName: 'Allana College of Pharmacy', uploadedBy: 'Fatima Khan', responsibleUser: 'Ahmed Siddiqui', uploadDate: daysAgo(50), expiryDate: daysAgo(20), status: 'expired', approvalStatus: 'approved', fileType: 'PDF', fileSize: '6.3 MB' },
];

export const mockApprovals: Approval[] = [
  { id: 'a1', documentId: 'd5', documentName: 'Building Stability Certificate', instituteName: 'Anjuman-I-Islam Degree College', submittedBy: 'Fatima Khan', submittedDate: daysAgo(15), currentStep: 'Staff/HOD Review', status: 'pending_review' },
  { id: 'a2', documentId: 'd6', documentName: 'Anti-Ragging Committee Report', instituteName: 'Anjuman-I-Islam College of Engineering', submittedBy: 'Fatima Khan', submittedDate: daysAgo(5), currentStep: 'Staff/HOD Review', status: 'pending_review' },
  { id: 'a3', documentId: 'd4', documentName: 'University Affiliation Certificate', instituteName: 'M.H. Saboo Siddik College of Engineering', submittedBy: 'Salim Patel', submittedDate: daysAgo(30), currentStep: 'Principal Approval', status: 'pending_approval' },
  { id: 'a4', documentId: 'd10', documentName: 'Environmental Clearance NOC', instituteName: 'Anjuman-I-Islam Urdu High School', submittedBy: 'Fatima Khan', submittedDate: daysAgo(10), currentStep: 'Principal Approval', status: 'pending_approval' },
  { id: 'a5', documentId: 'd9', documentName: 'Financial Audit Report 2023-24', instituteName: 'Akbar Peerbhoy College of Commerce', submittedBy: 'Salim Patel', submittedDate: daysAgo(90), currentStep: 'Authority Verification', status: 'pending_verification' },
];

export const mockActivities: ActivityItem[] = [
  { id: 'act1', type: 'reminder', message: '⚠️ AICTE Approval Letter expiring in 75 days — AICE', timestamp: daysAgo(0), severity: 'warning' },
  { id: 'act2', type: 'expiry', message: '🔴 Fire Safety Certificate has EXPIRED — AICE', timestamp: daysAgo(10), severity: 'danger' },
  { id: 'act3', type: 'upload', message: '📄 Anti-Ragging Committee Report uploaded by Fatima Khan', timestamp: daysAgo(5), severity: 'info' },
  { id: 'act4', type: 'approval', message: '✅ Financial Audit Report moved to Authority Verification', timestamp: daysAgo(7), severity: 'success' },
  { id: 'act5', type: 'reminder', message: '⚠️ Building Stability Certificate expiring in 45 days — AIDC', timestamp: daysAgo(1), severity: 'warning' },
  { id: 'act6', type: 'expiry', message: '🔴 ISO 9001 Certification has EXPIRED — AIP', timestamp: daysAgo(5), severity: 'danger' },
  { id: 'act7', type: 'reminder', message: '🟡 Environmental Clearance NOC expiring in 85 days — AIUHS', timestamp: daysAgo(2), severity: 'warning' },
  { id: 'act8', type: 'upload', message: '📄 Environmental Clearance NOC uploaded by Fatima Khan', timestamp: daysAgo(10), severity: 'info' },
  { id: 'act9', type: 'reminder', message: '🟡 UGC Recognition Letter expiring in 65 days — AIDC', timestamp: daysAgo(3), severity: 'warning' },
  { id: 'act10', type: 'expiry', message: '🔴 Sports Infrastructure Report has EXPIRED — ACP', timestamp: daysAgo(20), severity: 'danger' },
  { id: 'act11', type: 'review', message: '👁️ Building Stability Certificate sent for Staff/HOD review', timestamp: daysAgo(15), severity: 'info' },
  { id: 'act12', type: 'approval', message: '✅ NAAC Accreditation Certificate approved by Authority', timestamp: daysAgo(30), severity: 'success' },
];
