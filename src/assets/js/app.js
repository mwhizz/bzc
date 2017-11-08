import $ from 'jquery';
import whatInput from 'what-input';

window.$ = $;

import Foundation from 'foundation-sites';
// If you want to pick and choose which modules to include, comment out the above and uncomment
// the line below
//import './lib/foundation-explicit-pieces';

$(document).foundation();

//document ready
$(function(){
  var caseContainer = $('#caseContainer');
  var urlParams = new URLSearchParams(window.location.search);
  getCurrentPackageList();
  getCasesList(caseContainer,'','','','','','','');
  if (urlParams.get('caseID')){
    GetCaseDetails(urlParams.get('caseID'));
  }
  $('.tabBoxButton').click(function(){
    var targetRef = $(this).data('target');
    if (  $('#'+targetRef).is(':visible')){
      $('#'+targetRef).hide();
    }else{
      $('#'+targetRef).show();
    }
    return false;
  });
  $('.tabBoxButtonClose,.tabBoxButtonSubmit').click(function(){
    var targetRef = $(this).parents('.tabBoxContent');
    $(targetRef).hide();
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
  $('.caseTable').click(function(){
    var caseContainerTable = caseContainer.find('table');
    var caseTbody = caseContainerTable.find('tbody');
    var caseRow = caseTbody.find('tr')
    var caseId = caseRow.attr('id');
    window.location.href = 'http://localhost:8000/case.html?caseID=' + caseId;
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
          //GetCaseDetails(caseTbody.find('tr'));
        }
      }
    }
  });
}

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
            var htmlString = '';
            for (var i=0; i<caseDetails.length; i++ ){
              //var date = convertDate(caseDetails[i].ExpiryDate);
              htmlString += '<header><button href="#" class="buttonType2 left buttonType2Back"><a href="./support.html">Back to Case Listing</a></button><h1>#'+
                            caseDetails[i].FLID+' '+caseDetails[i].Title+'<small><a href="">Edit</a></small></h1></header> <section id="information"> <header class="toggleTitle"> <h2>Information</h2> </header> <div class=" toggleContent form"><div class="grid-x grid-padding-x"><div class="cell"><div class="labelText">Organisation</div>'
              htmlString += '<div class="text">'+caseDetails[i].OrganizationName+'</div></div></div><div class="grid-x grid-padding-x"><div class="cell"><div class="labelText">Product</div>'
              htmlString += '<div class="text">'+caseDetails[i].Product+'</div>'
              htmlString += '</div></div><div class="grid-x grid-padding-x"><div class="cell"><div class="labelText">Module</div><div class="text">'+caseDetails[i].Module+'</div></div></div>'
            }
            $('#caseContainer').html(htmlString);
          }
        }
        //alert('Success');
      }
    });
  //});
}

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
}

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
}

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
}

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
}

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
}

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
}

//convert date to dd/mm/yyyy
function convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
}
