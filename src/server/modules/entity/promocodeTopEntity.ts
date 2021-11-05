import { Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize } from 'sequelize-typescript';

@Table({ modelName: "pAFk3qiAgG1_promocode_top_list" })
export class promocodeTopListEntity extends Model<promocodeTopListEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true, allowNull: false })
    id: number;
    @Column({ type: Sequelize.STRING(64), allowNull: false, defaultValue: "" })
    promocode: string;
}