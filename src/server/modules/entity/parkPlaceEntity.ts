import {Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize} from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_park_place" })
export class parkPlaceEntity extends Model<parkPlaceEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true, allowNull: false })
    id: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    type: number;
    @Column({ type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 })
    x: number;
    @Column({ type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 })
    y: number;
    @Column({ type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 })
    z: number;
    @Column({ type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 })
    rx: number;
    @Column({ type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 })
    ry: number;
    @Column({ type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 })
    rz: number;
    @Column({ type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 })
    h: number;
}
