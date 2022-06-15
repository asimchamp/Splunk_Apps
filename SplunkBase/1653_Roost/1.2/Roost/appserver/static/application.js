function addClassValue(elem, val) {
	var className = "";
	switch (true){ 
		case (val == "Yes"): className = "yes"; break;
		case (val == "No") : className = "no"; break;
		case (val < 60) : className = "low"; break;
		case (val >59 && val < 80) : className = "elevated"; break;
		case (val > 79): className = "critical"; break;
	}
	$(elem).addClass(className);
}

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}
