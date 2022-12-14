export interface AuthContext {
  userID: string;
  rights?: string[];
  role?: string;
  otp?: boolean;
  session?: any;
}
