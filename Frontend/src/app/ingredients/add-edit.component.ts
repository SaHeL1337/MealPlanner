import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { first } from 'rxjs/operators';

import { IngredientService, AlertService } from '@app/_services';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    isAddMode: boolean;
    loading = false;
    submitted = false;
    ingredientToAddUnit = new FormControl();
    units = [];
    unitsLoaded = false;
    selectedUnitValue = "";
    selectedPrice = "";

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private ingredientService: IngredientService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            price: ['', Validators.required],
        });

        this.ingredientService.getAllUnits()
            .pipe(first())
            .subscribe(units => {
              this.units = units;
              this.unitsLoaded = true;
            });

        if (!this.isAddMode) {
            this.ingredientService.getById(this.id)
                .pipe(first())
                .subscribe(ingredient =>{
                    this.form.patchValue(ingredient);
                    this.selectedUnitValue = ingredient.unit.name;
                    this.selectedPrice = ingredient.price;
                });
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
            this.createIngredient();
        } else {
            this.updateIngredient();
        }
    }

    private createIngredient() {
        var unit = this.units.find(u => { return u.name == this.ingredientToAddUnit.value });
        var params = this.form.value;
        params.unit = unit;

        this.ingredientService.update(0, params)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Ingredient added successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updateIngredient() {
        var unit = this.units.find(u => { return u.name == this.ingredientToAddUnit.value });
        var params = this.form.value;
        params.unit = unit;

        this.ingredientService.update(this.id, params)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}
