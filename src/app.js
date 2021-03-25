//global module
var MODULE = (function () {

var app = {};
// use the custom module namespace 'app' for all variables and functions you need to access through other scripts
app.views = new Array();
app.activeNavItem = null;
app.currentView = null;
app.currentViewID = 0;
app.currentViewName = '';
app.prevViewId = 0;
app.prevViewId2 = 0;
app.currentNavId = 0;
app.navItems = new Array();

app.leftSoftButton = "MapView";
app.optionEnabled = false;
app.fullAdVisible = false;

app.optionButtonAction = '';

app.myUnits = localStorage.getItem('units');


app.backArray = new Array();

app.myTravelDistance = 0;

app.saveTravelDistance = "yes";

//var displayDistanceTraveled = document.getElementById("TravelDistance");

var following = false;

app.backButton = document.getElementById("bar-back");
app.actionButton = document.getElementById("bar-action");
app.optionsButton = document.getElementById("bar-options");
  
  

var Rm = 3961; // mean radius of the earth (miles) at 39 degrees from the equator
var Rk = 6373; // mean radius of the earth (km) at 39 degrees from the equator
//var distanceDIV = document.getElementById("distance");

var screenYscroll = 0;
var step = 0.001;
var current_lng = 0;
var current_lat = 0;
var current_alt = 0;
var accuracy = 0;
var altitude = 0;
var CacheHasBeenDefined = false;
var MapHasBeenDrawn = false;
var refreshCacheList = true;
var CacheCount = 0;
var travelCacheBearing = 0;
var trueBearing = 0;
var cacheGUIDvalue = "";
var navGeoCode = "";
var myMembershipLevel;

var ShowCachesOnLoad = localStorage.getItem('initialCacheLoad');

var storedCacheDetails = "";


var myStatus="First Run";
var isFocusedonMe="yes";
var isFocusedonCache="no";
var my_current_lat = 0;
var my_current_lng = 0;
var my_prev_lat = 0;
var my_prev_lng = 0;
var myAccuracy;
var MapIsHidden=false;
var haveAllMarkersBeenPlaced=false;
var navCacheName;


var myWP={};
		myWP.lat=0;
		myWP.lng=0;
app.gpsCoordRepresentation=localStorage.getItem('coorRep');//"DMM"; //DD, DMM or DMS
app.editWPmode=0;
var wpContainer;
var wpIndex=0; 
//End of vars used by giveMeWayPoint()

var waypointTotalCount = 0;






var zoom_level = 30;
var current_zoom_level = 18;
var new_lat = 0;
var new_lng = 0;
var curPos = 0;
var myMarker = "";
var i = 0;
var windowOpen = "";
var prevWindowOption = "";
var message_body = "";
var openweather_api = "";
var tabIndex = 0;
var debug = "false";
var CacheListID = 0;

var tilesLayer;
var tileLayer;
var myLayer;
var tilesUrl;
var state_geoloc = "not-activ";
var savesearch = "false";

var search_current_lng;
var search_current_lat;	

var map;
var mapContent;

var Cache;
var crd;
var container;

var mapWindow;
var attempt = 0;
var id;
var CacheLat = 0;
var CacheLng = 0;
var geoCacheDetails;
var radius;

//var Traditional_cache;

var arrayCacheObject;
var arrayCache = [];
var arrayCacheMarker = [];

var showingAllCaches="no";
var FullCacheListDetails;
//var myUnits;
var cacheIconDisplay;
var gotoCache;

var focusActionLocation = "focusOnMe";

var storedLat = null;
var storedLng = null;

/////////////////////////////////////////////////////////
//
//	for handling photos and sharing in SMS
//	ref: from https://github.com/strukturart/o.map/blob/43fbea218b94fd1bdb3f58bcb1f7616a53564040/application/assets/js/mozactivity.js#L33
//

const mozactivity = (() => {
  const share_position = function () {
    message_body =
      "https://www.openstreetmap.org/?mlat=" +
      current_lat +
      "&mlon=" +
      current_lng +
      "#map=13/" +
      current_lat +
      "/" +
      current_lng +
      "&layers=T";

    share(message_body);
  };

  function share(url) {
    let activity = new MozActivity({
      name: "share",
      data: {
        type: "url",
        url: url,
      },
    });

    activity.onsuccess = function () {};

    activity.onerror = function () {
      console.log("The activity encounter en error: " + this.error);
    };
  }

  const photo = function () {
    let activity = new MozActivity({
      name: "record",
      data: {
        type: ["photos", "videos"],
      },
    });

    activity.onsuccess = function () {
      //toaster("back", 2000);
    };

    activity.onerror = function () {
      console.log("The activity encounter en error: " + this.error);
    };
  };

  return {
    photo,
    share_position,
  };
})();

/////////////////////////////////////////////////////////
  
container = document.getElementById('content');
wpContainer=document.getElementById('content2');
mapWindow = document.getElementById('map-container');

var options = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 0
};
  
// button input
app.keyCallback = {
    dUp: function () { navVertical(false); },
    dDown: function () { navVertical(true); },
    //dLeft: function () { navHorizontal(false); },
    //dRight: function () { navHorizontal(true); },
    	dLeft: function () {
				if(app.editWPmode==2){
					editWP("LEFT");
				}
				else{
				navHorizontal(false);
				} 
			},
	    dRight: function () { 
				if(app.editWPmode==2){
					editWP("RIGHT");
				}
				else{
				navHorizontal(true);
				} 
			
			},
    
    
    
    softLeft: function () { leftButton(); },
    softRight: function () { executeOption(); },
    enter: function () { 
		if(app.currentViewName == "viewMap") {
			//MovemMap('reFocus');
				if(app.editWPmode==2){
				  giveMeWayPoint("EndEdition");	
				  showView(0,false);
				  initView();					
				}else if (app.editWPmode==1){
					giveMeWayPoint("EditWP");					
				}else{
					//pop the actions screen
					var newButton = document.getElementById('showCacheNav');
					
					var mapCrd = map.getCenter();	
					var mapLat = mapCrd.lat;	
					var mapLng = mapCrd.lng;
					gotoCache = FindClosestCache(mapLat,mapLng);
					console.log(`${gotoCache.cacheCode} is ${gotoCache.cacheDistance} away`);
					if(gotoCache.cacheDistance < 0.01) {
						// we assume if you're closer than 0.01 mile/km, we'll open that cache details
						newButton.innerHTML = '<button class="navItem" tabIndex="30" data-function="gotoNearestCache">Show ' + gotoCache.cacheName + '</button>';
						//ShowCacheDetails(gotoCache.cacheCode);
						//showView(3,false);	
						//initView();					
					} else {
						newButton.innerHTML = "";
					};
									
					showView(12,false);
					initView();				
				}
		} else if (app.currentViewName == "viewCache") {
		  //navGeoCode = app.activeNavItem.getAttribute('navCode');
			//console.log(`pressed goNav, navGeoCode:${navGeoCode}`);
		  windowOpen = "viewMap";
		  showView(0,false);
		  initView();	
		  ShowCacheOnMap(navGeoCode);
		  focusActionLocation = "focusOnMe";				  
		} else {
			execute(); 
		}},
    menu: function () { },
    back: function () {
		if(myStatus =="First Run"){		
			window.close();
		} else {
			if(windowOpen=="viewMap") {
				//window.close();
					if(app.editWPmode==2){
						editWP("ERASE");				
					}
					else{
						goBack();
					}
			} else {	
				goBack();
			}
		}
	},
    quit: function () {	 window.close(); },
    
    
	    	
	    	
	//I change some of this functions in KaiOS.js to redirect to the newKeyCallback functions...	
	//and I call old keyCallback functions from the newKeyCallback functions 	
	// 	
	    ZoomOut: function () { ZoomMap('out'); },//push1		
		PanUp: function () { MovemMap('up'); },	
	    ZoomIn: function () { ZoomMap('in'); },  //push3			
		FocusOnMe: function () { MovemMap('reFocus'); }, 	
		FocusOnCache: function () { 
			if (focusActionLocation == "focusOnMe") {
				MovemMap('reFocus'); 	
				focusActionLocation = "focusOnCache";
			} else {
				if (CacheHasBeenDefined == false) {
					MovemMap('reFocus'); 
					focusActionLocation = "focusOnMe";						
				} else {
					MovemMap('focusOnCache'); 
					focusActionLocation = "focusOnMe";						
				};		
			};
		},//push5	
		PanDown: function () { MovemMap('down'); },	
		PanLeft: function () { MovemMap('left'); },	
		PanRight: function () { MovemMap('right'); },	
		ScrollTop: function () { navScreenTop(); },	
		ShowLogs: function () { viewCacheLogs(); }, //pushAsterisk	
		ShowGallery: function () { viewCacheGallery(); }, // push0	
		LogCache: function () { logThisCache(); }, //pushSharp	
		refreshCacheList: function () { refreshListofCaches(); },	
		ClosestCache: function () {
			var mapCrd = map.getCenter();	
			var mapLat = mapCrd.lat;	
			var mapLng = mapCrd.lng;
			var gotoCache = FindClosestCache(mapLat,mapLng);
			console.log(`${gotoCache.cacheCode} is ${gotoCache.cacheDistance} away`);
			if(gotoCache.cacheDistance < 0.01) {
				// we assume if you're closer than 0.01 mile/km, we'll open that cache details
				ShowCacheDetails(gotoCache.cacheCode);
				showView(3,false);	
				initView();					
			};
		},
		ShowAbout: function () { aboutDialog(); },	
		ShowMap: function () {//push6	
			showView(0,false);	
			initView();	
		},	
		ShowCacheList: function () {//push4	
			showView(1,false);	
			initView();	
		},	
		ShowDetails: function () {//push7	
			showView(3,false);	
			initView();	
		},	
		ShowCompass: function () { //push9	
			showView(2,false); 	
			initView();	
		},	
		ShowSettings: function () { // push2	
			windowOpen="Settings";	
			showView(8,false);	
			initView();	
		},    
    

	TakePicture: function () { 
        mozactivity.photo();
	},
	ShowMapCoords: function () { ListCachesFromMapCenter(); },
	ToggleUnits: function () {
		myUnits = localStorage.getItem('units');
		console.log(`current units are ${myUnits}`);
		if (myUnits == "mi") {
			localStorage.setItem('units',"km");
			myUnits = "km";
		} else {
			localStorage.setItem('units',"mi");
			myUnits = "mi";
		};
		console.log(`now units are ${myUnits}`);
	},
	MapAllCaches: function() { //push8
		if(showingAllCaches == "no") {
			showingAllCaches = "yes-noName";
		} else if (showingAllCaches == "yes-noName") {
			showingAllCaches = "yes-yesName";			
		} else {
			showingAllCaches = "no";
		}
		ShowAllCachesOnMap(showingAllCaches);
		showView(0,false);
		initView();
	},
    other: function () { }
};

//new button inputs	
	app.newKeyCallback={	
		 push0: function(){	
			if(myStatus!=="First Run"){
				if(app.editWPmode==2){	
					editWP("0");	
				}	
				else{	
					viewCacheGallery();	
				}	
			}
		},	
		push1: function(){	
			if(myStatus!=="First Run"){
				if(app.editWPmode==2){	
					editWP("1");	
				}	
				else{	
					app.keyCallback.ZoomOut();	
				}	
			}
		},	
		push2: function(){	
			if(myStatus!=="First Run"){			
				if(app.editWPmode==2){	
					editWP("2");	
				}	
				 else if (app.editWPmode==0) {
					// disable numeric keys when we're still in the select mode for creating a new waypoint
					//app.keyCallback.ShowSettings();
					app.keyCallback.TakePicture();					
					//app.keyCallback.ClosestCache();
				}
			}
		},	
		push3: function(){	
			if(myStatus!=="First Run"){		
				if(app.editWPmode==2){	
					editWP("3");	
				}	
				else{	
					app.keyCallback.ZoomIn();	
				}	
			}
		},	
		push4: function(){	
			if(myStatus!=="First Run"){		
				if(app.editWPmode==2){	
					editWP("4");	
				} else if (app.editWPmode==0) {
					// disable numeric keys when we're still in the select mode for creating a new waypoint
					app.keyCallback.ShowCacheList();	
				}	
			}
		},	
		push5: function(){	
			if(myStatus!=="First Run"){		
				if(app.editWPmode==2){	
					editWP("5");	
				}	
				else{	
					app.keyCallback.FocusOnCache();	
				}
			}			
		},	
		push6: function(){	
			if(myStatus!=="First Run"){		
				if(app.editWPmode==2){	
					editWP("6");	
				}	
				 else if (app.editWPmode==0) {
					// disable numeric keys when we're still in the select mode for creating a new waypoint
					app.keyCallback.ShowMap();	
				}	
			}
		},	
		push7: function(){	
			if(myStatus!=="First Run"){		
				if(app.editWPmode==2){	
					editWP("7");	
				}	
				 else if (app.editWPmode==0) {
					// disable numeric keys when we're still in the select mode for creating a new waypoint
					app.keyCallback.ShowDetails();	
				}	
			}
		},	
		push8: function(){	
			if(myStatus!=="First Run"){		
				if(app.editWPmode==2){	
					editWP("8");	
				}	
				else{	
					app.keyCallback.MapAllCaches();	
				}	
			}
		},    	
		push9: function(){	
			if(myStatus!=="First Run"){		
				if(app.editWPmode==2){	
					editWP("9");	
				}	
				 else if (app.editWPmode==0) {
					 
					// disable numeric keys when we're still in the select mode for creating a new waypoint
					app.keyCallback.ShowCompass();	
				}	
			}
		},    	
		pushSharp: function(){	
			if(myStatus!=="First Run"){		
				if(app.editWPmode==2){	
					editWP("#");	
				}	
				 else if (app.editWPmode==0) {
					// disable numeric keys when we're still in the select mode for creating a new waypoint
					app.keyCallback.LogCache();	
				}	
			}
		},	
		pushAsterisk: function(){	
			if(myStatus!=="First Run"){						
				if(windowOpen=="enterWaypoint"){
						windowOpen = "viewMap";
						showView(0,false);
						initView();						 
						giveMeWayPoint("EditWP"); 
				}	
				else { 
						if(app.editWPmode==1){
							giveMeWayPoint("EditWP");
						}
						if(app.editWPmode==0){app.keyCallback.ShowLogs();}
							
					
				}
			}
		}	
		
	}


// startup
window.addEventListener("load", function () {
	//console.log(`checking what the currently set units are`);
	
	//localStorage.clear();
	
	if(app.gpsCoordRepresentation == null) {
		//meaning this is the first time the app has been run
		app.gpsCoordRepresentation = 'DDD';
		localStorage.setItem('coorRep','DDD');
	}
	
	storedLat = localStorage.getItem('storedLat');
	storedLng = localStorage.getItem('storedLng');
	if(storedLat == null) {
		storedLat = 0;
		storedLng = 0;
		localStorage.setItem('storedLat',storedLat);
		localStorage.setItem('storedLng',storedLng);
	}
	
	myUnits = localStorage.getItem('units');
	if (myUnits == null) {
		console.log(`this is the first time this app has been run, setting units`);
		localStorage.setItem('units',"mi");
		myUnits = "mi";
	};
	
	
	//console.log(`local units are ${myUnits}`); 
	//app.saveTravelDistance = localStorage.getItem('saveTravelDistance');
	
	//if(app.saveTravelDistance == null) {
	//	console.log(`first time this app has been run, setting saveTravelDistance`);
	//	localStorage.setItem('saveTravelDistance',"yes");
	//	localStorage.setItem('myTravelDistance',0);
	//	app.saveTravelDistance = "yes";
	//}
		
	//app.myTravelDistance = localStorage.getItem('myTravelDistance');

	//if(myUnits =="mi"){
	//	displayDistanceTraveled.innerHTML = app.myTravelDistance + "ft";
	//} else {
	//	displayDistanceTraveled.innerHTML = app.myTravelDistance + "m";		  
	//}
			
	
	cacheIconDisplay = document.getElementById("cacheIconDisplay");
	cacheIconDisplay.innerHTML = "Show all cache icons on map";
	

	
	var viewRoot = document.getElementById("views");
    app.views = viewRoot.querySelectorAll('.view');
    // load first view
    showView(0,false);
    initView();		
});

function showOverlay(overlayContent) {
	var keyOverlay = document.getElementById('keyOverlay');
	var overlayTimeout;

	// enable key overlay
	keyOverlay.style.display = 'block';
	keyOverlay.innerHTML += '<span>' + overlayContent + '</span>';
	//console.log('Button pressed:', overlayContent);

	// clear overlay
	clearTimeout(overlayTimeout);
	overlayTimeout = setTimeout(function () {
		keyOverlay.innerHTML = ' ';
		keyOverlay.style.display = 'none';
	}, 1000);
}

function navScreenTop() {
	app.currentView.scrollTo(0, 0);
	screenYscroll = 0;
}

// vertical navigation in increments of 10
function navVertical(forward) {
	//console.log(`is the InputFocused? ${app.isInputFocused()}`);
	//console.log(`windowOpen=${windowOpen}`);
	if (windowOpen == "viewMap") {
		// move map around
		if (forward) {
			MovemMap('down');		
		} else {
			MovemMap('up');
		}
	} else if (windowOpen == "viewCache") {

		if(forward == true) {
			app.currentView.scrollBy(0, 50);
		} else {
			app.currentView.scrollBy(0, -50);
		}
	} else if (windowOpen == "viewAllShortcuts") {

		if(forward == true) {
			app.currentView.scrollBy(0, 50);
		} else {
			app.currentView.scrollBy(0, -50);
		}	
	} else if (!app.isInputFocused() && !app.fullAdVisible) {
      app.updateNavItems();
      // jump to tabIndex
      var next = app.currentNavId;

	  
      next += forward ? 10 : -10;
      if (next > getNavTabIndex(app.navItems.length - 1)) {
        // if larger than last index
        next = next % 10;
        // try to stay in same column
        if (app.navItems[next]) {
          focusActiveButton(app.navItems[next]);
        } else {
          focusActiveButton(app.navItems[0]);
        }
      } else if (next < 0) {
        // if smaller than 0

		var lastTab = getNavTabIndex(app.navItems.length - 1);
        var rowIndex = parseInt(Math.floor(lastTab * 0.1) * 10);
        // try to stay in same column
        var columnIndex = (next + 10) % 10;
        next = rowIndex + columnIndex;
        for (var i = 0; i < app.navItems.length; i++) {
          if (getNavTabIndex(i) == next) {
            focusActiveButton(app.navItems[i]);
            break;
          }
        }
      } else {
        var found = false;
        for (var i = 0; i < app.navItems.length; i++) {
          if (getNavTabIndex(i) == next) {
            focusActiveButton(app.navItems[i]);
            found = true;
            break;
          }
        }
        if (!found) {
          // nothing found, try start of next row
          var round = Math.floor(next / 10) * 10;
          for (var i = 0; i < app.navItems.length; i++) {
            if (getNavTabIndex(i) == round) {
              focusActiveButton(app.navItems[i]);
              found = true;
              break;
            } 
          }
        }
      }
    }
};

function getNavTabIndex(i) {
	return parseInt(app.navItems[i].getAttribute('tabIndex'));
};
  
function focusActiveButton(element) {
    //console.log(`trying to focus the active element: ${element}`);
	app.activeNavItem = element;
    app.currentNavId = parseInt(app.activeNavItem.getAttribute('tabIndex'));

    // scroll to top
    if (app.currentNavId == 0) {
      try {
        app.currentView.scrollTo(0, 0);
      } catch (e) { }
    } else {
      // smooth scrolling into view
      app.activeNavItem.scrollIntoView({ behavior: "smooth" });
    }


    app.activeNavItem.focus();
    // update softkeys
    softkeyBar();
};

app.getActiveNavItemIndex = function () {
    for (var i = 0; i < app.navItems.length; i++) {
      var found = false;
      if (app.activeNavItem) {
        if (app.activeNavItem.getAttribute('id') == app.navItems[i].getAttribute('id')) {
          found = true;
          break;
        }
      }
    }
    if (found) {
      return i;
    } else {
      return 0;
    }
}  

// horizontal navigation in increments of 1
function navHorizontal(forward) {
	if (windowOpen == "viewMap") {
		// move map around
		if (forward) {
			MovemMap('right');	
		} else {
			MovemMap('left');
		}
	} else if (windowOpen=="viewCache") {
		// move to the next or previous cache details and set the position in the overall cache list
		var gotoCacheID;
		if (forward) {
			gotoCacheID = arrayCache[nextCacheID].cacheCode;
			//console.log(`nextCacheID: ${nextCacheID}`);
			CacheListID = nextCacheID * 10;
		} else {
			gotoCacheID = arrayCache[prevCacheID].cacheCode;
			CacheListID = prevCacheID * 10;
			//console.log(`nextCacheID: ${prevCacheID}`);
		}	
			//console.log(`CacheListID = ${CacheListID}`);
		  //windowOpen = "viewCache";
		  ShowCacheDetails(gotoCacheID);
		  showView(3,false);
		  initView();			
				
	} else if (!app.isInputFocused() && !app.fullAdVisible) {
      app.updateNavItems();
      // jump to array index for continuous horizontal navigation
      var currentTabIndex = app.currentNavId;
      for (var i = 0; i < app.navItems.length; i++) {
        if (getNavTabIndex(i) == currentTabIndex) {
          var next = i;
          next += forward ? 1 : -1;
          if (next >= app.navItems.length) {
            next = 0;
          } else if (next < 0) {
            next = app.navItems.length - 1;
          }
          focusActiveButton(app.navItems[next]);
          break;
        }
      }
    }
  };

app.isInputFocused = function () {
	var activeTag = document.activeElement.tagName.toLowerCase();
	//console.log(`Active tag is ${activeTag}`);
	var isInput = false;
	// the focus switches to the 'body' element for system ui overlays
	if (activeTag == 'input' || activeTag == 'select' || activeTag == 'text' || activeTag == 'textarea' || activeTag == 'body' || activeTag == 'html') {
	  isInput = true;
	}
	return isInput;
};

function goBack() {
	if (app.backArray.length > 1) {
		// first remove the current view from the array
		app.backArray.pop();
		//then pull the last value in the array, which is the one we want to nav to
			
		var backArrayEnd = app.backArray.length - 1;
		var prevID = app.backArray[backArrayEnd];
		showView(prevID,true);
		  //console.log(`going to viewID: ${app.prevViewId}`);
		 // windowOpen = prevWindowOption;
		initView();
	};
};

// use the index to navigate to the view
function showView(index,isBack) {
	// switch active view
	//app.prevViewId = app.currentViewID;	
	//prevWindowOption = windowOpen;
	for (let i = 0; i < app.views.length; i++) {
	  app.views[i].classList.remove('active');
	}
	app.currentView = app.views[index];
	app.currentView.classList.add('active');
	app.currentViewID = index;
	app.currentViewName = app.currentView.getAttribute("id");
	
	windowOpen = app.currentViewName;
	
	if(isBack == false) {
		// only load the current window to the backArray if it's a new window load.  
		// specifically, in the cache details screen, we can scroll left/right through other cache details pages
		// but we will stay on the same window.  don't keep loading that window into the backArray, so we can use
		// the back button to return to the prev window we were on before starting to look at cache details, generally
		if(index !== app.backArray[app.backArray.length - 1]) {
			app.backArray.push(index);
		//console.log(`added ID ${index} to backArray`);	
		}
	} else {
		//console.log('this was a back function, nothing added to the array');
	}

	for (let j = 0; j < app.backArray.length; j++){
		//console.log(`position ${j}: ID ${app.backArray[j]}`);
	}
	//console.log(`new currentViewID/name: ${app.currentViewID} ${app.currentViewName}`);
}

// use the view's name
function showViewByName(name) {
	app.prevViewId = app.currentViewID;
	var viewIndex = 0;
	// switch active view
	for (let i = 0; i < app.views.length; i++) {
	  app.views[i].classList.remove('active');
	  // search for name
	  if (name == app.views[i].id) {
		viewIndex = i;
	  }
	}
	app.currentView = app.views[viewIndex];
	app.currentView.classList.add('active');
	app.currentViewID = viewIndex;
	app.currentViewName = name;
}

function initView() {
	//console.log(`from initView, currentView: ${app.currentViewName}`);
	  
	screenYscroll = 0;
	app.currentView.scrollTo(0, 0);
	// enable options button
	// enable back button
	if (app.currentViewName == 'viewMap') {
	  windowOpen="viewMap";	  
	  app.leftSoftButton = "MapView";
	  app.optionEnabled = true;
	} else if (app.currentViewName == 'viewList') {
	  windowOpen="viewList";
	  app.leftSoftButton = "CacheList";
	  app.optionEnabled = true;
	} else if (app.currentViewName == 'viewCache') {
		windowOpen = "viewCache";
		app.leftSoftButton = "CacheDetails";
		app.optionEnabled = true;
	} else if (app.currentViewName == 'viewOptions') {
		windowOpen = "viewOptions";
		app.leftSoftButton = "Back";
		app.optionEnabled = false;
	} else if (app.currentViewName == 'Settings') {
		windowOpen = "Settings";
		app.leftSoftButton = "Back";
		app.optionEnabled = false;
	}

	// focus first menu entry
	if (app.currentView.querySelector(".navItem")) {
	  app.updateNavItems();
	  if (app.currentViewName == 'viewList') {
		CacheListID = CacheListID/10;
		//app.currentNavid = CacheListID;
		focusActiveButton(app.navItems[CacheListID]);
	  } else {
		focusActiveButton(app.navItems[0]);	
	  }
	}
	softkeyBar();	
};

// fill navigation array for current view
app.updateNavItems = function (index) {
app.navItems = app.currentView.querySelectorAll('.navItem');
}

function openURL(url) {
	var external = url.includes('http');
	if (external) {
	  window.open(url);
	} else {
	  window.location.assign(url);
	}
	softkeyBar();
}

// decide what the left soft button will do
function leftButton() {
	var leftButtonHTML = app.backButton.innerHTML;
	if (leftButtonHTML == "Caches") {
		windowOpen = 'viewList';
		showView(1,false);
		initView();	
	} else if (leftButtonHTML == "Map") {
		windowOpen = 'viewMap';		
		showView(0,false);
		initView();		
	} else if (leftButtonHTML == "Back") {
		windowOpen = 'viewMap';		
		goBack();
	} else if (leftButtonHTML == "Cancel") {
		app.editWPmode=0;
		showView(0,false);
		initView();			
	}
}

function viewCacheLogs() {
	 if(cacheGUIDvalue != '') {
		 //var CacheURL = " https://www.geocaching.com/seek/cache_logbook.aspx?guid=" + cacheGUIDvalue
		 var CacheURL = "https://www.geocaching.com/seek/cdpf.aspx?guid=" + cacheGUIDvalue + "&lc=10";
		 openURL(CacheURL);				 				 
	 }	
};

function viewCacheGallery() {
	 if(cacheGUIDvalue != '') {
		 var CacheGalleryURL = "https://www.geocaching.com/seek/gallery.aspx?guid=" + cacheGUIDvalue;
		 openURL(CacheGalleryURL);
	 }	
};

function logThisCache() {
	 if (navGeoCode !='') {
		 var LogCacheURL = "https://www.geocaching.com/play/geocache/" + navGeoCode + "/log";
		 openURL(LogCacheURL);
	 }	
};

function refreshListofCaches() {
		// get the lat/lng of the center of the current map view and refresh the list of caches from that point instead
		// of the current GPS location
		
		var mapCrd = map.getCenter();
		var mapLat = mapCrd.lat;
		var mapLng = mapCrd.lng;
		
		//console.log(`mapLat/Lng: ${mapLat}/${mapLng}`);
		ListCaches(mapLat,mapLng,"no");				

	  showView(0,false);
	  initView();	
};

// decide, what the enter button does, based on the active element
function execute() {  
	if (!app.fullAdVisible) {
		if (!app.isInputFocused()) { /* NOT in some input field */
			if (app.activeNavItem.getAttribute('data-gotToViewId')) {
			  showView(app.activeNavItem.getAttribute('data-gotToViewId'),false);
			  initView();
			} else if (app.activeNavItem.getAttribute('data-gotToViewName')) {
			  showViewByName(app.activeNavItem.getAttribute('data-gotToViewName'));
			  initView();
			} else if (app.activeNavItem.getAttribute('data-href')) {
			  openURL(app.activeNavItem.getAttribute('data-href'));
			} else if (app.activeNavItem.getAttribute('data-function')) {
			  var call = app.activeNavItem.getAttribute('data-function');
			  switch (call) {
				case 'deleteAllWaypoints':
					DeleteWaypoints();
				 break;
				case 'cancel':
					showView(0,false);
					initView();
				 break;
				case 'gotoNearestCache':
					ShowCacheDetails(gotoCache.cacheCode);
					showView(3,false);	
					initView();					
				 break;
				case 'createWaypoint':
					showView(0,false);
					initView();
					giveMeWayPoint("EndEdition");						
				 break;
				case 'centerOnMe':
					showView(0,false);
					initView();
					MovemMap('reFocus');
					focusActionLocation = "focusOnCache";						
				 break;
				case 'viewShortcuts':
					showView(9,false);
					initView();
				 break;
				case 'viewMap':
					showView(0,false);
					initView();
				 break;
				case 'viewCache':
					showView(3,false);
					initView();
				 break;
				case 'enterWaypoint':
					showView(11,false);
					initView();
				 break;				 
				case 'viewLogs':
					viewCacheLogs();
				 break;
				case 'viewGallery':
					viewCacheGallery();
				 break;
				case 'LogCache':
					logThisCache();
				 break;				 
				case 'viewList':
				 //windowOpen = "viewList";

				 showView(1,false);
				 initView();
				 //softkeyBar();
				 break;
				case 'viewCompass':
				 showView(2,false);
				 initView();
				// softkeyBar();
				 break;							 
				case 'refreshList':
					refreshListofCaches();
				 // softkeyBar();	
				  break;
				case 'takePhoto':
					app.keyCallback.TakePicture();		
				  break;				  
				case 'viewAllCaches':
					if(showingAllCaches == "no") {
						showingAllCaches = "yes-noName";
					} else if (showingAllCaches == "yes-noName") {
						showingAllCaches = "yes-yesName";			
					} else {
						showingAllCaches = "no";
					}
					ShowAllCachesOnMap(showingAllCaches);
					showView(0,false);
					initView();			  
				 // softkeyBar();	
				  break;
				case 'viewSettings':
					windowOpen="Settings";
					showView(8,false);
					initView();				
				 break;
				case 'toggleUnits':
					//set the options list appropriately
					var displayUnits = document.getElementById("unitsDisplay");					
					myUnits = localStorage.getItem('units');
					//console.log(`current units are ${myUnits}`);
					if (myUnits == "mi") {
						localStorage.setItem('units',"km");
						myUnits = "km";
						displayUnits.innerHTML = "Toggle " + myUnits + " to mi";							
					} else {
						localStorage.setItem('units',"mi");
						myUnits = "mi";
						displayUnits.innerHTML = "Toggle " + myUnits + " to km";					
					};
					//console.log(`now units are ${myUnits}`);				
				 break;
				case 'createWPfromMap':
					showView(0,false);
					initView();						 
					giveMeWayPoint("EditWP"); 					
				 break;
				case 'viewWaypoints':
				
				 break;
				case 'createWPDirectly':
					//editWP("#");
				 break;
				case 'NavToCache':
				  navGeoCode = app.activeNavItem.getAttribute('navCode');
				  windowOpen = "viewMap";
				  showView(0,false);
				  initView();
				 // softkeyBar();	
				  ShowCacheOnMap(navGeoCode);
				  break;
				case 'NavToCacheDetails':
				  navGeoCode = app.activeNavItem.getAttribute('navCode');
				  //CacheListID = app.currentViewID;
				  CacheListID = parseInt(app.activeNavItem.getAttribute('tabIndex'))
				  //console.log(`ID in list: ${CacheListID}`);
				  windowOpen = "viewCache";
				  ShowCacheDetails(navGeoCode);
				  showView(3,false);
				  initView();
				//  softkeyBar();	
				  break;	
				case 'About':
				  openURL('https://github.com/canyouswim/Caching-on-Kai/wiki/About#caching-on-kai');
				  break;	
				case 'Help':
				  openURL('https://github.com/canyouswim/Caching-on-Kai/wiki/');
				  break;				  
				case 'mailto':
				  location.href = 'mailto:' + app.activeNavItem.innerHTML;
				  break;
				case 'quit':
				  window.close();
				  break;
				case 'changeColor':
				  app.activeNavItem.style.backgroundColor = 'green';
				  //console.log('changing color');
				  break;
			  }
			} else if (app.activeNavItem.tagName.toLowerCase() == 'legend') {
			  // select input field next to the legend
			  app.activeNavItem.nextElementSibling.focus();
			} else {
			  console.log('nothing to execute');
			}
		} else { /* in some input field */
				if (app.currentViewName == 'Settings') { /* do this in the inputs view */
				  app.updateInputs();
				}
				// return to legend when input confirmed to avoid triggering the input again
				app.activeNavItem.focus();
		}
		// update soft keys
		softkeyBar();
	}
};

// decide, what the 'soft key right' does
function executeOption() {
  //console.log(`optionButtonAction = ${app.optionButtonAction}`);
  if (app.optionButtonAction == 'viewOptions') {
	  //console.log(`openWindow=${windowOpen}`);
	  if(windowOpen == "viewList"){
		CacheListID = parseInt(app.activeNavItem.getAttribute('tabIndex'));	
			//console.log(`CacheListID:${CacheListID}`);
	  }
	  //windowOpen = "viewOptions";	  
	  showView(6,false);
	  initView();
	  //softkeyBar();	
  } 
};

// set soft keys
function softkeyBar() {
	
	if(myStatus!=="First Run") {
		if (app.currentViewName == "viewMap") {
			app.backButton.innerHTML = "Caches";
			app.actionButton.innerHTML = "ACTION";	
			app.optionsButton.innerHTML = "Options";
			app.optionButtonAction = 'viewOptions';
		} else if(app.currentViewName == "viewList") {
			app.backButton.innerHTML = "Map";
			app.actionButton.innerHTML = "SELECT";	
			app.optionsButton.innerHTML = "Options";
			app.optionButtonAction = 'viewOptions';
		} else if(app.currentViewName == "viewCache") {
			app.backButton.innerHTML = "Caches";
			app.actionButton.innerHTML = "GoNav";
			app.optionsButton.innerHTML = "Options";
			app.optionButtonAction = 'viewOptions';
		} else if(app.currentViewName == "viewCompass")  {
			app.backButton.innerHTML = "Back";
			app.actionButton.innerHTML = "";
			app.optionsButton.innerHTML = "Options";
			app.optionButtonAction = 'viewOptions';
		} else if(app.currentViewName == "viewOptions")  {
			app.backButton.innerHTML = "Back";
			app.actionButton.innerHTML = "SELECT";
			app.optionsButton.innerHTML = "";
			app.optionButtonAction = '';
		} else {
			app.backButton.innerHTML = "Back";
			app.actionButton.innerHTML = "SELECT";
			app.optionsButton.innerHTML = "";
			app.optionButtonAction = '';
		}
		
		// check to see if we're in WayPoint creating/editing mode.  if so, we need to take over the buttons / softkeys until we're done
		if (app.editWPmode==1) {
			app.backButton.innerHTML = "Cancel";
			app.actionButton.innerHTML = "SET WP";
			app.optionsButton.innerHTML = "";
			app.optionButtonAction = '';		
		} else 	if (app.editWPmode==2) {
			app.backButton.innerHTML = "Cancel";
			app.actionButton.innerHTML = "SAVE WP";
			app.optionsButton.innerHTML = "";
			app.optionButtonAction = '';		
		}
		//console.log(`Button/Action: ${app.optionsButton.innerHTML}/${app.optionButtonAction}`);
	}
};

function ZoomMap(in_out) {

	var current_zoom_level = map.getZoom();
	//console.log(`ZoomMap ${in_out}, current zoom ${current_zoom_level}`);	
		if (in_out == "in") {
				current_zoom_level = current_zoom_level + 1
				map.setZoom(current_zoom_level);
			}
		if (in_out == "out") {
			current_zoom_level = current_zoom_level - 1
			map.setZoom(current_zoom_level);
		}
		zoom_level = current_zoom_level;
		zoom_speed();
	//console.log(`New Zoom ${zoom_level}`);
}

function zoom_speed() {
	if (zoom_level <= 7) {
		step = 1;
	}


	if (zoom_level > 7) {
		step = 0.1;
	}


	if (zoom_level > 11) {
		step = 0.001;
	}
	
	if (zoom_level > 16) {
		step = .0001;
	}

	return step;
}

function MovemMap(direction) {
	//console.log(`MovemMap ${direction}`);
	console.log(`lat/lng: ${current_lat}/${current_lng}`);
	if (direction == "left") {
		zoom_speed()
		isFocusedonMe = "no";
		current_lng = current_lng - step;
		map.panTo(new L.LatLng(current_lat, current_lng));
	}

	if (direction == "right") {
		zoom_speed()
		isFocusedonMe = "no";
		current_lng = Number(current_lng) + Number(step);
		map.panTo(new L.LatLng(current_lat, current_lng));
	}

	if (direction == "up") {
		zoom_speed()
		isFocusedonMe = "no";
		current_lat = Number(current_lat) + Number(step);
		map.panTo(new L.LatLng(current_lat, current_lng));

	}

	if (direction == "down") {
		zoom_speed()
		isFocusedonMe = "no";
		current_lat = current_lat - step;
		map.panTo(new L.LatLng(current_lat, current_lng));

	}
	
	if (direction == "reFocus") {
		isFocusedonMe = "yes";	
		isFocusedonCache = "no";
		//console.log(`current latlng: ${my_current_lat}, ${my_current_lng}`);
		map.panTo(new L.LatLng(my_current_lat,my_current_lng));
		current_lat = crd.latitude;
		current_lng = crd.longitude;

	}
	
	if (direction == "focusOnCache") {
		isFocusedonMe = "no";
		isFocusedonCache = "yes";
		current_lat = CacheLat;
		current_lng = CacheLng;
		//console.log('move to cache');
		map.panTo(new L.LatLng(CacheLat,CacheLng));		
	}
	
	var myCoords=displayPosition(current_lat,current_lng,app.gpsCoordRepresentation);	
	wpContainer.innerHTML = "&#x2295; "+myCoords;	
}

function success(pos) {
  crd = pos.coords;
  radius = crd.accuracy;
	my_prev_lat = my_current_lat;
	my_prev_lng = my_current_lng;
  my_current_lat = crd.latitude;
  my_current_lng = crd.longitude;
  
  localStorage.setItem('storedLat',my_current_lat);
  localStorage.setItem('storedLng',my_current_lng);
  
  var movementDistance = findDistance(my_prev_lat,my_prev_lng,my_current_lat,my_current_lng);  
  if(myUnits == "mi") {
	  movementDistance = movementDistance * 5280;
  } else {
	  movementDistance = movementDistance * 1000;
  }


	if(myStatus=="First Run") {
		// Pull list of caches near me and plot them on the map (but only if this is set to Yes in settings)

		if (ShowCachesOnLoad == "YesLoadCaches") {
			ListCaches(my_current_lat,my_current_lng,"no");	
		} else {
			// this is if we don't want to pull the list of live cacheSize
			// and instead pull them from local storage
			ListCaches(0,0,"yes");					
		};

		if(MapHasBeenDrawn == false) {
			//Draw the map
			//leafvar add basic map
			map = L.map('map-container', {
				zoomControl: false,
				dragging: false,
				keyboard: true
			}).fitWorld();
			tilesUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
			tilesLayer = L.tileLayer(tilesUrl, {
				//attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
				//    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
			});

			map.addLayer(tilesLayer);
			
			MapHasBeenDrawn = true;

			// Setup, but don't pin, the cache marker
			
			Traditional_cache = L.icon({
				iconUrl: '/assets/icons/type_traditional.png',

				iconSize:     [40, 40], // size of the icon
				iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
				popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
			}); 
			
			Waypoint_cache = L.icon({
				iconUrl: '/assets/icons/icons8-waypoint-map-48.png',

				iconSize:     [40, 40], // size of the icon
				iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
				popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
			}); 			
			
			NavTo_cache = L.icon({
				iconUrl: '/assets/icons/icons8-cache-marker-40.png',

				iconSize:     [40, 40], // size of the icon
				iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
				popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
			}); 			
			
			Found_cache = L.icon({
				iconUrl: '/assets/icons/marker_found.png',

				iconSize:     [20, 20], // size of the icon
				iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
				popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
			}); 	
			
			Multi_cache = L.icon({
				iconUrl: '/assets/icons/type_multi.png',

				iconSize:     [40, 40], // size of the icon
				iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
				popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
			}); 

			Mystery_cache = L.icon({
				iconUrl: '/assets/icons/type_mystery.png',

				iconSize:     [40, 40], // size of the icon
				iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
				popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
			}); 
			
			Virtual_cache = L.icon({
				iconUrl: '/assets/icons/type_virtual.png',

				iconSize:     [40, 40], // size of the icon
				iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
				popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
			}); 	

			Earth_cache = L.icon({
				iconUrl: '/assets/icons/type_earth.png',

				iconSize:     [40, 40], // size of the icon
				iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
				popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
			}); 			

		}				

		myMarker = L.marker([crd.latitude,crd.longitude]).addTo(map);
		myAccuracy = L.circle([crd.latitude,crd.longitude], radius).addTo(map);
		
		map.setView([crd.latitude,crd.longitude], zoom_level);
		
		isFocusedonMe = "yes";	

		map.panTo(new L.LatLng(crd.latitude,crd.longitude));
		current_lat = crd.latitude;
		current_lng = crd.longitude;		

		myStatus="running";
		softkeyBar();		

	} else {
		myMarker.remove();
		myAccuracy.remove();
		myMarker = L.marker([my_current_lat,my_current_lng]).addTo(map);
		myAccuracy = L.circle([my_current_lat,my_current_lng], radius).addTo(map);
		if(isFocusedonMe == "yes") {
			MovemMap('reFocus');
		}
	}

	mapContent = "";
	if(CacheLat !== 0 && CacheLng !== 0) {
		var mapCompassContainer = document.getElementById('compassContainer');
		var compassIMG = document.getElementById('compass');
		var LargeCompassIMG = document.getElementById('largeCompass');
		var LargeCompassContainer = document.getElementById('NorthCompassContainer');
		var LargeCompassNorthIMG = document.getElementById('NorthCompass');
		var distToCache = document.getElementById('distanceToCache');
		var gpsAccuracy = document.getElementById('gpsAccuracy');

		var bearingToCache = document.getElementById('bearingToCache');
		var tripDistance = findDistance(my_current_lat,my_current_lng,CacheLat,CacheLng);

		if(myUnits == "mi") {
			if(tripDistance < .5) {
				mapContent = mapContent + `${roundToTwo(tripDistance * 5280)}ft`;
				distToCache.innerHTML = `<b>Distance</b></br>${roundToTwo(tripDistance * 5280)}ft`;
			} else {
				mapContent = mapContent + `${roundToTwo(tripDistance)}mi`;
				distToCache.innerHTML = `<b>Distance</b></br>${roundToTwo(tripDistance)}mi`;			
			};
		} else {
			if(tripDistance < .5) {
				mapContent = mapContent + `${roundToTwo(tripDistance * 1000)}m`;
				distToCache.innerHTML = `<b>Distance</b></br>${roundToTwo(tripDistance * 1000)}m`;
			} else {
				mapContent = mapContent + `${roundToTwo(tripDistance)}km`;
				distToCache.innerHTML = `<b>Distance</b></br>${roundToTwo(tripDistance)}km`;
			};
		};
		
		//if (app.saveTravelDistance == "yes") {
		//  app.myTravelDistance = roundToTwo(app.myTravelDistance + movementDistance);
		//  localStorage.setItem('myTravelDistance',app.myTravelDistance);
		//  if(myUnits =="mi"){
		//	displayDistanceTraveled.innerHTML = app.myTravelDistance + "ft";
		//  } else {
		//	displayDistanceTraveled.innerHTML = app.myTravelDistance + "m";		  
		//  }
		//}		

		//calculate the bearing to the cache, relative to North
		var cacheBearing = bearing(my_current_lat,my_current_lng,CacheLat,CacheLng);
			console.log(`cacheBearing: ${cacheBearing}`);
		//calculate the bearing of my movement
		var travelBearing = 0;
		
		if (movementDistance > 1) {
			travelBearing = bearing(my_prev_lat,my_prev_lng,my_current_lat,my_current_lng);
			
			//calculate the adjusted bearing based on my direction of travelBearing			
			trueBearing = cacheBearing - travelBearing;
			compassIMG.style.transform  = 'rotate(' + trueBearing + 'deg)';
			mapCompassContainer.style.backgroundColor = 'MediumSeaGreen';
			mapCompassContainer.style.color = 'white';
			
			LargeCompassNorthIMG.style.transform = 'rotate(-' + travelBearing + 'deg)';
			LargeCompassIMG.style.transform = 'rotate(' + trueBearing + 'deg)';
		} else {
			mapCompassContainer.style.backgroundColor = 'yellow';	
			mapCompassContainer.style.color = 'black';			
		}
		gpsAccuracy.innerHTML = "<b>GPS Accuracy</b></br>" + roundToTwo(radius);		
	}

	container.innerHTML = mapContent;	

	attempt = 0;
  
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  if(err.code == 1) {
	//either GPS is turned off or we don't have rights to access the GPS
	console.log(`storedLat: ${storedLat}`);
	if(storedLat !== '0') {
		kaiosToaster({
		  message: 'GPS is turned off or we have not been allowed access. Will use previously stored location',
		  position: 'south',
		  type: 'warning',
		  timeout: 3000
		})	
		my_current_lat = storedLat;
		my_current_lng = storedLng;
		// if we have a previously stored location, use that to load us up 
		if(myStatus=="First Run") {
			// Pull list of caches near me and plot them on the map (but only if this is set to Yes in settings)

			if (ShowCachesOnLoad == "YesLoadCaches") {
				ListCaches(storedLat,storedLng,"no");	
			} else {
				// this is if we don't want to pull the list of live cacheSize
				// and instead pull them from local storage
				ListCaches(0,0,"yes");					
			};

			if(MapHasBeenDrawn == false) {
				//Draw the map
				//leafvar add basic map
				map = L.map('map-container', {
					zoomControl: false,
					dragging: false,
					keyboard: true
				}).fitWorld();
				tilesUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
				tilesLayer = L.tileLayer(tilesUrl, {
					//attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
					//    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
				});

				map.addLayer(tilesLayer);
				
				MapHasBeenDrawn = true;

				// Setup, but don't pin, the cache marker
				
				Traditional_cache = L.icon({
					iconUrl: '/assets/icons/type_traditional.png',

					iconSize:     [40, 40], // size of the icon
					iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
					popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
				}); 
				
				Waypoint_cache = L.icon({
					iconUrl: '/assets/icons/icons8-waypoint-map-48.png',

					iconSize:     [40, 40], // size of the icon
					iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
					popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
				}); 			
				
				NavTo_cache = L.icon({
					iconUrl: '/assets/icons/icons8-cache-marker-40.png',

					iconSize:     [40, 40], // size of the icon
					iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
					popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
				}); 			
				
				Found_cache = L.icon({
					iconUrl: '/assets/icons/marker_found.png',

					iconSize:     [20, 20], // size of the icon
					iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
					popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
				}); 	
				
				Multi_cache = L.icon({
					iconUrl: '/assets/icons/type_multi.png',

					iconSize:     [40, 40], // size of the icon
					iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
					popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
				}); 

				Mystery_cache = L.icon({
					iconUrl: '/assets/icons/type_mystery.png',

					iconSize:     [40, 40], // size of the icon
					iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
					popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
				}); 
				
				Virtual_cache = L.icon({
					iconUrl: '/assets/icons/type_virtual.png',

					iconSize:     [40, 40], // size of the icon
					iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
					popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
				}); 	

				Earth_cache = L.icon({
					iconUrl: '/assets/icons/type_earth.png',

					iconSize:     [40, 40], // size of the icon
					iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
					popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
				}); 			

			}				

			myMarker = L.marker([storedLat,storedLng]).addTo(map);
			//myAccuracy = L.circle([crd.latitude,crd.longitude], radius).addTo(map);
			
			map.setView([storedLat,storedLng], zoom_level);
			
			isFocusedonMe = "yes";	

			map.panTo(new L.LatLng(storedLat,storedLng));
			current_lat = storedLat;
			current_lng = storedLng;		

			myStatus="running";
			softkeyBar();		

		}		
		
		
	} else {
		kaiosToaster({
		  message: 'GPS is turned off or we have not been allowed access.',
		  position: 'south',
		  type: 'warning',
		  timeout: 3000
		})		
	}
	navigator.geolocation.clearWatch(id);
	console.log('stopping attempts at locating GPS');
	container.innerHTML = "No GPS";		
	
  } else {
	  attempt = attempt + 1;
	  mapContent = "Timeout #" + attempt;
		container.innerHTML = mapContent;	  
  }		
}


function roundToTwo(num) {    
  return +(Math.round(num + "e+2")  + "e-2");
}

// convert degrees to radians
function deg2rad(deg) {
	rad = deg * Math.PI/180; // radians = degrees * pi/180
	return rad;
}

// round to the nearest 1/1000
function round(x) {
	return Math.round( x * 1000) / 1000;
}	

			
//function findDistance(cor2) {
function findDistance(startLat,startLng,endLat,endLng) {	
	var t1, n1, t2, n2, lat1, lon1, lat2, lon2, dlat, dlon, a, c, dm, dk, mi, km;
	

	
	// get values for lat1, lon1, lat2, and lon2
	//t1 = frm.lat1.value;
	//t1 = cor1.latitude;
	//n1 = frm.lon1.value;
	//n1 = cor1.longitude;
	//t2 = frm.lat2.value;
	//t2 = cor2.latitude;
	//n2 = frm.lon2.value;
	//n2 = cor2.longitude;
	
	// convert coordinates to radians
	lat1 = deg2rad(startLat);
	lon1 = deg2rad(startLng);
	lat2 = deg2rad(endLat);
	lon2 = deg2rad(endLng);
	
	// find the differences between the coordinates
	dlat = lat2 - lat1;
	dlon = lon2 - lon1;
	
	// here's the heavy lifting
	a  = Math.pow(Math.sin(dlat/2),2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon/2),2);
	c  = 2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); // great circle distance in radians
	dm = c * Rm; // great circle distance in miles
	dk = c * Rk; // great circle distance in km
	
	// round the results down to the nearest 1/1000
	mi = round(dm);
	km = round(dk);

	if (myUnits=="mi"){
		return mi;
	} else {
		return km;
	}
}	

