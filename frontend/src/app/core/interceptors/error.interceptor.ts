import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Une erreur est survenue';

      if (error.error?.message) {
        message = error.error.message;
      } else if (error.status === 403) {
        message = 'Accès refusé — droits insuffisants';
      } else if (error.status === 0) {
        message = 'Impossible de contacter le serveur';
      }

      snackBar.open(message, 'Fermer', {
        duration: 4000,
        panelClass: ['snack-error']
      });

      return throwError(() => error);
    })
  );
};
