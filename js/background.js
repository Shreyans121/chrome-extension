var activeTabUrl = "";
var div = document.getElementById("actualTime");

var totalTimeOnWebsites = 0;

var isUserActive = true;

var today;

var todayStorageName;
var websitesToTrack;

var isFirstRun = false;

var barWidth = 15;
var barSpacing = 10;
var timeQuotes = [
    "when you kill time, remember that it has no resurrection",
    "the trouble is, you think you have time",
    "time is what we want most, but what we use worst",
    "wasting your time is the subtlest form of suicide",
    "procrastination is the foundation of all disasters",
    "the bad news is time flies. the good news is you're the pilot",
    "you can manage your life by only your time",
    "it is not the time for you to dream, it is the time for you to accomplish the mission",
    "time is much more valuable than money",
    "if time were to take on human form, would she be your taskmaster or freedom fighter?",
    "lack of direction, not lack of time, is the problem. we all have twenty-four hour days",
    "if you spend too much time thinking about a thing, you&#8217;ll never get it done",
    "the best time to start was last year. failing that, today will do"
];

function getActiveWebsite() {
    return extractDomain(activeTabUrl);
}

function isUserActiveNow() {
    return isUserActive;
}

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        isFirstRun = true;
        var data = {};

        today = numDaysSinceUTC();
        todayStorageName = "timeData" + numDaysSinceUTC();
        totalTimeOnWebsites = 0;
        websitesToTrack = ["twitter.com", "facebook.com", "plus.google.com"];

        data[todayStorageName] = totalTimeOnWebsites;
        data["today"] = numDaysSinceUTC();
        data["trackData"] = JSON.stringify(websitesToTrack);
        data["sitesLocked"] = false;
        chrome.storage.local.set(data, function(){});
    }
});

chrome.storage.onChanged.addListener(function(){
    chrome.storage.local.get("trackData", function(result){
        console.log(result.trackData);
        websitesToTrack = JSON.parse(result.trackData);
    });
});

startUp();

function startUp() {
    chrome.storage.local.get(null, function(result){
        console.log(result)
        totalTimeOnWebsites = result["timeData" + numDaysSinceUTC()];
        today = result["today"];
        websitesToTrack = (result.trackData);
    });
    updateActiveTabUrl();

    registerEvents(); 

    isUserActive = true;

    updateData();
    setInterval(function(){
    if(isNewDay()){
        updateData();
      }
    }, 1000);

}



function updateData(){
    // totalTimeOnWebsites = 0;
    var newStorageName = "timeData" + numDaysSinceUTC();
    var newData = {};
    newData[newStorageName] = totalTimeOnWebsites;
    todayStorageName = newStorageName;
    today = numDaysSinceUTC();
    newData["today"] = numDaysSinceUTC();
    console.log(newData)
    chrome.storage.local.set(newData, function(){});
    displayTime();
}
function displayTime() {
    
        var totalTimeSpent = totalTimeOnWebsites;
        console.log(totalTimeSpent);
        var div = document.getElementById("actualTime");
        div.innerHTML = getReadableTime(totalTimeSpent);
        var storageName = "timeData" + numDaysSinceUTC();
        var dataToBeWritten = {};
        dataToBeWritten[storageName] = totalTimeSpent;
        dataToBeWritten["today"] = numDaysSinceUTC();
        // console.log(dataToBeWritten);
        chrome.storage.local.set(dataToBeWritten, function(){});
    
}

function getReadableTime(totalSeconds) {
    var seconds = totalSeconds % 60;
    var minutes = (Math.floor(totalSeconds/60))%60;
    var hours = (Math.floor(totalSeconds/3600));
    var readableTime = '';
    if (hours > 1) 
        readableTime += hours + ' hours ';
    else if(hours == 1)
        readableTime += hours + ' hour '
    if (minutes > 1)
        readableTime += minutes + ' minutes and ' ;
    else if(minutes == 1)
        readableTime += minutes + ' minute and '
    if(seconds == 1){
        readableTime += seconds + ' second ';
    }else{
        readableTime += seconds + ' seconds ';
    }
    return readableTime;
}