// Converts from radians to degrees.
function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

function bearing(startLat, startLng, destLat, destLng){
  startLat = deg2rad(startLat);
  startLng = deg2rad(startLng);
  destLat = deg2rad(destLat);
  destLng = deg2rad(destLng);


  //console.log('start bearing calc');
  y = Math.sin(destLng - startLng) * Math.cos(destLat);
  x = Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  brng = Math.atan2(y, x);
  //console.log(`brng: ${brng}`);
  brng = toDegrees(brng);
  return (brng + 360) % 360;
}

function ListCachesFromMapCenter() {
	// get the lat/lng of the center of the current map view and refresh the list of caches from that point instead
	// of the current GPS location
	
	var mapCrd = map.getCenter();
	var mapLat = mapCrd.lat;
	var mapLng = mapCrd.lng;
	
	console.log(`mapLat/Lng: ${mapLat}/${mapLng}`);
	ListCaches(mapLat,mapLng);
	
}

function ListCaches(myLat,myLng,loadFromStorage) {
	if(loadFromStorage =="no"){
		//================================================================================
		//
		// Get cache list from Geocaching.com
		//
		//console.log('starting get caches');
		var xhr = new XMLHttpRequest({ mozSystem: true });
			var geomethod = "GET";
			var geourl = "https://www.geocaching.com/play/search?lat=" + myLat + "&lng=" + myLng + "&origin=" + myLat + ",+" + myLng;

		xhr.open(geomethod, geourl, true);

		xhr.withCredentials = true;


		xhr.onreadystatechange = function () {
		  var geoloadstate = xhr.readyState;
		  //console.log(`Load state: ${geoloadstate}`);
		  if (geoloadstate == 1) {
			  //console.log('request opened');
		  } else if (geoloadstate == 2) {
			//console.log('headers received'); 
		  } else if (geoloadstate == 3) {
			  //console.log('loading data');
		  } else if (geoloadstate == 4) {
			var geostatus = xhr.status;

			if (geostatus >= 200 && geostatus < 400) {
			  var siteText = xhr.response;
			  
			  var siteDOM = new DOMParser().parseFromString(siteText, "text/html");

			  //drop the response into local storage for future retrieval if need on re-load of app
			  localStorage.setItem('geocachingResponse', siteText);

				if(siteDOM.title=="Geocaching") {
					console.log('not logged in');
					var CacheURL = "https://www.geocaching.com/account/signin";
					openURL(CacheURL);							
				} else {

				  var geoList = siteDOM.getElementsByTagName("tbody").namedItem("geocaches");
				  
					//console.log(`returned page title: ${siteDOM.title}`);

				  geoCacheDetails = geoList.getElementsByTagName("tr");

				  CacheCount = geoCacheDetails.length;	

					//================================================================================
					//
					// Display list of caches
					//
					//
					var listContainer = document.getElementById('CacheList');
					listContainer.innerHTML = '';
					
					CacheListID = 0;
		
			//Loading up caches...
					
					kaiosToaster({
					  message: 'Loading up caches...',
					  position: 'north',
					  type: 'warning',
					  timeout: 3000
					})				


					// remove all the cache icon markers on the map, but only if they've been placed in the first place :) 
					if (haveAllMarkersBeenPlaced == true) {
						for (let i = 0; i < arrayCache.length; i++) {
							arrayCacheMarker[i].remove();
						};
					};
					//clear out any existing caches in the array					
					arrayCache.length = 0;
					arrayCacheMarker.length = 0;
					showingAllCaches = "no";

					for (let i = 0; i < CacheCount; i++) {
		
						// the "data-premium" attribute is present when the user is not premium and the cache is premium only.  ignore those if not premium user
						var CachePremium = geoCacheDetails[i].hasAttribute("data-premium");
						//console.log(`cache ${i} is premium: ${CachePremium}`);
						
						var CacheName = geoCacheDetails[i].getElementsByClassName("cache-name");
						var CacheDetails = geoCacheDetails[i].getElementsByClassName("cache-details");
						var CacheDetailsStr = CacheDetails[0].innerHTML;
						var CacheDetailsArray = CacheDetailsStr.split(" | ");
							var CacheType = CacheDetailsArray[0];
							var geoCode = CacheDetailsArray[1];
						 
						var CacheOwner = geoCacheDetails[i].getElementsByClassName("owner");
						var Distance = geoCacheDetails[i].getElementsByClassName("mobile-show pri-6");
						var CacheBadge = geoCacheDetails[i].getElementsByClassName("cache-type");
						var CacheBadgeStr = CacheBadge[0].innerHTML;
						
						var CacheBadgeArray = CacheBadgeStr.split("<svg");
						var CacheFound;
							if (CacheBadgeArray.length > 2) {
								CacheFound = "yes";
							} else {
								CacheFound = "no"
							}	

						//console.log(`ListCaches${i}: found? ${CacheFound}, code: ${geoCode}, type ${CacheType}`);
						var LastCache;
						if(i == CacheCount-1) {
							LastCache = "yes";
						} else {
							LastCache = "no";
						}								
							
						var entry = document.createElement("div");
						entry.className = 'navItem';
						entry.tabIndex = i * 10;		

						var BadgeContent = document.createElement("span");
						BadgeContent.innerHTML = CacheBadge[0].innerHTML;
						entry.appendChild(BadgeContent);

						var headline = document.createElement("span");
						
						
						
						if(CachePremium == true) {
							headline.innerHTML = "<b><i>PREMIUM</i> " + CacheName[0].innerHTML + "</b><br>" + Distance[0].innerText;							
						} else {
							headline.innerHTML = "<b>" + CacheName[0].innerHTML + "</b><br>" + Distance[0].innerText;
						}
						entry.appendChild(headline);						
						
						// clear out any previously stored cache details in the local storage, to get ready for 
						// loading in these new details
						var ThisStoredCacheName = "storedCacheDetails" + i;
						localStorage.setItem(ThisStoredCacheName, null);							
							

							
						if (CachePremium == false)	{								
							var ContainerSize = geoCacheDetails[i].getElementsByClassName("pri-3");
							var TerrainDifficulty = geoCacheDetails[i].getElementsByClassName("pri-1");
								var Terrain = TerrainDifficulty[0].innerText;
								var Difficulty = TerrainDifficulty[1].innerText;
								var Placed = TerrainDifficulty[2].innerText;								



							LoadCacheDetailsToArray(geoCode,CacheType,CacheFound,CacheBadge[0].innerHTML,LastCache,i,"no");			

							var cLat = 0;
							var cLng = 0;

							entry.setAttribute('data-function', 'NavToCacheDetails');
							entry.setAttribute('NavCode',geoCode);

						} else {
						// load a stub of the cache into the array as a placeholder in case it's a premium only cache
						
							arrayCacheObject = {
								cacheName: "<b><i>PREMIUM</i> " + CacheName[0].innerHTML + "</b>", 
								cacheBadge: CacheBadge[0].innerHTML,
								cacheDescription: "This is a premium only cache.",
								cacheHiddenDate: "",
								cacheDifficulty: "",
								cacheTerrain: "",
								cacheSize: "",
								cacheGUID: "",
								cacheLat: 0,
								cacheLng: 0,
								cacheCode: geoCode,
								cacheType: CacheType,
								cacheFound: CacheFound,
								cacheOriginID: i								
							}
							arrayCache[i] = arrayCacheObject;						
							entry.setAttribute('data-function', 'NavToCacheDetails');
							entry.setAttribute('NavCode',geoCode);	

							//=================================
							//
							// load up local storage with a text blob with all the cache details in it
							// one localstorage variable per cache
							
							var TMPstoredCacheDetails = "<b><i>PREMIUM</i> " + CacheName[0].innerHTML + "</b>";
							TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + CacheBadge[0].innerHTML;
							TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + "This is a premium only cache.";
							TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + "";
							TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + "";
							TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + "";					
							TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + "";		
							TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + "";
							TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + 0;
							TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + 0;
							TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + geoCode;
							TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + CacheType;
							TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + CacheFound;
							TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + i;						
							
							storedCacheName = "storedCacheDetails" + i;
							localStorage.setItem(storedCacheName, TMPstoredCacheDetails);
							
							//
							//
							//==================================							
						}
						listContainer.appendChild(entry);						
					}				
				
// One More for "WAYPOINTS"		
				// how many waypoints do we have in storage?
				var waypointCount = Number(localStorage.getItem('waypointCount'));
				for (let x = 1; x < waypointCount; x++) {				
					//createWPcontainer();
					var tempX = x + 49;
					var cacheListLoc = x + CacheCount - 1;
				    storedCacheName = "storedCacheDetails_WP" + tempX;
					var arrayWaypointID = 49 + x;
					storedCacheDetails = localStorage.getItem(storedCacheName);
					if(storedCacheDetails !== null) {
						var individualCacheDetails = storedCacheDetails.split("< |v| >");
						arrayCacheObject = {
							cacheName: individualCacheDetails[0], //0
							cacheBadge: individualCacheDetails[1], //1
							cacheDescription: individualCacheDetails[2], //2
							cacheHiddenDate: individualCacheDetails[3], //3
							cacheDifficulty: individualCacheDetails[4], //4
							cacheTerrain: individualCacheDetails[5], //5
							cacheSize: individualCacheDetails[6], //6
							cacheGUID: individualCacheDetails[7], //7
							cacheLat: individualCacheDetails[8], //8
							cacheLng: individualCacheDetails[9], //9
							cacheCode: individualCacheDetails[10], //10
							cacheType: individualCacheDetails[11], //11
							cacheFound: individualCacheDetails[12], //12
							cacheOriginID: individualCacheDetails[13] //13
						}
						arrayCache[cacheListLoc] = arrayCacheObject;
						
						//and we can't forget to update the list of caches with these waypoints as well :) 
						
						var listContainer = document.getElementById('CacheList');	
						var entry = document.createElement("div");	
							entry.className = 'navItem';	
							entry.name='CacheList_WP';	
							entry.tabIndex = cacheListLoc*10;	
						var BadgeContent = document.createElement("span");				
							BadgeContent.innerHTML = "<img src='/assets/icons/icons8-waypoint-map-48.png'>";													
							entry.appendChild(BadgeContent);	
						var headline = document.createElement("span");	
							headline.innerHTML = "<b>WayPoint #" + (cacheListLoc - CacheCount + 1) + "</b><br>";	
							entry.appendChild(headline);						
						entry.setAttribute('data-function', 'NavToCacheDetails');	
						// need to create a new ID for this new waypoint - will use "waypoint" + the current location in the cache array
						var waypointArrayID = "WAYPOINT" + arrayWaypointID;
						entry.setAttribute('NavCode',waypointArrayID);						
						listContainer.appendChild(entry);							
					}
				}
				
				}
			
			}
		  } else {
			  // Oh no! There has been an error with the request!
			  console.log("some problem...");
			
		  } 
		}
		xhr.send();	
	} else {
		// load up caches from localstorage, if they existing
		// NOTE: i know this is janky as hell at the moment :)  

		var siteText = localStorage.getItem('geocachingResponse');			  
		  
		if (siteText !== null) {
		  
		  var siteDOM = new DOMParser().parseFromString(siteText, "text/html");

			if(siteDOM.title=="Geocaching") {
				console.log('not logged in');
				var CacheURL = "https://www.geocaching.com/account/signin";
				openURL(CacheURL);							
			} else {

			  var geoList = siteDOM.getElementsByTagName("tbody").namedItem("geocaches");
			  
				//console.log(`returned page title: ${siteDOM.title}`);

			  geoCacheDetails = geoList.getElementsByTagName("tr");

			  CacheCount = geoCacheDetails.length;	

				//================================================================================
				//
				// Display list of caches
				//
				//
				var listContainer = document.getElementById('CacheList');
				listContainer.innerHTML = '';
				
				kaiosToaster({
				  message: 'Loading up caches from localStorage...',
				  position: 'north',
				  type: 'warning',
				  timeout: 3000
				})				


				// remove all the cache icon markers on the map, but only if they've been placed in the first place :) 
				if (haveAllMarkersBeenPlaced == true) {
					for (let i = 0; i < arrayCache.length; i++) {
						arrayCacheMarker[i].remove();
					};
				};
				//clear out any existing caches in the array					
				arrayCache.length = 0;
				arrayCacheMarker.length = 0;
				showingAllCaches = "no";
				
				for (let i = 0; i < CacheCount; i++) {

					// the "data-premium" attribute is present when the user is not premium and the cache is premium only.  ignore those if not premium user
					var CachePremium = geoCacheDetails[i].hasAttribute("data-premium");
					//console.log(`cache ${i} is premium: ${CachePremium}`);
					
					var CacheName = geoCacheDetails[i].getElementsByClassName("cache-name");
					var CacheDetails = geoCacheDetails[i].getElementsByClassName("cache-details");
					var CacheDetailsStr = CacheDetails[0].innerHTML;
					var CacheDetailsArray = CacheDetailsStr.split(" | ");
						var CacheType = CacheDetailsArray[0];
						var geoCode = CacheDetailsArray[1];
					 
					var CacheOwner = geoCacheDetails[i].getElementsByClassName("owner");
					var Distance = geoCacheDetails[i].getElementsByClassName("mobile-show pri-6");
					var CacheBadge = geoCacheDetails[i].getElementsByClassName("cache-type");
					var CacheBadgeStr = CacheBadge[0].innerHTML;
					
					var CacheBadgeArray = CacheBadgeStr.split("<svg");
					var CacheFound;
						if (CacheBadgeArray.length > 2) {
							CacheFound = "yes";
						} else {
							CacheFound = "no"
						}	

					//console.log(`ListCaches${i}: found? ${CacheFound}, code: ${geoCode}, type ${CacheType}`);
					var LastCache;
					if(i == CacheCount-1) {
						LastCache = "yes";
					} else {
						LastCache = "no";
					}								
						
					var entry = document.createElement("div");
					entry.className = 'navItem';
					entry.tabIndex = i * 10;		

					var BadgeContent = document.createElement("span");
					BadgeContent.innerHTML = CacheBadge[0].innerHTML;
					entry.appendChild(BadgeContent);

					var headline = document.createElement("span");
					
					
					
					if(CachePremium == true) {
						headline.innerHTML = "<b><i>PREMIUM</i> " + CacheName[0].innerHTML + "</b><br>" + Distance[0].innerText;							
					} else {
						headline.innerHTML = "<b>" + CacheName[0].innerHTML + "</b><br>" + Distance[0].innerText;
					}
					entry.appendChild(headline);						
						
					if (CachePremium == false)	{								
						var ContainerSize = geoCacheDetails[i].getElementsByClassName("pri-3");
						var TerrainDifficulty = geoCacheDetails[i].getElementsByClassName("pri-1");
							var Terrain = TerrainDifficulty[0].innerText;
							var Difficulty = TerrainDifficulty[1].innerText;
							var Placed = TerrainDifficulty[2].innerText;								

						//LoadCacheDetailsToArray(geoCode,CacheType,CacheFound,CacheBadge[0].innerHTML,LastCache,i,"yes");			

						var cLat = 0;
						var cLng = 0;

						entry.setAttribute('data-function', 'NavToCacheDetails');
						entry.setAttribute('NavCode',geoCode);

					} else {
					


						entry.setAttribute('data-function', 'NavToCacheDetails');
						entry.setAttribute('NavCode',geoCode);							
					}
					listContainer.appendChild(entry);						
				}
				//====================================
				//
				// now finish loading cache details into the arrayCache array
				
				for (let j = 0; j < CacheCount; j++) {
					oneMore=j;
					storedCacheName = "storedCacheDetails" + j;
					storedCacheDetails = localStorage.getItem(storedCacheName);
					if(storedCacheDetails !== null) {
						var individualCacheDetails = storedCacheDetails.split("< |v| >");
						arrayCacheObject = {
							cacheName: individualCacheDetails[0], //0
							cacheBadge: individualCacheDetails[1], //1
							cacheDescription: individualCacheDetails[2], //2
							cacheHiddenDate: individualCacheDetails[3], //3
							cacheDifficulty: individualCacheDetails[4], //4
							cacheTerrain: individualCacheDetails[5], //5
							cacheSize: individualCacheDetails[6], //6
							cacheGUID: individualCacheDetails[7], //7
							cacheLat: individualCacheDetails[8], //8
							cacheLng: individualCacheDetails[9], //9
							cacheCode: individualCacheDetails[10], //10
							cacheType: individualCacheDetails[11], //11
							cacheFound: individualCacheDetails[12], //12
							cacheOriginID: individualCacheDetails[13] //13
						}
						arrayCache[j] = arrayCacheObject;

					}
				}
					
// One More for "WAYPOINTS"		
				// how many waypoints do we have in storage?
				var waypointCount = Number(localStorage.getItem('waypointCount'));
				for (let x = 1; x < waypointCount; x++) {				
					//createWPcontainer();
					var tempX = x + 49;
				    storedCacheName = "storedCacheDetails_WP" + tempX;
					var arrayWaypointID = CacheCount + x - 1;
					storedCacheDetails = localStorage.getItem(storedCacheName);
					if(storedCacheDetails !== null) {
						var individualCacheDetails = storedCacheDetails.split("< |v| >");
						arrayCacheObject = {
							cacheName: individualCacheDetails[0], //0
							cacheBadge: individualCacheDetails[1], //1
							cacheDescription: individualCacheDetails[2], //2
							cacheHiddenDate: individualCacheDetails[3], //3
							cacheDifficulty: individualCacheDetails[4], //4
							cacheTerrain: individualCacheDetails[5], //5
							cacheSize: individualCacheDetails[6], //6
							cacheGUID: individualCacheDetails[7], //7
							cacheLat: individualCacheDetails[8], //8
							cacheLng: individualCacheDetails[9], //9
							cacheCode: individualCacheDetails[10], //10
							cacheType: individualCacheDetails[11], //11
							cacheFound: individualCacheDetails[12], //12
							cacheOriginID: individualCacheDetails[13] //13
						}
						arrayCache[arrayWaypointID] = arrayCacheObject;
						
						//and we can't forget to update the list of caches with these waypoints as well :) 
						
						var listContainer = document.getElementById('CacheList');	
						var entry = document.createElement("div");	
							entry.className = 'navItem';	
							entry.name='CacheList_WP';	
							entry.tabIndex = arrayWaypointID*10;	
						var BadgeContent = document.createElement("span");				
							BadgeContent.innerHTML = "<img src='/assets/icons/icons8-waypoint-map-48.png'>";													
							entry.appendChild(BadgeContent);	
						var headline = document.createElement("span");	
							headline.innerHTML = "<b>WayPoint #" + (arrayWaypointID - CacheCount + 1) + "</b><br>";	
							entry.appendChild(headline);						
						entry.setAttribute('data-function', 'NavToCacheDetails');	
						// need to create a new ID for this new waypoint - will use "waypoint" + the current location in the cache array
						
						var waypointArrayID = "WAYPOINT" + tempX;
						entry.setAttribute('NavCode',waypointArrayID);						
						listContainer.appendChild(entry);							
					}
				}	
				kaiosToaster({
				message: 'Finished loading in caches from storage',
				position: 'north',
				type: 'success',
				timeout: 3000
				})	
				//========================================
			}
		}		
	}
}	

