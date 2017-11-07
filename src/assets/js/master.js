var scripts = document.getElementsByTagName('script');
var path = scripts[scripts.length - 1].src.split('?')[0];      // remove any ?query
var mydir = path.split('/').slice(0, -2).join('/') + '/';  // remove last filename part of path
window.BaseAppPath = mydir;
//Default JS load function
function MasterLoadJS(RelScriptPath) {
	//get root path
	var fileref = document.createElement('script');
	fileref.setAttribute("type", "text/javascript");
	fileref.setAttribute("src", window.BaseAppPath + RelScriptPath);
	document.body.appendChild(fileref);
}
// Extended disable function
$.fn.extend({
	disable: function (State, ReplaceText) {
		return this.each(function () {
			var $t = $(this);
			var Txt = (ReplaceText || $t.data("PrevTxt") || "");
			if ($t.hasClass("ui-button")) { //jQueryUI button
				if (Txt) {
					if (ReplaceText) $t.data("PrevTxt", ($t.button("option", "label") || ""));
					$t.button("option", "label", Txt);
				}
				if (State) { $t.button("disable"); } else { $t.button("enable"); }
			} else { //Other button
				if (Txt) {
					var OldVal = $t.prop("value");
					if (OldVal) {
						if (ReplaceText) $t.data("PrevTxt", OldVal);
						$t.prop("value", Txt);
					} else {
						OldVal = $t.html();
						if (OldVal) {
							if (ReplaceText) $t.data("PrevTxt", OldVal);
							$t.html(Txt);
						}
					}
				}
				if (State) { $t.prop('disabled', true).addClass('disabled'); }
				else { $t.prop('disabled', false).removeClass('disabled'); }
			}
		});
	}
});
(function ($) {
	//window.BCBaseURL = "http://stg.bizcube.com.sg/Test/";
	//uses jGrowl if loaded, else fallback to default
	$.alert = function (Msg, options) {
		if ($.jGrowl) {
			var Opt = $.extend({ theme: 'growlalert', sticky: true }, options);
			$.jGrowl(Msg, Opt);
		} else { alert(Msg); }
	};

	$.JSONPost = function (URL, Data, options) {
		var Opt = $.extend({
			Cache: false, WaitDiv: 'plswait', WaitMsg: 'please wait...', Timeout: 30000, LoginDiv: 'logindiv', LoginURL: '', ShowErrMsg: true, ReqGUID: $.getGUID(), FailFN: false, DisableBtn: '', DisableBtnMsg: 'Please wait...', DisableOth: '.DisableOnJSONPost', LoginHideSuccessMsg: false, LoginSuccessCallbackFn: false
		}, window.JSONOpt, options);
		if (Opt.WaitDiv.length > 0) {
			var wait = $("#" + Opt.WaitDiv);
			var Cnt = (wait.data("Cnt") || 0) + 1;
			if (wait.length == 0) {
				if (Opt.WaitMsg.length == 0) { Opt.WaitMsg = "&nbsp;"; }
				wait = $("<div class='wait_img wait_pos' style='display:none;'/>").attr("id", Opt.WaitDiv).html(Opt.WaitMsg).appendTo(document.body);
			}
			wait.data("Cnt", Cnt);
			if (!wait.is(":visible")) wait.slideDown();
		}
		if (Opt.DisableOth) $(Opt.DisableOth).disable(true);
		if (Opt.DisableBtn) $(Opt.DisableBtn).disable(true, Opt.DisableBtnMsg);
		if ((window.BCBaseURL) && ((URL.substr(1, 4).toLowerCase() != "http") || (URL.substr(1, 1) != "/") || (URL.substr(1, 1) != "."))) { URL = window.BCBaseURL + URL; }
		Opt.URL = URL;
		var jqxhr = $.ajax({
			url: URL, cache: Opt.Cache, type: "POST",
			data: { "data": JSON.stringify(Data), "WebPartKey": $.getWebPartKey(), "ReqGUID": Opt.ReqGUID },
			dataType: "json", timeout: Opt.Timeout,
			xhrFields: { withCredentials: true }
		})
		jqxhr.always(function (Data) {
			if (Opt.WaitDiv.length > 0) {
				var wait = $("#" + Opt.WaitDiv);
				wait.data("Cnt", (wait.data("Cnt") - 1));
				if (wait.data("Cnt") <= 0) { wait.slideUp(); }
			}
			if (Opt.DisableOth) $(Opt.DisableOth).disable(false);
			if (Opt.DisableBtn) $(Opt.DisableBtn).disable(false);
		});
		jqxhr.done(function (data, textStatus, jqXHR) {
			_ProcJSONRet(textStatus, data, jqXHR, Opt);
		});
		jqxhr.fail(function (jqXHR, textStatus, errorThrown) {
			var data = null;
			if (jqXHR.responseText) data = $.parseJSON(jqXHR.responseText);
			_ProcJSONRet(errorThrown, data, jqXHR, Opt);
		});
		return jqxhr;
	}
	$.getGUID = function () {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
		return uuid;
	};

	function _ProcJSONRet(textStatus, data, jqXHR, Opt) {
		if (jqXHR.status != 0) { //exclude timeout or network errors
			var RetVal = 0, RetMsg = "";
			if ((data) && (data.d)) {
				RetVal = data.d.RetVal || 0; RetMsg = data.d.RetMsg || "";
			} else {
				if (textStatus) {
					try {
						var S = textStatus.split(":", 2);
						RetVal = parseInt(S[0], 10); RetMsg = (S.length > 1 ? S[1] : textStatus);
					} catch (e) {
						RetVal = 404;
						if (jqXHR.responseText) {
							RetMsg = 'Request error (404A) - please check with support (The following info may help in tracing the issue: ' + Opt.URL + ', ' + Opt.ReqGUID + ')';
						} else { //empty response - blocked or does not exist or false
							RetMsg = 'Request error (404B) - please check with support (The following info may help in tracing the issue: ' + Opt.URL + ', ' + Opt.ReqGUID + ')';
						}
					}
					if (jqXHR.responseText) {
						try {
							data = JSON.parse(jqXHR.responseText);
							if ((data) && (data.d)) {
								RetVal = data.d.RetVal || 0; RetMsg = data.d.RetMsg || "";
							}
						} catch (e) { } //Ignore
					}
				} else {
					RetVal = 404; RetMsg = 'Request error (404C) - please check with support (The following info may help in tracing the issue: ' + Opt.URL + ', ' + Opt.ReqGUID + ')';
				}
			}
			if (RetVal == -1) { return; }
			else { //err
				if (typeof (Opt.FailFN) === "function") { Opt.FailFN(RetVal, RetMsg, data, Opt); }
				if (RetVal == 2) {
					if ((Opt.LoginDiv) && (Opt.LoginDiv.length > 0)) {
						$.fn.Mas_ShowLoginDiv(Opt.LoginDiv, Opt.LoginHideSuccessMsg, Opt.LoginSuccessCallbackFn);
					} else if ((Opt.LoginURL) && (Opt.LoginURL.length > 0)) {
						window.location.replace(Opt.LoginURL);
					}
					return;
				}
				else if (Opt.ShowErrMsg) {
					if (RetMsg.length > 0) { $.alert(RetMsg); return; }
					else { $.alert('Request error - please check with support (The following info may help in tracing the issue: ' + Opt.URL + ', ' + Opt.ReqGUID + ')'); return; }
				}
			}
		} else { //timeout or network errors
			RetVal = 408; RetMsg = 'Request timeout or network error - please try again and check with support if it recurs (The following info may help in tracing the issue: ' + Opt.URL + ', ' + Opt.ReqGUID + ')';
			if (typeof (Opt.FailFN) === "function") { Opt.FailFN(RetVal, RetMsg, data, Opt); }
			if (Opt.ShowErrMsg) { $.alert(RetMsg); return; }
		}
	}

	$.JSONPostNewWindow = function (URL, Data, options) {
		var Opt = $.extend({ Target: '_blank' }, options);
		if ((window.BCBaseURL) && ((URL.substr(1, 4).toLowerCase() != "http") || (URL.substr(1, 1) != "/") || (URL.substr(1, 1) != "."))) { URL = window.BCBaseURL + URL; }
		var $d = $("<input type='hidden' name='data'/>").val(JSON.stringify(Data));
		var $wpk = $("<input type='hidden' name='WebPartKey'/>").val($.getWebPartKey());
		var $form = $("<form method='POST' style='display:none;'/>").appendTo(document.body);
		$form.html("").attr("action", URL).attr("target", Opt.Target).append($d).append($wpk).submit().remove();
	}

	$.fn.Mas_ShowLoginDiv = function (LoginDivID, HideSuccessMsg, SuccessCallbackFn) {
		var logindiv = $("#" + LoginDivID);
		var hasLoginDiv = ($('body').find(logindiv).length > 0) ? true : false;
		if (!(hasLoginDiv)) {
			logindiv = $('<div id=' + LoginDivID + ' style="display:none;">').appendTo(document.body)
			$('body').append(logindiv);
			logindiv.html('<p>You are not logged in or your login session may have expired. </br>Please login and retry</p><div><label for="username">Username</label><input id="username" type="text"></div><div><label for="password">Password</label><input id="password" type="password"></div>');
		}
		if (!logindiv.is(":visible")) {
			logindiv.dialog({ title: 'Login Required', modal: true, buttons: { "Login": function () {
				$.JSONPost("Sec1.Login.json", { "Username": $("#username").val(), "Password": $("#password").val(), "RememberMe": false }, "")
					.done(function (data) {
						if (data.d.RetVal == -1) {
							logindiv.dialog("close");
							if (!HideSuccessMsg) alert("You have logged in successfully - please refresh or retry your previous operation.");
							if (SuccessCallbackFn && typeof (SuccessCallbackFn) == 'function') { SuccessCallbackFn(); }
						}
						else { alert(data.d.RetMsg); }
					})
					.then(function (data) {
						$(window).unbind('keydown');
					});
			}
			}
			});
			$(window).keydown(function (e) {
				if (e.keyCode === 13) {
					$.JSONPost("Sec1.Login.json", { "Username": $("#username").val(), "Password": $("#password").val(), "RememberMe": false }, "")
					.done(function (data) {
						if (data.d.RetVal == -1) {
							logindiv.dialog("close");
							if (!HideSuccessMsg) alert("You have logged in successfully - please refresh or retry your previous operation.");
							if (SuccessCallbackFn && typeof (SuccessCallbackFn) == 'function') { SuccessCallbackFn(); }
						}
						else { alert(data.d.RetMsg); }
					})
					.then(function (data) {
						$(window).unbind('keydown');
					});
				}
			});
		}
	}

	//general cookie handling code
	$.cookie = function (key, value, options) {
		// key and at least value given, set cookie...
		if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
			options = $.extend({}, options);
			if (value === null || value === undefined) {
				options.expires = -1;
			}
			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}
			value = String(value);
			return (document.cookie = [
								encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
								options.expires ? '; expires=' + options.expires.toUTCString() : '',
								options.path ? '; path=' + options.path : '',
								options.domain ? '; domain=' + options.domain : '',
								options.secure ? '; secure' : ''
			].join(''));
		}
		// key and possibly options given, get cookie...
		options = value || {};
		var decode = options.raw ? function (s) { return s; } : decodeURIComponent;
		var pairs = document.cookie.split('; ');

		for (var i = 0; i < pairs.length; i++) {
			var pos = pairs[i].indexOf('=');
			if (pos >= 0) {
				var pair = [pairs[i].slice(0, pos), pairs[i].slice(pos + 1)];
				if (decode(pair[0]) === key) return decode(pair[1] || '');
			}
		}
		return null;
	};

	//opposite of param function in jQuery
	$.deparam = function (params) {
		var o = {};
		if (!params) return o;
		var a = params.split('&');
		for (var i = 0; i < a.length; i++) {
			var pair = a[i].split('=');
			o[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
		}
		return o;
	};
	//extracts query string / hash QS into object with properties
	$.parseQS = function () {
		var str = (window.location.search.substring(1) || "");
		if (str.length == 0) {
			str = (window.location.hash || "");
			var pos = str.indexOf('?');
			if (pos >= 0) {
				str = str.substr(pos + 1);
			} else {
				str = (str.substring(1) || "");
			}
		}
		return $.deparam(str);
	};
	//extracts cookie into object with properties
	$.parseCookie = function (CookieName) { return $.deparam($.cookie(CookieName, { raw: true })); };
	//specifically gets WebPartKey for BizSense security
	$.getWebPartKey = function () { return $.parseCookie("IGWAS").WebPartKey || ''; };

	//this is to allowed resizing over an iframe
	if ($.ui) {
		$.ui.plugin.add("resizable", "iframeFix", {
			start: function (event, ui) {
				var o = $(this).data('resizable').options;
				$(o.iframeFix === true ? "iframe" : o.iframeFix).each(function () {
					$('<div class="ui-resizable-iframeFix" style="background: #fff;"></div>')
						.css({
							width: "100%", height: "100%",
							position: "absolute", opacity: "0.001", zIndex: 1000
						})
						.css($(this).offset())
						.appendTo("body");
				});
			},
			stop: function (event, ui) {
				$("div.ui-resizable-iframeFix").each(function () { this.parentNode.removeChild(this); });
			}
		});
	}

	$.fn.bcpicker = function (webpartid, term) {
		var $ele = this, result = [];
		$.JSONPost(webpartid, term)
			.done(function (data) {
				var R = data.d.RetData.Tbl.Rows, RowCnt = R.length;
				result = data.d.RetData.Tbl.Rows;
				return $ele.tokenInput(result, {
					preventDuplicates: true,
					theme: "facebook"
				});
			});
	};

	$.fn.errorstyle = function () {
		var msg = this.html();
		var StyledError = "<div class=\"ui-state-error ui-corner-all\" style=\"padding: 0 .7em;\">";
		StyledError += "<p style=\"padding:.7em 0 .5em 0;\"><span class=\"ui-icon ui-icon-alert\" style=\"float: left; margin-right: .3em;\">";
		StyledError += "</span><strong>Alert:</strong>";
		StyledError += msg;
		StyledError += "</p></div>";
		this.replaceWith(StyledError);
	};
	$.fn.infostyle = function () {
		var msg = this.html();
		var info = "<div class=\" ui-state-highlight ui-corner-all\" style=\"padding: 0 .7em;\">";
		info += "<p style=\"padding:.7em 0 .5em 0;\"><span class=\"ui-icon ui-icon-info\" style=\"float: left; margin-right: .3em;\">";
		info += "</span><strong>Info:</strong>";
		info += msg;
		info += "</p></div>";
		this.replaceWith(info);
	};
	$.fn.successstyle = function () {
		var msg = this.html();
		var info = "<div class=\" ui-state-highlight ui-corner-all\" style=\"padding: 0 .7em;\">";
		info += "<p style=\"padding:.7em 0 .5em 0;\"><span class=\"ui-icon ui-icon-check\" style=\"float: left; margin-right: .3em;\">";
		info += "</span><strong>Info:</strong>";
		info += msg;
		info += "</p></div>";
		this.replaceWith(info);
	};

	//Generate tab
	$.fn.iframetab = function (data, options) {
		var Opt = $.extend({'TabDiv': 'Tabs'}, options);
		if (data.d.RetVal == -1) {
			var r = data.d.RetData.Tbl.Rows;
			var QueryString = Opt.QueryString;
			var RowCnt = r.length;
			var Output = '<div id="' + Opt.TabDiv + '"><ul>';
			for (var i = 0; i < RowCnt; i++) {
				Output += "<li><a class=\"tablink\" href='#" + r[i].TabKey + "' rel='" + r[i].FullPath + "'>" + r[i].TabName + "</a>";
				Output += "</li>\n";
			}
			Output += "</ul>";
			for (var i = 0; i < RowCnt; i++) {
				Output += "<div id='" + r[i].TabKey + "'>";
				Output += "</div>";
			}
			Output += "</div>";
			this.replaceWith(Output);
		}
	};

	//Get tab index
	$.getIndexForId = function (tabname, searchId) {
		var index = -1;
		var i = 0, tablink = $("#" + tabname + " ul li").find("a")
		var l = tablink.length, e;
		while (i < l && index == -1) {
			e = tablink[i];
			if ("#" + searchId == $(e).attr('href')) {
				index = i;
			}
			i++;
		};
		return index;
	};

	//load first content of a tab
	$.getSelectedTabIndex = function (tabname, Key) {
		var index = $.getIndexForId(tabname, Key);
		$("#" + tabname).tabs({ selected: index });
		return $("#" + tabname).tabs('option', 'selected');
	};

	/* Converts standard JSON return table name/value pairs to simple array - note does not work for complex objects in array */
	$.ConvRetTbl2Arr = function (InputTbl, ArrColumnOrder) {
		InputTbl = InputTbl || [];
		ArrColumnOrder = ArrColumnOrder || '';
		var RetTbl = [], RowCnt = InputTbl.length, ColCnt = ArrColumnOrder.length;
		for (var i = 0; i < RowCnt; i++) {
			var RowArr = [];
			for (var c = 0; c < ColCnt; c++) {
				RowArr.push(InputTbl[i][ArrColumnOrder[c]]);
			}
			RetTbl.push(RowArr);
		}
		return RetTbl;
	}

	/* Helper functions for saving objects into local storage */
	$.ls_setObject = function (key, value) {
		window.localStorage.setItem(key, JSON.stringify(value));
	}
	$.ls_getObject = function (key) {
		var value = window.localStorage.getItem(key);
		return value && JSON.parse(value);
	}

	//Force jQuery to use cache for scripts when loading content
	$.ajaxPrefilter('script', function (options) { options.cache = true; });
})($);

