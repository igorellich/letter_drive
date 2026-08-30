export interface IQuestion {

    question: string,
    variants: string[],
    answer: string[]
}
// «Тема» — банк вопросов (обычно 10–15+ вопросов), из которого раунд
// рандомно собирает тест из 10 вопросов.
export interface ITest {
    title: string,
    questions: IQuestion[]
}
export interface IQuarter {
    title: string,
    tests: ITest[]
}
export interface ISubject {
    title: string,
    quarters: IQuarter[]
}
export interface IGrade {
    title: string,
    subjects: ISubject[]
}

export interface IAppState{
    diversTimeLeftSec:number,
    diversEaten: number,
    coins: number,
    ownedSkins: string[]
}