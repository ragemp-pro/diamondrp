import { methods } from "../modules/methods";

export class ScaleForm {
    _handle: number;
    queueCallFunction: Map<string, any[]>;
    enable: boolean;
    constructor(scaleformStr:string) {
        this._handle = mp.game.graphics.requestScaleformMovie(scaleformStr);
        this.enable = true;
        this.queueCallFunction = new Map();
    }

    setText(text:string){
        this.callFunction('SET_PLAYER_NAME', text);
    }

    destroy(){
        if (typeof this._handle == "number") mp.game.graphics.setScaleformMovieAsNoLongerNeeded(this._handle);
        this.enable = false
    }

    get isLoaded() {
        return !!mp.game.graphics.hasScaleformMovieLoaded(this._handle);
    }

    get isValid() {
        return this._handle !== 0;
    }

    get handle() {
        return this._handle;
    }

    callFunction(strFunction:string, ...args:any[]) {
        if (this.isLoaded && this.isValid) {
            const graphics = mp.game.graphics;
            graphics.pushScaleformMovieFunction(this._handle, strFunction);
            args.forEach(arg => {
                switch (typeof arg) {
                    case 'string': {
                        graphics.pushScaleformMovieFunctionParameterString(arg);
                        break;
                    }
                    case 'boolean': {
                        graphics.pushScaleformMovieFunctionParameterBool(arg);
                        break;
                    }
                    case 'number': {
                        if (Number(arg) === arg && arg % 1 !== 0) {
                            graphics.pushScaleformMovieFunctionParameterFloat(arg);
                        } else {
                            graphics.pushScaleformMovieFunctionParameterInt(arg);
                        }
                    }
                }
            });
            graphics.popScaleformMovieFunctionVoid();
        } else {
            this.queueCallFunction.set(strFunction, args);
        }
    }

    onUpdate() {
        if (this.isLoaded && this.isValid) {
            this.queueCallFunction.forEach((args, strFunction) => {
                this.callFunction(strFunction, ...args);
                this.queueCallFunction.delete(strFunction);
            });
        }
    }

    render2D(x:number, y:number, width:number, height:number) {
        this.onUpdate();
        if (this.isLoaded && this.isValid) {
            const graphics = mp.game.graphics;
            if (typeof x !== 'undefined' && typeof y !== 'undefined' && typeof width !== 'undefined' && typeof height !== 'undefined') {
                const activeResolution = graphics.getScreenActiveResolution(0, 0);

                graphics.drawScaleformMovie(this._handle, x, y, width, height, 255, 255, 255, 255, 0);
            } else {
                graphics.drawScaleformMovieFullscreen(this._handle, 255, 255, 255, 255, false);
            }
        }
    }

    render3D(position:Vector3Mp, rotation:Vector3Mp, scale:Vector3Mp) {
        this.onUpdate();
        if (this.isLoaded && this.isValid) {
            mp.game.graphics.drawScaleformMovie3dNonAdditive(this._handle, position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, 2, 2, 1, scale.x, scale.y, scale.z, 2);
        }
    }

    render3DAdditive(position: Vector3Mp, rotation: Vector3Mp, scale: Vector3Mp) {
        this.onUpdate();
        if (this.isLoaded && this.isValid) {
            mp.game.graphics.drawScaleformMovie3d(this._handle, position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, 2, 2, 1, scale.x, scale.y, scale.z, 2);
        }
    }
}
let ids = 0;
let scaleFormTextList: [ScaleForm, Vector3Mp, Vector3Mp, number, Vector3Mp][] = []
export const scaleFormText = (text:string, position: Vector3Mp, rotation: Vector3Mp, distance: number = 30, scale: Vector3Mp) => {
    ids++;
    let myScaleForm = new ScaleForm('player_name_0' + ids);
    myScaleForm.callFunction('SET_PLAYER_NAME', text);
    scaleFormTextList.push([myScaleForm, position, rotation, distance, scale]);
    return myScaleForm
}

mp.events.add('render', () => {
    scaleFormTextList.map(item => {
        if(item[0].enable){
            if (methods.distanceToPos(mp.players.local.position, item[1]) <= item[3])
            item[0].render3D(item[1], item[2], item[4]);
        }
    })
});



mp.events.add('createScaleform', () => {
    
});