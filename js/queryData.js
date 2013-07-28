socket.emit('req data');
socket.on('req result', function(data) {
	console.log(data);
	$.each(data, function(index, value) {
		$('#faceForClone')
		.clone()
		.attr('title', value.publicOk)
		.attr('id', value.id)
		.attr('src', 'https://singyourface.s3.amazonaws.com/images/' + value.id + '.png')
		.appendTo('#faceGrid');
	});
});