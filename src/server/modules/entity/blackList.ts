

import {Table, Column, Model} from 'sequelize-typescript';
@Table({ modelName: "pAFk3qiAgG1_black_list"})
export class blackListEntity extends Model<blackListEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    /** Steam, на случай если заработает когда либо */
    @Column({
      type: "VARCHAR(128)",
      allowNull: false,
      defaultValue: ""
    })
    steam:string;
    /** Hash устройства */
    @Column({
      type: "VARCHAR(256)",
      allowNull: false,
    })
    lic:string;
    
    /** Имя учётной записи SocialClub */
    @Column({
      type: "VARCHAR(256)",
      allowNull: false,
    })
    guid:string;
    
    @Column({
      type: "BIGINT(20)",
      allowNull: false,
      defaultValue: 0
    })
    rgscId:bigint;
    /** Причина занесения в BlackList */
    @Column({
      type: "TEXT",
      allowNull: false,
    })
    reason:string;
}

