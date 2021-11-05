import { Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize } from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_apartment" })
export class apartmentEntity extends Model<apartmentEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true })
    id: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    user_id: number;
    @Column({ type: Sequelize.STRING(256), allowNull: false })
    user_name: string;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    price: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    money_tax: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    score_tax: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 1 })
    build_id: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 1 })
    floor: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 4 })
    interior_id: number;
    @Column({ type: Sequelize.TINYINT(1), allowNull: false, defaultValue: 0 })
    is_exterior: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    pin: number;
    @Column({ type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 })
    balcony_x: number;
    @Column({ type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 })
    balcony_y: number;
    @Column({ type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 })
    balcony_z: number;
}

