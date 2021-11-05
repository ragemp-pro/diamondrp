interface GangTer {
    // name: string;
    /** Позиция територии */
    pos: {
        /** Координата X */
        x:number;
        /** Координата Y */
        y:number;
        /** Координата Z */
        z:number;
        /** Ширина квадрата */
        d:number;
    }
    /** Это спавн? Значит захвату не подлежит */
    spawn?:boolean;
    /** ID фракции, которая владеет теорой */
    owner:number;
}

let gangTers:GangTer[] = [
    {pos:{x:0,y:0,z:0,d:0},spawn:true,owner:0},
]
