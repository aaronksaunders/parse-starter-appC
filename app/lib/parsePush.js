var parseService = require('parseREST');
// will use this for promises
var Q = require('q');

var isInForeground = true;

Ti.App.addEventListener('pause', function() {
    isInForeground = false;
});

Ti.App.addEventListener('resumed', function() {
    isInForeground = true;
});

var deviceToken;
var channels = [];
/**
 * Registers device for push notifications and then registers the device on Parse
 * with the default channels
 * @param {Array} channels
 */
function registerPush(_channels) {
    Ti.API.info("Registering device channels > " + JSON.stringify(_channels));

    //clean
    channels = [];

    //assign channel
    channels.push(_channels);

    if (OS_IOS) {

        // Check if the device is running iOS 8 or later
        if (Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {

            // Wait for user settings to be registered before registering for push notifications
            Ti.App.iOS.addEventListener('usernotificationsettings', function registerForPush() {

                // Remove event listener once registered for push notifications
                Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush);

                Ti.Network.registerForPushNotifications({
                    success : deviceTokenSuccess,
                    error : deviceTokenError,
                    callback : receivePush
                });
            });

            // Register notification types to use
            Ti.App.iOS.registerUserNotificationSettings({
                types : [Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT, Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND, Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE]
            });
        }
        // For iOS 7 and earlier
        else {
            Ti.Network.registerForPushNotifications({
                // Specifies which notifications to receive
                types : [Ti.Network.NOTIFICATION_TYPE_BADGE, Ti.Network.NOTIFICATION_TYPE_ALERT, Ti.Network.NOTIFICATION_TYPE_SOUND],
                success : deviceTokenSuccess,
                error : deviceTokenError,
                callback : receivePush
            });
        }

    } else if (OS_ANDROID) {
        // android doesnt need device token for parse
        deviceTokenSuccess();
    }
}

// Process incoming push notifications for ios
function receivePush(e) {
    Ti.API.info('Received push: ' + JSON.stringify(e));

    //if clicks push tray, it will take to alert list page
    //*******************************************************
    // REMOVE APPLICATION SPECIFIC CODE FROM LIBRARY
    /*
     if (currentUser.get("role") == "patient") {
     var alertCtrlPatient = Alloy.createController("alerts_patient").getView();
     alertCtrlPatient.left = Alloy.Globals.pW;
     alertCtrlPatient.open(Alloy.Globals.slideLeft);
     }else if(currentUser.get("role") == "others"){
     var alertCtrlOthers = Alloy.createController("alerts_patient").getView();
     alertCtrlOthers.left = Alloy.Globals.pW;
     alertCtrlOthers.open(Alloy.Globals.slideLeft);
     }else if(currentUser.get("role") == "doctor"){
     var alertCtrlDoctor = Alloy.createController("alert_patient").getView();
     alertCtrlDoctor.left = Alloy.Globals.pW;
     alertCtrlDoctor.open(Alloy.Globals.slideLeft);
     }
     */
    OS_IOS && Titanium.UI.iPhone.setAppBadge(0);

}

// Enable push notifications for this device
// Save the device token for subsequent API calls
function deviceTokenSuccess(e) {

    var registerParams = {};

    if (OS_IOS) {
        Ti.API.info("retrieved token!: " + e.deviceToken);
        deviceToken = e.deviceToken;

        //*******************************************************
        // REMOVE APPLICATION SPECIFIC CODE FROM LIBRARY
        // no alloy models code should be here!!
        registerParams = {

            body : {
                "deviceType" : "ios",
                "deviceToken" : e.deviceToken,
                "appIdentifier" : Titanium.App.id,
                "appName" : Titanium.App.name,
                "appVersion" : Titanium.App.version,
                "installationId" : Ti.Platform.createUUID(),
                "userId" : Alloy.Models.instance("user").get("objectId")
            }
        };
    } else {
        //  _params.notificationReceive - function to call when a push is recieved
        //  _params.notificationOpen - function to call when push is opened

        Ti.API.debug("registering the android device for push");

        //*******************************************************
        // REMOVE APPLICATION SPECIFIC CODE FROM LIBRARY
        // no alloy models code should be here!!
        registerParams = {
            notificationReceive : receivePush,
            body : {
                "deviceType" : "android",
                "userId" : Alloy.Models.instance("user").get("objectId")
            }
        };
    }
    parseService.registerPush(registerParams).then(function(_response) {
        Ti.API.info("IOS: parseService.registerPush -  " + JSON.stringify(_response));

        /// Storing the installation ID for later update.
        Ti.App.Properties.setString("generated.installationId", uuid);
        Ti.App.Properties.setString("parse.installationId", _response.objectId);

    }, function(_error) {
        Ti.API.error("IOS: parseService.registerPush ERROR-  " + JSON.stringify(_error));
        alert("IOS: parseService.registerPush ERROR-  " + JSON.stringify(_error));
    });

}

function deviceTokenError(e) {
    Ti.API.info('Failed to register for push notifications! ' + e.error);
    alert('Failed to register for push notifications! ' + e.error);
}


module.exports = {
    registerPush : registerPush,
}; 