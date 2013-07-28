var scrWidth = window.innerWidth,
	scrHeight = window.innerHeight,
	faceSize = scrWidth / 8;
var canvas = new Kinetic.Stage({
        container: 'faceRender',
        width: scrWidth,
        height: scrHeight
      }),
      layer = new Kinetic.Layer();
var context = layer.getCanvas().getContext('2d');
window.onload = function() {
	bodyChange();
};

var faceData;
var faceArray = [];
var facePixel8Array = [];
socket.emit('req data');
socket.on('req result', function(data) {
	faceData = data;
	console.log(faceData);
	// display facedata
	$.each(faceData, function(index, value) {
		var imgObj = new Image();
		imgObj.src = 'https://s3.amazonaws.com/singyourface/images/' + value.id + '.png';
		imgObj.onload = function() {
        faceArray[index] = new Kinetic.Image({
          x: index*faceSize,
          y: 0,
          image: imgObj,
          width: faceSize,
          height: faceSize
        });
        // bind mouse event
		faceArray[index].on('mouseover', function() {
			
		});
        // add to layer
        layer.add(faceArray[index]);
        // add to stage
		canvas.add(layer);
		canvas.toDataURL({
			callback: function(a) {
				facePixel8Array[index] = context.getImageData(0,0,10,10);
			}
		});
		};
	});
});
// Resizing handler

function bodyChange() {
	$('body').css({
		'width': scrWidth,
		'height': scrHeight
	});
}
window.addEventListener('resize', onResize, false);

function onResize() {
	scrWidth = window.innerWidth, scrHeight = window.innerHeight;
	faceSize = scrWidth / 8;
	bodyChange();
}