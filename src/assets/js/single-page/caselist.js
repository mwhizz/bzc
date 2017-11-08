
$(function(){
  var caseContainer = $('#caseContainer');
  getCasesList(caseContainer,'','','','','','','');
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
  $('#caseFilter .tabBoxButtonSubmit').click(function(){
    var targetRef = $(this).parents('.tabBoxContent');
    var System, Module, DateFrom, DateTo, MyCase;
    var Status = "";
    $.each($("input[name='status']:checked"), function(){
                //Status.push($(this).val());
                Status = Status +$(this).val() + ",";
            });
    Status = Status.slice(0, -1);
    System = $('#product').val();
    Module = $('#module').val();
    DateFrom = $('#dateCreatedFrom').val();
    DateTo = $('#dateCreatedTo').val();
    MyCase = $('#statusMyCase').val();
    getCasesList(caseContainer,System,Module,Status,DateFrom,DateTo,MyCase,'');
    return false;
  });
  $('#caseAddForm .newCaseSubmitButton').click(function(){
    var Organization, Product, System, Module, Title, Details, CCEmails;
    Organization = $('#organisation').val();
    Product = $('#caseAddForm #product').val();
    System = $('#caseAddForm #system').val();
    Module = $('#caseAddForm #module').val();
    Title = $('#title').val();
    Details = $('#description').val();
    CCEmails = $('#cc').val();
    createNewCase('7', Product, System, Module, Title, Details, CCEmails, '1');
  });
});


//get case list
function getCasesList(caseContainer, System, Module, Status, DateFrom, DateTo, MyCase, LoginID){
  var caseContainerTable = caseContainer.find('table');
  var caseTbody = caseContainerTable.find('tbody');
  var data = {'LoginID':1,'System':System,'Module':Module,'Status':Status,'DateFrom':DateFrom,'DateTo':DateTo,'MyCase':MyCase};
  caseTbody.html('');
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/FL1.GetCasesList.json",
    method: "POST",
    dataType: "json",
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var cases = data.d.RetData.Tbl.Rows;
          var htmlString = '';
          for (var i=0; i<cases.length; i++ ){
            var date = convertDate(cases[i].CreatedDate);
            htmlString += '<tr id="'+ cases[i].FLID +'">';
            htmlString += '<td class="colorCodeGreen"></td>';
            htmlString += '<td>'+cases[i].Title+'</td>';
            htmlString += '<td>'+cases[i].OrganizationName+'</td>';
            htmlString += '<td>'+cases[i].ManDays+'</td>';
            htmlString += '<td>'+cases[i].Module+'</td>';
            htmlString += '<td>'+date+'</td>';
            htmlString += '<td><span class="statusNew">'+cases[i].CurStatus+'</span></td>';
            htmlString += '</tr>';
          }
          caseTbody.html(htmlString);
          console.log('click tr');
          $('.caseTable tbody tr').click(function(){
            var caseId = $(this).attr('id');
            console.log(caseId);
            var caseUrl = 'http://localhost:8000/case.html?caseID=' + caseId
            window.location.href = caseUrl;
          });
          //GetCaseDetails(caseTbody.find('tr'));
        }
      }
    }
  });
};

//Create new case
function createNewCase(Organization, Product, System, Module, Title, Details, CCEmails, LoginID){
  var data = {'Organization':Organization, 'Product':Product, 'System':System, 'Module': Module,
              'Title': Title, 'Details':Details, 'CCEmail':CCEmails, 'LoginID':1};
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/FL1.AddNewCase.json",
    method: "POST",
    dataType: "json",
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            window.close();
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
};

//convert date to dd/mm/yyyy
function convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
};
