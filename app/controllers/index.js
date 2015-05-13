'use strict';

var sampleTableData = [];

/**
 * called when user clicks on listView. The _event will provide
 * the index of the item clicked in the listView
 *
 * @param {Object} _event
 */
function listItemClicked(_event) {
    // display to console log the _event object for debugging
    Ti.API.debug(JSON.stringify(_event, null, 2));

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
var parseService = require('parseREST');

// set the API Credentials
parseService.init();

function saveSessionClicked() {
    var queryResults;
    
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
                text : element.sessionName
            },
            location : {
                text : element.sessionLocation
            }
        };
    });
    // add the items to the section in the ListView
    $.listSection.setItems(items);

}

/**
 * logging in a user and then testing some of the functionality
 * of the rest service
 */
parseService.loginUser("adminsaunders@mail.com", "password").then(function(_result) {
    console.log(JSON.stringify(_result, null, 2));
    return parseService.getObjects('TutorSession');
}).then(function(_sessions) {
    console.log("getTutorSessions: " + JSON.stringify(_sessions.response, null, 2));

    updateList(_sessions.response.results);

}, function(_error) {
    Ti.API.error('ERROR: ' + JSON.stringify(_error, null, 2));
});

Ti.App.addEventListener("parse.push.recieved", function(_event) {
    //if clicks push tray, it will take to alert list page

    OS_IOS && Titanium.UI.iPhone.setAppBadge(0);
});
// open the view
$.index.open();
