var JavaScriptObfuscator = require('javascript-obfuscator');

const fs = require('fs');

fs.readFile('./client_packages/client/index.js', (err, data) => {
	if (err) {
		console.error(err);
		return;
	}
	var obfuscationResult = JavaScriptObfuscator.obfuscate(data, {
		compact: true,
		controlFlowFlattening: true
	});
	let code = obfuscationResult.getObfuscatedCode();
	
	fs.writeFile('./client_packages/client/index.js', obfuscationResult.getObfuscatedCode(), (err) => {
		if (err) console.log(err);
		else console.log('Obfuscate code end...');
	});

});
