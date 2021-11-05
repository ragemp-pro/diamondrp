

import {Table, Column, Model} from 'sequelize-typescript';
import { user } from '../../user';
import { methods } from '../methods';
import { LogType } from '../../log';




@Table({ modelName: "pAFk3qiAgG1_log_data"})
export class logEntity extends Model<logEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    /** Тип лога */
    @Column({
      type: "VARCHAR(60)",
      allowNull: false,
    })
    type:LogType;
    /** Тип лога */
    @Column({
      type: "INT(11)",
      allowNull: false,
    })
    timestamp:number;
    /** Массив ID игроков, которые имеют отношение к данному логу */
    @Column({
      type: "VARCHAR(60)",
      allowNull: false,
      get():number[] {
        return JSON.parse(this.getDataValue("interractions"))
      },
      set(value:number[]) {
        this.setDataValue("interractions", JSON.stringify(value))
      }
    })
    interractions:number[];
    /** Тип лога */
    @Column({
      type: "TEXT",
      allowNull: false,
    })
    reason:string;
    // /** Тип лога */
    // @Column({
    //   type: "LONGTEXT",
    //   allowNull: false,
    // })
    // interractionsdata:string;
}



