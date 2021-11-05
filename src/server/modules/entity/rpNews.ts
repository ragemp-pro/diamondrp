

import { Table, Column, Model, Sequelize } from 'sequelize-typescript';
@Table({ modelName: "pAFk3qiAgG1_rp_news" })
export class rpNewsEntity extends Model<rpNewsEntity> {
    @Column({ primaryKey: true, autoIncrement: true })
    id: number;
    @Column({
        type: Sequelize.STRING(256),
        allowNull: false
    })
    title: string;
    @Column({
        type: Sequelize.TEXT(),
        allowNull: false
    })
    text: string;
    @Column({
        type: Sequelize.STRING(128),
        allowNull: false
    })
    author_name: string;
    @Column({
        type: Sequelize.INTEGER(11),
        allowNull: false,
    })
    author_id: number;
    @Column({
        type: Sequelize.INTEGER(11),
        allowNull: false,
    })
    fraction: number;
    @Column({
        type: Sequelize.STRING(2048),
        allowNull: false
    })
    img: string;
    @Column({
        type: Sequelize.DATE,
        allowNull: false
    })
    date: string;
    @Column({
        type: Sequelize.TIME,
        allowNull: false
    })
    time: string;
    @Column({
        type: Sequelize.INTEGER(11),
        allowNull: false,
    })
    timestamp: number;
}

