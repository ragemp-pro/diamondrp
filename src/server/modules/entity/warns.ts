

import {Table, Column, Model, Sequelize} from 'sequelize-typescript';
@Table({ modelName: "pAFk3qiAgG1_users_warns"})
export class userWarnEntity extends Model<userWarnEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    @Column({
      type: Sequelize.INTEGER(11),
      allowNull: false
    })
    timestamp:number;
    @Column({
      type: Sequelize.INTEGER(5),
      allowNull: false
    })
    user:number;
    /** Причина варна */
    @Column({
      type: Sequelize.STRING(240),
      allowNull: false,
    })
    reason:string;
    /** Администратор */
    @Column({
      type: Sequelize.STRING(240),
      allowNull: false,
    })
    admin:string;
    /** Статус оплаты варна через донат */
    @Column({
      type: Sequelize.INTEGER(1),
      defaultValue: '0',
      get(this:userWarnEntity):boolean {
        return this.getDataValue('payed') == 1
      },
      set(this:userWarnEntity, value:boolean) {
        this.setDataValue('payed', value ? 1 : 0);
      }
    })
    payed:boolean;
    /** Статус просмотра игроком данного варна */
    @Column({
      type: Sequelize.INTEGER(1),
      defaultValue: '0',
      get(this:userWarnEntity):boolean {
        return this.getDataValue('notified') == 1
      },
      set(this:userWarnEntity, value:boolean) {
        this.setDataValue('notified', value ? 1 : 0);
      }
    })
    notified:boolean;
}