function LoadCacheDetailsToArray(CacheCode,CacheTypeIcon,IsCacheFound,CacheBadgeDetails,LastCache,sourceCacheID,loadFromStorage) {
	//console.log(`trying to show details, CacheCode = ${CacheCode}`);
	if(CacheCode!== 0) {
		if(loadFromStorage == "no") {
			//===========================================================
			//
			//  Lookup Main Details for cache
			//
			//
			var geoxhr = new XMLHttpRequest({ mozSystem: true });
			var method = "GET";
			var url = "https://www.geocaching.com/geocache/" + CacheCode;


			geoxhr.open(method, url, true);

			geoxhr.withCredentials = true;


			geoxhr.onreadystatechange = function () {
				var loadstate = geoxhr.readyState;
				var tmpCacheLat;
				var tmpCacheLng;
				if (loadstate == 1) {
					  //console.log('request opened');
				} else if (loadstate == 2) {
					//console.log('headers received'); 
				} else if (loadstate == 3) {
					  //console.log('loading data');
				} else if (loadstate == 4) {
					var status = geoxhr.status;
					if (status >= 200 && status < 400) {
							
							
						var pageText = geoxhr.response;
						

						
						var pageDOM = new DOMParser().parseFromString(pageText, "text/html");
						
						var LatLngStr = pageDOM.getElementById("uxLatLon");
						//console.log(`LatLngStr: ${LatLngStr.innerHTML}`);
						var LatLngString = LatLngStr.innerHTML;

						var latNS = LatLngString.substr(0,1);
						var lngEW = LatLngString.substr(13,1);
						var latDeg = Number(LatLngString.substr(2,2));
						var latMin = Number(LatLngString.substr(6,6));
						//var latSec = Number(0);
						var lngDeg = Number(LatLngString.substr(15,3));
						var lngMin = Number(LatLngString.substr(20,6));
						//var lngSec = Number(0);
						
						tmpCacheLat = latDeg + (latMin/60);
						tmpCacheLng = lngDeg + (lngMin/60);
						
						if(latNS == "S") {
							tmpCacheLat = tmpCacheLat * -1;
						}
						if(lngEW == "W") {
							tmpCacheLng = tmpCacheLng * -1;
						}			  

						// now find the other cache details				
							var cacheName = pageDOM.getElementById("ctl00_ContentBody_CacheName");
							var cacheNameHTML = cacheName.innerHTML;
							var CacheLongDesc = pageDOM.getElementById("ctl00_ContentBody_LongDescription");
							var CacheLongDescHTML = CacheLongDesc.innerHTML;
							var cacheIcon = pageDOM.getElementsByClassName("activity-type-icon");
							var cacheHiddenDate = pageDOM.getElementById("ctl00_ContentBody_mcd2");
							var cacheDifficulty = pageDOM.getElementById("ctl00_ContentBody_uxLegendScale");
							var cacheTerrain = pageDOM.getElementById("ctl00_ContentBody_Localize12");
							var cacheSize = pageDOM.getElementsByClassName("minorCacheDetails");
							var cacheHint = pageDOM.getElementById("div_hint");
							var cacheGUID = pageDOM.getElementById("ctl00_ContentBody_uxLogbookLink");
								var cacheGUIDid = cacheGUID.href;
								var locOfGUID = cacheGUIDid.search(/GUID/i);
								//cacheGUIDvalue = cacheGUIDid.substr(locOfGUID+5);
								
							//var cacheDistanceFromMe = 0;//findDistance(myLat,myLng,tmpCacheLat,tmpCacheLng);
						
						arrayCacheObject = {
							cacheName: cacheNameHTML, //0
							cacheBadge: CacheBadgeDetails, //1
							cacheDescription: CacheLongDescHTML, //2
							cacheHiddenDate: cacheHiddenDate.innerHTML, //3
							cacheDifficulty: cacheDifficulty.innerHTML, //4
							cacheTerrain: cacheTerrain.innerHTML, //5
							cacheSize: cacheSize[2].innerHTML, //6
							cacheGUID: cacheGUIDid.substr(locOfGUID+5), //7
							cacheLat: tmpCacheLat, //8
							cacheLng: tmpCacheLng, //9
							cacheCode: CacheCode, //10
							cacheType: CacheTypeIcon, //11
							cacheFound: IsCacheFound, //12
							cacheOriginID: sourceCacheID //13
						}
						arrayCache[sourceCacheID] = arrayCacheObject;
	
						//=================================
						//
						// load up local storage with a text blob with all the cache details in it
						// one localstorage variable per cache
						
						var TMPstoredCacheDetails = cacheNameHTML;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + CacheBadgeDetails;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + CacheLongDescHTML;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + cacheHiddenDate.innerHTML;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + cacheDifficulty.innerHTML;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + cacheTerrain.innerHTML;					
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + cacheSize[2].innerHTML;		
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + cacheGUIDid.substr(locOfGUID+5);
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + tmpCacheLat;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + tmpCacheLng;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + CacheCode;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + CacheTypeIcon;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + IsCacheFound;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + sourceCacheID;						
						
						storedCacheName = "storedCacheDetails" + sourceCacheID;
						localStorage.setItem(storedCacheName, TMPstoredCacheDetails);
						
						//
						//
						//==================================

						if(LastCache == "yes") {
							//localStorage.setItem('storedCacheDetails', storedCacheDetails);
							kaiosToaster({
							  message: 'Finished loading in caches',
							  position: 'north',
							  type: 'success',
							  timeout: 3000
							})	
						}
					}
				} 
			}
			geoxhr.send();
		} else {
			// pull in cache details from localstorage 
			storedCacheDetails = localStorage.getItem('storedCacheDetails1');
			var individualCacheDetails = storedCacheDetails.split("< |v| >");
			console.log(`there are ${individualCacheDetails.length} here`);
		}
	}
}

