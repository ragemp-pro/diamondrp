import { Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize } from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_monitoring" })
export class monitoringEntity extends Model<monitoringEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true })
    id: number;
    @Column({ type: Sequelize.STRING(512), allowNull: false })
    name: string;
    @Column({ type: Sequelize.STRING(32), allowNull: false })
    ip: string;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false })
    online: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false })
    max_online: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false })
    last_update: number;
}

