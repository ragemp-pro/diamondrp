type MpScaleformType = 'text'


interface MpScaleformOptions {
    text:string;
    scale: Vector3Mp;
    dimension: number;
    distance: number;
}

let ids = 0;
class MpScaleform {
    readonly id:number;
    readonly type: string;
    private positionvalue: Vector3Mp;
    private scalevalue: Vector3Mp;
    private rotationvalue: Vector3Mp;
    private dimensionvalue: number;
    private textvalue: string;
    private distancevalue: number;

    constructor(type: MpScaleformType, position:Vector3Mp, rotation:Vector3Mp, options?:MpScaleformOptions){
        const id = ids++;
        this.type = type;
        this.id = id;
        this.positionvalue = position;
        this.rotationvalue = rotation;
        if(options){
            this.textvalue = options.text
            this.dimensionvalue = options.dimension
            this.distancevalue = options.distance
            this.scalevalue = options.scale
        } else {
            this.dimensionvalue = 0;
            this.distancevalue = 30;
            this.textvalue = ""
            this.scalevalue = new mp.Vector3(6, 3, 1)
        }

        MpScaleform.pool.push(this);
        this.sync()
    }

    set text(value:string){
        this.textvalue = value;
        this.sync()
    }
    get text(){
        return this.textvalue
    }
    set dimension(value:number){
        this.dimensionvalue = value;
        this.sync()
    }
    get dimension(){
        return this.dimensionvalue
    }
    set distance(value:number){
        this.distancevalue = value;
        this.sync()
    }
    get distance(){
        return this.distancevalue
    }
    set position(value:Vector3Mp){
        this.positionvalue = value;
        this.sync()
    }
    get position(){
        return this.positionvalue
    }
    set rotation(value:Vector3Mp){
        this.rotationvalue = value;
        this.sync()
    }
    get rotation(){
        return this.rotationvalue
    }
    set scale(value:Vector3Mp){
        this.scalevalue = value;
        this.sync()
    }
    get scale(){
        return this.scalevalue
    }

    static new(type: MpScaleformType, position: Vector3Mp, rotation: Vector3Mp, options?: MpScaleformOptions){
        return new MpScaleform(type, position, rotation, options)
    }

    static at(id:number){
        return MpScaleform.pool.find(item => item.id === id);
    }

    static sync(item:MpScaleform){
        mp.players.call('updateScaleform')
    }
    sync(){
        MpScaleform.sync(this)
    }

    static pool: MpScaleform[] = []
}

mp.events.add('playerJoin', (player: PlayerMp) => {
    MpScaleform.pool.forEach(item => {
        player.call('createScaleform', [item.id, item.type, item.position, item.dimension, item.rotation, item.scale, item.text, item.distance])
    })
})