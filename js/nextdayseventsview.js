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

/* Requirement for data sources:
    // IncrementHint is just a hint on the sample rate for getting from the inernal data sources.
    // If there is reasonable evidence to suspect an event, a finer icrement should be used.
    GetEvents (countOfDays) 
    -> [ 
            { start: <JD>, end: <JD>, title: string, navigActionObj : {}},
            { start: <JD>, end: <JD>, title: string, navigActionObj : {}},
             ... ... ...
     ]

   Data sources for next events:
    - the moon and sun eclipses
    - occultations
*/


(function () {

    var domHost = document.getElementById("upcommingEventsFrontPage");

    function onDisplayEventTypeChange() {
        setTimeout(function () {
            reset();
            init();
        }, 100);
    }

    var solarEclipsesCheckBox = false;
    function displaySolarEclipses() {
        if (!solarEclipsesCheckBox) {
            solarEclipsesCheckBox = document.getElementById("futureSolarEclipsesSettings");
            solarEclipsesCheckBox.onchange = onDisplayEventTypeChange;
        }
        return solarEclipsesCheckBox && solarEclipsesCheckBox.checked;
    }

    var lunarEclipsesCheckBox = false;
    function displayLunarEclipses() {
        if (!lunarEclipsesCheckBox) {
            lunarEclipsesCheckBox = document.getElementById("futureLunarEclipsesSettings");
            lunarEclipsesCheckBox.onchange = onDisplayEventTypeChange;
        }
        return lunarEclipsesCheckBox && lunarEclipsesCheckBox.checked;
    }

    var occultationsCheckBox = false;
    function displayOccultations() {
        if (!occultationsCheckBox) {
            occultationsCheckBox = document.getElementById("futureOccultationsSettings");
            occultationsCheckBox.onchange = onDisplayEventTypeChange;
        }
        return occultationsCheckBox && occultationsCheckBox.checked;
    }

    var transitsCheckBox = false;
    function displayTransits() {
        if (!transitsCheckBox) {
            transitsCheckBox = document.getElementById("futureTransitsSettings");
            transitsCheckBox.onchange = onDisplayEventTypeChange;
        }
        return transitsCheckBox && transitsCheckBox.checked;
    }

    var eventTypeToCheckFunction = {
        "MoonEclipsesPage": displayLunarEclipses,
        "SolarEclipsesPage": displaySolarEclipses,
        "Occultations": displayOccultations,
        "Transits": displayTransits
    };

    function getEventTypesToDisplay() {
        var types = [];
        for (var type in eventTypeToCheckFunction) {
            if (eventTypeToCheckFunction[type]()) {
                types.push(type);
            }
        }
        return types;
    }

    function reset() {
        NextEvents["reset"]();
        while (domHost.hasChildNodes()) {
            domHost.removeChild(domHost.firstChild);
        }
    }

    var daysInput = document.getElementById("futureEventsNumberOfDays");
    var lastInputValue = daysInput.value;

    function updateMaxDays() {
        var max = Math.round(PageTimeInterval.JD + PageTimeInterval.days -
                   NextEvents.startJd);
        daysInput["max"] = max;
        if (Number(daysInput.value) > max) {
            daysInput.value = max;
        }
    }

    function onDaysCountChange() {
        updateMaxDays();
        if (daysInput.value != lastInputValue) {
            lastInputValue = daysInput.value;
            setTimeout(function () {
                reset();
                init();
            }, 100);
        }
    }

    function init() {

        try {

            var events = NextEvents["GetEvents"](getEventTypesToDisplay());
            var addDomNode = PlanetPage.prototype.addNodeChild;

            var yyyymmdd_hhmmOfJD = PlanetPage.prototype["yyyymmdd_hhmmOfJD"];

            var documentFrag = document.createDocumentFragment();
            for (var i = 0; i < events.length; i++) {
                var currentEvent = events[i];
                var listItem = addDomNode(documentFrag, "li");

                var timing = yyyymmdd_hhmmOfJD(currentEvent.start);
                var anchorText = Pages["Moon Ephemeris"].months[Number(timing.date.M)] + " " + timing.date.D + ", " +
                                 timing.time.Ord3 + ":" + timing.time.Ord2 + ": " + currentEvent.title;

                var anchor = addDomNode(listItem, "a", anchorText);
                anchor["href"] = "#" + JSON.stringify(currentEvent.navigActionObj);
            }

            var list = addDomNode(domHost, "ol");
            list.appendChild(documentFrag);

        } catch (err) {
            setTimeout(init, 500);
        }
    }

    init();

    (function () {

        daysInput.onblur = onDaysCountChange;
        daysInput.onchange = onDaysCountChange;
        daysInput.onkeypress = function (keyboardEvent) {
            if (keyboardEvent.key.toUpperCase() == "ENTER") {
                onDaysCountChange();
            }
        };

    })();

})();
