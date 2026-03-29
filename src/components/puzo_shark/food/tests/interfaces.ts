export interface ITest {
    title: string,
    questions: IQuestion[]
}
export interface IQuestion {

    question: string,
    variants: string[],
    answer: string[]
}
export interface ISubject {
    title: string,
    tests: ITest[]
}
export interface IGrade {
    title: string,
    subjects: ISubject[]
}