import {Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize} from 'sequelize-typescript';
import { vipName } from '../../../util/vip';



interface skinData {
  SEX : number;
  GTAO_SHAPE_THRID_ID : number;
  GTAO_SKIN_THRID_ID : number;
  GTAO_SHAPE_SECOND_ID : number;
  GTAO_SKIN_SECOND_ID : number;
  GTAO_SHAPE_MIX : number;
  GTAO_SKIN_MIX : number;
  GTAO_HAIR : number;
  GTAO_HAIR_COLOR : number;
  GTAO_HAIR_COLOR2 : number;
  GTAO_EYE_COLOR : number;
  GTAO_EYEBROWS : number;
  GTAO_EYEBROWS_COLOR : number;
  GTAO_OVERLAY : number;
  GTAO_OVERLAY_COLOR : number;
  GTAO_OVERLAY9 : number;
  GTAO_OVERLAY9_COLOR : number;
  GTAO_OVERLAY8 : number;
  GTAO_OVERLAY8_COLOR : number;
  GTAO_OVERLAY5 : number;
  GTAO_OVERLAY5_COLOR : number;
  GTAO_OVERLAY4 : number;
  GTAO_OVERLAY4_COLOR : number;
  GTAO_FACE_SPECIFICATIONS : number[];
}

interface userWarn {
  admin:number;
  time:number;
  reason:string;
}

