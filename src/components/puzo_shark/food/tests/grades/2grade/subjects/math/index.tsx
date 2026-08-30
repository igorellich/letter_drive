import type { ISubject } from "../../../../interfaces";
import Sravnenie30 from "./30ex";
import Module3 from './3';
import Module4 from './4';
import Module5 from './5';
import Module6 from './6';
import Module7 from './7';
import Module8 from './8';
import Module9 from './9';
import Module10 from './10';
import Module11 from './11';
import Module12 from './12';
import Module13 from './13';
import Simple from './simple';

export const twoMath: ISubject = {
    title: "Математика",
    quarters: [
        {
            title: "1 четверть · Числа до 100, сложение и вычитание без перехода",
            tests: [Sravnenie30, Module3, Module4]
        },
        {
            title: "2 четверть · Сложение и вычитание с переходом через разряд",
            tests: [Module5, Module6, Module7, Module8]
        },
        {
            title: "3 четверть · Сравнение и поверка вычислений",
            tests: [Module9, Simple, Module10, Module11, Module12]
        },
        {
            title: "4 четверть · Повторение и итоговые примеры",
            tests: [Module13]
        }
    ]
}