import {Table, Column, Model, HasMany, AutoIncrement, DataType} from 'sequelize-typescript';
import Sequelize from 'sequelize';


@Table({ modelName: "pAFk3qiAgG1_race_cfg" })
export class raceCfgEntity extends Model<raceCfgEntity> {
    @Column({ type: Sequelize.INTEGER({ length: 11 }), primaryKey: true, autoIncrement: true, allowNull: false })
    id: number;
    @Column({ type: Sequelize.INTEGER({ length: 11 }), allowNull: false, defaultValue: 0 })
    user: number;
    @Column({ type: Sequelize.INTEGER({ length: 1 }), allowNull: false, defaultValue: 0 })
    ready: number;
    @Column({ type: Sequelize.STRING(60), allowNull: false, defaultValue: "" })
    vehiclesSeries: string;
    @Column({ type: Sequelize.STRING(60), allowNull: false, defaultValue: "" })
    name: string;
    @Column({ type: Sequelize.STRING(10000), allowNull: true, defaultValue: null })
    checkpoints: string;
    @Column({ type: Sequelize.STRING(10000), allowNull: false, defaultValue: "" })
    spawns: string;
}