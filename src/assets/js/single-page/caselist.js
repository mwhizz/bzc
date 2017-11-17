
$(function(){
  //get cookie
  var appCookie = Cookies.getJSON('appCookie');
  //get loginid
  var loginID = appCookie.loginID;

  GetDropdownList('#caseAddForm #module, #caseFilter #module', 'module');
  GetDropdownList('#caseAddForm #product', 'Product');
  GetDropdownList('#caseAddForm #system, #caseFilter #system', 'system');

  GetBasicInformation(appCookie.personID);
  var caseContainer = $('#caseContainer');
  getCasesList(caseContainer, loginID);

  $('#addAttachment').click(function(){
    $('#attachments').show();
    $('#addAttachment').hide();
  });

  $('#caseFilter .tabBoxButtonSubmit').click(function(){
    getCasesList(caseContainer, loginID);
    return false;
  });
  $('#caseAddForm .newCaseSubmitButton').click(function(){
    createNewCase(loginID);
  });
});

//get case list
function getCasesList(caseContainer, LoginID){
  var caseContainerTable = caseContainer.find('table'), caseTbody = caseContainerTable.find('tbody');

  var System, Status='', Module, DateFrom, DateTo, MyCase=0;
  $.each($("input[name='status']:checked"), function(){
    //Status.push($(this).val());
    Status = Status +$(this).val() + ",";
  });
  Status = Status.slice(0, -1);
  System = $('#system').val();
  Module = $('#module').val();
  DateFrom = $('#dateCreatedFrom').val();
  DateTo = $('#dateCreatedTo').val();
  if($('#statusMyCase').prop("checked") == true){
    MyCase = 1;
  }

  var data = {'LoginID':LoginID,'System':System,'Module':Module,'Status':Status,'DateFrom':DateFrom,'DateTo':DateTo,'MyCase':MyCase};
  caseTbody.html('');
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/FL1.GetCasesList.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var cases = data.d.RetData.Tbl.Rows;
          var htmlString = '';
          for (var i=0; i<cases.length; i++ ){
            var date = convertDateTime(cases[i].CreatedDate,'date');
            htmlString += '<tr id="'+ cases[i].FLID +'">';
            if (cases[i].CurStatus=='New' || cases[i].CurStatus=='Progressing' ){
              htmlString += '<td class="colorCodeActive"></td>';
            }else if (cases[i].CurStatus=='Reviewed' || cases[i].CurStatus=='Reviewed & Pending Quote'){
                htmlString += '<td class="colorCodePending"></td>';
            }else{
              htmlString += '<td class="colorCodeNonActive"></td>';
            }
            htmlString += '<td>'+cases[i].Title+'</td>';
            htmlString += '<td>'+cases[i].OrganizationName+'</td>';
            htmlString += '<td>'+cases[i].System+'</td>';
            htmlString += '<td>'+cases[i].ManDays+'</td>';
            htmlString += '<td>'+cases[i].Module+'</td>';
            htmlString += '<td>'+date+'</td>';
            htmlString += '<td><span class="statusNew">'+cases[i].CurStatus+'</span></td>';
            htmlString += '</tr>';
          }
          caseTbody.html(htmlString);
          $('.caseTable tbody tr').click(function(){
            var caseId = $(this).attr('id');
            var caseUrl = '/Ticketing/case.html?caseID=' + caseId
            window.location.href = caseUrl;
          });
        }
      }
    }
  });
};

//Create new case
function createNewCase(LoginID){
  var Organization, Product, System, Module, Title, Details, CCEmails;
  Organization = $('#caseAddForm #organisation').val();
  Product = $('#caseAddForm #product').val();
  System = $('#caseAddForm #system').val();
  Module = $('#caseAddForm #module').val();
  Title = $('#title').val();
  Details = $('#description').val();
  CCEmails = $('#cc').val();

  var data = {'Organization':Organization, 'Product':Product, 'System':System, 'Module': Module, 'Title': Title, 'Details':Details, 'CCEmail':CCEmails, 'LoginID':LoginID};
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/FL1.AddNewCase.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            getCasesList($('#caseContainer'),LoginID);
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
};

function GetBasicInformation(personID) {
  var data = {'PersonID': personID}

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
      $('.profileName').html(data.d.RetData.Tbl.Rows[0].DisplayName);
    }
  });
}

//convert date to dd/mm/yyyy
function convertDateTime(inputFormat, type) {
  if (inputFormat == null){
    return '-';
  };
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  if (type == 'date'){
    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
  }else if (type == 'datetime'){
    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/') + ' ' + [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  }else if (type == 'time'){
    return [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  }
};

function GetDropdownList(id, category) {
  var data = {'LookupCat': category}
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/iCtc1.Lookup_Get.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: {
      'data': JSON.stringify(data),
      'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    }
  })
  .done(function(data) {
    if ((data) && (data.d.RetVal === -1)) {
      if (data.d.RetData.Tbl.Rows.length > 0) {
        var lookup = data.d.RetData.Tbl.Rows;
        for (var i=0; i<lookup.length; i++ ){
          $(id).append('<option value="'+lookup[i].LookupKey+'">'+lookup[i].Description+'</option>');
        }
      }
    }
  });
};
