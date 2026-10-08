import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { getApiErrorMessage } from '../models/common/api-error-message.util';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = getApiErrorMessage(error);

      return throwError(() =>
        new Error(message)
      );
    })
  );
