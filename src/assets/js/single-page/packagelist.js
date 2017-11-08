
$(function(){
    getCurrentPackageList();
});


//Get All Package List
function getPackageList(){
  var data = {'LoginID':5};
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/Ctc1.GetPackageList.json",
    method: "POST",
    dataType: "json",
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {

        }
      }
    }
  });
};

//get Current Package List
function getCurrentPackageList(){
  var data = {'LoginID':5};
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/Ctc1.GetCurrentPackages.json",
    method: "POST",
    dataType: "json",
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var packages = data.d.RetData.Tbl.Rows;
          var htmlString = '';
          for (var i=0; i<packages.length; i++ ){
            var date = convertDate(packages[i].ExpiryDate);
            htmlString += '<div class="medium-6 large-4 cell clearfix"> <div class="card"> <div class="grid-x card-divider"> <div class="cell auto">'
						htmlString +=	'<h3 class="colorCodeGreen">'+packages[i].Product+'</h3>'
            if (packages[i].System.length > 0) {
              htmlString +=	'<ul class="system">'
  						htmlString +=	'<li>'+packages[i].System+'</li>'
  						htmlString +=	'</ul>'
            }
            htmlString +=	'</div>'
            if (packages[i].ManDaysLeft > 0) {
              htmlString += '<div class="manDays cell small-4"> <div class="grid-y" style="height: 60px;">'
              htmlString += '<div class="cell small-9"><b>'+packages[i].ManDaysLeft+'</b>/<span class="totalDays">'+packages[i].BoughtManDays+'</span></div> <small class="cell small-3">Man Days</small> </div> </div>'
            }
            htmlString += '</div><!--card-divider--> <div class="card-section">'
						htmlString +=	'<div class="packageType">'+packages[i].Type+'</div>'
						htmlString +=	'<div class="expiring">Expiring: <i>'+date+'</i></div>'
						htmlString += '</div> <!--card-section--></div> <!--card--></div> <!--cell-->'
          }
          $('.packageGrid').append(htmlString);
        }
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
