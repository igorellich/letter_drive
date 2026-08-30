import type { ISubject } from "../../../../interfaces";
import E1School from "./e1_school";
import E2Intro from "./e2_intro";
import E3Family from "./e3_family";
import E4Food from "./e4_food";
import E5Toys from "./e5_toys";
import E6Animals from "./e6_animals";
import E7Home from "./e7_home";
import E8Routine from "./e8_routine";

export const threeEnglish: ISubject = {
    title: "Английский",
    quarters: [
        {
            title: "1 четверть",
            tests: [E1School, E2Intro]
        },
        {
            title: "2 четверть",
            tests: [E3Family, E4Food]
        },
        {
            title: "3 четверть",
            tests: [E5Toys, E6Animals]
        },
        {
            title: "4 четверть",
            tests: [E7Home, E8Routine]
        }
    ]
}
