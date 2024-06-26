﻿import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AccountService } from '@app/_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        const user = this.accountService.userValue;
        const roles = user.roles ? user.roles : [];
        if (user) {
          if (route.data.requiredRole) {
            if(roles.includes(route.data.requiredRole)){
                return true;
            }else{
                return false;
            }
          }else{
            return true;
          }
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}


//not logged, not guarded -> checked
//not logged, guarded
//logged, guarded -> check
//logged, not guarded -> check
