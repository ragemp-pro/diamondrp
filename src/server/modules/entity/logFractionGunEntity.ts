

import {Table, Column, Model, Sequelize} from 'sequelize-typescript';
@Table({ modelName: "pAFk3qiAgG1_log_fraction_gun" })
export class logFractionGunEntity extends Model<logFractionGunEntity> {
  @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true, allowNull: false })
  id: number;
  @Column({ type: Sequelize.STRING(64), allowNull: false, defaultValue: "" })
  name: string;
  @Column({ type: Sequelize.STRING(1024), allowNull: false, defaultValue: "" })
  do: string;
  @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
  timestamp: number;
  @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
  fraction_id: number;
}