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
		console.log('trying to set the right settings values now - listening on load in someInputs');
        select1 = document.getElementById('select1');
        select2 = document.getElementById('select2');
		select3 = document.getElementById('select3');
		
        loadStorage();
        app.updateInputs();
    })

    app.updateInputs = function () {
		console.log('trying to app.updateInputs');
        select1_value = select1.value;
        select2_value = select2.value;
		select3_value = select3.value;
	
        updateStorage();
    }

    function loadStorage() {
        select1_value = setSelectByValue(select1, localStorage.getItem('initialCacheLoad'));
        select2_value = setSelectByValue(select2, localStorage.getItem('units'));
        select3_value = setSelectByValue(select3, localStorage.getItem('coorRep'));				
    }

    function updateStorage() {
		
        localStorage.setItem('initialCacheLoad', select1_value);
        localStorage.setItem('units', select2_value);
		localStorage.setItem('coorRep', select3_value);

		myUnits = select2_value;	
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
