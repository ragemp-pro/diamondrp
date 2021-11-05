import {Table, Column, Model, DataType} from 'sequelize-typescript';
import { dressItem } from '../garderob';


@Table({ modelName: "pAFk3qiAgG1_garderobs"})
export class garderobEntity extends Model<garderobEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    @Column({
        type: DataType.TEXT,
        defaultValue: "[]",
        get(this:garderobEntity):dressItem[] {
            return JSON.parse(this.getDataValue('dresses'));
        },
        set(this:garderobEntity, value:dressItem[]) {
            this.setDataValue('dresses', JSON.stringify(value));
        }
    })
    dresses:dressItem[];
    @Column
    fraction: number;
    @Column({defaultValue:0})
    dimension: number;
    @Column({
        type: "VARCHAR(1024)",
        get(this:garderobEntity):Vector3Mp {
            return JSON.parse(this.getDataValue('position'));
        },
        set(this:garderobEntity, value:Vector3Mp) {
            this.setDataValue('position', JSON.stringify(value));
        }
    })
    position:Vector3Mp;
}

