/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
$(function () {
    var gadgetLocation;
    var conf;
    var schema;
    var pref = new gadgets.Prefs();

    var refreshInterval;
    var providerData;

    var CHART_CONF = 'chart-conf';
    var PROVIDER_CONF = 'provider-conf';
    var REFRESH_INTERVAL = 'refreshInterval';

    var init = function () {
        $.ajax({
            url: gadgetLocation + '/conf.json',
            method: "GET",
            contentType: "application/json",
            async: false,
            success: function (data) {
                conf = JSON.parse(data);
                conf.operator =  $("#button-operator").val();
                conf.serviceProvider = $("#button-sp").val();
                conf.api = $("#button-api").val();
                conf.applicationName = $("#button-app").val();
                conf.dateStart = moment(moment($("#reportrange").text().split("-")[0]).format("MMMM D, YYYY hh:mm A")).valueOf();
                conf.dateEnd = moment(moment($("#reportrange").text().split("-")[1]).format("MMMM D, YYYY hh:mm A")).valueOf();

                if($("#button-type").val().toLowerCase().trim() == "error traffic") {
                    conf["provider-conf"].tableName = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_FAILURE_SUMMARY_PER_DAY";
                } else {
                    conf["provider-conf"].tableName = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_TRAFFIC_SUMMARY_PER_DAY";
                }

                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=getSchema',
                    method: "POST",
                    data: JSON.stringify(conf),
                    contentType: "application/json",
                    async: false,
                    success: function (data) {
                        schema = data;
                    }
                });
            }
        });
    };

    var getProviderData = function (){

        if($("#button-type").val().toLowerCase().trim() == "error traffic") {
            conf["provider-conf"].tableName = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_FAILURE_SUMMARY_PER_";
        } else {
            conf["provider-conf"].tableName = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_TRAFFIC_SUMMARY_PER_";
        }

        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getData',
            method: "POST",
            data: JSON.stringify(conf),
            contentType: "application/json",
            async: false,
            success: function (data) {
                providerData = data;
            }
        });
        return providerData;
    };


    var drawGadget = function (){
        draw('#canvas', conf[CHART_CONF], schema, providerData);
        setInterval(function() {
            draw('#canvas', conf[CHART_CONF], schema, getProviderData());
        },pref.getInt(REFRESH_INTERVAL));
    };


    $("#button-search").click(function() {
        $("#canvas").html("");
        $("#canvas2").html("");
        getGadgetLocation(function (gadget_Location) {
            gadgetLocation = gadget_Location;
            init();
            getProviderData();
            drawGadget();
        });
    });

    getGadgetLocation(function (gadget_Location) {
        gadgetLocation = gadget_Location;
        init();
        loadOperator();
        // loadSP();
        // loadApp();
        // loadApi();

    function loadOperator (){
        conf["provider-conf"]["tableName"] = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_OPERATOR_SUMMARY";
        conf["provider-conf"]["provider-name"] = "operator";
        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getData',
            method: "POST",
            data: JSON.stringify(conf),
            contentType: "application/json",
            async: false,
            success: function (data) {
                // alert("loadOperator :" +JSON.stringify(data));
                // alert(JSON.stringify(data));
                $("#dropdown-operator").empty();
                var operators = [];
                operators.push("All");
                for ( var i =0 ; i < data.length; i++) {
                    operators.push(data[i]["operatorId"]);
                }
                operators = jQuery.unique(operators);
                operators = Array.from(new Set(operators)).sort();
                var operatorsItems = "";
                for ( var i =0 ; i < operators.length; i++) {
                    operatorsItems += '<li><a href="#">' + operators[i] +'</a></li>'
                }


                $("#dropdown-operator").html( $("#dropdown-operator").html() + operatorsItems);
                $("#button-operator").val("All");

                operators.splice($.inArray("All", operators),1);
                loadSP(operators);

                $("#dropdown-operator li a").click(function(){
                    $("#button-operator").text($(this).text());
                    $("#button-operator").append('<span class="caret"></span>');
                    $("#button-operator").val($(this).text());
                    var clickedOperator = [];
                    clickedOperator.push($(this).text());
                    loadSP(clickedOperator);
                });
            }
        });
      }

      function loadSP (clickedOperator){

        conf["provider-conf"]["tableName"] = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_API_SUMMARY";
        conf["provider-conf"]["provider-name"] = "operator";
        conf.operator =  clickedOperator;

        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getData',
            method: "POST",
            data: JSON.stringify(conf),
            contentType: "application/json",
            async: false,
            success: function (data) {
                // alert(JSON.stringify(data));
                $("#button-sp").text("All");
                $("#button-sp").append('<span class="caret"></span>');
                // $("#button-sp").val($(this).text());
                $("#dropdown-sp").empty();
                var spItems = '';
                var sps = [];
                sps.push("All");
                for ( var i =0 ; i < data.length; i++) {
                    sps.push(data[i]["serviceProvider"]);
                }
                sps = jQuery.unique(sps);
                sps = Array.from(new Set(sps)).sort();
                for ( var i =0 ; i < sps.length; i++) {
                    spItems += '<li><a href="#">' + sps[i] +'</a></li>'
                }

                $("#dropdown-sp").html( $("#dropdown-sp").html() + spItems);
                // $("#button-sp").val("All");
                // loadApp(sps[i]);
                sps.splice($.inArray("All", sps),1);
                loadApp(sps);
                $("#dropdown-sp li a").click(function(){
                    $("#button-sp").text($(this).text());
                    $("#button-sp").append('<span class="caret"></span>');
                    $("#button-sp").val($(this).text());
                    var clickedSP = [];
                    clickedSP.push($(this).text());
                    loadApp(clickedSP);
                });


            }
        });
    }

    function loadApp (sps){
    // alert(sps);
    // if(sps)
    conf["provider-conf"]["tableName"] = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_API_SUMMARY";
    conf["provider-conf"]["provider-name"] = "sp";

    conf.serviceProvider = sps;
    $.ajax({
        url: gadgetLocation + '/gadget-controller.jag?action=getData',
        method: "POST",
        data: JSON.stringify(conf),
        contentType: "application/json",
        async: false,
        success: function (data) {
          // alert("loadApp :" +JSON.stringify(data));

            $("#button-app").text("All");
            $("#button-app").append('<span class="caret"></span>');
            // $("#button-sp").val($(this).text());
            $("#dropdown-app").empty();
            var appItems = '';
            var apps = [];
            apps.push("All");
            for ( var i =0 ; i < data.length; i++) {
                apps.push(data[i]["applicationName"]);
            }
            apps = jQuery.unique(apps);
            apps = Array.from(new Set(apps)).sort();
            for ( var i =0 ; i < apps.length; i++) {
                appItems += '<li><a href="#">' + apps[i] +'</a></li>'
            }

            $("#dropdown-app").html( $("#dropdown-app").html() + appItems);
            // $("#button-sp").val("All");
            // loadApp(sps[i]);
            apps.splice($.inArray("All", apps),1);
            loadApi(apps);

            $("#dropdown-app").html(appItems);
            $("#button-app").val("All");
             $("#dropdown-app li a").click(function(){
                $("#button-app").text($(this).text());
                $("#button-app").append('<span class="caret"></span>');
                $("#button-app").val($(this).text());

                var clickedApp = [];
                clickedApp.push($(this).text());
                loadApi(clickedApp);
            });

        }
    });
  }

  function loadApi (apps){
  conf["provider-conf"]["tableName"] = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_API_SUMMARY";
  conf["provider-conf"]["provider-name"] = "app";

  conf.applicationName = apps;

  $.ajax({
      url: gadgetLocation + '/gadget-controller.jag?action=getData',
      method: "POST",
      data: JSON.stringify(conf),
      contentType: "application/json",
      async: false,
      success: function (data) {
        // alert("loadApi :" +JSON.stringify(data));
          var apiItems = '<li><a href="#">All</a></li>';
          var apis = [];

          for ( var i =0 ; i < data.length; i++) {
              apis.push(data[i]["api"]);
          }

          apis = Array.from(new Set(apis)).sort();
          for ( var i =0 ; i < apis.length; i++) {
              apiItems += '<li><a href="#">' + apis[i] +'</a></li>'
          }

          $("#dropdown-api").html(apiItems);
          $("#button-api").val("All");

          $("#dropdown-api li a").click(function(){
              $("#button-api").text($(this).text());
              $("#button-api").append('<span class="caret"></span>');
              $("#button-api").val($(this).text());
          });
      }
  });
}

        $("#button-app").val("All");
        $("#button-api").val("All");
        $("#button-type").val("Api Traffic");

        $('input[name="daterange"]').daterangepicker({
            timePicker: true,
            timePickerIncrement: 30,
            locale: {
                format: 'MM/DD/YYYY h:mm A'
            }
        });
    });

    $("#dropdown-type li a").click(function(){
        $("#button-type").text($(this).text());
        $("#button-type").append('<span class="caret"></span>');
        $("#button-type").val($(this).text());
    });




});
