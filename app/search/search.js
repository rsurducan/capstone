"use strict";
angular.module('myApp.search', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  console.log('call routeProvider');
  $routeProvider
    .when('/lists', {
      templateUrl: 'search/index.html',
      controller: 'SearchController'
    })
    .when('/search/:term', {
      templateUrl: 'search/index.html',
      controller: 'SearchController'
    })
    .when('/lists/:id', {
      templateUrl: 'search/edit.html',
      controller: 'EditController'
    })
    .when('/lists/new', {
      templateUrl: 'search/addList.html',
      controller: 'AddListController'
    })
    .when('/lists/:id/items', {
      templateUrl: 'search/edit.html',
      controller: 'AddItemController'
    })
    .when('/addItem/:id', {
      templateUrl: 'search/edit.html',
      controller: 'AddItemController'
    });
}])

.controller('SearchController', function($scope, $location, $routeParams, SearchService) {
  console.log('call SearchController');
  var searchTerm = $routeParams.term;
  if (!searchTerm) {
    searchTerm = "*";
  }
  SearchService.search(searchTerm).then(function(response) {
    console.log('call SearchService.query');
    $scope.term = searchTerm;
    $scope.searchResults = response.data;
  });

  $scope.search = function() {
    console.log('call SearchController.search');
    SearchService.search($scope.term).then(function(response) {
      $scope.searchResults = response.data;
    });
  };

  $scope.editList = function(list) {
    console.log('call SearchController.edit');
    $location.path("/lists/" + list.id);
  };

  $scope.newList = function() {
    console.log('call SearchController.newList');
    $location.path("/lists/new");
  };
})

.controller('EditController', function($scope, $location, $routeParams, SearchService) {
  console.log('call EditController');

  SearchService.fetchList($routeParams.id).then(function(response) {
    console.log('call EditController.fetch');
    $scope.list = response.data;
  });

  $scope.addItem = function(list) {
    console.log('call EditController.addItem');
    $location.path("/addItem/" + list.id);
  };

})

.controller('AddListController', function($scope, $location, SearchService) {
  console.log('call AddListController');

  $scope.createList = function() {
    console.log('call AddListController.create');
    SearchService.createList($scope.list).then(function(response) {
      $location.path("/search/" + $scope.list.name);
    });
  };
})

.controller('AddItemController', function($scope, $location, $routeParams, SearchService) {
  console.log('call AddItemController');
  SearchService.fetchList($routeParams.id).then(function(response) {
    console.log('call AddItemController.fetch');
    $scope.list = response.data;
  });

  $scope.createItem = function() {
    console.log('call AddItemController.createItem');
    SearchService.createItem($scope.list.id, $scope.itemName).then(function (response) {
      $location.path("/lists/" + $scope.list.id);
    });
  };
})

.factory('SearchService', function($http) {
  var service = {
    search: function(term) {
      console.log('call GET /search/' + term);
      return $http.get('/search/' + term);
    },
    fetchList: function(id) {
      console.log('call GET /lists/' + id);
      return $http.get('/lists/' + id);
    },
    updateList: function(data) {
      console.log('call PUT /lists/' + data.id + ' payload: ' + JSON.stringify(data));
      return $http.put('/lists/' + data.id, data);
    },
    createList: function(data) {
      console.log('call POST /lists/ payload: ' + JSON.stringify(data));
      return $http.post('/lists/', data);
    },
    createItem: function(listId, itemName) {
      console.log('call POST /lists/' + listId + '/items payload: ' + itemName);
      return $http.post('/lists/' + listId + '/items', itemName);
    }
  };
  return service;
});
