Alloy.Globals.tabGroup = $.index;

function doWindowOpen(evt) {

    if (OS_IOS) {
        return;
    }

    var activity = evt.source.getActivity();

    activity.onCreateOptionsMenu = function(e) {
        var item,
            menu;
        menu = e.menu;
        menu.clear();

        switch(Alloy.Globals.currentTab) {
        // case photoList
        case 1:
            item2 = e.menu.add({
                title : "Add",
                showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
                icon : Ti.Android.R.drawable.ic_menu_camera
            });
            item2.addEventListener("click", function(e) {
                $.photoListView.addPhoto();
            });

            break;
        }
    };

    Alloy.Globals.tabGroup.addEventListener("focus", function(evt) {
        if ( typeof evt.index !== "undefined") {
            activity.invalidateOptionsMenu();
            Alloy.Globals.currentTab = evt.index;
        }
    });
}

/**
 * called when user clicks on listView. The _event will provide
 * the index of the item clicked in the listView
 *
 * @param {Object} _event
 */
function listItemClicked(_event) {

    // get data using index provided, the items are in the section
    // so we use the index against the section, not the listView
    var currentItem = $.listSection.getItemAt(_event.itemIndex);

    // we save the data as a property so that is how we access
    // the data, we do not need the data array in this case
    var sessionInfo = currentItem.properties.data;

    // now display the data
    alert("clicked on " + JSON.stringify(sessionInfo, null, 2));
}

// lets get some real data!!
Alloy.Globals.parseService = require('parseREST');

// set the API Credentials
Alloy.Globals.parseService.init();

var parseService = Alloy.Globals.parseService;

function saveSessionClicked() {
    var queryResults;

    alert("WIP");
    return;

    parseService.createObject('TutorSession', {
        sessionName : $.sessionName.value,
        sessionLocation : $.sessionLocation.value
    }).then(function(_queryResult) {
        console.log("Success Happened: " + JSON.stringify(_queryResult));
        queryResults = _queryResult;
        return parseService.getObjects('TutorSession');
    }).then(function(_sessions) {
        updateList(_sessions.response.results);
    }, function(_error) {
        console.log("Some Error Happened: " + JSON.stringify(_error));
    });
}

function updateList(_data) {
    var items = _.map(_data, function(element) {

        return {
            properties : {
                data : element // save all attributes
            },
            // bind the labels using the bindId
            name : {
                text : element.tutor.email
            },
            location : {
                text : element.place.Location + "-" + element.place.Name
            }
        };
    });
    // add the items to the section in the ListView
    $.listSection.setItems(items);

}

function whereQueryExample() {

    // find all tutoring sessions that are being done by
    // the tutors with the specified ids
    var whereQueryStr = {
        "tutor" : {
            "$inQuery" : {
                "where" : {
                    "objectId" : {
                        "$in" : ["SCV3V0GqRr", "9uKbg0Hzeb"]
                    }
                },
                "className" : "_User"
            }
        }
    };

    return parseService.getObjects('TutorSession', {
        "urlparams" : {
            "include" : "user,tutor,place",
            "where" : whereQueryStr
        }
    });
}

//
// check to see if we have a user account saved
//

/**
 *
 */
function userNotLoggedIn() {
    // display login information
    var ctrl = Alloy.createController('UserManagement', {
        callback : function(_user) {

            if (!_user.error) {
                doLoginSuccess();

                // close the old window
                ctrl.getView().close();
                ctrl = nil;

            } else {
                alert("Login Error " + _user.error);
            }
        }
    });

    ctrl.getView().open();
}

/**
 * logging in a user and then testing some of the functionality
 * of the rest service
 */

function doLoginSuccess() {
    whereQueryExample().then(function(_sessions) {
        console.log("getTutorSessions: " + JSON.stringify(_sessions.response, null, 2));

        updateList(_sessions.response.results);

        // set the title on the logout/login button
        $.logoutBtn.title = "Logout";

        // open the main view of index.js, which is the tab
        $.index.open();

    }, function(_error) {
        Ti.API.error('ERROR: ' + JSON.stringify(_error, null, 2));
        alert("Error Loading Data\n" + _error.error);

    });
}

function loginUser() {
    return parseService.loginUser("aaronsaunders", "password").then(function(_result) {
        console.log("logged in user successfully: " + JSON.stringify(_result, null, 2));
        return doLoginSuccess();
    }, function(_error) {
        Ti.API.error('ERROR: ' + JSON.stringify(_error, null, 2));
        alert("Check Your Username/Password\n" + _error.error.error);

        // set the title on the logout/login button
        $.logoutBtn.title = "Login";
    });
}


parseService.restoreUser().then(function(_result) {
    console.log("restored user successfully: " + JSON.stringify(_result, null, 2));
    return doLoginSuccess();
}, function(_error) {
    Ti.API.error('ERROR: ' + JSON.stringify(_error, null, 2));
    console.log("no  user found" + _error.error);

    // set the title on the logout/login button
    $.logoutBtn.title = "Login";

    userNotLoggedIn();
});

// Logout Button Handler
$.logoutBtn.addEventListener('click', doLogout);

function doLogout() {
    parseService.logoutUser().then(function(_result) {
        console.log("logged out user successfully: " + JSON.stringify(_result, null, 2));

        // set the title on the logout/login button
        $.logoutBtn.title = "Login";
        
        // display login screen
        userNotLoggedIn();

    }, function(_error) {
        Ti.API.error('ERROR: ' + _error.error);
        alert("Error Logging Out User\n" + _error.error.error);
    });
}

//
// PLACE HOLDER PUSH NOTIFICATION CODE
//
Ti.App.addEventListener("parse.push.recieved", function(_event) {
    //if clicks push tray, it will take to alert list page

    OS_IOS && Titanium.UI.iPhone.setAppBadge(0);
});
