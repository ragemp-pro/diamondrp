import { Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize } from 'sequelize-typescript';

@Table({ modelName: "pAFk3qiAgG1_rp_invader_ad" })
export class rpInvaderAdEntity extends Model<rpInvaderAdEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true, allowNull: false })
    id: number;
    @Column({ type: Sequelize.STRING(64), allowNull: false, defaultValue: '' })
    datetime: string;
    @Column({ type: Sequelize.STRING(256), allowNull: false, defaultValue: '' })
    name: string;
    @Column({ type: Sequelize.STRING(32), allowNull: false, defaultValue: '' })
    phone: string;
    @Column({ type: Sequelize.STRING(32), allowNull: false, defaultValue: 'Разное' })
    title: string;
    @Column({ type: Sequelize.STRING(256), allowNull: false, defaultValue: '' })
    text: string;
}
