/**
 // Copyright Aaron K. Saunders and other contributors. 2015
 //
 // Primarily based on work by Stephen Feather - https://gist.github.com/sfeather/4400387
 // with additions listed below
 // - added promise functionality (https://github.com/kriskowal/q), and removing callbacks
 // - added url query param support to allow for more interesting queries
 // - added promises notify to support in progress information from http request
 // - added init function to extract credentials from the library
 // - fare number of the user functions are not correct
 // - clean up parameter naming
 //
 // Permission is hereby granted, free of charge, to any person obtaining a
 // copy of this software and associated documentation files (the
 // "Software"), to deal in the Software without restriction, including
 // without limitation the rights to use, copy, modify, merge, publish,
 // distribute, sublicense, and/or sell copies of the Software, and to permit
 // persons to whom the Software is furnished to do so, subject to the
 // following conditions:
 //
 // The above copyright notice and this permission notice shall be included
 // in all copies or substantial portions of the Software.
 //
 // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 // USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Usage:
 * var Parse = require('parse');
 *
 * Parse.getObjects('myClass', '{urlParams:{}}');
 *
 * Notes: Some folks like to do their error handling/forking in the Library.
 * I don't. So I only pass one callback into each function.
 * if you want a specific error function, add another param.
 *
 * Push notification registration borrowed/modified from Matt Berg (https://gist.github.com/3761738).
 *
 */

// will use this for promises
var Q = require('q');

var baseURL = 'https://api.parse.com/1/',
    appId,
    apiRESTKey;

// Be sure to use your REST API key and NOT your master as bad stuff can happen.

function ParseClient() {

}

ParseClient.prototype.init = function(_config) {
    _config = _config || {};
    appId = _config.appId || Ti.App.Properties.getString('Parse_AppId');
    apiRESTKey = _config.apiRESTKey || Ti.App.Properties.getString('Parse_RESTAPIKey');
    if (!appId || !apiRESTKey) {
        Ti.API.error('ParseClient Missing Credentials');
        alert('ParseClient Missing Credentials');
    }
};
ParseClient.prototype.saveUserRecord = function(user) {
    Ti.App.Properties.setObject('parseUser', user);
};

ParseClient.prototype.removeUserRecord = function(user) {
    Ti.App.Properties.removeObject('parseUser', user);
};

ParseClient.prototype.setSessionToken = function(token) {
    Ti.App.Properties.setString('parseSessionToken', token);
};

ParseClient.prototype.getSessionToken = function() {
    return Ti.App.Properties.getString('parseSessionToken');
};

ParseClient.prototype.createObject = function(_class, data, callback) {
    var url = baseURL + 'classes/' + _class;
    var params = {
        method : 'POST',
        body : data
    };

    return this._request(url, params, callback);
};

ParseClient.prototype.updateObject = function(_class, _objectID, data, callback) {
    var url = baseURL + 'classes/' + _class + '/' + _objectID;
    var params = {
        method : 'PUT',
        body : data
    };

    return this._request(url, params, callback);
};

ParseClient.prototype.getObjects = function(_class, _params, callback) {
    var url = baseURL + 'classes/' + _class;
    var params = {
        method : 'GET',
        body : _params
    };

    params = _.extend(params, _params);

    return this._request(url, params, callback);
};

ParseClient.prototype.getObject = function(_class, _objectID, callback) {
    var url = baseURL + 'classes/' + _class + '/' + _objectID;
    return this._request(url, callback);
};

ParseClient.prototype.deleteObject = function(_class, _objectID, callback) {
    var url = baseURL + 'classes/' + _class + '/' + _objectID;
    var params = {
        method : 'DELETE'
    };

    return this._request(url, params, callback);
};

ParseClient.prototype.createUser = function(data, callback) {
    var url = baseURL + 'users';
    var params = {
        method : 'POST',
        body : data
    };

    function cb(success, response, code) {
        if (success === 1) {
            response = JSON.parse(response);
            parse.setSessionToken(response.sessionToken);
            callback(success, response, code);
        } else {
            callback(success, response, code);
        }
    }

    return this._request(url, params, cb);
};

