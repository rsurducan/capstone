angular.module('myApp.search', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/search', {
                templateUrl: 'search/index.html',
                controller: 'SearchController'
            })
            .when('/search/:term', {
                templateUrl: 'search/index.html',
                controller: 'SearchController'
            })
            .when('/edit/:id', {
                templateUrl: 'search/edit.html',
                controller: 'EditController'
            });
    }])

    .controller('SearchController', function ($scope, $location, $routeParams, SearchService) {
        if ($routeParams.term) {
            SearchService.query($routeParams.term).then(function (response) {
                $scope.term = $routeParams.term;
                $scope.searchResults = response.data;
            });
        }

        $scope.search = function () {
            console.log("Search term is: " + $scope.term);
            SearchService.query($scope.term).then(function (response) {
                $scope.searchResults = response.data;
            });
        };

        $scope.edit = function (list) {
            $location.path("/edit/" + list.id);
        }
    })

    .controller('EditController', function ($scope, $location, $routeParams, SearchService) {
        SearchService.fetch($routeParams.id).then(function (response) {
            $scope.list = response.data;
        });

        $scope.save = function() {
            SearchService.save($scope.list).then(function(response) {
                $location.path("/search/" + $scope.list.name);
            });
        }
    })

    .factory('SearchService', function ($http) {
        var service = {
            query: function (term) {
                return $http.get('/search/' + term);
            },
            fetch: function (id) {
                return $http.get('/edit/' + id);
            },
            save: function(data) {
                return $http.put('/edit/' + data.id, data);
            }
        };
        return service;
    });
