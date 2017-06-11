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

var MoonEclipsesPage = {

    hostElement : document.getElementById("MoonEclipses"),
    pageRendered : false,
    dataSource : MoonEclipsesData,

    // clears up the rendered thing
    reset : PlanetPage.prototype.reset,
    
    displayPage : function (startJD, numberOfDays) {
        
        if (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded())
            return setTimeout (function() { MoonEclipsesPage.displayPage(startJD, numberOfDays); }, 300);

        if (MoonEclipsesPage.pageRendered)
            return;

        MoonEclipsesPage.reset();
        var endJD = startJD + numberOfDays;
        
        function processJD (JD) {
            if (JD >= endJD) {
                MoonEclipsesPage.pageRendered = true;
                return;
            }
            
            var oppositionData = MoonEclipsesPage.dataSource.calculateEclipseForJD (JD);
            if (oppositionData.eclipse) 
                MoonEclipsesPage.drawNewEclipse (oppositionData);
            
            setTimeout (function() { processJD(oppositionData.JD + MoonEclipsesPage.dataSource.sinodicPeriod); }, 1);
        }
        
        processJD(startJD);
    },
    
    displayTimings : function (oppositionData, mainDiv) {
        var addNodeChild = PlanetPage.prototype.addNodeChild;
        
        function yyyymmdd_hhmmOfJD (JD) {
            var fullDayJD = 0.5 + Math.floor(JD - 0.5);
            var dayFraction = JD - fullDayJD;
            if (dayFraction < 0) dayFraction += 1;
            
            var dateOfJD =  AAJS.Date.JD2Date(fullDayJD);

            if (dateOfJD.M < 10) dateOfJD.M = "0" + dateOfJD.M;
            if (dateOfJD.D < 10) dateOfJD.D = "0" + dateOfJD.D;
            
            var roundedTime = Math.round(dayFraction * 24 * 3600) / 3600;
            var sexagesimalTime = AAJS.Numerical.ToSexagesimal (roundedTime);

            if (sexagesimalTime.Ord3 < 10) sexagesimalTime.Ord3 = "0" + sexagesimalTime.Ord3;
            if (sexagesimalTime.Ord2 < 10) sexagesimalTime.Ord2 = "0" + sexagesimalTime.Ord2;
            if (sexagesimalTime.Ord1 < 10) sexagesimalTime.Ord1 = "0" + sexagesimalTime.Ord1;
            
            return { 'date': dateOfJD, 'time' : sexagesimalTime };
        }
        
        // get the JD of the opposition
        var oppositionDateTime = yyyymmdd_hhmmOfJD(oppositionData.JD);
        var description = "Eclipse through the penumbra";
        if (oppositionData.umbralPartialEclipse)
            description = "Partial eclipse";
        if (oppositionData.umbralTotalEclipse)
            description = "Total eclipse";
        

        addNodeChild (mainDiv, "h2", oppositionDateTime.date.Y + "-" + oppositionDateTime.date.M + "-" + oppositionDateTime.date.D + " " + description);
        addNodeChild (mainDiv, "span", "magnitude: " + AAJS.Numerical.RoundTo2Decimals(oppositionData.magnitude) + "; penumbral magnitude: " + AAJS.Numerical.RoundTo2Decimals(oppositionData.penumbralMagnitude));
        
        var timingsTable = addNodeChild (mainDiv, "table");
        var headerRow = addNodeChild (timingsTable, "tr");
        var headerPhaseColumn = addNodeChild (headerRow, "th", "Phase");
        var headerTimeColumn = addNodeChild (headerRow, "th", "UTC");
        
        function addTiming (JD, description, timingsTable) {
            var addNodeChild = PlanetPage.prototype.addNodeChild;
            var tr = addNodeChild (timingsTable, "tr");
            var dt = yyyymmdd_hhmmOfJD(JD);
            addNodeChild (tr, "td", description);
            addNodeChild (tr, "td", dt.time.Ord3 + ":" +  dt.time.Ord2+ ":" +  dt.time.Ord1);
        }
        
        addTiming (oppositionData.Timings.Penumbral.firstContact, "Start of penumbral eclipse (TP1)", timingsTable);
                   
        if (oppositionData.umbralPartialEclipse) {
            addTiming (oppositionData.Timings.Umbral.firstContact, "Start of umbral eclipse (TU1)", timingsTable);

            if (oppositionData.umbralTotalEclipse)
                addTiming (oppositionData.Timings.Umbral.beginFullImmersion, "Start of totality (TU2)", timingsTable);
        }
        
        // maximum ...
        addTiming (oppositionData.Timings.Maximum, "Eclipse maximum (TM)", timingsTable);
        
        if (oppositionData.umbralPartialEclipse) {
            if (oppositionData.umbralTotalEclipse)
                addTiming (oppositionData.Timings.Umbral.endFullImmersion,  "End of totality (TU3)", timingsTable);
                       
            addTiming (oppositionData.Timings.Umbral.lastContact, "End of umbral eclipse (TU4)", timingsTable);
        }
        
        addTiming (oppositionData.Timings.Penumbral.lastContact, "End of penumbral eclipse (TP4)", timingsTable);
    },
    
    circle : function (svg, R, CX, CY, fillColor, strokeColor) {
        var c = svg.ownerDocument.createElementNS ("http://www.w3.org/2000/svg", "circle");
        svg.appendChild (c);
        c.setAttribute ("cx", CX);
        c.setAttribute ("cy", CY);
        c.setAttribute ("r", R);
        c.setAttribute ("fill", fillColor);
        c.setAttribute ("stroke", strokeColor);
        c.setAttribute ("stroke-width", 1);
    },
    
    addLabel : function (svg, transformedPos, text) {
        var textDOM = svg.ownerDocument.createElementNS ("http://www.w3.org/2000/svg", "text");
        svg.appendChild(textDOM);
        textDOM.setAttribute("x", transformedPos.X);
        textDOM.setAttribute("y", transformedPos.Y);
        textDOM.textContent = text;
    },
    
    displayGraph : function (oppositionData, mainDiv) {
        var namespace = "http://www.w3.org/2000/svg";
        var svg = mainDiv.ownerDocument.createElementNS(namespace, "svg");
        var size = 800;
        svg.setAttribute("width", size);
        svg.setAttribute("height", size);
        mainDiv.appendChild(svg);
        
        var margin = 1;
        
        var halfwidth = 0.5 * size;
        
        var pxPerDeg = (halfwidth - margin )/(oppositionData.penumbralRadius + oppositionData.MoonDiameter );
        
        // penumbra and umbra circle
        MoonEclipsesPage.circle (svg, oppositionData.penumbralRadius * pxPerDeg, halfwidth, halfwidth, "#eeeeee", "#000000");
        MoonEclipsesPage.circle (svg, oppositionData.umbralRadius * pxPerDeg, halfwidth, halfwidth, "#CCCCCC", "#000000");
        
        function moonPxCoords (contactData) {
            return {
                'X' : -contactData.X * pxPerDeg + halfwidth,
                'Y' : halfwidth - contactData.Y * pxPerDeg
            };
        }

        var moonRadius =  oppositionData.MoonDiameter /2 * pxPerDeg;

        var cp1 = moonPxCoords (oppositionData.MoonPositions.Penumbral.firstContact);
        MoonEclipsesPage.circle (svg, moonRadius, cp1.X, cp1.Y, "none", "#000000");
        MoonEclipsesPage.addLabel (svg, cp1, "P1");
                           
        if (oppositionData.umbralPartialEclipse) {
            var cu1 = moonPxCoords (oppositionData.MoonPositions.Umbral.firstContact);
            MoonEclipsesPage.circle (svg, moonRadius, cu1.X, cu1.Y, "none", "#000000");
            MoonEclipsesPage.addLabel (svg, cu1, "U1");

            if (oppositionData.umbralTotalEclipse) {
                var cu2 = moonPxCoords (oppositionData.MoonPositions.Umbral.beginFullImmersion);
                MoonEclipsesPage.circle (svg, moonRadius, cu2.X, cu2.Y, "none", "#000000");
                MoonEclipsesPage.addLabel (svg, cu2, "U2");
            }
        }
        
        // maximum ...
         var cm = moonPxCoords ({'X' : oppositionData.xMinDistance, 'Y' : oppositionData.yMinDistance});
         MoonEclipsesPage.circle (svg, moonRadius, cm.X, cm.Y, "none", "#000000");
        MoonEclipsesPage.addLabel (svg, cm, "M");
        
        if (oppositionData.umbralPartialEclipse) {
            if (oppositionData.umbralTotalEclipse) {
                var cu3 = moonPxCoords (oppositionData.MoonPositions.Umbral.endFullImmersion);
                MoonEclipsesPage.circle (svg, moonRadius, cu3.X, cu3.Y, "none", "#000000");
                MoonEclipsesPage.addLabel (svg, cu3, "U3");
            }
                
            var cu4 = moonPxCoords (oppositionData.MoonPositions.Umbral.lastContact);
            MoonEclipsesPage.circle (svg, moonRadius, cu4.X, cu4.Y, "none", "#000000");
            MoonEclipsesPage.addLabel (svg, cu4, "U4");
         }
        
        var cp4 = moonPxCoords (oppositionData.MoonPositions.Penumbral.lastContact);
        MoonEclipsesPage.circle (svg, moonRadius, cp4.X, cp4.Y, "none", "#000000");
        MoonEclipsesPage.addLabel (svg, cp4, "P4");

    },
    
    drawNewEclipse : function (oppositionData) {
        var addNodeChild = PlanetPage.prototype.addNodeChild;
        var mainDiv = addNodeChild(MoonEclipsesPage.hostElement, "div");
        mainDiv.classList.add("moonEclipse");
        
        MoonEclipsesPage.displayTimings (oppositionData, mainDiv);
        MoonEclipsesPage.displayGraph (oppositionData, mainDiv); 
    }
}

Pages["MoonEclipsesPage"] = MoonEclipsesPage;