ParseClient.prototype.getUsers = function(_params, callback) {
    var url = baseURL + 'users';
    var params = {
        method : 'GET',
    };

    params = _.extend(params, _params);

    return this._request(url, params, callback);
};

/**
 * @TODO - not updating saved user object
 */
ParseClient.prototype.getUser = function(_userId, callback) {
    var url = baseURL + 'users/' + _userId;
    return this._request(url, callback);
};

ParseClient.prototype.restoreUser = function() {
    var url = baseURL + 'users/me';
    return this._request(url);
};

ParseClient.prototype.loginUser = function(_username, _password) {
    var deferred = Q.defer();

    var url = baseURL + 'login?username=' + _username + '&password=' + _password;

    this._request(url, null).then(function(_response) {
        var response = _response.response;
        parse.setSessionToken(response.sessionToken);
        parse.saveUserRecord(response);
        return deferred.resolve(response);
    }, function(_error) {
        return deferred.reject(_error);
    });

    return deferred.promise;
};
ParseClient.prototype.logoutUser = function() {
    var deferred = Q.defer();

    var url = baseURL + 'logout';

    var params = {
        method : "POST"
    };

    this._request(url, params, null).then(function(_response) {
        var response = _response.response;
        parse.setSessionToken(null);
        parse.saveUserRecord(null);
        return deferred.resolve(response);
    }, function(_error) {
        return deferred.reject(_error);
    });

    return deferred.promise;
};

/**
 * @TODO - not updating saved user object
 */
ParseClient.prototype.updateUser = function(_userObject, data, callback) {
    var url = baseURL + 'users/' + _userObject;

    var params = {
        method : 'PUT',
        body : data
    };

    return this._request(url, params, callback);
};

ParseClient.prototype.deleteUser = function(_userObject, callback) {
    var url = baseURL + 'users/' + _userObject;
    var params = {
        method : 'DELETE'
    };

    return this._request(url, params, callback);
};

ParseClient.prototype.passwordReset = function(_email, callback) {
    var url = baseURL + 'requestPasswordReset';
    _email = {
        email : _email
    };

    var params = {
        method : 'POST',
        body : _email
    };

    return this._request(url, params, callback);
};

ParseClient.prototype.uploadFile = function(_contentType, _filename, _blob, callback) {

    console.log("_filename: " + _filename);

    var url = baseURL + 'files/' + _filename;
    var params = {
        method : 'POST',
        type : 'image',
        body : _blob,
        headers : {}
    };
    params.headers['Content-Type'] = _contentType;
    //Ti.API.error(params);
    return this._request(url, params, callback);
};

// -- functions below here not fully functional/tested --
// @TODO - clean this up!!

/**
 *
 *
 * Provide Callbacks for Android interaction
 *  _params.notificationReceive
 *  _params.notificationOpen
 */
ParseClient.prototype.registerPush = function(_params, callback) {

    var url = baseURL + 'installations';

    var params = {};

    if (OS_IOS) {
        return this._request(url, {
            method : "POST",
            body : _params.body
        });
    } else {

        // Android Parse Integration
        // This requires an Android Module to be included
        //  gittio install eu.rebelcorp.parse
        // or https://github.com/timanrebel/Parse/tree/master/android
        Parse = require('eu.rebelcorp.parse');

        Parse.start();

        Parse.enablePush();

        Parse.addEventListener('notificationreceive', function(e) {
            _params.notificationReceive && _params.notificationReceive(e);
        });

        Parse.addEventListener('notificationopen', function(e) {
            _params.notificationOpen && _params.notificationOpen(e);
        });

        if (_params.body.channels) {
            Ti.API.debug('Channels ' + JSON.stringify(_params.body.channels));
            _params.body.channels.map(function(_c) {
                Ti.API.debug('subscribeChannel ' + _c);
                Parse.subscribeChannel(_c);
            });
        }
        callback && callback();

        return Q.when({});
    }

};

// -- functions below here not fully functional/tested  send push notification --
// @TODO - clean this up!!
// @TODO - add support for where queries
ParseClient.prototype.sendPush = function(_params, callback) {

    var url = baseURL + 'push';

    console.log("url: " + url);
    console.log("sendPush _params: " + JSON.stringify(_params));

    var params = {
        method : "POST",
        body : {
            "channels" : _params.channel || [],
            "data" : {
                "alert" : _params.alert,
                "badge" : "Increment"
            }

        }
    };

    return this._request(url, params);
};

