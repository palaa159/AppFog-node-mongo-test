var scrWidth = window.innerWidth,
	scrHeight = window.innerHeight,
	faceSize = scrWidth / 8;
var paper = Raphael("faceRender", scrWidth, scrHeight);
window.onload = function() {
	bodyChange();
};

var faceData;
var faceArray = [];
socket.emit('req data');
socket.on('req result', function(data) {
	faceData = data;
	console.log(faceData);
	$.each(faceData, function(index, value) {
		faceArray[index] = paper.image('https://singyourface.s3.amazonaws.com/images/' + value.id + '.png', index*faceSize, 0, faceSize, faceSize);
	});
	// add mouse event
	$.each(faceArray, function(index, value) {
		faceArray[index].mouseover(function(e){
			// pixel8
			var imageData = faceArray[index].getImageData();
		});
	});
	
});
// Resizing handler

function bodyChange() {
	$('body').css({
		'width': scrWidth,
		'height': scrHeight
	});
	// translate facedata
}
window.addEventListener('resize', onResize, false);

function onResize() {
	scrWidth = window.innerWidth, scrHeight = window.innerHeight;
	faceSize = scrWidth / 8;
	bodyChange();
}