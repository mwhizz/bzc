var appCookie;

$(function(){

  appCookie = Cookies.getJSON('appCookie');
  console.log(appCookie);
  console.log(appCookie.personID);
  if (appCookie.personID) {

    GetBasicInformation(appCookie.personID);
  }

});//onready


function GetBasicInformation(personID) {
  var data = {
    'PersonID': personID
  }

  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/iCtc1.GetPersonalInfo.json",
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
    if ((data) && (data.d.RetData.Tbl.Rows.length > 0)) {
      $('.title').html(data.d.RetData.Tbl.Rows[0].Title);
      $('.firstName').html(data.d.RetData.Tbl.Rows[0].FirstName);
      $('.lastName').html(data.d.RetData.Tbl.Rows[0].LastName);
      $('.middleName').html(data.d.RetData.Tbl.Rows[0].MiddleName);
      $('.otherName').html(data.d.RetData.Tbl.Rows[0].OtherName);
      $('.displayName').html(data.d.RetData.Tbl.Rows[0].DisplayName);
      $('.nric').html(data.d.RetData.Tbl.Rows[0].EntityKey);
      $('.gender').html(data.d.RetData.Tbl.Rows[0].Sex);
      $('.birthdayDay').html(data.d.RetData.Tbl.Rows[0].BirthDayDD);
      $('.birthdayMonth').html(data.d.RetData.Tbl.Rows[0].BirthDayMM);
      $('.birthdayYear').html(data.d.RetData.Tbl.Rows[0].BirthDayYY);

      $('.telephone1').html(data.d.RetData.Tbl.Rows[0].Tel1);
      $('.telephone2').html(data.d.RetData.Tbl.Rows[0].Tel2);
      $('.mobile1').html(data.d.RetData.Tbl.Rows[0].Mobile1);
      $('.mobile2').html(data.d.RetData.Tbl.Rows[0].Mobile2);
      $('.email1').html(data.d.RetData.Tbl.Rows[0].Email1);
      $('.email2').html(data.d.RetData.Tbl.Rows[0].Email2);
      $('.country').html(data.d.RetData.Tbl.Rows[0].Country);
      $('.postalCode').html(data.d.RetData.Tbl.Rows[0].PostalCode);
      $('.city').html(data.d.RetData.Tbl.Rows[0].City);
      $('.state').html(data.d.RetData.Tbl.Rows[0].State);
      $('.blk').html(data.d.RetData.Tbl.Rows[0].AddrP1);
      $('.street').html(data.d.RetData.Tbl.Rows[0].AddrP3);
      $('.unit').html(data.d.RetData.Tbl.Rows[0].AddrP2);
      $('.building').html(data.d.RetData.Tbl.Rows[0].AddrP4);
    }
  })
  .fail(function( jqXHR, textStatus ) {
    console.log( "Login fail" );
    console.log(jqXHR);
    console.log( "Request failed: " + textStatus );

  });;
}