//Cross-domain request patch for IE8 & 9
if (window.XDomainRequest) {
	$.ajaxTransport(function (s) {
		if (s.crossDomain && s.async) {
			if (s.timeout) {
				s.xdrTimeout = s.timeout;
				delete s.timeout;
			}
			var xdr;
			return {
				send: function (_, complete) {
					function callback(status, statusText, responses, responseHeaders) {
						xdr.onload = xdr.onerror = xdr.ontimeout = $.noop;
						xdr = undefined;
						complete(status, statusText, responses, responseHeaders);
					}
					xdr = new XDomainRequest();
					xdr.onload = function () {
						callback(200, "OK", { text: xdr.responseText }, "Content-Type: " + xdr.contentType);
					};
					xdr.onerror = function () {
						callback(404, "Not Found");
					};
					xdr.onprogress = $.noop;
					xdr.ontimeout = function () {
						callback(0, "timeout");
					};
					xdr.timeout = s.xdrTimeout || Number.MAX_VALUE;
					xdr.open(s.type, s.url);
					xdr.send((s.hasContent && s.data) || null);
				},
				abort: function () {
					if (xdr) {
						xdr.onerror = $.noop();
						xdr.abort();
					}
				}
			};
		}
	});
}

(function (a) { ($.browser = $.browser || {}).mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)) })(navigator.userAgent || navigator.vendor || window.opera);

