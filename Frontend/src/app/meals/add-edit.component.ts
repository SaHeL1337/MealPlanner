import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { first, map, startWith } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { MealService, IngredientService, AlertService } from '@app/_services';

import { Ingredient } from '@app/_models';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    isAddMode: boolean;
    loading = false;
    submitted = false;
    ingredients = [];
    filteredIngredients = [];
    ingredientsOfMeal = [];
    ingredientsLoaded = false;
    units = [];
    unitsLoaded = false;
    ingredientToAdd = new FormControl();
    ingredientToAddAmount = new FormControl();

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private mealService: MealService,
        private alertService: AlertService,
        private ingredientService: IngredientService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        this.ingredientService.getAll()
            .pipe(first())
            .subscribe(ingredients => {
              this.ingredients = ingredients;
              this.ingredientsLoaded = true;
            });

        this.ingredientService.getAllUnits()
            .pipe(first())
            .subscribe(units => {
              this.units = units;
              this.unitsLoaded = true;
            });

        this.ingredientToAdd.valueChanges
          .subscribe(input => {
             this.filteredIngredients = this.ingredients
             .filter(i => i.name.toLowerCase().indexOf(input.toLowerCase()) != -1).slice(0,5);
           });


        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            servings: ['', Validators.required]
        });

        if (!this.isAddMode) {
            this.mealService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                   this.form.patchValue(x);
                   this.ingredientsOfMeal = x.ingredients;
                   console.log(x);
                 }
               )
        }
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createMeal();
        } else {
            this.updateMeal();
        }
    }

    private createMeal() {
        var params;
        params = this.form.value;
        params.ingredients = this.ingredientsOfMeal;
        this.mealService.update(0, params)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Meal added successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updateMeal() {
        var params;
        params = this.form.value;
        params.ingredients = this.ingredientsOfMeal;
        this.mealService.update(this.id, params)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['/meals'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    addIngredientToMeal(){
      var ingredientToAdd = null;
      var matchingIngredients;
      matchingIngredients = this.ingredients.filter(i => { return i.name == this.ingredientToAdd.value});

      //ingredient exists?
      if(matchingIngredients.length != 1){
        console.log("Invalid ingredient selected: " + matchingIngredients);
        return;
      }
      ingredientToAdd = Object.assign({}, matchingIngredients[0]);

      //ingredient already added?
      if(this.ingredientsOfMeal.find(i => { return i.id == ingredientToAdd.id }) != null){
        console.log("Ingredient already added : " + ingredientToAdd.name);
        return;
      }

      //amount within reason?
      if (ingredientToAdd.amount < 0 || ingredientToAdd.amount > 10000){
        console.log("Invalid amount selected: " + ingredientToAdd.amount);
        return;
      }
      ingredientToAdd.amount = +this.ingredientToAddAmount.value;

      //console.log(ingredientToAdd.name + " " + ingredientToAdd.amount+ " " + ingredientToAdd.unit);
      this.ingredientsOfMeal.push(ingredientToAdd);
    }

    removeIngredientFromMeal(ingredientID){
      var ingredient;
      ingredient = this.ingredientsOfMeal.find(i => { return i.id == ingredientID });
      var index = this.ingredientsOfMeal.indexOf(ingredient);
      if (~index) {
          this.ingredientsOfMeal.splice(index, 1);
      }
    }
}