function ShowAllCachesOnMap(ShowCaches) {

	//console.log(`in showallcaches, showCaches: ${ShowCaches}`);
	var CacheNumber = arrayCache.length;
	
	console.log(`num caches in array: ${CacheNumber}`);
	
	cacheIconDisplay = document.getElementById("cacheIconDisplay");

	
	
	
	if(ShowCaches=="yes-noName"){
		for (let i = 0; i < CacheNumber; i++) {
			if(arrayCache[i].cacheFound == "yes") {
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Found_cache}).addTo(map);
			} else if(arrayCache[i].cacheType == "Traditional") {
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Traditional_cache}).addTo(map);
			} else if (arrayCache[i].cacheType == "Mystery") {
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Mystery_cache}).addTo(map);		
			} else if (arrayCache[i].cacheType == "Multi-Cache") {
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Multi_cache}).addTo(map);		
			} else if (arrayCache[i].cacheType == "Virtual") {
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Virtual_cache}).addTo(map);			
			} else if (arrayCache[i].cacheType == "Earth") {
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Earth_cache}).addTo(map);	
			} else if (arrayCache[i].cacheType == "WAYPOINT") {
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Waypoint_cache}).addTo(map);				
			} else {
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Traditional_cache}).addTo(map);
			}
		}
		cacheIconDisplay.innerHTML = "Show names on mapped cache icons";			
	} else if (ShowCaches=="yes-yesName") {
		for (let i = 0; i < CacheNumber; i++) {
			arrayCacheMarker[i].bindTooltip(arrayCache[i].cacheName).openTooltip();
		}
		cacheIconDisplay.innerHTML = "Hide all mapped cache icons";		
	} else {
		// hide all the caches on the map
		for (let i = 0; i < CacheNumber; i++) {
			arrayCacheMarker[i].remove();
		}
		cacheIconDisplay.innerHTML = "Show all cache icons on map";			
	}
	haveAllMarkersBeenPlaced = true;

}

