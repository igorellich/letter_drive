import type { ISubject } from "../../../../interfaces";
import W1Mir from "./w1_mir";
import W2Veschestva from "./w2_veschestva";
import W3Rasteniya from "./w3_rasteniya";
import W4Zhivotnie from "./w4_zhivotnie";
import W5Zdorovie from "./w5_zdorovie";
import W6Bezopasnost from "./w6_bezopasnost";
import W7Ekonomika from "./w7_ekonomika";
import W8Puteshestviya from "./w8_puteshestviya";

export const threeWorld: ISubject = {
    title: "Окружающий мир",
    quarters: [
        {
            title: "1 четверть",
            tests: [W1Mir]
        },
        {
            title: "2 четверть",
            tests: [W2Veschestva, W3Rasteniya, W4Zhivotnie]
        },
        {
            title: "3 четверть",
            tests: [W5Zdorovie, W6Bezopasnost]
        },
        {
            title: "4 четверть",
            tests: [W7Ekonomika, W8Puteshestviya]
        }
    ]
}
