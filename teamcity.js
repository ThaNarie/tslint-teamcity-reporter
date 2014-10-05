var path = require('path');

var options = {style: 'ansi'};
// copied colors from color.js
var colorWrap = {
	//grayscale
	'white': ['\033[37m', '\033[39m'],
	'grey': ['\033[90m', '\033[39m'],
	'black': ['\033[30m', '\033[39m'],
	//colors
	'blue': ['\033[34m', '\033[39m'],
	'cyan': ['\033[36m', '\033[39m'],
	'green': ['\033[32m', '\033[39m'],
	'magenta': ['\033[35m', '\033[39m'],
	'red': ['\033[31m', '\033[39m'],
	'yellow': ['\033[33m', '\033[39m']
};
var wrapStyle = function (str, color) {
	str = '' + str;
	if (options.style === 'ansi' && colorWrap.hasOwnProperty(color)) {
		var arr = colorWrap[color];
		return arr[0] + str + arr[1];
	}
	return str;
};
/*jshint -W098 */
var warn = function (str) {
	return wrapStyle(str, 'yellow');
};
var fail = function (str) {
	return wrapStyle(str, 'red');
};
var ok = function (str) {
	return wrapStyle(str, 'green');
};
var accent = function (str) {
	return wrapStyle(str, 'bold');
};
var writeln = function (str) {
	if (arguments.length === 0) {
		str = '';
	}
	console.log(str);
};

function escapeTeamcityString(message) {
	if (!message) {
		return "";
	}

	return message.replace(/\|/g, "||")
		.replace(/\'/g, "|\'")
		.replace(/\n/g, "|n")
		.replace(/\r/g, "|r")
		.replace(/\u0085/g, "|x")
		.replace(/\u2028/g, "|l")
		.replace(/\u2029/g, "|p")
		.replace(/\[/g, "|[")
		.replace(/\]/g, "|]");
}

var hasProp = Object.prototype.hasOwnProperty;

function repeat(len, str) {
	var ret = '';
	while (ret.length < len) {
		ret += str;
	}
	return ret;
}

function TSHintTeamcityFormatter() {

}
TSHintTeamcityFormatter.prototype = Object.create({
	name: 'tslint-teamcity-reporter',
	getName: function () {
		return this.name;
	},
	format: function (failures) {

		var files = {};
		var data = [];
		var output = [];

		var codeMaxLen = 0;

		failures.forEach(function (failure) {
			var fileName = failure.getFileName();
			var res;
			if (hasProp.call(files, fileName)) {
				res = files[fileName];
			}
			else {
				files[fileName] = res = {
					file: failure.getFileName(),
					errors: []
				};
				data.push(res);
			}
			var lineAndCharacter = failure.getStartPosition().getLineAndCharacter();
			var item = {
				reason: failure.getFailure(),
				line: lineAndCharacter.line() + 1,
				character: lineAndCharacter.character() + 1,
				code: (failure.getRuleName ? failure.getRuleName() : '')
			};
			res.errors.push(item);
			codeMaxLen = item.code ? Math.max(item.code.length, codeMaxLen) : codeMaxLen;
		});

		var fileCount = data.length;
		var errorCount = 0;
		var i = 0;



		data.forEach(function (res) {
			i++;
			var errors = res.errors;
			var file;
			if (res.file) {
				file = path.resolve(res.file);
			}
			if (!file) {
				file = '<unknown file>';
			}
			var head = 'File \'' + res.file + '\'';
			if (!errors || errors.length === 0) {
				//writeln(ok('>> ') + head + ' ' + ok('OK') + (i === fileCount ? '\n' : ''));
			} else {

				var suite = "TSLint: " + res.file;
				output.push("##teamcity[testSuiteStarted name='" + suite + "']");


				errorCount += errors.length;
				errors.sort(function (a, b) {
					if (a && !b) {
						return -1;
					}
					else if (!a && b) {
						return 1;
					}
					if (a.line < b.line) {
						return -1;
					}
					else if (a.line > b.line) {
						return 1;
					}
					if (a.character < b.character) {
						return -1;
					}
					else if (a.character > b.character) {
						return 1;
					}
					return 0;
				});

				errors.forEach(function (err) {
					if (!err) {
						return;
					}

					var errorObj = {
						name: escapeTeamcityString(res.file + ": line " + err.line + ", col " + err.character + ", " + err.reason),
						message: escapeTeamcityString(err.code + ": " + err.reason),
						detailed: escapeTeamcityString(err.evidence)
					};


					output.push("##teamcity[testStarted name='" + errorObj.name + "']");
					output.push("##teamcity[testFailed name='" + errorObj.name + "' message='" + errorObj.message + "' detailed='" + errorObj.detailed + "']");
					output.push("##teamcity[testFinished name='" + errorObj.name + "']");

				});
				output.push("##teamcity[testSuiteFinished name='" + suite + "']");
				writeln('');
			}
		});

		if (errorCount === 0) {
			// If there were no output, tell TeamCity that tests ran successfully
			output.push("##teamcity[testStarted name='TSLint']");
			output.push("##teamcity[testFinished name='TSLint']");
		}

		return output.join("\n");
	}
});
module.exports = {
	Formatter: TSHintTeamcityFormatter,
	options: options,
	color: function (enable) {
		options.style = enable ? 'ansi' : false;
	}
};