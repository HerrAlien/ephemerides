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

var MoonOccultationWrapper = {
    getDataAsObjectForJD : function (jd) {
        var moonData = MoonData.getDataAsObjectForJD(jd);
        moonData['Parallax'] = moonData.parallax;
        moonData['RA'] = moonData.RaGeo;
        moonData['Dec'] = moonData.DecGeo;
        return moonData;
    }
}


var SolarEclipses = {
    ComputeOneFunctionValueForElements : function (jd) {        
        var values = {
            "x"      : 0,
            "y"      : 0,
            "d"      : 0,
            "mu"     : 0,
            "l1"     : 0,
            "l2"     : 0,
            "tan_f1" : 0,
            "tan_f2" : 0,
        };
        // do the computations
                
        var sunData  =  SunData.getDataAsObjectForJD(jd);
        var moonData = MoonOccultationWrapper.getDataAsObjectForJD(jd);
        
        var degra = Math.PI / 180;
        var moonParallaxRads = moonData.Parallax * degra;
        var sunParallaxRads = sunData.Parallax * degra;
        var moonDecRads = moonData.Dec* degra;
        
        // -------------------------------------------------
        var r = 1 / Math.sin (moonParallaxRads);
        var b = Math.sin(sunParallaxRads) * r ;
        values.d = sunData.Dec - (b / (1-b))*(moonData.Dec - sunData.Dec);
        if (values.d < 0)
            values.d += 360;

        var a = sunData.RA - (b / (1-b))*Math.cos(moonDecRads)/Math.cos(sunData.Dec * degra) * (moonData.RA - sunData.RA);
        values.mu = 15*(AAJS.Sidereal.ApparentGreenwichSiderealTime(jd) - a);
        if (values.mu < 0)
            values.mu += 360;
        
        // -------------------------------------------------
        var d = values.d * degra;
        var moonRaMinusA_Rads = ((moonData.RA - a) * 15 ) * degra;

        values.x = r * Math.cos(moonDecRads) * Math.sin(moonRaMinusA_Rads);
        values.y = r * (Math.sin(moonDecRads) * Math.cos(d) - Math.cos(moonDecRads) * Math.sin(d) * Math.cos(moonRaMinusA_Rads));
        var z = r * (Math.sin(moonDecRads) * Math.sin(d) + Math.cos(moonDecRads) * Math.cos(d) * Math.cos(moonRaMinusA_Rads));
        
        // -------------------------------------------------
        var r_prime =  1 / Math.sin(sunParallaxRads);
        var H = (sunData.Diameter / 2) * degra;
        var g = 1- b;
        var moonEarthRadiiRatio = 0.27227;
        // penumbral
        var f1 = Math.asin( (Math.sin(H) + moonEarthRadiiRatio*Math.sin(sunParallaxRads)) / ( g ) );
        values.tan_f1 = Math.tan(f1);
        // umbral
        var f2 = Math.asin( (Math.sin(H) - moonEarthRadiiRatio*Math.sin(sunParallaxRads)) / ( g ) );
        values.tan_f2 = Math.tan(f2);
        
        // --------------------------------------------------
        values.l1 = z * values.tan_f1 + moonEarthRadiiRatio/Math.cos(f1);
        values.l2 = z * values.tan_f2 - moonEarthRadiiRatio/Math.cos(f2);

        return values;
    },
    
    ComputeFunctionValuesForElements : function (jd) {
        var functionValues = {
                "x"      : [0,0,0,0,0,0,0],
                "y"      : [0,0,0,0,0,0,0],
                "d"      : [0,0,0,0,0,0,0],
                "mu"     : [0,0,0,0,0,0,0],
                "l1"     : [0,0,0,0,0,0,0],
                "l2"     : [0,0,0,0,0,0,0],
                "tan_f1" : [0,0,0,0,0,0,0],
                "tan_f2" : [0,0,0,0,0,0,0]
        };
        
        // compute 7 values, at time jd -3h, jd-2h, jd -1h, jd, jd + 1h, jd + 2h, jd + 3h
        var oneHour = 1/24;
        var startJD = jd - 3*oneHour;
        var endJD = jd + 3*oneHour;
        
        var i = 0;
        for (var currentJD = startJD; currentJD <= endJD; currentJD+= oneHour) {
            var oneSetOfValues = this.ComputeOneFunctionValueForElements(currentJD);
            for (var key in functionValues) {
                functionValues[key][i] = oneSetOfValues[key];
            }
            i++;
        }
        
        // the mu may wrap over 360
        var wrappedValues = false;
        for (var i = 0; i < functionValues.mu.length - 1 && !wrappedValues; i++) {
            wrappedValues = Math.abs(functionValues.mu[i] - functionValues.mu[i+1]) > 180;
        }
            
        if (wrappedValues) {
            for (var i = 0; i < functionValues.mu.length; i++) {
                if (functionValues.mu[i] < 180) {
                    functionValues.mu[i] += 360;
                }
            }
        }
        
        return functionValues;
    },
    
    ComputeBesselianElements : function (jd) {
        var elements = {};
        var functionValues = this.ComputeFunctionValuesForElements(jd);
        for (var key in functionValues) {
            //elements[key] = AAJS.Numerical.ValuesToPolynomialCoefficients_Average(functionValues[key]);
            elements[key] = FunctionFitting.PolynomialLSF(functionValues[key], [-3, -2, -1, 0, 1, 2, 3], 3);
        }

        elements['tan_f1'] = elements['tan_f1'][0];
        elements['tan_f2'] = elements['tan_f2'][0];
        
        if (elements['mu'][0] > 360)
            elements['mu'][0] -= 360;
        
        elements['mu'][3] = 0;
        elements['d'][3] = 0;
         
        return elements;
    },
    
    EclipseDataForK : function (k) {
        // check if you have an eclipse
        var eclipseData = AAJS.Eclipses.CalculateSolar (k);
        if (eclipseData.bEclipse) {
            // if yes, compute the besselian elements
            eclipseData["t0"] = Math.round (eclipseData.JdOfMaximumEclipse * 24) / 24;
            eclipseData["besselianElements"] = this.ComputeBesselianElements(eclipseData["t0"]);
        }
        return eclipseData;
    },

    reset : function () {

    }

};

