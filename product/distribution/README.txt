WSO2Telco DEP(Digital Enablement Platform) Gateway Analytics, v2.0.0
====================================================================

13 Feb 2017

Welcome to the WSO2Telco DEP Gateway Analytics, v2.0.0 release.

Gateway Analytics for DEP, is a Data Analytics extension introducing data analytical capabilities to DEP.    


Key Features
============

	- Customer Care Report – Includes the Responses sent by the system.

	- Transaction Report - Downloadable report with transaction details.

	- Traffic Report - Includes the details of Traffic distribusion for each API.

	- Response Time - Provides API wise response time.


Installation & Running
======================

1. Extract the downloaded zip file
2. Copy the following data sources of HUB to <Analytics_Home>/repositroy/conf/datasources/master-datasources.xml
         WSO2AM_STATS_DB 
         WSO2UM_DB 
3. Change the  'dataSource' property of <Analytics_Home>/repositroy/conf/user-mgt.xml to jdbc/WSO2UM_DB
4. Run the wso2server.sh or wso2server.bat file in the bin directory
5. Once the server starts, point your Web browser to
   https://localhost:9444/carbon/ 
   (Note that the default port offset of the server is 1)
6. Follow the instructions under the section 'To install and configure the Hub to publish data on Analytics' under http://docs.wso2telco.com/display/MI/Analytics
7. For user and role related configurations follow the guide http://docs.wso2telco.com/display/MI/Analytics+View+Permission


System Requirements
===================

1. Minimum memory - 2 GB
2. The Management Console requires full Javascript enablement of the Web browser



Support
=======

We are committed to ensuring that your enterprise middleware deployment is
completely supported from evaluation to production. Our unique approach
ensures that all support leverages our open development methodology and is
provided by the very same engineers who build the technology.

For additional support information please refer to http://wso2telco.com/services

---------------------------------------------------------------------------
(c)  2017, WSO2.Telco Inc.
