type minigameTypes = "gr6"|"wash"|"hammer"|"unlock"

interface String {
  regexIndexOf(regex:RegExp, startpos:number):number;
  md5():string;
  isNumberOnly():boolean;
}

interface Array<T> {
  chunk_inefficient(chunkSize: number):T[][]
}

interface SlotMachinesMetaInterface {
  type: number;
  position: Vector3Mp;
  heading: number;
  player?: PlayerMp;
}

interface SlotMachinesMetaTypeInterface {
  bet: number;
  model: string;
}

interface SlotMachinesMetaTypesInterface {
  [key: number]: SlotMachinesMetaTypeInterface
}
