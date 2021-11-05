import {Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize} from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_business"})
export class businessEntity extends Model<businessEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    @Column({type:"VARCHAR(128)",allowNull:false})
    name: string;
    @Column({type:"VARCHAR(128)",allowNull:false,defaultValue:"Unknown"})
    name2: string;
    @Column({type:"INT(11)",defaultValue:0})
    price: number;
    @Column({type:"INT(11)",defaultValue:0})
    money_tax: number;
    @Column({type:"INT(11)",defaultValue:0})
    score_tax: number;
    @Column({type:"VARCHAR(128)",allowNull:false})
    user_name: string;
    @Column({type:"INT(11)",defaultValue:0})
    user_id: number;
    @Column({type:"INT(11)",defaultValue:0})
    bank: number;
    @Column({type:"INT(11)",defaultValue:0})
    type: number;
    @Column({type:"INT(11)",defaultValue:1})
    price_product: number;
    @Column({type:"INT(11)",defaultValue:10})
    price_card1: number;
    @Column({type:"INT(11)",defaultValue:10})
    price_card2: number;
    @Column({type:"INT(11)",defaultValue:0})
    tarif: number;
    @Column({type:"INT(11)",defaultValue:2})
    interior: number;
    @Column({type:"VARCHAR(512)",defaultValue:"/images/logoBig.png"})
    rp_logo: string;
    @Column({type:"VARCHAR(512)",defaultValue:"https://i.imgur.com/PhhDQT9.jpg"})
    rp_main_img: string;
    @Column({type:"VARCHAR(64)",defaultValue:"grey"})
    rp_color: string;
}

