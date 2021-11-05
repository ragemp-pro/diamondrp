import { Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize } from 'sequelize-typescript';

@Table({ modelName: "pAFk3qiAgG1_auction_settings" })
export class auctionSettingsEntity extends Model<auctionSettingsEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true, allowNull: false })
    id: number;
    @Column({ type: Sequelize.STRING(500), allowNull: false, defaultValue: "" })
    data: string;
}