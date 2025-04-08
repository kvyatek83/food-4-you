import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const authUser = window.localStorage.getItem('auth-user');
    if (authUser) {
      const token = JSON.parse(authUser);
      if (token) {
        const tokenPayload = JSON.parse(window.atob(token.split('.')[1]));
        const currentPath = state.url;

        if (Date.now() < tokenPayload.exp * 1000) {
          if (tokenPayload.role === 'admin') {
            return true;
          } else if (currentPath.includes(tokenPayload.role)) {
            return true;
          }
        }
      }
    }

    this.router.navigate(['/login']);
    return false;
  }
}