function registerEvents() {
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        updateActiveTabUrl();
    });

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        updateActiveTabUrl();
    });

    chrome.windows.onFocusChanged.addListener(function(windowId) {
        if (windowId === chrome.windows.WINDOW_ID_NONE) {
            isUserActive = false;
        } else {
            isUserActive = true;
        }
        updateActiveTabUrl();
    });
    console.log("reg")
    window.setInterval(intervalListener, 1000); 
}

function intervalListener() {
    updateTotalTime();
}

function updateTotalTime() {
    // console.log(totalTimeOnWebsites)
    var currDomain = getActiveWebsite();
    console.log(isWatchedWebsite(currDomain))  
    if(isUserActiveNow() && isWatchedWebsite(currDomain)){
        totalTimeOnWebsites += 1; 
    }
    updateData();
    // totalTimeOnWebsites += 1;
}

function isWatchedWebsite(domainName){
    // console.log(domainName);
    var idx = websitesToTrack.indexOf(domainName);
    if(idx == -1) {
        return false;
    }
    else {
        return true;
    }
}

function getLastRefreshTime() {
    return lastRefreshTimeStamp;
}

function updateActiveTabUrl() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { 
        console.log(tabs)
        if (tabs.length < 1) { 
            activeTabUrl = null;
        } else {
            activeTabUrl = tabs[0].url;
            console.log(activeTabUrl)
        }
    });
}

function extractDomain(str) {
    var strList = str.split(":\/\/");
    if (strList.length > 1) {
        str = strList[1];
    } else {
        str = strList[0];
    }
    str = str.replace(/www\./g,'');
    
    var domainName = str.split('\/')[0];
    return domainName;
}


function getTimeOnFbTwitter(){
    return totalTimeOnWebsites;
}

function numDaysSinceUTC(){
    var NUM_MILI_IN_A_DAY = 86400000;
    var today = new Date();
    var utcMili = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()); // miliseconds since UTC
    return (utcMili/ NUM_MILI_IN_A_DAY);
}

function isNewDay(){
    return (numDaysSinceUTC() - today >= 1);
}

function todayTimeData(){
    return todayStorageName;
}

