(function (app) {
    var select1;
    var select1_value;
    var select2;
    var select2_value;
    var select3;
    var select3_value;
    var select4;
    var select4_value;
    var select5;
    var select5_value;	
    var input1;
    var input1_value;	

    window.addEventListener("load", function () {
        select1 = document.getElementById('initialLocation');
        select2 = document.getElementById('initialCacheLoad');
        select3 = document.getElementById('displayUnits');
        select4 = document.getElementById('saveTravelDistance');
		select5 = document.getElementById('coorRep');
        input1 = document.getElementById('input1');		
        loadStorage();
        app.updateInputs();
    })

    app.updateInputs = function () {
        select1_value = select1.value;
        select2_value = select2.value;
        select3_value = select3.value;
		select4_value = select4.value;
		select5_value = select5.value;
        input1_value = input1.value;		
        updateStorage();
    }

    function loadStorage() {
        select1_value = setSelectByValue(select1, localStorage.getItem('initialLocation'));
        select2_value = setSelectByValue(select2, localStorage.getItem('initialCacheLoad'));
        select3_value = setSelectByValue(select3, localStorage.getItem('units'));
        select4_value = setSelectByValue(select4, localStorage.getItem('saveTravelDistance'));
        select5_value = setSelectByValue(select5, localStorage.getItem('coorRep'));		
        input1_value = setInput(input1, localStorage.getItem('input1'));		
    }

    function updateStorage() {
		
		localStorage.setItem('input1', input1_value);
	    localStorage.setItem('initialLocation', select1_value);
        localStorage.setItem('initialCacheLoad', select2_value);
        localStorage.setItem('units', select3_value);

		if(select4_value == "noClear") {
			localStorage.setItem('myTravelDistance',0);
			localStorage.setItem('saveTravelDistance', "no");
			app.saveTravelDistance = "no"
			app.myTravelDistance = 0;	
			var tmpDisplayDistanceTraveled = document.getElementById("TravelDistance");			
			tmpDisplayDistanceTraveled.innerHTML = "not calculated";		
		} else {
			localStorage.setItem('saveTravelDistance', select4_value);
			app.saveTravelDistance = select4_value;
		}	
		
		var oldMyUnits = myUnits;
		myUnits = select3_value;
		if(oldMyUnits !== myUnits) {
			if(oldMyUnits == "mi") {
				app.myTravelDistance = app.myTravelDistance * 0.3048;
			} else {
				app.myTravelDistance = app.myTravelDistance * 3.281;				
			}
		}
		// update save distance if units changed
		localStorage.setItem('coorRep', select5_value);
		
		//console.log(`Units are now ${select2_value} and stored as ${localStorage.getItem('units')} and myUnits are ${myUnits}`);		
    }

    function setSelectByValue(element, value) {
        var elementValue;
        if (value == null) {
            elementValue = element.value;
        } else {
            elementValue = value;
        }
        var options = element.getElementsByTagName('OPTION');
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == elementValue) {
                options[i].selected = true;
                return options[i].value;
            }
        }
    }

    function setInput(element, value) {
        var elementValue;
        if (value == null) {
            elementValue = element.value;
        } else {
            elementValue = value;
        }
        element.value = elementValue;
    }

    return app;
}(MODULE));
