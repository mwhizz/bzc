
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
            var threadContainer = '';
            $('.threadC').html('');
            for (var i=0; i<caseDetails.length; i++ ){
              //var date = convertDate(caseDetails[i].ExpiryDate);
              $('.caseTitle').html('#'+caseDetails[i].FLID+' '+caseDetails[i].Title);
              $('.organisation').html(caseDetails[i].OrganizationName);
              $('.product').html(caseDetails[i].Product);
              $('.module').html(caseDetails[i].Module);
              $('.category').html(caseDetails[i].Category);
              $('.description').html(caseDetails[i].Details);
            }
            for (var i=0; i<caseLogs.length; i++ ){
              var date = convertDate(caseLogs[i].LogCreatedDate);
              if (caseLogs[i].Internal){
                threadContainer += '<div class="thread"> <div class="top"><span class="datetime">'+date+'<i>'+caseLogs[i].LogCreatedBy+'</i></span> <span class="tag">Internal</span></div> <div class="text">'+caseLogs[i].Details+'</div> </div>';
              }else{
                threadContainer += '<div class="thread"> <div class="top"><span class="datetime">'+date+'<i>'+caseLogs[i].LogCreatedBy+'</i></span> </div> <div class="text">'+caseLogs[i].Details+'</div> </div>';
              }
            }
            $('.threadC').html(threadContainer);
          }
        }
        //alert('Success');
      }
    });
  //});
};


//convert date to dd/mm/yyyy
function convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
};
