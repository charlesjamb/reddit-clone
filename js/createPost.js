(function(){

	$('#suggestTitle').click(function() {
		let userLink = 'http://www.decodemtl.com'

		$.ajax('/suggesttile')
			.done(function() {
				console.log('ajax done');
				// $('#url').val(requestedPageTitle);
			})

	});

})();