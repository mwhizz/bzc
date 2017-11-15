import $ from 'jquery';
import Cookies from 'js-cookie';
import whatInput from 'what-input';

window.$ = $;
window.Cookies = Cookies;

import Foundation from 'foundation-sites';
// If you want to pick and choose which modules to include, comment out the above and uncomment
// the line below
//import './lib/foundation-explicit-pieces';

$(document).foundation();

var pageName = "";
var appCookie;
//document ready
$(function(){
  //get page name
  pageName = getPageName();

  //set login cookie
  if (typeof Cookies.getJSON('appCookie') === 'undefined') {
    appCookie = Cookies.set('appCookie', {
    },
    { expires: 1 });
  }
  else {
    appCookie = Cookies.getJSON('appCookie');
  }

  if (!appCookie.username && pageName.toLowerCase() != 'login') {
    var pageURL = window.location;
    if (typeof Cookies.getJSON('appCookie') !== 'undefined') {
      appCookie = Cookies.getJSON('appCookie');
    }
    appCookie.redirectPage = (pageURL != '') ? pageURL : 'index.html';
    Cookies.set('appCookie', appCookie);
    window.location.href = 'login.html';
  }

  if(!appCookie.loginID){
    $('#header').hide();
  }else{
    GetBasicInformation(appCookie.personID);
  }

  $('#logOut').click(function() {
    $.ajax({
      url: "https://portal.taksys.com.sg/Support/Sec1.Logout.json",
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
      console.log( "Logout success" );
      if (typeof Cookies.getJSON('appCookie') !== 'undefined')
        Cookies.remove('appCookie');
      if (pageName != 'login') window.location.href = 'login.html';
    })
    .fail(function( jqXHR, textStatus ) {
      console.log( "Logout fail" );
      console.log(jqXHR);
      console.log( "Request failed: " + textStatus );
    });

    return false;
  });//logout

  $('.tabBoxButtonClose,.tabBoxButtonSubmit').click(function(){
    var targetRef = $(this).parents('.tabBoxContent');
    $(targetRef).hide();
    return false;
  });
  $('.tabBoxButton').click(function(){
    var targetRef = $(this).data('target');
    if (  $('#'+targetRef).is(':visible')){
      $('#'+targetRef).hide();
    }else{
      $('#'+targetRef).show();
    }
    return false;
  });

  $('.items').on('click', '.add', function () {
      var imageId = $(this).data("id");
      list.add(JSON.stringify(imageId));
      var exists = list.exists(JSON.stringify(imageId))
  });

  //toggleTitle
  var toggleTitleButton = $('<div class="button"></div>');
  $('.toggleTitle').append(toggleTitleButton);
  $('.toggleTitle').find('.button').click(function() {
    console.log('t');
    var toggleObj = $(this);
    var toggleBox = toggleObj.parents('.toggleBox');
    var toggleContent = toggleBox.find('.toggleContent');
    if (toggleObj.hasClass('toggleOpen')) {
      toggleObj.removeClass('toggleOpen');
      toggleContent.slideDown();
    }
    else {
      toggleObj.addClass('toggleOpen');
      toggleContent.slideUp();
    }
  });
});//onready

function GetBasicInformation(personID) {
  var data = {'PersonID': personID};

  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/iCtc1.GetPersonalInfo.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: {
      'data': JSON.stringify(data),
      'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    }
  }).done(function(data) {
    if ((data) && (data.d.RetData.Tbl.Rows.length > 0)) {
      if (data.d.RetData.Tbl.Rows[0].EntityType == 'O'){
        $('#navPackages').hide();
        $('#navReport').hide();
        $('#orgPnavSettingsrofile').hide();
      }
    }
  });
}

function getPageName() {
  var pageName = $('body').attr('id').replace('page-','');
  return pageName;
}
