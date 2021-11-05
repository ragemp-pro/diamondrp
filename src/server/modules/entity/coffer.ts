

import { Table, Column, Model, Sequelize } from 'sequelize-typescript';
@Table({ modelName: "pAFk3qiAgG1_coffer_donate" })
export class cofferDonateEntity extends Model<cofferDonateEntity> {
    @Column({ primaryKey: true, autoIncrement: true })
    id: number;
    @Column({
        type: Sequelize.STRING(256),
        allowNull: false
    })
    name: string;
    @Column({
        type: Sequelize.INTEGER(11),
        allowNull: false,
    })
    sum: number;
    @Column({
        type: Sequelize.TIME,
        allowNull: false
    })
    timestamp: string;
}

@Table({ modelName: "pAFk3qiAgG1_coffers" })
export class cofferEntity extends Model<cofferEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true })
    id: number;
    @Column({ type: Sequelize.STRING(256), allowNull: false, defaultValue: "" })
    name: string;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 1 })
    nalog: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 5 })
    nalog_bizz: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 100 })
    moneyOld: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 20 })
    moneyBomj: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 50000 })
    moneyLimit: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 100000 })
    money: number;
}

