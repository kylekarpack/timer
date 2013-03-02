"use strict";

var date = new Date(0, 0, 0, 0, 0, 0);
var timeArea;
var timer;

$(window).load(function() {
	util();
	$("#main").fitText(0.273);
	$("input.color-picker.bg").miniColors({change: function(hex, rgb) { 
		$('body').css("background", hex);
	}});
	$("input.color-picker.fg").miniColors({change: function(hex, rgb) { 
		$('body').css("color", hex);
		buttonColors(hex);		
	}});
	$("h1").fitText(2);
	$("#stop").attr('disabled', 'disabled');
	$("#pause").attr('disabled', 'disabled');
	timeArea = $("#main");
	$("#start").bind('click', startTimer);
	$("#stop").bind('click', stopTimer);
	$("#pause").bind('click', pauseTimer);
	$("#big").bind('click', function() {
		size(0);
	});
	$("#small").bind('click', function() {
		size(1);
	});
});

// Modifies the button colors
function buttonColors(color) {
	$('.button').css("background", color);
	$('.button[disabled]').css({"background": lighterColor(color, .5), "color": color});
}

// Display utilities
function util() {
	// set initial values
	var wid = $("#util").outerWidth();
	$("#util").css("left", -wid);
	
	// set tab functionality
	$("#utilTab").bind('click', function() {
		$(this).fadeOut();
		$("#util").show().animate({"left": 0},500,'swing')
	});
	
	// kill on clickout
	$("#wrapper").bind('click', function() {
		if (parseInt($("#util").css("left")) === 0) {
			$("#util").animate({"left": -wid},500,'swing')
			$("#utilTab").fadeIn("slow");	
		}
	});

	// kill on exit
	$("#util p").bind('click', function() {
		$("#util").animate({"left": -wid},500,'swing')
		$("#utilTab").fadeIn("slow");
	});
}

// Initiates the timer
function startTimer(event) {
	$("#start").attr('disabled', 'disabled');
	$("#stop").removeAttr('disabled').html('Stop');
	$("#pause").removeAttr('disabled');
	timer = setInterval(increment, 1000);
}

// Called each second to increment the timer, display it
function increment() {
	date.setSeconds(date.getSeconds() + 1);
	var seconds = date.getSeconds();
	if (seconds < 10) {
		seconds = "0" + seconds;	
	}
	timeArea[0].innerHTML = date.getMinutes() + ":" + seconds;
}

function stopTimer(event) {
	$("#start").removeAttr('disabled').html('Start');
	$("#stop").attr('disabled', 'disabled');
	$("#pause").attr('disabled', 'disabled');
	timeArea[0].innerHTML = "0:00";
	clearInterval(timer);
	date.setSeconds(0);
	date.setMinutes(0);
	$('#main').css("color", "");
}

function pauseTimer(event) {
	$("#stop").html('Clear');
	$("#pause").attr('disabled', 'disabled');
	$("#start").removeAttr('disabled');
	$("#start").html('Resume');
	window.clearTimeout(timer);
}

function size(toggle) {
	var cur = parseInt($("#main").css("fontSize"));
	if (toggle === 0) {
		cur += 15;
	} else {
		cur -= 15;
	}
	cur += "px";
	$("#main").animate({fontSize: cur}, 200);
}

var pad = function(num, totalChars) {
    var pad = '0';
    num = num + '';
    while (num.length < totalChars) {
        num = pad + num;
    }
    return num;
};

// Ratio is between 0 and 1
var changeColor = function(color, ratio, darker) {
    // Trim trailing/leading whitespace
    color = color.replace(/^\s*|\s*$/, '');

    // Expand three-digit hex
    color = color.replace(
        /^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i,
        '#$1$1$2$2$3$3'
    );

    // Calculate ratio
    var difference = Math.round(ratio * 256) * (darker ? -1 : 1),
        // Determine if input is RGB(A)
        rgb = color.match(new RegExp('^rgba?\\(\\s*' +
            '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
            '\\s*,\\s*' +
            '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
            '\\s*,\\s*' +
            '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
            '(?:\\s*,\\s*' +
            '(0|1|0?\\.\\d+))?' +
            '\\s*\\)$'
        , 'i')),
        alpha = !!rgb && rgb[4] != null ? rgb[4] : null,

        // Convert hex to decimal
        decimal = !!rgb? [rgb[1], rgb[2], rgb[3]] : color.replace(
            /^#?([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])/i,
            function() {
                return parseInt(arguments[1], 16) + ',' +
                    parseInt(arguments[2], 16) + ',' +
                    parseInt(arguments[3], 16);
            }
        ).split(/,/),
        returnValue;

    // Return RGB(A)
    return !!rgb ?
        'rgb' + (alpha !== null ? 'a' : '') + '(' +
            Math[darker ? 'max' : 'min'](
                parseInt(decimal[0], 10) + difference, darker ? 0 : 255
            ) + ', ' +
            Math[darker ? 'max' : 'min'](
                parseInt(decimal[1], 10) + difference, darker ? 0 : 255
            ) + ', ' +
            Math[darker ? 'max' : 'min'](
                parseInt(decimal[2], 10) + difference, darker ? 0 : 255
            ) +
            (alpha !== null ? ', ' + alpha : '') +
            ')' :
        // Return hex
        [
            '#',
            pad(Math[darker ? 'max' : 'min'](
                parseInt(decimal[0], 10) + difference, darker ? 0 : 255
            ).toString(16), 2),
            pad(Math[darker ? 'max' : 'min'](
                parseInt(decimal[1], 10) + difference, darker ? 0 : 255
            ).toString(16), 2),
            pad(Math[darker ? 'max' : 'min'](
                parseInt(decimal[2], 10) + difference, darker ? 0 : 255
            ).toString(16), 2)
        ].join('');
};
var lighterColor = function(color, ratio) {
    return changeColor(color, ratio, false);
};
var darkerColor = function(color, ratio) {
    return changeColor(color, ratio, true);
};