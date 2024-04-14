import { Component, OnInit } from '@angular/core';
import { first, filter } from 'rxjs/operators';

import { AccountService } from '@app/_services';

import { ConfirmationDialogService } from '@app/confirmation-dialog/confirmation-dialog.service';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    users = null;
    usersOnline = 1;

    constructor(
      private accountService: AccountService,
      private confirmationDialogService: ConfirmationDialogService
    ) {}

    ngOnInit() {
        this.accountService.getAll()
            .pipe(first())
            .subscribe(users => this.users = users);

        this.accountService.getAllRefreshTokens()
            .pipe(first())
            .subscribe(refreshTokens => this.usersOnline = refreshTokens != null ? refreshTokens.length : 1);
    }

    deleteUser(id: string) {
        this.confirmationDialogService.confirm('Confirm Deletion',
            'Are you sure you want to delete the user with id ' + id + '? This can not be undone.',)
        .then((confirmed) => {
            if(confirmed){
            const user = this.users.find(x => x.id === id);
            user.isDeleting = true;
            this.accountService.delete(id)
                .pipe(first())
                .subscribe(() => this.users = this.users.filter(x => x.id !== id));
        }} );
    }
}