$(document).ready(function(){

    var backgroundPage = chrome.extension.getBackgroundPage();
    while(backgroundPage === null){
      backgroundPage = chrome.extension.getBackgroundPage();  
    }
 
    chrome.storage.local.get("sitesLocked", function(result){
        // result.sitesLocked = false;
        if(backgroundPage !== null && backgroundPage.isFirstRun) {
            $('.settingsPanel').addClass('is-visible');
            $('.tracksiteInput').addClass('inputEnabled');
            $('.lockBtn').remove();
            $('.buttonsContainer').append("<img src = \"images/button_OK.png\" class = \"done\">");
            $('.done').css({"float" : "none" , "margin" : "0 auto"})
        }else if(result.sitesLocked){
            $('.done').remove();
            $('.editBtn').remove();
            $('.lockBtn').remove();
            $('.tracksiteInput').removeClass("inputEnabled");
            $('.tracksiteInput').addClass("inputDisabled");
            $('.tracksiteInput').prop("disabled", true);
        } else {
            $('.done').remove();
            $('.tracksiteInput').css({"border": "none"});
            $('.tracksiteInput').prop("disabled", true);
            $('.tracksiteInput').removeClass('inputEnabled');
            $('.tracksiteInput').addClass('inputDisabled');
            $('.buttonsContainer').append("<img src = \"images/button_EDIT.png\" class = \"editBtn\">");
        }

    });
    

    if(chrome.extension.getBackgroundPage().isFirstRun){
        chrome.storage.local.get("trackData", function(result){
               var sitesBeingTracked = JSON.parse(result.trackData);
               document.getElementById("firstSite").value = sitesBeingTracked[0];
               document.getElementById("secondSite").value = sitesBeingTracked[1];
               document.getElementById("thirdSite").value = sitesBeingTracked[2];
               document.getElementById("fourthSite").value = (sitesBeingTracked[3] === undefined) ? "" : sitesBeingTracked[3];
               document.getElementById("fifthSite").value = (sitesBeingTracked[4] === undefined) ? "" : sitesBeingTracked[4];
        });
    } else {
        chrome.storage.local.get("trackData", function(result){
            var sitesBeingTracked = JSON.parse(result.trackData);
            var inputFieldIds = ["firstSite", "secondSite", "thirdSite", "fourthSite", "fifthSite"];
            var inputIdPos = 0;
            for(var i = 0 ; i < 5 ;i++){
                if(sitesBeingTracked[i] != "") {
                    document.getElementById(inputFieldIds[inputIdPos]).value = sitesBeingTracked[i];
                    inputIdPos++;
                }
            }
        });
    }

    displayTime();

    setInterval(function(){
         displayTime(); 
     }, 1000);

    $('.settings').on('click', function(event){
        $('.settingsPanel').addClass('is-visible');
    });


    $('.settingsPanel').on('click', function(event){
        if($(event.target).is('.done')) { 
            $('.editBtn').remove();
            if(chrome.extension.getBackgroundPage().isFirstRun){
                $('.settingsPanel').removeClass('is-visible');
            }

            var firstSiteBeingTracked = document.getElementById("firstSite").value;
            var secondSiteBeingTracked = document.getElementById("secondSite").value;
            var thirdSiteBeingTracked = document.getElementById("thirdSite").value;
            var fourthSiteBeingTracked = document.getElementById("fourthSite").value;
            var fifthSiteBeingTracked = document.getElementById("fifthSite").value;

            var sitesBeingTracked = [firstSiteBeingTracked, secondSiteBeingTracked, thirdSiteBeingTracked, fourthSiteBeingTracked, fifthSiteBeingTracked];
            var sitesBeingTrackedStorable = JSON.stringify(sitesBeingTracked);
            chrome.storage.local.set({"trackData" : sitesBeingTrackedStorable}, function(){});
            chrome.extension.getBackgroundPage().isFirstRun = false;
            $('.tracksiteInput').removeClass('inputEnabled');
            $('.tracksiteInput').addClass('inputSaved');
            var delay = 300;
            setTimeout(function() {
                $('.tracksiteInput').removeClass('inputSaved');
            }, delay);
            $('.tracksiteInput').addClass('inputDisabled');
            $('.tracksiteInput').prop("disabled", true);
            $('.done').remove();
            $('.lockBtn').remove();
            $('.buttonsContainer').append("<img src = \"images/button_EDIT.png\" class = \"editBtn\">").on('click', function(){
                $('.tracksiteInput').prop("disabled", false);
                $('.tracksiteInput').removeClass('inputDisabled');
                $('.tracksiteInput').addClass("inputEnabled");
                $('.done').remove();
                $('.editBtn').remove();
                $('.lockBtn').remove();
                $('.buttonsContainer').append("<img src = \"images/button_LOCK.png\" class = \"lockBtn\"><img src = \"images/button_OK.png\" class = \"done\">");
            });

        }        

        if($(event.target).is('.settingsPanel') && !chrome.extension.getBackgroundPage().isFirstRun) {
            // chrome.storage.local.set({"sitesLocked" : false}, function(){});
            chrome.storage.local.get("sitesLocked", function(result){
                console.log(result)
                if(!result.sitesLocked) {
                    $('.settingsPanel').removeClass('is-visible');
                    $('.editBtn').remove();
                    $('.tracksiteInput').removeClass('inputEnabled');
                    $('.tracksiteInput').addClass('inputDisabled');
                    $('.tracksiteInput').prop("disabled", true);
                    $('.done').remove();
                    $('.lockBtn').remove();
                    $('.buttonsContainer').append("<img src = \"images/button_EDIT.png\" class = \"editBtn\">").on('click', function(){
                        $('.tracksiteInput').prop("disabled", false);
                        $('.tracksiteInput').addClass("inputEnabled");
                        $('.done').remove();
                        $('.editBtn').remove();
                        $('.lockBtn').remove();
                        $('.buttonsContainer').append("<img src = \"images/button_LOCK.png\" class = \"lockBtn\"><img src = \"images/button_OK.png\" class = \"done\">");
                    });
                }else{
                    $('.settingsPanel').removeClass('is-visible');
                }

            });
        }

        if($(event.target).is('.lockBtn')) {
            vex.defaultOptions.className = 'vex-theme-top';
            vex.dialog.confirm({
                message: 'You sure? <br/> <br/> Clicking OK will permanently lock list of your choices, disallowing any further edits. <br/> You cannot undo this action.',
                callback : function(value){
                    if(value){
                        chrome.storage.local.set({"sitesLocked" : true}, function(){});
                        $('.editBtn').remove();
                        $('.lockBtn').remove();
                        $('.done').remove();
                        $('.tracksiteInput').removeClass("inputEnabled");
                        $('.tracksiteInput').addClass("inputDisabled");
                        $('.tracksiteInput').prop("disabled", true);
                    }
                }
            });
        }

        if($(event.target).is('.editBtn')){
            $('.tracksiteInput').prop("disabled", false);
            $('.tracksiteInput').removeClass('inputDisabled');
            $('.tracksiteInput').addClass("inputEnabled");
            $('.editBtn').remove();
            $('.lockBtn').remove();
            $('.done').remove();
            $('.buttonsContainer').append("<img src = \"images/button_LOCK.png\" class = \"lockBtn\"><img src = \"images/button_OK.png\" class = \"done\">");
        }
    });

    var windowHeight = $(window).height();
    $(".container").css({
        "height" : windowHeight * 0.36,
        "margin-top" : windowHeight * 0.25
    });

    if(chrome.extension.getBackgroundPage().totalTimeOnWebsites >= 0){
        var randomQuote = timeQuotes[Math.floor(Math.random() * timeQuotes.length)];
        var trackerDisplay = document.getElementById("websites");
        trackerDisplay.innerHTML = randomQuote;
    }else{
        var trackerDisplay = document.getElementById("websites");
        trackerDisplay.innerHTML = "going great!";
    }

    // var forLabels = [];
    // var forValues = [];
    // chrome.storage.local.get(null, function(extDatas){
    //     // console.log(extDatas)

    //     for(var prop in extDatas){
    //         if(prop.lastIndexOf("timeData", 0) === 0){
    //             forLabels.push(prop);
    //             forValues.push(extDatas[prop]);
    //             console.log(forLabels)
    //         }
    //     }


    //     var barChartData = {
    //             labels : [].concat(forLabels),
    //             datasets : [
    //                 {
    //                     fillColor : "rgba(220,220,220,0.6)",
    //                     data : [].concat(forValues)
    //                 }
    //             ],

    //             getNumData : function(){
    //                 return Number(this.labels.length);
    //             }
    //     }

    //     var chartView = document.getElementById("myChart");
    //     var ctx = chartView.getContext("2d");
    //     window.myBar = new Chart(ctx).Bar(barChartData, {
    //         responsive : false,
    //         barShowStroke : false,
    //         scaleShowGridLines : false,
    //         showScale : false,
    //         showTooltips :false,
    //         barValueSpacing  : 13
    //     });

    //     var totalWidthBars = barWidth * barChartData.getNumData();
    //     var totalWidthSpacing = barSpacing * (barChartData.getNumData() - 1);
    //     var totalWidthChart = totalWidthBars + totalWidthSpacing;
    //     var left = ($(window).width() - totalWidthChart)/2;

    //     $("#myChart").css({
    //         "width": totalWidthChart,
    //         "height" : "50%",
    //         "left" : left
    //     });
    // });


});

// $(window).resize(function(){
//     var totalWidthChart = $("#myChart").width();
//     var left = ($(window).width() - totalWidthChart)/2;

//     var windowHeight = $(window).height();
//     var windowWidth  = $(window).width();

//     $("#myChart").css({
//         "width": totalWidthChart,
//         "height" :  windowHeight * 0.5,
//         "left" : left
//     });

//     $(".container").css({
//         "height" : windowHeight * 0.36,
//         "margin-top" : windowHeight * 0.25
//     });
// });