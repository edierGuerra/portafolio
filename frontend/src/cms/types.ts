export interface CmsUser {
  id: number;
  email: string;
  name: string;
  professional_profile: string;
  about_me: string;
  profile_image: string;
  location: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  user: CmsUser;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface MeResponse {
  user: CmsUser;
}
