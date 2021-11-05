import {Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize} from 'sequelize-typescript';


@Table({ modelName: "pAFk3qiAgG1_cars"})
export class carsEntity extends Model<carsEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    @Column({type:"INT(11)",defaultValue:0})
    id_user: number;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    user_name: string;
    @Column({type:"VARCHAR(128)",defaultValue:""})
    name: string;
    @Column({type:"VARCHAR(128)",defaultValue:""})
    class_type: string;
    @Column({type:"INT(11)",defaultValue:0})
    hash: number;
    @Column({type:"INT(11)",defaultValue:100})
    price: number;
    @Column({type:"INT(11)",defaultValue:0})
    stock: number;
    @Column({type:"INT(11)",defaultValue:1})
    stock_full: number;
    @Column({type:"INT(11)",defaultValue:0})
    stock_item: number;
    @Column({type:"FLOAT",defaultValue:50})
    fuel: number;
    @Column({type:"INT(11)",defaultValue:100})
    full_fuel: number;
    @Column({type:"INT(11)",defaultValue:1})
    fuel_minute: number;
    @Column({type:"INT(11)",defaultValue:0})
    color1: number;
    @Column({type:"INT(11)",defaultValue:0})
    color2: number;
    @Column({type:"INT(11)",defaultValue:0})
    neon_type: number;
    @Column({type:"INT(11)",defaultValue:255})
    neon_r: number;
    @Column({type:"INT(11)",defaultValue:255})
    neon_g: number;
    @Column({type:"INT(11)",defaultValue:255})
    neon_b: number;
    @Column({type:"VARCHAR(128)",allowNull:false})
    number: string;
    @Column({type:"INT(11)",defaultValue:0})
    wanted_level: number;
    @Column({type:"TINYINT(1)",defaultValue:0})
    lock_status: number;
    @Column({type:"FLOAT",defaultValue:0})
    s_mp: number;
    @Column({type:"INT(11)",defaultValue:0})
    s_wh_bk_l: number;
    @Column({type:"INT(11)",defaultValue:0})
    s_wh_b_l: number;
    @Column({type:"INT(11)",defaultValue:0})
    s_wh_bk_r: number;
    @Column({type:"INT(11)",defaultValue:0})
    s_wh_b_r: number;
    @Column({type:"INT(11)",defaultValue:0})
    s_engine: number;
    @Column({type:"INT(11)",defaultValue:0})
    s_suspension: number;
    @Column({type:"INT(11)",defaultValue:0})
    s_body: number;
    @Column({type:"FLOAT",defaultValue:0})
    s_candle: number;
    @Column({type:"FLOAT",defaultValue:0})
    s_oil: number;
    @Column({type:"INT(11)",defaultValue:-1})
    livery: number;
    @Column({type:"TINYINT(1)",defaultValue:1})
    is_visible: number;
    @Column({type:"FLOAT",defaultValue:0})
    x: number;
    @Column({type:"FLOAT",defaultValue:0})
    y: number;
    @Column({type:"FLOAT",defaultValue:0})
    z: number;
    @Column({type:"FLOAT",defaultValue:0})
    rot: number;
    @Column({type:"FLOAT",defaultValue:0})
    x_park: number;
    @Column({type:"FLOAT",defaultValue:0})
    y_park: number;
    @Column({type:"FLOAT",defaultValue:0})
    z_park: number;
    @Column({type:"FLOAT",defaultValue:0})
    rot_park: number;
    @Column({type:"VARCHAR(4048)",defaultValue:'{"18":-1}'})
    upgrade: string;
    @Column({type:"INT(11)",defaultValue:0})
    money_tax: number;
    @Column({type:"INT(11)",defaultValue:0})
    score_tax: number;
    @Column({type:"VARCHAR(512)",defaultValue:''})
    cop_park_name: string;
    @Column({type:"TINYINT(1)",defaultValue:0})
    is_cop_park: number;
    @Column({type:"INT(1)",defaultValue:0})
    sell_price: number;
    @Column({type:"VARCHAR(50)",allowNull:true})
    sell_info: string;
}