function ShowCacheDetails(CacheCode) {
	//console.log(`loading individual cache details for ${CacheCode}`);
	  
	  var divHeight = document.getElementById('CacheDescription').style.height        
		//console.log(`CacheDescription height: ${divHeight}`);
		
	if(CacheCode!== 0) {
		var CacheID = -1;
		for (let i = 0; i < arrayCache.length; i++) {
		  // search for cache in array
		  if (CacheCode == arrayCache[i].cacheCode) {
			CacheID = i;
			
			// load up the prev and next cache array IDs as well
			var myArrayLength = arrayCache.length;			
			if(i==0) {
				prevCacheID = myArrayLength - 1;
				nextCacheID = i + 1;
			} else if (i == (myArrayLength - 1)) {
				prevCacheID = i - 1;
				nextCacheID = 0;
			} else {
				prevCacheID = i - 1;
				nextCacheID = i + 1;
			}			
			//console.log(`prev/next IDs: ${prevCacheID}/${nextCacheID}`);
		  }
		}		
		
		var CompassCacheName = document.getElementById('cacheName');	
		var CacheHeader = document.getElementById('CacheHeaderDetail');		
		if (CacheID !== -1) {
			//show cache name on the big compass view	
			CompassCacheName.innerHTML = "<b>" + arrayCache[CacheID].cacheName + "</b>";
					
			//================
			// find our current distance from this cache
			//
			var TempCacheLat = arrayCache[CacheID].cacheLat;
			var TempCacheLng = arrayCache[CacheID].cacheLng;	
			var strTripDistance;
			
			if (TempCacheLat !== 0 && TempCacheLng !== 0) {
				var tripDistance = findDistance(my_current_lat,my_current_lng,TempCacheLat,TempCacheLng);
				//console.log(`Cache distance is ${tripDistance}`);
				//console.log(`showing cache distance, myUnits are ${myUnits}`);
				if(myUnits == "mi") {
					if(tripDistance < .5) {
						strTripDistance = `${roundToTwo(tripDistance * 5280)}ft`;
					} else {
						strTripDistance = `${roundToTwo(tripDistance)}mi`;		
					};
				} else {
					if(tripDistance < .5) {
						strTripDistance = `${roundToTwo(tripDistance * 1000)}m`;
					} else {
						strTripDistance = `${roundToTwo(tripDistance)}km`;
					};
				};
			} else {
				strTripDistance = "";
			}
					
			//================================================================================
			//
			// Display Cache Details
			//

			CacheHeader.innerHTML = '';	
				var BadgeContent = document.createElement("span");
				BadgeContent.innerHTML = arrayCache[CacheID].cacheBadge + "<b>" + arrayCache[CacheID].cacheName + "</b>";
			CacheHeader.appendChild(BadgeContent);	
				
			var CacheLevels = document.getElementById('CacheDetails');
			CacheLevels.innerHTML = '';	
				var CacheLevelsDetail = document.createElement("span");
				CacheLevelsDetail.innerHTML = "Distance: " + strTripDistance + "<br>" + arrayCache[CacheID].cacheHiddenDate + "<br>Difficulty: " + arrayCache[CacheID].cacheDifficulty + "<br>Terrain: " + arrayCache[CacheID].cacheTerrain + "<br>Size: " + arrayCache[CacheID].cacheSize+"<br>&#x2295; "+displayPosition(arrayCache[CacheID].cacheLat, arrayCache[CacheID].cacheLng,app.gpsCoordRepresentation);
			if(arrayCache[CacheID].cacheType == "WAYPOINT"){
				CacheLevelsDetail.innerHTML = "Distance: " + strTripDistance + "<br>" + arrayCache[CacheID].cacheHiddenDate;
			}
			CacheLevels.appendChild(CacheLevelsDetail);	
					
			var CacheDescStr = document.getElementById('CacheDescription');
			CacheDescStr.innerHTML = '';	
				var CacheDescription = document.createElement("span");
				CacheDescription.innerHTML = "<b>Description</b><br>" + arrayCache[CacheID].cacheDescription;
			if(arrayCache[CacheID].cacheType == "WAYPOINT"){
				CacheDescription.innerHTML = arrayCache[CacheID].cacheDescription;;
			}
				CacheDescStr.appendChild(CacheDescription);

			var CacheActionsDIV = document.getElementById('CacheActions');
			
			if(arrayCache[CacheID].cacheType !== "WAYPOINT"){
				CacheActionsDIV.innerHTML = "*: View Logs<br>0: View Photo Gallery<br>#: Log Cache";
			} else {
				CacheActionsDIV.innerHTML = "";
			};
			
			if (TempCacheLat !== 0 && TempCacheLng !== 0) {			
				navGeoCode = CacheCode;
				cacheGUIDvalue = arrayCache[CacheID].cacheGUID;
			} else {
				navGeoCode = 0;
				cacheGUIDvalue = null;
			}



		} else {
			// did not find the cache
			CompassCacheName.innerHTML = "<b>Could not find the cache from the list of retrieved caches...</b>";
			CacheHeader.innerHTML = "<b>Could not find the cache from the list of retrieved caches...</b>";
		}
	}
}


