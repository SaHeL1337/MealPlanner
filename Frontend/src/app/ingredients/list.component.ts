import { Component, OnInit } from '@angular/core';
import { first, filter } from 'rxjs/operators';

import { IngredientService } from '@app/_services';

import { ConfirmationDialogService } from '@app/confirmation-dialog/confirmation-dialog.service';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    ingredients = null;

    constructor(
      private ingredientService: IngredientService,
      private confirmationDialogService: ConfirmationDialogService
    ) {}

    ngOnInit() {
        this.ingredientService.getAll()
            .pipe(first())
            .subscribe(ingredients => this.ingredients = ingredients);
    }

    deleteIngredient(id: string) {
        this.confirmationDialogService.confirm('Confirm Deletion',
            'Are you sure you want to delete the ingredient with id ' + id + '? This can not be undone.',)
        .then((confirmed) => {
          if(confirmed){
            const ingredients = this.ingredients.find(x => x.id === id);
            ingredients.isDeleting = true;
            this.ingredientService.delete(id)
                .pipe(first())
                .subscribe(() => this.ingredients = this.ingredients.filter(x => x.id !== id));
            console.log('User confirmed:', confirmed)
          }} );

    }

}
