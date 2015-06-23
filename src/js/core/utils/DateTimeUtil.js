define(function () {

    var monthToTextMap = {
        '0' : 'Jan',
        '1' : 'Feb',
        '2' : 'Mar',
        '3' : 'Apr',
        '4' : 'May',
        '5' : 'Jun',
        '6' : 'Jul',
        '7' : 'Aug',
        '8' : 'Sep',
        '9' : 'Oct',
        '10' : 'Nov',
        '11' : 'Dec'
    };

    var daysInWeekISO = {
        0: "Monday",
        1: "Tuesday",
        2: "Wednesday",
        3: "Thursday",
        4: "Friday",
        5: "Saturday",
        6: "Sunday"
    };

    var daysInWeek = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday"
    };
    
    var weekday = {
        '0' : 'Sunday',
        '1' : 'Monday',
        '2' : 'Tuesday',
        '3' : 'Wednesday',
        '4' : 'Thursday',
        '5' : 'Friday',
        '6' : 'Saturday'
    };

    var getCurrentDay = function(){
        var date = new Date(),
            day = date.getDay(),
            fullDayName = daysInWeek[day],
            currentDay;
        for(x in daysInWeekISO){
            if(fullDayName === daysInWeekISO[x]){
                currentDay = x;
            }
        }
        return currentDay;
    };
    var getDays = function(){
        // copy current data
        var days = JSON.parse(JSON.stringify(daysInWeekISO)),
            currentDay = getCurrentDay(),
            currentWeek={}, nextWeek={};
        for(var x in days){
            if(x > currentDay) {
                currentWeek[x]=days[x];
            }else  if(x < currentDay) {
                nextWeek[x]=days[x];
            }
        }
        return {"currentWeek": currentWeek, "nextWeek": nextWeek, "currentDay": currentDay} ;
    };
    var dayNumberToName = function(dayIndex){
        return daysInWeekISO[dayIndex];
    };
    
    function monthNumberToName(monthIndex) {
        return monthToTextMap[monthIndex + ''];
    }

    return {

        getRemainingWeekDays : function(){
            return getDays();
        },

        formatDay: function(day){
            return dayNumberToName(day);
        },

        format: function(epoch, format){
            var d = new Date(0);
            d.setUTCSeconds(epoch);

            return (d.getUTCHours()+':'+ d.getUTCMinutes()+':')

            return date.format(format);
        },

        formatTimeFromDate: function( date )
        {
            var zero = '0', hours, minutes, time;

            hours = date.getHours();
            minutes = date.getMinutes();

            hours = (zero+hours).slice(-2);
            minutes = (zero+minutes).slice(-2);

            time = hours + ':' + minutes;
            var ddmmyy = date.getDate()+' '+ monthNumberToName(date.getMonth());
            return ddmmyy+' '+time;
        },

        formatDDMMYYFromDate: function(date){
            var day = date.getDate();
            var month = date.getMonth();
            var year = date.getFullYear();
            var zero = '0', hours, minutes;
            hours = date.getHours();
            minutes = date.getMinutes();
            hours = (zero+hours).slice(-2);
            minutes = (zero+minutes).slice(-2);
            var formattedDate = day+'/'+(month+1)+'/'+year+' '+hours + ':' + minutes;
            return formattedDate;
        },

        formatMMSSFromDate: function( date )
        {
            var zero = '0', minutes, seconds, time;

            minutes = date.getMinutes();
            seconds = date.getSeconds();

            minutes = (zero+minutes).slice(-2);
            seconds = (zero+seconds).slice(-2);

            time = minutes + ':' + seconds;
            return time;
        },

        formatHMMSSFromDate: function( date )
        {
            var zero = '0', hours, minutes, seconds, time;

            hours = date.getHours();
            minutes = date.getMinutes();
            seconds = date.getSeconds();

            minutes = (zero+minutes).slice(-2);
            seconds = (zero+seconds).slice(-2);

            time = hours+':'+ minutes + ':' + seconds;
            return time;
        },

        formatMMDDYYYYFromDate: function(date){
            var day = date.getDate();
            var month = date.getMonth();
            var year = date.getFullYear();
            var formattedDate = (month + 1)+'/'+day+'/'+year;
            return formattedDate;
        },

        formatHMMFromDate: function( date )
        {
            var zero = '0', hours, minutes, time;

            hours = date.getHours();
            minutes = date.getMinutes();

            minutes = (zero+minutes).slice(-2);

            time = hours+':'+ minutes;
            return time;
        },

        convertMatchTimefromSecs: function ( value )
        {
            var zero = '0', hours, minutes, seconds, time;
            time = new Date(0, 0, 0, 0, 0, value, 0);

            hours = time.getHours();
            minutes = time.getMinutes();
            seconds = time.getSeconds();

            // Pad zero values to 00
            hours = (zero+hours).slice(-2);
            minutes = (zero+minutes).slice(-2);
            seconds = (zero+seconds).slice(-2);

            time = hours + ':' + minutes + ':' + seconds;
            return time;
        },
        
        groupingDayName : function(date) {
        	
        	var today = new Date();
        	if (today.toDateString() == date.toDateString()) {
        		return App.translator.translate("TODAY");
        	}
        	
        	var tomorrow = new Date();
        	tomorrow.setDate(tomorrow.getDate() + 1); 
        	if (tomorrow.toDateString() == date.toDateString()) {
                return App.translator.translate("TOMORROW");
        	}
        	
        	var nextWeek = Date.parse(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7));
        	if (nextWeek > date) {
                return App.translator.translate((weekday[date.getDay() + '']).toUpperCase());
        	}
        	return date.getDate() + ' ' + monthToTextMap[date.getMonth()];

        }

    };
});