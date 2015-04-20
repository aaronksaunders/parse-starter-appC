[![Appcelerator Titanium](http://www-static.appcelerator.com/badges/titanium-git-badge-sq.png)](http://appcelerator.com/titanium/) [![Appcelerator Alloy](http://www-static.appcelerator.com/badges/alloy-git-badge-sq.png)](http://appcelerator.com/alloy/)
____
#Appcelerator Titanium Alloy Mobile - Parse Starter Template w/REST Service

This approach differs from the previous template in that we focus on using the [Parse REST API](https://www.parse.com/docs/rest) instead of the JavaScript API. The work is is [based on work done by Stephen Feather](https://gist.github.com/sfeather/4400387) and other on creating the initial gist that I have derived the parseREST service from. I have made additional updates to the parseREST service and will continue to make changes to the application to make for a better starter template as an alternative to Appcelerator Cloud Services

Subscribe to the video channel [Beginning Appcelerator Titanium Alloy - Video Channel](https://www.youtube.com/channel/UCMCcqbJpyL3LAv3PJeYz2bg), for additional updates on this and other Appcelerator Services and Templates

###Working with Users
````Javascript
// add library to project
var parseService = require('parseREST');

// set the API Credentials
parseService.init({
    appId : '',
    apiKey : ''
});
````
Logging in a existing user; notice the integration of promises into the service to provide for a cleaner architecture
````Javascript
parseService.loginUser("aaronsaunders", "password").then(function(_result) {
    console.log(JSON.stringify(_result, null, 2));
}, function(_error){
    Ti.API.error('ERROR: ' + JSON.stringify(_error, null, 2));
});
````
If you have logged in previously, you can restore the user's session without logging in
````Javascript
parseService.restoreUser().then(function(_result) {
    console.log(JSON.stringify(_result, null, 2));
}, function(_error){
    Ti.API.error('ERROR: No session currently exists - ' + JSON.stringify(_error, null, 2));
});
````
###Working with Objects
See objects below; but querying the objects are pretty straight forward and url parameters that are documented in the [Parse REST API documentation](https://www.parse.com/docs/rest) can be passed in using the `urlparams` property on the `params` method variable
````Javascript
var _urlparams = {
    include : 'user,tutor,place', // return child objects for relationships
    limit : 5                     // only return the first 5 elements
};
var params = {
    'urlparams' : _urlparams
};
parseService.getObjects('TutorSession', params).then(function(_queryResult){
  _.each(_queryResult.response.results, function(element) {
    console.log(JSON.stringify(element));
  });
}, function(_error){
    console.log("Some Error Happened: " + JSON.stringify(_error));
});
````
####Screenshot of Users Objects
[![Appcelerator Alloy](images/parse_users.png)](http://appcelerator.com/alloy/)

####Screenshot of Places Objects
[![Appcelerator Alloy](images/parse_places.png)](http://appcelerator.com/alloy/)

####Screenshot of Tutor Sessions Objects
[![Appcelerator Alloy](images/parse_tutor_sessions.png)](http://appcelerator.com/alloy/)

----------------------------------

Appcelerator, Appcelerator Titanium and associated marks and logos are 
trademarks of Appcelerator, Inc. 

Titanium is Copyright (c) 2008-2015 by Appcelerator, Inc. All Rights Reserved.

Titanium is licensed under the Apache Public License (Version 2). Please
see the LICENSE file for the full license.

