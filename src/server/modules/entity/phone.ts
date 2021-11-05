import { Table, Column, Model, HasMany, AutoIncrement, DataType } from 'sequelize-typescript';
import Sequelize from 'sequelize';


@Table({ modelName: "pAFk3qiAgG1_phone_contact" })
export class phoneContactEntity extends Model<phoneContactEntity> {
    @Column({ type: Sequelize.INTEGER({length: 11 }), primaryKey: true, autoIncrement: true })
    id: number;
    @Column({ type: Sequelize.STRING(32), allowNull: false })
    number: string;
    @Column({ type: Sequelize.STRING(32), allowNull: false })
    title: string;
    @Column({ type: Sequelize.STRING(50), allowNull: false })
    text_number: string;    
}


@Table({ modelName: "pAFk3qiAgG1_phone_sms" })
export class phoneSMSEntity extends Model<phoneSMSEntity> {
    @Column({ type: Sequelize.INTEGER({ length: 11 }), primaryKey: true, autoIncrement: true })
    id: number;
    @Column({ type: Sequelize.STRING(16), allowNull: false })
    number_from: string;
    @Column({ type: Sequelize.STRING(16), allowNull: false })
    number_to: string;
    @Column({ type: Sequelize.STRING(512), allowNull: false })
    text: string;
    @Column({ type: Sequelize.STRING(32), allowNull: false })
    datetime: string;
}

