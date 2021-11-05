import { weapons } from "../weapons";
import { Container } from "../modules/data";
import { user } from "../user";
import { gui } from "../modules/gui";
import { phone } from "../phone";
import { methods } from "../modules/methods";

mp.events.add('entityStreamOut', (entity:PlayerMp) => {
	if(entity.type != "player") return;
	if (!entity.__attachmentObjects) return;
	for(let id in entity.__attachmentObjects){
		entity.__attachmentObjects[id].destroy();
		delete entity.__attachmentObjects[id];
	}
});

const attachmentMngr = {
	attachments:<{
		[name:string]:any
	}>{},
	addFor: function(entity:PlayerMp, id:number)
	{
		if(attachmentMngr.attachments.hasOwnProperty(id))
		{
			if(!entity.__attachmentObjects) entity.__attachmentObjects = {}
			if(!entity.__attachmentObjects.hasOwnProperty(id))
			{
				let attInfo = attachmentMngr.attachments[id];
				
				let object = mp.objects.new(attInfo.model, entity.position);
				
				object.attachTo(entity.handle,
					(typeof(attInfo.boneName) === 'string') ? entity.getBoneIndexByName(attInfo.boneName) : entity.getBoneIndex(attInfo.boneName),
					attInfo.offset.x, attInfo.offset.y, attInfo.offset.z, 
					attInfo.rotation.x, attInfo.rotation.y, attInfo.rotation.z, 
					false, false, false, false, 2, true);
					
				entity.__attachmentObjects[id] = object;
			}
		}
	},
	removeFor: function(entity:PlayerMp, id:number)
	{
		if(!entity.__attachmentObjects) entity.__attachmentObjects = {}
		if(entity.__attachmentObjects.hasOwnProperty(id))
		{
			let obj = entity.__attachmentObjects[id];
			delete entity.__attachmentObjects[id];
			
			if(mp.objects.exists(obj))
			{
				obj.destroy();
			}
		}
	},
	
	initFor: function(entity:PlayerMp)
	{
		if(!entity.__attachmentObjects) entity.__attachmentObjects = {}
		for(let attachment of entity.__attachments)
		{
			attachmentMngr.addFor(entity, attachment);
		}
	},
	
	shutdownFor: function(entity:PlayerMp)
	{
		if(!entity.__attachmentObjects) entity.__attachmentObjects = {}
		for(let attachment in entity.__attachmentObjects)
		{
      let id:number = <any> attachment;
			attachmentMngr.removeFor(entity, id);
		}
	},
	register: function(id:HashOrString, model:HashOrString, boneName:string|number, offset:Vector3Mp, rotation:Vector3Mp)
	{
		if(typeof(id) === 'string')
		{
			id = mp.game.joaat(id);
		}
		
		if(typeof(model) === 'string')
		{
			model = mp.game.joaat(model);
		}
		
		if(!attachmentMngr.attachments.hasOwnProperty(id))
		{
			if(mp.game.streaming.isModelInCdimage(model))
			{
				attachmentMngr.attachments[id] =
				{
					id: id,
					model: model,
					offset: offset,
					rotation: rotation,
					boneName: boneName
				};
			}	
		}
	},
	
	unregister: function(id:HashOrString) 
	{
		if(typeof(id) === 'string')
		{
			id = mp.game.joaat(id);
		}
		
		if(attachmentMngr.attachments.hasOwnProperty(id))
		{
			attachmentMngr.attachments[id] = undefined;
		}
	},
	
	addLocal: function(attachmentName:HashOrString)
	{
		if(typeof(attachmentName) == 'string') attachmentName = <number> mp.game.joaat(attachmentName);
		
		
		let entity = mp.players.local;
		if(!entity.__attachmentObjects) entity.__attachmentObjects = {}
		if(!entity.__attachments || entity.__attachments.indexOf(attachmentName) === -1)
		{
			mp.events.callRemote("staticAttachments.Add", attachmentName.toString(36));
		}
	},
	
	removeLocal: function(attachmentName:HashOrString)
	{
		if(typeof(attachmentName) === 'string')
		{
			attachmentName = <number> mp.game.joaat(attachmentName);
		}
		
		let entity = mp.players.local;
		if(!entity.__attachmentObjects) entity.__attachmentObjects = {}
		if(entity.__attachments && entity.__attachments.indexOf(attachmentName) !== -1)
		{
			mp.events.callRemote("staticAttachments.Remove", attachmentName.toString(36));
		}
	},
	removeLocalAll: function()
	{		
		let entity = mp.players.local;
		if(!entity.__attachmentObjects) entity.__attachmentObjects = {}
		if(entity.__attachments)
		{
			entity.__attachments.map(id => {
				mp.events.callRemote("staticAttachments.Remove", id.toString(36));
			})
		}
	},
	
	getAttachments: function()
	{
		return Object.assign({}, attachmentMngr.attachments);
	}
};

