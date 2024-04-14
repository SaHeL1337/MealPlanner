import { Component } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService } from './_services';
import { User } from './_models';

@Component({ selector: 'app', templateUrl: 'app.component.html' })
export class AppComponent{
    user: User;

    constructor(private accountService: AccountService) {
        this.accountService.user.subscribe(x => this.user = x);
    }

    logout() {
        this.accountService.logout()
          .pipe(first())
          .subscribe(users => console.log("logged out"));
    }
}
