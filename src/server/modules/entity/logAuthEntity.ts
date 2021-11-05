import { Table, Column, Model, Sequelize } from 'sequelize-typescript';
@Table({ modelName: "pAFk3qiAgG1_log_auth" })
export class logAuthEntity extends Model<logAuthEntity> {
  @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true, allowNull: false, defaultValue: null })
  id: number;
  @Column({ type: Sequelize.STRING(128), allowNull: false, defaultValue: '' })
  nick: string;
  @Column({ type: Sequelize.STRING(512), allowNull: false, defaultValue: '' })
  lic: string;
  @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
  datetime: number;
}