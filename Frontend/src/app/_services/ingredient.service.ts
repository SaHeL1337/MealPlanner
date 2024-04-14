import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Ingredient, Unit } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class IngredientService {
    private ingredientSubject: BehaviorSubject<Ingredient>;
    public ingredient: Observable<Ingredient>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.ingredientSubject = new BehaviorSubject<Ingredient>(JSON.parse(localStorage.getItem('ingredient')));
        this.ingredient = this.ingredientSubject.asObservable();
    }

    public get ingredientValue(): Ingredient {
        return this.ingredientSubject.value;
    }

    getAll() {
        return this.http.get<Ingredient[]>(`${environment.apiUrl}/ingredients`);
    }

    getAllUnits() {
        return this.http.get<Unit[]>(`${environment.apiUrl}/units`);
    }

    getById(id: string) {
        return this.http.get<Ingredient>(`${environment.apiUrl}/ingredients/${id}`);
    }

    update(id, params) {
        return this.http.put(`${environment.apiUrl}/ingredients/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/ingredients/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }
}