@Table({ modelName: "pAFk3qiAgG1_users"})
export class userEntity extends Model<userEntity> {
    @Column({primaryKey:true,autoIncrement: true})
    id: number;
    @Column({type:"VARCHAR(512)"})
    name: string;
    @Column({type:"BIGINT(20)",defaultValue:0})
    name2: number;
    @Column({type:"VARCHAR(128)"})
    rp_name: string;
    @Column({type:"VARCHAR(512)"})
    lic: string;
    @Column({type:"VARCHAR(256)"})
    password: string;
    @Column({type:"INT(11)",defaultValue:0})
    reg_status: 0|1|2|3;
    @Column({type:"INT(11)",defaultValue:0})
    reg_time: number;
    @Column({type:"INT(11)",defaultValue:18})
    age: number;
    @Column({type:"INT(11)",defaultValue:0})
    exp_age: number;
    @Column({type:"INT(11)",defaultValue:0})
    money: number;
    @Column({type:"INT(11)",defaultValue:0})
    money_bank: number;
    @Column({type:"INT(11)",defaultValue:0})
    money_payday: number;
    @Column({type:"INT(11)",defaultValue:300})
    money_tax: number;
    @Column({type:"INT(11)",defaultValue:0})
    bank_prefix: number;
    @Column({type:"INT(11)",defaultValue:0})
    bank_number: number;
    @Column({type:"TINYINT(1)",defaultValue:0})
    posob: number;
    @Column({type:"INT(11)",defaultValue:0})
    id_house: number;
    @Column({type:"INT(11)",defaultValue:0})
    apartment_id: number;
    @Column({type:"INT(11)",defaultValue:0})
    condo_id: number;
    @Column({type:"INT(11)",defaultValue:0})
    business_id: number;
    @Column({type:"INT(11)",defaultValue:0})
    stock_id: number;
    @Column({type:"INT(11)",defaultValue:0})
    car_id1: number;
    @Column({type:"INT(11)",defaultValue:0})
    car_id2: number;
    @Column({type:"INT(11)",defaultValue:0})
    car_id3: number;
    @Column({type:"INT(11)",defaultValue:0})
    car_id4: number;
    @Column({type:"INT(11)",defaultValue:0})
    car_id5: number;
    @Column({type:"INT(11)",defaultValue:0})
    car_id6: number;
    @Column({type:"INT(11)",defaultValue:0})
    car_id7: number;
    @Column({type:"INT(11)",defaultValue:0})
    car_id8: number;
    @Column({type:"INT(11)",defaultValue:0})
    fraction_id: number;
    @Column({type:"INT(11)",defaultValue:0})
    rank: number;
    @Column({type:"INT(11)",defaultValue:0})
    fraction_id2: number;
    @Column({type:"INT(11)",defaultValue:0})
    rank2: number;
    @Column({type:"VARCHAR(64)",defaultValue:null})
    tag: string;
    @Column({type:"VARCHAR(16)",defaultValue:""})
    job: string;
    @Column({type:"TINYINT(1)",defaultValue:0})
    is_gos_blacklist: number;
    @Column({type:"VARCHAR(300)",defaultValue:""})
    gos_blacklist_reason: string;
    @Column({type:"INT(11)",defaultValue:0})
    admin_level: number;
    @Column({type:"INT(11)",defaultValue:0})
    helper_level: number;
    @Column({
      type:"TEXT",
      defaultValue:null,
      get():skinData{
        const data = this.getDataValue("skin")
        if(!data) return null;
        return JSON.parse(this.getDataValue("skin"))
      },
      set(value:skinData){
        this.setDataValue("skin", value ? JSON.stringify(value) : null)
      },
    })
    skin: skinData;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    tattoo_head_c: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    tattoo_head_o: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    tattoo_torso_c: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    tattoo_torso_o: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    tattoo_left_arm_c: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    tattoo_left_arm_o: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    tattoo_right_arm_c: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    tattoo_right_arm_o: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    tattoo_left_leg_c: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    tattoo_left_leg_o: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    tattoo_right_leg_c: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    tattoo_right_leg_o: string;
    @Column({type:"VARCHAR(128)",defaultValue:""})
    tprint_c: string;
    @Column({type:"VARCHAR(128)",defaultValue:""})
    tprint_o: string;
    @Column({type:"INT(11)",defaultValue:0})
    date_reg: number;
    @Column({type:"INT(11)",defaultValue:0})
    last_login: number;
    @Column({type:"INT(11)",defaultValue:0})
    date_ban: number;
    @Column({type:"INT(11)",defaultValue:0})
    date_mute: number;
    @Column({type:"INT(11)",defaultValue:0})
    warn: number;
    @Column({type:"INT(11)",defaultValue:0})
    wanted_level: number;
    @Column({type:"VARCHAR(512)",defaultValue:""})
    wanted_reason: string;
    @Column({type:"INT(11)",defaultValue:0})
    phone_code: number;
    @Column({type:"INT(11)",defaultValue:0})
    phone: number;
    @Column({type:"TINYINT(1)",defaultValue:0})
    is_buy_walkietalkie: number;
    @Column({type:"TINYINT(1)",defaultValue:0,get():boolean{
      return (this.getDataValue('is_old_money') == 1)
    },
    set(value:boolean){
      this.setDataValue('is_old_money', value ? 1 : 0)
    }})
    is_old_money: boolean;
    @Column({type:"TINYINT(1)",defaultValue:0})
    item_clock: number;
    @Column({type:"VARCHAR(7)",defaultValue:'0'})
    walkietalkie_num: string;
    @Column({type:"TINYINT(1)",defaultValue:0,get():boolean{
      return (!!this.getDataValue("jailed"))
    },set(value:boolean){
      this.setDataValue("jailed", value ? 1 : 0)
    }})
    jailed: boolean;
    @Column({type:"INT(11)",defaultValue:0})
    jail_time: number;
    @Column({type:"INT(11)",defaultValue:0})
    med_time: number;
    @Column({type:"INT(11)",defaultValue:0})
    mask: number;
    @Column({type:"INT(11)",defaultValue:0})
    mask_color: number;
    @Column({type:"INT(11)",defaultValue:0})
    head: number;
    @Column({type:"INT(11)",defaultValue:0})
    head_color: number;
    @Column({type:"INT(11)",defaultValue:0})
    body: number;
    @Column({type:"INT(11)",defaultValue:0})
    body_color: number;
    @Column({type:"INT(11)",defaultValue:0})
    torso: number;
    @Column({type:"INT(11)",defaultValue:0})
    torso_color: number;
    @Column({type:"INT(11)",defaultValue:0})
    leg: number;
    @Column({type:"INT(11)",defaultValue:0})
    leg_color: number;
    @Column({type:"INT(11)",defaultValue:0})
    hand: number;
    @Column({type:"INT(11)",defaultValue:0})
    hand_color: number;
    @Column({type:"INT(11)",defaultValue:0})
    parachute: number;
    @Column({type:"INT(11)",defaultValue:0})
    parachute_color: number;
    @Column({type:"INT(11)",defaultValue:0})
    foot: number;
    @Column({type:"INT(11)",defaultValue:0})
    foot_color: number;
    @Column({type:"INT(11)",defaultValue:0})
    accessorie: number;
    @Column({type:"INT(11)",defaultValue:0})
    accessorie_color: number;
    @Column({type:"INT(11)",defaultValue:0})
    armor: number;
    @Column({type:"INT(11)",defaultValue:0})
    armor_color: number;
    @Column({type:"INT(11)",defaultValue:0})
    decal: number;
    @Column({type:"INT(11)",defaultValue:0})
    decal_color: number;
    @Column({type:"INT(11)",defaultValue:-1})
    hat: number;
    @Column({type:"INT(11)",defaultValue:-1})
    hat_color: number;
    @Column({type:"INT(11)",defaultValue:-1})
    glasses: number;
    @Column({type:"INT(11)",defaultValue:-1})
    glasses_color: number;
    @Column({type:"INT(11)",defaultValue:-1})
    ear: number;
    @Column({type:"INT(11)",defaultValue:-1})
    ear_color: number;
    @Column({type:"INT(11)",defaultValue:-1})
    watch: number;
    @Column({type:"INT(11)",defaultValue:-1})
    watch_color: number;
    @Column({type:"INT(11)",defaultValue:-1})
    bracelet: number;
    @Column({type:"INT(11)",defaultValue:-1})
    bracelet_color: number;
    /** Рецепт марихуаны */
    @Column({type:"TINYINT(1)",defaultValue:0})
    allow_marg: number;
    /** Рецепт антипохмелина */
    @Column({type:"TINYINT(1)",defaultValue:0})
    allow_antipohmel: number;
    @Column({type:"INT(11)",defaultValue:100})
    health: number;
    @Column({type:"INT(11)",defaultValue:100})
    water_level: number;
    @Column({type:"INT(11)",defaultValue:1000})
    eat_level: number;
    @Column({type:"INT(11)",defaultValue:100})
    health_level: number;
    @Column({type:"FLOAT",defaultValue:36.6})
    temp_level: number;
    @Column({type:"INT(11)",defaultValue:0})
    sick_cold: number;
    @Column({type:"INT(11)",defaultValue:0})
    sick_poisoning: number;
    @Column({type:"INT(11)",defaultValue:24})
    mp0_stamina: number;
    @Column({type:"INT(11)",defaultValue:0})
    mp0_strength: number;
    @Column({type:"INT(11)",defaultValue:0})
    mp0_lung_capacity: number;
    @Column({type:"INT(11)",defaultValue:0})
    mp0_wheelie_ability: number;
    @Column({type:"INT(11)",defaultValue:0})
    mp0_flying_ability: number;
    @Column({type:"INT(11)",defaultValue:0})
    mp0_shooting_ability: number;
    @Column({type:"INT(11)",defaultValue:0})
    mp0_stealth_ability: number;
    @Column({type:"INT(11)",defaultValue:0})
    mp0_watchdogs: number;
    @Column({type:"TINYINT(1)",defaultValue:0})
    a_lic: 0|1;
    @Column({type:"TINYINT(1)",defaultValue:0})
    b_lic: 0|1;
    @Column({type:"TINYINT(1)",defaultValue:0})
    c_lic: 0|1;
    @Column({type:"TINYINT(1)",defaultValue:0})
    air_lic: 0|1;
    @Column({type:"TINYINT(1)",defaultValue:0})
    ship_lic: 0|1;
    @Column({type:"TINYINT(1)",defaultValue:0})
    gun_lic: 0|1;
    @Column({type:"TINYINT(1)",defaultValue:0})
    taxi_lic: 0|1;
    @Column({type:"TINYINT(1)",defaultValue:0})
    law_lic: 0|1;
    @Column({type:"TINYINT(1)",defaultValue:0})
    med_lic: 0|1;
    @Column({type:"TINYINT(1)",defaultValue:0})
    biz_lic: 0|1;
    @Column({type:"TINYINT(1)",defaultValue:0})
    animal_lic: 0|1;
    @Column({type:"TINYINT(1)",defaultValue:0})
    fish_lic: 0|1;
    @Column({type:"VARCHAR(32)",defaultValue:""})
    animal: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    animal_name: string;
    @Column({type:"INT(11)",defaultValue:0})
    story_1: number;
    @Column({type:"INT(11)",defaultValue:3})
    story_timeout_1: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_builder: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_scrap: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_shop: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_taxi: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_mail: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_mail2: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_photo: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_sunb: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_bgstar: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_bshot: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_three: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_water: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_bus1: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_bus2: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_bus3: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_gr6: number;
    @Column({type:"INT(11)",defaultValue:0})
    skill_trucker: number;
    @Column({type:"VARCHAR(20)",defaultValue:""})
    vip_status: vipName;
    @Column({type:"BIGINT(20)",defaultValue:0})
    vip_time: number;
    @Column({type:"INT(11)",defaultValue:0})
    count_hask: number;
    @Column({type:"INT(11)",defaultValue:0})
    count_aask: number;
    @Column({type:"VARCHAR(128)",defaultValue:""})
    token: string;
    @Column({type:"VARCHAR(128)",defaultValue:""})
    token_rp: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    ip_reg: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    ip_last: string;
    @Column({type:"INT(11)",defaultValue:0})
    money_donate: number;
    @Column({type:"TINYINT(1)",defaultValue:0})
    is_online: number;
    @Column({type:"TINYINT(1)",defaultValue:0})
    s_is_pay_type_bank: number;
    @Column({type:"TINYINT(1)",defaultValue:1})
    s_is_load_blip_house: number;
    @Column({type:"TINYINT(1)",defaultValue:0})
    s_is_characher: number;
    @Column({type:"TINYINT(1)",defaultValue:0})
    s_is_spawn_aprt: number;
    @Column({type:"VARCHAR(4)",defaultValue:"RU"})
    s_lang: string;
    @Column({type:"VARCHAR(32)",defaultValue:""})
    s_clipset: string;
    @Column({type:"TINYINT(1)",defaultValue:0})
    s_is_usehackerphone: number;
    @Column({type:"INT(11)",defaultValue:1})
    s_radio_balance: number;
    @Column({type:"FLOAT",defaultValue:0.4})
    s_radio_vol: number;
    @Column({type:"FLOAT",defaultValue:0.4})
    s_voice_vol: number;
    @Column({type:"TINYINT(1)",defaultValue:1})
    s_voice_balance: number;
    @Column({type:"INT(6)",defaultValue:0})
    sell_car_time: number;
    @Column({type:"TINYINT(1)",defaultValue:0})
    sell_car: number;
    @Column({type:"VARCHAR(4048)",defaultValue:""})
    mailhouses: string;
    @Column({type:"INT(3)",defaultValue:0})
    house_grab: number;
    @Column({type:"VARCHAR(128)",defaultValue:""})
    email: string;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    referer: string;
    @Column({type:"VARCHAR(100)",defaultValue:""})
    promocode: string;
    @Column({type:"INT(11)",defaultValue:0})
    parthner_procent: number;
    @Column({type:"VARCHAR(64)",defaultValue:""})
    parthner_promocode: string;
    @Column({type:"VARCHAR(128)",defaultValue:""})
    parthner_payment: string;
    @Column({type:"VARCHAR(4)",defaultValue:"null"})
    empty_col: string;
    @Column({type:"SMALLINT(6)",defaultValue:70})
    rp_weight: number;
    @Column({type:"SMALLINT(6)",defaultValue:180})
    rp_growth: number;
    @Column({type:"VARCHAR(128)",defaultValue:"Американец"})
    rp_nationality: string;
    @Column({type:"VARCHAR(256)",defaultValue:null,allowNull:true})
    rp_qualities: string;
    @Column({type:"VARCHAR(256)",defaultValue:null,allowNull:true})
    rp_distinctive_features: string;
    @Column({type:"VARCHAR(256)",defaultValue:null,allowNull:true})
    rp_diseases: string;
    @Column({type:"VARCHAR(256)",defaultValue:null,allowNull:true})
    rp_character: string;
    @Column({type:"TEXT",defaultValue:null,allowNull:true})
    rp_biography: string;
    @Column({type:"VARCHAR(512)",defaultValue:"https://i.imgur.com/MUxgy8v.png"})
    rp_avatar: string;
    @Column({type:"TINYINT(1)",defaultValue:1})
    rp_is_public: number;
    @Column({type:"INT(2)",defaultValue:0})
    jailed_admin: number;
    @Column({
      type:"VARCHAR(1024)",
      defaultValue:"[]",
      get():{name:string,complete:boolean}[]{
        return JSON.parse(this.getDataValue('quests'))
      },
      set(value:{name:string,complete:boolean}[]){
        this.setDataValue('quests', JSON.stringify(value));
      }
    })
    quests: {name:string,complete:boolean}[];
    @Column({type:"INT(11)",defaultValue:0})
    chipsBalance: number;
    @Column({
      type:"VARCHAR(1024)",
      defaultValue:"[]",
      get():number[]{
        return JSON.parse(this.getDataValue('holidayPickups'))
      },
      set(value:number[]){
        this.setDataValue('holidayPickups', JSON.stringify(value));
      }
    })
    holidayPickups: number[];
    @Column({
      type:"VARCHAR(1024)",
      defaultValue:"[]",
      get():number[]{
        return JSON.parse(this.getDataValue('shootingPickups'))
      },
      set(value:number[]){
        this.setDataValue('shootingPickups', JSON.stringify(value));
      }
    })
    shootingPickups: number[];
    @Column({type:"BIGINT(20)"})
    rgscid:number;
    @Column({type:"INT(11)",defaultValue:1})
    level:number;
    @Column({type:"INT(11)",defaultValue:0})
    level_exp:number;
    @Column({type:"INT(11)",defaultValue:0})
    tablet_equip:number;
    @Column({type:"INT(11)",defaultValue:0})
    played_time:number;
    @Column({
      type:"VARCHAR(3000)",
      defaultValue:"[]",
      get(this: userEntity): [string, string][]{
        return JSON.parse(this.getDataValue('tattoos_list') as any) as any
      },
      set(this: userEntity, value: [string, string][]){
        this.setDataValue('tattoos_list', JSON.stringify(value) as any);
      }
    })
    tattoos_list: [string, string][];
  }

