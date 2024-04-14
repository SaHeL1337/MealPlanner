import { Unit } from './unit';

export class Ingredient {
    id: string;
    name: string;
    createdAt: string;
    isDeletable: boolean;
    unit: Unit;
    price: string;
}
