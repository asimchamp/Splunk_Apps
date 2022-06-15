require(['jquery'],
    function($){

    $('#downloadLink').click(function(){
            console.log('Clicked!')
            downloadInnerHtml('ip_intel.txt', 'dataWrapper','text/plain');
    });

    function downloadInnerHtml(filename, elId, mimeType) {
        //var elHtml = document.getElementById(elId).innerHTML;
        var link = document.createElement('a');
        mimeType = mimeType || 'text/plain';
        var elHtml;
        $('table').each(function(index, value) {
            $(this).find('th>a').each(function() {
                line = $(this).text().trim() + ':\n';
                elHtml += line;
            });
            $(this).find('td').each(function() {
                elHtml += $(this).text().trim() + '\n';
            });
        });

		if(elHtml !== undefined) {
        	var first_line = elHtml.split('\n')[0];
        	console.log('first line: ', first_line);
        	console.log('elHtml: ', elHtml);
        	var newHtml = elHtml.replace(first_line, "Geographic Location:")

        	//link.setAttribute('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(newHtml));
        	blob = new Blob([newHtml], { type : 'text/plain' })
        	link.setAttribute('href', URL.createObjectURL(blob))
        	link.setAttribute('download', filename);
        	link.click();
        }
    }

    var fileName =  'ip_intel.txt'; // You can use the .txt extension if you want

});
