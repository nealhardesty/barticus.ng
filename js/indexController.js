var barticusApp = angular.module('barticusApp', []);

//http://www.w3schools.com/html/html5_geolocation.asp

var indexController = function ($scope){
    $scope.foo="nein";
    navigator.geolocation.getCurrentPosition(function(data) {
        $scope.$apply(function() {
            $scope.coords = {lat:data.coords.latitude, long:data.coords.longitude};
        });
    }, function(errdata) {
        alert("narp " + errdata.code);
    });
};
