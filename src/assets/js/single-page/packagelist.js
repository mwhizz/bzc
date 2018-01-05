
$(function(){

  //get cookie & LoginID
  var appCookie = Cookies.getJSON('appCookie'),
      loginID = appCookie.loginID;
  //get packageID from url
  var urlParams = new URLSearchParams(window.location.search),
      packageID = urlParams.get('packageID');
  //get page name
  var pageName = getPageName();
  if (pageName == 'packages'){
    getPackageList();
  }else if (pageName == 'packageDetails'){
    if (packageID){
      getPackageDetails(packageID)
    }
  }else{
    if (loginID!=1){
      $('#packages').show();
    };
    getCurrentPackageList();
  }
  getOrgnaisationList();
  GetDropdownList('#packageFilter #product, #packageAddForm #product', 'Product');
  GetDropdownList('#packageAddForm #system', 'System');
  GetDropdownList('#packageAddForm #type', 'SupportPackageType');

  //filter
  $('#packageFilter .tabBoxButtonSubmit').click(function(){
    getPackageList();
  });
  //add package
  $('#packageAddForm #submit').click(function(){
    addNewPackage();
  });
  //add transaction
  $('#packageTransactionAddForm #submit').click(function(){
    addNewtransaction(packageID, '');
  });
});

function addNewPackage(){
  var RoleID, Type, Product, System, BoughtManDays, Status, StartDate, ExpiryDate;
  RoleID = $('#packageAddForm #organisation').val();
  Type =  $('#packageAddForm #type').val();
  Product = $('#packageAddForm #product').val();
  System = $('#packageAddForm #system').val();
  BoughtManDays = $('#packageAddForm #manDays').val();
  StartDate = $('#packageAddForm #packageStartDate').val();
  ExpiryDate = $('#packageAddForm #packageExpiryDate').val();

  var data = {'RoleID':RoleID, 'Type':Type, 'Product':Product, 'System': System, 'BoughtManDays': BoughtManDays, 'StartDate':StartDate, 'ExpiryDate':ExpiryDate};
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.AddNewPackage.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
            'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277' },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            getPackageList();
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
}

//Get All Package List
function getPackageList(){
  var Organization, Product, Status='', DateFrom, DateTo;
  Organization = $('#packageFilterForm #organisation').val();
  Product = $('#packageFilterForm #product').val();
  if($('#status').prop("checked") == true){
    Status = 'Active';
  }
  DateFrom = $('#packageFilterForm #packageStartDate').val();
  DateTo = $('#packageFilterForm #packageExpiryDate').val();

  var data = {'Organisation':Organization, 'Product':Product, 'Status':Status, 'StartDate':DateFrom, 'ExpiryDate':DateTo};
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.GetPackageList.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        var htmlString = '';
        $('.packageTable tbody').html(htmlString);
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var packages = data.d.RetData.Tbl.Rows;
          for (var i=0; i<packages.length; i++ ){
            var startDate = convertDateTime(packages[i].StartDate,'date');
            var expiryDate = convertDateTime(packages[i].ExpiryDate,'date');
            htmlString += '<tr id="'+ packages[i].PackageID  +'"> <td>'+packages[i].Organization+'</td> <td>'+packages[i].ManDaysLeft+'/'+packages[i].BoughtManDays+'</td> <td>'+packages[i].Product+'</td> <td>'+packages[i].System+'</td> <td>'+startDate+'</td> <td>'+expiryDate+'</td> <td>'+packages[i].Status+'</td> </tr>';
          }
          $('.packageTable tbody').html(htmlString);
          $('.packageTable tbody tr').click(function(){
            var packageId = $(this).attr('id'),
                packageUrl = './packageDetails.html?packageID=' + packageId;
            window.location.href = packageUrl;
          });
        }
      }
    }
  });
};

function getOrgnaisationList(){
  var data = {};
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.getOrgnaisationList.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
            'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277' },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var orgList = data.d.RetData.Tbl.Rows;
          for (var i=0; i<orgList.length; i++ ){
            $('#packageFilter #organisation, #packageAddForm #organisation').append('<option value="'+orgList[i].DefaultRoleID+'">'+orgList[i].DisplayName+'</option>');
          }
        }
      }
    }
  });
}

