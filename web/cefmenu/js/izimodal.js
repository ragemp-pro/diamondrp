function shownoty(text, type = "", time = 5000, progressBar = false, icon = '') {
	time = parseInt(time);
	if(isNaN(time) || time <= 10) time = 5000;
	let data = {
		message: text,
		id: type,
		timeout: parseInt(time),
		progressBar: progressBar,
		theme: 'light',
		iconUrl: icon,
		iconText: '',
		layout: 2,
		iconColor: '',
		position: "bottomCenter",
		animateInside: true,
		drag: true,
		pauseOnHover: true,
		resetOnHover: true,
		transitionIn: 'fadeInUp',
		transitionOut: 'fadeOut',
		transitionInMobile: 'fadeInUp',
		transitionOutMobile: 'fadeOutDown',
	};
	if (type == "") data.theme = "dark";

	if (type == "info") iziToast.info(data)
	else if (type == "success") iziToast.success(data)
	else if (type == "warning") iziToast.warning(data)
	else if (type == "error") iziToast.error(data)
	else iziToast.show(data);



}



function getRGB(str){
  var match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
  return match ? {
    r: match[1],
    g: match[2],
    b: match[3]
  } : {};
}



let rndids = 1;
function textInput(title, text, inp = 'text', type = "", butdata = null) {
	rndids++;
	textInputs = 'on';
	let result = text;

	let buttons = [
		['<button><font color="#00FF3C">Да</font></button>', function(instance, toast) {
			instance.hide({
				transitionOut: 'fadeOutUp',
			}, toast, 'Да');
		}],
		['<button><font color="#FF0011">Отмена</font></button>', function(instance, toast) {
			instance.hide({
				transitionOut: 'fadeOutUp',
			}, toast, 'buttonName');
		}]
	];

	let inputs = [['<input type="' + inp + '" value="' + text + '">', 'keyup', function(instance, toast, input, e) {
		result = input.value;
	}, true]];

	if(inp == 'float'){
		inputs = [['<input type="number" value="' + text + '" step="0.1">', 'keyup', function(instance, toast, input, e) {
			result = input.value;
		}, true]];
	}

	if (inp == "textarea") {
		inputs = [['<textarea style="height: 172px;width: 447px;">' + text + '</textarea><br/>', 'keyup', function(instance, toast, input, e) {
			result = input.value;
		}, true]];
	}

	if (inp == "color") {
		inputs = [['<input type="text" data-format="rgb" value="rgb(0, 0, 0)" id="'+rndids+'" style="width: 173px;height: 35px;">', 'keyup', function() {}, true]];
	}

	if (inp == "buttons") {
		inputs = [];
		buttons = [];
		butdata = JSON.parse(butdata);
		butdata.forEach(function(data){
			buttons.push(['<button>'+data+'</button>', function(instance, toast) {
				instance.hide({
					transitionOut: 'fadeOutUp',
				}, toast, data);
			}])
		})
		buttons.push(['<button><font color="#FF0011">Отмена</font></button>', function(instance, toast) {
			instance.hide({
				transitionOut: 'fadeOutUp',
			}, toast, 'Отмена');
		}])
	}



	let data = {
		theme: 'dark',
		drag: false,
		progressBarColor: 'rgb(0, 255, 184)',
		overlay: true,
		pauseOnHover: false,
		timeout: false,
		layout: 2,
		title: title,
    close: false,
    closeOnEscape: true,
    closeOnClick: false,
		position: 'bottomCenter',
		inputs: inputs,
		buttons: buttons,
		onClosing: function(instance, toast, closedBy) {
			//console.info('closedBy: ' + closedBy); // tells if it was closed by 'drag' or 'button'
			let answer = true;
			if (inp == "buttons") {
				if(butdata.indexOf(closedBy) != -1){
					answer = true;
					result = closedBy;
				} else {
					answer = false;
				}
			} else {
				if (closedBy != "Да") {
					answer = false;
				}
			}

			mp.trigger('textInputResult', answer, result);
			textInputs = 'off';
		}
	};




	if (type == "info") iziToast.info(data)
	else if (type == "success") iziToast.success(data)
	else if (type == "warning") iziToast.warning(data)
	else if (type == "error") iziToast.error(data)
	else iziToast.show(data);

	$("#"+rndids).minicolors({
		control: $(this).attr('data-control') || 'rgb',
		defaultValue: $(this).attr('data-defaultValue') || '',
		format: $(this).attr('data-format') || 'rgb',
		keywords: $(this).attr('data-keywords') || '',
		inline: $(this).attr('data-inline') === 'true',
		letterCase: $(this).attr('data-letterCase') || 'lowercase',
		opacity: $(this).attr('data-opacity'),
		position: $(this).attr('data-position') || 'top',
		swatches: $(this).attr('data-swatches') ? $(this).attr('data-swatches').split('|') : [],
		change: function(value, opacity) {
			if( !value ) return;
			result = JSON.stringify(getRGB(value));
			console.log(result);
		},
		theme: 'bootstrap'
        });

}




function request(id, text, type = "", timeout = false) {
	if(timeout !== false && timeout !== true){
		timeout = parseInt(timeout);
		if(isNaN(timeout) || timeout <= 10) timeout = 5000;
	}
	let data = {
		progressBar: true,
		theme: 'light',
		drag: true,
		progressBarColor: 'rgb(0, 255, 184)',
		overlay: false,
		layout: 2,
		close: false,
		pauseOnHover: false,
		timeout: timeout,
		message: text,
		position: 'topCenter',
		buttons: [
			['<button><b>Да</b></button>', function(instance, toast) {
				instance.hide({
					transitionOut: 'fadeOutUp',
				}, toast, 'Да');
			}],
			['<button><b>Нет</b></button>', function(instance, toast) {
				instance.hide({
					transitionOut: 'fadeOutUp',
				}, toast, 'buttonName');
			}]
		],
		onClosing: function(instance, toast, closedBy) {
			console.info('closedBy: ' + closedBy); // tells if it was closed by 'drag' or 'button'

			let answer = true;
			if (closedBy != "Да") {
				answer = false;
			}
			mp.trigger("requestResult", id, answer);
		}
	};


	if (type == "") data.theme = "dark";

	if (type == "info") iziToast.info(data)
	else if (type == "success") iziToast.success(data)
	else if (type == "warning") iziToast.warning(data)
	else if (type == "error") iziToast.error(data)
	else iziToast.show(data);


}
