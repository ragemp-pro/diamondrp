

import { Table, Column, Model, Sequelize } from 'sequelize-typescript';
@Table({ modelName: "pAFk3qiAgG1_users_test_whitelist" })
export class whiteListTestEntity extends Model<whiteListTestEntity> {
    @Column({ primaryKey: true, autoIncrement: true })
    id: number;
    /** Админ, который внёс */
    @Column({
        type: Sequelize.INTEGER(5),
        allowNull: false
    })
    admin: number;
    /** Social для доступа */
    @Column({
        type: Sequelize.STRING(240),
        allowNull: false,
    })
    social: string;
}

