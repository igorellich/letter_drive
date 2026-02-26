export interface ITest{
title:string,
    questions:IQuestion[]
}
export interface IQuestion{
    
            question:string,
            variants:string[],
            answer:string[]
}