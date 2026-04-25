export default {
    title: '2. Сравнения в пределах 30',
    questions: [
        // Блок 1: Знаки (<, >, =)
        {"question": "7 + 3 ? 9 + 5", "variants": ["<", ">", "="], "answer": ["<"]},
        {"question": "15 + 5 ? 24 - 4", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "25 - 10 ? 18 - 4", "variants": ["<", ">", "="], "answer": [">"]},
        {"question": "12 + 8 ? 15 + 5", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "20 - 11 ? 5 + 4", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "17 - 8 ? 3 + 5", "variants": ["<", ">", "="], "answer": [">"]},
        {"question": "10 + 10 ? 25 - 5", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "14 - 7 ? 12 - 6", "variants": ["<", ">", "="], "answer": [">"]},
        {"question": "9 + 6 ? 20 - 5", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "30 - 15 ? 8 + 8", "variants": ["<", ">", "="], "answer": ["<"]},

        // Блок 2: Поиск числа
        {"question": "7 + 3 < ? + 5", "variants": ["6", "5", "4"], "answer": ["6"]},
        {"question": "? - 5 > 10 + 2", "variants": ["18", "17", "16"], "answer": ["18"]},
        {"question": "20 - ? < 15 - 5", "variants": ["11", "10", "9"], "answer": ["11"]},
        {"question": "9 + 6 > ? + 8", "variants": ["6", "7", "8"], "answer": ["6"]},
        {"question": "? + 4 = 25 - 10", "variants": ["11", "10", "12"], "answer": ["11"]},
        {"question": "14 + ? < 10 + 10", "variants": ["5", "6", "7"], "answer": ["5"]},
        {"question": "8 + 8 > 20 - ?", "variants": ["5", "4", "3"], "answer": ["5"]},
        {"question": "15 + 5 = ? - 4", "variants": ["24", "23", "22"], "answer": ["24"]},
        {"question": "? + 12 < 30 - 10", "variants": ["7", "8", "9"], "answer": ["7"]},
        {"question": "18 - ? = 6 + 6", "variants": ["6", "5", "7"], "answer": ["6"]},

        // Блок 3: Знаки
        {"question": "22 + 3 ? 15 + 11", "variants": ["<", ">", "="], "answer": ["<"]},
        {"question": "13 + 7 ? 30 - 10", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "28 - 9 ? 10 + 8", "variants": ["<", ">", "="], "answer": [">"]},
        {"question": "19 + 4 ? 25 - 2", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "11 - 5 ? 14 - 8", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "16 + 6 ? 30 - 7", "variants": ["<", ">", "="], "answer": ["<"]},
        {"question": "24 - 12 ? 6 + 6", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "5 + 18 ? 10 + 13", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "27 - 10 ? 9 + 9", "variants": ["<", ">", "="], "answer": ["<"]},
        {"question": "12 + 12 ? 30 - 6", "variants": ["<", ">", "="], "answer": ["="]},

        // Блок 4: Поиск числа
        {"question": "13 - 6 > 12 - ?", "variants": ["6", "5", "4"], "answer": ["6"]},
        {"question": "26 - ? = 10 + 10", "variants": ["6", "5", "7"], "answer": ["6"]},
        {"question": "? + 3 > 25 - 5", "variants": ["18", "17", "16"], "answer": ["18"]},
        {"question": "11 + 11 = 30 - ?", "variants": ["8", "7", "9"], "answer": ["8"]},
        {"question": "? - 8 > 5 + 5", "variants": ["19", "18", "17"], "answer": ["19"]},
        {"question": "12 + 4 = 20 - ?", "variants": ["4", "5", "3"], "answer": ["4"]},
        {"question": "30 - ? < 10 + 5", "variants": ["16", "15", "14"], "answer": ["16"]},
        {"question": "6 + 6 > ? - 10", "variants": ["21", "22", "23"], "answer": ["21"]},
        {"question": "15 + ? = 12 + 12", "variants": ["9", "8", "10"], "answer": ["9"]},
        {"question": "? - 4 < 18 - 8", "variants": ["13", "14", "15"], "answer": ["13"]},

        // Блок 5: Знаки
        {"question": "14 + 14 ? 30 - 2", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "21 - 10 ? 6 + 6", "variants": ["<", ">", "="], "answer": ["<"]},
        {"question": "9 + 9 ? 25 - 7", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "18 - 9 ? 4 + 4", "variants": ["<", ">", "="], "answer": [">"]},
        {"question": "20 - 5 ? 10 + 5", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "12 + 13 ? 30 - 5", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "20 - 15 ? 1 + 4", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "15 + 14 ? 30 - 1", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "26 - 6 ? 12 + 8", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "7 + 8 ? 20 - 6", "variants": ["<", ">", "="], "answer": [">"]},

        // Блок 6: Поиск числа
        {"question": "20 + 5 > 30 - ?", "variants": ["6", "5", "4"], "answer": ["6"]},
        {"question": "17 - 7 = ? + 3", "variants": ["7", "6", "8"], "answer": ["7"]},
        {"question": "? + 9 < 15 + 5", "variants": ["10", "11", "12"], "answer": ["10"]},
        {"question": "24 - 10 > 7 + ?", "variants": ["6", "7", "8"], "answer": ["6"]},
        {"question": "11 + ? = 25 - 10", "variants": ["4", "3", "5"], "answer": ["4"]},
        {"question": "30 - 15 < ? - 5", "variants": ["21", "20", "19"], "answer": ["21"]},
        {"question": "? + 6 > 14 + 10", "variants": ["19", "18", "17"], "answer": ["19"]},
        {"question": "18 - 9 = 20 - ?", "variants": ["11", "10", "12"], "answer": ["11"]},
        {"question": "5 + 5 < ? - 10", "variants": ["21", "20", "19"], "answer": ["21"]},
        {"question": "28 - ? > 10 + 10", "variants": ["7", "8", "9"], "answer": ["7"]},

        // Блок 7: Знаки
        {"question": "10 + 15 ? 30 - 5", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "14 + 6 ? 25 - 4", "variants": ["<", ">", "="], "answer": ["<"]},
        {"question": "22 - 11 ? 5 + 6", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "30 - 12 ? 9 + 9", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "18 + 4 ? 12 + 10", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "15 - 8 ? 20 - 13", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "9 + 13 ? 30 - 8", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "24 - 12 ? 6 + 7", "variants": ["<", ">", "="], "answer": ["<"]},
        {"question": "11 + 12 ? 25 - 2", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "30 - 15 ? 10 + 5", "variants": ["<", ">", "="], "answer": ["="]},

        // Блок 8: Поиск числа
        {"question": "? + 13 = 15 + 14", "variants": ["16", "15", "17"], "answer": ["16"]},
        {"question": "16 - 8 < 5 + ?", "variants": ["4", "3", "2"], "answer": ["4"]},
        {"question": "10 + ? > 25 - 10", "variants": ["6", "5", "4"], "answer": ["6"]},
        {"question": "22 - 11 = ? + 5", "variants": ["6", "5", "7"], "answer": ["6"]},
        {"question": "? - 6 < 20 - 10", "variants": ["15", "16", "17"], "answer": ["15"]},
        {"question": "14 + 6 > 30 - ?", "variants": ["11", "10", "9"], "answer": ["11"]},
        {"question": "19 - 9 = ? - 10", "variants": ["20", "19", "21"], "answer": ["20"]},
        {"question": "? + 7 < 12 + 12", "variants": ["16", "17", "18"], "answer": ["16"]},
        {"question": "25 - 10 > ? + 6", "variants": ["8", "9", "10"], "answer": ["8"]},
        {"question": "8 + ? = 30 - 10", "variants": ["12", "11", "13"], "answer": ["12"]},

        // Блок 9: Знаки
        {"question": "26 - 6 ? 10 + 10", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "12 + 13 ? 30 - 4", "variants": ["<", ">", "="], "answer": ["<"]},
        {"question": "5 + 5 ? 20 / 2", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "18 + 12 ? 30 - 0", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "29 - 14 ? 7 + 8", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "11 + 19 ? 30 - 0", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "22 + 7 ? 15 + 14", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "25 - 5 ? 10 + 11", "variants": ["<", ">", "="], "answer": ["<"]},
        {"question": "14 + 14 ? 20 + 8", "variants": ["<", ">", "="], "answer": ["="]},
        {"question": "30 - 1 ? 15 + 14", "variants": ["<", ">", "="], "answer": ["="]},

        // Блок 10: Поиск числа
        {"question": "? - 10 > 25 - 15", "variants": ["21", "20", "19"], "answer": ["21"]},
        {"question": "12 + 12 = ? + 14", "variants": ["10", "9", "11"], "answer": ["10"]},
        {"question": "30 - ? < 10 + 10", "variants": ["11", "10", "9"], "answer": ["11"]},
        {"question": "15 + 5 > ? + 10", "variants": ["9", "10", "11"], "answer": ["9"]},
        {"question": "22 - 2 = ? + 10", "variants": ["10", "9", "11"], "answer": ["10"]},
        {"question": "? + 5 < 30 - 15", "variants": ["9", "10", "11"], "answer": ["9"]},
        {"question": "18 - 8 > 15 - ?", "variants": ["6", "5", "4"], "answer": ["6"]},
        {"question": "20 + ? = 30 - 5", "variants": ["5", "4", "6"], "answer": ["5"]},
        {"question": "? - 5 < 20 + 5", "variants": ["29", "30", "31"], "answer": ["29"]},
        {"question": "30 - 10 ? 10 + 10", "variants": ["<", ">", "="], "answer": ["="]}
    ]
}
