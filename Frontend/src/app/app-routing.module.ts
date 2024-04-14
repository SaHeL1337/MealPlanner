import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { AuthGuard } from './_helpers';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const usersModule = () => import('./users/users.module').then(x => x.UsersModule);
const rolesModule = () => import('./roles/roles.module').then(x => x.RolesModule);
const ingredientsModule = () => import('./ingredients/ingredients.module').then(x => x.IngredientsModule);
const mealsModule = () => import('./meals/meals.module').then(x => x.MealsModule);
const mealPlannerModule = () => import('./mealplanner/mealplanner.module').then(x => x.MealPlannerModule);

const routes: Routes = [
    //{ path: '', component: HomeComponent, canActivate: [AuthGuard], data: { requiredRole: 2 }  },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard], data: { requiredRole: 2 }  },
    { path: 'users', loadChildren: usersModule, canActivate: [AuthGuard], data: { requiredRole: 1 } },
    { path: 'roles', loadChildren: rolesModule, canActivate: [AuthGuard], data: { requiredRole: 1 } },
    { path: 'ingredients', loadChildren: ingredientsModule, canActivate: [AuthGuard], data: { requiredRole: 1 } },
    { path: 'meals', loadChildren: mealsModule, canActivate: [AuthGuard], data: { requiredRole: 1 } },
    { path: 'mealplanner', loadChildren: mealPlannerModule, canActivate: [AuthGuard], data: { requiredRole: 1 } },
    { path: 'account', loadChildren: accountModule },

    // otherwise redirect to home
    { path: '**', redirectTo: '/account/login' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
