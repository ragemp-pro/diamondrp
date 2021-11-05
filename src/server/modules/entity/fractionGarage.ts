import {Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize} from 'sequelize-typescript';
import { fractionGarageCar } from '../fraction.vehicles.spawn';


@Table({ modelName: "pAFk3qiAgG1_garage_fractions"})
export class fractionGarageEntity extends Model<fractionGarageEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    @Column
    prefix: string;
    @Column
    fraction: number;
    @Column({
      type: "VARCHAR(1024)",
      get(this:fractionGarageEntity):Vector3Mp {
          return JSON.parse(this.getDataValue('position'));
      },
      set(this:fractionGarageEntity, value:Vector3Mp) {
          this.setDataValue('position', JSON.stringify(value));
      }
    })
    position:Vector3Mp;
    @Column({
        type: DataType.TEXT,
        defaultValue: "[]",
        get(this:fractionGarageEntity):fractionGarageCar[] {
            return JSON.parse(this.getDataValue('cars'));
        },
        set(this:fractionGarageEntity, value:fractionGarageCar[]) {
            this.setDataValue('cars', JSON.stringify(value));
        }
    })
    cars:fractionGarageCar[];
    @Column({defaultValue:0})
    dimension: number;  
}

