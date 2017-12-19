import $ from 'jquery';
import Cookies from 'js-cookie';
import whatInput from 'what-input';

window.$ = $;
window.Cookies = Cookies;
window.pageName ='';
window.apiSrcURL = 'https://portal.taksys.com.sg/Support/';
window.apiSrc='';

import Foundation from 'foundation-sites';
// If you want to pick and choose which modules to include, comment out the above and uncomment
// the line below
//import './lib/foundation-explicit-pieces';

$(document).foundation();

var appCookie, igwasCookie;

//document ready
$(function(){
  //get page name
  pageName = getPageName();
  window.apiSrc = getApiSrc();
  var guid = getGUID();

  //set login cookie
  if (typeof Cookies.getJSON('appCookie') === 'undefined') {
    appCookie = Cookies.set('appCookie', {
    },
    { expires: 1 });
  }
  else {
    appCookie = Cookies.getJSON('appCookie');
    igwasCookie = Cookies.getJSON('IGWAS');
    var a = getCookie(igwasCookie, 'WebPartKey');
  }

  if (!appCookie.username && pageName.toLowerCase() != 'login') {
    var pageURL = window.location;
    if (typeof Cookies.getJSON('appCookie') !== 'undefined') {
      appCookie = Cookies.getJSON('appCookie');
    }
    appCookie.redirectPage = (pageURL != '') ? pageURL : 'index.html';
    Cookies.set('appCookie', appCookie);
    window.location.href = '/login.html';
  }

  if(appCookie.loginID){
    GetBasicInformation(appCookie.personID);
  }

  $('#logOut').click(function() {
    $.ajax({
      url: apiSrc+"Sec1.Logout.json",
      method: "POST",
      dataType: "json",
      xhrFields: { withCredentials: true },
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
      if (pageName != 'login') window.location.href = '/login.html';
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
    var targetRefId = targetRef.prop('id');


    $('.tabBoxButton').filter(
        function() {
          return $(this).data('target')==targetRefId;
        }).removeClass('tabBoxButtonOpen');
    //console.log('hiude');
    return false;
  });
  $('.tabBoxButton').click(function(){
    var targetRef = $(this).data('target');
    if (  $('#'+targetRef).is(':visible')){
      $('#'+targetRef).hide();
      $(this).removeClass('tabBoxButtonOpen');
      console.log('hiude');
    }else{
      $('#'+targetRef).show();
      $(this).addClass('tabBoxButtonOpen');
      console.log('add');
    }
    return false;
  });

  $('.items').on('click', '.add', function () {
      var imageId = $(this).data("id");
      list.add(JSON.stringify(imageId));
      var exists = list.exists(JSON.stringify(imageId))
  });

  //toggleTitle
  var toggleTitleButton = $('<button class="toggleTitleButton"></button>');
  $('.toggleTitle').append(toggleTitleButton);
  $('.toggleTitle').find('.toggleTitleButton').click(function() {
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

  //editLinkForm
  $('.editLinkForm').each(function() {
    var $this = $(this);
    var target = $this.data('content');
    var content = $('#'+target+'Content');
    var form = $('#'+target+'Form');
    var defaultText = (typeof $this.data('text') !== 'undefined' && $this.data('text').length) ? '['+$this.data('text')+']' : '[edit]' ;

    $this.html(defaultText);
    content.show();
    form.hide();

    $this.click(function() {
      var $this = $(this);
      var target = $this.data('content');
      var content = $('#'+target+'Content');
      var form = $('#'+target+'Form');

      if(form.is(':visible')) {
        $this.html(defaultText);
        content.show();
        form.hide();
        $('html, body').animate({
          scrollTop: content.offset().top
        }, 500);
      }
      else {
        $this.html('[cancel]');
        content.hide();
        form.show();
        $('html, body').animate({
          scrollTop: form.offset().top
        }, 500);
      }
    });
  });//editLinkForm

  //set normal hyperlink to open new window if its external domain
  $('a').click(function() {
    var href = $(this).attr('href');
    var host = window.host;
    if( location.hostname === this.hostname || !this.hostname.length ) {
      window.location.href = href;
    }
    else
      window.open(href,'','');

    return false;
  });
});//onready

function GetBasicInformation(personID) {
  var data = {'PersonID': personID};
  $.ajax({
    url: apiSrc+"/BCMain/iCtc1.GetPersonalInfo.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: {
      'data': JSON.stringify(data),
      'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    },
    success: function(data){
      if ((data) && (data.d.RetData.Tbl.Rows.length > 0)) {
        $('.profileName').html(data.d.RetData.Tbl.Rows[0].DisplayName);
        if (data.d.RetData.Tbl.Rows[0].EntityType == 'I'){
          $('#navPackages').show();
          $('#navReport').show();
          $('#navSettings').show();
          $('#packages').hide();
        }else{
          $('#caseFilter .orgCell').hide();
          $('#caseFilter #statusMyCase, #caseFilter .mycase').hide();
        }
      }
    },
    error: function(XMLHttpRequest, data, errorThrown){
      Cookies.remove('appCookie');
      document.location.reload();
    }
  })
}

function getApiSrc(){
  //var targetURL = 'https://portal.taksys.com.sg/Support/';
  /*
  var _location = document.location.toString();
  var applicationNameIndex = _location.indexOf('/', _location.indexOf('://') + 3);
  var applicationName = _location.substring(0, applicationNameIndex) + '/';
  var webFolderIndex = _location.indexOf('/', _location.indexOf(applicationName) + applicationName.length);

  var appNameIndex = _location.indexOf('/', applicationNameIndex + 1);
  var appName = _location.substring(applicationNameIndex, appNameIndex) + '/';
  var webFolderFullPath = _location.substring(0, applicationNameIndex);
  */
  var hostname = window.location.hostname;

  if (hostname.match(/localhost/)){
    return apiSrcURL;
  }
  else {
    return '/';
  }
}

function getCookie(cookie, cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(cookie);
    var ca = decodedCookie.split('&');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function getGUID() {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
		return uuid;
	};

function getPageName() {
  var pageName = $('body').attr('id').replace('page-','');
  return pageName;
}

class Rectangle {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}


export default Rectangle;
