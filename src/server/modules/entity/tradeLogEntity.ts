import {Table, Column, Model, HasMany, AutoIncrement, DataType} from 'sequelize-typescript';
import Sequelize from 'sequelize';

@Table({ modelName: "pAFk3qiAgG1_trade_log" })
export class tradeLogEntity extends Model<tradeLogEntity> {
    @Column({ type: Sequelize.INTEGER({ length: 11 }), primaryKey: true, autoIncrement: true, allowNull: false })
    id: number;
    @Column({ type: Sequelize.INTEGER({ length: 11 }), allowNull: false, defaultValue: 0 })
    user_id: number;
    @Column({ type: Sequelize.STRING(256), allowNull: false, defaultValue: "" })
    action: string;
    @Column({ type: Sequelize.INTEGER({ length: 11 }), allowNull: false, defaultValue: 0 })
    price: number;
    @Column({ type: Sequelize.INTEGER({ length: 11 }), allowNull: false, defaultValue: 0 })
    coins_before: number;
    @Column({ type: Sequelize.INTEGER({ length: 11 }), allowNull: false, defaultValue: 0 })
    coins_after: number;
    @Column({ type: Sequelize.STRING(22), allowNull: false, defaultValue: "" })
    datetime: string;
    @Column({ type: Sequelize.INTEGER({ length: 11 }), allowNull: false, defaultValue: 0 })
    timestamp: number;
}