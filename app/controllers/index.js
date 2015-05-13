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

/**
 * sample showing querying an object that has relationships
 * with other objects, this approach will return the complete
 * object for all of the fields mentioned in the include param
 *
 */
function getTutorSessions() {
    return parseService.getObjects('TutorSession', {
        urlparams : {
            include : 'user,tutor,place'
        }
    });
}

/**
 * logging in a user and then testing some of the functionality
 * of the rest service
 */
parseService.loginUser("adminsaunders@mail.com", "password").then(function(_result) {
    console.log(JSON.stringify(_result, null, 2));
    return getTutorSessions();
}).then(function(_sessions) {
    console.log("getTutorSessions: " + JSON.stringify(_sessions.response, null, 2));

    var items = _.map(_sessions.response.results, function(element) {

        return {
            properties : {
                data : element // save all attributes
            },
            // bind the labels using the bindId
            name : {
                text : element.tutor.first_name + " " + element.tutor.last_name
            },
            location : {
                text : element.place.Location + ", " + element.place.Name
            }
        };
    });
    // add the items to the section in the ListView
    $.listSection.setItems(items);

}, function(_error) {
    Ti.API.error('ERROR: ' + JSON.stringify(_error, null, 2));
});


Ti.App.addEventListener("parse.push.recieved", function(_event) {
    //if clicks push tray, it will take to alert list page


    OS_IOS && Titanium.UI.iPhone.setAppBadge(0);
});
// open the view
$.index.open();
