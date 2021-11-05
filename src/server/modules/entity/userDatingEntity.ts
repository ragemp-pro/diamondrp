import { Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize } from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_user_dating" })
export class userDatingEntity extends Model<userDatingEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true })
    id: number;
    @Column({ type: Sequelize.STRING(64), allowNull: false })
    user_name: string;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false })
    user_owner: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false })
    user_id: number;
}

