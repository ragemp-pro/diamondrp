export type helpType = "reportUser" |"reportUser2"

export const topicReasons: { value: helpType,label:string,admin?:boolean,helper?:boolean,isReport?:boolean,desc?:string}[] = [
    {value:"reportUser",label:"Жалоба на игрока",admin:true},
    {value:"reportUser2",label:"Жалоба на игрока 2",admin:true,isReport:true, desc:"Тут какое то описание типа"},
]
export const getReportLabel = (type: helpType) => {
    let q = topicReasons.find(item => item.value == type)
    if(q) return q.label
    return null;
}
export const getReportData = (type: helpType) => {
    let q = topicReasons.find(item => item.value == type)
    if(q) return q
    return null;
}

export interface QuestionPrewiew {
    id: number;
    my: boolean;
    author: string;
    authorid: number;
    category: helpType;
    is_report:number;
    text?: string;
    messagesCount: number;
    last_updated: number;
    closed:boolean;
}

export interface QuestionMessage {
    userid:number;
    username:string;
    when:number;
    message:string;
}

export interface ticketItem extends QuestionPrewiew {
    messages: QuestionMessage[]
}