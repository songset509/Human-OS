export interface SessionUser {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  demo?: boolean;
}
