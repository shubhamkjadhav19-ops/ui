import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const isAuthEndpoint = req.url.includes('/auth/');

  if (isAuthEndpoint) {
    return next(req);
  }

  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  if (authService.isTokenExpired(token)) {
    authService.logout();
    toastService.showError('Session expired. Please login again.');
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  return next(cloned).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.logout();
        toastService.showError('Session expired. Please login again.');
      }
      return throwError(() => error);
    })
  );
};
