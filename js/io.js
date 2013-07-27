function hasGetUserMedia() {
	// Note: Opera is unprefixed.
	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}
if (hasGetUserMedia()) {
	//
} else {
	alert('getUserMedia() is not supported in your browser');
}
var onFailSoHard = function(e) {
		console.log('Reeeejected!', e);
	};
window.URL = window.URL || window.webkitURL;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
var video = document.querySelector('video');
function shoot() {
if (navigator.getUserMedia) {
	navigator.getUserMedia({
		video: true
	}, function(stream) {
		video.src = window.URL.createObjectURL(stream);
	}, onFailSoHard);
} else {
	video.src = 'somevideo.webm'; // fallback.
}
}

shoot();

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var localMediaStream = null;
	ctx.translate(320, 0);
    ctx.scale(-1, 1);
var upload_image;
function snapshot() {
    ctx.drawImage(video, 30, 0, 320, 240);
    // "image/webp" works in Chrome 18. In other browsers, this will fall back to image/png.
    upload_image = canvas.toDataURL('image/png');
    document.querySelector('img').src = upload_image;
}
/// Press Spacebar to shoot
$(document).keypress(function(e) {
	if(e.which == 32) {
	e.preventDefault();
	snapshot();
	video.pause();
	video.src="";
	// hide video, show result
	$('#video').css({
		'display': 'none'
	});
	$('#result').fadeIn();
	$('.infoShoot').fadeOut();
	$('#retake').fadeIn();
	
	socket.emit('file upload', upload_image);
	}
});

/// Retake 
$('#retake').click(function() {
	$('#retake').fadeOut();
	shoot();
	$('.infoShoot').fadeIn();
	$('#result').fadeIn();
	$('#video').fadeIn();
});

/// final upload
// check with mongo

socket.on('upload success', function(data) {
	console.log(data.msg + ", URL: " + data.imgurl);
});