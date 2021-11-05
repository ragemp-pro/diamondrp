import {Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize} from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_car_rent"})
export class carRentEntity extends Model<carRentEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    @Column({type:"INT(10)",allowNull:false})
    business_id: number;
    @Column({type:"VARCHAR(255)",allowNull:false})
    name: string;
    @Column({type:"INT(5)",allowNull:false})
    price: number;
}