function ShowCacheOnMap(CacheCode) {
	var CacheID = -1;
	console.log(`trying to show cache ${CacheCode}`);
	for (let i = 0; i < arrayCache.length; i++) {
	  // search for cache in array
	  if (CacheCode == arrayCache[i].cacheCode) {
		CacheID = i;
	  }
	}	
	console.log(`CacheID: ${CacheID}, isDefined: ${CacheHasBeenDefined}`);
	if(CacheHasBeenDefined == false) {
		if(CacheCode!== 0) {
			Cache = L.marker([arrayCache[CacheID].cacheLat,arrayCache[CacheID].cacheLng], {icon: NavTo_cache}).addTo(map);
			CacheLat = arrayCache[CacheID].cacheLat;
			CacheLng = arrayCache[CacheID].cacheLng;
			navCacheName = arrayCache[CacheID].cacheName;
			CacheHasBeenDefined = true;	
			MovemMap("focusOnCache");							
		}
	} else {
		if(CacheCode !== 0) {
			Cache.remove();
			Cache = L.marker([arrayCache[CacheID].cacheLat,arrayCache[CacheID].cacheLng], {icon: NavTo_cache}).addTo(map);
			CacheLat = arrayCache[CacheID].cacheLat;
			CacheLng = arrayCache[CacheID].cacheLng;
			navCacheName = arrayCache[CacheID].cacheName;
			CacheHasBeenDefined = true;	
			MovemMap("focusOnCache");
		} else {
			console.log('remove cache pin');
			Cache.remove();
		}
	}
	//ShowCacheDetails(CacheCode);
}

function FindClosestCache(sourceLat,sourceLng){
	var closestCache;
	var thisCacheLat;
	var thisCacheLng;
	var thisCacheID;
	var closestDistance;
	var tmpDistance;
	var thisCacheName;
	var thisCacheCode;

	//take the reference lat/lng and cycle through the cache list and see what is closestCache
	//return the CacheID and the distance to it
	if(arrayCache.length > 0) {
		for (let i = 0; i < arrayCache.length; i++) {
			thisCacheLat = arrayCache[i].cacheLat;
			thisCacheLng = arrayCache[i].cacheLng;


			tmpDistance = findDistance(sourceLat,sourceLng,thisCacheLat,thisCacheLng);
			if (i > 0) {
			 if(tmpDistance < closestDistance) {
				closestDistance = tmpDistance; 
				thisCacheID = i;	
				thisCacheCode = arrayCache[i].cacheCode;
				thisCacheName = arrayCache[i].cacheName;
			 }
			} else {
				closestDistance = tmpDistance;
				thisCacheID = i;
				thisCacheCode = arrayCache[i].cacheCode;	
				thisCacheName = arrayCache[i].cacheName;				
			};
		}
	} else {
		//no caches loaded in the list!
	};

	closestCache = {
		cacheID:thisCacheID,
		cacheDistance: closestDistance,
		cacheCode: thisCacheCode,
		cacheName: thisCacheName
	};
	return closestCache;
};

