
$(function(){
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('caseID')){
    GetCaseDetails(urlParams.get('caseID'));
  }
});


//Get Case Details
//function GetCaseDetails(caseContainerRow){
function GetCaseDetails(caseId){
  //caseContainerRow.click(function(){
    //var caseId = $(this).attr('id');
    //window.location.href = 'http://localhost:8000/case.html'
    $.ajax({
      url: "https://portal.taksys.com.sg/Support/BCMain/FL1.GetCaseDetailsBySection.json",
      method: "POST",
      dataType: "json",
      data: {'data':JSON.stringify({'LoginID':1,'Section':'Full','FLID':caseId}),
            'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
            'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
      success: function(data){
        if ((data) && (data.d.RetVal === -1)) {
          if (data.d.RetData.Tbls[0].Rows.length > 0) {
            var caseDetails = data.d.RetData.Tbls[0].Rows;
            var caseLogs = data.d.RetData.Tbls[1].Rows;
            var caseInvolvements = data.d.RetData.Tbls[2].Rows;
            var caseAttachments = data.d.RetData.Tbls[3].Rows;
            var threadContainer = ''; var involvementContainer = '';
            var caseAttachmentsContainer = '';
            $('.threadLog').html('');$('.threadTask').html('');$('.attachments').html('');
            for (var i=0; i<caseDetails.length; i++ ){
              var datetime = convertDateTime(caseDetails[i].CreatedDate);
              $('.caseTitle').html('#'+caseDetails[i].FLID+' '+caseDetails[i].Title + '<small onclick="window.location.reload()"><A> Review</A></small>');
              $('.status').html(caseDetails[i].CurStatus);
              $('.category').html(caseDetails[i].Category);
              $('.organisation').html(caseDetails[i].OrganizationName);
              $('.caseCreatedBy').html(caseDetails[i].CaseCreatedBY);
              $('.createdDate').html(datetime);
              $('.propDuration').html(caseDetails[i].ManDays);
              $('.cc').html(caseDetails[i].CCEmails);
              $('.organisation').html(caseDetails[i].OrganizationName);
              $('.product').html(caseDetails[i].Product);
              $('.module').html(caseDetails[i].Module);
              $('.description').html(caseDetails[i].Details);
            }
            for (var i=0; i<caseAttachments.length; i++ ){
              caseAttachmentsContainer += '<img width="10%" height="10%" src="https://portal.taksys.com.sg/Support/'+caseAttachments[i].FullPath+'" alt=""/>'
            }
            for (var i=0; i<caseLogs.length; i++ ){
              var date = convertDate(caseLogs[i].LogCreatedDate);
              var time = convertTime(caseLogs[i].LogCreatedDate);
              if (caseLogs[i].Internal){
                threadContainer += '<div class="thread"> <div class="top"><span class="datetime">'+date+'<i> '+time+'</i></span> <span class="tag">Internal</span></div> <div class="text">'+caseLogs[i].Details+'</div> </div>';
              }else{
                threadContainer += '<div class="thread"> <div class="top"><span class="datetime">'+date+'<i> '+time+'</i></span> </div> <div class="text">'+caseLogs[i].Details+'</div> </div>';
              }
            }
            for (var i=0; i<caseInvolvements.length; i++ ){
              var date = convertDate(caseInvolvements[i].CreatedDate);
              var time = convertTime(caseInvolvements[i].CreatedDate);
              involvementContainer = '<div class="thread"> <div class="top"><span class="datetime">'+date+'<i> '+time+'</i></span></div> <div class="text">'+caseInvolvements[i].RolePerson+' ('+caseInvolvements[i].RoleName+'): '+caseInvolvements[i].Remarks+'</div> </div>'
            }
            $('.threadLog').html(threadContainer);
            $('.threadTask').html(involvementContainer);
            $('.attachments').html(caseAttachmentsContainer);
          }
        }
        //alert('Success');
      }
    });
  //});
};


//Add New Log
function createNewLog(FLID, ActionType, Status, Details, Duration, Internal, LoginID){
  //get FLID from url???
  var data = {'FLID':FLID, 'ActionType':ActionType, 'Status':Status, 'Details': Details,
              'Duration': Duration, 'Internal':Internal, 'LoginID':1};
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/FL1.InsertActivityLog.json",
    method: "POST",
    dataType: "json",
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            alert('Add Successful')
            //window.close();
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
};

//Add Involvements
function addInvolvement(FLID, RoleName, RoleID, Details, LoginID){
  //get FLID from url???
  var data = {'FLID':FLID, 'RoleName':RoleName, 'RoleID':RoleID, 'Details': Details, 'LoginID':1};
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/FL1.AddInvolvement.json",
    method: "POST",
    dataType: "json",
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            alert('Add Successful')
            //window.close();
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
};

//Review Case
function reviewCase(FLID, ManDays, Category, ProposedManDays, IntTargetEndDate, TargetEndDate, LoginID){
  //get FLID from url???
  var data = {'FLID':FLID, 'ManDays':ManDays, 'Category':Category, 'ProposedManDays': ProposedManDays,
  'IntTargetEndDate': IntTargetEndDate,'TargetEndDate': TargetEndDate, 'LoginID':1};
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/FL1.ReviewCase.json",
    method: "POST",
    dataType: "json",
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            alert('Add Successful')
            //window.close();
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

function convertDateTime(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/') + ' ' + [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
};

function convertTime(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  return [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
};
