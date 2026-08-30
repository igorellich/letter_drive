import type { ISubject } from "../../../../interfaces";
import R1Text from "./r1_text";
import R2Word from "./r2_word";
import R3Sostav from "./r3_sostav";
import R4Pravopis from "./r4_pravopis";
import R5Sushestv from "./r5_sushestv";
import R6Prilag from "./r6_prilag";
import R7Glagol from "./r7_glagol";
import R8Mest from "./r8_mest";
import R9Povt from "./r9_povt";

export const threeRussian: ISubject = {
    title: "Русский язык",
    quarters: [
        {
            title: "1 четверть",
            tests: [R1Text, R2Word]
        },
        {
            title: "2 четверть",
            tests: [R3Sostav, R4Pravopis]
        },
        {
            title: "3 четверть",
            tests: [R5Sushestv, R6Prilag]
        },
        {
            title: "4 четверть",
            tests: [R7Glagol, R8Mest, R9Povt]
        }
    ]
}
