//
// This is the controller for the PhotoListView, it has a matching .tss and .xml
// file which represent the styles and the presentation layer associated with
// this controller
//
// NOTE: Controllers for Tabs are all loaded when the tabGroup is opened, NOT when the
// tabs is switched to.
//

// variables passed into the controller
var args = arguments[0] || {};

// will use this for promises the same way we did in Ionic
var Q = require('q');

// http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.Cloud
// make sure you add the module in tiapp.xml
var parseService = Alloy.Globals.parseService = require('parseREST');

// using for time formatting - http://momentjs.com/
var moment = require('moment');

var utils = require('utilities');

Ti.API.info('Loaded PhotoListView Controller');

/**
 * a public function for loading the images from ACS into a view for
 * the purpose of demonstrating ListViews and ListViewTemplates
 *
 * @param {Function} _callback - used with pull to refresh to  restore
 * screen when data is done loading
 */
$.loadImages = function loadImages(_callback) {
    Ti.API.info('PhotoListView Controller: loadImages');

    utils.showIndicator();

    // call ACS to get current List of photos
    parseService.getObjects("ImageInfo", {}).then(function(_data) {
        var _photos = _data.response.results;
        Ti.API.info("_photos: " + JSON.stringify(_photos, null, 2));

        // add photos to UI
        addPhotosToListView(_photos);

    }).finally(function() {
        utils.hideIndicator();

        // indicate we are finished loading, used by
        // refreshed
        _callback && _callback();

    }, function(_error) {
        alert('Error:\n' + ((_error.error && _error.message) || JSON.stringify(_error)));
    });
};

/**
 *
 */
function addPhotosToListView(_photos) {

    // empty the list out
    $.listViewSection.deleteItemsAt(0, $.listViewSection.items.length);

    for (var i = _photos.length - 1; i >= 0; i--) {

        // _photos[i].created_at - format the date using moment library
        var convertedDate = moment(_photos[i].createdAt).format('MMMM Do YYYY, h:mm:ss a');
        var dateAndName = _photos[i].caption + " - " + convertedDate;

        var listItem = {
            properties : {
                photoObject : _photos[i]
            },
            fileName : {
                text : _photos[i].picture.name
            },
            dateCreated : {
                //text :
                text : dateAndName
            },
            template : 'listViewTemplate',
            thumbImage : {
                image : _photos[i].picture.url
            }
        };

        $.listViewSection.appendItems([listItem]);
    }
}

/**
 * called when user pulls down on list
 *
 * @param {Object} _event
 */
function refreshData(_event) {
    $.loadImages(function() {
        _event.hide();
    });
}

function listItemClicked(_event) {

    var currentItem = $.listViewSection.getItemAt(_event.itemIndex);
    var selectedObject = currentItem.properties.photoObject;

    // log for debugging purposes and convert object to
    // string that is readable
    console.log("selectedObject " + JSON.stringify(selectedObject, null, 2));

    // create the new controller and pass in the
    // model object as an argument 'item'
    var ctrl = Alloy.createController('PhotoDetail', {
        'item' : selectedObject,
        'photoListTab' : $.photoListTab
    });

    setTimeout(function() {
        $.photoListTab.open(ctrl.detailWindow);
    }, 200);
}

function addPhoto(){
	alert("Add Photo Selected");
}

// MenuItem Event, cannot be set until the menu is drawn
OS_ANDROID && ($.photoListWindow.activity.onPrepareOptionsMenu = function(e) {
	e.menu.findItem(0).addEventListener('click', addPhoto);
});

// Button Event
OS_IOS && $.addPhotoBtn.addEventListener('click', addPhoto);