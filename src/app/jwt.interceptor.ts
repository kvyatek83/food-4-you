import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
const TOKEN_HEADER_KEY = 'authorization';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!req.url.includes('admin') && !req.url.includes('travler')) {
      return next.handle(req);
    }

    var authReq = req;
    const authUser = window.localStorage.getItem('auth-user');
    if (authUser) {
      const token = JSON.parse(authUser);

      // TODO: if token exp and client fire http call, nav to login
      // const tokenPayload = JSON.parse(window.atob(token.split('.')[1]));

      // if (Date.now() < tokenPayload.exp * 1000) {
      // } else {

      // }

      if (token) {
        authReq = req.clone({
          headers: req.headers.set(TOKEN_HEADER_KEY, token),
        });
      }
    }

    return next.handle(authReq);
  }
}
