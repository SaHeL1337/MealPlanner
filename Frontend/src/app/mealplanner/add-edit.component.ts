import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService, MealService} from '@app/_services';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    isAddMode: boolean;
    loading = false;
    submitted = false;
    isLinear = false;
    mealPreferencesGroup: FormGroup;
    generalSettingsGroup: FormGroup;
    mealPlanGroup: FormGroup;
    shoppingListGroup: FormGroup;
    mealToAdd = new FormControl();
    meals = [];
    filteredMeals = [];
    mealsLoaded = false;
    mealPreferences = [];
    mealPlan = [];
    mealPlanGenerated = false;
    shoppingList = [];
    shoppingListTotalPrice = 0;

    constructor(
        private _formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private mealService: MealService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        this.mealService.getAll()
            .pipe(first())
            .subscribe(meals => {
              this.meals = meals;
              this.mealsLoaded = true;
            });

      this.mealService.getAllUserMealPreferences()
          .pipe(first())
          .subscribe(mealPreferences => {
            this.mealPreferences = mealPreferences;
          });

      this.mealToAdd.valueChanges
        .subscribe(input => {
           this.filteredMeals = this.meals
           .filter(m => m.name.toLowerCase().indexOf(input.toLowerCase()) != -1).slice(0,5);
         });

        this.mealPreferencesGroup = this._formBuilder.group({

        });
        this.generalSettingsGroup = this._formBuilder.group({
          numberofDays: ['7', Validators.required],
          numberOfServings: ['2', Validators.required]
        });
        this.mealPlanGroup = this._formBuilder.group({
          secondCtrl: ['', Validators.required]
        });
        this.shoppingListGroup = this._formBuilder.group({
          secondCtrl: ['', Validators.required]
        });

        this.form = this._formBuilder.group({
            name: ['', Validators.required],
        });

        if (!this.isAddMode) {

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

        } else {

        }
    }

    addMealToPreferences (){
      var matchingMeals;
      var mealToAdd;
      var mealPreferenceToAdd;
      var params = {};

      matchingMeals = this.meals.filter(m => { return m.name == this.mealToAdd.value});
      //meal exists?
      if(matchingMeals.length != 1){
        console.log("Invalid meal selected: " + matchingMeals);
        return;
      }
      mealToAdd = Object.assign({}, matchingMeals[0]);

      //meal already added?
      if(this.mealPreferences.find(m => { return m.meal.id == mealToAdd.id }) != null){
        console.log("Meal already added : " + mealToAdd.name);
        return;
      }

      params = {
        mealID : mealToAdd.id,
        breakfast : false,
        lunch: false,
        dinner: false
      }

      this.mealService.updateMealPreference(0, params)
          .pipe(first())
          .subscribe({
              next: mealPreference => {
                  this.mealPreferences.unshift(mealPreference);
              },
              error: error => {
                  this.alertService.error(error);
                  this.loading = false;
              }
          });


    }

    removeMealFromPreferences(mealPreferenceID){
      var mealPreference = this.mealPreferences.find(p => { return p.id == mealPreferenceID });
      var index = this.mealPreferences.indexOf(mealPreference);
      if (~index) {
          this.mealService.removeMealFromPreferences(mealPreferenceID)
              .pipe(first())
              .subscribe(mealPreferences => {
                  this.mealPreferences.splice(index, 1);
          });
      }
    }

    toggleBreakfast(event: Event, mealPreferenceID : number){
        var mealPreference = this.mealPreferences.find(p => { return p.id == mealPreferenceID });
        mealPreference.breakfast = !mealPreference.breakfast;
        this.sendUpdatedMealPreference(mealPreference);
    }

    toggleLunch(event: Event, mealPreferenceID){
        var mealPreference = this.mealPreferences.find(p => { return p.id == mealPreferenceID });
        mealPreference.lunch = !mealPreference.lunch;
        this.sendUpdatedMealPreference(mealPreference);
    }

    toggleDinner(event: Event, mealPreferenceID){
        var mealPreference = this.mealPreferences.find(p => { return p.id == mealPreferenceID });
        mealPreference.dinner = !mealPreference.dinner;
        this.sendUpdatedMealPreference(mealPreference);
    }

    private sendUpdatedMealPreference(mealPreference){
      var params;

      params = {
        mealID : mealPreference.meal.id,
        breakfast : mealPreference.breakfast,
        lunch: mealPreference.lunch,
        dinner: mealPreference.dinner
      }

      this.mealService.updateMealPreference(mealPreference.id, params)
          .pipe(first())
          .subscribe({
              next: result => {
                  return result;
              },
              error: error => {
                  this.alertService.error(error);
                  return error;
              }
      });
    }

    generateNewMealPlan(){
        this.mealPlan = [];
        var day;
        var numberOfDaysToGenerate = this.generalSettingsGroup.value.numberofDays;

        for(var dayNumber = 1; dayNumber <= numberOfDaysToGenerate; dayNumber++){
          day = {
              number: dayNumber,
              breakfast: this.generateMealForTime(this.mealPreferences, "breakfast"),
              lunch: this.generateMealForTime(this.mealPreferences, "lunch"),
              dinner: this.generateMealForTime(this.mealPreferences, "dinner")
          };
          this.mealPlan.push(day);
        }
        this.mealPlanGenerated = true;

        this.generateShoppingList();
    }

    private generateMealForTime(mealPreferences, daytime){
        var mealPreferencesForTime = this.mealPreferences.filter(
          p => {
              switch(daytime){
                case "breakfast":
                  return p.breakfast == true;
                  break;
                case "lunch":
                  return p.lunch == true;
                  break;
                case "dinner":
                  return p.dinner == true;
                  break;
              }
           }
        );
        var selectedMealPreference = mealPreferencesForTime[Math.floor(Math.random() * mealPreferencesForTime.length)];
        return selectedMealPreference.meal;
    }

    private generateShoppingList(){
      var ingredientList = [];
      var numberOfServings = this.generalSettingsGroup.value.numberOfServings;

        this.mealPlan.forEach( function(day){
            var dayMealList = [];
            dayMealList.push(day["breakfast"]);
            dayMealList.push(day["lunch"]);
            dayMealList.push(day["dinner"]);

            dayMealList.forEach( function(meal){
                var servingCoefficient = numberOfServings / meal.servings;
                meal["ingredients"].forEach( function(ingredient){

                    var existingIngredient = ingredientList.find(i => {
                      return i.id == ingredient.id && i.unit.id == ingredient.unit.id
                    });

                    if(existingIngredient != undefined){
                        existingIngredient.amount = (Number(existingIngredient.amount) + Number(ingredient.amount));
                    }else{
                        var newIngredient = Object.assign({}, ingredient);
                        newIngredient.amount = Math.floor(newIngredient.amount * servingCoefficient);
                        ingredientList.push(newIngredient);
                    }

                });
            });
        });

        //add slider maximum values
        ingredientList.forEach( function(ingredient){
            ingredient.sliderMaxValue = ingredient.amount * 2;
            ingredient.totalPrice = Number(ingredient.price) * Number(ingredient.amount);
        });


        this.shoppingList = ingredientList;
        this.calculateTotalShoppingListPrice();
    }

    refreshMealForDayTime(day, dayTime){
        day[dayTime] = this.generateMealForTime(this.mealPreferences, dayTime);
        this.generateShoppingList();
    }

    changeShoppingListIngredientAmount(ingredient,newValue){
        ingredient.amount = newValue;
        var newTotalPrice = Number(ingredient.price) * Number(newValue);
        var difference = ingredient.totalPrice - newTotalPrice;
        ingredient.totalPrice -= difference;
        this.shoppingListTotalPrice -= difference;
    }

    private calculateTotalShoppingListPrice(){
        this.shoppingListTotalPrice = 0;
        for(let ingredient of this.shoppingList){
            this.shoppingListTotalPrice += ingredient.totalPrice;
        }
    }


}
