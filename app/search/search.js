"use strict";
angular.module('myApp.search', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
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
      templateUrl: 'search/addItem.html',
      controller: 'EditController'
    })
    .when('/newlist', {
      templateUrl: 'search/addList.html',
      controller: 'AddListController'
    })
    .when('/lists/:id/items', {
      templateUrl: 'search/addItem.html',
      controller: 'EditController'
    })
    .when('/addItem/:id', {
      templateUrl: 'search/addItem.html',
      controller: 'EditController'
    })
    .when('/editList/:id', {
      templateUrl: 'search/editList.html',
      controller: 'EditListController'
    });
}])

.controller('SearchController', function($scope, $location, $routeParams, SearchService) {
  var searchTerm = $routeParams.term;
  if (!searchTerm) {
    searchTerm = "*";
  }
  SearchService.search(searchTerm).then(function(response) {
    $scope.term = searchTerm;
    $scope.searchResults = response.data;
  });

  $scope.editListItems = function(list) {
    $scope.show = false;
    $location.path("/lists/" + list.id);
  };

  $scope.newList = function() {
    $location.path("/newlist");
  };
})

.controller('EditController', function($scope, $location, $route, $routeParams, SearchService, SharedProperties) {
  SearchService.fetchList($routeParams.id).then(function(response) {
    $scope.show = SharedProperties.getShowFlag();
    $scope.list = response.data;
  });

  $scope.createItem = function() {
    SearchService.createItem($scope.list.id, $scope.itemName).then(function (response) {
      $route.reload();
      //$location.path("/lists/" + $scope.list.id);
    });
  };

  $scope.completeTask = function(itemId) {
    SearchService.completeTask($scope.list.id, itemId).then(function (response) {
      $route.reload();
    });
  };

  $scope.uncompleteTask = function(itemId) {
    SearchService.uncompleteTask($scope.list.id, itemId).then(function (response) {
      $route.reload();
    });
  };

  $scope.editList = function(list) {
    $location.path("/editList/" + list.id);
  };

})

.controller('AddListController', function($scope, $location, SearchService, SharedProperties) {

  $scope.createList = function() {
    SearchService.createList($scope.list).then(function(response) {
      SharedProperties.setShowFlag(true);
      $location.path("/lists/" + response.data.id);
    });
  };

  $scope.cancelListCreation = function() {
    $location.path("/lists");
  }
})

.controller('EditListController', function($scope, $location, $route, $routeParams, SearchService, SharedProperties) {
  SearchService.fetchList($routeParams.id).then(function(response) {
    $scope.list = response.data;
  });

  $scope.cancelListEditing = function() {
    $location.path("/lists/" + $scope.list.id);
  };

  $scope.deleteList = function() {
    SearchService.deleteList($scope.list.id).then(function(response) {
      $location.path("/lists");
    });
  };

  $scope.updateList = function() {
    SearchService.updateList($scope.list).then(function(response) {
      SharedProperties.setShowFlag(true);
      $location.path("/lists/" + response.data.id);
    });
  };

  $scope.deleteItem = function(itemId) {
    SearchService.deleteItem($scope.list.id, itemId).then(function(response) {
      $route.reload();
    });
  };

})

.factory('SearchService', function($http) {
  var service = {
    search: function(term) {
      return $http.get('/search/' + term);
    },
    fetchList: function(id) {
      return $http.get('/lists/' + id);
    },
    updateList: function(data) {
      return $http.put('/lists/' + data.id, data);
    },
    createList: function(data) {
      return $http.post('/lists/', data);
    },
    deleteList: function(listId) {
      return $http.delete('/lists/' + listId);
    },
    createItem: function(listId, itemName) {
      return $http.post('/lists/' + listId + '/items', itemName);
    },
    deleteItem: function(listId, itemId) {
      return $http.delete('/lists/' + listId + '/items/' + itemId);
    },
    completeTask: function(listId, itemId) {
      return $http.put('/lists/' + listId + '/items/' + itemId, 'true');
    },
    uncompleteTask: function(listId, itemId) {
      return $http.put('/lists/' + listId + '/items/' + itemId, 'false');
    }
  };
  return service;
})

.service('SharedProperties', function() {
  var showFlag = false;
  return {
    getShowFlag: function() {
      return showFlag;
    },
    setShowFlag: function(value) {
      showFlag = value;
    }
  };
});
