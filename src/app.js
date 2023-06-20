//global module
var MODULE = (function () {

var myUserAgent = navigator.userAgent;
console.log(`userAgent: ${myUserAgent}`);

var manual_login;
var manifestLocation;
var rootKaiOSVersion = myUserAgent.charAt(myUserAgent.search("KAIOS/") + 6);
//console.log(`KaiOS v${myUserAgent.charAt(myUserAgent.search("KAIOS/") + 6)}`);
	if (rootKaiOSVersion == 2) {
		manual_login = false;
		manifestLocation = "/manifest.webapp"; // v2.x manifest 882
	} else {
		manual_login = true;
		manifestLocation = "/manifest.webmanifest"; // v3.x manifest
	};
	

var time_till_expire = (localStorage.getItem("token_expires") - Date.now())/1000;
var initialLoadofApp = localStorage.getItem('initialLoadofApp');
//=========================================
// Geocaching API details
var userMembershipLevelId="0";
var myUserAlias="notSet";
var myUserCode;
var myUserAvatar;
var myTrackableView;
var favPointsAvailable = 0;
var numCachesToLoad = 50; // how many caches should i load at one time?
var numLogsToLoad = 15; // how many logs should i load at one time?
var useAPI = true;
var prod_client_id = "";
var prod_secret_id = "";
var staging_client_id = "";
var staging_secret_id = "";
var google_key;
var manualCoordFormat = localStorage.getItem('manualCoordFormat');

//console.log(`userAgent = ${navigator.userAgent}`);

var isNokia = false;


var showConnectionError = true;


// message to show to basic users when they look to download the full details of a particular cache
var basicUserMessageForCacheDownload;




//================================================

var app = {};
// use the custom module namespace 'app' for all variables and functions you need to access through other scripts
app.useProduction = true;
app.rootAPIurl = null; 
app.rootSiteURL = null;
app.config = new Array();
		
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

// if connected to staging, make the button bar background stand out so the user knows we're in the staging server
if (app.useProduction == false) {
	var barBackground = document.getElementById("softkeyBar");
	var barBack = document.getElementById("bar-back");
	var barAction = document.getElementById("bar-action");
	var barOptions = document.getElementById("bar-options");
	
	barBackground.style.backgroundColor = "red";
	barBack.style.backgroundColor = "red";
	barAction.style.backgroundColor = "red";
	barOptions.style.backgroundColor = "red";
}
// =======================================================================
// =======================================================================
// =======================================================================
// insert API details here...

if(app.useProduction == false) {
	//===============================
	// Staging server details
		app.rootAPIurl = "https://staging.api.groundspeak.com/v1/"; 
		app.rootSiteURL = "https://staging.geocaching.com";

		// Authorization server details
		app.config = {
			redirect_uri: "https://caching-on-kai.com/",
			authorization_endpoint: "https://staging.geocaching.com/oauth/authorize.aspx",
			token_endpoint: "https://oauth-staging.geocaching.com/token",
			requested_scopes: "*"
		};
		
	//================================
} else {
	//===============================
	// Production server details
		app.rootAPIurl = "https://api.groundspeak.com/v1/"; 
		app.rootSiteURL = "https://geocaching.com";

		//console.log(`Prod client_id: ${prod_client_id}`);
		// Authorization server details
		app.config = {
			redirect_uri: "https://caching-on-kai.com/",
			authorization_endpoint: "https://geocaching.com/oauth/authorize.aspx",
			token_endpoint: "https://oauth.geocaching.com/token",
			requested_scopes: "*"
		};
		
		//console.log(`at top, app.config.client_id: ${app.config.client_id}`);
	//================================
}	



	// get our geocaching.com keys if we don't already have them
	var tmpclient_id = localStorage.getItem('client_id');
	//alert("before stored client_id:" + tmpclient_id);
	//if(tmpclient_id == null) {alert("id is null");};
	
if(tmpclient_id == null) {	
	const keys = (() => {
	  let getKeys = function () {
		fetch("/keys.txt") 
		  .then(function (response) {
			return response.json();
		  })
		  .then(function (data) {
			  console.log(`from keys file: prod_client_id: ${data.prod_client_id}`);
				prod_client_id = data.prod_client_id;
				prod_secret_id = data.prod_secret_id;
				staging_client_id = data.staging_client_id;
				staging_secret_id = data.staging_secret_id;
				google_key = data.google_ua;
				force_access_token = data.access_token;
				force_refresh_token = data.refresh_token;
				var force_pkce_state = data.pkce_state;
				var force_pkce_code_verifier = data.pkce_code_verifier;
				console.log(`loading from keys: access_token: ${data.access_token}`);
				//alert("startup token:" + data.access_token);
				
				// this is a stop gap measure to try to use an access token generated from a v2.5.4 instance of KaiOS on a v3.x version for testing only
				if (manual_login && force_access_token !== "0") {
					console.log(`force_access_token: ${force_access_token}`);
					console.log(`force_refresh_token: ${force_refresh_token}`);
					localStorage.setItem("access_token", force_access_token);
					localStorage.setItem("refresh_token", force_refresh_token);
					
					var token_expires = Date.now();
					
					localStorage.setItem("token_expires", token_expires);	
					localStorage.setItem("pkce_state", force_pkce_state);
					localStorage.setItem("pkce_code_verifier", force_pkce_code_verifier);					
					
					
					localStorage.setItem('initialLoadofApp', "finished");					
					
				}				
				
				
				if(app.useProduction == false) {
					//===============================
					// Staging server details

						// Authorization server details
						app.config = {
							client_id: staging_client_id,
							client_secret: staging_secret_id,
						};
						
					//================================
				} else {
					//===============================
					// Production server details

						//console.log(`Prod client_id: ${prod_client_id}`);
						// Authorization server details
						app.config = {
							client_id: prod_client_id,
							client_secret: prod_secret_id,
						};
						
						//console.log(`at top, app.config.client_id: ${app.config.client_id}`);
					//================================
				}
				//alert("new id: " + app.config.client_id + "secret: " + app.config.client_secret);
				localStorage.setItem('client_id',app.config.client_id);
				localStorage.setItem('client_secret',app.config.client_secret);
				localStorage.setItem('GA_key',google_key);
				//alert("in keys load, after stored client_id:" + localStorage.getItem('client_id'));				
		  })
		  .catch(function (err) {
			console.log(err);
		  });
	  };

	  return {
		getKeys,
	  };
	})();	
	
	keys.getKeys();	
} else { // otherwise pull from storage
	//alert("is not null");
	app.config.client_id = localStorage.getItem('client_id');
	app.config.client_secret = localStorage.getItem('client_secret');
	google_key = localStorage.getItem('GA_key');
}

	//alert("after stored client_id:" + localStorage.getItem('client_id'));

// =======================================================================
// =======================================================================
// =======================================================================

// =================================
// Google Analytics details

var googleUA = google_key;

// =================================

var following = false;

app.backButton = document.getElementById("bar-back");
app.actionButton = document.getElementById("bar-action");
app.optionsButton = document.getElementById("bar-options");
  
  

var Rm = 3961; // mean radius of the earth (miles) at 39 degrees from the equator
var Rk = 6373; // mean radius of the earth (km) at 39 degrees from the equator
//var distanceDIV = document.getElementById("distance");

var screenYscroll = 0;
var step = 0.0001;
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
//console.log(`showCachesOnLoad? ${ShowCachesOnLoad}`);

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
var WaypointListID = 0;
var CacheLogListID = 0;
var GalleryListID = 0;
var currentCacheID;
var currentCacheFullLoaded=false;
var currentCacheCode;

var currentWaypointID;
var currentWaypointCode;

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

var Cache = null;
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
var arrayWaypointMarker = [];

var arrayWaypointObject;
var arrayWaypoint = [];
var arrayWaypointMarker = [];

var arrayCacheDetails = [];
var arrayCacheImageDetails = [];
var arrayCacheDetailsObject;
var arrayCacheImageDetailsObject;

var cacheNameNavigating;

// Trackable variables
var trackableID = null;
var trackableHolder;
var trackableOwner;
var trackableCacheName;
var trackableCacheCode;
var trackableLogName;
var trackableLogIcon;
var trackableIamLogging;
var arrayCacheInventoryObject;
var arrayCacheInventory = [];
var trackableCount = 0;
var trackableListID;
var showCacheLogTrackableList = false;
var cacheLogTrackableListLength = 0;

var showingAllCaches="no";
var FullCacheListDetails;
//var myUnits;
var cacheIconDisplay;
var gotoCache;

var focusActionLocation = "focusOnMe";

var storedLat = null;
var storedLng = null;

var pauseClicks = false; // used to not allow buttons to fire until a modal is cleared

var stopGPSWarning = false;

var manifestVersion="0";
var showChangeLog = false;

var force_access_token = null;
var force_refresh_token = null;



/////////////////////////////////////////////////////////
//
//	for handling photos and sharing in SMS
//	ref: from https://github.com/strukturart/o.map/blob/43fbea218b94fd1bdb3f58bcb1f7616a53564040/application/assets/js/mozactivity.js#L33
//

const mozactivity = (() => {
  let share_position = function () {
    let a =
      "https://www.openstreetmap.org/?mlat=" +
      mainmarker.current_lat +
      "&mlon=" +
      mainmarker.current_lng +
      "#map=13/" +
      mainmarker.current_lat +
      "/" +
      mainmarker.current_lng +
      "&layers=T";
    let activity = new MozActivity({
      name: "share",
      data: {
        type: "url",
        url: a,
      },
    });

    activity.onsuccess = function () {
      //console.log("successfully shared");
    };

    activity.onerror = function () {
      console.log("The activity encounter en error: " + this.error);
    };
  };

  const photo = function () {
    let activity = new MozActivity({
      name: "record",
      data: {
        type: ["photos", "videos"],
      },
    });

    activity.onsuccess = function () {
      console.log("successfully");
    };

    activity.onerror = function () {
      console.log("The activity encounter en error: " + this.error);
    };
  };

  const openSettings = function () {
    let activity = new MozActivity({
      name: "configure",
      data: {
        target: "device",
        section: "connectivity-settings",
		//section: "geolocation",
      },
    });

    activity.onsuccess = function () {
      console.log("successfully");
    };

    activity.onerror = function () {
      console.log("The activity encounter en error: " + this.error);
    };
  };
  
  const openGPS = function () {
    let activity = new MozActivity({
      name: "configure",
      data: {
        target: "device",
        //section: "connectivity-settings",
		section: "geolocation",
      },
    });

    activity.onsuccess = function () {
      console.log("successfully");
    };

    activity.onerror = function () {
      console.log("The activity encounter en error: " + this.error);
    };
  };  

  return {
    photo,
    share_position,
    openSettings,
	openGPS,
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
				}else if ((windowOpen=="viewCache" || windowOpen=="viewCacheLogs" || windowOpen=="viewCacheGallery")&& currentCacheFullLoaded==true) {
					switchCacheView(false);		
				}else if ((windowOpen=="viewTrackableDetails" || windowOpen=="viewTrackableLogs" || windowOpen=="viewTrackableGallery")) {
					switchTrackableView(false);		
				} else if (windowOpen=="viewCacheInventory" && myTrackableView !== null) {
					switchInventoryView(false);
				}else if (windowOpen!=="viewCache"){
					navHorizontal(false);
				} 
			},
	    dRight: function () { 
				if(app.editWPmode==2){
					editWP("RIGHT");
				} else if ((windowOpen=="viewCache" || windowOpen=="viewCacheLogs" || windowOpen=="viewCacheGallery")&&currentCacheFullLoaded==true) {
					switchCacheView(true);
				}else if ((windowOpen=="viewTrackableDetails" || windowOpen=="viewTrackableLogs" || windowOpen=="viewTrackableGallery")) {
					switchTrackableView(true);			
				} else if (windowOpen=="viewCacheInventory" && myTrackableView !== null) {
					switchInventoryView(true);					
				}else if (windowOpen!=="viewCache"){
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
					//console.log(`${gotoCache.cacheCode} is ${gotoCache.cacheDistance} away`);
					if(gotoCache.cacheDistance < 0.25) {
						// we assume if you're closer than 0.25 mile/km, we'll open that cache details
						newButton.innerHTML = '<button class="navItem" tabIndex="40" data-function="gotoNearestCache">Show ' + gotoCache.cacheName + '</button>';
						//LoadCacheDetails(gotoCache.cacheCode,false);
						//showView(3,false);	
						//initView();					
					} else {
						newButton.innerHTML = "";
					};
									
					showView(12,false);
					initView();				
				}
		} else if (app.currentViewName == "viewCache" || app.currentViewName == "viewWaypoint") {
		  //navGeoCode = app.activeNavItem.getAttribute('navCode');
			//console.log(`pressed goNav, navGeoCode:${navGeoCode}`);
		  navToCache(navGeoCode,true);
		} else if (app.currentViewName == "viewTrackableDetails" || app.currentViewName == "viewTrackableLogs" || app.currentViewName == "viewTrackableGallery") {
			windowOpen = "logTrackable";
			logTrackable();			
		} else if (app.currentViewName == "viewCompass") {
			// show help screen for using the compass
			showView(18,false);
			initView();	
		} else {
			execute(); 
		}
	},
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
		ShowLogs: function () { viewCacheLogs(); }, //	
		ShowGallery: function () { viewCacheGallery(); }, // 	
		LogCache: function () { logThisCache(); }, //	
		refreshCacheList: function () { refreshListofCaches(); },	
		ClosestCache: function () {
			var mapCrd = map.getCenter();	
			var mapLat = mapCrd.lat;	
			var mapLng = mapCrd.lng;
			var gotoCache = FindClosestCache(mapLat,mapLng);
			//console.log(`${gotoCache.cacheCode} is ${gotoCache.cacheDistance} away`);
			if(gotoCache.cacheDistance < 0.5) {
				// we assume if you're closer than 0.5 mile/km, we'll open that cache details
				LoadCacheDetails(gotoCache.cacheCode,false);
				//showView(3,false);	
				//initView();					
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
		
			ShowCacheDetails(currentCacheID,false,false)

			//showView(3,false);	
			//initView();	
		},	
		ShowCompass: function () { //push9	
			logAnalytics("Caches","ShowCompass",0);
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
		//console.log(`current units are ${myUnits}`);
		if (myUnits == "mi") {
			localStorage.setItem('units',"km");
			myUnits = "km";
		} else {
			localStorage.setItem('units',"mi");
			myUnits = "mi";
		};
		//console.log(`now units are ${myUnits}`);
	},
	ToggleCoords: function () { // switch between DDD, DMM, DMS coordinates display
		app.gpsCoordRepresentation = localStorage.getItem('coorRep');
		//console.log(`current coords are ${app.gpsCoordRepresentation}`);
		if (app.gpsCoordRepresentation == "DDD") {
			localStorage.setItem('coorRep',"DMM");
			app.gpsCoordRepresentation = "DMM";
		} else if (app.gpsCoordRepresentation == "DMM") {
			localStorage.setItem('coorRep',"DMS");
			app.gpsCoordRepresentation = "DMS";
		} else {
			localStorage.setItem('coorRep',"DDD");
			app.gpsCoordRepresentation = "DDD";
		};
		//console.log(`now coords are ${app.gpsCoordRepresentation}`);		
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
				//viewCacheGallery();	
				//loadingOverlay(false);
				app.keyCallback.LogCache();				
			}	
		}
	},	
	push1: function(){	
		if(myStatus!=="First Run"){
			if(app.editWPmode==2){	
				editWP("1");	
			} else if ((windowOpen=="viewCache" || windowOpen=="viewCacheLogs" || windowOpen=="viewCacheGallery")) {
				navHorizontal(false);				
			}else{	
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
			} else if ((windowOpen=="viewCache" || windowOpen=="viewCacheLogs" || windowOpen=="viewCacheGallery")) {
				navHorizontal(true);					
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
		var testing = false;
		
		if (testing) {
			getToken();
		} else {
			if(myStatus!=="First Run"){		
				if(app.editWPmode==2){	
					editWP("5");	
				}	
				else{	
					app.keyCallback.FocusOnCache();	
				}
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
				//app.keyCallback.LogCache();	
				
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
					}else if(app.editWPmode==0){
						//updateUserDetails();
						//app.keyCallback.LogCache();
					} 
			}
		}
	}	
		
};

//============================================
//============================================
// startup activities here

window.addEventListener("load", function () {

	//localStorage.clear();
	//


	
	// set the correct version number in various places within the app
	
	const helper = (() => {
	  let getVersion = function () {
		fetch(manifestLocation)
		  .then(function (response) {
			return response.json();
		  })
		  .then(function (data) {
				if(rootKaiOSVersion == 2) {
					manifestVersion = data.version;
				} else {
					manifestVersion = data.b2g_features.version;
				}
				document.getElementById("aboutVersion").innerHTML = "<center><b>version<br>" + manifestVersion + "</b></center>";
				document.getElementById("loadingVersion").innerText = "v" + manifestVersion;	
				document.getElementById("aboutVersion-changelog").innerHTML = "<center><b>version<br>" + manifestVersion + "</b></center>";	
				var prevManifestVersion = localStorage.getItem('manifestVersion');
				//alert("v_old:" + localStorage.getItem('manifestVersion') + "v_now:" + manifestVersion);
				if(manifestVersion != prevManifestVersion) {showChangeLog = true};
				localStorage.setItem('manifestVersion',manifestVersion);
				//console.log(`showChangeLog? ${showChangeLog}. v_old:${prevManifestVersion}, v_now:${manifestVersion}`);
		  })
		  .catch(function (err) {
			console.log(err);
		  });
	  };

	  return {
		getVersion,
	  };
	})();	
	
	helper.getVersion();
	
	var displayCoords = document.getElementById("coordsDisplay");
	if(app.gpsCoordRepresentation == null) {
		//meaning this is the first time the app has been run
		app.gpsCoordRepresentation = 'DMM';
		localStorage.setItem('coorRep','DMM');
		displayCoords.innerHTML = "Toggle " + app.gpsCoordRepresentation + " -> DMS -> DDD";		
	} else if (app.gpsCoordRepresentation == "DDD") {
		displayCoords.innerHTML = "Toggle " + app.gpsCoordRepresentation + " -> DMM -> DMS";		
	} else if (app.gpsCoordRepresentation == "DMM") {
		displayCoords.innerHTML = "Toggle " + app.gpsCoordRepresentation + " -> DMS -> DDD";		
	} else if (app.gpsCoordRepresentation == "DMS") {
		displayCoords.innerHTML = "Toggle " + app.gpsCoordRepresentation + " -> DDD -> DMM";		
	};
	
	var displayManualCoords = document.getElementById("manualCoordsDisplay");
	var manualCoordFormat = localStorage.getItem('manualCoordFormat');
	if(manualCoordFormat == null) {
		//meaning this is the first time the app has been run
		localStorage.setItem('manualCoordFormat','DMM');
		displayManualCoords.innerHTML = "Toggle DMM -> DMS -> DDD";		
	} else if (manualCoordFormat == "DDD") {
		displayManualCoords.innerHTML = "Toggle DDD -> DMM -> DMS";		
	} else if (manualCoordFormat == "DMM") {
		displayManualCoords.innerHTML = "Toggle DMM -> DMS -> DDD";		
	} else if (manualCoordFormat == "DMS") {
		displayManualCoords.innerHTML = "Toggle DMS -> DDD -> DMM";		
	};	
	
	
	storedLat = localStorage.getItem('storedLat');
	storedLng = localStorage.getItem('storedLng');

	
	if(storedLat == null) {
		storedLat = 0;
		storedLng = 0;
		localStorage.setItem('storedLat',storedLat);
		localStorage.setItem('storedLng',storedLng);
	}
	
	myUnits = localStorage.getItem('units');
	//console.log(`at startup, myUnits = ${myUnits}`);
	if (myUnits === null) {
		//console.log(`this is the first time this app has been run, setting units`);
		localStorage.setItem('units',"mi");
		myUnits = "mi";
	};
	var displayUnits = document.getElementById("unitsDisplay");					

	if (myUnits == "mi") {
		displayUnits.innerHTML = "Toggle " + myUnits + " to km";	
	} else {
		displayUnits.innerHTML = "Toggle " + myUnits + " to mi";			
	}
	
	
	cacheIconDisplay = document.getElementById("cacheIconDisplay");
	cacheIconDisplay.innerHTML = "Show all cache icons on map";
	
	var viewRoot = document.getElementById("views");
    app.views = viewRoot.querySelectorAll('.view');
	
	//----------------------------
	// get logged in and gather an API token
	
	var values = "users/me?fields=referenceCode%2Cusername%2CmembershipLevelId%2ChomeCoordinates%2CgeocacheLimits";

	var xhr = new XMLHttpRequest({ mozSystem: true });
	var geomethod = "GET";	
	var geourl = app.rootAPIurl + values;
	
	var token = localStorage.getItem("access_token");
	
	if (token !== null) {
		console.log('we have a token at app start, so requesting updated user details');
		updateUserDetails();
	} else {
		// this is the first time running the app, and we have not logged in yet - uncomment below to force login on the first run of the app
		//console.log('We do not have a token at first log in, so trying to get one now');
		//getToken();	
		// is this the very first run of the app after load?
		


		if(initialLoadofApp == null) {	
			localStorage.setItem('initialLoadofApp', "finished");
			//console.log(`start analytics log, initial install`);
			logAnalytics("Install","Install",manifestVersion);
			//console.log(`finish analytics log, initial install`);			
			alert('Finished one time app setup. Please restart the app.');
			window.close();
		}		
	};	



	//-----------------------------
	
	
	
	
    // load first view
	//showChangeLog = true;
	showView(0,false);
	initView();		

});

//===================================================
//===================================================

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

function getNavTabIndex(i) {
	return parseInt(app.navItems[i].getAttribute('tabIndex'));
};
  
function focusActiveButton(element,forward) {
    //console.log(`trying to focus the active element: ${element}`);
	app.activeNavItem = element;
    app.currentNavId = parseInt(app.activeNavItem.getAttribute('tabIndex'));
	
	//console.log(`focusing active buton. currentViewName=${app.currentViewName} and NavID=${app.currentNavId}`);
	if (app.currentViewName == "viewList") {
		CacheListID = app.currentNavId;
	} else if (app.currentViewName == "viewWaypoints") {
		WaypointListID = app.currentNavId;
	} else if (app.currentViewName == "viewCacheLogs") {
		CacheLogListID = app.currentNavId;
	} else if (app.currentViewName == "viewCacheGallery") {
		GalleryListID = app.currentNavId;
	}		
	
	//console.log(`focusActiveButton, forward=${forward}`);
    app.activeNavItem.focus();
    // scroll to top
    if (app.currentNavId == 0) {
      try {
        if(forward==true) {app.currentView.scrollTo(0, 0);
		};
      } catch (e) { }
    } else {
      // smooth scrolling into view
      if(forward==true) {//app.activeNavItem.scrollIntoView({ behavior: "smooth" });
	  };
    }
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
};  

function switchTab(forward) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  //find and clear current tab
  var currentTab;
  //console.log(`num tabs: ${tabcontent.length}`);
  for (i = 0; i < tabcontent.length; i++) {
	//console.log(`style=${tabcontent[i].style.display}`);
    if(tabcontent[i].style.display=="block") {
		currentTab = i;
	}
	tabcontent[i].style.display = "none";
  }
  //console.log(`current tab: ${currentTab}`);
  // switch the current tab
  // if forward == true, to right, else left by 1
  // if current tab is the last one, wrap to the beginning 
  if(forward==true) {
	if(currentTab==(tabcontent.length - 1)) {
		tabcontent[0].style.display = "block";
	} else {
		tabcontent[currentTab+1].style.display = "block";
	}; 
  } else {
	if(currentTab==0) {
		tabcontent[tabcontent.length - 1].style.display = "block";
	} else {
		tabcontent[currentTab-1].style.display = "block";
	}; 
  }	  
  
  
  tablinks = document.getElementsByClassName("tablinks");
  //for (i = 0; i < tablinks.length; i++) {
  //  tablinks[i].className = tablinks[i].className.replace(" active", "");
  //}
  //document.getElementById(cityName).style.display = "block";
  //evt.currentTargeclassName += " active";
}

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
	} else if (windowOpen == "viewCache"  || windowOpen == "showModal" || windowOpen == "viewTrackableDetails") {

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
		var navID = next/10;
		next += forward ? 10 : -10;		
		
		var jumpToNextTab = true;
		var disableScroll = false;
		
		//console.log(`navID = ${navID}`);
		//console.log(`next: ${next}`);		
		
		// decide if we wrap back to the top of the list when we get to the bottom
		var wrapToTop = true;
		
		console.log(`windowOpen: ${windowOpen}`);
		
		if (windowOpen == "viewCacheGallery") {
			var myElement = document.getElementsByClassName("listGalleryView")[0];		
			wrapToTop = false;			
		} else if (windowOpen == "viewCacheLogs") {
			var myElement = document.getElementsByClassName("listLogsView")[0];		
			wrapToTop = false;	
		} else if (windowOpen == "viewTrackableLogs") {
			var myElement = document.getElementsByClassName("listTrackableLogsView")[0];		
			wrapToTop = false;							
		} else if (windowOpen == "About") {
			var myElement = document.getElementsByClassName("listAttributions")[0];	
				//console.log(`scrolling about`);
			wrapToTop = false;		
		} else if (windowOpen == "changeLog") {
			var myElement = document.getElementsByClassName("listChangeLog")[0];	
				//console.log(`scrolling changelog`);
			wrapToTop = false;				
		} else if (windowOpen == "Help") {
			var myElement = document.getElementsByClassName("listHelpSections")[0];	
			wrapToTop = false;
		} else if (windowOpen == "compassHelp") {
			var myElement = document.getElementsByClassName("compassGuide")[0];	
			wrapToTop = false;			
		} else {
			var myElement = document.getElementsByClassName("list")[0];	
			disableScroll = true;
		}
		
		if (disableScroll == false) {
			// only allow scrolling without jumping to next tab when we're in the cache details areas
			
			//var bounding = myElement.getBoundingClientRect();

			var bounding = myElement.getElementsByClassName("navItem")[navID].getBoundingClientRect();
			
			//console.log(`bound right: ${bounding.right}, bottom: ${bounding.bottom}`);


			if (((bounding.bottom <= ((window.innerHeight/2) || (document.documentElement.clientHeight/2))) && forward == true) || ((bounding.top >= (((window.innerHeight/2)-30) || ((document.documentElement.clientHeight/2)-30))) && forward == false) ) {
				jumpToNextTab = true;
				//console.log('Element is in the viewport!');
			} else {
				jumpToNextTab = false;
				//console.log('Element is NOT in the viewport!');
			}
			
			
			//console.log(`jumpToTab=${jumpToNextTab} - post bounding check`);
			// at the top of the list - force to allow to wrap to bottom
			//if (navID==0 && forward==false) { jumpToNextTab=true };
			
			//check to see if we're at the bottom of the list and not able to jump to the very last
			//tab selection
			//console.log(`navID=${navID} and length=${app.navItems.length}`);
			if (((navID==app.navItems.length-2)||(navID==app.navItems.length-1)) && (bounding.bottom < window.innerHeight) && forward==true) {
				//console.log('force to jump to last item in the list');
				jumpToNextTab=true;
			}

			//console.log(`jumpToTab=${jumpToNextTab} - post top of list check`);
		}

		if(jumpToNextTab){

			if (next > getNavTabIndex(app.navItems.length - 1)) {
				//console.log(`next: ${next} ?>? ${getNavTabIndex(app.navItems.length - 1)}`);
				// if larger than last index
				next = next % 10;
				// try to stay in same column
				if (app.navItems[next]) {
				  // only jump back to the top of the list if we have not said otherwise 					
				  if (wrapToTop == true || next !== 0){focusActiveButton(app.navItems[next],forward);};
				} else {
				  focusActiveButton(app.navItems[0],forward);
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

					focusActiveButton(app.navItems[i],forward);
					break;
				  }
				}
			} else {
				var found = false;
				for (var i = 0; i < app.navItems.length; i++) {
				  if (getNavTabIndex(i) == next) {
					focusActiveButton(app.navItems[i],forward);
					found = true;
					break;
				  }
				}
				if (!found) {
				  // nothing found, try start of next row
				  var round = Math.floor(next / 10) * 10;
				  for (var i = 0; i < app.navItems.length; i++) {
					if (getNavTabIndex(i) == round) {
					  focusActiveButton(app.navItems[i],forward);
					  found = true;
					  break;
					}
				  }
				}
			}
		} else {
			if(forward == true) {
				app.currentView.scrollBy(0, 40);
			} else {
				app.currentView.scrollBy(0, -40);
			}			
		}
    }		
};

