

import {Table, Column, Model} from 'sequelize-typescript';
@Table({ modelName: "pAFk3qiAgG1_ban_list"})
export class banListEntity extends Model<banListEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    /** Кто забанил */
    @Column({
      type: "VARCHAR(256)",
      allowNull: false
    })
    ban_from:string;
    /** Кого забанили */
    @Column({
      type: "VARCHAR(256)",
      allowNull: false
    })
    ban_to:string;
    /** Сколько месяцев или дней бана */
    @Column({
      type: "INT(11)",
      allowNull: false
    })
    count:number;
    /** TimeStamp когда был выдан бан */
    @Column({
      type: "INT(11)",
      allowNull: false
    })
    datetime:number;
    /** Бан на месяц, или день или ещё что */
    @Column({
      type: "VARCHAR(8)",
      allowNull: false
    })
    format:"d"|"m"|"y"|"h";
    /** Причина */
    @Column({
      type: "VARCHAR(256)",
      allowNull: false
    })
    reason:string;
    /** Причина */
    @Column({
      type: "VARCHAR(256)",
      allowNull: false
    })
    full_reason:string;
    /** IP */
    @Column({
      type: "VARCHAR(64)",
      allowNull: false
    })
    ip:string;
    
}

