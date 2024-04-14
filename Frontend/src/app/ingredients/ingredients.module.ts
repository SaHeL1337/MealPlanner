import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { IngredientsRoutingModule } from './ingredients-routing.module';
import { LayoutComponent } from './layout.component';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';

import {MaterialModule} from '../_components/material-module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        IngredientsRoutingModule,
        MaterialModule
    ],
    declarations: [
        LayoutComponent,
        ListComponent,
        AddEditComponent
    ]
})
export class IngredientsModule { }
