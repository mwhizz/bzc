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



  $('.items').on('click', '.add', function () {
      var imageId = $(this).data("id");
      list.add(JSON.stringify(imageId));
      var exists = list.exists(JSON.stringify(imageId))
  });

  //set login cookie
  if (typeof Cookies.getJSON('appCookie') === 'undefined') {
    Cookies.set('appCookie', {
    },
    { expires: 1 });
  }
  else {
    appCookie = Cookies.getJSON('appCookie');
  }
  console.log(appCookie);

  //console.log(appCookie.username.length == 0 && pageName.toLowerCase() != 'login');
  if (!appCookie.username && pageName.toLowerCase() != 'login') {

    var pageURL = window.location;
    Cookies.set('appCookie', {
      redirectPage: (pageURL != '') ? pageURL : 'index.html'
    });
    window.location.href = 'login.html';
  }

  $('#logOut').click(function() {

  });
});

function getPageName() {
  var pageName = $('body').attr('id').replace('page-','');
  return pageName;

}

//convert date to dd/mm/yyyy
function convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
}
