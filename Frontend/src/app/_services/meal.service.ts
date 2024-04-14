import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Meal, MealPreference } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class MealService {
    public meal: Observable<Meal>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {  }

    getAll() {
        return this.http.get<Meal[]>(`${environment.apiUrl}/meals`);
    }

    getAllUserMealPreferences() {
        return this.http.get<MealPreference[]>(`${environment.apiUrl}/user/meal/preferences`);
    }

    updateMealPreference(id, params) {
      return this.http.put(`${environment.apiUrl}/user/meal/preferences/${id}`, params)
          .pipe(map(x => {
              return x;
          }));
    }

    removeMealFromPreferences(preferenceID) {
      return this.http.delete(`${environment.apiUrl}/user/meal/preferences/${preferenceID}`)
          .pipe(map(x => {
              return x;
          }));
    }

    getById(id: string) {
        return this.http.get<Meal>(`${environment.apiUrl}/meals/${id}`);
    }

    update(id, params) {
        return this.http.put(`${environment.apiUrl}/meals/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/meals/${id}`)
          .pipe(map(x => {
              return x;
          }));
    }
}
