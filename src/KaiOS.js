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

	// display ad when app is loaded

	// the escape key will dismiss the ad on the PC 
	// on the device or simulator press left soft key
	var fullscreenAd = true; /* switch between fullscreen and responsive ad */
	var testMode = 0; /* set to 0 for real ads */

	document.addEventListener("DOMContentLoaded", () => {
		var adContainer;
		var adMaxHeight;
		var adMaxWidth;
		var adTabIndex;

		if (!fullscreenAd) {
			adContainer = document.getElementById('ad-container');
			adMaxHeight = 60;
			adMaxWidth = 224;
			adTabIndex = 50; /* last item on the main menu, in this example */
		}

		try {
			// display ad
			getKaiAd({
				publisher: '07b4b80f-0c30-4a81-9d5c-ef57389db951',
				app: 'Caching-on-Kai',
				test: testMode,
				/* only for responsive ads */
				h: adMaxHeight,
				w: adMaxWidth,
				container: adContainer,
				/* up to here */

				/* error codes */
				/* https://www.kaiads.com/publishers/sdk.html#error */
				onerror: err => console.error('KaiAds error catch:', err),
				onready: ad => {
					ad.call('display', {
						tabindex: adTabIndex,
						navClass: 'navItem',
						display: 'block'
					})

					ad.on('click', () => console.log('ad clicked'))
					ad.on('close', closeAd)
					ad.on('display', displayAd)

				}
			});
		} catch (e) {
			var message = 'KaiAds not available: https://www.kaiads.com/publishers/sdk.html';
			console.log(message);
			if (!fullscreenAd) {
				adContainer.innerText = message;
			}
		}
	});

	function displayAd() {
		console.log('ad displayed');
		if (fullscreenAd) {
			app.fullAdVisible = true;
		}
		/* do something, like pause the app */
	}

	function closeAd() {
		console.log('ad closed')
		if (fullscreenAd) {
			setTimeout(function () {
				app.fullAdVisible = false;
				app.activeNavItem.focus();
			}, 200); /* delayed to avoid background button execution */
		}
	}

	return app;
}(MODULE));