function aboutDialog() {
	alert("Caching on Kai 0.1.5\nBuilt by canyouswim\nIcons by Icons8.com\nMap data OpenStreetMap.org, contributors CC-BY-SA");
}

function viewShortcuts() {
	alert("1 -ZOOM+ 3\nENTER: Center on me\n4: Cache List\n5: Center on Cache\n6: View Map\n7:Cache Details");
	
}
	//Use javadoc format to make documentation easy? 	
	/**	
	 * Converts two floats that represents latitude and longitude in lat,lng format into a string.	
	 * @param lat float for latitude	
	 * @param lng float for longitude	
	 * @param format string for output format it can be: "DDD","DMM" or "DMS"	
	 * 	
	 * @return string with a beautiful pair of coordinates	
	 */	
	function displayPosition(lat,lng,format){	
	var ret=" ";	
	var latDisplay=0;	
	var longDisplay=0;	
	var latLetter="N";	
	var longLetter="E";	
	lat = parseFloat(lat);
	lng = parseFloat(lng);	
		
		
	    if (format == "DDD") {	
		
	      if(lat>=0){	
			  latLetter="N";	
			  latDisplay =  lat.toFixed(5);	
		  }	
		  else{	
			  latLetter="S";	
			  latDisplay =  -lat.toFixed(5);	
		  }	
	      if(lng>=0){	
			  longLetter="E";	
			  longDisplay = lng.toFixed(5);	
		  }	
		  else{	
			  longLetter="W";	
			  longDisplay = -lng.toFixed(5);	
		  }	
	     latDisplay=""+latLetter+latDisplay+"°"; 	
	     longDisplay=""+longLetter+longDisplay+"°";	
	      		//beware of ° (geocaching and american degree symbol) <-- this is used here	
				//and º (masculine ordinal indicator symbol, my keyboard key) aren't the same symbol	
	    } else if (format == "DMM") { 	
			  var latD, latM, lonD, lonM;	
			  if(lat>=0){	
				  latLetter="N";	
					  latD=Math.floor(lat);	
					  latM=((lat-Math.floor(lat))*60).toFixed(3);	
			  }	
			  else{	
				  latLetter="S";	
					var latit=-lat;	
					  latD=Math.floor(latit);	
					  latM=((latit-Math.floor(latit))*60).toFixed(3);	
			  }	
			  if(lng>=0){	
				  longLetter="E";	
					  lonD=Math.floor(lng);	
					  lonM=((lng-Math.floor(lng))*60).toFixed(3);	
			  }	
			  else{	
				  longLetter="W";	
				 var longit=-lng;	
					  lonD=Math.floor(longit);	
					  lonM=((longit-Math.floor(longit))*60).toFixed(3);	
			  }	
		
		
			  latDisplay = ""+latLetter+latD+"°"+latM+"'";	
			  longDisplay = ""+longLetter+lonD+"°"+lonM+"'";	
	      		//beware of ° (geocaching and american degree symbol) <-- this is used here	
				//and º (masculine ordinal indicator symbol, my keyboard key) aren't the same symbol	
	      	
	    } else if (format == "DMS") {	
	      var latD, latM, latS, lonD, lonM, lonS;	
	      if(lat>=0){
			  latLetter="N";		
	              latD=Math.floor(lat);	
	              latM=Math.floor((lat-Math.floor(lat))*60);	
	              latS=(((lat-Math.floor(lat))*60-Math.floor((lat-Math.floor(lat))*60))*60).toFixed(3);
	      }	
	      else{	
			  latLetter="S";
	        var latit=-lat;	
	              latD=Math.floor(latit);	
	              latM=Math.floor((latit-Math.floor(latit))*60);	
	              latS=(((latit-Math.floor(latit))*60-Math.floor((latit-Math.floor(latit))*60))*60).toFixed(3);
	      }	
	      if(lng>=0){
			  longLetter="E";		
	              lonD=Math.floor(lng);	
	              lonM=Math.floor((lng-Math.floor(lng))*60);	
	              lonS=(((lng-Math.floor(lng))*60-Math.floor((lng-Math.floor(lng))*60))*60).toFixed(3);
	      }	
	      else{	
			  longLetter="W";
	         var longit=-lng;	
	              lonD=Math.floor(longit);	
	              lonM=Math.floor((longit-Math.floor(longit))*60);	
				  lonS=(((longit-Math.floor(longit))*60-Math.floor((longit-Math.floor(longit))*60))*60).toFixed(3);			
	      }	
		
		
	      latDisplay = ""+latLetter+latD+"°"+latM+"'"+latS+"\"";	
	      longDisplay = ""+longLetter+lonD+"°"+lonM+"'"+lonS+"\"";	
	      		//beware of ° (geocaching and american degree symbol) <-- this is used here	
				//and º (masculine ordinal indicator symbol, my keyboard key) aren't the same symbol	
	      	
	    }	
	   	
	 ret=""+latDisplay+" "+longDisplay;   	
	return ret;	
	}	
	/**	
	 * returns latitude or longitude as a float, when they are codified in a string with this formats, for example:	
	 * <ul>	
	 * <li> N55.555°,S55.555°,E55.555° or W55.555°	
	 * <li> N5°55.555',S5°55.555',E5°55.555' or W5°55.555'	
	 * <li> N5°55'5.555",S5°55'5.555",E5°55'5.555" or W5°55'5.555"	
	 * <ul>	
	 * @param str A string with a codified Latitude or Longitude.	
	 * @return Signed float number for latitude or longitude.	
	 **/	
	function extractValue(str){	
		
		var d=0,m=0,s=0;	
		var val=0;	
		
				str=str.replace("N","+");	
				str=str.replace("S","-");	
				str=str.replace("E","+");	
				str=str.replace("W","-");	
				d=parseFloat(str.split("°")[0]);	
				if(!isNaN(d)){	
					m=parseFloat(str.split("°")[1].split("'")[0]);	
	      		//beware of ° (geocaching and american degree symbol) <-- this is used here	
				//and º (masculine ordinal indicator symbol, my keyboard key) aren't the same symbol	
					if(!isNaN(m)){	
						s=parseFloat(str.split("°")[1].split("'")[1].split("\"")[0]);	
					}	
				}	
		
			  	
			  if(isNaN(d))d=0;	
			  if(isNaN(m))m=0;	
			  if(isNaN(s))s=0;	
			  if(d>0){
				  val=d+m/60+s/3600;
			  }	
			  if(d<0){
				  val=d-m/60-s/3600;	
			  }
				  
				
	return val;	
	}	
	/**@todo	
	 * Stores the coordinates given by the user.	
	 * They can be given in these formats:	
	 * <ul>	
	 * <li>D.ddd°	
	 * <li>D°M.mmm' (default)	
	 * <li>D°M'S.ss"	
	 * <li>GCxxxxx (???)	
	 * </ul>	
	 * 	
	 * @param mode It can be set as these values:	
	 * <ul>	
	 * <li>"SaveWP" Just store map center as waypoint in a global variable	
	 * <li>"EditWP" Modify content.innerHTML and enter in edition mode	
	 * <li>"EndEdition" Save edited WP in a global variable and center map there.	
	 * </ul>	
	 * @todo Maybe also these other values for mode:	
	 * <ul>	
	 * <li>"SetAsHome" Set default home location	
	 * <li>"MapThis" Center map at this location	
	 * <li>"CachesAt" Load nearest caches	
	 * <li>"NavTo" Set as a "gosht cache" goal and navigate there	
	 * </ul>	
	 * 	
	 * @param myGoal	
	 * @return myWP	
	 * 	
	 **/	
	function giveMeWayPoint(mode){	
			var mapCrd = map.getCenter();	
			var mapLat = mapCrd.lat;	
			var mapLng = mapCrd.lng;	
		
			switch (mode) {	
				case 'SaveWP':	
					var myCoords=displayPosition(mapLat,mapLng,app.gpsCoordRepresentation);	
					wpContainer.style.display = 'block';	
					wpContainer.innerHTML = "SaveWP: "+myCoords;	
					myWP.lat=mapLat;	
					myWP.lng=mapLng;	
					app.editWPmode=0;	
					kaiosToaster({	
							  message: 'WayPoint Saved',	
							  position: 'south',	
							  type: 'success',	
							  timeout: 3000	
							})	
				break;	
				case 'EditWP':	

					if(app.editWPmode==0){
							kaiosToaster({	
									  message: 'Nav to the WayPoint location you want and press OK to select, edit, and save the location',	
									  position: 'south',	
									  type: 'default',	
									  timeout: 4000	
							})
						app.editWPmode=1;
						}			
						else if(app.editWPmode==1){
							wpContainer.style.display = 'block';	
							wpContainer.style.backgroundColor = 'yellow';							
							var myCoords=displayPosition(mapLat,mapLng,app.gpsCoordRepresentation);	
							wpContainer.innerHTML = "EditWP: "+myCoords;	
							wpIndex=wpContainer.innerHTML.length;
							kaiosToaster({	
									  message: 'WayPoint selected - edit and press OK to save',	
									  position: 'south',	
									  type: 'success',	
									  timeout: 3000	
							})
							app.editWPmode=2;
							}	
	
				break;	
				case 'EndEdition':	
					wpContainer.innerHTML=wpContainer.innerHTML.replace("|","");	
					var goal_lat_str= wpContainer.innerHTML.split(" ")[1];	
					var goal_lon_str= wpContainer.innerHTML.split(" ")[2];	
					myWP.lat=extractValue(goal_lat_str);	
					myWP.lng=extractValue(goal_lon_str);		
		
	
						
					var myCoords=displayPosition(myWP.lat,myWP.lng,app.gpsCoordRepresentation);
					wpContainer.innerHTML = "CurrentWP: "+myCoords;
					
					addNewWP(myWP.lat, myWP.lng,"WAYPOINT");
					wpContainer.style.backgroundColor = 'white';								
					kaiosToaster({	
							  message: 'WayPoint Saved',	
							  position: 'south',	
							  type: 'success',	
							  timeout: 3000	
					});	
					app.editWPmode=0;	
					//wpContainer.style.display = 'none';	
				break;	
					
				default: ;	
				
		
		
			}	
	}	
	
	
	/**
	 * Allows user modify wpContainer.innerHTML at runtime, convinated with givemeWayPoint()
	 * @param val It can have these values:
	 * <ul> 'END' call for giveMeWayPoint("EndEdition");
	 * <li> 'LEFT' moves the cursor -1 char to left
	 * <li> 'RIGHT' moves the cursor +1 char to right
	 * <li> 'ERASE' removes the char at left of the cursor
	 * <li> '0'
	 * 		<ul>
	 * 		<li> push a space and a W, " W", at index of the cursor, only if the index char is the propper of each app.gpsCoordRepresentation
	 * 		<li> push '0' at index of the cursor, in other case.
	 * 		<ul> 
	 * <li> '1' push '1' at index of the cursor
	 * <li> '2' push '2' at index of the cursor
	 * <li> '3' push '3' at index of the cursor
	 * <li> '4' push '4' at index of the cursor
	 * <li> '5' push '5' at index of the cursor
	 * <li> '6' push '6' at index of the cursor
	 * <li> '7' push '7' at index of the cursor
	 * <li> '8' push '8' at index of the cursor
	 * <li> '9' push '9' at index of the cursor
	 * <li> '#' 
	 *		<ul>
	 * 		<li> push '°' at index of the cursor if ther is no symbol before
	 * 		<li> switch the char between "°" "'", "/" and "" if there is one of these symbols present at the index of the cursor
	 * 		<li> switch the char between "N" and "S" if there is one of these symbols present
	 * 		<li> switch the char between "E" and "W" if there is one of these symbols present
	 * 		<ul> 
	 * </ul>	
	 *
	 * 	
	 **/			
	function editWP(val){	
	wpContainer.innerHTML=wpContainer.innerHTML.replace("|","");	
		switch(val){	
		  case 'END':	
				giveMeWayPoint("EndEdition");	
		  break;	
		  case 'LEFT':	
		  		if(wpIndex>wpContainer.innerHTML.split(" ")[1].length-2){	
						if(wpContainer.innerHTML.slice(wpIndex-1,wpIndex)=="W"||wpContainer.innerHTML.slice(wpIndex-1,wpIndex)=="E"){	
							wpIndex=wpIndex-2;	
						}else{	
							wpIndex=wpIndex-1;	
						}	
					}	
		  break;	
		  case 'RIGHT':	
				if(wpIndex<wpContainer.innerHTML.length){	
						if(wpContainer.innerHTML.slice(wpIndex,wpIndex+1)==" "){	
							wpIndex=wpIndex+2;	
						}else{	
							wpIndex=wpIndex+1;	
						}	
					}	
		  break;	
		  case 'ERASE':	
				if(wpIndex>wpContainer.innerHTML.split(" ")[1].length-2){	
					if(wpContainer.innerHTML.slice(wpIndex-1,wpIndex)=="W"||wpContainer.innerHTML.slice(wpIndex-1,wpIndex)=="E")	
					{	
						wpContainer.innerHTML = wpContainer.innerHTML.slice(0,wpIndex-2)+wpContainer.innerHTML.slice(wpIndex,wpContainer.innerHTML.length);	
						wpIndex=wpIndex-2;	
					}else{	
						if(wpContainer.innerHTML.slice(wpIndex-1,wpIndex)!="N"&&wpContainer.innerHTML.slice(wpIndex-1,wpIndex)!="S")	
						{	
		
							wpContainer.innerHTML = wpContainer.innerHTML.slice(0,wpIndex-1)+wpContainer.innerHTML.slice(wpIndex,wpContainer.innerHTML.length);	
							wpIndex=wpIndex-1;	
						}	
					}	
				}	
		  break;	
	      case '0':	
				var finLatitud="'";	
				if(app.gpsCoordRepresentation == "DDD")finLatitud="°";				 	
	      		//beware of ° (geocaching and american degree symbol) <-- this is used here	
				//and º (masculine ordinal indicator symbol, my keyboard key) aren't the same symbol	
				if(app.gpsCoordRepresentation == "DMM")finLatitud="'";	
				if(app.gpsCoordRepresentation == "DMS")finLatitud="\"";	
					
				if(wpContainer.innerHTML.slice(wpIndex-1,wpIndex)==finLatitud){	
				   wpContainer.innerHTML =wpContainer.innerHTML.slice(0,wpIndex)+" W"+wpContainer.innerHTML.slice(wpIndex);	
				   wpIndex=wpIndex+2;	
			   }	
				else{	
				   wpContainer.innerHTML =wpContainer.innerHTML.slice(0,wpIndex)+"0"+wpContainer.innerHTML.slice(wpIndex);	
				   wpIndex=wpIndex+1;	
				}	
		   break;	
	       case '1':             	
				wpContainer.innerHTML =wpContainer.innerHTML.slice(0,wpIndex)+"1"+wpContainer.innerHTML.slice(wpIndex);	
				   wpIndex++;	
		   break;	
	       case '2':	
				wpContainer.innerHTML =wpContainer.innerHTML.slice(0,wpIndex)+"2"+wpContainer.innerHTML.slice(wpIndex);	
				   wpIndex++;	
			break;	
	       case '3':	
				 wpContainer.innerHTML =wpContainer.innerHTML.slice(0,wpIndex)+"3"+wpContainer.innerHTML.slice(wpIndex);	
				   wpIndex++;	
			break;	
	       case '4':	
				wpContainer.innerHTML =wpContainer.innerHTML.slice(0,wpIndex)+"4"+wpContainer.innerHTML.slice(wpIndex);	
				   wpIndex++;	
			break;	
	       case '5':	
				wpContainer.innerHTML =wpContainer.innerHTML.slice(0,wpIndex)+"5"+wpContainer.innerHTML.slice(wpIndex);	
				   wpIndex++;	
			break;	
	       case '6':	
				wpContainer.innerHTML =wpContainer.innerHTML.slice(0,wpIndex)+"6"+wpContainer.innerHTML.slice(wpIndex);	
				   wpIndex++;	
			break;	
	       case '7':	
				wpContainer.innerHTML =wpContainer.innerHTML.slice(0,wpIndex)+"7"+wpContainer.innerHTML.slice(wpIndex);	
				   wpIndex++;	
			break;	
	       case '8':	
				wpContainer.innerHTML =wpContainer.innerHTML.slice(0,wpIndex)+"8"+wpContainer.innerHTML.slice(wpIndex);	
				   wpIndex++;	
			break;      	
	       case '9':	
				wpContainer.innerHTML =wpContainer.innerHTML.slice(0,wpIndex)+"9"+wpContainer.innerHTML.slice(wpIndex);	
				   wpIndex++;	
			break;	
	       case '#': //for symbols: ° ' " . N S E W  	
	      		//beware of ° (geocaching and american degree symbol) <-- this is used here	
				//and º (masculine ordinal indicator symbol, my keyboard key) aren't the same symbol	
				if(wpContainer.innerHTML.slice(wpIndex-1,wpIndex)=="°"){	
					wpContainer.innerHTML = wpContainer.innerHTML.substr(0,  wpIndex-1)+ "."+wpContainer.innerHTML.slice(wpIndex,wpContainer.innerHTML.length);	
				}	
				else if(wpContainer.innerHTML.slice(wpIndex-1,wpIndex)=="."){	
					wpContainer.innerHTML = wpContainer.innerHTML.substr(0,  wpIndex-1)+ "'"+wpContainer.innerHTML.slice(wpIndex,wpContainer.innerHTML.length);	
				}	
				else if(wpContainer.innerHTML.slice(wpIndex-1,wpIndex)=="'"){	
					wpContainer.innerHTML = wpContainer.innerHTML.substr(0,  wpIndex-1)+ "\""+wpContainer.innerHTML.slice(wpIndex,wpContainer.innerHTML.length);	
				}	
				else if(wpContainer.innerHTML.slice(wpIndex-1,wpIndex)=="\""){	
					wpContainer.innerHTML = wpContainer.innerHTML.substr(0,wpIndex-1)+wpContainer.innerHTML.slice(wpIndex,wpContainer.innerHTML.length);	
					wpIndex--;	
				}	
					
		
					
				else if(wpContainer.innerHTML.slice(wpIndex-1,wpIndex)=="S"){	
					wpContainer.innerHTML = wpContainer.innerHTML.substr(0,  wpIndex-1)+ "N"+wpContainer.innerHTML.slice(wpIndex,wpContainer.innerHTML.length);	
				}	
				else if(wpContainer.innerHTML.slice(wpIndex-1,wpIndex)=="N"){	
					wpContainer.innerHTML = wpContainer.innerHTML.substr(0,  wpIndex-1)+ "S"+wpContainer.innerHTML.slice(wpIndex,wpContainer.innerHTML.length);	
				}	
				else if(wpContainer.innerHTML.slice(wpIndex-1,wpIndex)=="W"){	
					wpContainer.innerHTML = wpContainer.innerHTML.substr(0,  wpIndex-1)+ "E"+wpContainer.innerHTML.slice(wpIndex,wpContainer.innerHTML.length);	
				}	
				else if(wpContainer.innerHTML.slice(wpIndex-1,wpIndex)=="E"){	
					wpContainer.innerHTML = wpContainer.innerHTML.substr(0,  wpIndex-1)+ "W"+wpContainer.innerHTML.slice(wpIndex,wpContainer.innerHTML.length);	
				}				
				else if(wpContainer.innerHTML.slice(wpIndex-1,wpIndex)!="N"&&wpContainer.innerHTML.slice(wpIndex-1,wpIndex)!="S"&&wpContainer.innerHTML.slice(wpIndex-1,wpIndex)!="E"&&wpContainer.innerHTML.slice(wpIndex-1,wpIndex)!="W")	
					{	
						wpContainer.innerHTML = wpContainer.innerHTML.substr(0,  wpIndex)+"°"+wpContainer.innerHTML.slice(wpIndex,wpContainer.innerHTML.length);	
						wpIndex=wpIndex+1;	
					}	
	        	
	        break;	
				
		}	
			
	wpContainer.innerHTML =wpContainer.innerHTML.slice(0,wpIndex)+"|"+wpContainer.innerHTML.slice(wpIndex);	
		
	}