function navHorizontal(forward) {
	//console.log(`in navHorizontal, windowOpen=${windowOpen}, cacheID=${currentCacheID}`);
	if (windowOpen == "viewMap") {
		// move map around
		if (forward) {
			MovemMap('right');	
		} else {
			MovemMap('left');
		}
	} else if (windowOpen=="viewCache" || windowOpen=="viewCacheLogs" || windowOpen=="viewCacheGallery" || windowOpen=="viewTrackableLogs" || windowOpen=="viewTrackableGallery") {
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
		  LoadCacheDetails(gotoCacheID,false);
		  //showView(3,false);
		  //initView();			
				
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
          focusActiveButton(app.navItems[next],true);
          break;
        }
      }
    }
  };

function switchCacheView(forward) {
	if (windowOpen=="viewCache") {
		// forward from Cache details goes to log view.  backwards goes to image gallery
		if (forward) {
			viewCacheLogs(currentCacheID);			
		} else {
			viewCacheGallery(currentCacheID);				
		}
	} else if (windowOpen=="viewCacheLogs") {
		// forward from log view goes to image gallery.  backwards goes to cache details
		if (forward) {
			viewCacheGallery(currentCacheID);				
		} else {
			ShowCacheDetails(currentCacheID,false,false);				
		}
	} else if (windowOpen=="viewCacheGallery") {
		// forward from image gallery goes to cache details, backwards goes to log view
		if (forward) {
			ShowCacheDetails(currentCacheID,false,false);				
		} else {
			viewCacheLogs(currentCacheID);				
		}		
	}
}

function switchInventoryView(forward) {
	// order is All (owned) -> In Hand (inventory) -> Collection (collection)	
	if (myTrackableView == 'owned') {
		if (forward) {
			viewTrackableInventory(null,'inventory');			
		} else {
			viewTrackableInventory(null,'collection');				
		}
	} else if (myTrackableView == 'inventory') {
		// forward from log view goes to image gallery.  backwards goes to cache details
		if (forward) {
			viewTrackableInventory(null,'collection');				
		} else {
			viewTrackableInventory(null,'owned');				
		}
	} else if (myTrackableView == 'collection') {
		// forward from image gallery goes to cache details, backwards goes to log view
		if (forward) {
			viewTrackableInventory(null,'owned');				
		} else {
			viewTrackableInventory(null,'inventory');				
		}	
	};
	
};

function switchTrackableView(forward) {
	if (windowOpen=="viewTrackableDetails") {
		// forward from Trackable details goes to log view.  backwards goes to image gallery
		if (forward) {
			viewTrackableLogs(trackableID);			
		} else {
			viewTrackableLogs(trackableID);				
		}
	} else if (windowOpen=="viewTrackableLogs") {
		// forward from log view goes to image gallery.  backwards goes to cache details
		if (forward) {
			viewTrackableDetails(trackableID);				
		} else {
			viewTrackableDetails(trackableID);				
		}
	} //else if (windowOpen=="viewTrackableGallery") {
		// forward from image gallery goes to cache details, backwards goes to log view
		//if (forward) {
		//	viewTrackableDetails(trackableID);				
		//} else {
		//	viewTrackableLogs(trackableID);				
		//}		
	//}
}


app.isInputFocused = function () {
	var activeTag = document.activeElement.tagName.toLowerCase();
	//console.log(`Active tag is ${activeTag}.  inputs=input, select, text, textarea, body, html`);
	var isInput = false;
	// the focus switches to the 'body' element for system ui overlays
	if (activeTag == 'input' || activeTag == 'select' || activeTag == 'text' || activeTag == 'textarea') {
		//|| activeTag == 'body' || activeTag == 'html') {

	 // console.log('this is an input field');
	  isInput = true;
	}
	//console.log(`isInput=${isInput}`);
	return isInput;
};

function goBack(count) {
	if (typeof count === "undefined") {count=1};

	if (app.backArray.length > count) {
		// first remove the specified number of views from the array
		// if count = 1, then that means we're just removing the current view that the user sees
		for (let i = 0; i < count; i++) {		
			app.backArray.pop();
		}
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
// NOTE: this may or may not be working.  i'm using the showView by index to get around this for now
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
	} else if (app.currentViewName == 'viewWaypoints') {
	  windowOpen="viewWaypoints";
	  app.leftSoftButton = "CacheList";
	  app.optionEnabled = true;	  
	} else if (app.currentViewName == 'viewCache' || app.currentViewName == 'viewCacheLogs' || app.currentViewName == 'viewCacheGallery') {
		//windowOpen = "viewCache";
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
	} else if (app.currentViewName == 'logCache') {
		windowOpen = "logCache";
		app.leftSoftButton = "Back";
		app.optionEnabled = true;
	} else if (app.currentViewName == 'viewCompass') {
		windowOpen = "viewCompass";
		app.leftSoftButton = "Back";
		app.optionEnabled = true;
	}
	
	// focus first menu entry
	var forward=true;
	//console.log(`app.currentViewName=${app.currentViewName}`);
	if (app.currentView.querySelector(".navItem")) {
	  app.updateNavItems();
	  if (app.currentViewName == 'viewList') {
		var tmpCacheListID = CacheListID/10;
		//app.currentNavid = CacheListID;
		focusActiveButton(app.navItems[tmpCacheListID],forward);
	  } else if (app.currentViewName == 'viewWaypoints') {
		//console.log(`switching to waypoints list. WaypointListID=${WaypointListID}`);
		var tmpWaypointListID = WaypointListID/10;
		//app.currentNavid = CacheListID;
		focusActiveButton(app.navItems[tmpWaypointListID],forward);		
	  } else if (app.currentViewName == 'viewCacheLogs') {
		//console.log(`switching to Log view. CacheLogListID=${CacheLogListID}`);
		var tmpLogListID = CacheLogListID/10;
		focusActiveButton(app.navItems[tmpLogListID],forward);		
	  } else if (app.currentViewName == 'viewCacheGallery') {
		//console.log(`switching to Gallery list. GalleryListID=${GalleryListID}`);
		var tmpGalleryListID = GalleryListID/10;
		//app.currentNavid = CacheListID;
		focusActiveButton(app.navItems[tmpGalleryListID],forward);			
	  } else {
		focusActiveButton(app.navItems[0],forward);	
	  }
	}
	softkeyBar();	
};

// fill navigation array for current view
app.updateNavItems = function (index) {
	app.navItems = app.currentView.querySelectorAll('.navItem');
};

