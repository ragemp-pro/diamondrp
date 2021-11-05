import {Table, Column, Model} from 'sequelize-typescript';

@Table({ modelName: "pAFk3qiAgG1_items"})
export class inventoryEntity extends Model<inventoryEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    @Column({defaultValue:-1})
    item_id:number;
    @Column({type: "FLOAT",defaultValue:0})
    pos_x:number;
    @Column({type: "FLOAT",defaultValue:0})
    pos_y:number;
    @Column({type: "FLOAT",defaultValue:0})
    pos_z:number;
    @Column({type: "FLOAT",defaultValue:0})
    rot_x:number;
    @Column({type: "FLOAT",defaultValue:0})
    rot_y:number;
    @Column({type: "FLOAT",defaultValue:0})
    rot_z:number;
    @Column({defaultValue:-1})
    owner_type:number;
    @Column({type:"BIGINT(11)",defaultValue:-1})
    owner_id:number;
    @Column({defaultValue:0})
    count:number;
    @Column({defaultValue:0})
    prefix:number;
    @Column({defaultValue:0})
    number:number;
    @Column({defaultValue:0})
    key_id:number;
    @Column({defaultValue:0})
    timestamp_update:number;
}