//get Current Package List
function getCurrentPackageList(){
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.GetCurrentPackages.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':'',
            'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
            'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277' },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var packages = data.d.RetData.Tbl.Rows;
          var htmlString = '';
          for (var i=0; i<packages.length; i++ ){
            var date = convertDateTime(packages[i].ExpiryDate,'date');
            htmlString += '<div class="medium-6 large-4 cell clearfix"> <div class="card"> <div class="grid-x card-divider"> <div class="cell auto"> <h3">'+packages[i].Product+'</h3>'
            if (packages[i].System.length > 0) {
              htmlString +=	'<ul class="system"> <li>'+packages[i].System+'</li> </ul>'
            }
            htmlString +=	'</div>'
            if (packages[i].ManDaysLeft > 0) {
              htmlString += '<div class="manDays cell small-5"> <div class="grid-y" style="height: 60px;"> <div class="cell small-9"><b>'+packages[i].ManDaysLeft+'</b>/<span class="totalDays">'+packages[i].BoughtManDays+'</span></div> <small class="cell small-3">Man-day(s)</small> </div> </div>'
            }
            htmlString += '</div><!--card-divider--> <div class="card-section"> <div class="packageType">'+packages[i].Type+'</div> <div class="expiring">Expiring: <i>'+date+'</i></div> </div> </div> </div>'
          }
          $('.packageGrid').append(htmlString);
        }
      }
    }
  });
};

function addNewtransaction(PackageID, FLID){
  var Type, ManDays, Remarks;
  Type =  $('#packageTransactionAddForm #type').val();
  ManDays = $('#packageTransactionAddForm #manDays').val();
  Remarks = $('#packageTransactionAddForm #remarks').val();

  var data = {'PackageID':PackageID, 'FLID':FLID, 'Type':Type, 'ManDays':ManDays, 'Remarks': Remarks};
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.AddNewPackageTransactions.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
            'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277' },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            getPackageDetails(PackageID);
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
}

function getPackageDetails(PackageID){
  var data = {'PackageID':PackageID};
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.GetPackagedetails.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
            'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277' },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        var htmlString = '';
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var packageDetails = data.d.RetData.Tbl.Rows;
          var htmlString = '';
          for (var i=0; i<packageDetails.length; i++ ){
            var packageDate = convertDateTime(packageDetails[i].CreatedDate,'datetime'),
                startDate = convertDateTime(packageDetails[i].StartDate,'date'),
                expiryDate = convertDateTime(packageDetails[i].ExpiryDate,'date');
            $('.organization').html(packageDetails[i].Organization);
            $('.packageType').html(packageDetails[i].Type);
            $('.product').html(packageDetails[i].Product);
            $('.system').html(packageDetails[i].System);
            $('.status').html(packageDetails[i].Status);
            $('.manDays').html(packageDetails[i].ManDaysLeft+'/'+packageDetails[i].BoughtManDays);
            $('.startDate').html(startDate);
            $('.expiryDate').html(expiryDate);
            $('.pkgCreatedBy').html(packageDetails[i].PkgCreatedBy);
            $('.createdDate').html(packageDate);
            var tranDate = convertDateTime(packageDetails[i].TranDate,'date');
            htmlString += '<tr id="'+ packageDetails[i].PackageID  +'"> <td>'+packageDetails[i].TranType+'</td> <td>'+packageDetails[i].ManDays+'</td> <td>'+packageDetails[i].Remarks+'</td> <td>'+packageDetails[i].FLID+'</td> <td>'+tranDate+'</td> <td>'+packageDetails[i].TranCreatedBy+'</td> </tr>';
          }
          $('.packagetranTable tbody').html(htmlString);
        }
      }
    }
  });
};

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

function getPageName() {
  var pageName = $('body').attr('id').replace('page-','');
  return pageName;
}

//geneare drop down optioms
function GetDropdownList(id, category) {
  var data = {'LookupCat': category}
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.Lookup_Get.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data': JSON.stringify(data),
            'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
            'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277' },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var lookup = data.d.RetData.Tbl.Rows;
          for (var i=0; i<lookup.length; i++ ){
            $(id).append('<option value="'+lookup[i].LookupKey+'">'+lookup[i].Description+'</option>');
          }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
};
