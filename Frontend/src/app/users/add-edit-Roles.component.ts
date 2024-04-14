import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { RoleService, AccountService, AlertService } from '@app/_services';

@Component({ templateUrl: 'add-edit-Roles.component.html' })
export class AddEditRolesComponent implements OnInit {
    form: FormGroup;
    userid: string;
    roles = [];
    userRoles: [];
    rolesLoaded = false;
    userRolesLoaded = false;
    submitted = false;
    submitting = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,
        private roleService: RoleService
    ) {}

    ngOnInit() {
        this.userid = this.route.snapshot.params['id'];

        this.roleService.getAll()
            .pipe(first())
            .subscribe(roles => {
              this.roles = roles;
              let group = {};
              for(let role of roles){
                group[role.id] = [false, null];
              }
              this.form = this.formBuilder.group(group);
              this.rolesLoaded = true;
            });

        this.accountService.getById(this.userid)
            .pipe(first())
            .subscribe(user => {
              this.userRoles = user.roles
              let group = {};
              for(let role of user.roles){
                this.form.controls[role].setValue(true);
              }
              this.userRolesLoaded = true;
            });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.submitting = true;

        // reset alerts on submit
        this.alertService.clear();

        this.updateUser();
    }

    private updateUser() {
      let user = {'roles' : []};
      let values = this.form.value;


      for(let role of this.roles){
          if(values[role['id']] === true){
            user.roles.push(role['id']);
          }
      }
        this.accountService.update(this.userid, user)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            });

    }
}
