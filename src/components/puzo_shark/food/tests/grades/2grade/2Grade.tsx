import type { IGrade } from "../../interfaces";
import { twoEnglish } from "./subjects/english";
import { twoMath } from "./subjects/math/index"
export const TwoGrade: IGrade = {
    title: "2 класс",
    subjects: [twoMath, twoEnglish]
}