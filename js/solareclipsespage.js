
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

var SolarEclipsesPage = {
    
    dataSource : SolarEclipses,
    hostElement : document.getElementById("SolarEclipsesContainer"),
    pageRendered : false,

    // clears up the rendered thing
    reset : PlanetPage.prototype.reset,
    
    displayPage : function () {
        
        if (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded() || !PageTimeInterval.JD)
            return setTimeout (function() { SolarEclipsesPage.displayPage(); }, 300);
        
        if (SolarEclipsesPage.pageRendered)
            return;

        SolarEclipsesPage.reset();
        var startJD = PageTimeInterval.JD;
        var numberOfConjunctions =  Math.round(PageTimeInterval.days / MoonEclipsesPage.dataSource.sinodicPeriod);

        var startK = AAJS.Moon.kForJD (startJD);
        if (startK < 0)
            startK = -1 * Math.ceil(Math.abs(startK));
        else
            startK = Math.ceil(Math.abs(startK));
        
        var endK = startK + numberOfConjunctions;
        
        function processK (k, endingK) {
            if (k >= endingK) {
                SolarEclipsesPage.pageRendered = true;
                return;
            }
            
            var eclipseData = SolarEclipsesPage.dataSource.EclipseDataForK (k);
            if (eclipseData.bEclipse) 
                SolarEclipsesPage.drawNewEclipse (eclipseData);
            
            requestAnimationFrame (function() { processK(k+1, endingK); });
        } 
        
        processK(startK, endK);
    },

    drawNewEclipse: function (eclipseData) {
        var yyyymmdd_hhmmOfJD  = PlanetPage.prototype.yyyymmdd_hhmmOfJD;
        
        var addNodeChild = PlanetPage.prototype.addNodeChild;
        var mainDiv = addNodeChild(SolarEclipsesPage.hostElement, "div");
        mainDiv.classList.add("solarEclipse");
        var dateTime = yyyymmdd_hhmmOfJD(eclipseData.t0);
        
        var description = "";
        if (eclipseData.isPartial)
            description += "Partial ";
        if (eclipseData.isTotal)
            description += "Total ";
        if (eclipseData.isAnnular)
            description += "Annular ";
        if (eclipseData.isAnnularTotal)
            description += "Hybrid ";
        description += "Eclipse";
        
        var decimalsFactor = 1e5; 

        var eclipseTitle = addNodeChild (mainDiv, "h2", dateTime.date.Y + "-" + dateTime.date.M + "-" + dateTime.date.D + " " + description);
        var eclipseTitle = addNodeChild (mainDiv, "h3", "Besselian elements:");
        addNodeChild (mainDiv, "span", "T0 = " + dateTime.time.Ord3 + ":" +  dateTime.time.Ord2 + " UTC");
        addNodeChild (mainDiv, "br");
        addNodeChild (mainDiv, "span", "tan (f1) = " + Math.round(eclipseData.besselianElements.tan_f1 * 1e7)/1e7);
        addNodeChild (mainDiv, "br");
        addNodeChild (mainDiv, "span", "tan (f2) = " + Math.round(eclipseData.besselianElements.tan_f2 * 1e7)/1e7);
        
        var table = addNodeChild (mainDiv, "table");
        var header = addNodeChild (table, "tr");

        addNodeChild(header, "th", "");
        addNodeChild(header, "th", "0");
        addNodeChild(header, "th", "1");
        addNodeChild(header, "th", "2");
        addNodeChild(header, "th", "3");
        
        var elements = {"x" : "x", 
                        "y" : "y", 
                        "mu" : "\u03BC", 
                        "d"  : "d",
                        "l1" : "l1", 
                        "l2" : "l2"};
        
        function addRowDataForParameter (paramName) {
            var row = addNodeChild (table, "tr");
            addNodeChild(row, "td", elements[paramName]);
            
            for (var degree = 0; degree < eclipseData.besselianElements[paramName].length; degree++) {
                addNodeChild(row, "td",  Math.round(decimalsFactor*eclipseData.besselianElements[paramName][degree]) /decimalsFactor + "");
            }
        }
        
        for (var key in elements) {
            addRowDataForParameter (key);
        }        
    }
    
};

Pages["SolarEclipses"] = SolarEclipsesPage;

