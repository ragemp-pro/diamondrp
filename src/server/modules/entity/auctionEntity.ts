import { Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize } from 'sequelize-typescript';

@Table({ modelName: "pAFk3qiAgG1_auction" })
export class auctionEntity extends Model<auctionEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true, allowNull: false })
    id: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    user: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    sum: number;
}