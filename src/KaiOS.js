(function (app) {
	//input mapping
	document.addEventListener('keydown', handleKeydown);
	document.addEventListener('keyup', handleKeyup);

	var keyOverlay = document.getElementById('keyOverlay');
	var overlayTimeout;

	function handleKeydown(e) {


		switch (e.key) {
			case 'Backspace':
				e.preventDefault(); // prevent the app from closing
				break;
		}
	}

	function handleKeyup(e) {
		//console.log(`${e.key}`);
		switch (e.key) {
			case 'ArrowUp':
				app.keyCallback.dUp();
				break;
			case 'ArrowDown':
				app.keyCallback.dDown();
				break;
			case 'ArrowLeft':
				app.keyCallback.dLeft();
				break;
			case 'ArrowRight':
				app.keyCallback.dRight();
				break;
			case 'SoftLeft':
			case 'Control': /* use on PC */
				app.keyCallback.softLeft();
				break;
			case 'SoftRight':
			case 'Alt': /* use on PC */
				app.keyCallback.softRight();
				break;
			case 'Enter':
				app.keyCallback.enter();
				break;
			case 'ContextMenu':
				app.keyCallback.menu();
				break;
			case 'Backspace':
				app.keyCallback.back();
				break;
			case 'EndCall':
				app.keyCallback.quit();
				break;
			case 'Call':
				app.keyCallback.refreshCacheList();
				break;
			case '1':
				//app.keyCallback.ZoomOut();
				app.newKeyCallback.push1();
				break;
			case '2':
				//app.keyCallback.ScrollTop();
				//app.keyCallback.ShowMapCoords();
				//app.keyCallback.ToggleUnits();
				//app.keyCallback.ShowSettings();
				app.newKeyCallback.push2();
				break;
			case '3':
				//app.keyCallback.ZoomIn();
				app.newKeyCallback.push3();
				break;
			case '4':
				//app.keyCallback.ShowCacheList();
				app.newKeyCallback.push4();
				break;
			case '5':
				//app.keyCallback.FocusOnCache();
				app.newKeyCallback.push5();
				break;
			case '6':
				//app.keyCallback.ShowMap();
				app.newKeyCallback.push6();
				break;
			case '7':
				//app.keyCallback.ShowDetails();
				app.newKeyCallback.push7();
				break;
			case '8':
				//app.keyCallback.MapAllCaches();
				app.newKeyCallback.push8();
				break;	
			case '9':
				//app.keyCallback.ShowCompass();
				app.newKeyCallback.push9();
				break;
			case '*':
				//app.keyCallback.ShowLogs();
				app.newKeyCallback.pushAsterisk();
				break;
			case '0':
				//app.keyCallback.ShowGallery();
				app.newKeyCallback.push0();
				break;
			case '#':
				//app.keyCallback.LogCache();
							case '0':
				//app.keyCallback.ShowGallery();
				app.newKeyCallback.pushSharp();
				break;


			default:
				app.keyCallback.other(e.key);
		}
	}

	

	return app;
}(MODULE));
