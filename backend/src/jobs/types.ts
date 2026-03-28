export interface ExpiryCheckJobData {
  triggeredBy: "scheduler" | "manual";
}

export interface NotificationJobData {
  documentId: string;
  instituteId: string;
  documentName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  milestone: "THREE_MONTHS" | "ONE_MONTH" | "EXACT_DAY";
}
