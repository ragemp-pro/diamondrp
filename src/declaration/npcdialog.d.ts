interface clientNpcDialog {
  id:number;
  model:string;
  heading:number;
  position:Vector3Mp;
  radius:number;
  dimension:number;
  ped?:PedMp;
}

interface NpcDialogQuestion {
  ask:string;
  answers:string[];
  result:(player:PlayerMp,answerId:number) => void;
}