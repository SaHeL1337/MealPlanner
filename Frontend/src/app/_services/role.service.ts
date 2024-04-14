import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Role } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class RoleService {
    private roleSubject: BehaviorSubject<Role>;
    public role: Observable<Role>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.roleSubject = new BehaviorSubject<Role>(JSON.parse(localStorage.getItem('role')));
        this.role = this.roleSubject.asObservable();
    }

    public get roleValue(): Role {
        return this.roleSubject.value;
    }

    getAll() {
        return this.http.get<Role[]>(`${environment.apiUrl}/roles`);
    }

    getById(id: string) {
        return this.http.get<Role>(`${environment.apiUrl}/roles/${id}`);
    }

    update(id, params) {
        return this.http.put(`${environment.apiUrl}/roles/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/roles/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }
}