mp.events.add("entityStreamIn", (entity) =>
{
	if(entity.__attachments)
	{
		attachmentMngr.initFor(entity);
	}
});

mp.events.add("entityStreamOut", (entity) =>
{
	if(entity.__attachmentObjects)
	{
		attachmentMngr.shutdownFor(entity);
	}
});

mp.events.addDataHandler("attachmentsData", (entity:PlayerMp, data:string) =>
{
	let newAttachments = (data.length > 0) ? data.split('|').map(att => parseInt(att, 36)) : [];
	
	if(entity.handle !== 0)
	{
		let oldAttachments = entity.__attachments;	
		
		if(!oldAttachments)
		{
			oldAttachments = [];
			entity.__attachmentObjects = {};
		}
		
		// process outdated first
		for(let attachment of oldAttachments)
		{
			if(newAttachments.indexOf(attachment) === -1)
			{
				attachmentMngr.removeFor(entity, attachment);
			}
		}
		
		// then new attachments
		for(let attachment of newAttachments)
		{
			if(oldAttachments.indexOf(attachment) === -1)
			{
				attachmentMngr.addFor(entity, attachment);
			}
		}
	}
	
	entity.__attachments = newAttachments;
});

function InitAttachmentsOnJoin()
{
	mp.players.forEach(_player =>
	{
		let data = <string> _player.getVariable("attachmentsData");
		
		if(data && data.length > 0)
		{
			let atts = data.split('|').map(att => parseInt(att, 36));
			_player.__attachments = atts;
			_player.__attachmentObjects = {};
		}
	});
}

InitAttachmentsOnJoin();


function addMisc()
{
	attachmentMngr.register("mining", "prop_tool_jackham", 60309, new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0));
	attachmentMngr.register("drinking_1", "prop_ld_can_01", 28422, new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0));
	attachmentMngr.register("drinking_2", "prop_ecola_can", 28422, new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0));
	attachmentMngr.register("drinking_3", "prop_ld_flow_bottle", 28422, new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0));
	attachmentMngr.register("char_creator_1", "prop_beggers_sign_04", 28422, new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0));
	attachmentMngr.register("handcuff", "p_cs_cuffs_02_s", 28422, new mp.Vector3(-0.01, 0.06, -0.02), new mp.Vector3(62.0, -6.0, 66.0));
	attachmentMngr.register("phone", "prop_npc_phone_02", 28422, new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0));
	attachmentMngr.register("tablet", "hei_prop_dlc_tablet", 28422, new mp.Vector3(-0.09, -0.025, 0), new mp.Vector3(0, 90, 15));
}

