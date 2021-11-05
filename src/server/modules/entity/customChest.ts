import { Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize } from 'sequelize-typescript';
import { orderItem } from "../chest";
import { protectSetting } from '../customchest';


@Table({ modelName: "pAFk3qiAgG1_custom_chests" })
export class customChest extends Model<customChest> {
    @Column({ primaryKey: true, autoIncrement: true })
    id: number;
    @Column
    name: string;
    @Column({ defaultValue: 0 })
    dimension: number;
    @Column({
        type: "VARCHAR(1024)",
        get(this: customChest): Vector3Mp {
            return JSON.parse(this.getDataValue('pos'));
        },
        set(this: customChest, value: Vector3Mp) {
            this.setDataValue('pos', JSON.stringify(value));
        }
    })
    pos: Vector3Mp;
    @Column({
        type: "VARCHAR(1024)",
        get(this: customChest): protectSetting {
            return JSON.parse(this.getDataValue('settings'));
        },
        set(this: customChest, value: protectSetting) {
            this.setDataValue('settings', JSON.stringify(value));
        }
    })
    settings: protectSetting;
}

