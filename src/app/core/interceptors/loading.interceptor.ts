import { inject }           from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize }          from 'rxjs/operators';
import { LoadingService }    from '../services/loading.service';

let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/assets/i18n/')) {
    return next(req);
  }

  const loadingService = inject(LoadingService);

  activeRequests++;
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      activeRequests--;
      if (activeRequests === 0) {
        loadingService.hide();
      }
    })
  );
};