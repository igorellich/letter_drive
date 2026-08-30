import type { ISubject } from "../../../../interfaces";
import P1Ustnoe from "./p1_ustnoe";
import P2Poety from "./p2_poety";
import P3Pisateli from "./p3_pisateli";
import P4Skazki from "./p4_skazki";
import P5Bylin from "./p5_bylin";
import P6Zhivoe from "./p6_zhivoe";
import P7Zarubezh from "./p7_zarubezh";

export const threeReading: ISubject = {
    title: "Литературное чтение",
    quarters: [
        {
            title: "1 четверть",
            tests: [P1Ustnoe, P2Poety]
        },
        {
            title: "2 четверть",
            tests: [P3Pisateli]
        },
        {
            title: "3 четверть",
            tests: [P4Skazki, P5Bylin]
        },
        {
            title: "4 четверть",
            tests: [P6Zhivoe, P7Zarubezh]
        }
    ]
}
