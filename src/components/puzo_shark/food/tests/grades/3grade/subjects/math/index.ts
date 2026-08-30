import type { ISubject } from "../../../../interfaces";
import T1Tab234 from "./t1_tab_2_3_4";
import T2Tab567 from "./t2_tab_5_6_7";
import T3Tab89 from "./t3_tab_8_9";
import T4OneZero from "./t4_one_zero";
import T5Order from "./t5_order";
import T6Equations from "./t6_equations";
import T7Area from "./t7_area";
import T8Perim from "./t8_perimeter";
import T9Untab from "./t9_untab";
import T10DivRest from "./t10_div_rest";
import T11Doli from "./t11_doli";
import T12Num1000 from "./t12_num1000";
import T13AddSub from "./t13_addsub";
import T14MulDiv1000 from "./t14_muldiv1000";
import T15Zadachi from "./t15_zadachi";
import T16Povt from "./t16_povt";

export const threeMath: ISubject = {
    title: "Математика",
    quarters: [
        {
            title: "1 четверть",
            tests: [T1Tab234, T2Tab567, T3Tab89, T4OneZero, T5Order, T6Equations]
        },
        {
            title: "2 четверть",
            tests: [T9Untab, T10DivRest, T7Area, T8Perim, T11Doli]
        },
        {
            title: "3 четверть",
            tests: [T12Num1000, T13AddSub, T14MulDiv1000]
        },
        {
            title: "4 четверть",
            tests: [T15Zadachi, T16Povt]
        }
    ]
}
