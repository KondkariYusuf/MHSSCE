import type { User } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      auth?: {
        user: User;
        profile: {
          id: string;
          institute_id: string | null;
          role: "Clerk" | "Staff" | "Principal" | "Institute Authority";
          full_name: string;
        };
        token: string;
      };
    }
  }
}

export {};