/**
 *
 * @param {Object} url
 * @param {Object} params
 * @param {Object} callback
 */
ParseClient.prototype._request = function(url, params, callback) {
    
    console.log(params);

    var Q = require('q');
    var deferred = Q.defer();

    if ( typeof params === 'function') {
        callback = params;
        params = {};
    }

    params = params || {};

    // Clean up the call type, defaulting to GET if no method set
    params.method = params.method || 'GET';

    params.method = params.method.toUpperCase();

    // If not specified, use a 20 second timeout
    params.timeout = ('timeout' in params) ? params.timeout : 15000;
    params.body = params.body || {};
    params.query = params.query || {};
    params.url = url || baseURL;
    //params.url += url;
    params.headers = params.headers || {};
    params.headers['X-Parse-Application-Id'] = Ti.App.Properties.getString('Parse_AppId');
    params.headers['X-Parse-REST-API-Key'] = Ti.App.Properties.getString('Parse_RESTAPIKey');
    //params.headers['X-Parse-Revocable-Session'] = 1;
    if (!params.headers['Content-Type']) {
        params.headers['Content-Type'] = 'application/json';
    }
    params.headers['Accept'] = params.headers['Accept'] || 'application/json';
    if (!('login' in params) || !params.login) {
        params.headers['X-Parse-Session-Token'] = this.getSessionToken();
    }

    // Need to clear some properties depending on method
    if ((params.method === 'GET') || (params.method === 'DELETE')) {
        params.body = null;
    } else {
        if (params.type === 'image') {
            params.body = params.body;
        } else {
            params.body = JSON.stringify(params.body);
        }
        params.query = null;
    }

    var xhr = Ti.Network.createHTTPClient({
        onsendstream : function(e) {
            //Ti.API.debug("progress: " + JSON.stringify(e));
            deferred.notify(e.progress);
        }
    });

    xhr.setTimeout(params.timeout);
    OS_ANDROID ? xhr.autoEncodeUrl = true : xhr.autoEncodeUrl = true;

    xhr.onerror = function(e) {
        Ti.API.error("error: " + JSON.stringify(e));
        callback && callback(0, xhr.responseText, xhr.status, xhr);

        return deferred.reject({
            error : xhr.responseText ? JSON.parse(xhr.responseText) : {},
            status : xhr.status
        });
    };

    xhr.onload = function(e) {
        Ti.API.info('this.responseText ' + xhr.responseText);
        callback && callback(1, xhr.responseText, xhr.status);
        return deferred.resolve({
            response : (xhr.responseText ? JSON.parse(xhr.responseText) : {}),
            status : xhr.status
        });
    };

    // @TODO find a better solution...
    // when urlparams has "where" encodeData function not working properly. 
    // Below if statement code will make this query call.
    if (params.urlparams && params.urlparams.where) {
        
        // save the where stuff
        var whereParams = params.urlparams.where;
        delete params.urlparams['where'];
        
        // encode the rest of the url
        params.url = encodeData(params.urlparams, params.url);
        
        // add the where stuff to the url
        params.url = params.url + "&" + "where=" + JSON.stringify(whereParams);
    } else {
        params.url = encodeData(params.urlparams, params.url);
    }

    Ti.API.debug('params.url: ' + params.url);
    console.log('params.url: ' + params.url);

    xhr.open(params.method, params.url);

    for (var key in params.headers) {
        xhr.setRequestHeader(key, params.headers[key]);
    }

    xhr.send(params.body);

    return deferred.promise;
};

function encodeData(_params, _url) {

    var str = [];

    for (var p in _params) {
        //str.push(Ti.Network.encodeURIComponent(p) + "=" + Ti.Network.encodeURIComponent(_params[p]));
        str.push(p + "=" + _params[p]);
    }

    if (_.indexOf(_url, "?") == -1) {
        return _url + "?" + str.join("&");
    } else {
        return _url + "&" + str.join("&");
    }
}

var parse = new ParseClient();
module.exports = parse; 