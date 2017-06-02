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

// planet object - {number, name, semidiameterFunctionName}
//                  "SaturnMoons"
//
/*
{'Mimas' : {'d' : '', 'color' : 'blue', 'lastPos' : {'X' : 0, 'Y' : 0} },
                    'Enceladus' : {'d' : '', 'color' : 'red', 'lastPos' : {'X' : 0, 'Y' : 0}}, 
                    'Tethys' : {'d' : '', 'color' : 'green', 'lastPos' : {'X' : 0, 'Y' : 0}}, 
                    'Dione' : {'d' : '', 'color' : 'black', 'lastPos' : {'X' : 0, 'Y' : 0}},
                    'Rhea' : {'d' : '', 'color' : 'magenta', 'lastPos' : {'X' : 0, 'Y' : 0}},
                    'Titan' : {'d' : '', 'color' : 'grey', 'lastPos' : {'X' : 0, 'Y' : 0}}};
                    */
function MoonsPage (hostElemName, dataObject, pathsConfigs){
    
    this.hostElement = document.getElementById(hostElemName);
    this.pageRendered = false;
    this.moonsData = dataObject;
    this.paths = pathsConfigs;
}

(function(){
    // clears up the rendered thing
    MoonsPage.prototype["reset"] = function () {
        while (this.hostElement.hasChildNodes()) {
            this.hostElement.removeChild(this.hostElement.firstChild);
        }
        this.moonsData.reset();
        this.pageRendered = false;
    };
    
    MoonsPage.prototype["displayPage"] = function (startJD, numberOfDays) {
        if (this.pageRendered)
            return;
        
        var pageObj = this;
        if (!AAJS.AllDependenciesLoaded())
            return setTimeout (function() { pageObj.displayPage(startJD, numberOfDays); }, 300);

        this.reset();
        
        var dayFraction = 48;
        
        var stepSize = 1/dayFraction; // one hour.
        var numberOfSteps = numberOfDays / stepSize;
    
        var width = 800;
        var vPadding = 10;
        var height = Math.ceil (numberOfSteps) + 2* vPadding;
        
        var hostSVG = this.hostElement.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg");
        hostSVG.setAttribute("width", width);
        hostSVG.setAttribute("height", height);
        hostSVG.setAttribute ("xmlns", "http://www.w3.org/2000/svg");
        this.hostElement.appendChild(hostSVG);

        var halfWidth = width/2;
        var planetRadius = halfWidth / 35;

        var currentJD = startJD;
        var coords = this.moonsData.getDataAsObjectForJD(currentJD, false);        
        
        for (var satelliteName in this.paths){
            this.paths[satelliteName].lastPos.X = coords[satelliteName].ApparentRectangularCoordinates.X * planetRadius;
            this.paths[satelliteName].lastPos.Y = coords[satelliteName].ApparentRectangularCoordinates.Y * planetRadius;
            this.paths[satelliteName].lastPos["elongation"] = Math.sqrt(this.paths[satelliteName].lastPos.X * this.paths[satelliteName].lastPos.X + this.paths[satelliteName].lastPos.Y * this.paths[satelliteName].lastPos.Y);
        }
        
        ( function (page) {
            var stepsCounter = 0;
            var satellitesPage = page;
            function getDataForPaths () {

                for (var satelliteName in satellitesPage.paths)
                    satellitesPage.paths[satelliteName].d = "M " + (satellitesPage.paths[satelliteName].lastPos.X+ halfWidth)*1.0 + " " 
                                                            + (satellitesPage.paths[satelliteName].lastPos.Y+ stepsCounter + vPadding)*1.0;
                
                var planetInitialY = stepsCounter;
                var dayLines = [];
                
                for (var i = 0 ; i < dayFraction && stepsCounter < numberOfSteps ; i++, currentJD += stepSize, stepsCounter++) {
                    var coords = satellitesPage.moonsData.getDataAsObjectForJD(currentJD, false);

                    for (var satelliteName in satellitesPage.paths){
                        satellitesPage.paths[satelliteName].lastPos.X = coords[satelliteName].ApparentRectangularCoordinates.X * planetRadius;
                        satellitesPage.paths[satelliteName].lastPos.Y = coords[satelliteName].ApparentRectangularCoordinates.Y * planetRadius; // we move down ....
                        satellitesPage.paths[satelliteName].lastPos["elongation"] = Math.sqrt(satellitesPage.paths[satelliteName].lastPos.X * satellitesPage.paths[satelliteName].lastPos.X + satellitesPage.paths[satelliteName].lastPos.Y * satellitesPage.paths[satelliteName].lastPos.Y);

                        satellitesPage.paths[satelliteName].d += " L " + (satellitesPage.paths[satelliteName].lastPos.X+ halfWidth)*1.0 + " " 
                                                                 + (satellitesPage.paths[satelliteName].lastPos.Y+ stepsCounter + vPadding)*1.0;
                    }
                    
                    if (coords.DayFraction < stepSize)
                        dayLines[dayLines.length] = {
                            "YCoord" : stepsCounter + vPadding,
                            "Month" : coords.Month,
                            "Day" : coords.Day
                        };
                }

                for (var satelliteName in satellitesPage.paths){
                    var pathElem = hostSVG.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
                    pathElem.setAttribute("d", satellitesPage.paths[satelliteName].d);
                    pathElem.setAttribute("stroke", satellitesPage.paths[satelliteName].color);
                    pathElem.setAttribute("fill", 'none');
                    pathElem.setAttribute("stroke-width", 2);
                    hostSVG.appendChild(pathElem);
                    pathElem.setAttribute("title", satelliteName);
                }
                    
                var planet = hostSVG.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
                hostSVG.appendChild (planet);
                planet.setAttribute ("fill", "orange");
                planet.setAttribute ("x", halfWidth - planetRadius);
                planet.setAttribute ("y", planetInitialY  + vPadding - 30);
                planet.setAttribute ("width", 2*planetRadius);
                planet.setAttribute ("height", stepsCounter - planetInitialY + vPadding + 30);
                
                var months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                
                for (var i = 0; i < dayLines.length; i++) {
                    var line = hostSVG.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
                    hostSVG.appendChild (line);
                    line.setAttribute ("fill", "gray");
                    line.setAttribute ("x", 0);
                    line.setAttribute ("y", dayLines[i].YCoord);
                    line.setAttribute ("width", width);
                    line.setAttribute ("height", 1);
                    
                    var text = hostSVG.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "text");
                    hostSVG.appendChild (text);
                    text.setAttribute ("x", 10);
                    text.setAttribute ("y", dayLines[i].YCoord);
                    text.textContent = months[dayLines[i].Month] + " " + dayLines[i].Day;
                    text.style["fontSize"] = "14px";
                    text.style["fontFamily"] = "Arial";

                    
                } 
                   
                if (stepsCounter < numberOfSteps) {
                    setTimeout (getDataForPaths, 10);
                } else {
                    satellitesPage.pageRendered = true;
                }
            }
            getDataForPaths();
        })(this);
         
    };
})();


// Pages["SaturnMoonsPage"] = SaturnMoonsPage;