

import { Table, Column, Model, Sequelize } from 'sequelize-typescript';
@Table({ modelName: "pAFk3qiAgG1_gangwars_zones" })
export class gangWarsZoneEntity extends Model<gangWarsZoneEntity> {
    @Column({ primaryKey: true, autoIncrement: true })
    id: number;
    @Column({
        type: Sequelize.INTEGER(11),
        allowNull: false
    })
    owner: number;
    @Column({
        type: Sequelize.INTEGER(11),
        allowNull: false,
        defaultValue: 0
    })
    resp: number;
    @Column({
        type: Sequelize.STRING(300),
        allowNull: false
    })
    name: string;
    @Column({
        type: Sequelize.STRING(1024),
        allowNull: false,
        get(this: gangWarsZoneEntity): { x: number, y: number, z: number, d: number } {
            return JSON.parse(this.getDataValue('position'));
        },
        set(this: gangWarsZoneEntity, value: { x: number, y: number, z: number, d: number }) {
            this.setDataValue('position', JSON.stringify(value));
        }
    })
    position: {x:number,y:number,z:number,d:number};
}

