import { Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize } from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_daynight" })
export class daynightEntity extends Model<daynightEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true, allowNull: false })
    id: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 2018 })
    year: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 1 })
    month: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 1 })
    day: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 12 })
    hour: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    minute: number;
}