// decide what the left soft button will do
function leftButton() {
	var leftButtonHTML = app.backButton.innerHTML;
	if (leftButtonHTML == "Caches") {
		windowOpen = 'viewList';
		showView(1,false);
		initView();	
	} else if (leftButtonHTML == "Waypoints") {
		windowOpen = 'viewWaypoints';		
		showView(20,false);
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


var clearLogForm = false;
var cacheIamLogging = -1;
var clearTrackableLogForm = false;
var trackableIamLogging = -1;

function showModal(displayText){
	//windowOpen = "showModal";
	document.getElementById("message").innerHTML = displayText;
	showView(15,false);	
	//console.log(`text to show: ${displayText}`);
	// update the initView function to allow for different user response options to this modal:
	// yes-no | confirm-cancel | just OK, etc
	initView();
}

function logThisCache() {
	 if (navGeoCode !='') {
		 //show the log cache div
		windowOpen = "logCache";
		var CacheID = -1;
		var cacheFound = "no";

		for (let i = 0; i < arrayCache.length; i++) {
		  // search for cache in array
		  //console.log(`cacheCode = ${arrayCache[i].cacheCode}, navGeoCode = ${navGeoCode}`);
		  if (navGeoCode == arrayCache[i].cacheCode) {
			CacheID = i;
			cacheFound = arrayCache[i].cacheFound;
			//console.log(`found? ${cacheFound}, array: ${arrayCache[i].cacheFound}`);
		  }
		}	
		
		var BadgeContent;
		BadgeContent = arrayCache[CacheID].cacheBadge + "<b>" + arrayCache[CacheID].cacheName + "</b><br>" + arrayCache[CacheID].cacheCode;		
		
		document.getElementById("logHeader").innerHTML = BadgeContent;
		
		var logTypeSelect = document.getElementById("logType");
		
		//now clear out the rest of the form for new use
		// but only clear out the form if the log had previously been submitted 
		// so we keep partially entered logs
		// exception is if the cacheID has changed - in that case we need to clear the log out
		
		if (navGeoCode == cacheIamLogging) {
			// do nothing
		} else {
			//ok, we're trying to log a new cache, so clear everything out
			cacheIamLogging = navGeoCode;
			clearLogForm = true;
		}
		
		
		if (clearLogForm == true) {
			
			//hide the Found It log option if the user has already found this cache and logged if previously
			if(cacheFound=="yes"){
				document.getElementById("logType").innerHTML = "<option value='4'>Write note</option>";		
				document.getElementById("logType").innerHTML += "<option value='3'>Didn't Find It</option>";
			} else {
				document.getElementById("logType").innerHTML = "<option value='2'>Found It</option>";
				document.getElementById("logType").innerHTML += "<option value='3'>Didn't Find It</option>";
				document.getElementById("logType").innerHTML += "<option value='4'>Write note</option>";	
			}				
			
			document.getElementById("logText").value = "";
			document.getElementById("logImage").value = "";
			document.getElementById("logFav").value = "false";	
			clearLogForm = false;
		}
		
		// hide the favorite points selector if the user has no more points to giveMeWayPoint
		var logFavoritePoints = document.getElementById('logFav');
		if (favPointsAvailable == 0) {
			// hide
			logFavoritePoints.style.display="none";
		} else {
			// show
			logFavoritePoints.style.display="block";			
		}
		
		// now workup our trackable inventory list
		viewTrackableInventory(null,null,"cacheLog");



		showView(14,false);
		initView();						 		 
	//	 var LogCacheURL = "https://www.geocaching.com/play/geocache/" + navGeoCode + "/log";
	//	 openURL(LogCacheURL);
	 }	
};



function submitLog() {
	loadingOverlay(true);
	
	var cacheLogImage = document.getElementById('logImage');
	var cacheLogDate = document.getElementById('logDate');
		var cacheLogDateRaw = cacheLogDate.value;
		var cacheLogDateValue = cacheLogDate.value + "T00:00:00.000Z";
	var cacheLogTextRaw = document.getElementById('logText');
		var cacheLogText = cacheLogTextRaw.value;
	var cacheLogType = document.getElementById('logType');	
	var cacheLogFav = document.getElementById('logFav');	
		if(cacheLogFav.value!=="true") {cacheLogFav.value = "false"};
		
		
	//console.log(`LogDate: ${cacheLogDateValue}`);
	//console.log(`LogText: ${cacheLogText}`);
	//console.log(`LogType: ${cacheLogType.value}`);

	var token = localStorage.getItem("access_token");
	var params = {
		loggedDate: cacheLogDateValue,
		text: cacheLogText,
		type: "string",
		geocacheLogType: {id: cacheLogType.value},
		geocacheCode: navGeoCode,
		usedFavoritePoint: cacheLogFav.value
	};	
	
	var todayDate = new Date();
	//console.log(`todayDate: ${todayDate}`);
	var todayYear = todayDate.getFullYear();
	var todayMonth = todayDate.getMonth();
	var todayDay = todayDate.getDate();
	
	var logFullDate = new Date(cacheLogDate.value);
	//console.log(`logFullDate: ${logFullDate}`);
	var logYear = logFullDate.getFullYear();
	var logMonth = logFullDate.getMonth();
	var logDay = logFullDate.getDate();

	
	var fixedLogDate = new Date();
	fixedLogDate.setFullYear(logYear, logMonth, logDay);
	//console.log(`fixedLogDate: ${fixedLogDate}`);
	
	//console.log(`${todayYear}${todayMonth}${todayDay} ?=? ${logYear}${logMonth}${logDay}`);
	
	if (token !== null) {
		// check for errors
		var BadgeContent;
		BadgeContent = arrayCache[currentCacheID].cacheBadge + "<b>" + arrayCache[currentCacheID].cacheName + "</b><br>" + arrayCache[currentCacheID].cacheCode;				
		
		var logErrors = BadgeContent + "<br><br>Your log submission has the following error(s)</b>:<br><ul class='bullets'>"
		var logHasError = false;
		
		if(cacheLogFav.value == "true" && cacheLogType.value !== "2"){
			logErrors += "<li>You must select 'Found It' when awarding a favorite point</li>";
			logHasError = true;
		};
		if(fixedLogDate > todayDate) {
			logErrors += "<li>Your log date cannot be in the future</li>";
			logHasError = true;
		};			
		if(cacheLogText.length == 0) {
			logErrors += "<li>Your log details cannot be empty</li>";
			logHasError = true;
		};	
		if(cacheLogDateRaw.length == 0) {
			logErrors += "<li>Your log date cannot be empty</li>";
			logHasError = true;
		};			
		
		//console.log(`today: ${todayDate}`);
		
		logErrors += "</ul>";

		//console.log(`errors? ${logHasError}`);
		//console.log(`error text: ${logErrors}`);

		if(logHasError) {
			loadingOverlay(false);	
			showModal(logErrors);
		} else {
		
			logAnalytics("Caches","LogCache",cacheLogType.value);			
		
			var logURL = app.rootAPIurl + "geocachelogs?fields=referencecode,owner&api_key=" + token;		
			var request = new XMLHttpRequest({ mozSystem: true });
			
			request.onreadystatechange = function() {
				if (this.readyState == 4 && (this.status == 200 || this.status == 201)) {
					body = JSON.parse(this.response);
					// update our user profile details based on this log submission
					document.getElementById("findCount").innerHTML = "<b>Finds:</b> " + body.owner.findCount;
					document.getElementById("favoritePoints").innerHTML = "<b>Fav Points:</b> " + body.owner.favoritePoints;
					
					favPointsAvailable = body.owner.favoritePoints;
					
					submitTrackableCacheLog();					
					
					//then check to see if we need to submit an image, and do so
					if(cacheLogImage.value !== "") {
						// convert file to base64
						//console.log(`working on the image`);
						var file = cacheLogImage.files[0];
						var reader = new FileReader();
						reader.onloadend = function() {
							//console.log('RESULT', reader.result)
							var base64Image = reader.result; 
							var startSlice = base64Image.indexOf(";base64,");
							startSlice = startSlice + 8;
							var ImageToSubmit = base64Image.slice(startSlice);
							//console.log(`cleaned up: ${base64Image}`);
							submitLogImage(body.referenceCode,ImageToSubmit);
						}
						reader.readAsDataURL(file);

					} else {
						//console.log('no log image attached');
						
						loadingOverlay(false);	
						reloadCacheDetails(navGeoCode);					
						// send up success message and punt the user back to previous screen
						kaiosToaster({	
						  message: 'Log submitted successfully',	
						  position: 'north',	
						  type: 'success',	
						  timeout: 3000	
						});	
						clearLogForm = true;
						// stop navigation now that we've logged the cache 
						navToCache(0,false);
						
						
						
						goBack();
						
					}
				} else if(this.readyState == 4 && (this.status !== 200 || this.status !== 201)) {
					// some issue
					body = JSON.parse(this.response);
					var responseError = "There was an error on the log submission: " + body.errorMessage;
					loadingOverlay(false);						
					//showModal(responseError);
					alert(responseError);
					loadingOverlay(false);	
				} else if (this.readyState==4 && (this.status != 201 || this.status != 201)) {
					// meaning we've hit some error 
					alert("There was an error connecting to geocaching.com...");
					loadingOverlay(false);	
				} else {
					//alert("There was an error connecting to geocaching.com...");
					//loadingOverlay(false);	
				}
			}		
			request.open("POST", logURL, true);
			
			request.setRequestHeader("Content-Type", "application/json");
			request.setRequestHeader("Accept", "application/json");
			request.setRequestHeader("Authorization", "bearer " + token);
			
			request.send(JSON.stringify(params));
		}
	} else {
		getToken();
	};		
}

function submitLogImage(logCode,logImage) {
	//console.log(`starting attempt to attach image to log ${logCode}`);
	if(logImage !== null){
		var token = localStorage.getItem("access_token");
		var params = {
			capturedDate: "2021-07-03T19:15:51.631Z",
			base64ImageData: logImage,
			description: logCode + " Log image uploaded from Caching-on-Kai app"
		};			
		
		var logURL = app.rootAPIurl + "geocachelogs/" + logCode + "/images?fields=url&api_key=" + token;		
		var request = new XMLHttpRequest({ mozSystem: true });
		
		request.onreadystatechange = function() {
			if (this.readyState == 4 && (this.status == 200 || this.status == 201)) {
				body = JSON.parse(this.response);
				//console.log(`logCode: ${body.url}`);
				loadingOverlay(false);					
				kaiosToaster({	
				  message: 'Log submitted successfully',	
				  position: 'north',	
				  type: 'success',	
				  timeout: 3000	
				});	
				clearLogForm = true;
				navToCache(0,false);
				goBack();				
			} else if (this.readyState==4 && (this.status != 201 || this.status != 201)) {
				// meaning we've hit some error 
				alert("There was an error connecting to geocaching.com...");
				loadingOverlay(false);				
			} else {
				//alert("There was an error connecting to geocaching.com...");
				//loadingOverlay(false);					
			}
		}		
		request.open("POST", logURL, true);
		
		request.setRequestHeader("Content-Type", "application/json");
		request.setRequestHeader("Accept", "application/json");
		request.setRequestHeader("Authorization", "bearer " + token);
		
		request.send(JSON.stringify(params));	
	}
}


function submitTrackableCacheLog() {
	
		var myInventory = document.getElementById('logCacheTrackableContainer').getElementsByTagName('select');		

		//console.log(`number of items in inventory: ${myInventory.length}`);
		for (let i = 0; i < myInventory.length; i++) {
			//console.log(`item ${i}, ${myInventory[i].id} contents: ${myInventory[i].value}`);
			if (myInventory[i].value !== "0") {submitTrackableLog("fromCache",myInventory[i].id,myInventory[i].value);};
		}	
	
	
}


function logTrackable() {
	
	// trackable logging rules appear to be:
	//
	// if you own the trackable and it is in your own inventory, you can only write a note log
	//
	// if you don't have the trackable in your inventory, you can 1) retrieve from a cache (if in one now), 2) grab it from somewhere eles 3) write a note 4) discover it
	

	//Id	Name
	//4	Write Note
	//13	Retrieve It from a Cache
	//14	Dropped Off
	//15	Transfer
	//16	Mark Missing
	//19	Grab It (Not from a Cache)
	//48	Discovered It
	//69	Move To Collection
	//70	Move To Inventory
	//75	Visited	
	
	
	 if (trackableID !=='') {
		 //show the log cache div
		windowOpen = "logTrackable";

		// put together what the trackable log header should look likely
		
		
		// trackableID = null;
		// trackableHolder;
		// trackableOwner;
		// trackableCacheName;
		// trackableLogName;
		// trackableLogIcon;	
		// trackableCacheCode;
		
		var BadgeContent;
		BadgeContent = "<b>Post a new log for</b><br><img src='" + trackableLogIcon + "'> " + trackableLogName;		
		
		document.getElementById("logTrackableHeader").innerHTML = BadgeContent;
		

		//now clear out the rest of the form for new use
		// but only clear out the form if the log had previously been submitted 
		// so we keep partially entered logs
		// exception is if the trackable has changed - in that case we need to clear the log out
		
		if (trackableIamLogging == trackableLogName) {
			// do nothing
		} else {
			//ok, we're trying to log a new cache, so clear everything out
			trackableIamLogging = trackableLogName;
			clearLogForm = true;
		}
		
		// figure out what kinds of trackable log options i should have
		// the questions are: is the trackable in my current inventory, is the trackable in a cache currently?
		
		
			//	<option value="13">Retrieved it from ???</option>
			//	<option value="19">Grab it from somewhere else</option>
			//	<option value="4">Write note</option>	
			//	<option value="48">Discovered it</option>			
		
		if (clearLogForm == true) {
			
			if(trackableCacheName !== null){
				document.getElementById("logTrackableType").innerHTML = "<option value='13'>Retrieved it from " + trackableCacheName + "</option>";		
				document.getElementById("logTrackableType").innerHTML += "<option value='19'>Grab it from somewhere else</option>";
				document.getElementById("logTrackableType").innerHTML += "<option value='4'>Write note</option>";
				document.getElementById("logTrackableType").innerHTML += "<option value='48'>Discovered it</option>";				
			} else if (trackableHolder == myUserAlias) {
				document.getElementById("logTrackableType").innerHTML = "<option value='4'>Write note</option>";
			} else {
				document.getElementById("logTrackableType").innerHTML = "<option value='19'>Grab it from somewhere else</option>";				
				document.getElementById("logTrackableType").innerHTML += "<option value='4'>Write note</option>";
			}
			
			document.getElementById("logTrackableText").value = "";
			document.getElementById("logTrackingCode").value = "";			
			clearLogForm = false;
		}
		
		
		showView(26,false);
		initView();						 		 
	 }	
};



function submitTrackableLog(submitLocation,tbCode,tbLogType) {
	loadingOverlay(true);
	
	if (submitLocation == 'fromCache') { // we are dropping or visiting a trackable to a cache
		var trackableLogDate = document.getElementById('logDate');
			var trackableLogDateRaw = trackableLogDate.value;
			var trackableLogDateValue = trackableLogDate.value + "T00:00:00.000Z";
		var trackableLogTextRaw = document.getElementById('logText');
			var trackableLogText = trackableLogTextRaw.value;
		var thisTrackableLogType = tbLogType;
		var trackableTrackingCode = null;	
		var geoCodeToLog = navGeoCode;
		var tbCodeToLog = tbCode;
	} else { // we are picking up a trackable or discovering it or writing a note
		//var cacheLogImage = document.getElementById('logImage');
		var trackableLogDate = document.getElementById('logTrackableDate');
			var trackableLogDateRaw = trackableLogDate.value;
			var trackableLogDateValue = trackableLogDate.value + "T00:00:00.000Z";
		var trackableLogTextRaw = document.getElementById('logTrackableText');
			var trackableLogText = trackableLogTextRaw.value;
		var thisTrackableLogType = document.getElementById('logTrackableType').value;	
		var trackableTrackingCode = document.getElementById('logTrackingCode').value;
		var geoCodeToLog = trackableCacheCode;	
		var tbCodeToLog = trackableID;
	}
		
	//console.log(`LogDate: ${cacheLogDateValue}`);
	//console.log(`LogText: ${cacheLogText}`);
	//console.log(`LogType: ${cacheLogType.value}`);

	var token = localStorage.getItem("access_token");
	var params = {	
		loggedDate: trackableLogDateValue,
		text: trackableLogText,
		trackableLogType: {id: thisTrackableLogType},
		trackingNumber: trackableTrackingCode,
		geocacheCode: geoCodeToLog,
		trackableCode: tbCodeToLog
	};	
	
	var todayDate = new Date();
	//console.log(`todayDate: ${todayDate}`);
	var todayYear = todayDate.getFullYear();
	var todayMonth = todayDate.getMonth();
	var todayDay = todayDate.getDate();
	
	var logFullDate = new Date(trackableLogDate.value);
	//console.log(`logFullDate: ${logFullDate}`);
	var logYear = logFullDate.getFullYear();
	var logMonth = logFullDate.getMonth();
	var logDay = logFullDate.getDate();

	
	var fixedLogDate = new Date();
	fixedLogDate.setFullYear(logYear, logMonth, logDay);
	//console.log(`fixedLogDate: ${fixedLogDate}`);
	
	//console.log(`${todayYear}${todayMonth}${todayDay} ?=? ${logYear}${logMonth}${logDay}`);
	
	if (token !== null) {
		// check for errors
		//var BadgeContent;
		//BadgeContent = arrayCache[currentCacheID].cacheBadge + "<b>" + arrayCache[currentCacheID].cacheName + "</b><br>" + arrayCache[currentCacheID].cacheCode;				
		
		var logErrors = "<br><br>Your log submission has the following error(s)</b>:<br><ul class='bullets'>"
		var logHasError = false;
		
		if(fixedLogDate > todayDate) {
			logErrors += "<li>Your log date cannot be in the future</li>";
			logHasError = true;
		};			
		if(trackableLogText.length == 0) {
			logErrors += "<li>Your log details cannot be empty</li>";
			logHasError = true;
		};	
		if(trackableLogDateRaw.length == 0) {
			logErrors += "<li>Your log date cannot be empty</li>";
			logHasError = true;
		};	
		if (submitLocation !== "fromCache") {
			if(thisTrackableLogType.value !== "4" && trackableTrackingCode.length == 0) {
				logErrors += "<li>You must provide a tracking code</li>";
				logHasError = true;
			};
		};
		
		//console.log(`today: ${todayDate}`);
		
		logErrors += "</ul>";

		//console.log(`errors? ${logHasError}`);
		//console.log(`error text: ${logErrors}`);

		if(logHasError) {
			loadingOverlay(false);	
			showModal(logErrors);
		} else {
		
			logAnalytics("Trackables","LogTrackable",thisTrackableLogType.value);			
		
			var logURL = app.rootAPIurl + "trackablelogs?fields=referencecode&api_key=" + token;		
			var request = new XMLHttpRequest({ mozSystem: true });
			
			request.onreadystatechange = function() {
				if (this.readyState == 4 && (this.status == 200 || this.status == 201)) {
					body = JSON.parse(this.response);

					//console.log('no log image attached');
					loadingOverlay(false);							
					// send up success message and punt the user back to previous screen

					clearLogForm = true;

					goBack();

				} else if(this.readyState == 4 && (this.status !== 200 || this.status !== 201)) {
					// some issue
					body = JSON.parse(this.response);
					var responseError = "There was an error on the log submission: " + body.errorMessage;
					loadingOverlay(false);						
					//showModal(responseError);
					alert(responseError);
					loadingOverlay(false);	
				} else if (this.readyState==4 && (this.status != 201 || this.status != 201)) {
					// meaning we've hit some error 
					alert("There was an error connecting to geocaching.com...");
					loadingOverlay(false);	
				} else {
					//alert("There was an error connecting to geocaching.com...");
					//loadingOverlay(false);	
				}
			}		
			request.open("POST", logURL, true);
			
			request.setRequestHeader("Content-Type", "application/json");
			request.setRequestHeader("Accept", "application/json");
			request.setRequestHeader("Authorization", "bearer " + token);
			
			request.send(JSON.stringify(params));
		}
	} else {
		getToken();
	};		
}



function refreshListofCaches() {
		// get the lat/lng of the center of the current map view and refresh the list of caches from that point instead
		// of the current GPS location
		
		var mapCrd = map.getCenter();
		var mapLat = mapCrd.lat;
		var mapLng = mapCrd.lng;
		
		//console.log(`mapLat/Lng: ${mapLat}/${mapLng}`);
		ListCaches(mapLat,mapLng,"no","yes");				

	  showView(0,false);
	  initView();	
};

// decide, what the enter button does, based on the active element
function execute() {  
	if (!app.fullAdVisible) {
		//console.log(`in execute - hit enter, app.currentViewName=${app.currentViewName}, InputFocused? ${app.isInputFocused()}, tagName=${app.activeNavItem.tagName.toLowerCase()}`);
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
			  //console.log(`execute call=${call}`);
			  switch (call) {
				case 'deleteAllWaypoints':
					DeleteWaypoints();
				 break;
				case 'stopNavToCache':
					navToCache(0,false);		
				 break;
				case 'cancel':
					//console.log(`you selected Cancel`);
					goBack();
					//showView(0,false);
					//initView();
				 break;
				case 'showMozSettings':
					alert("You will be taken to your phone's settings screen. Use the back button to return to this app");
					mozactivity.openSettings(); // open up the phone's settings screen - mostly used for Nokia phone to turn off 4G
				 break;
				case 'submitLog':
					//console.log(`you selected SubmitLog`);
					submitLog();
				 break;
				case 'gotoNearestCache':
					LoadCacheDetails(gotoCache.cacheCode,false);
					//showView(3,false);	
					//initView();					
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
				case 'viewCacheList':
					showView(1,false);	
					initView();		
				 break;
				case 'showCacheDetails':
					ShowCacheDetails(currentCacheID,false,false);				
				 break;
				case 'showCacheLogs':
					viewCacheLogs(currentCacheID);
				 break;	
				case 'showCacheGallery':
					viewCacheGallery(currentCacheID);
				 break;
				case 'viewCacheInventory':
					viewTrackableInventory(arrayCache[currentCacheID].cacheCode);
					//initView();					
				break;
				case 'viewMyTrackables':
					viewTrackableInventory(null,null);	// don't pass in any cachecode so that we pull the trackables of the user			
				break;
				case 'enterCoordinates':
					enterManualCoordinates(null,null);	// don't pass in any cachecode so that we pull the trackables of the user			
				break;				
				case 'showTrackableDetails':
					trackableID = app.activeNavItem.getAttribute('trackableid');
					windowOpen = "viewTrackableDetails";
					viewTrackableDetails(trackableID);
					//initView();					
				break;
				case 'lookupTrackable':
					var lookupCode = document.getElementById('lookupTrackableCode').value;
					var lookupNumber = document.getElementById('lookupTrackingNumber').value;
					windowOpen = "lookupTrackingNumber";
					if(lookupCode !== "") {
						viewTrackableDetails(lookupCode);	
					} else if (lookupNumber !== "") {
						viewTrackableDetails(lookupNumber);	
					} else {
						alert("Enter either a Tracking Number or Trackable Code!");
					}
				break;
				case 'logTrackable':
					windowOpen = "logTrackable";
					logTrackable(); // 
				break;			
				case 'submitTrackableLog':
					submitTrackableLog();
				break;
				case 'viewTrackableLogs':
					viewTrackableLogs(trackableID);
				break;
				case 'viewTrackableGallery':
					viewTrackableGallery(trackableID);
				break;
				case 'loadCacheDetails':
					loadAllCacheDetails(currentCacheID);
				 break;
				case 'reloadCacheDetails':
					reloadCacheDetails(arrayCache[currentCacheID].cacheCode);				
				 break;
				case 'refreshCacheDetails':
					loadAllCacheDetails(currentCacheID);				
				 break;
				case 'loadFullCacheDetails':
					LoadCacheDetails(arrayCache[currentCacheID].cacheCode,true);
				 break;
				case 'enterWaypoint':
					showView(11,false);
					initView();
				 break;	
				case 'showHint':
					//console.log('clicked showHint');
					showHint();
					goBack();
					//showView(3,false);
					//initView();		
					document.getElementById("CacheHintWrapper").scrollIntoView();					
				 break;
				case 'loadMoreLogs':
					loadMoreCacheLogs(arrayCache[currentCacheID].cacheCode);
				 break;
				case 'viewGallery':
					
				 break;
				case 'LogCache':
					//console.log('execute logThisCache');
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
				case 'viewCacheSettings':
					windowOpen="CacheSettings";
					showView(10,false);
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
				case 'toggleCoords':
					// switch between DDD, DMM, DMS coordinates display
					//console.log("running from line 1831");
					var displayCoords = document.getElementById("coordsDisplay");
					app.gpsCoordRepresentation = localStorage.getItem('coorRep');
					//console.log(`current coords are ${app.gpsCoordRepresentation}`);
					if (app.gpsCoordRepresentation == "DDD") {
						localStorage.setItem('coorRep',"DMM");
						app.gpsCoordRepresentation = "DMM";
						displayCoords.innerHTML = "Toggle " + app.gpsCoordRepresentation + " -> DMS -> DDD";
					} else if (app.gpsCoordRepresentation == "DMM") {
						localStorage.setItem('coorRep',"DMS");
						app.gpsCoordRepresentation = "DMS";
						displayCoords.innerHTML = "Toggle " + app.gpsCoordRepresentation + " -> DDD -> DMM";						
					} else {
						localStorage.setItem('coorRep',"DDD");
						app.gpsCoordRepresentation = "DDD";
						displayCoords.innerHTML = "Toggle " + app.gpsCoordRepresentation + " -> DMM -> DMS";							
					};
					//console.log(`now coords are ${app.gpsCoordRepresentation}`);
				
				 break;
				case 'toggleManualCoords':
					var displayCoords = document.getElementById("manualCoordsDisplay");
					var manualCoordFormat = localStorage.getItem('manualCoordFormat');

					//console.log(`current coords are ${app.gpsCoordRepresentation}`);
					if (manualCoordFormat == "DDD") {
						manualCoordFormat = "DMM";
						localStorage.setItem('manualCoordFormat',"DMM");

						displayCoords.innerHTML = "Toggle " + manualCoordFormat + " -> DMS -> DDD";
					} else if (manualCoordFormat == "DMM") {
						manualCoordFormat = "DMS";						
						localStorage.setItem('manualCoordFormat',"DMS");

						displayCoords.innerHTML = "Toggle " + manualCoordFormat + " -> DDD -> DMM";						
					} else {
						manualCoordFormat = "DDD";						
						localStorage.setItem('manualCoordFormat',"DDD");

						displayCoords.innerHTML = "Toggle " + manualCoordFormat + " -> DMM -> DMS";							
					};
					//console.log(`now coords are ${app.gpsCoordRepresentation}`);
					var manualLat = document.getElementById('manualLat').value;
					var manualLng = document.getElementById('manualLng').value;	

					//console.log(`manualLat/Lng: ${manualLat} | ${manualLng}`);

					var rawLat = extractValue(manualLat);
					var rawLng = extractValue(manualLng);

					//console.log(`Cleaned Lat/Lng: ${rawLat} | ${rawLng}`);
					
					displayPosition(rawLat,rawLng,manualCoordFormat,"manualCoordEnter");					
				 break;	
				case 'goManualCoords':
					var manualLat = document.getElementById('manualLat').value;
					var manualLng = document.getElementById('manualLng').value;	

					current_lat = extractValue(manualLat);
					current_lng = extractValue(manualLng);
					isFocusedonMe = "no";
					map.panTo(new L.LatLng(current_lat,current_lng));	
					var myCoords=displayPosition(current_lat,current_lng,app.gpsCoordRepresentation);	
					wpContainer.innerHTML = "&#x2295; "+myCoords;						
					
					showView(0,false);
					initView();	
				 break;
				case 'goManualCoordsSetWaypoint':
					var manualLat = document.getElementById('manualLat').value;
					var manualLng = document.getElementById('manualLng').value;	

					current_lat = extractValue(manualLat);
					current_lng = extractValue(manualLng);
					isFocusedonMe = "no";
					map.panTo(new L.LatLng(current_lat,current_lng));	
					var myCoords=displayPosition(current_lat,current_lng,app.gpsCoordRepresentation);	
					wpContainer.innerHTML = "&#x2295; "+myCoords;						
					giveMeWayPoint("EndEdition");
					showView(0,false);
					initView();	
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
				 // console.log(`NavToCache action`);
				  navGeoCode = app.activeNavItem.getAttribute('navCode');
				  windowOpen = "viewMap";
				  showView(0,false);
				  initView();
				 // softkeyBar();	
				  ShowCacheOnMap(navGeoCode);
				  break;
				case 'NavToCacheDetails':
					//console.log(`navToCacheDetails action`);
				  navGeoCode = app.activeNavItem.getAttribute('navCode');
				  //CacheListID = app.currentViewID;
				  CacheListID = parseInt(app.activeNavItem.getAttribute('tabIndex'));
				  //console.log(`ID in list: ${CacheListID}`);
				  windowOpen = "viewCache";
				  LoadCacheDetails(navGeoCode,false);	
				  break;	
				case 'NavToWaypointDetails':
					//console.log(`NavToWaypointDetails action`);
				  navGeoCode = app.activeNavItem.getAttribute('navCode');
				  WaypointListID = parseInt(app.activeNavItem.getAttribute('tabIndex'));
				  //console.log(`ID in list: ${WaypointListID}`);
				  windowOpen = "viewCache";
				  LoadCacheDetails(navGeoCode,false);	
				  break;					  
				  
				case 'About':
				  windowOpen = "viewAbout";
				  showView(7,false);
				  initView();				  
				  //openURL('https://github.com/canyouswim/Caching-on-Kai/wiki/About#caching-on-kai');
				  break;
				case 'changeLog':
				  windowOpen = "viewChangeLog";
				  showView(19,false);
				  initView();					
				 break;
				case 'Help':
				  windowOpen = "viewHelp";
				  showView(5,false);
				  initView();				  
				  //openURL('https://github.com/canyouswim/Caching-on-Kai/wiki/');
				  break;
				case 'loginNew':
					if(confirm("After you have created your account, close the pop up window to come back here and then click the next box down to finish logging in.")){
						getToken(true);
					};
				 break;
				case 'loginExisting':
					getToken();
				 break;
				case 'mailto':
				  location.href = 'mailto:' + app.activeNavItem.innerHTML;
				  break;
				case 'quit':
				  window.close();
				  break;
				case 'Logout':
				  logout();
				  break;				  
				case 'changeColor':
				  app.activeNavItem.style.backgroundColor = 'green';
				  //console.log('changing color');
				  break;
			  }
			} else if (app.activeNavItem.tagName.toLowerCase() == 'legend') {
			  // select input field next to the legend
				//console.log('our tag=legend, try to switch to next element, which should be select');
				app.activeNavItem.nextElementSibling.focus();
				//console.log(`changed focus, now tagName=${app.activeNavItem.tagName.toLowerCase()}`);				
			} else {
			  console.log('nothing to execute');
			}
		} else { /* in some input field */
				//console.log(`in execute, now check to see if our selection is an input field and if our current view is settings ?=? ${app.currentViewName}`);
				if (app.currentViewName == 'Settings') { /* do this in the inputs view */
					//console.log('trying to now to update inputs from settings screen');
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
	  } else if(windowOpen == "viewWaypoints"){
		WaypointListID = parseInt(app.activeNavItem.getAttribute('tabIndex'));	
			//console.log(`CacheListID:${CacheListID}`);
	  }
	  //windowOpen = "viewOptions";	  
	  showView(6,false);
	  initView();
	  //softkeyBar();	
  } else if (app.optionButtonAction == 'viewWaypoints') {
	  CacheListID = parseInt(app.activeNavItem.getAttribute('tabIndex'));	
	  showView(20,false);
	  initView();	  
  } else if (app.optionButtonAction == 'viewList') {
	  WaypointListID = parseInt(app.activeNavItem.getAttribute('tabIndex'));	
	  showView(1,false);
	  initView();	  

  } else if (app.optionButtonAction == 'viewCacheOptions') {
	  windowOpen = "viewCacheOptions";
	  showView(10,false);
	  initView();
  } else if (app.optionButtonAction == 'trackableLookup') {
	  windowOpen = "trackableLookup";
	  showView(28,false);
	  initView();	  
  } else if (app.optionButtonAction == 'viewTrackableOptions') {
	  windowOpen = "viewTrackableOptions";
	  showView(27,false);
	  initView();	  
  } else if (app.optionButtonAction == 'doneInTextArea') {
	document.getElementById("logText").blur();
  }
};

// set soft keys
function softkeyBar() {
	//console.log(`currentViewName=${app.currentViewName}`);
	if(myStatus!=="First Run") {
		if (app.currentViewName == "viewMap") {
			app.backButton.innerHTML = "Caches";
			app.actionButton.innerHTML = "ACTION";	
			app.optionsButton.innerHTML = "Options";
			app.optionButtonAction = 'viewOptions';
		} else if(app.currentViewName == "viewList") {
			app.backButton.innerHTML = "Waypoints" //"Map";
			app.actionButton.innerHTML = "SELECT";	
			app.optionsButton.innerHTML = "Options";
			app.optionButtonAction = 'viewOptions';
		
		} else if(app.currentViewName == "viewWaypoints") {
			app.backButton.innerHTML = "Caches" //"Map";
			app.actionButton.innerHTML = "SELECT";	
			app.optionsButton.innerHTML = "Options";
			app.optionButtonAction = 'viewOptions';			
		} else if(app.currentViewName == "viewCache") {
			app.backButton.innerHTML = "Caches";
			
			app.actionButton.innerHTML = "GoNav";
			app.optionsButton.innerHTML = "Options";
			app.optionButtonAction = 'viewCacheOptions';
		} else if(app.currentViewName == "viewTrackableDetails" || app.currentViewName == "viewTrackableLogs") {
			app.backButton.innerHTML = "Back";
			
			app.actionButton.innerHTML = "LOG";
			app.optionsButton.innerHTML = "Options";
			app.optionButtonAction = 'viewTrackableOptions';	
		} else if(app.currentViewName == "viewCacheInventory") {
			app.backButton.innerHTML = "Back";
			
			app.actionButton.innerHTML = "SELECT";
			app.optionsButton.innerHTML = "Lookup";
			app.optionButtonAction = 'trackableLookup';			
		} else if(app.currentViewName == "viewWaypoint") {
			app.backButton.innerHTML = "Waypoints";
			
			app.actionButton.innerHTML = "GoNav";
			app.optionsButton.innerHTML = "Options";
			app.optionButtonAction = 'viewCacheOptions';			
		} else if(app.currentViewName == "viewCacheLogs" || app.currentViewName == "viewCacheGallery") {
			app.backButton.innerHTML = "Caches";
			
			app.actionButton.innerHTML = "SELECT";
			app.optionsButton.innerHTML = "Options";
			app.optionButtonAction = 'viewCacheOptions';
		} else if(app.currentViewName == "viewCompass")  {
			app.backButton.innerHTML = "Back";
			app.actionButton.innerHTML = "HELP";
			app.optionsButton.innerHTML = "Options";
			app.optionButtonAction = 'viewOptions';
		} else if(app.currentViewName == "viewOptions")  {
			app.backButton.innerHTML = "Back";
			app.actionButton.innerHTML = "SELECT";
			app.optionsButton.innerHTML = "";
			app.optionButtonAction = '';
		} else if(app.currentViewName == "logCache")  {
			app.backButton.innerHTML = "Back";
			app.actionButton.innerHTML = "SELECT";
			app.optionsButton.innerHTML = "";
			app.optionButtonAction = '';
		} else if(app.currentViewName == "viewAllShortcuts" || app.currentViewName == "showModal")  {
			app.backButton.innerHTML = "Back";
			app.actionButton.innerHTML = "";
			app.optionsButton.innerHTML = "";
			app.optionButtonAction = '';
		} else {
			//console.log(`setting buttons, current view: ${app.currentViewName}`);
			app.backButton.innerHTML = "Back";
			app.actionButton.innerHTML = "SELECT";
			if (app.isInputFocused()) {
			  app.optionsButton.innerHTML = "";
			  app.optionButtonAction = '';
			} else {
				app.optionsButton.innerHTML = "";
			}
			app.optionButtonAction = 'doneInTextArea';
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

function firstRunSetup(startupLat,startupLng,startupRadius) {
	// Pull list of caches near me and plot them on the map (but only if this is set to Yes in settings)
	//console.log(`from first run: ShowCachesOnLoad = ${ShowCachesOnLoad}`);
	
	if(myUserAgent.search("Nokia") > 0) {
		//alert("A special note if you use any of the Nokia phones (8110, 6300, 8000, probably 2720): the 4G antenna interfers with the A-GPS ability to obtain an accurate lock on your location. Use the 'Phone Data Settings' button under the 'Settings' screen to jump over to the phone's settings and turn off 4G when you require an accurate GPS lock.");
	}	
	
	if (ShowCachesOnLoad == "YesLoadCaches") {
		ListCaches(my_current_lat,my_current_lng,"no");	
		//loadWaypoints();
	} else {
		// this is if we don't want to pull the list of live cacheSize
		// and instead pull them from local storage
		// minimally always load up what we last had, due to the inconsistencies with KaiOS keeping the app open
			ListCaches(0,0,"yes");	
			loadWaypoints();

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
		

		Owned_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_badge_owned.png',

			iconSize:     [32, 32], // size of the icon
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
		
		Traditional_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_traditional.png',
			//iconURL: '/play/app/ui-icons/sprites/cache-types.svg#icon-2',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 
		
		Multi_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_multi.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 

		Virtual_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_virtual.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 
		
		Letterbox_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_letterbox.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 			

		Event_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_event.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 

		Mystery_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_mystery.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 
		
		ProjectAPE_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_ape.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 	
		
		Webcam_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_webcam.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 			

		Locationless_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_locationless.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 	
		
		CITO_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_cito.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 				
		
		Earth_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_earth.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 	
		
		MegaEvent_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_mega.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 	

		Adventures_cache = L.icon({
			iconUrl: '/assets/icons/type_earth.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 	
		
		Wherigo_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_wherigo.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 	

		CommunityCelebration_cache = L.icon({
			iconUrl: '/assets/icons/type_earth.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 				
		
		GeocachingHQ_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_hq.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 				
		
		GeocachingHQCelebration_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_hq.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 

		GeocachingHQBlockParty_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_blockparty.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 	

		GigaEvent_cache = L.icon({
			iconUrl: '/assets/icons/cache_icon_type_event.png',

			iconSize:     [32, 32], // size of the icon
			iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		}); 				
		
	}				

	myMarker = L.marker([startupLat,startupLng]).addTo(map);
	myAccuracy = L.circle([startupLat,startupLng], startupRadius).addTo(map);
	
	map.setView([startupLat,startupLng], zoom_level);
	
	isFocusedonMe = "yes";	

	map.panTo(new L.LatLng(startupLat,startupLng));
	current_lat = startupLat;
	current_lng = startupLng;		

	myStatus="running";
	softkeyBar();	

	// and our very last action is to see if we were previously navigating to a cache when we 
	// quit the app - if so, continue that nav selection
	
	var navToCacheGeoCode = localStorage.getItem("navToCacheGeoCode");	
	if (navToCacheGeoCode !== null) {
		// resume navigation
			navToCache(navToCacheGeoCode,true);
	};
	
	// if we have never logged in before, push the user to the Help screen to get them started and route them to log in for the first time



	var token = localStorage.getItem("access_token");
	
	if (token == null) {		
		  windowOpen = "viewHelp";
		  showView(5,false);
		  initView();	
	}	
	
	//console.log(`showChangeLog? ${showChangeLog} & startupRadius: ${startupRadius}`);
	if(showChangeLog == true && startupRadius == 0) { // show the change log
		showChangeLog = false; // turn off the flag
		showView(19,false);
		initView();		
	}	
	
}

var pastFirstTimeout = false;

function success(pos) {
	pastFirstTimeout = true;
	// this is a decent spot to check to see if our token has expired
	time_till_expire = (localStorage.getItem("token_expires") - Date.now())/1000;
	//console.log(`time till token expires: ${time_till_expire}`);
	//var refreshTokenStr = localStorage.getItem("refresh_token");
	//console.log(`time_till_expire=${time_till_expire}`);
	if(time_till_expire < 60 && time_till_expire > 0) {refreshToken();};
	//================================================


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

	mapContent = "  HINT: 1 -ZOOM MAP+ 3";
	//console.log(`myStatus=${myStatus}`);
	if(myStatus=="First Run") {
		logAnalytics("Startup","Startup",manifestVersion);
		logAnalytics("Startup","PhoneDetails",myUserAgent);
		firstRunSetup(my_current_lat,my_current_lng,radius);

	} else {
		myMarker.remove();
		myAccuracy.remove();
		myMarker = L.marker([my_current_lat,my_current_lng]).addTo(map);
		myAccuracy = L.circle([my_current_lat,my_current_lng], radius).addTo(map);
		if(isFocusedonMe == "yes") {
			MovemMap('reFocus');
		}
	}


	if(CacheLat !== 0 && CacheLng !== 0) {
		mapContent = "";
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
				mapContent = mapContent + `${roundToTwo(tripDistance * 5280)}ft to ` + cacheNameNavigating;
				distToCache.innerHTML = `<b>Distance</b></br>${roundToTwo(tripDistance * 5280)}ft`;
			} else {
				mapContent = mapContent + `${roundToTwo(tripDistance)}mi to ` + cacheNameNavigating;
				distToCache.innerHTML = `<b>Distance</b></br>${roundToTwo(tripDistance)}mi`;			
			};
		} else {
			if(tripDistance < .5) {
				mapContent = mapContent + `${roundToTwo(tripDistance * 1000)}m to ` + cacheNameNavigating;
				distToCache.innerHTML = `<b>Distance</b></br>${roundToTwo(tripDistance * 1000)}m`;
			} else {
				mapContent = mapContent + `${roundToTwo(tripDistance)}km to ` + cacheNameNavigating;
				distToCache.innerHTML = `<b>Distance</b></br>${roundToTwo(tripDistance)}km`;
			};
		};

		//calculate the bearing to the cache, relative to North
		var cacheBearing = bearing(my_current_lat,my_current_lng,CacheLat,CacheLng);
			//console.log(`cacheBearing: ${cacheBearing}`);
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
	
	if(showChangeLog == true) { //otherwise show the change log
		showChangeLog = false; // turn off the flag
		showView(19,false);
		initView();		
	}		
  
}

var goAhead = true; // meaning, continue loading the app even if we don't have a GPS lock


function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  if((err.code == 1 || err.code == 3) && stopGPSWarning == false && pastFirstTimeout == false) {
	//either GPS is turned off or we don't have rights to access the GPS
	
	pastFirstTimeout = true;
	
	if(err.code == 1) {
		stopGPSWarning = true;
		var respondGPS = confirm("GPS is turned off - Select OK to go turn it on");
		if (respondGPS == true) {
			mozactivity.openGPS(); // open up the phone's geoLocation settings screen
		} else {
			// didn't get permission to turn on GPS, so stop trying to find GPS location
			navigator.geolocation.clearWatch(id);
			//console.log('stopping attempts at locating GPS');
			container.innerHTML = "No GPS";			
		};
	};
	
	//var goAhead = true; // meaning, continue loading the app even if we don't have a GPS lock
	
	if (goAhead == true) {
		//console.log(`storedLat: ${storedLat}`);
		goAhead = false;
		if(storedLat !== '0') {
			kaiosToaster({
			  message: 'No lock yet - will use previously stored location',
			  position: 'south',
			  type: 'warning',
			  timeout: 3000
			});	
			my_current_lat = storedLat;
			my_current_lng = storedLng;
			// if we have a previously stored location, use that to load us up 
			if(myStatus=="First Run") {
				firstRunSetup(my_current_lat,my_current_lng,0);
			}		
			
			
		} else {
			kaiosToaster({
			  message: 'No lock yet - will used previously stored location',
			  position: 'south',
			  type: 'warning',
			  timeout: 3000
			});	
			if(myStatus=="First Run") {
				firstRunSetup(0,0,0);
			}			
		}
	}
	
  } else if ((err.code == 1 || err.code == 3) && stopGPSWarning == true && pastFirstTimeout == false) {
	  // try stopping and restarting the GPS until the user has set the GPS to be turned on
	  pastFirstTimeout = true;
	  navigator.geolocation.clearWatch(id);	  
	  id = navigator.geolocation.watchPosition(success, error, options);
  } else {
	  attempt = attempt + 1;
	  mapContent = "<img src='/assets/Bars-1s.gif'>Timeout #" + attempt;
		container.innerHTML = mapContent;	
	if (goAhead == true) {
		//console.log(`storedLat: ${storedLat}`);
		if(storedLat !== '0') {

			// if we have a previously stored location, use that to load us up 
			if(myStatus=="First Run") {
				kaiosToaster({
				  message: 'No lock yet - will use previously stored location as your starting point',
				  position: 'south',
				  type: 'warning',
				  timeout: 3000
				});	
				my_current_lat = storedLat;
				my_current_lng = storedLng;				
				firstRunSetup(my_current_lat,my_current_lng,0);
			}		
			
			
		} else {

			if(myStatus=="First Run") {
				kaiosToaster({
				  message: 'Still trying to get a GPS lock. We do not have a stored previous location to use.',
				  position: 'south',
				  type: 'warning',
				  timeout: 3000
				});					
				
				firstRunSetup(0,0,0);
			}			
		}
	}

		
  }		

}

function updateUserDetails() {
	//console.log('updating user details');
	//----------------------------
	// update our stored user details / stats
	
	var values = "users/me?fields=referenceCode,username,membershipLevelId,homeCoordinates,geocacheLimits,favoritePoints,findCount,avatarUrl";

	var xhr = new XMLHttpRequest({ mozSystem: true });
	var geomethod = "GET";	
	var geourl = app.rootAPIurl + values;
	
	var token = localStorage.getItem("access_token");
	
	if (token !== null) {
		//console.log('we have a token');
		xhr.open(geomethod, geourl, true);
		
		xhr.setRequestHeader('Authorization', 'bearer ' + token);		

		xhr.onreadystatechange = function () {
		  var geoloadstate = xhr.readyState;
		  //console.log(`Load state: ${geoloadstate}`);
		  if (geoloadstate == 1) {
			  //console.log('request opened');
		  } else if (geoloadstate == 2) {
			//console.log('headers received'); 
		  } else if (geoloadstate == 3) {
			 // console.log('loading data');
		  } else if (geoloadstate == 4) {
			var geostatus = xhr.status;
				//console.log(`status: ${geostatus}`);
			if (geostatus >= 200 && geostatus < 400) {
			  var siteText = xhr.response;				
				//console.log(`response: ${siteText}`);

				//===============================================================
				// now parse the returned JSON out and do stuff with it
				
				var userDetails = JSON.parse(siteText);
				myUserCode = userDetails.referenceCode;
				myUserAlias = userDetails.username;
				myUserAvatar = userDetails.avatarUrl;
				
				var fullCallsSecondsToLive = userDetails.geocacheLimits.fullCallsSecondsToLive;
				var fullCallsMillisecondsToLive = (fullCallsSecondsToLive * 1000);
				var rightNow = Date.now();
				var fullCallsReset = new Date(rightNow + fullCallsMillisecondsToLive);	
				var fullCallsResetLocal = fullCallsReset.toLocaleString()
				//console.log(`User cache limit resets in ${fullCallsSecondsToLive} seconds`);
				//console.log(`User cache limit resets on ${fullCallsResetLocal}`);
				localStorage.setItem('fullCallsReset',fullCallsResetLocal);				
				
				document.getElementById("username").innerHTML = myUserAlias;
				//document.getElementById("userCode").innerHTML = userDetails.referenceCode;
				if(userDetails.homeCoordinates !== null) {
					document.getElementById("homeLocation").innerHTML = userDetails.homeCoordinates.latitude + ", " + userDetails.homeCoordinates.longitude;
				} else {
					document.getElementById("homeLocation").innerHTML = "No home coordinates set";				
				}
				
				if(userDetails.avatarUrl !== null){
					document.getElementById("avatar").innerHTML = "<img src='" + userDetails.avatarUrl + "' width='50'>";
				}
				document.getElementById("findCount").innerHTML = "<b>Finds:</b> " + userDetails.findCount;
				document.getElementById("favoritePoints").innerHTML = "<b>Fav Points:</b> " + userDetails.favoritePoints;
				
				favPointsAvailable = userDetails.favoritePoints;
	
				if(userDetails.membershipLevelId == 1) {
					document.getElementById("membershipType").innerHTML = "<b>Membership</b>: BASIC";
					
					var userText = "As a basic Geocaching member, you are permitted to download full details of 3 geocaches per 24 hour period.  You currently have <b>" + userDetails.geocacheLimits.fullCallsRemaining + " caches remaining";

					if(fullCallsResetLocal != "Invalid Date") {
						userText = userText + " until " + fullCallsResetLocal + "</b> when your basic member limit will be reset";	
					};
					document.getElementById("cacheViewsRemaining").innerHTML = userText;
	
				} else if (userDetails.membershipLevelId == 2) {
					document.getElementById("membershipType").innerHTML = "<b>Membership</b>: Charter";					
				}  else if (userDetails.membershipLevelId == 3) {
					document.getElementById("membershipType").innerHTML = "<b>Membership</b>: Premium";					
				} else {
					document.getElementById("membershipType").innerHTML = "<b>Membership</b>: Unknown";	
				};
				userMembershipLevelId = userDetails.membershipLevelId;
				localStorage.setItem('membershipLevelId',userMembershipLevelId);
				localStorage.setItem('fullCallsRemaining',userDetails.geocacheLimits.fullCallsRemaining);

				
			}  else if (geostatus == 401) {
				// token has expired, refresh and tell caller to retry
				console.log('refreshing token');
				refreshToken();
			}
		  }  else {
			// Oh no! There has been an error with the request!
			console.log("some problem trying to refresh the token...");
					// turn off the loading spinner
					loadingOverlay(false);	
					alert("There was an issue connecting to geocaching.com...");			
		  }
		}; 
		
		xhr.send();	
	} else {
		getToken();

	};	
}

function logAnalytics(eventCategory,eventAction,eventLabel) {

// generally, we log:
// - app version
// - OS version
// - action the user took (started app, pull cache list, nav to cache, log cache)
// - is the user premium or not 
// the intent of these analytics are to understand app usage, generally, and how deeply it is being used

/*
	Sample app page payload:

Do as a screenview:
These are required:
	v=1                         // Version, always 1 for now
	&tid=UA-XXXXX-Y             // Tracking ID / Property ID - my google ID -> UA-208621269-1
	&cid=555                    // Anonymous Client ID to uniquely identify the app client user
	&t=screenview               // Screenview hit type, append the "action" variable here
	
Then app details:
	&an=cache-on-kai                // App name -> cache-on-kai
	&av=manifestVersion             // App version -> pull the version from this code manifest
	
Then screen name details (goes along with screenview hit type)
	&cd=action						// this is the screen or action the user is taking - logging in, nav to cache, etc

Do as an Event trigger:
v=1
&t=event
&tid=
&cid=myUserAlias   							// unique ID of the user
&av=								// manifest version ID
&an=cache-on-kai
&ec=Login									// event category
&ea=Login									// event action
&el=membershipLevelId						// type of user, put into the event label field

or:
&ec=Caches									// event category
&ea=LoadCaches / NavToCache / LogCache									// event action
&el=Found / DNF / Note (if log cache)									// event label - in this case, type of user
&ev=userMembershipLevelId													// type of user



	Details on those ^^^ parameters - https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
	
	Details on formating the payload - https://developers.google.com/analytics/devguides/collection/protocol/v1/reference
	
	GET /collect?payload_data     (using HTTP/1.1)
	Host: https://www.google-analytics.com
	User-Agent: user_agent_string

*/

	var xhr = new XMLHttpRequest({ mozSystem: true });
	var method = "GET";	
	var url = "https://www.google-analytics.com/collect?";
	
	url = url + "v=1&t=event&tid=" + googleUA;
	url = url + "&cid=" + myUserAlias;
	url = url + "&an=cache-on-kai&av=" + manifestVersion;
	url = url + "&ec=" + eventCategory;
	url = url + "&ea=" + eventAction;
	url = url + "&el=" + eventLabel;
	url = url + "&ev=" + userMembershipLevelId;

		xhr.open(method, url, true);	

		xhr.onreadystatechange = function () {
		  var geoloadstate = xhr.readyState;
		  //console.log(`Load state: ${geoloadstate}`);
		  if (geoloadstate == 1) {
			  //console.log('request opened');
		  } else if (geoloadstate == 2) {
			//console.log('headers received'); 
		  } else if (geoloadstate == 3) {
			 // console.log('loading data');
		  } else if (geoloadstate == 4) {
			var geostatus = xhr.status;
				//console.log(`GA submit status: ${geostatus}. wrote category: ${eventCategory}, Action: ${eventAction}, Label: ${eventLabel}, MembershipLevel: ${userMembershipLevelId}`);
			if (geostatus >= 200 && geostatus < 400) {
			  var siteText = xhr.response;				

				
			}  else if (geostatus == 401) {

			}
		  }  else {
			// Oh no! There has been an error with the request!
			console.log("some problem trying to write to analytics...");
		  }
		}; 
		xhr.send();	
}

function getChangeLog() {
	console.log('pulling change log');

	var xhr = new XMLHttpRequest({ mozSystem: true });
	var geomethod = "GET";	
	var geourl = "https://caching-on-kai.com/home/change-log/";

		//console.log('we have a token');
		xhr.open(geomethod, geourl, true);	

		xhr.onreadystatechange = function () {
		  var geoloadstate = xhr.readyState;
		  //console.log(`Load state: ${geoloadstate}`);
		  if (geoloadstate == 1) {
			  //console.log('request opened');
		  } else if (geoloadstate == 2) {
			//console.log('headers received'); 
		  } else if (geoloadstate == 3) {
			 // console.log('loading data');
		  } else if (geoloadstate == 4) {
			var geostatus = xhr.status;
				//console.log(`status: ${geostatus}`);
			if (geostatus >= 200 && geostatus < 400) {
			  var siteText = xhr.response;				
				console.log(`Change Log: ${siteText}`);
				
			}  else if (geostatus == 401) {

			}
		  }  else {
			// Oh no! There has been an error with the request!
			console.log("some problem trying to pull change log...");
		  }
		}; 
		xhr.send();	
}

function ListCachesFromMapCenter() {
	// get the lat/lng of the center of the current map view and refresh the list of caches from that point instead
	// of the current GPS location
	
	var mapCrd = map.getCenter();
	var mapLat = mapCrd.lat;
	var mapLng = mapCrd.lng;
	
	//console.log(`mapLat/Lng: ${mapLat}/${mapLng}`);
	ListCaches(mapLat,mapLng);
	
}

function ListCaches(myLat,myLng,loadFromStorage,showListWhenDone) {
	//console.log(`ListCaches loadFromStorage=${loadFromStorage}`);

	if(loadFromStorage =="no"){
		updateUserDetails()	
		logAnalytics("Caches","LoadCaches",userMembershipLevelId);		
		var values = "geocaches/search?q=location: [" + myLat + "," + myLng + "]";
		values = values + "&lite=true";			

		values = values + "&take=" + numCachesToLoad; //how many caches to return?
		values = values + "&fields=referenceCode,name,difficulty,terrain,geocacheType,status,postedCoordinates,isPremiumOnly,userData,ownerAlias,placedDate,geocacheSize,favoritePoints,findCount,dnfcount,lastVisitedDate,ownerCode,ownerAlias";	

		var xhr = new XMLHttpRequest({ mozSystem: true });
		var geomethod = "GET";	
		var geourl = app.rootAPIurl + values;
		
		var token = localStorage.getItem("access_token");
		
		if (token !== null) {
			//console.log('we have a token');
			xhr.open(geomethod, geourl, true);
			
			xhr.setRequestHeader('Authorization', 'bearer ' + token);		

			xhr.onreadystatechange = function () {
			  var geoloadstate = xhr.readyState;
			 // console.log(`Load state: ${geoloadstate}`);
			  if (geoloadstate == 1) {
				//  console.log('request opened');
			  } else if (geoloadstate == 2) {
				//console.log('headers received'); 
						
			  } else if (geoloadstate == 3) {
				 // console.log('loading data');
					kaiosToaster({
					  message: 'Loading data...',
					  position: 'north',
					  type: 'warning',
					  timeout: 500
					});							  
			  } else if (geoloadstate == 4) {
				var geostatus = xhr.status;
				//console.log(`status: ${geostatus}`);
				if (geostatus >= 200 && geostatus < 400) {
					var siteText = xhr.response;				
					//console.log(`response: ${siteText}`);
					localStorage.setItem('geocachingResponse', siteText);

					//===============================================================
					// now parse the returned JSON out and do stuff with it
					
					var geoCacheDetails = JSON.parse(siteText);
					CacheCount = geoCacheDetails.length;
					console.log(`Pulling list of Caches: CacheCount: ${CacheCount}`);
						

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
					});				
					// turn on the loading spinner
					loadingOverlay(true);

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

					//
					// cycle through all the returned caches and 
					//		1) load them up into an array that we can reference later, and
					//		2) load them into the cache listing page for display / selection by the user 
					//
					for (let i = 0; i < CacheCount; i++) {
						// parse out the returned response 
						// the "isPremiumOnly" attribute is true when cache is premium only. 
						var CachePremium = geoCacheDetails[i].isPremiumOnly;
						
						var CacheName = geoCacheDetails[i].name;
						//var CacheDetailsStr = geoCacheDetails[i].longDescription;
						var CacheType = geoCacheDetails[i].geocacheType.id;
						// translate the CacheType into an icon for use
						
						var geoCode = geoCacheDetails[i].referenceCode;
						 
						var CacheOwner = geoCacheDetails[i].ownerAlias;
					
						var Distance;

						// we need to real-time calculate the distance to each cache, based on our current location
						var tripDistance = findDistance(my_current_lat,my_current_lng,geoCacheDetails[i].postedCoordinates.latitude,geoCacheDetails[i].postedCoordinates.longitude);

						if(myUnits == "mi") {
							if(tripDistance < .5) {
								Distance = `${roundToTwo(tripDistance * 5280)}ft`;
							} else {
								Distance = `${roundToTwo(tripDistance)}mi`;		
							};
						} else {
							if(tripDistance < .5) {
								Distance = `${roundToTwo(tripDistance * 1000)}m`;
							} else {
								Distance = `${roundToTwo(tripDistance)}km`;
							};
						};							

						var CacheBadgeRoot = "<svg class='cache-type-img' width='32' height='32'><use xlink:href='/play/app/ui-icons/sprites/cache-types.svg#icon-" + CacheType + "' /></svg>"
						var CacheBadge = CacheBadgeRoot;
						
						// add on other badge attributes, such as the it has been found or is owned by the current user
						var CacheFound;
						if (geoCacheDetails[i].userData.foundDate === undefined) {
							CacheFound = "no";
						} else {
							CacheFound = "yes";
							CacheBadge = CacheBadgeRoot + "<svg class='badge' width='18' height='18'> <use xlink:href='/play/app/ui-icons/sprites/cache-types.svg#icon-found' /> </svg>"									
						}								
						
						if (CacheOwner == myUserAlias){ //meaning, i own this cache
							CacheBadge = CacheBadgeRoot + "<svg class='badge' width='18' height='18'> <use xlink:href='/play/app/ui-icons/sprites/cache-types.svg#icon-owned' /> </svg>"						
						}		


						// load up the cache array for use in other areas of the app
						var ContainerSize = "<img src='/images/icons/container/" + geoCacheDetails[i].geocacheSize.name + ".gif'> (" + geoCacheDetails[i].geocacheSize.name + ")";
						
						var Terrain;
							switch(geoCacheDetails[i].terrain) {
							  case 1:
									Terrain = "/images/stars/stars1.gif";
								break;
							  case 1.5:
									Terrain = "/images/stars/stars1_5.gif";									
								break;
							  case 2:
									Terrain = "/images/stars/stars2.gif";										
								break;
							  case 2.5:
									Terrain = "/images/stars/stars2_5.gif";										
								break;
							  case 3:
									Terrain = "/images/stars/stars3.gif";										
								break;
							  case 3.5:
									Terrain = "/images/stars/stars3_5.gif";										
								break;
							  case 4:
									Terrain = "/images/stars/stars4.gif";										
								break;
							  case 4.5:
									Terrain = "/images/stars/stars4_5.gif";										
								break;
							  case 5:
									Terrain = "/images/stars/stars5.gif";																			
							}
							Terrain = "<img src='" + Terrain + "'>";
						
						var Difficulty;
							switch(geoCacheDetails[i].difficulty) {
							  case 1:
									Difficulty = "/images/stars/stars1.gif";
								break;
							  case 1.5:
									Difficulty = "/images/stars/stars1_5.gif";										
								break;
							  case 2:
									Difficulty = "/images/stars/stars2.gif";										
								break;
							  case 2.5:
									Difficulty = "/images/stars/stars2_5.gif";										
								break;
							  case 3:
									Difficulty = "/images/stars/stars3.gif";										
								break;
							  case 3.5:
									Difficulty = "/images/stars/stars3_5.gif";										
								break;
							  case 4:
									Difficulty = "/images/stars/stars4.gif";										
								break;
							  case 4.5:
									Difficulty = "/images/stars/stars4_5.gif";										
								break;
							  case 5:
									Difficulty = "/images/stars/stars5.gif";																			
							}	
							Difficulty = "<img src='" + Difficulty + "'>";
							
						var PlacedRaw = geoCacheDetails[i].placedDate;								
						var Placed = PlacedRaw.slice(0,10);	

						var lastVisitedDateRaw = geoCacheDetails[i].lastVisitedDate;
						if(lastVisitedDateRaw !== null){
							var lastVisitedDate = lastVisitedDateRaw.slice(0,10);
						} else {
							var lastVisitedDate = "never";
						}

						// now work on loading those details into the cache listing page 
						var entry = document.createElement("div");
						entry.className = 'navItem';
						entry.tabIndex = i * 10;		

						var BadgeContent = document.createElement("span");
						BadgeContent.innerHTML = CacheBadge;
						entry.appendChild(BadgeContent);

						var headline = document.createElement("span");
						headline.innerHTML = "<b>" + CacheName + "</b><br>" + Distance;

						if(CachePremium=="true" || CachePremium==true) {
							headline.innerHTML = headline.innerHTML + "&nbsp&nbsp <span class='premium'><b>PREMIUM</b></span>";
						}
						
						// take that structured HTML and drop it into the page:
						entry.appendChild(headline);	

						entry.setAttribute('data-function', 'NavToCacheDetails');
						entry.setAttribute('NavCode',geoCode);

						listContainer.appendChild(entry);	

//  "favoritePoints": 0,
//  "findCount": 0,
//  "dnfCount": 0,
//  "lastVisitedDate": "2021-08-10T15:48:16.897Z",
//  "ownerCode": "string",
//  "ownerAlias": "string",  

						// load up the cache array for use in other areas of the app
						arrayCacheObject = {
							cacheName: CacheName, //0
							cacheBadge: CacheBadge, //1
							cacheDescription: "", //2
							cacheHiddenDate: Placed, //3
							cacheDifficulty: Difficulty, //4
							cacheTerrain: Terrain, //5
							cacheSize: ContainerSize, //6
							cacheGUID: geoCode, //7
							cacheLat: geoCacheDetails[i].postedCoordinates.latitude, //8
							cacheLng: geoCacheDetails[i].postedCoordinates.longitude, //9
							cacheCode: geoCode, //10
							cacheType: CacheType, //11
							cacheFound: CacheFound, //12
							cacheOriginID: i, //13
							cacheHint: "", //14
							cacheLogs: "", //15
							cacheFullyLoaded: false, //16
							cacheTrackableCount: "", //17
							cacheStatus: "", //18
							cacheLastVisited: "", //19
							cacheShortDescription: "", //20
							cacheAttributes: "", //21
							cacheFindCount: geoCacheDetails[i].findCount, //22
							cacheUserData: "", //23
							cacheFavoritePoints: geoCacheDetails[i].favoritePoints,
							cacheDNFCount: geoCacheDetails[i].dnfCount,
							cacheLastVisited: lastVisitedDate,
							cacheOwner: geoCacheDetails[i].ownerAlias,
							cacheOwnerCode: geoCacheDetails[i].ownerCode,
							cacheIsPremium: geoCacheDetails[i].isPremiumOnly
						};
						arrayCache[i] = arrayCacheObject;	
						
					}				

					//================================
					// finally we need to go see if we have any of these cache details already loaded in localstorage
					// and if so, load those up as well and mark those caches as fully loaded
					
					
					// first pull the current list of stored caches
					var arrayCacheDetailsStr = localStorage.getItem("arrayCacheDetails");
					
					if(arrayCacheDetailsStr !== null) {
						arrayCacheDetails = JSON.parse(localStorage.getItem("arrayCacheDetails"));
						// now parse through these and see if any match what we have already
						
						var rightNowMilliseconds = Date.now();
						var cacheExpiresDate;
						
						var rightNow = new Date(rightNowMilliseconds);
						var rightNowLocal = rightNow.toLocaleString();	
						
						for (let i = 0; i < (arrayCacheDetails.length); i++) {
							// very first thing we need to do before we even check
							// is see if the full details we've loaded have expired 
							cacheExpiresDate = new Date(arrayCacheDetails[i].expires);
							if(cacheExpiresDate < rightNow){
								// if expired, remove that item from the array 
								arrayCacheDetails.splice(i,1);
							};
							// now pull the navCode and see if it maches one we already have in our array 
							for (let j = 0; j < (arrayCache.length); j++){
								if(arrayCacheDetails[i].navCode == arrayCache[j].cacheCode) {
									// update our stored cache array with these full details
									//===============================================
									// note: this code below should match what is in the LoadCacheDetails function
									//===============================================================
									// now parse the returned JSON out and do stuff with it
									var CacheID = j;
									var cacheDetails = JSON.parse(arrayCacheDetails[i].cacheDetails);
									var imageCount = cacheDetails.images.length;
									var logCount = cacheDetails.geocacheLogs.length;
									//var logImageCount
										
									var lastVisitedRaw = cacheDetails.lastVisitedDate;		
									if(lastVisitedRaw !== null) {
										var lastVisited = lastVisitedRaw.slice(0,10);		
									} else {
										var lastVisited = "never";
									}
									
									//update the cache array entry with the rest of the live details 
									arrayCache[CacheID].cacheName = cacheDetails.name;
									arrayCache[CacheID].cacheDescription = cacheDetails.longDescription;
									//arrayCache[CacheID].cacheHiddenDate = Placed;
									//arrayCache[CacheID].cacheDifficulty = Difficulty;
									//arrayCache[CacheID].cacheTerrain = Terrain;
									//arrayCache[CacheID].cacheSize = ContainerSize;
									arrayCache[CacheID].cacheHint = cacheDetails.hints;
									arrayCache[CacheID].cacheLogs = cacheDetails.geocacheLogs;
									arrayCache[CacheID].cacheFullyLoaded = true;	
									arrayCache[CacheID].cacheTrackableCount = cacheDetails.trackableCount;
									arrayCache[CacheID].cacheStatus = cacheDetails.status;
									arrayCache[CacheID].cacheLastVisited = lastVisited;
									arrayCache[CacheID].cacheShortDescription = cacheDetails.shortDescription;
									arrayCache[CacheID].cacheAttributes = cacheDetails.attributes;
									//arrayCache[CacheID].cacheFindCount = cacheDetails.findCount;
									arrayCache[CacheID].cacheUserData = cacheDetails.userData;		
									arrayCache[CacheID].cacheImages = cacheDetails.images;
									arrayCache[CacheID].cacheIsPremium = cacheDetails.isPremiumOnly;
									
									// and now update the cache list to show that cache is fully loaded
									updateCacheListWithLoaded(CacheID,false);
								};
							};
							
						};
						// once we're done processing the array, we need to push it back to localstorage 
						// so that we commit any removed / expired cacheShortDescription
						localStorage.setItem("arrayCacheDetails", JSON.stringify(arrayCacheDetails));			
					};

					// let the user know we're done processing data
					kaiosToaster({	
					  message: 'Caches loaded',	
					  position: 'north',	
					  type: 'success',	
					  timeout: 3000	
					});	
					// turn off the loading spinner
					loadingOverlay(false);	
					
					//if yes, bounce over to the cache list itself after loading the list of caches
					if(showListWhenDone=="yes") {
						showView(1,false);	
						initView();	
					}
					

				}  else if (geostatus == 401) {
					// token has expired, refresh and tell caller to retry
					//console.log('refreshing token');
					refreshToken();
				}  else {
				// Oh no! There has been an error with the request!
				//console.log("some problem...");
					// turn off the loading spinner
					loadingOverlay(false);	
					alert("There was an issue connecting to geocaching.com...");
			    }
			  }; 
			}
			kaiosToaster({
			  message: 'Getting caches...',
			  position: 'north',
			  type: 'warning',
			  timeout: 3000
			});	
			// turn on the loading spinner
			loadingOverlay(true);
			
			xhr.send();	
		} else {
			getToken();
		};	
		
	//=================================================================
	// load caches from storage, here
	//
	//===================================================================
	} else if(loadFromStorage =="yes") {
		// pull in from last cache list when we were last using the app
		var siteText = localStorage.getItem('geocachingResponse');
		if(siteText == null) {
			console.log('no previous list of caches available to load');
		} else {
			//Loading up caches...
			updateUserDetails()	

			// turn on the loading spinner
			loadingOverlay(true);	
			
			//console.log(`response from storage: ${siteText}`);
			//===============================================================
			// now parse the returned JSON out and do stuff with it
			
			var geoCacheDetails = JSON.parse(siteText);
			CacheCount = geoCacheDetails.length;
			//console.log(`CacheCount: ${CacheCount}`);
				

			//================================================================================
			//
			// Display list of caches
			//
			//
			var listContainer = document.getElementById('CacheList');
			listContainer.innerHTML = '';
			
			CacheListID = 0;

			


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

			//
			// cycle through all the returned caches and 
			//		1) load them up into an array that we can reference later, and
			//		2) load them into the cache listing page for display / selection by the user 
			//
			for (let i = 0; i < CacheCount; i++) {
				// parse out the returned response 
				// the "isPremiumOnly" attribute is true when cache is premium only. 
				var CachePremium = geoCacheDetails[i].isPremiumOnly;
				
				var CacheName = geoCacheDetails[i].name;
				//var CacheDetailsStr = geoCacheDetails[i].longDescription;
				var CacheType = geoCacheDetails[i].geocacheType.id;
				// translate the CacheType into an icon for use
				
				var geoCode = geoCacheDetails[i].referenceCode;
				 
				var CacheOwner = geoCacheDetails[i].ownerAlias;
			
				var Distance;

				// we need to real-time calculate the distance to each cache, based on our current location
				var tripDistance = findDistance(my_current_lat,my_current_lng,geoCacheDetails[i].postedCoordinates.latitude,geoCacheDetails[i].postedCoordinates.longitude);

				//console.log(`creating list of caches - myUnits=${myUnits}`);
				if(myUnits == "mi") {
					if(tripDistance < .5) {
						Distance = `${roundToTwo(tripDistance * 5280)}ft`;
					} else {
						Distance = `${roundToTwo(tripDistance)}mi`;		
					};
				} else {
					if(tripDistance < .5) {
						Distance = `${roundToTwo(tripDistance * 1000)}m`;
					} else {
						Distance = `${roundToTwo(tripDistance)}km`;
					};
				};							

				var CacheBadgeRoot = "<svg class='cache-type-img' width='32' height='32'><use xlink:href='/play/app/ui-icons/sprites/cache-types.svg#icon-" + CacheType + "' /></svg>"
				var CacheBadge = CacheBadgeRoot;
				
				// add on other badge attributes, such as the it has been found or is owned by the current user
				var CacheFound;
				if (geoCacheDetails[i].userData.foundDate === undefined) {
					CacheFound = "no";
				} else {
					CacheFound = "yes";
					CacheBadge = CacheBadgeRoot + "<svg class='badge' width='18' height='18'> <use xlink:href='/play/app/ui-icons/sprites/cache-types.svg#icon-found' /> </svg>"									
				}								
				
				if (CacheOwner == myUserAlias){ //meaning, i own this cache
					CacheBadge = CacheBadgeRoot + "<svg class='badge' width='18' height='18'> <use xlink:href='/play/app/ui-icons/sprites/cache-types.svg#icon-owned' /> </svg>"						
				}							

						var ContainerSize = "<img src='/images/icons/container/" + geoCacheDetails[i].geocacheSize.name + ".gif'> (" + geoCacheDetails[i].geocacheSize.name + ")";
						
						var Terrain;
							switch(geoCacheDetails[i].terrain) {
							  case 1:
									Terrain = "/images/stars/stars1.gif";
								break;
							  case 1.5:
									Terrain = "/images/stars/stars1_5.gif";									
								break;
							  case 2:
									Terrain = "/images/stars/stars2.gif";										
								break;
							  case 2.5:
									Terrain = "/images/stars/stars2_5.gif";										
								break;
							  case 3:
									Terrain = "/images/stars/stars3.gif";										
								break;
							  case 3.5:
									Terrain = "/images/stars/stars3_5.gif";										
								break;
							  case 4:
									Terrain = "/images/stars/stars4.gif";										
								break;
							  case 4.5:
									Terrain = "/images/stars/stars4_5.gif";										
								break;
							  case 5:
									Terrain = "/images/stars/stars5.gif";																			
							}
							Terrain = "<img src='" + Terrain + "'>";
						
						var Difficulty;
							switch(geoCacheDetails[i].difficulty) {
							  case 1:
									Difficulty = "/images/stars/stars1.gif";
								break;
							  case 1.5:
									Difficulty = "/images/stars/stars1_5.gif";										
								break;
							  case 2:
									Difficulty = "/images/stars/stars2.gif";										
								break;
							  case 2.5:
									Difficulty = "/images/stars/stars2_5.gif";										
								break;
							  case 3:
									Difficulty = "/images/stars/stars3.gif";										
								break;
							  case 3.5:
									Difficulty = "/images/stars/stars3_5.gif";										
								break;
							  case 4:
									Difficulty = "/images/stars/stars4.gif";										
								break;
							  case 4.5:
									Difficulty = "/images/stars/stars4_5.gif";										
								break;
							  case 5:
									Difficulty = "/images/stars/stars5.gif";																			
							}	
							Difficulty = "<img src='" + Difficulty + "'>";
							
						var PlacedRaw = geoCacheDetails[i].placedDate;								
						var Placed = PlacedRaw.slice(0,10);	

						var lastVisitedDateRaw = geoCacheDetails[i].lastVisitedDate;
						if(lastVisitedDateRaw !== null){
							var lastVisitedDate = lastVisitedDateRaw.slice(0,10);
						} else {
							var lastVisitedDate = "never";
						}


				// now work on loading those details into the cache listing page 
				var entry = document.createElement("div");
				entry.className = 'navItem';
				entry.tabIndex = i * 10;		

				var BadgeContent = document.createElement("span");
				BadgeContent.innerHTML = CacheBadge;
				entry.appendChild(BadgeContent);

				var headline = document.createElement("span");
				headline.innerHTML = "<b>" + CacheName + "</b><br>" + Distance;		

				if(CachePremium=="true" || CachePremium==true) {
					headline.innerHTML = headline.innerHTML + "&nbsp&nbsp <span class='premium'><b>PREMIUM</b></span>";
				}

				
				// take that structured HTML and drop it into the page:
				entry.appendChild(headline);	

				entry.setAttribute('data-function', 'NavToCacheDetails');
				entry.setAttribute('NavCode',geoCode);

				listContainer.appendChild(entry);	

				// load up the cache array for use in other areas of the app
				arrayCacheObject = {
					cacheName: CacheName, //0
					cacheBadge: CacheBadge, //1
					cacheDescription: "", //2
					cacheHiddenDate: Placed, //3
					cacheDifficulty: Difficulty, //4
					cacheTerrain: Terrain, //5
					cacheSize: ContainerSize, //6
					cacheGUID: geoCode, //7
					cacheLat: geoCacheDetails[i].postedCoordinates.latitude, //8
					cacheLng: geoCacheDetails[i].postedCoordinates.longitude, //9
					cacheCode: geoCode, //10
					cacheType: CacheType, //11
					cacheFound: CacheFound, //12
					cacheOriginID: i, //13
					cacheHint: "", //14
					cacheLogs: "", //15
					cacheFullyLoaded: false, //16
					cacheTrackableCount: "", //17
					cacheStatus: "", //18
					cacheLastVisited: "", //19
					cacheShortDescription: "", //20
					cacheAttributes: "", //21
					cacheFindCount: geoCacheDetails[i].findCount, //22
					cacheUserData: "", //23
					cacheFavoritePoints: geoCacheDetails[i].favoritePoints,
					cacheDNFCount: geoCacheDetails[i].dnfCount,
					cacheLastVisited: lastVisitedDate,
					cacheOwner: geoCacheDetails[i].ownerAlias,
					cacheOwnerCode: geoCacheDetails[i].ownerCode,
					cacheIsPremium: geoCacheDetails[i].isPremiumOnly
				};
				arrayCache[i] = arrayCacheObject;		
				
		}				
		
		//================================
		// finally we need to go see if we have any of these cache details already loaded in localstorage
		// and if so, load those up as well and mark those caches as fully loaded
		// first pull the list of stored caches, and then second follow along and pull the list of stored images for those caches 
		
		
		// first pull the current list of stored caches
		var arrayCacheDetailsStr = localStorage.getItem("arrayCacheDetails");

		if(arrayCacheDetailsStr !== null) {
			arrayCacheDetails = JSON.parse(localStorage.getItem("arrayCacheDetails"));
			// now parse through these and see if any match what we have already
			
			var rightNowMilliseconds = Date.now();
			var cacheExpiresDate;
			
			var rightNow = new Date(rightNowMilliseconds);
			var rightNowLocal = rightNow.toLocaleString();	
			
			for (let i = 0; i < (arrayCacheDetails.length); i++) {
				// very first thing we need to do before we even check
				// is see if the full details we've loaded have expired 
				var breakTest = false;
				//console.log(`expires:${arrayCacheDetails[i].expires} ?<? rightNowLocal:${rightNowLocal}`);
				cacheExpiresDate = new Date(arrayCacheDetails[i].expires);
				if(cacheExpiresDate < rightNow || breakTest){
					// if expired, remove that item from the array 
					//console.log(`we think the cache should expire: ${arrayCacheDetails[i].expires}`);
					arrayCacheDetails.splice(i,1);
				} else {
					//console.log(`we think the cache should NOT expire: ${arrayCacheDetails[i].expires}`);
					// the cache is not expired, so find it in our array and load the details up
					// now pull the navCode and see if it maches one we already have in our array 
					for (let j = 0; j < (arrayCache.length); j++){
						if(arrayCacheDetails[i].navCode == arrayCache[j].cacheCode) {
							// update our stored cache array with these full details
							//===============================================
							// note: this code below should match what is in the LoadCacheDetails function
							//===============================================================
							// now parse the returned JSON out and do stuff with it
							var CacheID = j;
							var cacheDetails = JSON.parse(arrayCacheDetails[i].cacheDetails);
							var imageCount = cacheDetails.images.length;
							var logCount = cacheDetails.geocacheLogs.length;
							//var logImageCount
								
							var lastVisitedRaw = cacheDetails.lastVisitedDate;	
							if(lastVisitedRaw !== null) {
								var lastVisited = lastVisitedRaw.slice(0,10);		
							} else {
								var lastVisited = "never";
							}
						
							
							//update the cache array entry with the rest of the live details 
							arrayCache[CacheID].cacheName = cacheDetails.name;
							arrayCache[CacheID].cacheDescription = cacheDetails.longDescription;
							//arrayCache[CacheID].cacheHiddenDate = Placed;
							//arrayCache[CacheID].cacheDifficulty = Difficulty;
							//arrayCache[CacheID].cacheTerrain = Terrain;
							//arrayCache[CacheID].cacheSize = ContainerSize;
							arrayCache[CacheID].cacheHint = cacheDetails.hints;
							arrayCache[CacheID].cacheLogs = cacheDetails.geocacheLogs;
							arrayCache[CacheID].cacheFullyLoaded = true;	
							arrayCache[CacheID].cacheTrackableCount = cacheDetails.trackableCount;
							arrayCache[CacheID].cacheStatus = cacheDetails.status;
							arrayCache[CacheID].cacheLastVisited = lastVisited;
							arrayCache[CacheID].cacheShortDescription = cacheDetails.shortDescription;
							arrayCache[CacheID].cacheAttributes = cacheDetails.attributes;
							//arrayCache[CacheID].cacheFindCount = cacheDetails.findCount;
							arrayCache[CacheID].cacheUserData = cacheDetails.userData;		
							arrayCache[CacheID].cacheImages = cacheDetails.images;					
							
							// and now update the cache list to show that cache is fully loaded
							updateCacheListWithLoaded(CacheID,false);
							
							currentCacheID = CacheID;						
						};
					};					
				};

				
			};
			// once we're done processing the array, we need to push it back to localstorage 
			// so that we commit any removed / expired cacheShortDescription
			localStorage.setItem("arrayCacheDetails", JSON.stringify(arrayCacheDetails));			
		};

		// second, pull the current list of stored cache images
		var arrayCacheImageDetailsStr = localStorage.getItem("arrayCacheImageDetails");

		if(arrayCacheImageDetailsStr !== null) {
			arrayCacheImageDetails = JSON.parse(localStorage.getItem("arrayCacheImageDetails"));
			// now parse through these and see if any match what we have already
			
			var rightNowMilliseconds = Date.now();
			
			var rightNow = new Date(rightNowMilliseconds);
			var rightNowLocal = rightNow.toLocaleString();	
			
			for (let i = 0; i < (arrayCacheImageDetails.length); i++) {
				// very first thing we need to do before we even check
				// is see if the full details we've loaded have expired 
				var breakTest = false;
				//console.log(`expires:${arrayCacheImageDetails[i].expires} ?<? rightNowLocal:${rightNowLocal}`);
				if(arrayCacheImageDetails[i].expires < rightNowLocal || breakTest){
					// if expired, remove that item from the array 
					//console.log(`we think the cache should expire: ${arrayCacheImageDetails[i].expires}`);
					arrayCacheImageDetails.splice(i,1);
				} else {
					//console.log(`we think the cache should NOT expire: ${arrayCacheImageDetails[i].expires}`);
					// the cache is not expired, so find it in our array and load the details up
					// now pull the navCode and see if it maches one we already have in our array 
					for (let j = 0; j < (arrayCache.length); j++){
						if(arrayCacheImageDetails[i].navCode == arrayCache[j].cacheCode) {
							// update our stored cache array with these full details
							//===============================================
							// note: this code below should match what is in the LoadCacheDetails function
							//===============================================================
							// now parse the returned JSON out and do stuff with it
							var CacheID = j;
							var cacheDetails = JSON.parse(arrayCacheImageDetails[i].cacheImageDetails);
							var imageCount = cacheDetails.length;
						
							arrayCache[CacheID].cacheImages = cacheDetails;								
						};
					};					
				};

				
			};
			// once we're done processing the array, we need to push it back to localstorage 
			// so that we commit any removed / expired cacheShortDescription
			localStorage.setItem("arrayCacheImageDetails", JSON.stringify(arrayCacheImageDetails));			
		};


		// turn off the loading spinner
		loadingOverlay(false);

		}	
		
		
	}
};	

function loadWaypoints() {
	
	// One More for "WAYPOINTS"		
	// how many waypoints do we have in storage?
	
	
	var waypointCount = Number(localStorage.getItem('waypointCount'));
	//console.log(`number of Waypoints: ${waypointCount}`);
	for (let x = 0; x < waypointCount; x++) {				
		//console.log(`parsing waypoints, x=${x}`);
		var tempX = x;
		var cacheListLoc = x;
		storedCacheName = "storedWaypointDetails_WP" + tempX;
		var arrayWaypointID = x;
		storedCacheDetails = localStorage.getItem(storedCacheName);
		//console.log(`Stored waypoint ${x}, ${storedCacheName} is ${storedCacheDetails}`);
		if(storedCacheDetails !== null) {
			var individualCacheDetails = storedCacheDetails.split("< |v| >");
			arrayWaypointObject = {
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
			};
			arrayWaypoint[cacheListLoc] = arrayWaypointObject;
			
			//================
			// find our current distance from this Waypoint
			//

			var strTripDistance;
			
			if (arrayWaypointObject.cacheLat !== 0 && arrayWaypointObject.cacheLng !== 0) {
				var tripDistance = findDistance(my_current_lat,my_current_lng,arrayWaypointObject.cacheLat,arrayWaypointObject.cacheLng);

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
			
			//and we can't forget to update the list of caches with these waypoints as well :) 
			
			var listContainer = document.getElementById('waypointList');	
			if(x==0) {listContainer.innerHTML = "";};
			var entry = document.createElement("div");	
				entry.className = 'navItem cacheFullyLoaded';	
				entry.name='CacheList_WP';	
				entry.tabIndex = cacheListLoc*10;	
			var BadgeContent = document.createElement("span");				
				BadgeContent.innerHTML = "<img class='cache-type-img' width='48' height='48' src='/assets/icons/icons8-waypoint-map-48.png'></img>";													
				entry.appendChild(BadgeContent);	
			var headline = document.createElement("span");	
				headline.innerHTML = "<b>WayPoint #" + (cacheListLoc) + "</b><br>" + strTripDistance;	
				entry.appendChild(headline);						
			entry.setAttribute('data-function', 'NavToWaypointDetails');	
			// need to create a new ID for this new waypoint - will use "waypoint" + the current location in the cache array
			var waypointArrayID = "WAYPOINT" + arrayWaypointID;
			entry.setAttribute('NavCode',waypointArrayID);						
			listContainer.appendChild(entry);							
		}
	}	
	
}

function ShowAllCachesOnMap(ShowCaches) {

	//console.log(`in showallcaches, showCaches: ${ShowCaches}`);
	var CacheNumber = arrayCache.length;
	var WaypointNumber = arrayWaypoint.length;
	
	//console.log(`num caches in array: ${CacheNumber}`);
	
	cacheIconDisplay = document.getElementById("cacheIconDisplay");

	
	
	
	if(ShowCaches=="yes-noName"){
		//show waypoints first
		
		for (let i = 0; i < WaypointNumber; i++) {
			if(arrayWaypoint[i].cacheType == "WAYPOINT") { // Waypoint
				arrayWaypointMarker[i] = L.marker([arrayWaypoint[i].cacheLat,arrayWaypoint[i].cacheLng], {icon: Waypoint_cache}).addTo(map);	
			}
		}
		
		//now show actual caches
		for (let i = 0; i < CacheNumber; i++) {
			if(arrayCache[i].cacheOwner == myUserAlias) { // i own this cache
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Owned_cache}).addTo(map);			
			} else if(arrayCache[i].cacheFound == "yes") { // i've found this cache
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Found_cache}).addTo(map);
			} else if(arrayCache[i].cacheType == 2) { // Traditional
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Traditional_cache}).addTo(map);
			} else if (arrayCache[i].cacheType == 3) { // Multi-Cache
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Multi_cache}).addTo(map);		
			} else if (arrayCache[i].cacheType == 4) { // Virtual
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Virtual_cache}).addTo(map);		
			} else if (arrayCache[i].cacheType == 5) { // Letterbox Hybrid
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Letterbox_cache}).addTo(map);	
			} else if (arrayCache[i].cacheType == 6) { // Event
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Event_cache}).addTo(map);					
			} else if (arrayCache[i].cacheType == 8) { // Mystery
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Mystery_cache}).addTo(map);		
			} else if (arrayCache[i].cacheType == 9) { // Project A.P.E.
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: ProjectAPE_cache}).addTo(map);	
			} else if (arrayCache[i].cacheType == 11) { // Webcam
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Webcam_cache}).addTo(map);		
			} else if (arrayCache[i].cacheType == 12) { // Locationless (Reverse) Cache
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Locationless_cache}).addTo(map);		
			} else if (arrayCache[i].cacheType == 8) { // Cache in Trash Out
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: CITO_cache}).addTo(map);					
			} else if (arrayCache[i].cacheType == 137) { // Earth
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Earth_cache}).addTo(map);	
			} else if (arrayCache[i].cacheType == 453) { // Mega-Event
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: MegaEvent_cache}).addTo(map);	
			} else if (arrayCache[i].cacheType == 1304) { // Wherigo
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Wherigo_cache}).addTo(map);	
			} else if (arrayCache[i].cacheType == 3653) { // Community Celebration Event
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: CommunityCelebration_cache}).addTo(map);		
			} else if (arrayCache[i].cacheType == 3773) { // Geocaching HQ
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: GeocachingHQ_cache}).addTo(map);		
			} else if (arrayCache[i].cacheType == 3774) { // Geocaching HQ Celebration
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: GeocachingHQCelebration_cache}).addTo(map);	
			} else if (arrayCache[i].cacheType == 4738) { // Geocaching HQ Block Party
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: GeocachingHQBlockParty_cache}).addTo(map);	
			} else if (arrayCache[i].cacheType == 7005) { // Giga-Event
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: GigaEvent_cache}).addTo(map);					
			} else if (arrayCache[i].cacheType == "WAYPOINT") { // Waypoint
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Waypoint_cache}).addTo(map);	
				
			} else {
				arrayCacheMarker[i] = L.marker([arrayCache[i].cacheLat,arrayCache[i].cacheLng], {icon: Traditional_cache}).addTo(map);
			}
		}
		cacheIconDisplay.innerHTML = "Show names on mapped cache icons";			
	} else if (ShowCaches=="yes-yesName") {
		//waypoints first
		for (let i = 0; i < WaypointNumber; i++) {
			arrayWaypointMarker[i].bindTooltip(arrayWaypoint[i].cacheName).openTooltip();
		}
		//followed by actual caches
		for (let i = 0; i < CacheNumber; i++) {
			arrayCacheMarker[i].bindTooltip(arrayCache[i].cacheName).openTooltip();
		}
		cacheIconDisplay.innerHTML = "Hide all mapped cache icons";		
	} else {
		// hide all the caches on the map
		// waypoints first
		for (let i = 0; i < WaypointNumber; i++) {
			arrayWaypointMarker[i].remove();
		}
		// followed by actual caches
		for (let i = 0; i < CacheNumber; i++) {
			arrayCacheMarker[i].remove();
		}
		cacheIconDisplay.innerHTML = "Show all cache icons on map";			
	}
	haveAllMarkersBeenPlaced = true;

}

