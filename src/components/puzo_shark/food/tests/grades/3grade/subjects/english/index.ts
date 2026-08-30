import type { ISubject } from "../../../../interfaces";
import E1School from "./e1_school";
import E2Intro from "./e2_intro";
import E3Family from "./e3_family";
import E4Food from "./e4_food";
import E5Toys from "./e5_toys";
import E6Animals from "./e6_animals";
import E7Home from "./e7_home";
import E8Routine from "./e8_routine";
import E9ToBe from "./e9_grammar_tobe";
import E10PresentSimple from "./e10_grammar_presentsimple";
import E11Articles from "./e11_grammar_articles";
import E12Plurals from "./e12_grammar_plurals";
import E13Possessives from "./e13_grammar_possessives";
import E14Demonstratives from "./e14_grammar_demonstratives";
import E15Questions from "./e15_grammar_questions";
import E16HasGot from "./e16_grammar_hasgot";
import E17Pronouns from "./e17_grammar_pronouns";

export const threeEnglish: ISubject = {
    title: "Английский",
    quarters: [
        {
            title: "1 четверть",
            tests: [E1School, E2Intro, E9ToBe, E11Articles]
        },
        {
            title: "2 четверть",
            tests: [E3Family, E4Food, E17Pronouns, E13Possessives]
        },
        {
            title: "3 четверть",
            tests: [E5Toys, E6Animals, E12Plurals, E14Demonstratives]
        },
        {
            title: "4 четверть",
            tests: [E7Home, E8Routine, E10PresentSimple, E16HasGot, E15Questions]
        }
    ]
}
