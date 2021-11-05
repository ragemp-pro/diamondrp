import {Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize} from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_mafia_war" })
export class mafiaWarEntity extends Model<mafiaWarEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true, allowNull: false })
    id: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    owner_id: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    money: number;
}