function reloadCacheDetails(CacheCode) {
	// find out cache in the array
	// see if it's fully loaded yet or not
		var CacheID = -1;
		var cacheFullyLoaded = false;
		for (let i = 0; i < arrayCache.length; i++) {
		  // search for cache in array
		  if (CacheCode == arrayCache[i].cacheCode) {
			CacheID = i;
			cacheFullyLoaded = arrayCache[i].cacheFullyLoaded;
		  }
		}		
	
	// then load them back up
	LoadCacheDetails(CacheCode,cacheFullyLoaded,true);
	
}

function LoadCacheDetails(CacheCode,loadFullDetails,isRefresh) {
	// decide if we are loading a cache or a waypoint
	var isWaypoint = CacheCode.startsWith("WAYPOINT");
	
	//console.log(`isWaypoint? ${isWaypoint}`);
	
	if (isWaypoint == false) { //this is a full cache
		// turn on the loading spinner
		loadingOverlay(true);
		hideHint();
		currentCacheFullLoaded = false;
		
		// the loadFullDetails flag is used for basic members to spend one of their 3 full detail cache loads
		//   per day on loading this cache
		//  premium users will always load full details by default, regardless of what this flag is set as
		//console.log(`loading individual cache details for ${CacheCode}`);
		// first thing, see if we have this cache loaded in our array - find the ID in the array
			var CacheID = -1;
			var cacheFullyLoaded = false;
			for (let i = 0; i < arrayCache.length; i++) {
			  // search for cache in array
			  if (CacheCode == arrayCache[i].cacheCode) {
				CacheID = i;
				cacheFullyLoaded = arrayCache[i].cacheFullyLoaded;
			  }
			}	
			
			if (isRefresh) {cacheFullyLoaded = false;};

		// force to always load full details if we're not a basic user
		//console.log(`userMembershipLevelId = ${userMembershipLevelId}`);
		if(userMembershipLevelId != 1) {
			// temp override loadFullDetails for the purposes of testing w/ a premium account
			// uncomment below later on when done testing :) 
			loadFullDetails = true;
			//console.log('trying to set loadFullDetails to true');
		}
			
			// if we have not loaded all cache details yet, go do that now, and write them to the array 
		if(cacheFullyLoaded == false) {
			if(loadFullDetails == true) {
				var values = "geocaches/" + CacheCode;
				values = values + "?lite=false";
				values = values + "&expand=geocachelogs:" + numLogsToLoad;
				values = values + ",geocachelog.images:" + numLogsToLoad;
				values = values + ",images:" + numLogsToLoad;
				values = values + "&fields=referenceCode,name,difficulty,terrain,trackableCount,placedDate,geocacheType,geocacheSize,status,postedCoordinates,lastVisitedDate,ownerAlias,isPremiumOnly,shortDescription,longDescription,hints,attributes,userData";

				var xhr = new XMLHttpRequest({ mozSystem: true });
				var geomethod = "GET";	
				var geourl = app.rootAPIurl + values;
				
				var token = localStorage.getItem("access_token");
				
				if (token !== null) {
					//console.log('we have a token');
					xhr.open(geomethod, geourl, true);
					
					xhr.setRequestHeader('Authorization', 'bearer ' + token);		

					xhr.onreadystatechange = function () {
					  var geoloadstate = xhr.readyState;
					  //console.log(`Load state: ${geoloadstate}`);
					  if (geoloadstate == 1) {
						  //console.log('request opened');
					  } else if (geoloadstate == 2) {
						//console.log('headers received'); 
								
					  } else if (geoloadstate == 3) {
						 // console.log('loading data');
							  
					  } else if (geoloadstate == 4) {
						var geostatus = xhr.status;
							//console.log(`status: ${geostatus}`);
						if (geostatus >= 200 && geostatus < 400) {
						  var siteText = xhr.response;				
							//console.log(`response: ${siteText}`);

							//===========================================================
							// first drop the cache details response into our array of loaded cache details
							// and update our localstore with those details so we can pull them later
							
							// first pull the current list of stored caches
							var arrayCacheDetailsStr = localStorage.getItem("arrayCacheDetails");
							
							if(arrayCacheDetailsStr !== null) {
								arrayCacheDetails = JSON.parse(localStorage.getItem("arrayCacheDetails"));
								
							};
							
							var cacheExpires = localStorage.getItem("fullCallsReset");
							
							
							// then construct the newly loaded cache detail
							arrayCacheDetailsObject = {
								navCode: CacheCode,
								expires: cacheExpires,
								cacheDetails: siteText
							};
							
							// drop that new cache detail into the list of loaded caches, but only if not a refresh
							if (isRefresh !== true) {
								arrayCacheDetails[arrayCacheDetails.length] = arrayCacheDetailsObject;
							} else {
								// if this is a refresh, find that previously loaded cache and update it instead of adding a new array entry
								for (let i = 0; i < arrayCacheDetails.length; i++) {
								  // search for cache in array
								  if (CacheCode == arrayCacheDetails[i].navCode) {
									arrayCacheDetails[i] = arrayCacheDetailsObject;
								  }
								}									
							};
							
							// finally update our localstore of fully loaded caches 
							localStorage.setItem("arrayCacheDetails", JSON.stringify(arrayCacheDetails));							
							//===============================================================
							// now parse the returned JSON out and do stuff with it
							var cacheDetails = JSON.parse(siteText);
							var imageCount = cacheDetails.images.length;
							var logCount = cacheDetails.geocacheLogs.length;
							//var logImageCount
								

							var lastVisitedRaw = cacheDetails.lastVisitedDate;	
							if(lastVisitedRaw !== null){
								var lastVisited = lastVisitedRaw.slice(0,10);
							} else {
								var lastVisited = "never";
							}		
							
							
							
							//update the cache array entry with the rest of the live details 
							arrayCache[CacheID].cacheName = cacheDetails.name;
							arrayCache[CacheID].cacheDescription = cacheDetails.longDescription;
							//arrayCache[CacheID].cacheHiddenDate = Placed;
							//arrayCache[CacheID].cacheDifficulty = Difficulty;
							//arrayCache[CacheID].cacheTerrain = Terrain;
							//arrayCache[CacheID].cacheSize = ContainerSize;
							arrayCache[CacheID].cacheHint = cacheDetails.hints;
							arrayCache[CacheID].cacheLogs = cacheDetails.geocacheLogs;
							arrayCache[CacheID].cacheFullyLoaded = true;	
							arrayCache[CacheID].cacheTrackableCount = cacheDetails.trackableCount;
							arrayCache[CacheID].cacheStatus = cacheDetails.status;
							arrayCache[CacheID].cacheLastVisited = lastVisited;
							arrayCache[CacheID].cacheShortDescription = cacheDetails.shortDescription;
							arrayCache[CacheID].cacheAttributes = cacheDetails.attributes;
							//arrayCache[CacheID].cacheFindCount = cacheDetails.findCount;
							arrayCache[CacheID].cacheUserData = cacheDetails.userData;		
							//arrayCache[CacheID].cacheImages = cacheDetails.images;
							arrayCache[CacheID].cacheLogLoadCount = cacheDetails.geocacheLogs.length;
							arrayCache[CacheID].cacheIsPremium = cacheDetails.isPremiumOnly;
								
							// our array is now updated - go show the cache details
							//viewCacheLogs(CacheID);
							currentCacheFullLoaded = true;
							// update our stored user stats as a result of loading this cache.
							updateUserDetails();	

							//now load up images for this cache 
							loadCacheImages(CacheCode, CacheID);
							
							logAnalytics("Caches","ViewFullDetails",userMembershipLevelId);
							// now that we're done, push over to showing the cache details 
							//ShowCacheDetails(CacheID,false);
							
						}  else if (geostatus == 401) {
							// token has expired, refresh and tell caller to retry
							//console.log('refreshing token');
							refreshToken();
						}  else {
							// Oh no! There has been an error with the request!
							//console.log("some problem...");
							// turn off the loading spinner
							loadingOverlay(false);	
							// there was some issue loading full details, so pushing to the partial details screen.
							logAnalytics("Caches","ViewPartialDetails",userMembershipLevelId);				
							ShowCacheDetails(CacheID,true,false);	
							if(showConnectionError) {
								if (confirm("There was an issue connecting to geocaching.com... We will display  partial cache details. Select OK to stop showing this message.")) {
									showConnectionError = false;
								}
							}
						}
					  }; 
					};
					xhr.send();	
				} else {
					getToken();

				};	
			} else {
				//viewCacheLogs(CacheID);
				logAnalytics("Caches","ViewPartialDetails",userMembershipLevelId);				
				ShowCacheDetails(CacheID,true,false);			
			};
		} else {
			// we already have the cache fully loaded - go direct to showing it
			//viewCacheLogs(CacheID);
			logAnalytics("Caches","ViewFullDetails",userMembershipLevelId);				
			ShowCacheDetails(CacheID,false,false);
		}
	} else { // we're loading a waypoint
		// first convert the cacheCode to a cacheID
		var CacheID = -1;
		for (let i = 0; i < (arrayWaypoint.length); i++) {
		  // search for cache in array
		  //console.log(`i: ${i}, arrayWaypoint.length-1: ${arrayWaypoint.length - 1}`);
		  if (CacheCode == arrayWaypoint[i].cacheCode) {
			CacheID = i;
		  }
		}	
		
		//console.log(`CacheCode: ${CacheCode}, arrayWaypoint.length: ${arrayWaypoint.length}, waypoint CacheID: ${CacheID}`);
		logAnalytics("Caches","ViewWaypoint",userMembershipLevelId);			
		ShowCacheDetails(CacheID,false,true);		
	}
}

