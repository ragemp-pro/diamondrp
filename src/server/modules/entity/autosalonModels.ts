import {Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize} from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_autosalon_models"})
export class autosalonModelsEntity extends Model<autosalonModelsEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    @Column({type:"INT(11)",defaultValue:0})
    autosalon: number;
    @Column({type:"VARCHAR(120)",allowNull:false})
    model: string;
}

