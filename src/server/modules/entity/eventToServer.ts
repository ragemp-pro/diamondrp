import { Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize } from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_event_to_server" })
export class eventToServerEntity extends Model<eventToServerEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true })
    id: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false })
    type: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false })
    item_id: number;
    @Column({ type: Sequelize.STRING(128), allowNull: false })
    action: string;
    @Column({type: Sequelize.STRING(128),allowNull: false})
    params: string;
}

