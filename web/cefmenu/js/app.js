var onclose = false;
var a = new Vue({
	el: '#container',
	data: {
		menu: new PopupMenu("", "", [])
	}
});
$("#container").draggable();
var textInputs = 'off';
var menuid = 0;




function closeMenu(trigger = false) {
	$("#container").hide(250, function(){
		a.menu.items = [];
		a.menu.index = 0
		if (trigger) {
			mp.trigger("menuDestroy");
		}
	});
}


function changeNameMenu(id, text) {
	a.menu.items[id].key = text;
}


function changeMoreMenu(id, text) {
	a.menu.items[id].value = text;
}

function changeDescMenu(id, text) {
	a.menu.items[id].help = text;
}


function openMenu(data, ids) {
	menuid = ids



	data = JSON.parse(data)
	let items = [];
	let stats = [];
	let val = [];
	data.items.forEach(
		(item, id) => {
			val[id] = 0;

			let basicItem;

			if (item.type == "list"){
				basicItem = new MenuItem(item.name, item.list, item.desc).Click(function() {
					mp.trigger("menuChoice", id, val[id]);
				}).SelectionChanged(function(index, name) {
					val[id] = index;
					mp.trigger("menuChange", id, val[id]);
				})
			} else {
				basicItem = new MenuItem(item.name, item.more, item.desc).Click(function() {
					mp.trigger("menuChoice", id, val[id]);
				});
			}
			if (typeof item.color !== "undefined") basicItem = basicItem.Style(item.color);
			//console.log(item)
			if (item.onmoveyes) {
				//console.log("MOVE YES")
				//console.log("MOVE YES")
				//console.log("MOVE YES")
				basicItem = basicItem.MoveUP(function(index, name) {
					//console.log("MoveUP")
					mp.trigger("menuMove", id, "up");
				})
				basicItem = basicItem.MoveDOWN(function(index, name) {
					//console.log("MoveDown")
					mp.trigger("menuMove", id, "down");
				})
			}
			items.push(basicItem);

		}
	);
	if (data.items.length == 0) {
		items.push(new MenuItem("Пусто", "", ""))
	}
	if (data.stats != null) {
		data.stats.forEach(
			(item) => {
				stats.push(new MenuStatItem(item.name, item.value, item.del))
			}
		);
	}

	if (data.onclose != null) {
		onclose = true;
	}
	setTimeout(function(){
		a.menu.title = data.title;
		a.menu.subtitle = data.description;
		a.menu.items = items
		a.menu.items.forEach(function(qwe, ertt) {
			if (ertt > 6) qwe.visible = false;
		})
		a.menu.index = 0

		if (data.items.length > 0 && data.items[0].desc) a.help = data.items[0].desc;
		else a.help = null;
	}, 50)


	$("#container").show(250)
}


window.addEventListener('keyup', function(e) {
	if (a.menu.items.length == 0) return;
	if (e.keyCode == 8) {
		if (textInputs == 'on') return;
		window.closeMenu(true);
	}
	return false;
});
