/*
               
Copyright 2017  Herr_Alien <alexandru.garofide@gmail.com>
                
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
                
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
                
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see https://www.gnu.org/licenses/agpl.html
*/

var TimeStepsData = {
	// this is the model
    yearToStart: 2017,
    monthToStart : 1,
    dayToStart : 1,
    numberOfDays : 410,
    timestep : 1,
    
    onTimestepUpdated : Notifications.NewNoParameter(),

	Controls : {
		dateInput : document.getElementById ("startingDate"),
		daysCountInput: document.getElementById ("numberOfDays"),
        stepSizeInput: document.getElementById ("incrementDate"),
		
		update: function () {
			var attrMap = {"daysCountInput" : "numberOfDays", 
                            "stepSizeInput" : "timestep"};
			for (var k in attrMap)
				TimeStepsData.Controls[k].value = TimeStepsData[attrMap[k]];
            
            var dateToSet = new Date ();
            dateToSet.setUTCDate (TimeStepsData.dayToStart);
            dateToSet.setUTCMonth(TimeStepsData.monthToStart-1);
            dateToSet.setUTCFullYear(TimeStepsData.yearToStart);
            TimeStepsData.Controls.dateInput.valueAsDate = dateToSet;
		},
        
        commitUserValues : function () {
            TimeStepsData.numberOfDays = TimeStepsData.Controls.daysCountInput.value * 1.0;
            TimeStepsData.timestep = TimeStepsData.Controls.stepSizeInput.value * 1.0;
            var selDate = TimeStepsData.Controls.dateInput.valueAsDate;
            if (selDate) {
                TimeStepsData.yearToStart = selDate.getFullYear();
                TimeStepsData.monthToStart = 1 + selDate.getMonth();
                TimeStepsData.dayToStart = selDate.getDate();
            }
            TimeStepsData.onTimestepUpdated.notify();
        }
	},
	
	init : function () {
		TimeStepsData.Controls.update();
        TimeStepsData.onTimestepUpdated.notify();
	}
};