function loadCacheImages(CacheCode, CacheID) {
	var values = "geocaches/" + CacheCode + "/images";
	values = values + "?skip=0";
	values = values + "&take=" + numLogsToLoad;
	values = values + "&fields=ownerCode,url,thumbnailURL,largeURL,referenceCode,createdDate,capturedDate,description,guid";


	var xhr = new XMLHttpRequest({ mozSystem: true });
	var geomethod = "GET";	
	var geourl = app.rootAPIurl + values;
	
	var token = localStorage.getItem("access_token");
	
	if (token !== null) {
		xhr.open(geomethod, geourl, true);
		
		xhr.setRequestHeader('Authorization', 'bearer ' + token);		

		xhr.onreadystatechange = function () {
		  var geoloadstate = xhr.readyState;
		  //console.log(`Load state: ${geoloadstate}`);
		  if (geoloadstate == 1) {
			  //console.log('request opened');
		  } else if (geoloadstate == 2) {
			//console.log('headers received'); 
					
		  } else if (geoloadstate == 3) {
			 // console.log('loading data');
				  
		  } else if (geoloadstate == 4) {
			var geostatus = xhr.status;
				//console.log(`status: ${geostatus}`);
			if (geostatus >= 200 && geostatus < 400) {
			  var siteText = xhr.response;				
				//===========================================================
				// first drop the cache image details response into our array of loaded cache details
				// and update our localstore with those details so we can pull them later
				
				// first pull the current list of stored caches
				var arrayCacheImageDetailsStr = localStorage.getItem("arrayCacheImageDetails");
				
				if(arrayCacheImageDetailsStr !== null) {
					arrayCacheImageDetails = JSON.parse(localStorage.getItem("arrayCacheImageDetails"));
					
				};
				
				var cacheExpires = localStorage.getItem("fullCallsReset");
				
				
				// then construct the newly loaded cache detail
				arrayCacheImageDetailsObject = {
					navCode: CacheCode,
					expires: cacheExpires,
					cacheImageDetails: siteText
				};
				
				// drop that new cache detail into the list of loaded caches
				arrayCacheImageDetails[arrayCacheImageDetails.length] = arrayCacheImageDetailsObject;

				// finally update our localstore of fully loaded caches 
				localStorage.setItem("arrayCacheImageDetails", JSON.stringify(arrayCacheImageDetails));

				//===============================================================
				// now parse the returned JSON out and do stuff with it
				var cacheImageDetails = JSON.parse(siteText);
				var imageCount = cacheImageDetails.length;
					
				arrayCache[CacheID].cacheImages = cacheImageDetails;

				// now that we're done, push over to showing the cache details 
				ShowCacheDetails(CacheID,false,false);
				
			}  else if (geostatus == 401) {
				// token has expired, refresh and tell caller to retry
				//console.log('refreshing token');
				refreshToken();
			}  else {
			// Oh no! There has been an error with the request!
			//console.log("some problem...");
					// turn off the loading spinner
					loadingOverlay(false);	
					alert("There was an issue connecting to geocaching.com...");			
			}
		  }; 
		};
		xhr.send();		
	}
}

function loadAllCacheDetails(CacheID) {

	
}

function updateCacheListWithLoaded(CacheID,isWaypoint) {
	//console.log(`set view as loaded for ${CacheID}`);
	if (isWaypoint == false) {
		// this will change the background color of caches in the list that have been fully loaded
		// for easy reference when returning to the list
		// we'll use the navcode class which is the geocache code to find the item we want
		var cacheListEntry = document.getElementsByClassName("navItem");
		cacheListEntry[CacheID].classList.add("cacheFullyLoaded");
	} else {
		// no need to set a waypoint as loaded, as they are always loaded
	}
}

