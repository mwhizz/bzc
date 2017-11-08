import $ from 'jquery';
import Cookies from 'js-cookie';
import whatInput from 'what-input';

window.$ = $;

import Foundation from 'foundation-sites';
// If you want to pick and choose which modules to include, comment out the above and uncomment
// the line below
//import './lib/foundation-explicit-pieces';

$(document).foundation();

//document ready
$(function(){

  
  //set login cookie
  var security;
  if (Cookies.getJSON('security') == null) {
    Cookies.set('security', {
      username: ''
    },
    { expires: 1 });
  }
  else {
    security = Cookies.getJSON('security');
  }
  //get login details
  //https://portal.taksys.com.sg/Support/BCMain/Sec1.Login.json
  //admin1234
  console.log('username:' + security.username);

  if (security.username.trim().length>=0) {
    window.location.href = 'login.html';
  }
});

//convert date to dd/mm/yyyy
function convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
}
