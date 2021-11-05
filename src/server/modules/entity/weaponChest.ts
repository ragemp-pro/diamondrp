import {Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize} from 'sequelize-typescript';
import { orderItem } from "../chest";


@Table({ modelName: "pAFk3qiAgG1_weapon_chests"})
export class weaponChest extends Model<weaponChest> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    @Column
    name: string;
    @Column({
        type: DataType.TEXT,
        defaultValue: "[]",
        get(this:weaponChest):orderItem[] {
            return JSON.parse(this.getDataValue('items'));
        },
        set(this:weaponChest, value:orderItem[]) {
            this.setDataValue('items', JSON.stringify(value));
        }
    })
    items:orderItem[];
    @Column
    weight: number;
    @Column({defaultValue:0})
    dimension: number;
    @Column
    fraction: number;
    @Column({
        type: "VARCHAR(1024)",
        get(this:weaponChest):Vector3Mp {
            return JSON.parse(this.getDataValue('pos'));
        },
        set(this:weaponChest, value:Vector3Mp) {
            this.setDataValue('pos', JSON.stringify(value));
        }
    })
    pos:Vector3Mp;
}

