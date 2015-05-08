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
var userId = null;

/**
 * Registers device for push notifications and then registers the device on Parse
 * with the default channels
 * @param {Array} channels
 * @params {String} _userId
 */
function registerPush(_channels, _userId) {
    Ti.API.info("Registering device channels > " + JSON.stringify(_channels));

    // UserId is required parameter for associating the Parse Installation
    // Object. We use the user id so we are able to send push notifications
    // to specific users.
    if (!_userId) {
        throw "Cannot Register Push Notifications without User Id";
        return;
    }
    
    
    //clean
    channels = [];

    // set user id which is used with the parse Installation Object
    userId = _userId;

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

    Ti.App.fireEvent("parse.push.recieved", e);

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
                "userId" : userId
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
                "userId" : userId
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
