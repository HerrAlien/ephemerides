
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
    
    hostElement : document.getElementById("SolarEclipsesContainer"),
    pageRendered : false,

    // clears up the rendered thing
    displayPage : function () {
        
        if (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded() || !PageTimeInterval.JD || typeof BesselianElements == 'undefined')
            return SyncedTimeOut (function() { SolarEclipsesPage.displayPage(); }, Timeout.onInit);
        
        if (SolarEclipsesPage.pageRendered)
            return;

        SolarEclipsesPage.reset();
        var startJD = PageTimeInterval.JD;
        var numberOfConjunctions =  Math.round(PageTimeInterval.days / MoonEclipsesPage.dataSource.sinodicPeriod);

        var startK = GetAAJS().Moon.kForJD (startJD);
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

    getTypeOfEclipseString : function (eclipseData) {
        var oldOpt = TimeStepsData.useLocalTime;
        TimeStepsData.useLocalTime = false;
        TimeStepsData.useLocalTime = oldOpt;
        var description = "";
     
        if (eclipseData.isPartial)
            description += "Partial ";
        if (eclipseData.isTotal)
            description += "Total ";
        if (eclipseData.isAnnular)
            description += "Annular ";
        if (eclipseData.isAnnularTotal)
            description += "Hybrid ";
        description += "Eclipse.";
        
        if ((eclipseData.besselianElements.besselianEngine.deltaLocalMax > Math.abs(eclipseData.besselianElements.besselianEngine.l1LocalMax)) ||
            !eclipseData["t1"]) {
            description += " Not visible from your location.";
        }
        
        return description;
    },

    getId : function (eclipseData) {
        return "SolarEclipse" + eclipseData.t0;
    },

    drawNewEclipse: function (eclipseData) {
        var yyyymmdd_hhmmOfJD  = PlanetPage.prototype.yyyymmdd_hhmmOfJD;
        
        var addNodeChild = PlanetPage.prototype.addNodeChild;
        var mainDiv = addNodeChild(SolarEclipsesPage.hostElement, "div");
        mainDiv["id"] = this.getId(eclipseData);
        mainDiv.classList.add("solarEclipse");

        var oldOpt = TimeStepsData.useLocalTime;
        TimeStepsData.useLocalTime = false;
        var dateTime = yyyymmdd_hhmmOfJD(eclipseData.t0);
        TimeStepsData.useLocalTime = oldOpt;
        
        var description = this.getTypeOfEclipseString(eclipseData);
        
        var decimalsFactor = 1e5; 

        addNodeChild (mainDiv, "h2", dateTime.date.Y + "-" + dateTime.date.M + "-" + dateTime.date.D + " " + description);

        if (eclipseData.t1) {
            addNodeChild (mainDiv, "h3", "Local circumstances:");
            var timings = addNodeChild (mainDiv, "span");
            var t1 = yyyymmdd_hhmmOfJD(eclipseData.t1);
            var contents = "T1: " + t1.time.Ord3 + ":" +  t1.time.Ord2;
            contents += " PA1: " + Math.round(eclipseData.PA1);
            
            if (eclipseData.t2) {
                var t2 = yyyymmdd_hhmmOfJD(eclipseData.t2);
                contents += " T2: " + t2.time.Ord3 + ":" +  t2.time.Ord2;
            }

            var tMax = eclipseData["tMax"];
            var splitTmax = yyyymmdd_hhmmOfJD(tMax);
            contents += " Tmax: " + splitTmax.time.Ord3 + ":" +  splitTmax.time.Ord2;

            if (eclipseData.t3) {
                var t3 = yyyymmdd_hhmmOfJD(eclipseData.t3);
                contents += " T3: " + t3.time.Ord3 + ":" +  t3.time.Ord2;
            }
            
            var t4 = yyyymmdd_hhmmOfJD(eclipseData.t4);
            contents += " T4: " + t4.time.Ord3 + ":" +  t4.time.Ord2;
            contents += " PA4: " + Math.round(eclipseData.PA4);
            
            contents += " Magnitude: " +  GetAAJS().Numerical.RoundTo2Decimals(eclipseData["magnitude"]);

            timings.textContent = contents;
        }

        addNodeChild (mainDiv, "h3", "Besselian elements:");
        addNodeChild (mainDiv, "span", "T0 = " + dateTime.time.Ord3 + ":" +  dateTime.time.Ord2 + " DT");
        
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

        var row = addNodeChild (table, "tr");
        addNodeChild(row, "td", "tan (f1)");
        addNodeChild (row, "td", Math.round(eclipseData.besselianElements.tan_f1 * 1e7)/1e7);
        for (var i = 0; i < 3; i++)
         addNodeChild (row, "td", "0");

        row = addNodeChild (table, "tr");
        addNodeChild(row, "td", "tan (f2)");
        addNodeChild (row, "td", Math.round(eclipseData.besselianElements.tan_f2 * 1e7)/1e7);
        for (var i = 0; i < 3; i++)
         addNodeChild (row, "td", "0");
         
                
    },
    keywordsArray : ["Besselian", "Elements", "Shadow", "Umbra", "Penumbra", "Antumbra", "Partial", "Total", "Annular", "Eclipse",
                      "Contact", "First", "Last"]
    
};

(function(){
    var initLocal = function() {
        try {
        SolarEclipsesPage.dataSource = SolarEclipses;
        SolarEclipsesPage.reset = PlanetPage.prototype.reset;
        Pages["Solar Eclipses"] = SolarEclipsesPage;
        } catch (err) {
            SyncedTimeOut(initLocal, Timeout.onInit);
        }
    };
    initLocal();
})();

