import { Table, Column, Model, Sequelize } from 'sequelize-typescript';
@Table({ modelName: "pAFk3qiAgG1_log_referrer" })
export class logReferrerEntity extends Model<logReferrerEntity> {
  @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true, allowNull: false, defaultValue: null })
  id: number;
  @Column({ type: Sequelize.STRING(256), allowNull: false, defaultValue: '' })
  name: string;
  @Column({ type: Sequelize.STRING(512), allowNull: false, defaultValue: '' })
  referrer: string;
  @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
  money: number;
  @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
  timestamp: number;
}