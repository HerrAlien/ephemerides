/* ephemeris - a software astronomical almanach 

Copyright 2017 Herr_Alien <alexandru.garofide@gmail.com>

This program is free software: you can redistribute it and/or modify it under 
the terms of the GNU Affero General Public License as published by the 
Free Software Foundation, either version 3 of the License, or (at your option)
any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY 
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program. If not, see <https://www.gnu.org/licenses/agpl.html>. */

"use strict";

var MarsData = {};

// upgrade the object to handle physical data as well.
(function () {
    var initLocal = function () {    
        if (typeof PlanetData != 'undefined' && typeof PlanetPage != 'undefined' && typeof Pages != 'undefined') {
            MarsData = new PlanetData({ number: 3, name: "Mars", 
                                       semidiameterFunctionName :  function (delta) { if (typeof GetAAJS() != "undefined") return GetAAJS().Diameters.MarsSemidiameterB(delta); } } );				

            MarsData['old_GetData'] = MarsData.getDataAsObjectForJD;
            MarsData.getDataAsObjectForJD = function (JD, computeRiseTransitSet) {
                var data = this.old_GetData(JD, computeRiseTransitSet); 
                if (!data['EarthDeclination']) {
                    var physicalData = GetAAJS()['Mars']['PhysicalDetails'] (JD);
                    for (var key in physicalData)
                        data[key] = physicalData[key];
                    this.cache[JD] = data;
                }
                return data;
            };

            var Page = new PlanetPage (MarsData, "MarsTable");


            Page.tableHeaderInfo['16'] = {
                "0" : { "text" : " Date  " },
                "1" : { "text" : "          " },
                "longText" : "Date: month",
                "dataKey" : 'Month'
            };
            Page.tableHeaderInfo['17'] = {
                "0" : { "text" : " "},
                "1" : { "text" : "          "},
                "longText" : "Date: day",
                "dataKey" : 'Day'
            };
            Page.tableHeaderInfo['18'] = {  "dataKey" : 'CentralMeridianLongitude', "0" : {"text" : "  L0"}, "1" : {"text" : "  \u00B0"}, "longText" : "Longitude of central meridian (physical ephemeris)" };
            Page.tableHeaderInfo['19'] = {  "dataKey" : 'EarthDeclination', "0" : {"text" : "    DE"}, "1" : {"text" : "     \u00B0"}, "longText" : "Planetocentric declination of Earth (physical ephemeris)" };
            Page.tableHeaderInfo['20'] = {  "dataKey" : 'SunDeclination', "0" : {"text" : "    DS"}, "1" : {"text" : "     \u00B0"}, "longText" : "Planetocentric declination of the Sun (physical ephemeris)" };
            Page.tableHeaderInfo['21'] = {  "dataKey" : 'P', "0" : {"text" : "     P" }, "1" : {"text" : "     \u00B0"}, "longText" : "Position angle of the North Pole (physical ephemeris)" };
            Page.formattingFunctions = Page.formattingFunctions.concat([
            function(month) { return prePadTo(month, " ", 3); }, 
            function (day) { return prePadTo(day, " ", 2); }, 
            function(L0) { return prePadTo(L0, " ", 5); }, 
            function(DE) { return prePadTo(DE, " ", 5); }, 
            function(DS) { return prePadTo(DS, " ", 5); }, 
            function(P) { return prePadTo(P, " ", 5); }, 
            ]);

            Page["old_addPlanetTableHeader"] = Page.addPlanetTableHeader;
            Page["old_prepareOneDayDataObjectForView"] = Page.prepareOneDayDataObjectForView;

            Page.addPlanetTableHeader = function (table, classes) {
                var headerRows = this.old_addPlanetTableHeader(table, classes);
                var cellL0 = headerRows.row1.cells[16];
                cellL0.textContent = "L";
                this.addNodeChild (cellL0, "sub", "0"); 
                return headerRows;
            }

            Page.prepareOneDayDataObjectForView = function (obj, JD) {
                var preparedLine = this.old_prepareOneDayDataObjectForView(obj, JD);
                preparedLine[preparedLine.length] = preparedLine[0];
                preparedLine[preparedLine.length] = preparedLine[1];
                preparedLine[preparedLine.length] = Math.round(obj.CentralMeridianLongitude * 10) / 10;
                preparedLine[preparedLine.length] = Math.round(obj.EarthDeclination * 10) / 10;
                preparedLine[preparedLine.length] = Math.round(obj.SunDeclination * 10) / 10;
                preparedLine[preparedLine.length] = Math.round(obj.P * 10) / 10;
                return preparedLine;
            }

            Pages["Mars Ephemeris"] = Page;
        } else {
            SyncedTimeOut (initLocal, Timeout.onInit);
        }
    }
    initLocal();
})();

