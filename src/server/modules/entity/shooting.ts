

import { Table, Column, Model, Sequelize } from 'sequelize-typescript';
@Table({ modelName: "pAFk3qiAgG1_shooting_records" })
export class shootingRecordsEntity extends Model<shootingRecordsEntity> {
    @Column({ primaryKey: true, autoIncrement: true })
    id: number;
    @Column({
        type: Sequelize.INTEGER(11),
        allowNull: false
    })
    count: number;
    @Column({
        type: Sequelize.INTEGER(11),
        allowNull: false
    })
    user: number;
    @Column({
        type: Sequelize.STRING(50),
        allowNull: false
    })
    username: string;
}

