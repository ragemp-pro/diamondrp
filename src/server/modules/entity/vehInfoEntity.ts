import {Table, Column, Model, HasMany, AutoIncrement, DataType} from 'sequelize-typescript';
import Sequelize from 'sequelize';
import { vehClassName } from '../vehicleInfo';


@Table({ modelName: "pAFk3qiAgG1_veh_info" })
export class vehInfoEntity extends Model<vehInfoEntity> {
    @Column({ type: Sequelize.INTEGER({ length:11}), primaryKey: true, autoIncrement: true, allowNull: false })
    id: number;
    @Column({ type: Sequelize.STRING(64), allowNull: false, defaultValue: "" })
    display_name: string;
    @Column({ type: Sequelize.STRING(64), allowNull: false, defaultValue: "" })
    class_name: vehClassName;
    @Column({ type: Sequelize.INTEGER({ length: 120 }), allowNull: false })
    hash: number;
    @Column({ type: Sequelize.INTEGER({ length: 11 }), allowNull: false, defaultValue: 0 })
    stock: number;
    // @Column({ type: Sequelize.INTEGER({ length: 11 }), allowNull: false, defaultValue: 0 })
    // stock_full: number;
    @Column({ type: Sequelize.INTEGER({ length: 11 }), allowNull: false, defaultValue: 0 })
    fuel_full: number;
    @Column({ type: Sequelize.INTEGER({ length: 11 }), allowNull: false, defaultValue: 0 })
    fuel_min: number;
}