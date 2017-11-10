var appCookie;
var loginComponent;
var loginCallOut;
$(function(){

  //get login details
  loginComponent = $('#loginComponent');
  loginCallOut = loginComponent.find('.formCallout');

  appCookie = Cookies.getJSON('appCookie');
  console.log(appCookie);

  $('#submit').click(function() {
    login();
  });
  //console.log(appCookie);
});//onready

function login() {
  var data = {
    'Username': $('#username').val(),
    'Password': $('#password').val(),
    'RememberMe':  $('#rememberMe').is(':checked')
  };

  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/Sec1.Login.json",
    method: "POST",
    dataType: "json",
    xhrFields: {
      withCredentials: true
    },
    data: {
      'data': JSON.stringify(data),
      'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    }
  })
  .done(function(data) {
    console.log( "login success" );
    var getLoginInfo =
      $.ajax({
        url: "https://portal.taksys.com.sg/Support/BCMain/Sec1.LoginInfo.json",
        method: "POST",
        dataType: "json",
        xhrFields: {
          withCredentials: true
        },
        data: {
          'data': {},
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
        }
      })
      .done(function(data) {
        console.log( "getLoginInfo success" );
      })
      .fail(function( jqXHR, textStatus ) {
        console.log( "Get ID fail" );
        console.log(jqXHR);
        console.log( "Request failed: " + textStatus );
      });

    var getOwnPersonID =
      $.ajax({
        url: "https://portal.taksys.com.sg/Support/iCtc1.GetOwnPersonID.json",
        method: "POST",
        dataType: "json",
        xhrFields: {
          withCredentials: true
        },
        data: {
          'data': {},
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
        }
      })
      .done(function(data) {
        console.log( "getOwnPersonID success" );

      })
      .fail(function( jqXHR, textStatus ) {
        console.log( "Get ID fail" );
        console.log(jqXHR);
        console.log( "Request failed: " + textStatus );
      });
    $.when(getLoginInfo, getOwnPersonID).done(function(action1, action2) {
      // Handle both XHR objects
      var dataReturned1 = action1[0].d.RetData;
      var dataReturned2 = action2[0].d.RetData.Tbl.Rows[0];
      console.log(dataReturned1);
      console.log(dataReturned2);
      Cookies.set('appCookie', {
        username: dataReturned1.Username,
        dispName: dataReturned1.DispName,
        loginID: dataReturned1.LoginID,
        //personID: dataReturned2.PersonID
      });
      console.log(appCookie);
        if (appCookie.redirectPage)
          window.location.href = appCookie.redirectPage;
        else
          window.location.href = 'index.html';

    });


  })
  .fail(function( jqXHR, textStatus ) {
    console.log( "Login fail" );
    console.log(jqXHR);
    console.log( "Request failed: " + textStatus );
    loginCallOut.addClass('warn').html('Login fail.').show();
  });
}