function ShowCacheDetails(CacheID,promptToLoadFullDetails,isWaypoint) {

	if(isWaypoint == false) {
		// load up what are previous and next caches in the array 
		// first see if we have loaded a different cache than we were previously looking at
		// if so, reset the current log we're looking at to the top of the list, and same with the 
		// image gallery selectiont
		if (CacheID !== currentCacheID) {
			CacheLogListID = 0;
			GalleryListID = 0;
		}
		currentCacheID = CacheID;
		
		// have we already fully loaded this cache up? we can skip prompting the basic user to download 
		// details if so.
		cacheFullyLoaded = arrayCache[CacheID].cacheFullyLoaded;	
		if(cacheFullyLoaded==true) {currentCacheFullLoaded=true};

		//console.log(`promptToLoadFullDetails: ${promptToLoadFullDetails}, cacheFullyLoaded=${cacheFullyLoaded}`);

		showView(3,false);	

		// turn off loading spinner
		loadingOverlay(false);	
		
		var myArrayLength = arrayCache.length;			
		if(CacheID==0) {
			prevCacheID = myArrayLength - 1;
			nextCacheID = CacheID + 1;
		} else if (i == (myArrayLength - 1)) {
			prevCacheID = CacheID - 1;
			nextCacheID = 0;
		} else {
			prevCacheID = CacheID - 1;
			nextCacheID = CacheID + 1;
		}			

		var divHeight = document.getElementById('CacheDescription').style.height;        
			
		var CompassCacheName = document.getElementById('cacheName');	
		var CacheHeader = document.getElementById('CacheHeaderDetail');		
		if (CacheID !== -1) {
			//show cache name on the big compass view	
			//CompassCacheName.innerHTML = "<b>" + arrayCache[CacheID].cacheName + "</b><br>" + arrayCache[CacheID].cacheCode;
					
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
			
								//cacheFindCount: geoCacheDetails[i].findCount, //22
								//cacheDNFCount: geoCacheDetails[i].dnfCount,
								

			currentCacheCode = arrayCache[CacheID].cacheCode;
			
			CacheHeader.innerHTML = '';	
				var BadgeContent = document.createElement("span");
				BadgeContent.innerHTML = arrayCache[CacheID].cacheBadge + "<b>" + arrayCache[CacheID].cacheName + "</b><br>" + arrayCache[CacheID].cacheCode;
				
				if(arrayCache[CacheID].cacheIsPremium == "true" || arrayCache[CacheID].cacheIsPremium == true) {
					BadgeContent.innerHTML = BadgeContent.innerHTML + "&nbsp&nbsp <span class='premium'><b>PREMIUM</b></span>";
				}
				
			CacheHeader.appendChild(BadgeContent);	
				
			var CacheLevels = document.getElementById('CacheDetails');
			CacheLevels.innerHTML = '';	
				var CacheLevelsDetail = document.createElement("span");
				CacheLevelsDetail.innerHTML = "Distance: " + strTripDistance + "<br>Owner: " + arrayCache[CacheID].cacheOwner +"<br>Hidden: " + arrayCache[CacheID].cacheHiddenDate + "<br>Last Visited: " + arrayCache[CacheID].cacheLastVisited + "<br>Difficulty: " + arrayCache[CacheID].cacheDifficulty + "<br>Terrain: " + arrayCache[CacheID].cacheTerrain + "<br>Size: " + arrayCache[CacheID].cacheSize + "<br>Favorites: " + arrayCache[CacheID].cacheFavoritePoints;
				if(arrayCache[CacheID].cacheTrackableCount > 0) {
					CacheLevelsDetail.innerHTML = CacheLevelsDetail.innerHTML + "<br>Trackables: " + arrayCache[CacheID].cacheTrackableCount;
				}
				CacheLevelsDetail.innerHTML = CacheLevelsDetail.innerHTML +"<br>&oplus; "+displayPosition(arrayCache[CacheID].cacheLat, arrayCache[CacheID].cacheLng,app.gpsCoordRepresentation);
			if(arrayCache[CacheID].cacheType == "WAYPOINT"){
				CacheLevelsDetail.innerHTML = "Distance: " + strTripDistance + "<br>" + arrayCache[CacheID].cacheHiddenDate;
			}
			CacheLevels.appendChild(CacheLevelsDetail);	
					
			if (TempCacheLat !== 0 && TempCacheLng !== 0) {			
				navGeoCode = arrayCache[CacheID].cacheCode;
				cacheGUIDvalue = arrayCache[CacheID].cacheGUID;
			} else {
				navGeoCode = 0;
				cacheGUIDvalue = null;
			}				
					
			// only show the cache description, logs, and image gallery if we're allowed to
			// otherwise prompt the user if they wish to load these details
			//console.log('line 2740');
			if(promptToLoadFullDetails !== true || cacheFullyLoaded == true) {		
				// first turn on visibility of the tabs and details/logs/images tabs
				var showCacheFullDetails = document.getElementById('CacheFullDetails');
				var hidePromptForLoad = document.getElementById('PromptForFullDetails');
				var cacheTabList = document.getElementById('cacheTabList');				
				
				showCacheFullDetails.style.display = "block";
				hidePromptForLoad.style.display = "none";
				cacheTabList.style.display="block";
				
				var CacheDescStr = document.getElementById('CacheDescription');
				CacheDescStr.innerHTML = '';	
					var CacheDescription = document.createElement("span");
					CacheDescription.innerHTML = arrayCache[CacheID].cacheDescription;
				if(arrayCache[CacheID].cacheType == "WAYPOINT"){
					CacheDescription.innerHTML = arrayCache[CacheID].cacheDescription;;
				}
				CacheDescStr.appendChild(CacheDescription);

				var cacheHintHiddenDiv = document.getElementById('CacheHint');
				var cacheHintShownDiv =  document.getElementById('CacheHintShown');
				var hintStr = arrayCache[CacheID].cacheHint;
				var hintLength = hintStr.length;
				if (hintLength > 0) {
					cacheHintHiddenDiv.innerHTML = "This cache has a hint. If you want to see it, select 'Options' and then 'Decrypt Hint'.";
				} else {
					cacheHintHiddenDiv.innerHTML = "This cache does not have a hint.";
				}
				cacheHintShownDiv.innerHTML = arrayCache[CacheID].cacheHint;

				// reset cache option menu back to default
				var cacheMenuOptions = document.getElementById('viewCacheOptions');
				
				var newCacheOptions = "<b>Hint:</b> Press 1 for prev cache. Press 3 for next cache.";
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='0' data-function='showHint'>";
				newCacheOptions = newCacheOptions + "<div id='showCacheHint'>Decrypt Hint</div></button>";	
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='10' data-function='reloadCacheDetails'>";
				newCacheOptions = newCacheOptions + "<div id='showCacheHint'>Refresh Cache Details</div></button>";					
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='20' data-function='takePhoto'>";
				
				newCacheOptions = newCacheOptions + "<div id='takePhotoText'>2: Take a Photo</div></button>";				
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='30' data-function='LogCache'>";
				newCacheOptions = newCacheOptions + "<div id='logCacheText'>0: Log Cache</div></button>";	
				
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='40' data-function='viewCacheList'><div id='viewCacheText'>4: View Cache List</div></button>";
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='50' data-function='viewMap'>6: View Map</button>";
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='60' data-function='viewCompass'>9: View Compass</button>";		
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='70' data-href='" + app.rootSiteURL + "/email/?u=" + arrayCache[CacheID].cacheOwner + "'>Send message to cache owner</button>";				
				
				// add the option to view trackables if there are any for this cache
				if (arrayCache[CacheID].cacheTrackableCount > 0) {newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='80' data-function='viewCacheInventory'>View Trackable Inventory</button>";	};
				
				cacheMenuOptions.innerHTML = newCacheOptions;

				// set the background color of the fully loaded cache in the cache listing page
				updateCacheListWithLoaded(CacheID,false)

				initView();
			} else {
				// we are a non-premium user and need to be prompted to decide if we want to load the full details
				// -or- we are a premium user who has not pre-loaded a cache and now has no
				// internet connectivity, so we are only showing a stub of the cache 
				// for this cache - construct that message now
				var showCacheFullDetails = document.getElementById('CacheFullDetails');
				var hidePromptForLoad = document.getElementById('PromptForFullDetails');
				var cacheTabList = document.getElementById('cacheTabList');			
				
				
				showCacheFullDetails.style.display = "none";
				hidePromptForLoad.style.display = "block";	
				cacheTabList.style.display="none";
				
				var remainingFullCaches = localStorage.getItem('fullCallsRemaining');
				
				var promptToLoad = document.getElementById('promptToLoadFullDetails');				
				
				if(userMembershipLevelId < 2) {

					if (remainingFullCaches == 0) {
						// the user has no more available full cache loads for the day
						// message to show to basic users when they look to download the full details of a particular cache
						
						var fullCallsResetLocal = localStorage.getItem('fullCallsReset');				

						basicUserMessageForCacheDownload = "As a basic Geocaching member, you are permitted to download full details of 3 geocaches per 24 hour period.  You currently have <b>" + localStorage.getItem('fullCallsRemaining') + " caches remaining until " + fullCallsResetLocal + "</b> when your basic member limit will be reset";					
				
						basicUserMessageForCacheDownload = basicUserMessageForCacheDownload + 
						"<br><br>Upgrade to Geocaching Premium today to download the full details for up to 6000 caches per day, view all cache types in your area, and access many more benefits. Visit Geocaching.com to upgrade."


						promptToLoad.innerHTML = basicUserMessageForCacheDownload;
						
						// we also need to adjust the cache options menu to hide non-available options
						var cacheMenuOptions = document.getElementById('viewCacheOptions');
					
						var newCacheOptions = "<b>Hint:</b> Press 1 for prev cache. Press 3 for next cache.";
						newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='0' data-function='reloadCacheDetails'>";
						newCacheOptions = newCacheOptions + "<div id='showCacheHint'>Refresh Cache Details</div></button>";								
						newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='10' data-function='takePhoto'>";
						newCacheOptions = newCacheOptions + "<div id='takePhotoText'>2: Take a Photo</div></button>";				
						newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='20' data-function='LogCache'>";
						newCacheOptions = newCacheOptions + "<div id='logCacheText'>0: Log Cache</div></button>";
						
					newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='30' data-function='viewCacheList'><div id='viewCacheText'>4: View Cache List</div></button>";
					newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='40' data-function='viewMap'>6: View Map</button>";
					newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='50' data-function='viewCompass'>9: View Compass</button>";					
								
						cacheMenuOptions.innerHTML = newCacheOptions;
						
					} else {
						// message to show to basic users when they look to download the full details of a particular cache
						
						
						var fullCallsResetLocal = localStorage.getItem('fullCallsReset');				

						basicUserMessageForCacheDownload = "As a basic Geocaching member, you are permitted to download full details of 3 geocaches per 24 hour period.  You currently have <b>" + localStorage.getItem('fullCallsRemaining') + " caches remaining";

						if(fullCallsResetLocal != "Invalid Date") {
							basicUserMessageForCacheDownload = basicUserMessageForCacheDownload + " until " + fullCallsResetLocal + "</b> when your basic member limit will be reset";	
						};
						
						promptToLoad.innerHTML = basicUserMessageForCacheDownload;
						
						// we also need to adjust the cache options menu to hide non-available options
						var cacheMenuOptions = document.getElementById('viewCacheOptions');
					
						var newCacheOptions = "<b>Hint:</b> Press 1 for prev cache. Press 3 for next cache.";
						newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='0' data-function='reloadCacheDetails'>";
						newCacheOptions = newCacheOptions + "<div id='showCacheHint'>Refresh Cache Details</div></button>";								
						newCacheOptions =newCacheOptions +  "<button class='navItem' tabIndex='10' data-function='loadFullCacheDetails'>";
						newCacheOptions = newCacheOptions + "<div id='loadFullCacheDetailsText'>Load full cache details</div></button>";
						
						newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='20' data-function='takePhoto'>";
						newCacheOptions = newCacheOptions + "<div id='takePhotoText'>2: Take a Photo</div></button>";				
						newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='30' data-function='LogCache'>";
						newCacheOptions = newCacheOptions + "<div id='logCacheText'>0: Log Cache</div></button>";				

					newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='40' data-function='viewCacheList'><div id='viewCacheText'>4: View Cache List</div></button>";
					newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='50' data-function='viewMap'>6: View Map</button>";
					newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='60' data-function='viewCompass'>9: View Compass</button>";	
					newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='70' data-href='" + app.rootSiteURL + "/email/?u=" + arrayCache[CacheID].cacheOwner + "'>Send message to cache owner</button>";				
					
					// add the option to view trackables if there are any for this cache
					if (arrayCache[CacheID].cacheTrackableCount > 0) {newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='80' data-function='viewCacheInventory'>View Trackable Inventory</button>";	};			
			
			
						cacheMenuOptions.innerHTML = newCacheOptions;
					}
				} else { 
					// this is the special case where a prem user has not loaded the full
					// cache details and has no internet connectivity
					// in this case we use the stub view of the cache, which is similar
					// to the basic user, but we don't show the message about
					// only being able to load 3 full caches a day 
					var fullCallsResetLocal = localStorage.getItem('fullCallsReset');				

					basicUserMessageForCacheDownload = "We are only showing a stub of this cache's details as it appears you do not currently have internet connectivity.";								

					promptToLoad.innerHTML = basicUserMessageForCacheDownload;
					
					// we also need to adjust the cache options menu to hide non-available options
					var cacheMenuOptions = document.getElementById('viewCacheOptions');
				
					var newCacheOptions = "<b>Hint:</b> Press 1 for prev cache. Press 3 for next cache.";
					newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='0' data-function='takePhoto'>";
					newCacheOptions = newCacheOptions + "<div id='takePhotoText'>2: Take a Photo</div></button>";				
					newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='10' data-function='LogCache'>";
					newCacheOptions = newCacheOptions + "<div id='logCacheText'>0: Log Cache</div></button>";
					
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='20' data-function='viewCacheList'><div id='viewCacheText'>4: View Cache List</div></button>";
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='30' data-function='viewMap'>6: View Map</button>";
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='40' data-function='viewCompass'>9: View Compass</button>";					
							
					cacheMenuOptions.innerHTML = newCacheOptions;					
					
				}
				initView();	
			}
		} else {
			// did not find the cache
			CompassCacheName.innerHTML = "<b>Could not find the cache from the list of retrieved caches...</b>";
			CacheHeader.innerHTML = "<b>Could not find the cache from the list of retrieved caches...</b>";
			initView();	
		}
	} else { // display the waypoint 
		currentWaypointID = CacheID;
	
		showView(21,false);
	
		var divHeight = document.getElementById('WaypointDescription').style.height;        
			
		var CompassCacheName = document.getElementById('cacheName');	
		var CacheHeader = document.getElementById('WaypointHeaderDetail');		
		if (CacheID !== -1) {
			//================
			// find our current distance from this Waypoint
			//
			var TempCacheLat = arrayWaypoint[CacheID].cacheLat;
			var TempCacheLng = arrayWaypoint[CacheID].cacheLng;	
			var strTripDistance;
			
			if (TempCacheLat !== 0 && TempCacheLng !== 0) {
				var tripDistance = findDistance(my_current_lat,my_current_lng,TempCacheLat,TempCacheLng);

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
				
				//console.log(`waypoint distance: ${strTripDistance}`);
			//================================================================================
			//
			// Display Waypoint Details
								
			currentCacheCode = arrayWaypoint[CacheID].cacheCode;
			
			CacheHeader.innerHTML = '';	
				var BadgeContent = document.createElement("span");
				BadgeContent.innerHTML = arrayWaypoint[CacheID].cacheBadge + "<b>" + arrayWaypoint[CacheID].cacheName + "</b><br>";
				
				
			CacheHeader.appendChild(BadgeContent);	
				
			var CacheLevels = document.getElementById('WaypointDetails');
			CacheLevels.innerHTML = '';	
				var CacheLevelsDetail = document.createElement("span");
				CacheLevelsDetail.innerHTML = "Distance: " + strTripDistance + "<br>Owner: " + arrayCache[CacheID].cacheOwner +"<br>Hidden: " + arrayCache[CacheID].cacheHiddenDate + "<br>Last Visited: " + arrayCache[CacheID].cacheLastVisited + "<br>Difficulty: " + arrayCache[CacheID].cacheDifficulty + "<br>Terrain: " + arrayCache[CacheID].cacheTerrain + "<br>Size: " + arrayCache[CacheID].cacheSize + "<br>Favorites: " + arrayCache[CacheID].cacheFavoritePoints;
				if(arrayCache[CacheID].cacheTrackableCount > 0) {
					CacheLevelsDetail.innerHTML = CacheLevelsDetail.innerHTML + "<br>Trackables: " + arrayCache[CacheID].cacheTrackableCount;
				}
				CacheLevelsDetail.innerHTML = CacheLevelsDetail.innerHTML +"<br>&oplus; "+displayPosition(arrayCache[CacheID].cacheLat, arrayCache[CacheID].cacheLng,app.gpsCoordRepresentation);
			if(arrayWaypoint[CacheID].cacheType == "WAYPOINT"){
				CacheLevelsDetail.innerHTML = "Distance: " + strTripDistance + "<br>" + arrayWaypoint[CacheID].cacheHiddenDate;
			}
			CacheLevels.appendChild(CacheLevelsDetail);	
					
			if (TempCacheLat !== 0 && TempCacheLng !== 0) {			
				navGeoCode = arrayWaypoint[CacheID].cacheCode;
				cacheGUIDvalue = arrayWaypoint[CacheID].cacheGUID;
			} else {
				navGeoCode = 0;
				cacheGUIDvalue = null;
			}				
					
			cacheFullyLoaded = true; //waypoints are always fully loaded :) 
			// only show the cache description, logs, and image gallery if we're allowed to
			// otherwise prompt the user if they wish to load these details
			//console.log('line 2740');
			if(promptToLoadFullDetails !== true || cacheFullyLoaded == true) {		
						
				var CacheDescStr = document.getElementById('WaypointDescription');
				CacheDescStr.innerHTML = '';	
					var CacheDescription = document.createElement("span");
					CacheDescription.innerHTML = arrayWaypoint[CacheID].cacheDescription;
				if(arrayWaypoint[CacheID].cacheType == "WAYPOINT"){
					CacheDescription.innerHTML = arrayWaypoint[CacheID].cacheDescription;;
				}
				CacheDescStr.appendChild(CacheDescription);



				// reset cache option menu back to default
				var cacheMenuOptions = document.getElementById('viewCacheOptions');
				
				var newCacheOptions = "<b>Hint:</b> Press 1 for prev cache. Press 3 for next cache.";

				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='0' data-function='takePhoto'>";
				
				newCacheOptions = newCacheOptions + "<div id='takePhotoText'>2: Take a Photo</div></button>";				
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='10' data-function='LogCache'>";
				newCacheOptions = newCacheOptions + "<div id='logCacheText'>0: Log Cache</div></button>";	
				
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='20' data-function='viewCacheList'><div id='viewCacheText'>4: View Cache List</div></button>";
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='30' data-function='viewMap'>6: View Map</button>";
				newCacheOptions = newCacheOptions + "<button class='navItem' tabIndex='40' data-function='viewCompass'>9: View Compass</button>";		
				
				
				cacheMenuOptions.innerHTML = newCacheOptions;

				// set the background color of the fully loaded cache in the cache listing page
				updateCacheListWithLoaded(CacheID,true);

				initView();	
			}
		}
	}
}

function showHint() {
	var hintPrompt = document.getElementById('CacheHint');
	var hintDisplay = document.getElementById('CacheHintShown');
	
	hintDisplay.style.display = "block";
	hintPrompt.style.display = "none";	
}

function hideHint() {
	var hintPrompt = document.getElementById('CacheHint');
	var hintDisplay = document.getElementById('CacheHintShown');
	
	hintDisplay.style.display = "none";
	hintPrompt.style.display = "block";	
}

function viewCacheLogs(CacheID) {

	windowOpen="viewCacheLogs";
	showView(16,true);	

	var findCount = arrayCache[CacheID].cacheFindCount;
	var dnfCount = arrayCache[CacheID].cacheDNFCount;
	
	if (findCount == "undefined") {findCount = 0};
	if (dnfCount == "undefined") {dnfCount = 0};	
	
	var CacheHeader = document.getElementById('CacheLogHeaderDetail');	
	var CacheLogCounts = document.getElementById('CacheLogCounts');
	CacheHeader.innerHTML = '';	
		var BadgeContent = document.createElement("span");
		BadgeContent.innerHTML = arrayCache[CacheID].cacheBadge + "<b>" + arrayCache[CacheID].cacheName + "</b><br>" + arrayCache[CacheID].cacheCode;
		
		if(arrayCache[CacheID].cacheIsPremium == "true" || arrayCache[CacheID].cacheIsPremium == true) {
			BadgeContent.innerHTML = BadgeContent.innerHTML + "&nbsp&nbsp <span class='premium'><b>PREMIUM</b></span>";
		}		
		
	CacheHeader.appendChild(BadgeContent);	
	
	CacheLogCounts.innerHTML = "Finds: <img src='/images/icons/2.png'> " + findCount + "&nbsp;&nbsp;&nbsp;<img src='/images/icons/3.png'> " + dnfCount;
	
	//================================================================================
	//
	// Display list of logs
	//
	//
	var listContainer = document.getElementById('CacheLogsView');
	listContainer.innerHTML = '';
	var logCount = arrayCache[CacheID].cacheLogs.length;		
	
	
	var logListID = 0;

	//
	// cycle through all the returned logs and 
	//	load them into the cache listing page for display / selection by the user 
	//
	for (let i = 0; i < logCount; i++) {

		// parse out the returned response 
		
		var logText = arrayCache[CacheID].cacheLogs[i].text;
		var logFavorite = arrayCache[CacheID].cacheLogs[i].usedFavoritePoint;
		var logOwnerName = arrayCache[CacheID].cacheLogs[i].owner.username;
		var logDateRaw = arrayCache[CacheID].cacheLogs[i].loggedDate;
		var logDate = logDateRaw.slice(0,10);		
		var logTypeImg = "<img src='" + arrayCache[CacheID].cacheLogs[i].geocacheLogType.imageUrl + "'>";
		var logType = arrayCache[CacheID].cacheLogs[i].geocacheLogType.name;



							
		// now work on loading those details into the cache details page 
		
		var entry = document.createElement("div");
		entry.className = 'navItem';
		var myIndex = i*10;				
		entry.tabIndex = myIndex;

		var headline = document.createElement("span");
		headline.innerHTML = "<b>" + logTypeImg + " " + logType + " " + logDate + "<br>" + logOwnerName + "</b><br><br>" + logText;
		
		// take that structured HTML and drop it into the page:
		entry.appendChild(headline);	
		
		listContainer.appendChild(entry);
	}
	if (logCount > 0) {
		// disabling loading of extra logs for now in favor of just increasing the number of logs we _do_ load at first - up to 50?
		
		//show option to load more logs
		//var entry = document.createElement("div");
		//entry.className = 'navItem';
		//var myIndex = logCount*10;				
		//entry.tabIndex = myIndex;
		//entry.setAttribute('data-function', 'loadMoreLogs');
		//entry.setAttribute('CacheCode',arrayCache[CacheID].cacheCode);
		//entry.setAttribute('CurrentLogsLoaded',logCount);		

		//var headline = document.createElement("span");
		//headline.innerHTML = "<center><b>Load more logs...</b></center>";
		
		// take that structured HTML and drop it into the page:
		//entry.appendChild(headline);	
		
		//listContainer.appendChild(entry);		
	}
	initView();	
};

function viewTrackableInventory(currentCacheID,listType,loadLocation) {
		// if loadLocation = cacheLog, then we're pushing the inventory list into the cache log view, otherwise we are showing in the generic
		// inventory page


		if (listType == null || listType == 1) {
			listType = "inventory"; //if no list type is passed in, assume we want an inventory returned
		} else if (listType == 2) {
			listType = "collection";
		} else if (listType == 3) {
			listType = "owned";
		};
		
		myTrackableView = listType;
		
		// possible list types: 1 = Inventory, 2 = Collection, 3 = owned (all the trackables i own, regardless of where they are)

	
		if (currentCacheID == null) { // pull trackable inventory of the logged in user
			logAnalytics("Caches","LoadInventory",userMembershipLevelId);		
		
			var values = "trackables?";
			values = values + "skip=0"; // start at the beginning of the list of trackables?  yes = 0
			values = values + "&take=40"; // how many trackables to pull in
			values = values + "&type=" + listType;			
			values = values + "&fields=referenceCode,iconURL,name";
		} else { // pull the trackable inventory of a cache
			logAnalytics("Caches","LoadInventory",userMembershipLevelId);		
			myTrackableView = null;
		
			var values = "geocaches/" + currentCacheID + "/trackables?";
			values = values + "skip=0"; // start at the beginning of the list of trackables?  yes = 0
			values = values + "&take=40"; // how many trackables to pull in
			values = values + "&fields=referenceCode,iconURL,name,currentGeocacheName";
			
		}
		
		

		var xhr = new XMLHttpRequest({ mozSystem: true });
		var geomethod = "GET";	
		var geourl = app.rootAPIurl + values;
		
		var token = localStorage.getItem("access_token");
		
		if (token !== null) {
			//console.log('we have a token');
			xhr.open(geomethod, geourl, true);
			
			xhr.setRequestHeader('Authorization', 'bearer ' + token);		

			xhr.onreadystatechange = function () {
			  var geoloadstate = xhr.readyState;
			 // console.log(`Load state: ${geoloadstate}`);
			  if (geoloadstate == 1) {
				//  console.log('request opened');
			  } else if (geoloadstate == 2) {
				//console.log('headers received'); 
						
			  } else if (geoloadstate == 3) {
				 // console.log('loading data');						  
			  } else if (geoloadstate == 4) {
				var geostatus = xhr.status;
				//console.log(`status: ${geostatus}`);
				if (geostatus >= 200 && geostatus < 400) {
					var siteText = xhr.response;				
					//console.log(`response: ${siteText}`);
					//localStorage.setItem('geocachingResponse', siteText);

					//===============================================================
					// now parse the returned JSON out and do stuff with it
					
					var cacheInventoryList = JSON.parse(siteText);
					trackableCount = cacheInventoryList.length;
					//console.log(`Pulling list of trackables: trackableCount: ${trackableCount}`);
						

					if (loadLocation == 'cacheLog') {
						//================================================================================
						//
						// Display list of trackables
						//
						//
						
						// start by making at note at the top of the form that we have TBs we can log (as this list is below the fold of the screen 
						// and below the submit button - don't want users to miss that they can log TBs
						
						document.getElementById("tbNotes").innerHTML = "";
						
						if(trackableCount == 1) {
							document.getElementById("tbNotes").innerHTML = "<b>You have 1 trackable in your inventory</b>. View them below the Submit button to drop or visit them at this cache";
						} else if (trackableCount > 1) {
							document.getElementById("tbNotes").innerHTML = "<b>You have " + trackableCount + " trackables in your inventory</b>. View them below the Submit button to drop or visit them at this cache";							
						}
						
						var listContainer = document.getElementById('logCacheTrackableContainer');
						listContainer.innerHTML = '';
						
						trackableListID = 0;
			
						//Loading up trackables...

						loadingOverlay(true);

						//clear out any existing trackables in the array					
						arrayCacheInventory.length = 0;

						//
						// cycle through all the returned trackables and 
						//		load them into the cache inventory page for display / selection by the user 
						//
						var optionSetup = "<option value='0'>No action</option><option value='75'>Visit</option><option value='14'>Drop</option>";
						var entryTabIndex;
						for (let i = 0; i < trackableCount; i++) {
							// parse out the returned response 
							
							var trackableCode = cacheInventoryList[i].referenceCode;
							var trackableIcon = cacheInventoryList[i].iconUrl;
							var trackableName = cacheInventoryList[i].name;
							

							// now work on loading those details into the log cache trackable inventory section 
								//<fieldset>	
								//  <legend class="navItem" tabIndex="70">TB3NC58: Dogtag number 2</legend>
								//  <select id="TB3NC58-01">
								//	<option value="0">No action</option>
								//	<option value="75">Visit</option>
								//	<option value="14">Drop</option>				
								// </select>
								//</fieldset>								
							entryTabIndex = 70 + (i * 10);
							var entryLine = "<fieldset>";
							entryLine = entryLine + "<legend class='navItem' tabIndex='" + entryTabIndex + "'><img src='" + trackableIcon + "'>" + trackableCode + ": " + trackableName + "</legend>"
							entryLine = entryLine + "<select id='" + trackableCode + "'>";
							entryLine = entryLine + optionSetup;
							entryLine = entryLine + "</select></fieldset>";

							listContainer.innerHTML = listContainer.innerHTML + entryLine;	

						};
						loadingOverlay(false);	

					} else {
						//================================================================
						// Setup the header of the inventory of trackables
						//
						//
						var headerContainer = document.getElementById('cacheInventoryHeader');
						var headerAvatar = document.getElementById('cacheInventoryAvatar');
						var headerName = document.getElementById('cacheInventoryName');
						var headerSeparator = document.getElementById('cacheInventoryHeaderBreak');
						headerSeparator.innerHTML = '';
						headerAvatar.innerHTML = '';
						headerName.innerHTML = '';
						headerContainer.innerHTML = '';					

						if (currentCacheID == null) { // pull trackable inventory of the logged in user
							if (myUserAvatar !== null) {headerAvatar.innerHTML = "<img src='" + myUserAvatar + "' width='40'>"; }
							headerName.innerHTML = '<b> My<br>Trackables</b>';
							//1 = Inventory, 2 = Collection, 3 = owned
							if (listType == 'inventory') {
								headerSeparator.innerHTML = 'All | <b>In Hand</b> | Collection';							
							} else if (listType == 'collection') {
								headerSeparator.innerHTML = 'All | In Hand | <b>Collection</b>';													
							} else if (listType == 'owned') {
								headerSeparator.innerHTML = '<b>All</b> | In Hand | Collection';							
							}

						} else { // inventory of the cache
							var CacheID;
							for (let j=0; j < arrayCache.length; j++) {
								if (arrayCache[j].cacheCode == currentCacheID) {
									CacheID = j;
								};
							}
							
							var BadgeContent = document.createElement("span");
							BadgeContent.innerHTML = arrayCache[CacheID].cacheBadge + "<b>" + arrayCache[CacheID].cacheName + "</b><br>" + arrayCache[CacheID].cacheCode;
							
							if(arrayCache[CacheID].cacheIsPremium == "true" || arrayCache[CacheID].cacheIsPremium == true) {
								BadgeContent.innerHTML = BadgeContent.innerHTML + "&nbsp&nbsp <span class='premium'><b>PREMIUM</b></span>";
							}							
							
							headerName.appendChild(BadgeContent);								
							headerSeparator.innerHTML = "<b>Trackable Inventory</b>";
						
						};
						


						//================================================================================
						//
						// Display list of trackables
						//
						//
						var listContainer = document.getElementById('cacheInventoryList');
						listContainer.innerHTML = '';
						
						trackableListID = 0;
			
						//Loading up trackables...

						loadingOverlay(true);

						//clear out any existing trackables in the array					
						arrayCacheInventory.length = 0;

						if (trackableCount > 0) {
							//
							// cycle through all the returned trackables and 
							//		load them into the cache inventory page for display / selection by the user 
							//
							for (let i = 0; i < trackableCount; i++) {
								// parse out the returned response 
								
								var trackableCode = cacheInventoryList[i].referenceCode;
								var trackableIcon = cacheInventoryList[i].iconUrl;
								var trackableName = cacheInventoryList[i].name;
								

								// now work on loading those details into the cache inventory page 
								var entry = document.createElement("div");
								entry.className = 'navItem';
								entry.tabIndex = i * 10;		

								var trackableImage = document.createElement("div");
								trackableImage.innerHTML = "<img src='" + trackableIcon + "'>";;
								trackableImage.className = 'iconLeft';
								entry.appendChild(trackableImage);

								var trackableNameInList = document.createElement("div");
								trackableNameInList.innerHTML = "<b>" + trackableName + "</b>";
								entry.appendChild(trackableNameInList);	

								entry.setAttribute('data-function', 'showTrackableDetails');
								entry.setAttribute('trackableID',trackableCode);

								listContainer.appendChild(entry);	

							};
						};

						// let the user know we're done processing data
						//kaiosToaster({	
						//  message: 'Cache inventory loaded',	
						//  position: 'north',	
						//  type: 'success',	
						//  timeout: 3000	
						//});	
						// turn off the loading spinner
						loadingOverlay(false);	
						
						//now, bounce over to the cache inventory list after loading the inventory
							windowOpen="viewCacheInventory";
							showView(25,false);						
							initView();
					}

				}  else if (geostatus == 401) {
					// token has expired, refresh and tell caller to retry
					//console.log('refreshing token');
					refreshToken();
				}  else {
				// Oh no! There has been an error with the request!
				//console.log("some problem...");
					// turn off the loading spinner
					loadingOverlay(false);	
					alert("There was an issue connecting to geocaching.com...");
			    }
			  }; 
			}

			// turn on the loading spinner
			loadingOverlay(true);
			
			xhr.send();	
		} else {
			getToken();
		};	
};


	
function enterManualCoordinates(){
	windowOpen="enterManualCoordinates";
	
	var manualFormat;
	var manualLat;
	var manualLng;
		
	manualFormat = localStorage.getItem('manualCoordFormat');
	
	if (manualCoordFormat == null) {
		manualCoordFormat = localStorage.getItem('coorRep');
		localStorage.setItem('manualCoordFormat',manualCoordFormat);
	}
	
	var mapCrd = map.getCenter();	
	var mapLat = mapCrd.lat;	
	var mapLng = mapCrd.lng;	
	
	displayPosition(mapLat,mapLng,manualFormat,"manualCoordEnter")
	
	showView(29,true);	
	initView();
	
};


function viewTrackableDetails(inboundTrackableID) {

	var values = "trackables/" + inboundTrackableID;
	values = values + "?fields=referenceCode,iconUrl,name,owner,holder,goal,allowedToBeCollected,description,releasedDate,originLocation,ownerCode,holderCode,currentGeocacheCode,currentGeocacheName,isMissing,trackingNumber,kilometersTraveled,milesTraveled,trackableType,lastDiscoveredDate";

	var xhr = new XMLHttpRequest({ mozSystem: true });
	var geomethod = "GET";	
	var geourl = app.rootAPIurl + values;
	
	var token = localStorage.getItem("access_token");
	
	if (token !== null) {
		//console.log('we have a token');
		xhr.open(geomethod, geourl, true);
		
		xhr.setRequestHeader('Authorization', 'bearer ' + token);		

		xhr.onreadystatechange = function () {
		  var geoloadstate = xhr.readyState;
		  //console.log(`Load state: ${geoloadstate}`);
		  if (geoloadstate == 1) {
			  //console.log('request opened');
		  } else if (geoloadstate == 2) {
			//console.log('headers received'); 
					
		  } else if (geoloadstate == 3) {
			 // console.log('loading data');

		  } else if (geoloadstate == 4) {
			var geostatus = xhr.status;
				//console.log(`status: ${geostatus}`);
			if (geostatus == 200 || geostatus == 201) {
			  var siteText = xhr.response;				

				//===============================================================
				// now parse the returned JSON out and do stuff with it
				var trackableDetails = JSON.parse(siteText);
					//referenceCode
					//iconUrl
					//name
					//owner
					//holder
					//goal
					//description
					//releasedDate
					//originLocation
					//ownerCode
					//holderCode
					//currentGeocacheCode
					//currentGeocacheName
					//isMissing
					//trackingNumber
					//kilometersTraveled
					//milesTraveled
					//trackableType
					//lastDiscoveredDate
					//allowedToBeCollected

				// load up the header - icon, name, code
					trackableID = trackableDetails.referenceCode;
					if (trackableDetails.holder !== null) {trackableHolder = trackableDetails.holder.username;};
					trackableOwner = trackableDetails.owner.username;
					trackableCacheName = trackableDetails.currentGeocacheName;
					trackableLogName = trackableDetails.name;
					trackableLogIcon = trackableDetails.iconUrl;	
					trackableCacheCode = trackableDetails.currentGeocacheCode;
					
					
					var trackableHeader = document.getElementById('TrackableHeaderDetail');
					var trackableLogsHeader = document.getElementById('TrackableLogsHeaderDetail');
					var trackableGalleryHeader = document.getElementById('TrackableGalleryHeaderDetail');
					trackableHeader.innerHTML = '';
					trackableLogsHeader.innerHTML = '';
					trackableGalleryHeader.innerHTML = '';

					var entry1 = document.createElement("div");
					entry1.innerHTML = "<img src='" + trackableDetails.iconUrl + "'>";;
					entry1.className = 'iconLeft';

					trackableHeader.appendChild(entry1);

					var entry2 = document.createElement("span");
					entry2.innerHTML = "<b>" + trackableDetails.name + "</b><br>" + trackableDetails.referenceCode;

					trackableHeader.appendChild(entry2);	

					trackableLogsHeader.innerHTML = trackableHeader.innerHTML;
					trackableGalleryHeader.innerHTML = trackableHeader.innerHTML;

					
				// then load up the overview section -owner/released/origin/recently spotted/collectible pref
					var trackableOverview = document.getElementById('TrackableDescription');
					trackableOverview.innerHTML = '';

					var entry3 = document.createElement("span");
					entry3.innerHTML = "<b>Owner:</b> " + trackableDetails.owner.username + "<br>";
					
					var trackableReleaseDate = trackableDetails.releasedDate
								
					var trackableDistanceTraveled;
					if (myUnits == "mi") {
						trackableDistanceTraveled = Math.round(trackableDetails.milesTraveled);
					} else {
						trackableDistanceTraveled = Math.round(trackableDetails.kilometersTraveled);						
					};
					
					var lastSeen;
					if (trackableDetails.currentGeocacheName == null && trackableDetails.holder !== null) {
						lastSeen = "In the hands of " + trackableDetails.holder.username;
						
					} else if (trackableDetails.currentGeocacheName !== null) {
						lastSeen = "In " + trackableDetails.currentGeocacheName;
						
					} else {
						lastSeen = "Unknown location";
					};
					
							
					entry3.innerHTML = entry3.innerHTML + "<b>Released:</b> " + trackableReleaseDate.slice(0,10) + "<br>";
					entry3.innerHTML = entry3.innerHTML + "<b>Origin:</b> " + trackableDetails.originLocation.state + ", " + trackableDetails.originLocation.country + "<br>";
					entry3.innerHTML = entry3.innerHTML + "<b>Distance traveled:</b> " + trackableDistanceTraveled + myUnits + "<br>";
					entry3.innerHTML = entry3.innerHTML + "<b>Last seen:</b> " + lastSeen + "<br><br>";
					if (trackableDetails.allowedToBeCollected) {
						entry3.innerHTML = entry3.innerHTML + "This <b>is</b> a collectible<br>";						
					} else {
						entry3.innerHTML = entry3.innerHTML + "This <b>is not</b> a collectible<br>";
					};
					
					trackableOverview.appendChild(entry3);						
					
				// then load up the goal section - goal
					var trackableGoal = document.getElementById('TrackableGoal');
					trackableGoal.innerHTML = trackableDetails.goal;
					
					
				// then load up the about section - about
					var trackableAbout = document.getElementById('TrackableAbout');
					trackableAbout.innerHTML = trackableDetails.description;
				

				// now set the options menu appropriately
				
				var menuTrackableOptions = document.getElementById('viewTrackableOptions');
				
				var menuOptionsSetup = "<button class='navItem' tabIndex='0' data-function='logTrackable'>Log this trackable</button>";	
				var nextTabIndex = "10";
				if (trackableDetails.owner.username !== myUserAlias) {
					menuOptionsSetup = menuOptionsSetup + "<button class='navItem' tabIndex='10' data-href='" + app.rootSiteURL + "/email/?u=" + trackableDetails.owner.username + "'>Send message to trackable owner</button>";
					nextTabIndex = "20";
				};
				if (trackableDetails.holder !== null) {
					if (trackableDetails.holder.username !== myUserAlias) {menuOptionsSetup = menuOptionsSetup + "<button class='navItem' tabIndex='" + nextTabIndex + "' data-href='" + app.rootSiteURL + "/email/?u=" + trackableDetails.holder.username + "'>Send message to current holder of the trackable</button>";};
				};
				
				menuTrackableOptions.innerHTML = menuOptionsSetup;

				logAnalytics("Trackables","ViewTrackableDetails",userMembershipLevelId);
				// turn off the loading spinner
				
				loadingOverlay(false);	
				//now, bounce over to the cache inventory list after loading the inventory
					windowOpen="viewTrackableDetails";
					showView(22,false);	
					initView();
				
				
			} else if(geostatus == 404) {
				// some issue
				body = JSON.parse(this.response);
				var responseError = "There was an error on the log submission: " + body.errorMessage;
				loadingOverlay(false);						
				//showModal(responseError);
				alert(responseError);
				loadingOverlay(false);					
				
			}  else if (geostatus == 401) {
				// token has expired, refresh and tell caller to retry
				//console.log('refreshing token');
				// turn off the loading spinner
				loadingOverlay(false);					
				refreshToken();
			}  else {
				// Oh no! There has been an error with the request!
				//console.log("some problem...");
				// turn off the loading spinner
				loadingOverlay(false);	
				// there was some issue loading full details, so pushing to the partial details screen.
				logAnalytics("Caches","ViewPartialDetails",userMembershipLevelId);				
				ShowCacheDetails(CacheID,true,false);	
				if(showConnectionError) {
					if (confirm("There was an issue connecting to geocaching.com...")) {
						showConnectionError = false;
					}
				}
			}
		  }; 
		};
		

		// turn on the loading spinner
		loadingOverlay(true);		
		xhr.send();	
	} else {
		getToken();

	};	
	
};


function viewTrackableLogs(trackableID) {


		logAnalytics("Trackable","LoadTrackableLogs",userMembershipLevelId);		
	
	
		var values = "trackables/" + trackableID + "/trackablelogs?";
		values = values + "skip=0"; // start at the beginning of the list of trackable logs?  yes = 0
		values = values + "&take=40"; // how many trackable logs to pull in
		values = values + "&fields=referenceCode,geocacheName,trackableLogType,owner,loggedDate,text";

		var xhr = new XMLHttpRequest({ mozSystem: true });
		var geomethod = "GET";	
		var geourl = app.rootAPIurl + values;
		
		var token = localStorage.getItem("access_token");
		
		if (token !== null) {
			//console.log('we have a token');
			xhr.open(geomethod, geourl, true);
			
			xhr.setRequestHeader('Authorization', 'bearer ' + token);		

			xhr.onreadystatechange = function () {
			  var geoloadstate = xhr.readyState;
			 // console.log(`Load state: ${geoloadstate}`);
			  if (geoloadstate == 1) {
				//  console.log('request opened');
			  } else if (geoloadstate == 2) {
				//console.log('headers received'); 
						
			  } else if (geoloadstate == 3) {
				 // console.log('loading data');						  
			  } else if (geoloadstate == 4) {
				var geostatus = xhr.status;
				//console.log(`status: ${geostatus}`);
				if (geostatus >= 200 && geostatus < 400) {
					var siteText = xhr.response;				

					//===============================================================
					// now parse the returned JSON out and do stuff with it
					
					var trackableLogList = JSON.parse(siteText);
					var trackableLogCount = trackableLogList.length;					


					//================================================================================
					//
					// Display list of trackable logs
					//
					//
					var listContainer = document.getElementById('TrackableLogsView');
					listContainer.innerHTML = '';
		
					//Loading up trackables...
			
					// turn on the loading spinner
					loadingOverlay(true);


					//
					// cycle through all the returned trackables and 
					//		load them into the cache inventory page for display / selection by the user 
					//
					for (let i = 0; i < trackableLogCount; i++) {
						// parse out the returned response 
						
						var trackableLogDate = trackableLogList[i].loggedDate;
						var trackableLogUsername = trackableLogList[i].owner.username;
						var trackableLogAction = trackableLogList[i].trackableLogType.name;
						var trackableLogActionImage = trackableLogList[i].trackableLogType.imageUrl;
						var trackableLogCacheName = trackableLogList[i].geocacheName;
						var trackableLogText = trackableLogList[i].text;
						

						//in:					
						//4	Write Note
						//13	Retrieve It from a Cache
						//16	Mark Missing
						//75	Visited		

						//to:
						//14	Dropped Off
						//15	Transfer

						//none:
						//19	Grab It (Not from a Cache)
						//48	Discovered It
						//69	Move To Collection
						//70	Move To Inventory				
						
						var trackableQualifier = null;
						
						switch (trackableLogAction) {	
							case 'Retrieve It from a Cache':	
								trackableQualifier = "in";
							break;
							case 'Mark Missing':	
								trackableQualifier = "in";
							break;
							case 'Visited':	
								trackableQualifier = "in";
							break;
							case 'Dropped Off':
								trackableQualifier = "in";
							break;
							case 'Transfer':
								trackableQualifier = "to";
							break;							
						};
						
						trackableLogDate = trackableLogDate.slice(0,10);

						// now work on loading those details into the cache inventory page 
						var entry = document.createElement("div");
						entry.className = 'navItem';
						entry.tabIndex = i * 10;		

						var trackableImage = document.createElement("div");
						trackableImage.innerHTML = "<img src='" + trackableLogActionImage + "'>";;
						trackableImage.className = 'iconLeft';
						entry.appendChild(trackableImage);

						var trackableNameInList = document.createElement("div");
						trackableNameInList.innerHTML = "<b>" + trackableLogDate + "</b> " + trackableLogUsername + " " +  trackableLogAction;
						if (trackableQualifier !== null) {
							trackableNameInList.innerHTML = trackableNameInList.innerHTML + " " + trackableQualifier + " " + trackableLogCacheName;
						};
						if (trackableLogText !== null) {
							trackableNameInList.innerHTML = trackableNameInList.innerHTML + "<br><br>" + trackableLogText;
						};
						entry.appendChild(trackableNameInList);	

						//entry.setAttribute('data-function', 'showTrackableDetails');
						//entry.setAttribute('trackableID',trackableCode);

						listContainer.appendChild(entry);	

					};

					// let the user know we're done processing data
					//kaiosToaster({	
					//  message: 'Cache inventory loaded',	
					//  position: 'north',	
					//  type: 'success',	
					//  timeout: 3000	
					//});	
					// turn off the loading spinner
					loadingOverlay(false);	
					
					//now, bounce over to the cache inventory list after loading the inventory
						windowOpen="viewTrackableLogs";
						showView(23,true);						
						initView();

				}  else if (geostatus == 401) {
					// token has expired, refresh and tell caller to retry
					//console.log('refreshing token');
					refreshToken();
				}  else {
				// Oh no! There has been an error with the request!
				//console.log("some problem...");
					// turn off the loading spinner
					loadingOverlay(false);	
					alert("There was an issue connecting to geocaching.com...");
			    }
			  }; 
			}

			// turn on the loading spinner
			loadingOverlay(true);
			
			xhr.send();	
		} else {
			getToken();
		};		
	
};

function viewTrackableGallery(trackableID) {

};


function loadMoreCacheLogs(CacheCode) {
	loadingOverlay(true);
	var cacheLogLoadCount=0;
	// first figure out how many logs we have so far for this cache 
	var CacheID = -1;
	for (let i = 0; i < arrayCache.length; i++) {
	  // search for cache in array
	  if (CacheCode == arrayCache[i].cacheCode) {
		CacheID = i;
		cacheLogLoadCount = arrayCache[CacheID].cacheLogs.length;
	  }
	}	
	// at the end of this particular log load, need to increment the cacheLogLoadCount number by however many logs we load here
	// need to also store this site result into a logs array in localstore
	
	
	var values = "geocaches/" + CacheCode + "/geocachelogs?";
	values = values + "take=" + numLogsToLoad;
	values = values + ",skip=" + cacheLogLoadCount;
	values = values + ",sort=newest";
	values = values + ",images:" + numLogsToLoad;
	values = values + "&fields=owner,images,loggedDate,text,geocacheLogType,usedFavoritePoint,referenceCode";
	

	var xhr = new XMLHttpRequest({ mozSystem: true });
	var geomethod = "GET";	
	var geourl = app.rootAPIurl + values;
	
	var token = localStorage.getItem("access_token");
	
	if (token !== null) {
		//console.log('we have a token');
		xhr.open(geomethod, geourl, true);
		
		xhr.setRequestHeader('Authorization', 'bearer ' + token);		

		xhr.onreadystatechange = function () {
		  var geoloadstate = xhr.readyState;
		  //console.log(`Load state: ${geoloadstate}`);
		  if (geoloadstate == 1) {
			  //console.log('request opened');
		  } else if (geoloadstate == 2) {
			//console.log('headers received'); 
					
		  } else if (geoloadstate == 3) {
			 // console.log('loading data');
				  
		  } else if (geoloadstate == 4) {
			var geostatus = xhr.status;
				//console.log(`status: ${geostatus}`);
			if (geostatus >= 200 && geostatus < 400) {
			  var siteText = xhr.response;				
				//console.log(`response: ${siteText}`);

				//===========================================================
				// first drop the cache log details response into our array of loaded cache log details
				// and update our localstore with those details so we can pull them later
				
				// first pull the current list of stored caches
				var arrayCacheLogDetailsStr = localStorage.getItem("arrayCacheLogDetails");
				var arrayCacheLogDetails=[];
				
				if(arrayCacheLogDetailsStr !== null) {
					arrayCacheLogDetails = JSON.parse(localStorage.getItem("arrayCacheLogDetails"));
					
				};
				
				var cacheExpires = localStorage.getItem("fullCallsReset");
				
				// then construct the newly loaded cache detail
				arrayCacheLogDetailsObject = {
					navCode: CacheCode,
					expires: cacheExpires,
					cacheLogDetails: siteText
				};
				
				// drop that new cache detail into the list of loaded caches
				arrayCacheLogDetails[arrayCacheLogDetails.length] = arrayCacheLogDetailsObject;

				// finally update our localstore of fully loaded caches 
				localStorage.setItem("arrayCacheLogDetails", JSON.stringify(arrayCacheLogDetails));

				//===============================================================
				// now parse the returned JSON out and do stuff with it
				var cacheLogDetails = JSON.parse(siteText);
				
				//=============================
				//
				// first we need to remove the old "load more logs" button
				var lastLog = document.getElementById("CacheLogsView").lastChild;
				lastLog.remove();				
				
				//var listOfLogs = document.getElementsByClassName("listLogsView")[0];
				//var listOfLogsLength = listOfLogs.length();
				
				//listOfLogs.removeChild(listOfLogs.childNodes[listOfLogsLength-1]);   
				
			
				
				//================================================================================
				//
				// Display list of logs
				//
				//
				var listContainer = document.getElementById('CacheLogsView');
				//listContainer.innerHTML = '';
				var logCount = cacheLogDetails.length;		

				//
				// cycle through all the returned logs and 
				//	load them into the cache listing page for display / selection by the user 
				//
				for (let i = 0; i < logCount; i++) {

					// parse out the returned response 
					
					var logText = cacheLogDetails[i].text;
					var logFavorite = cacheLogDetails[i].usedFavoritePoint;
					var logOwnerName = cacheLogDetails[i].owner.username;
					var logDateRaw = cacheLogDetails[i].loggedDate;
					var logDate = logDateRaw.slice(0,10);		
					var logTypeImg = "<img src='" + cacheLogDetails[i].geocacheLogType.imageUrl + "'>";
					var logType = cacheLogDetails[i].geocacheLogType.name;
										
					// now work on loading those details into the cache details page 
					
					var entry = document.createElement("div");
					entry.className = 'navItem';
					var myIndex = (i+cacheLogLoadCount)*10;		
					if(i==0) {
						// label this spot in the list to make it easy to find again
						entry.id = 'topOfNewLogs';
					}
					entry.tabIndex = myIndex;

					var headline = document.createElement("span");
					headline.innerHTML = "<b>" + logTypeImg + " " + logType + " " + logDate + "<br>" + logOwnerName + "</b><br><br>" + logText;
					
					// take that structured HTML and drop it into the page:
					entry.appendChild(headline);	
					
					listContainer.appendChild(entry);
				}

				//show option to load more logs
				var entry = document.createElement("div");
				entry.className = 'navItem';
				var myIndex = (logCount+cacheLogLoadCount)*10;				
				entry.tabIndex = myIndex;
				entry.setAttribute('data-function', 'loadMoreLogs');
				entry.setAttribute('CacheID',CacheID);
				entry.setAttribute('CurrentLogsLoaded',(logCount+cacheLogLoadCount));		

				var headline = document.createElement("span");
				headline.innerHTML = "<center><b>Load more logs...</b></center>";
				
				// take that structured HTML and drop it into the page:
				entry.appendChild(headline);					
				
				listContainer.appendChild(entry);	

				// now focus us on the top of the newly loaded list of logs
				
				var startLogForFocus = document.getElementById("topOfNewLogs");
				startLogForFocus.focus();				
				//startLogForFocus.scrollIntoView({ behavior: "smooth" });				
				
				loadingOverlay(false);
				
			}  else if (geostatus == 401) {
				// token has expired, refresh and tell caller to retry
				//console.log('refreshing token');
				refreshToken();
				loadingOverlay(false);				
			}  else {
			// Oh no! There has been an error with the request!
			//console.log("some problem...");
					// turn off the loading spinner
					loadingOverlay(false);	
					alert("There was an issue connecting to geocaching.com...");
			}
		  }; 
		};
		xhr.send();	
	} else {
		getToken();

	};	
	
}

function viewCacheGallery(CacheID) {
	windowOpen="viewCacheGallery";	
	showView(17,true);	

	
	var CacheHeader = document.getElementById('CacheGalleryHeaderDetail');		
	CacheHeader.innerHTML = '';	
		var BadgeContent = document.createElement("span");
		BadgeContent.innerHTML = arrayCache[CacheID].cacheBadge + "<b>" + arrayCache[CacheID].cacheName + "</b><br>" + arrayCache[CacheID].cacheCode;
		
	if(arrayCache[CacheID].cacheIsPremium == "true" || arrayCache[CacheID].cacheIsPremium == true) {
		BadgeContent.innerHTML = BadgeContent.innerHTML + "&nbsp&nbsp <span class='premium'><b>PREMIUM</b></span>";
	}		
		
	CacheHeader.appendChild(BadgeContent);	

	//================================================================================
	//
	// Display list of images
	//
	//
	var listContainer = document.getElementById('CacheGallery');
	listContainer.innerHTML = '';
	var imageCount = arrayCache[CacheID].cacheImages.length;		
	//console.log(`ImgCount: ${imageCount}`);
	
	var logListID = 0;

	//
	// cycle through all the returned logs and 
	//	load them into the cache listing page for display / selection by the user 
	//
	for (let i = 0; i < imageCount; i++) {

		// parse out the returned response 
		
		var imageDesc = arrayCache[CacheID].cacheImages[i].description;
		var imageDateRaw = arrayCache[CacheID].cacheImages[i].capturedDate;
		var imageThumbnail = "<img src='" + arrayCache[CacheID].cacheImages[i].thumbnailUrl + "'>";
		var imageLargeURL = arrayCache[CacheID].cacheImages[i].largeUrl;				
		var imageDate = imageDateRaw.slice(0,10);	
		var imageOwnerCode = arrayCache[CacheID].cacheImages[i].ownerCode;				

							
		// now work on loading those details into the cache details page 
		
		var entry = document.createElement("div");
		entry.className = 'navItem';
		entry.tabIndex = i * 10;
		entry.setAttribute('data-href', imageLargeURL);		

		var headline = document.createElement("span");
		headline.innerHTML = imageDate + "<br>" + imageThumbnail + "<br>" + imageDesc;
		
		// take that structured HTML and drop it into the page:
		entry.appendChild(headline);	
		
		listContainer.appendChild(entry);
	}	
	
	initView();		
};

function ShowCacheOnMap(CacheCode) {
	var CacheID = -1;
	//console.log(`trying to show cache ${CacheCode}`);
	// first need to figure out if we're looking for a real cache or a waypoint
	// Waypoints will have "WAYPOINT" in the beginning of the CacheCode

	var isWaypoint = CacheCode.startsWith("WAYPOINT");
	
	//console.log(`showCacheOnMap, CacheCode: ${CacheCode}`);
	
	if(isWaypoint == true) { // we're working with a waypoint
		for (let i = 0; i < arrayWaypoint.length; i++) {
		  // search for cache in array
		  if (CacheCode == arrayWaypoint[i].cacheCode) {
			CacheID = i;
			var CompassCacheName = document.getElementById("cacheName");
			CompassCacheName.innerHTML = "<b>" + arrayWaypoint[CacheID].cacheName + "</b><br>" + arrayWaypoint[CacheID].cacheCode;
			cacheNameNavigating = arrayWaypoint[CacheID].cacheCode;
		  }
		}	
		
		//console.log(`CacheID: ${CacheID}, isDefined: ${CacheHasBeenDefined}`);
		if(CacheHasBeenDefined == false) {
			if(CacheCode!== 0) {
				Cache = L.marker([arrayWaypoint[CacheID].cacheLat,arrayWaypoint[CacheID].cacheLng], {icon: NavTo_cache}).addTo(map);
				CacheLat = arrayWaypoint[CacheID].cacheLat;
				CacheLng = arrayWaypoint[CacheID].cacheLng;
				navCacheName = arrayWaypoint[CacheID].cacheName;
				CacheHasBeenDefined = true;	
				MovemMap("focusOnCache");							
			}
		} else {
			if(CacheCode !== 0) {
				Cache.remove();
				Cache = L.marker([arrayWaypoint[CacheID].cacheLat,arrayWaypoint[CacheID].cacheLng], {icon: NavTo_cache}).addTo(map);
				CacheLat = arrayWaypoint[CacheID].cacheLat;
				CacheLng = arrayWaypoint[CacheID].cacheLng;
				navCacheName = arrayWaypoint[CacheID].cacheName;
				CacheHasBeenDefined = true;	
				MovemMap("focusOnCache");
			} else {
				//console.log('remove cache pin');
				Cache.remove();
			}
		}
		//LoadCacheDetails(CacheCode,false);		
	} else { // we're working with an actual cache
		for (let i = 0; i < arrayCache.length; i++) {
		  // search for cache in array
		  if (CacheCode == arrayCache[i].cacheCode) {
			CacheID = i;
			var CompassCacheName = document.getElementById("cacheName");
			CompassCacheName.innerHTML = "<b>" + arrayCache[CacheID].cacheName + "</b><br>" + arrayCache[CacheID].cacheCode;
			cacheNameNavigating = arrayCache[CacheID].cacheCode;
		  }
		}	
		
		//console.log(`CacheID: ${CacheID}, isDefined: ${CacheHasBeenDefined}`);
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
				//console.log('remove cache pin');
				Cache.remove();
			}
		}
		//LoadCacheDetails(CacheCode,false);
	}
}

function navToCache(navGeoCode,startNav) {
	if(startNav) {
		windowOpen = "viewMap";
		logAnalytics("Caches","NavToCache",userMembershipLevelId);			
		showView(0,false);
		initView();	
		ShowCacheOnMap(navGeoCode);
		focusActionLocation = "focusOnMe";
		localStorage.setItem("navToCacheGeoCode",navGeoCode);
	} else {
		//console.log('stop navigation to cache');
		CacheLat = 0;
		CacheLng = 0;
		cacheNameNavigating = "";
		container.innerHTML = "";
		var mapCompassContainer = document.getElementById('compassContainer');
		var compassIMG = document.getElementById('compass');
		var LargeCompassIMG = document.getElementById('largeCompass');
		var LargeCompassContainer = document.getElementById('NorthCompassContainer');
		var LargeCompassNorthIMG = document.getElementById('NorthCompass');
		document.getElementById('distanceToCache').innerHTML = "<b>Distance</b>";
		document.getElementById('gpsAccuracy').innerHTML = "<b>Accuracy</b>";

		document.getElementById('bearingToCache').innerHTML = "";
		document.getElementById('cacheName').innerHTML = "<b>Name</b>";

		compassIMG.style.transform  = 'rotate(0deg)';
		mapCompassContainer.style.backgroundColor = '';
		mapCompassContainer.style.color = '';
		
		LargeCompassNorthIMG.style.transform = 'rotate(-0deg)';
		LargeCompassIMG.style.transform = 'rotate(0deg)';

		
		navCacheName = "";
		CacheHasBeenDefined = false;	
		focusActionLocation = "focusOnMe";		
		if (Cache !== null) {Cache.remove();};	
		localStorage.setItem("navToCacheGeoCode",null);
		goBack();
	}
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

}

function viewShortcuts() {

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
function displayPosition(lat,lng,format,showWhere){	
	// where should we update the coordinates?
	// "manualCoordEnter" is to update where we manually enter coordinates
	// otherwise we assume we are tweaking the main display, which is also the default
	
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
	   
	if (showWhere == "manualCoordEnter") {
		var tempLat = document.getElementById('manualLat');
		var tempLng = document.getElementById('manualLng');
		tempLat.value = latDisplay;
		tempLng.value = longDisplay;
	} else {
		ret=""+latDisplay+" "+longDisplay;   	
		return ret;	
	}
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
							});	
				break;	
				case 'EditWP':	

					if(app.editWPmode==0){
							kaiosToaster({	
									  message: 'Nav to the WayPoint location you want and press OK to select, edit, and save the location',	
									  position: 'south',	
									  type: 'default',	
									  timeout: 4000	
							});
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




	/** @todo It only works with the special "WAYPOINT" cache. Allow work with every cache_id.
	 *  adds new waypoint to the cache description and changes default lat and lng, then navigate there.
	 * 
	 * 	
	 **/
function addNewWP(lat, lng, cache_id){
	var wpID = -1;
	//console.log(`addNewWP - cache_id: ${cache_id}`);
	if(cache_id=="WAYPOINT"){
		// create a new WayPoint container in the waypoint list and arrayWaypoint object
		
		for (let i = 0; i < arrayWaypoint.length; i++) {
			if(arrayWaypoint[i].cacheType == "WAYPOINT"){
				wpID = i;
			}
		}	
		
		// calc the distanct to the waypoint
		var strTripDistance;
		
		if (lat !== 0 && lng !== 0) {
			var tripDistance = findDistance(my_current_lat,my_current_lng,lat,lng);

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
		
		
		// jump to the end of the list of waypoints, and create a new waypoint there for the waypoint
		//....................Creating waypoint container:
		var lastID=arrayWaypoint.length;
		
		//console.log(`lastID / arrayWaypoint.length: ${lastID}`);
		var listContainer = document.getElementById('waypointList');
		if(lastID == 0) {listContainer.innerHTML = "";};
		var entry = document.createElement("div");	
			entry.className = 'navItem cacheFullyLoaded';	
			entry.name='CacheList_WP';	
			entry.tabIndex = lastID*10;	
		var BadgeContent = document.createElement("span");				
			BadgeContent.innerHTML = "<img class='cache-type-img' width='48' height='48' src='/assets/icons/icons8-waypoint-map-48.png'>";													
			entry.appendChild(BadgeContent);	
		var headline = document.createElement("span");	
			headline.innerHTML = "<b>WayPoint #" + (lastID) + "</b><br>" + strTripDistance;	
			entry.appendChild(headline);						
		entry.setAttribute('data-function', 'NavToWaypointDetails');	
		// need to create a new ID for this new waypoint - will use "waypoint" + the current location in the cache array
		var waypointArrayID = "WAYPOINT" + lastID;
		entry.setAttribute('NavCode',waypointArrayID);						
		listContainer.appendChild(entry);

		var d = new Date();
		var dateNowLocal = "Created: " + d.toLocaleString();

		var arrayWaypointObject = {
			cacheName: "Waypoint #" + (lastID), 
			cacheBadge: "<img class='cache-type-img' src='/assets/icons/icons8-waypoint-map-48.png'>",
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
		};
		arrayWaypoint[lastID] = arrayWaypointObject;

		//=================================
		//
		// load up local storage with a text blob with all the cache details in it
		// one localstorage variable per cache

		var TMPstoredWaypointDetails = arrayWaypointObject.cacheName;
		TMPstoredWaypointDetails = TMPstoredWaypointDetails + "< |v| >" + arrayWaypointObject.cacheBadge;
		TMPstoredWaypointDetails = TMPstoredWaypointDetails + "< |v| >" + arrayWaypointObject.cacheDescription;
		TMPstoredWaypointDetails = TMPstoredWaypointDetails + "< |v| >" + arrayWaypointObject.cacheHiddenDate;
		TMPstoredWaypointDetails = TMPstoredWaypointDetails + "< |v| >" + arrayWaypointObject.cacheDifficulty;
		TMPstoredWaypointDetails = TMPstoredWaypointDetails + "< |v| >" + arrayWaypointObject.cacheTerrain;					
		TMPstoredWaypointDetails = TMPstoredWaypointDetails + "< |v| >" + arrayWaypointObject.cacheSize;		
		TMPstoredWaypointDetails = TMPstoredWaypointDetails + "< |v| >" + arrayWaypointObject.cacheGUIDid;
		TMPstoredWaypointDetails = TMPstoredWaypointDetails + "< |v| >" + arrayWaypointObject.cacheLat;
		TMPstoredWaypointDetails = TMPstoredWaypointDetails + "< |v| >" + arrayWaypointObject.cacheLng;
		TMPstoredWaypointDetails = TMPstoredWaypointDetails + "< |v| >" + arrayWaypointObject.cacheCode;
		TMPstoredWaypointDetails = TMPstoredWaypointDetails + "< |v| >" + arrayWaypointObject.cacheType;
		TMPstoredWaypointDetails = TMPstoredWaypointDetails + "< |v| >" + arrayWaypointObject.cacheFound;
		TMPstoredWaypointDetails = TMPstoredWaypointDetails + "< |v| >" + arrayWaypointObject.cacheOriginID;						

		var storedWaypointName = "storedWaypointDetails_WP" + lastID;
		localStorage.setItem(storedWaypointName, TMPstoredWaypointDetails);
		waypointTotalCount = Number(localStorage.getItem('waypointCount'));
		if (waypointTotalCount == null) {
			waypointTotalCount = 1;
		} else {
			waypointTotalCount = waypointTotalCount + 1;
		};
		localStorage.setItem('waypointCount',waypointTotalCount);
								
		//....................End of Creating waypoint container
		
		// replace automatic nav to waypoint with just showing the waypoint icon,
		// but only show waypoint icons if we're showing other icons
		
		if(showingAllCaches !== "no") {
			arrayWaypointMarker[lastID] = L.marker([arrayWaypoint[lastID].cacheLat,arrayWaypoint[lastID].cacheLng], {icon: Waypoint_cache}).addTo(map);	
		};
		
		if(showingAllCaches == "yes-yesName") {
			arrayWaypointMarker[lastID].bindTooltip(arrayWaypoint[lastID].cacheName).openTooltip();
		};		
			
		logAnalytics("Caches","CreateWaypoint",lastID);
			
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
						
	//NavTo there... (note: removed the function to automatically switch to navigating to the waypoint
	//ShowCacheOnMap(wpID);
	//if(CacheHasBeenDefined == true) {Cache.remove();}					
	//Cache = L.marker([myWP.lat,myWP.lng], {icon: NavTo_cache}).addTo(map);	
	//CacheLat = myWP.lat;	
	//CacheLng = myWP.lng;			
	//CacheHasBeenDefined = true;	
	//MovemMap("focusOnCache");	
	

	
						
	}

function DeleteWaypoints () {
	var waypointCount = Number(localStorage.getItem('waypointCount'));
	
	if(confirm("This will delete _all_ waypoints. Select OK to continue.")){
		for (let x = 0; x < waypointCount; x++) {				
			//remove from localStorage
			var tempX = x;

			storedCacheName = "storedCacheDetails_WP" + tempX;
			localStorage.removeItem(storedCacheName);		
			//and remove from arrayWaypoint						
			arrayWaypoint.length = 0;	
		}
		localStorage.setItem('waypointCount',0);
		// then regenerate the empty waypoint list 
		var listContainer = document.getElementById("waypointList");
		listContainer.innerHTML = "No waypoints have been created yet...";
		showView(0,false);
		initView();	
	};	
};

function ZoomMap(in_out) {

	var current_zoom_level = map.getZoom();
	//console.log(`ZoomMap ${in_out}, current zoom ${current_zoom_level}`);	
		if (in_out == "in") {
				current_zoom_level = current_zoom_level + 1;
				map.setZoom(current_zoom_level);
			}
		if (in_out == "out") {
			current_zoom_level = current_zoom_level - 1;
			map.setZoom(current_zoom_level);
		}
		zoom_level = current_zoom_level;
		zoom_speed();
	//console.log(`New Zoom ${zoom_level}`);
}

function zoom_speed() {
	//console.log(`current zoom level: ${zoom_level}`);
	
	switch(zoom_level) {
		case -1:
			step = 30;		
		 break;
		case 0:
			step = 30;		
		 break;
		case 1:
			step = 25;		
		 break;
		case 2:
			step = 20;		
		 break;
		case 3:
			step = 12;		
		 break;
		case 4:
			step = 8;		
		 break;
		case 5:
			step = 4;		
		 break;
		case 6:
			step = 1;		
		 break;
		case 7:
			step = 1;		
		 break;
		case 8:
			step = 0.5;		
		 break;
		case 9:
			step = 0.1;			
		 break;
		case 10:
			step = 0.1;			
		 break;
		case 11:
			step = 0.1;			
		 break;
		case 12:
			step = 0.01;			
		 break;
		case 13:
			step = 0.01;			
		 break;
		case 14:
			step = 0.01;		
		 break;
		case 15:
			step = 0.001;		
		 break;
		case 16:
			step = 0.001;		
		 break;
		case 17:
			step = 0.0001;			
		 break;
		case 18:
			step = 0.0001;			
		 break;
		case 19:
			step = 0.0001;			
		 break;

	}

	return step;
}

function MovemMap(direction) {
	//console.log(`MovemMap ${direction}`);
	//console.log(`lat/lng: ${current_lat}/${current_lng}`);
	if (direction == "left") {
		zoom_speed();
		isFocusedonMe = "no";
		current_lng = current_lng - step;
		map.panTo(new L.LatLng(current_lat, current_lng));
	}

	if (direction == "right") {
		zoom_speed();
		isFocusedonMe = "no";
		current_lng = Number(current_lng) + Number(step);
		map.panTo(new L.LatLng(current_lat, current_lng));
	}

	if (direction == "up") {
		zoom_speed();
		isFocusedonMe = "no";
		current_lat = Number(current_lat) + Number(step);
		map.panTo(new L.LatLng(current_lat, current_lng));

	}

	if (direction == "down") {
		zoom_speed();
		isFocusedonMe = "no";
		current_lat = current_lat - step;
		map.panTo(new L.LatLng(current_lat, current_lng));

	}
	
	if (direction == "reFocus") {
		isFocusedonMe = "yes";	
		isFocusedonCache = "no";
		//console.log(`current latlng: ${my_current_lat}, ${my_current_lng}`);
		map.panTo(new L.LatLng(my_current_lat,my_current_lng));
		current_lat = my_current_lat;
		current_lng = my_current_lng;

		//current_lat = crd.latitude;
		//current_lng = crd.longitude;

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
	
function openURL(url) {
	var external = url.includes('http');
	if (external) {
	  window.open(url);
	} else {
	  window.location.assign(url);
	}
	softkeyBar();
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

function loadingOverlay(show) {
  if (show==true) {
	document.getElementById("loadingOverlay").style.display = "block";
  } else {
	document.getElementById("loadingOverlay").style.display = "none";
  }
}

//==================================
//--------------------------------------------
// OAuth stuff here 

function logout() {
	// first we kill our current tokens to log out local to the app
	// then we punt the user out of the application.  this effectively resets the app itself to new
	// the user will be prompted to log in again, and will still have their login on the
	// geocaching.com website - not sure how to change that from the app itself

	localStorage.clear();
	window.close();

};

function getToken(signup){
	// Create and store a random "state" value
	//var state = "aselkjg123";

	
	//const state = Math.random().toString(16).substr(2, 8); // 6de5ccda	

	var state;
	for(let i = 0; i< 5; i++) {
		if(i==0) {
			state = Math.random().toString(16).substr(2, 8); // 6de5ccda
		} else {
			state = state + Math.random().toString(16).substr(2, 8); // 6de5ccda
		};
	};

	localStorage.setItem("pkce_state", state);

	// Create and store a new PKCE code_verifier (the plaintext random secret)
	//var code_verifier = generateRandomString();
	
	var code_verifier;
	for(let i = 0; i< 5; i++) {
		if(i==0) {
			code_verifier = Math.random().toString(16).substr(2, 8); // 6de5ccda
		} else {
			code_verifier = code_verifier + Math.random().toString(16).substr(2, 8); // 6de5ccda
		};
	};
	

	
	localStorage.setItem("pkce_code_verifier", code_verifier);

	// Hash and base64-urlencode the secret to use as the challenge
	//var code_challenge = await pkceChallengeFromVerifier(code_verifier);

	// Build the authorization URL
	console.log(`app.config.client_id: ${app.config.client_id}`);
	
	var url = app.config.authorization_endpoint 
		+ "?response_type=code"
		+ "&client_id="+(app.config.client_id)
		+ "&state="+(state)
		+ "&scope="+(app.config.requested_scopes)
		+ "&redirect_uri="+(app.config.redirect_uri)
		+ "&code_challenge="+(code_verifier)
		+ "&code_challenge_method=plain";	
		
	if(signup==true) {
		// specifically force the user to the signup page rather than the sign-in page
		url = url + "&signup=true";
	};

		//+ "&code_challenge="+encodeURIComponent(code_challenge)
		//+ "&code_challenge_method=S256"
		;

	// start a function to check to see if the auth is complete.  once complete we will push the user to the map screen
	// also includes a timeout function in case we get stuck somewhere
	
	if(rootKaiOSVersion !== 2) { // start up a service worker to listen for the return URL if on KaiOS v3.x
		//alert('starting eventlistener');
		//self.addEventListener('fetch', function(event) {
		//	alert('inside eventlistener');
		//	if (event.request.url.includes('https://caching-on-kai.com/')) {
		//	alert('inside found URL');
		//	var urlParams = new URLSearchParams(event.request.url.split('?')[1]);
		//	var myQueryParam = urlParams.get('myQueryParam');
			// Do something with the query parameter
		//	console.log('Serviceworker watching: myQueryParam:' + myQueryParam);
		//	alert(myQueryParam);
		//	}
		//});
	};
	
	var loginCheck = setInterval(myTimer, 500);
	var loginCheckCounter = 0;
	function myTimer() {
		loginCheckCounter = loginCheckCounter + 1;
		if(loginCheckCounter > 600 || (localStorage.getItem("access_token")!==null && localStorage.getItem("firstLoginComplete") == false)) {
			// stop the timer
			  clearInterval(loginCheck);
		};
		// check to see if we are just returning from our first login and auth against geocaching.com
		if (localStorage.getItem("access_token")!==null && localStorage.getItem("firstLoginComplete") == "true") {
			//bounce the user over to the map screen
			clearInterval(loginCheck);
			localStorage.setItem("firstLoginComplete",false);
			updateUserDetails();			
			app.keyCallback.ShowMap();
		};
	}


	// Redirect to the authorization server
	window.open(url);
};

function refreshToken(method,action) {

	sendPostRequest(app.config.token_endpoint, {
		grant_type: "refresh_token",
		client_id: app.config.client_id,
		client_secret: app.config.client_secret,
		redirect_uri: app.config.redirect_uri,
		refresh_token: localStorage.getItem("refresh_token")
	}, function(request, body) {

		
		console.log('Refreshing token');
		console.log(`Access Token: ${body.access_token}`);
		console.log(`Refresh Token: ${body.refresh_token}`);
		console.log(`Expires in ${body.expires_in} seconds`);
		
		var refresh_after = (body.expires_in * 1000)-5000;
		var token_expires = Date.now() + refresh_after;
		
		localStorage.setItem("token_expires", token_expires);		
		localStorage.setItem("access_token",body.access_token);
		localStorage.setItem("refresh_token",body.refresh_token);
		
		// update our stored user details for the now logged in user
		updateUserDetails()
		
		// if a method and action has been specified, that means we should return the user
		// back to the pullFromAPI function to try their action again
		// as they had been sent here due to an expired token.
		if (method !== null && action !== null) { pullFromAPI(method,action); }


	}, function(request, error) {
		// This could be an error response from the OAuth server, or an error because the 
		// request failed such as if the OAuth server doesn't allow CORS requests
		//document.getElementById("error_details").innerText = error.error+"\n\n"+error.error_description;
		//document.getElementById("error").classList = "";
		console.log(`refresh request error - ${error.error}: ${error.error_description}`);
		loadingOverlay(false);
		//showModal("There is an error in getting you logged in to geocaching.com: <br>" + error.error+"\n\n"+error.error_description);
	});
};
	
	
// Parse a query string into an object
function parseQueryString(string) {
		if(string == "") { return {}; }
		var segments = string.split("&").map(s => s.split("=") );
		var queryString = {};
		segments.forEach(s => queryString[s[0]] = s[1]);
		return queryString;
};
	
// Make a POST request and parse the response as JSON
function sendPostRequest(url, params, success, error) {
		var request = new XMLHttpRequest();
		request.open('POST', url, true);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		//request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		request.onload = function() {
			var body = {};
			try {
				body = JSON.parse(request.response);
			} catch(e) {}

			if(request.status == 200) {
				success(request, body);
			} else {
				error(request, body);
			}
		};
		request.onerror = function() {
			error(request, {});
		};
		var body = Object.keys(params).map(key => key + '=' + params[key]).join('&');
		request.send(body);
};	
	
	
	// Handle the redirect back from the authorization server and
	// get an access token from the token endpoint

	if(localStorage.getItem("access_token")==null) {
	var q = parseQueryString(window.location.search.substring(1));
		//alert("queryString\n\n" + window.location);
		//alert("q.error: " + q.error + "\n\n q.code: " + q.code);

	// Check if the server returned an error string
	if(q.error) {
		//alert("Error returned from authorization server: "+q.error);
		//document.getElementById("error_details").innerText = q.error+"\n\n"+q.error_description;
		//document.getElementById("error").classList = "";
		alert("Apologies, there was an error in finishing the login process. This will usually resolve if you restart the app and try logging in again");
		window.close();			
	};

	// If the server returned an authorization code, attempt to exchange it for an access token
	if(q.code) {

		//alert("we think there is a q.code");
		
		// Verify state matches what we set at the beginning
		if(localStorage.getItem("pkce_state") != q.state) {
			var returnedState = "q.state: " + q.state;
			var storedState = "stored state: " + localStorage.getItem("pkce_state");
			//alert("Invalid state\n\n" + returnedState + "\n\n" + storedState);
			alert("Apologies, there was an error in finishing the login process. This will usually resolve if you restart the app and try logging in again");
			window.close();			
		} else {
			var returnedState = "q.state: " + q.state;
			var storedState = "stored state: " + localStorage.getItem("pkce_state");
			//alert("Checking our state:\n\n" + returnedState + "\n\n" + storedState);
			// Exchange the authorization code for an access token
			//console.log('line 4575, trying to exchange auth code for access token');
			sendPostRequest(app.config.token_endpoint, {
				grant_type: "authorization_code",
				code: q.code,
				client_id: app.config.client_id,
				client_secret: app.config.client_secret,
				redirect_uri: app.config.redirect_uri,
				code_verifier: localStorage.getItem("pkce_code_verifier")
			}, function(request, body) {

				// Initialize your application now that you have an access token.
				// Here we just display it in the browser.
				//document.getElementById("access_token").innerText = body.access_token;

				//document.getElementById("token").classList = "";

				// Replace the history entry to remove the auth code from the browser address bar
				//window.history.replaceState({}, null, "/");
				
				console.log ('Getting access token');
				console.log(`Access Token: ${body.access_token}`);
				console.log(`Refresh Token: ${body.refresh_token}`);
				console.log(`Expires in ${body.expires_in} seconds`);
				
				var refresh_after = (body.expires_in * 1000)-5000;
				var token_expires = Date.now() + refresh_after;
				
				localStorage.setItem("token_expires", token_expires);
				localStorage.setItem("access_token",body.access_token);
				localStorage.setItem("refresh_token",body.refresh_token);
				//console.log('just before closing the pop up window from auth');
				
				// set a flag that lets us know that the user has just finished logging in and should be pushed to the map screen
				// this value, in conjuntion with an access_token value is what will trigger that event
				
				localStorage.setItem("firstLoginComplete",true);
				
				window.close();

			


			}, function(request, error) {
				// This could be an error response from the OAuth server, or an error because the 
				// request failed such as if the OAuth server doesn't allow CORS requests
				//alert(error.error+"\n\n"+error.error_description);
				alert("Apologies, there was an error in finishing the login process. This will usually resolve if you restart the app and try logging in again");	
				window.close();				
				//document.getElementById("error_details").innerText = error.error+"\n\n"+error.error_description;
				//document.getElementById("error").classList = "";
			});
		}

		// Clean these up since we don't need them anymore
		localStorage.removeItem("pkce_state");
		//localStorage.removeItem("pkce_code_verifier");
	};
	} else {
		// Replace the history entry to remove the auth code from the browser address bar
		//window.history.replaceState({}, null, "/");
		
		//alert("no q here");
		
		console.log('No refresh needed - our creds are:');
		console.log(`Access Token: ${localStorage.getItem("access_token")}`);	
		console.log(`Refresh Token: ${localStorage.getItem("refresh_token")}`);	
		console.log(`pkce_state: ${localStorage.getItem("pkce_state")}`);
		console.log(`pkce_code_verifier: ${localStorage.getItem("pkce_code_verifier")}`);

		
		//console.log(`Token Expires: ${localStorage.getItem("token_expires")}`);	

		console.log(`Seconds till expiration: ${time_till_expire}`);

		if(time_till_expire < 3400) {refreshToken();};
};
	
	






//-------------------------------------------
// general function for pulling API data
// the general flow is:
//  - pass in a method (GET) and an action (searchCaches)
//		- optionally pass in Lat/Lng if searching or cacheGC code if working with one cache
//  - pullFromAPI will construct the appropriate API call based on the desired action
//		- one branch here is if our Token has expired - in that case we pass
//			method and action over to the refreshToken function, refresh the token, and then 
//			come back here to try again
//  - after a response has been obtained from the API call, we then pass off to the 
//		appropriate follow up function, based on the "action" to parse and deal with the returned JSON
//
//
//  TODO: implement a status bar to let the user know things are happening while making the API call

function pullFromAPI(method,action,myLat,myLng, cacheGC) {
	
	// determine what values to pull, based on the requested action
	if (action == "searchCaches") {
		//start with search by my location
		var values = "geocaches/search?q=location: [" + myLat + "," + myLng + "]";
		
		//add on fields to return
		values = values 
		+ "&fields=referenceCode" 
		+ ",name"
		+ ",postedCoordinates"
		+ ",userData"
		+ ",geocacheType";
		
		// only pull lite data
		values = values + "&lite=true";
		
		//how many caches to return?	
		values = values + "&take=" + numCachesToLoad; 	
		
	} else if (action == "cacheDetails") {
		// pull details about a specific geocache
		// <put stuff here>
		// will also need to specify other possible actions 
	}
	
	// now construct and run the API call

	var xhr = new XMLHttpRequest({ mozSystem: true });
	var geomethod = method;	// eiher GET, POST, or DELETE most likely
	var geourl = app.rootAPIurl + values; //rootAPIurl is for staging or production URL
	
	var token = localStorage.getItem("access_token"); // pull my access token from storage
	
	if (token !== null) { // a null token means we're not logged in - will deal with that below
		//console.log('we have a token');
		xhr.open(geomethod, geourl, true);
		
		// put our token in the header to authenticate with the API
		xhr.setRequestHeader('Authorization', 'bearer ' + token); 	

		// this then listens for a change in the request call and acts appropriately
		xhr.onreadystatechange = function () {
		  var geoloadstate = xhr.readyState;
		  //console.log(`Load state: ${geoloadstate}`);
		  if (geoloadstate == 1) {
			  //console.log('request opened');
		  } else if (geoloadstate == 2) {
			//console.log('headers received'); 
		  } else if (geoloadstate == 3) {
			 // console.log('loading data');
		  } else if (geoloadstate == 4) { // means we have a response now
			var geostatus = xhr.status;
				//console.log(`status for ${action}: ${geostatus}`);
			if (geostatus >= 200 && geostatus < 400) { // we have a good response
			  var siteText = xhr.response;				
				//console.log(`response: ${siteText}`);

				//===============================================================
				// now parse the returned JSON out and send it on to the next function
				
				var apiResponse = JSON.parse(siteText);

				if (action == "searchCaches") {
					// send the list of caches on to the next function to put them in the UI
					loadCachesToList(myLat,myLng,apiResponse);
				} else if (action == "cacheDetails") {
					// send the cache detais on to the next function to load up for viewing
					
				}			
			}  else if (geostatus == 401) {
				// token has expired, refresh and tell caller to retry
				console.log('requesting a refresh of the token and then try again');
				refreshToken(method, action);
			}  else {
			// Oh no! There has been an error with the request!
			console.log("some problem in pullFromAPI function call - line 6164...");
					// turn off the loading spinner
					loadingOverlay(false);	
					//alert("There was an issue connecting to geocaching.com...");			
			}
		}
		}		
		xhr.send();	
	} else {
		getToken(method, action);

	};	
}

//--------------------------------------------------
// this function accepts a list of caches in JSON format
// and loads them up into the HTML UI cache listing
function loadCachesToList(myLat,myLng,cacheListJSON) {
	
	//first parse out the array of caches from the JSON
	var cacheArray = JSON.parse(cacheListJSON);
	CacheCount = geoCacheDetails.length;
	//console.log(`CacheCount: ${CacheCount}`);	
	
	// let the user know that we're loading things up
	kaiosToaster({
	  message: 'Loading up caches...',
	  position: 'north',
	  type: 'warning',
	  timeout: 3000
	});		
	
	// remove all the cache icon markers on the map, but only if they've been placed in the first place :) 
	if (haveAllMarkersBeenPlaced == true) {
		var arrayLength = arrayCache.length;
		for (let i = 0; i < arrayLength; i++) {
			arrayCacheMarker[i].remove();
		};
	};
	//clear out any existing caches in the array and resetting the map				
	arrayCache.length = 0;
	arrayCacheMarker.length = 0;
	showingAllCaches = "no";

	// now construct the HTML list
		+ "&fields=referenceCode" 
		+ ",name"
		+ ",postedCoordinates"
		+ ",userData"
		+ ",ownerAlias"
		+ ",geocacheType";	
	
	
	for (let i = 0; i < CacheCount; i++) {
				
		
		var CacheName = geoCacheDetails[i].name;
		// https://api.groundspeak.com/documentation#geocache-types for all cache types
		var CacheType = geoCacheDetails[i].geocacheType.id;
		var geoCode = geoCacheDetails[i].referenceCode;
		
		// use this pattern, with replacing "icon-x" with the ID
		// <use xlink:href="/play/app/ui-icons/sprites/cache-types.svg#icon-2" />
		
		
		
		

		// how far away is the cache from my current position?
		var Distance = findDistance(myLat,myLng,geoCacheDetails[i].postedCoordinates.latitude,geoCacheDetails[i].postedCoordinates.longitude)


		// figure out if the logged in user owns this cache
		var cacheOwned = false;
		if (geoCacheDetails[i].ownerAlias == myUserAlias) { cacheOwned = true; };
		
		// use this for owned caches
		// <use xlink:href="/play/app/ui-icons/sprites/cache-types.svg#icon-owned" />
		// actually need to use the entire <svg> </svg> tag body
		//   <svg class="cache-type-img" width="32" height="32">
        //                <use xlink:href="/play/app/ui-icons/sprites/cache-types.svg#icon-2" />
        //            </svg>

        //                <svg class="badge" width="18" height="18">
        //                    <use xlink:href="/play/app/ui-icons/sprites/cache-types.svg#icon-owned" />
        //                </svg>
		
		

		// figure out if the logged in user has found this cache before
		var CacheFound = "no";
		if (geoCacheDetails[i].userData.foundDate !== null) { CacheFound = "yes"; };

		// and for found caches
		// <use xlink:href="/play/app/ui-icons/sprites/cache-types.svg#icon-found" />
		
		// if disabled
		//  <use xlink:href="/play/app/ui-icons/sprites/cache-types.svg#icon-2-disabled" />
		// <use xlink:href="/play/app/ui-icons/sprites/cache-types.svg#icon-found-disabled" />
		


		var LastCache;
		if(i == CacheCount-1) {
			LastCache = "yes";
		} else {
			LastCache = "no";
		}								
		
		// now construct the necessary DIVs and such for the UI cache list
		var entry = document.createElement("div");
		entry.className = 'navItem';
		entry.tabIndex = i * 10;		

		var BadgeContent = document.createElement("span");
		BadgeContent.innerHTML = CacheBadge[0].innerHTML;
		entry.appendChild(BadgeContent);

		var headline = document.createElement("span");
		headline.innerHTML = "<b>" + CacheName + "</b><br>" + Distance;		

		entry.appendChild(headline);						
		
		listContainer.appendChild(entry);						
	}	





	
	
}


if(initialLoadofApp == "finished") {id = navigator.geolocation.watchPosition(success, error, options);};

return app;
}());

