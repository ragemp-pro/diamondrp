import {Table, Column, Model, HasMany, AutoIncrement, DataType} from 'sequelize-typescript';

@Table({ modelName: "pAFk3qiAgG1_money_chests"})
export class moneyChestEntity extends Model<moneyChestEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    @Column({defaultValue:0})
    money:number;
    @Column
    fraction: number;
    @Column({defaultValue:0})
    dimension: number;
    @Column({
        type: "VARCHAR(1024)",
        get(this:moneyChestEntity):Vector3Mp {
            return JSON.parse(this.getDataValue('position'));
        },
        set(this:moneyChestEntity, value:Vector3Mp) {
            this.setDataValue('position', JSON.stringify(value));
        }
    })
    position:Vector3Mp;
    @Column({
      type: DataType.TEXT,
      defaultValue: "[]",
      get(this:moneyChestEntity):{id:number;text:string}[] {
          return JSON.parse(this.getDataValue('log'));
      },
      set(this:moneyChestEntity, value:{id:number;text:string}[]) {
          this.setDataValue('log', JSON.stringify(value));
      }
    })
    log:{who:string;text:string}[];
}