//Init basic Utils library for BC
window.Utils = (window.Utils || {});
window.Utils.Popup = function (Element, specs, options) {
	var s = $.extend({ setfocus: true, href: "" }, options);
	if (Element) {
		if (!Element.$) { Element = $(Element); }
		var URL = (s.href || Element.attr('href'));
		specs = specs || '';
		if ((specs.indexOf('width=') < 0) && (screen.width >= 900)) { specs += ((specs.length > 0) ? ',' : '') + 'width=900'; }
		if ((specs.indexOf('height=') < 0) && (screen.height >= 650)) { specs += ((specs.length > 0) ? ',' : '') + 'height=650'; }
		if (specs.indexOf('resizable=') < 0) { specs += ((specs.length > 0) ? ',' : '') + 'resizable=1'; }
		s.name = (s.name || Element.attr("target")) || "_blank";
		var popupWin = window.open(URL, s.name, specs);
		if (s.setfocus) { popupWin.focus(); }
	}
};
window.Utils.PopupURL = function (URL, specs, options) {
	if (URL) {
		var s = $.extend({ setfocus: true }, options);
		specs = specs || '';
		if ((specs.indexOf('width=') < 0) && (screen.width >= 900)) { specs += ((specs.length > 0) ? ',' : '') + 'width=900'; }
		if ((specs.indexOf('height=') < 0) && (screen.height >= 650)) { specs += ((specs.length > 0) ? ',' : '') + 'height=650'; }
		if (specs.indexOf('resizable=') < 0) { specs += ((specs.length > 0) ? ',' : '') + 'resizable=1'; }
		s.name = (s.name || "_blank");
		var popupWin = window.open(URL, s.name, specs);
		if (s.setfocus) { popupWin.focus(); }
	}
};
window.Utils.iOS = function () {
	var iDevices = ['iPad','iPhone','iPod','iPad Simulator','iPhone Simulator','iPod Simulator'];
	while (iDevices.length) {
		if (navigator.platform === iDevices.pop()) { return true; }
	}
	return false;
}
window.Utils.delimiter = String.fromCharCode(8226);
window.Utils.mobile = function () {
	return $.browser.mobile;
}
window.Utils.getGUID = $.getGUID;
window.Utils.escapeString = function (str) {
	return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}
