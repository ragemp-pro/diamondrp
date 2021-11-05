import {Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize} from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_autosalon_percent"})
export class autosalonPercentEntity extends Model<autosalonPercentEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    @Column({type:"INT(10)",allowNull:false})
    business_id: number;
    @Column({type:"VARCHAR(255)",allowNull:false})
    business_name: string;
    @Column({type:"TINYINT(3)",allowNull:false})
    percent: number;
}