function addWeapons()
{
	let weapons = 
	[
		[ "Pistol", 1467525553, 0 ],
		[ "VintagePistol", -1124046276, 0 ],
		[ "APPistol", 905830540, 0 ],
		[ "CombatPistol", 403140669, 0 ],
		[ "Revolver", 914615883, 0 ],
		[ "SNSPistol", 339962010, 0 ],
		[ "HeavyPistol", 1927398017, 0 ],
		[ "Pistol50", -178484015, 0 ],

		[ "CombatPDW", -1393014804, 1 ],
		[ "MicroSMG", -1056713654, 1 ],
		[ "SMG", -500057996, 1 ],
		[ "MiniSMG", -972823051, 1 ],
		[ "MachinePistol", -331545829, 1 ],
		[ "AssaultSMG", -473574177, 1 ],

		// [ "PumpShotgun", 689760839, 2 ],
		[ "HeavyShotgun", -1209868881, 2 ],
		[ "AssaultShotgun", 1255410010, 2 ],
		[ "BullpupShotgun", -1598212834, 2 ],

		[ "CarbineRifle", 1026431720, 3 ],
		[ "AssaultRifle", 273925117, 3 ],
		[ "SpecialCarbine", -1745643757, 3 ],
		// [ "MarksmanRifle", -1711248638, 3 ]	
		["CompactRifle", "w_ar_assaultrifle_smg", 1],   
	];
	
	let offset = new mp.Vector3(0.0, 0.0, 0.0);
	let rotation = new mp.Vector3(0.0, 0.0, 0.0);
	
	for(let weap of weapons)
	{
		let bone = 0;
		
		switch (weap[2])
		{
			case 0:
				bone = 51826; //"SKEL_R_Thigh";
				offset = new mp.Vector3(0.02, 0.06, 0.1);
				rotation = new mp.Vector3(-100.0, 0.0, 0.0);
				break;

			case 1:
				bone = 58271; //"SKEL_L_Thigh";
				offset = new mp.Vector3(0.08, 0.03, -0.1);
				rotation = new mp.Vector3(-80.77, 0.0, 0.0);
				break;

			case 2:
				bone = 24818; //"SKEL_Spine3";
				offset = new mp.Vector3(-0.1, -0.15, 0.11);
				rotation = new mp.Vector3(-180.0, 0.0, 0.0);
				break;

			case 3:
				bone = 24818; //"SKEL_Spine3";
				offset = new mp.Vector3(-0.1, -0.15, -0.13);
				rotation = new mp.Vector3(0.0, 0.0, 3.5);
				break;
		}
		
		// attachmentMngr.register(weap[0], weap[1], bone, offset, rotation);
		// attachmentMngr.register(weap[1], weap[1], bone, offset, rotation);
		let model = <string>weap[0];
		// attachmentMngr.register(model.toUpperCase(), mp.game.joaat("WEAPON_"+model.toUpperCase()), bone, offset, rotation);
		attachmentMngr.register(model.toUpperCase(), weap[1], bone, offset, rotation);
	}
	attachmentMngr.register("HAMMER".toUpperCase(), "prop_tool_hammer", 58271, new mp.Vector3(-0.0, -0.1, -0.1), new mp.Vector3(-120.0, -90.10, 0.0));
	attachmentMngr.register("BAT".toUpperCase(), "w_me_bat", 24818, new mp.Vector3(0.25, -0.15, -0.15), new mp.Vector3(0.0, 270.0, 0.0));
	attachmentMngr.register("CROWBAR".toUpperCase(), "w_me_crowbar", 58271, new mp.Vector3(-0.05, 0.0, -0.1), new mp.Vector3(-80.0, 90.10, 0.0));
	attachmentMngr.register("BATTLEAXE".toUpperCase(), "prop_tool_fireaxe", 24818, new mp.Vector3(0.25, -0.15, -0.05), new mp.Vector3(0.0, 270.0, 0.0));
	attachmentMngr.register("WRENCH".toUpperCase(), "w_me_hammer", 58271, new mp.Vector3(-0.01, 0.1, -0.1), new mp.Vector3(-80.0, 90.10, 0.0));
	attachmentMngr.register("PUMPSHOTGUN".toUpperCase(), "w_sg_pumpshotgun", 24818, new mp.Vector3(0.1, -0.15, 0.025), new mp.Vector3(0.0, 180.0, 0.0));
	attachmentMngr.register("SAWNOFFSHOTGUN".toUpperCase(), "w_sg_sawnoff", 24818, new mp.Vector3(0.0, -0.15, 0.1), new mp.Vector3(0.0, 180.0, 0.0));
	attachmentMngr.register("BULLPUPSHOTGUN".toUpperCase(), "w_sg_bullpupshotgun", 24818, new mp.Vector3(0.1, -0.2, 0.025), new mp.Vector3(0.0, 180.0, 0.0));
	attachmentMngr.register("MUSKET".toUpperCase(), "w_ar_musket", 11816, new mp.Vector3(0.2, 0.0, -0.25), new mp.Vector3(50.0, 210.0, 0.0));
	attachmentMngr.register("SNIPERRIFLE".toUpperCase(), "w_sr_sniperrifle", 24818, new mp.Vector3(-0.1, -0.2, 0.025), new mp.Vector3(0.0, 0.0, 0.0));
	attachmentMngr.register("MARKSMANRIFLE".toUpperCase(), "w_sr_marksmanrifle", 11816, new mp.Vector3(0.2, 0.0, -0.3), new mp.Vector3(50.0, 210.0, 0.0));
}
addWeapons()
addMisc()

let lastDimension = 0
let block = false;
setInterval(() => {
	if(!user.isLogin()) return;
	if (block) return;
	const player = mp.players.local;
	if (lastDimension != player.dimension){
		attachmentMngr.removeLocalAll();
		block = true;
		setTimeout(() => {
			block = true;
		}, 1000)
	}
	lastDimension = player.dimension;
	weapons.hashesMap.forEach((item) => {
		let hash = item[1] / 2;
		let have = mp.game.invoke("0x8DECB02F88F428BC", player.handle, hash, false) && !(mp.game.invoke("0x0A6DB4965674D243", player.handle) == hash);
		if(have) attachmentMngr.addLocal(item[0].toUpperCase());
		else attachmentMngr.removeLocal(item[0].toUpperCase());
	});	
	if (gui.currentGui == 'tablet' && !mp.players.local.vehicle) attachmentMngr.addLocal('tablet'), mp.game.invoke("0x0725a4ccfded9a70", mp.players.local.handle, 0, 1, 1, 1);
	else attachmentMngr.removeLocal('tablet');
	if (phone.isPhoneOpen() || mp.players.local.getVariable('call')) attachmentMngr.addLocal('phone'), mp.game.invoke("0x0725a4ccfded9a70", mp.players.local.handle, 0, 1, 1, 1);
	else attachmentMngr.removeLocal('phone');
	if (user.isCuff()) attachmentMngr.addLocal('handcuff')
	else attachmentMngr.removeLocal('handcuff');
}, 100)