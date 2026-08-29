import type { IGrade } from "../../interfaces";
import { threeEnglish } from "./subjects/english";
import { threeMath } from "./subjects/math";
import { threeReading } from "./subjects/reading";
import { threeRussian } from "./subjects/russian";
import { threeWorld } from "./subjects/world";

export const ThreeGrade: IGrade = {
    title: "3 класс",
    subjects: [threeMath, threeRussian, threeReading, threeWorld, threeEnglish]
}