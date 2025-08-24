import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { Router } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        (req, next) =>
          new AuthInterceptor(inject(AuthService), inject(Router)).intercept(req, {
            handle: next,
          }),
        (req, next) =>
          new ErrorInterceptor(inject(AuthService), inject(Router)).intercept(
            req,
            { handle: next }
          ),
      ])
    ),
    provideAnimations(),
  ],
};
