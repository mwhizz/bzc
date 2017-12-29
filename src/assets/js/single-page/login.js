import Login from '../lib/login';

var appCookie;
var loginComponent;
var loginCallOut;

$(function(){
  //get login details
  loginComponent = $('#loginComponent');
  loginCallOut = loginComponent.find('.formCallout');

  appCookie = Cookies.getJSON('appCookie');
  //Login.checkRememberMe();

  $('#loginComponent').keyup(function(e){
    if(e.keyCode == 13){
        //Login.login();
    }
  });
  $('#submit').click(function() {
    //Login.login();
  });

  Login.login(apiSrc);
});//onready
