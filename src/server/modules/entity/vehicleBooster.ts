import {Table, Column, Model} from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_vehicle_booster"})
export class vehicleBoosterEntity extends Model<vehicleBoosterEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    @Column({type:"INT(11)",allowNull:false})
    speed: number;
    @Column({type:"VARCHAR(255)",allowNull:false})
    model: string;
}