window.Utils.CheckBrowserWarn = function (WarnOpt) {
	window.$buoop = $.extend({ c: 2, reminder: 0, reminderClosed: 0 }, WarnOpt);
	function $buo_f() {
		var e = document.createElement("script");
		e.src = "//browser-update.org/update.min.js";
		document.body.appendChild(e);
	};
	try { document.addEventListener("DOMContentLoaded", $buo_f, false) }
	catch (e) { window.attachEvent("onload", $buo_f) }
};

// to check for browser compatibility
function BrowserSupport(ie, ff, chrome) {
	var browser = '', version = 0;
	if (navigator.userAgent.search('Firefox/') > 0) {
		browser = navigator.userAgent.substring(navigator.userAgent.indexOf('Firefox/'));
		version = parseInt(browser.split('/')[1]);
		if (version >= parseInt(ff)) { return true; } else { return false; }
	} else if (navigator.userAgent.search('MSIE') > 0) {
		browser = $.trim(navigator.userAgent.substr(navigator.userAgent.indexOf('MSIE'), 10));
		if (browser.indexOf(';') >= 0) {
			browser = browser.substr(0, browser.indexOf(';'));
		}
		version = parseInt(browser.split(' ')[1]);
		if (version >= parseInt(ie)) { return true; } else { return false; }
	} else if (navigator.userAgent.search('Chrome/') > 0) {
		browser = navigator.userAgent.substring(navigator.userAgent.indexOf('Chrome/'));
		version = parseInt(browser.split('/')[1]);
		if (version >= parseInt(chrome)) { return true; } else { return false; }
	}
}

function dynamicSort(property, orderby) {
	var sortOrder = 1;
	orderby = (orderby) ? orderby : 'asc';
	if (property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a, b) {
		var result;
		if (a[property] != '' && moment(a[property]).isValid() && b[property] != '' && moment(b[property]).isValid()) {
			if (orderby == 'asc') {
				result = (moment(a[property]).isBefore(moment(b[property]))) ? -1 : (moment(a[property]).isAfter(moment(b[property]))) ? 1 : 0;
			} else {
				result = (moment(a[property]).isAfter(moment(b[property]))) ? -1 : (moment(a[property]).isBefore(moment(b[property]))) ? 1 : 0;
			}
		} else {
			if (orderby == 'asc') {
				result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			} else {
				result = (a[property] > b[property]) ? -1 : (a[property] < b[property]) ? 1 : 0;
			}
		}
		return result * sortOrder;
	}
}
