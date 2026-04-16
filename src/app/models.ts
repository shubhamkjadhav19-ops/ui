export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
}

export interface BlogRequest {
  title: string;
  content: string;
  image?: File | null;
}

export interface BlogResponse {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  authorUsername: string;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
