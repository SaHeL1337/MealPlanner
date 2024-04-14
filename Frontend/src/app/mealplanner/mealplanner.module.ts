import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MealPlannerRoutingModule } from './mealplanner-routing.module';
import { LayoutComponent } from './layout.component';
import { AddEditComponent } from './add-edit.component';

import {MaterialModule} from '../_components/material-module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MealPlannerRoutingModule,
        MaterialModule
    ],
    declarations: [
        LayoutComponent,
        AddEditComponent
    ]
})
export class MealPlannerModule { }
