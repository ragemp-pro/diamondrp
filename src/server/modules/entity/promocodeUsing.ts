

import { Table, Column, Model } from 'sequelize-typescript';
import Sequelize from 'sequelize'
@Table({ modelName: "pAFk3qiAgG1_promocode_using" })
export class promocodeUsingEntity extends Model<promocodeUsingEntity> {
    @Column({ primaryKey: true, autoIncrement: true })
    id: number;
    @Column({
        type: Sequelize.INTEGER({ length: 11}),
        allowNull: false
    })
    user_id: number;
    @Column({
        type: Sequelize.STRING(20),
        allowNull: false
    })
    promocode_name: string;
    @Column({
        type: "timestamp",
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
        allowNull: false
    })
    timestamp: string;
}




@Table({ modelName: "pAFk3qiAgG1_promocode_list" })
export class promocodeEntity extends Model<promocodeEntity> {
    @Column({ primaryKey: true, autoIncrement: true })
    id: number;
    @Column({
        type: Sequelize.INTEGER({ length: 11 }),
        allowNull: false
    })
    bonus: number;
    @Column({
        type: Sequelize.STRING(32),
        allowNull: false
    })
    code: string;
}
