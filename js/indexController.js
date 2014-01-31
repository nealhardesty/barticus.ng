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
        if (cachedstations) {
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

    this.getSchedule = function (station, callback) {
        $http.get("http://api.bart.gov/api/etd.aspx?cmd=etd&key=MW9S-E7SL-26DU-VV8V&orig=" + station.abbr)
            .success(function (data, status) {
                var xml = new DOMParser().parseFromString(data, "text/xml");

                var lastupdated = xml.getElementsByTagName("time")[0].childNodes[0].nodeValue;
                var etds = {};
                var etdElements = xml.getElementsByTagName("etd");
                for (var i = 0; i < etdElements.length; i++) {
                    var etdElement = etdElements[i];
                    var destination = etdElement.getElementsByTagName("destination")[0].childNodes[0].nodeValue;
                    if (!etds[destination]) {
                        etds[destination] = {};
                        etds[destination].name = destination;
                        etds[destination].departures = [];
                    }
                    var estimates = etdElement.getElementsByTagName("estimate");
                    for (var j = 0; j < estimates.length; j++) {
                        var estimate = estimates[j];
                        var minutes = estimate.getElementsByTagName("minutes")[0].childNodes[0].nodeValue;
                        if (minutes == "Leaving") {
                            minutes = 0;
                        }
                        etds[destination].departures.push(minutes);
                    }
                }
                var sortedEtds = [];
                for (var key in etds) {
                    sortedEtds.push(etds[key]);
                }
                sortedEtds.sort(function (a, b) {
                    if (a.departures.length < 1) {
                        return -1;
                    }
                    if (b.departures.length < 1) {
                        return 1;
                    }
                    if (parseInt(a.departures[0]) < parseInt(b.departures[0])) {
                        return -1;
                    }
                    if (parseInt(a.departures[0]) > parseInt(b.departures[0])) {
                        return 1;
                    }
                    return 0;
                });
                callback(sortedEtds, lastupdated);
            })
            .error(function (data, status) {
                alert("error getting schedule " + status);
            });
    }

    this.calcDistance = function (lat1, lon1, lat2, lon2) {
        // Spherical Law of Cosines
        // acos(sin(lat1)*sin(lat2) + cos(lat1)*cos(lat2)*cos(lon2-lon1)) * (6371)

        var MEAN_EARTH_RADIUS = 6371.0;

        return Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * MEAN_EARTH_RADIUS;
    }
}]);

var indexController = function ($scope, $http, bartapi) {
    $scope.doRefresh = function () {
        $scope.etds=null;
        bartapi.getLatLong(function (lat, long) {
            $scope.lat = lat;
            $scope.long = long;
            bartapi.getStations(function (stations) {
                $scope.stations = stations;
                //$scope.$apply();
                var min = Number.MAX_VALUE;
                var closestStation = null;
                for (var i in $scope.stations) {
                    var station = $scope.stations[i];
                    station.distance = bartapi.calcDistance(lat, long, station.latitude, station.longitude);
                    if (!closestStation || station.distance < closestStation.distance) {
                        min = station.distance;
                        closestStation = station;
                    }
                }
                $scope.closeststation = closestStation;
                bartapi.getSchedule(closestStation, function (etds, lastupdated) {
                    $scope.etds = etds;
                    $scope.lastupdated = lastupdated;
                })
            });

        });
    };

    $scope.doRefresh();


};