function createWPcontainer(){
						//....................Creating waypoint container:
						var lastID=CacheCount;
						var listContainer = document.getElementById('CacheList');	
						var entry = document.createElement("div");	
							entry.className = 'navItem';	
							entry.name='CacheList_WP';	
							entry.tabIndex = lastID*10;	
						var BadgeContent = document.createElement("span");	
							//BadgeContent.innerHTML = "<img width='32' height='32' src='/assets/icons/icons8-waypoint-map-48.png'>";			
							BadgeContent.innerHTML = "<img src='/assets/icons/icons8-waypoint-map-48.png'>";													
							entry.appendChild(BadgeContent);	
						var headline = document.createElement("span");	
							headline.innerHTML = "<b>WayPoints</b><br>Stored WP";	
							entry.appendChild(headline);						
						entry.setAttribute('data-function', 'NavToCacheDetails');	
						entry.setAttribute('NavCode',"WAYPOINT");						
						listContainer.appendChild(entry);
						
						var arrayCacheObject = {
							cacheName: "Waypoints", 
							cacheBadge: "&#128681;",
							cacheDescription: "",
							cacheHiddenDate: "",
							cacheDifficulty: "",
							cacheTerrain: "",
							cacheSize: "",
							cacheGUID: "",
							cacheLat: myWP.lat,
							cacheLng: myWP.lng,
							cacheCode: "WAYPOINT",
							cacheType: "WAYPOINT",
							cacheFound: false,
							cacheOriginID: lastID
						}
						arrayCache[CacheCount] = arrayCacheObject;
						
						//=================================
						//
						// load up local storage with a text blob with all the cache details in it
						// one localstorage variable per cache
						
						var TMPstoredCacheDetails = arrayCacheObject.cacheName;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheBadge;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheDescription;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheHiddenDate;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheDifficulty;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheTerrain;					
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheSize;		
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheGUIDid;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheLat;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheLng;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheCode;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheType;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheFound;
						TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheOriginID;						
						
						var storedCacheName = "storedCacheDetails_WP";
						localStorage.setItem(storedCacheName, TMPstoredCacheDetails);
						
						//
						//
						//==================================

						
						
						
						
						
						
						//arrayCache.push(arrayCacheObject);
						//LoadCacheDetailsToArray(geoCode,CacheType,CacheFound,CacheBadge[0].innerHTML,LastCache,i);						
						//CacheCount++;
//....................End of Creating waypoint container

}


//This is not working
//function ListCaches2(myLat,myLng) {	
//	ListCaches(myLat,myLng);
//	//createWPcontainer(arrayCache.length);
//	CacheCount=arrayCache.length;
//}


	/** @todo It only works with the special "WAYPOINT" cache. Allow work with every cache_id.
	 *  adds new waypoint to the cache description and changes default lat and lng, then navigate there.
	 * 
	 * 	
	 **/
function addNewWP(lat, lng, cache_id){
	var wpID = -1;
	if(cache_id=="WAYPOINT"){
		// create a new WayPoint container in the cache list and arrayCache object
		
		for (let i = 0; i < arrayCache.length; i++) {
			if(arrayCache[i].cacheType == "WAYPOINT"){
				wpID = i;
			}
		}	
		// jump to the end of the list of caches, and create a new cache there for the waypoint
		//....................Creating waypoint container:
		var lastID=arrayCache.length;
		var listContainer = document.getElementById('CacheList');	
		var entry = document.createElement("div");	
			entry.className = 'navItem';	
			entry.name='CacheList_WP';	
			entry.tabIndex = lastID*10;	
		var BadgeContent = document.createElement("span");	
			//BadgeContent.innerHTML = "<img width='32' height='32' src='/assets/icons/icons8-waypoint-map-48.png'>";			
			BadgeContent.innerHTML = "<img src='/assets/icons/icons8-waypoint-map-48.png'>";													
			entry.appendChild(BadgeContent);	
		var headline = document.createElement("span");	
			headline.innerHTML = "<b>WayPoint #" + (lastID - 49) + "</b><br>";	
			entry.appendChild(headline);						
		entry.setAttribute('data-function', 'NavToCacheDetails');	
		// need to create a new ID for this new waypoint - will use "waypoint" + the current location in the cache array
		var waypointArrayID = "WAYPOINT" + lastID;
		entry.setAttribute('NavCode',waypointArrayID);						
		listContainer.appendChild(entry);

		var d = new Date();
		var dateNowLocal = "Created: " + d.toLocaleString();

		var arrayCacheObject = {
			cacheName: "Waypoint #" + (lastID - 49), 
			cacheBadge: "<img src='/assets/icons/icons8-waypoint-map-48.png'>",
			cacheDescription: "<p>Waypoint coords:<br><b>"+displayPosition(myWP.lat,myWP.lng,app.gpsCoordRepresentation)+"</b></p>",
			cacheHiddenDate: dateNowLocal,
			cacheDifficulty: "",
			cacheTerrain: "",
			cacheSize: "",
			cacheGUID: "",
			cacheLat: myWP.lat,
			cacheLng: myWP.lng,
			cacheCode: waypointArrayID,
			cacheType: "WAYPOINT",
			cacheFound: false,
			cacheOriginID: lastID
		}
		arrayCache[lastID] = arrayCacheObject;

		//=================================
		//
		// load up local storage with a text blob with all the cache details in it
		// one localstorage variable per cache

		var TMPstoredCacheDetails = arrayCacheObject.cacheName;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheBadge;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheDescription;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheHiddenDate;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheDifficulty;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheTerrain;					
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheSize;		
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheGUIDid;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheLat;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheLng;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheCode;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheType;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheFound;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCacheObject.cacheOriginID;						

		var storedCacheName = "storedCacheDetails_WP" + lastID;
		localStorage.setItem(storedCacheName, TMPstoredCacheDetails);
		waypointTotalCount = Number(localStorage.getItem('waypointCount'));
		if (waypointTotalCount == null) {
			waypointTotalCount = 1;
		} else {
			waypointTotalCount = waypointTotalCount + 1;
		};
		localStorage.setItem('waypointCount',waypointTotalCount);
								
		//....................End of Creating waypoint container		
				
	}
	else{
		//if not a Waypoint, pull the cache that we want to attach the waypoint to
		wpID=cache_id;
		
		//changes the default lat and lng of the cache
		arrayCache[wpID].cacheLat=myWP.lat;	
		arrayCache[wpID].cacheLng=myWP.lng;	
		var gmt_time = new Date().toGMTString();	
		arrayCache[wpID].cacheDescription="<p><sub>"+gmt_time+"</sub><br>WP: <b>"+displayPosition(myWP.lat,myWP.lng,app.gpsCoordRepresentation)+"</b></p>"+arrayCache[wpID].cacheDescription;	
		//Save to storage
		var TMPstoredCacheDetails = arrayCache[wpID].cacheName;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCache[wpID].cacheBadge;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCache[wpID].cacheDescription;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCache[wpID].cacheHiddenDate;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCache[wpID].cacheDifficulty;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCache[wpID].cacheTerrain;					
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCache[wpID].cacheSize;		
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCache[wpID].cacheGUIDid;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCache[wpID].cacheLat;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCache[wpID].cacheLng;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCache[wpID].cacheCode;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCache[wpID].cacheType;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCache[wpID].cacheFound;
		TMPstoredCacheDetails = TMPstoredCacheDetails + "< |v| >" + arrayCache[wpID].cacheOriginID;						
		
		var storedCacheName = "storedCacheDetails" + arrayCache[wpID].cacheOriginID;
		localStorage.setItem(storedCacheName, TMPstoredCacheDetails);		
	}
						
	//NavTo there...
	//ShowCacheOnMap(wpID);
	if(CacheHasBeenDefined == true) {Cache.remove();}					
	Cache = L.marker([myWP.lat,myWP.lng], {icon: NavTo_cache}).addTo(map);	
	CacheLat = myWP.lat;	
	CacheLng = myWP.lng;			
	CacheHasBeenDefined = true;	
	MovemMap("focusOnCache");	
						
	}

function DeleteWaypoints () {
	var waypointCount = Number(localStorage.getItem('waypointCount'));
	for (let x = 1; x < waypointCount; x++) {				
		//remove from localStorage
		var tempX = x + 49;

		storedCacheName = "storedCacheDetails_WP" + tempX;
		localStorage.removeItem(storedCacheName);		
		//and remove from arrayCache						
		arrayCache.length = 0;	
	}
	localStorage.setItem('waypointCount',0);
	// then regenerate the cache list 
	ListCaches(0,0,"yes");	
	showView(0,false);
	initView();		
	
};
	

id = navigator.geolocation.watchPosition(success, error, options);	

return app;
}());

