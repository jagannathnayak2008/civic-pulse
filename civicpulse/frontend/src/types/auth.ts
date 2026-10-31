export interface User {
  id: string;
  full_name: string;
  phone_number: string;
  role: 'CITIZEN' | 'OFFICER' | 'ADMIN';
  created_at: string;
  last_login?: string | null;
}

export interface AuthSuccessResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface LoginFormData {
  login_identifier: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterFormData {
  full_name: string;
  phone_number: string;
  password: string;
  confirm_password: string;
  role?: 'CITIZEN' | 'OFFICER';
}

