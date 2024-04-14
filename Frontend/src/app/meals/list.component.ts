import { Component, OnInit } from '@angular/core';
import { first, filter } from 'rxjs/operators';

import { MealService } from '@app/_services';

import { ConfirmationDialogService } from '@app/confirmation-dialog/confirmation-dialog.service';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    meals = null;

    constructor(
      private mealService: MealService,
      private confirmationDialogService: ConfirmationDialogService
    ) {}

    ngOnInit() {
        this.mealService.getAll()
            .pipe(first())
            .subscribe(meals => this.meals = meals);

      }

    deleteMeal(id: string) {
        this.confirmationDialogService.confirm('Confirm Deletion',
            'Are you sure you want to delete the meal with id ' + id + '? This can not be undone.',)
        .then((confirmed) => {
            if(confirmed){
            const meal = this.meals.find(x => x.id === id);
            meal.isDeleting = true;
            this.mealService.delete(id)
                .pipe(first())
                .subscribe(() => this.meals = this.meals.filter(x => x.id !== id));
        }} );
    }
}
