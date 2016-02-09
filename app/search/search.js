angular.module('myApp.search', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  console.log('call routeProvider');
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
    })
    .when('/add', {
      templateUrl: 'search/add.html',
      controller: 'AddController'
    });
}])

.controller('SearchController', function($scope, $location, $routeParams, SearchService) {
  console.log('call SearchController');
  if ($routeParams.term) {
    SearchService.query($routeParams.term).then(function(response) {
      console.log('call SearchService.query');
      $scope.term = $routeParams.term;
      $scope.searchResults = response.data;
    });
  }

  $scope.search = function() {
    console.log('call SearchController.search');
    SearchService.query($scope.term).then(function(response) {
      $scope.searchResults = response.data;
    });
  };

  $scope.edit = function(list) {
    console.log('call SearchController.edit');
    $location.path("/edit/" + list.id);
  }

  $scope.add = function() {
    console.log('call SearchController.add');
    $location.path("/add");
  }
})

.controller('EditController', function($scope, $location, $routeParams, SearchService) {
  console.log('call EditController');
  SearchService.fetch($routeParams.id).then(function(response) {
    console.log('call EditController.fetch');
    $scope.list = response.data;
  });

  $scope.save = function() {
    console.log('call EditController.save');
    SearchService.save($scope.list).then(function(response) {
      $location.path("/search/" + $scope.list.name);
    });
  }
})

.controller('AddController', function($scope, $location, SearchService) {
  console.log('call AddController');
  $scope.create = function() {
    console.log('call AddController.create');
    SearchService.create($scope.list).then(function(response) {
      $location.path("/search/" + $scope.list.name);
    });
  }
})

.factory('SearchService', function($http) {
  var service = {
    query: function(term) {
      return $http.get('/search/' + term);
    },
    fetch: function(id) {
      return $http.get('/edit/' + id);
    },
    save: function(data) {
      return $http.put('/edit/' + data.id, data);
    },
    create: function(data) {
      return $http.post('/add/', data);
    }
  };
  return service;
});
