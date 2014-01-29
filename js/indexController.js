var barticusApp = angular.module('barticusApp', []);

//http://www.w3schools.com/html/html5_geolocation.asp

var indexController = function ($scope){
    navigator.geolocation.getCurrentPosition(function(data) {
        $scope.$apply(function() {
            $scope.coords = {lat:data.coords.latitude, long:data.coords.longitude};
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", "http://api.bart.gov/api/stn.aspx?cmd=stns&key=MW9S-E7SL-26DU-VV8V", false);
            xmlhttp.send();
            $scope.statusText = xmlhttp.statusText;
            $scope.stations = xmlhttp.responseText;
            var xml = xmlhttp.responseXML;
            $scope.stationnames = [];
            for(var i in xml.getElementsByTagName("name")) {
                $scope.stationnames[i] = xml.getElementsByTagName("name")[i].childNodes[0].nodeValue;
            }
           // $scope.stationnames = xml.getElementsByTagName("name");
            $scope.stationname = xml.getElementsByTagName("name")[0];
            //debugger;
            console.log(xml.getElementsByTagName("name")[0]);

        });
    }, function(errdata) {
        alert("narp getting geo " + errdata.code);
    });
};
