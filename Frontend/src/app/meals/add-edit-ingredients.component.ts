import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { IngredientService, MealService, AlertService } from '@app/_services';

@Component({ templateUrl: 'add-edit-Ingredients.component.html' })
export class AddEditIngredientsComponent implements OnInit {
    form: FormGroup;
    mealid: string;
    ingredients = [];
    mealIngredients: [];
    ingredientsLoaded = false;
    mealIngredientsLoaded = false;
    submitted = false;
    submitting = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private mealService: MealService,
        private alertService: AlertService,
        private ingredientService: IngredientService
    ) {}

    ngOnInit() {
        this.mealid = this.route.snapshot.params['id'];

        this.ingredientService.getAll()
            .pipe(first())
            .subscribe(ingredients => {
              this.ingredients = ingredients;
              let group = {};
              for(let ingredient of ingredients){
                group[ingredient.id] = [false, null];
              }
              this.form = this.formBuilder.group(group);
              this.ingredientsLoaded = true;
            });

        this.mealService.getById(this.mealid)
            .pipe(first())
            .subscribe(meal => {
              this.mealIngredients = meal.ingredients
              let group = {};
              for(let ingredient of meal.ingredients){
                this.form.controls[ingredient].setValue(true);
              }
              this.mealIngredientsLoaded = true;
            });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.submitting = true;

        // reset alerts on submit
        this.alertService.clear();

        this.updateMeal();
    }

    private updateMeal() {
      let meal = {'ingredients' : []};
      let values = this.form.value;


      for(let ingredient of this.ingredients){
          if(values[ingredient['id']] === true){
            meal.ingredients.push(ingredient['id']);
          }
      }
        this.mealService.update(this.mealid, meal)
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
