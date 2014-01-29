var barticusApp = angular.module('barticusApp', []);

//http://www.w3schools.com/html/html5_geolocation.asp

barticusApp.service('bartapi', ['$http', function ($http) {
    this.getLatLong = function (callback) {
        navigator.geolocation.getCurrentPosition(function (data) {
            // TODO, handle failure...
            callback(data.coords.latitude, data.coords.longitude);
        });
    }
    var cachedstations = null;
    this.getStations = function (callback) {
        if(cachedstations) {
            debugger;
            callback(cachedstations);
            return;
        }
        $http.get("http://api.bart.gov/api/stn.aspx?cmd=stns&key=MW9S-E7SL-26DU-VV8V")
            .success(function (data, status) {

                var xml = new DOMParser().parseFromString(data, "text/xml");
                var stationsElements = xml.getElementsByTagName("station");
                var stations = [];
                for (var i = 0; i < stationsElements.length; i++) {

                    var stationElement = stationsElements[i];
                    stations[i] = {
                        name: stationElement.getElementsByTagName("name")[0].childNodes[0].nodeValue,
                        abbr: stationElement.getElementsByTagName("abbr")[0].childNodes[0].nodeValue,
                        latitude: stationElement.getElementsByTagName("gtfs_latitude")[0].childNodes[0].nodeValue,
                        longitude: stationElement.getElementsByTagName("gtfs_longitude")[0].childNodes[0].nodeValue,
                        address: stationElement.getElementsByTagName("address")[0].childNodes[0].nodeValue,
                        city: stationElement.getElementsByTagName("city")[0].childNodes[0].nodeValue,
                        county: stationElement.getElementsByTagName("county")[0].childNodes[0].nodeValue,
                        state: stationElement.getElementsByTagName("state")[0].childNodes[0].nodeValue,
                        zip: stationElement.getElementsByTagName("zipcode")[0].childNodes[0].nodeValue
                }
            }
        cachedstations = stations;
        callback(stations);
    })
    .error(function (data, status) {
        alert("error getting stations " + status);
    });

}
}])
;

var indexController = function ($scope, $http, bartapi) {

    bartapi.getLatLong(function (lat, long) {
        //$scope.$apply(function() {
            $scope.lat = lat;
            $scope.long = long;
        //});
    });

    bartapi.getStations(function (stations) {
        $scope.stations = stations;
        //$scope.$apply();
    });
};
