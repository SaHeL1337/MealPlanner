import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '@environments/environment';
import { AccountService } from '@app/_services';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { catchError, switchMap, filter, take  } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private accountService: AccountService, private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if user is logged in and request is to the api url
        const user = this.accountService.userValue;
        const isLoggedIn = user && user.token;
        const isApiUrl = request.url.startsWith(environment.apiUrl);
        if (isLoggedIn && isApiUrl) {
            request = this.addToken(request,user.token);
        }

        return next.handle(request).pipe(catchError(error => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
              return this.handle401Error(request, next);
          } else if (error instanceof HttpErrorResponse){
              this.isRefreshing = false;
              this.accountService.deleteLocalUserData();
              this.accountService.redirectToLoginPage();
              return throwError(error);
          } else {
              return throwError(error);
          }
        }));
    }



    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
      const user = this.accountService.userValue;

      if (this.isRefreshing === false) {
        this.isRefreshing = true;
        this.refreshTokenSubject.next(null);

        return this.accountService.refreshToken(user.refreshToken).pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(response.token);
            return next.handle(this.addToken(request, response.token));
          }));

      } else {
        return this.refreshTokenSubject.pipe(
          filter(token => token != null),
          take(1),
          switchMap(jwt => {
            this.isRefreshing = false;
            return next.handle(this.addToken(request, jwt));
          }));
      }
    }

    private addToken(request: HttpRequest<any>, token) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}
