import { Component, OnInit } from '@angular/core';
import { first, filter } from 'rxjs/operators';

import { RoleService } from '@app/_services';

import { ConfirmationDialogService } from '@app/confirmation-dialog/confirmation-dialog.service';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    roles = null;

    constructor(
      private roleService: RoleService,
      private confirmationDialogService: ConfirmationDialogService
    ) {}

    ngOnInit() {
        this.roleService.getAll()
            .pipe(first())
            .subscribe(roles => this.roles = roles);
    }

    deleteRole(id: string) {
        this.confirmationDialogService.confirm('Confirm Deletion',
            'Are you sure you want to delete the role with id ' + id + '? This can not be undone.',)
        .then((confirmed) => {
          if(confirmed){
            const role = this.roles.find(x => x.id === id);
            role.isDeleting = true;
            this.roleService.delete(id)
                .pipe(first())
                .subscribe(() => this.roles = this.roles.filter(x => x.id !== id));
            console.log('User confirmed:', confirmed)
          }} );

    }

}
