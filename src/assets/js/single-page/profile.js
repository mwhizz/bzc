var appCookie;

$(function(){

  appCookie = Cookies.getJSON('appCookie');

  if (appCookie.personID) {
     GetBasicInformation(appCookie.personID);
  }
  $('#changeMyPwd').keyup(function(e){
    if(e.keyCode == 13){
      var NewUserName, Password;
      NewUserName = $('#NewUserName').val();
      Password = $('#NewPassword').val();
      if (checkPassword()){
        changeMyPwd(NewUserName, Password);
      }
    }
  });
  $('#changeMyPwd #submit').click(function(){
    var NewUserName, Password;
    NewUserName = $('#NewUserName').val();
    Password = $('#NewPassword').val();
    if (checkPassword()){
      changeMyPwd(NewUserName, Password);
    }
  });
});//onready

function getOrgnisationInfo(PersonID){
  var data = {'PersonID':PersonID};
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/iCtc1.GetOrganisationInfo.json",
    method: "POST",
    dataType: "json",
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var organisationInfo = data.d.RetData.Tbl.Rows[0];
          $('.orgName').html(organisationInfo.DisplayName);
          $('.idType').html(organisationInfo.EntityKeyType);
          $('.entityKey').html(organisationInfo.EntityKey);
          $('.orgContact').html(organisationInfo.Tel1);
          $('.orgEmail').html(organisationInfo.Email1);
          $('.orgAddress').html(organisationInfo.FullAddress);
        }
      }
    }
  });
};

function getPointofContact(PersonID){
  var data = {'PersonID':PersonID};
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/iCtc1.GetPointOfContactInfo.json",
    method: "POST",
    dataType: "json",
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var pointOfContact = data.d.RetData.Tbl.Rows[0];
          $('.poc1Name').html(pointOfContact.POCName);
          $('.poc1Contact').html(pointOfContact.POCContact);
          $('.poc1Email').html(pointOfContact.POCEmail);
          $('.poc1Designation').html(pointOfContact.POCDesi);
          $('.poc1Department').html(pointOfContact.POCDept);
          $('.poc2Name').html(pointOfContact.POCName1);
          $('.poc2Contact').html(pointOfContact.POCContact1);
          $('.poc2Email').html(pointOfContact.POCEmail1);
          $('.poc2Designation').html(pointOfContact.POCDesi1);
          $('.poc2Department').html(pointOfContact.POCDept1);
        }
      }
    }
  });
};

function changeMyPwd(Username, Password){
  var data = { "Username": Username, "Password": Password };
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/iCtc1.ChangeUsernamePassword.json",
    method: "POST",
    dataType: "json",
    xhrFields: {
      withCredentials: true
    },
    data: {
      'data': JSON.stringify(data),
      'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    },
    success: function(data){
      window.location = '/profile.html';
    },
    error: function(XMLHttpRequest, data, errorThrown){
      alert("Error: " + errorThrown);
    }
  })
}

function checkPassword() {
	var NewPassword = $('#NewPassword').val();
	var ConfirmPassword = $('#ConfirmPassword').val();
	if (NewPassword === '') {
		alert('New password is required.');
    return false;
	} else if (ConfirmPassword === ''){
    alert('Confirm password is required.');
    return false;
  }else if (NewPassword != ConfirmPassword) {
    alert('Two passwords do not match.');
    return false;
	}else{
    return true;
  }
}

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
      if (data.d.RetData.Tbl.Rows[0].EntityType == 'O'){
        $('#orgProfile').show();
        $('#orgContact').show();
        getOrgnisationInfo(appCookie.personID);
        getPointofContact(appCookie.personID);
      }else{
        $('#indProfile').show();
        $('.indName').html(data.d.RetData.Tbl.Rows[0].DisplayName);
        $('.indTel').html(data.d.RetData.Tbl.Rows[0].Tel1);
        $('.indMobile').html(data.d.RetData.Tbl.Rows[0].Mobile);
        $('.indEmail').html(data.d.RetData.Tbl.Rows[0].Email1);
        $('.indAddress').html(data.d.RetData.Tbl.Rows[0].FullAddress);
      }
    }
  })
  .fail(function( jqXHR, textStatus ) {
    console.log( "Login fail" );
    console.log(jqXHR);
    console.log( "Request failed: " + textStatus );
  });;
}
