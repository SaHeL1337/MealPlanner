import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MealsRoutingModule } from './meals-routing.module';
import { LayoutComponent } from './layout.component';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';
import { AddEditIngredientsComponent } from './add-edit-ingredients.component';

import {MaterialModule} from '../_components/material-module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MealsRoutingModule,
        MaterialModule
    ],
    declarations: [
        LayoutComponent,
        ListComponent,
        AddEditComponent,
        AddEditIngredientsComponent
    ]
})
export class MealsModule { }
