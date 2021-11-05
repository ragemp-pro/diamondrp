import { Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize } from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_log_player" })
export class logPlayerEntity extends Model<logPlayerEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true })
    id: number;
    @Column({ type: Sequelize.STRING(100), allowNull: false })
    datetime: string;
    @Column({ type: Sequelize.STRING(512), allowNull: false })
    do: string;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false })
    type: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false })
    user_id: number;
}

