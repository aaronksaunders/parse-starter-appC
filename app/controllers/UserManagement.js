var args = arguments[0] || {};
// function to call after login or user created
var callback = args.callback;

var parseService = Alloy.Globals.parseService;

/**
 *
 */
function handleForgotPasswordClick(_event) {

	// check for email address
	if (!$.login_email.value) {
		alert("You Must Enter Email Address");
		return;
	}

	// if we have email address then take action
	parseService.passwordReset($.login_email.value).then(function(_response) {
		alert("Email with instructions sent - " + $.login_email.value);
	}, function(_errorResponse) {
		var errorMsg = JSON.stringify(_errorResponse);
		alert(_errorResponse.error.error);
	});
}

/**
 *
 */
function handleLoginClick(_event) {

	Ti.API.debug('clicked: ' + _event.source.id);

	return parseService.loginUser($.login_email.value, $.login_password.value).then(function(_result) {
		console.log("logged in user successfully: " + JSON.stringify(_result, null, 2));
		// Do stuff after successful login.
		Alloy.Globals.loggedIn = true;
		Alloy.Globals.CURRENT_USER = _result;
		callback && callback(_result);
	}, function(_error) {
		var errorMsg = JSON.stringify(_error);
		alert(_error.message);
		Ti.API.error('Error: ' + errorMsg);
		callback && callback({
			error : _error
		});
	});
}

/**
 *
 */
function handleShowAcctClick(_event) {

	Ti.API.debug('clicked: ' + _event.source.id);

	var animation = require('alloy/animation');

	// when move the create account screen into view
	var moveToTop = Ti.UI.createAnimation({
		top : '0dp',
		duration : 1
	});
	$.createAcctView.animate(moveToTop, function() {

		// now cross fade
		animation.crossFade($.loginAcctView, $.createAcctView, 500, function() {
			// when done animating, move the view off screen
			var moveToBottom = Ti.UI.createAnimation({
				top : '500dp',
				duration : 1
			});
			$.loginAcctView.animate(moveToBottom);
		});
	});
}

/**
 *
 */
function handleCreateAccountClick() {
	if ($.acct_password.value !== $.acct_password_confirmation.value) {
		alert("Please re-enter information");
		return;
	}
	var params = {
		first_name : $.acct_fname.value,
		last_name : $.acct_lname.value,
		username : $.acct_email.value,
		email : $.acct_email.value,
		user_type : "student",
		password : $.acct_password.value,
		password_confirmation : $.acct_password_confirmation.value,
	};

	parseService.createUser(params).then(function(_model) {
		// Do stuff after successful creation of user.
		Alloy.Globals.loggedIn = true;
		Alloy.Globals.CURRENT_USER = _model;
		callback && callback(_model);
	}, function(_errorResponse) {
		alert(_errorResponse.error.error);
		Ti.API.error('Error: ' + JSON.stringify(_errorResponse.error));
	});
};

/**
 *
 * @param {Object} _event
 */
function handleShowLoginClick(_event) {

	Ti.API.debug('clicked: ' + _event.source.id);

	var animation = require('alloy/animation');

	// when move the login screen into view
	var moveToTop = Ti.UI.createAnimation({
		top : '0dp',
		duration : 1
	});
	$.loginAcctView.animate(moveToTop, function() {

		// now cross fade
		animation.crossFade($.createAcctView, $.loginAcctView, 500, function() {
			// when done animating, move the view off screen
			var moveToBottom = Ti.UI.createAnimation({
				top : '500dp',
				duration : 1
			});
			$.createAcctView.animate(moveToBottom);
		});
	});
}