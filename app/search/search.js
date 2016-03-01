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
    .when('/newlist', {
      templateUrl: 'search/addList.html',
      controller: 'AddListController'
    })
    .when('/lists/:id/items', {
      templateUrl: 'search/edit.html',
      controller: 'EditController'
    })
    .when('/addItem/:id', {
      templateUrl: 'search/edit.html',
      controller: 'EditController'
    })
    .when('/editList/:id', {
      templateUrl: 'search/editList.html',
      controller: 'EditListController'
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

  $scope.editListItems = function(list) {
    console.log('call SearchController.edit');
    $scope.show = false;
    $location.path("/lists/" + list.id);
  };

  $scope.newList = function() {
    console.log('call SearchController.newList');
    $location.path("/newlist");
  };
})

.controller('EditController', function($scope, $location, $route, $routeParams, SearchService, SharedProperties) {
  console.log('call EditController');

  SearchService.fetchList($routeParams.id).then(function(response) {
    console.log('call EditController.fetch');
    $scope.show = SharedProperties.getShowFlag();
    $scope.list = response.data;
  });

  $scope.createItem = function() {
    console.log('call EditController.createItem');
    SearchService.createItem($scope.list.id, $scope.itemName).then(function (response) {
      $route.reload();
      //$location.path("/lists/" + $scope.list.id);
    });
  };

  $scope.completeTask = function(itemId) {
    console.log('call EditController.completeTask');
    SearchService.completeTask($scope.list.id, itemId).then(function (response) {
      $route.reload();
    });
  };

  $scope.uncompleteTask = function(itemId) {
    console.log('calls EditController.uncompleteTask with itemId=' + itemId);
    SearchService.uncompleteTask($scope.list.id, itemId).then(function (response) {
      $route.reload();
    });
  };

  $scope.editList = function(list) {
    console.log('call EditController.editList');
    $location.path("/editList/" + list.id);
  };

})

.controller('AddListController', function($scope, $location, SearchService, SharedProperties) {
  console.log('call AddListController');

  $scope.createList = function() {
    console.log('call AddListController.create');
    SearchService.createList($scope.list).then(function(response) {
      SharedProperties.setShowFlag(true);
      $location.path("/lists/" + response.data.id);
    });
  };

  $scope.cancelListCreation = function() {
    console.log('call AddListController.cancelListCreation');
    $location.path("/lists");
  }
})

.controller('EditListController', function($scope, $location, $routeParams, SearchService, SharedProperties) {
  console.log('call EditListController');
  SearchService.fetchList($routeParams.id).then(function(response) {
    $scope.list = response.data;
  });

  $scope.cancelListEditing = function() {
    console.log('call EditListController.cancelListEditing');
    $location.path("/lists/" + $scope.list.id);
  };

  $scope.deleteList = function() {
    console.log('call EditListController.deleteList');
    SearchService.deleteList($scope.list.id).then(function(response) {
      $location.path("/lists");
    });
  };

  $scope.updateList = function() {
    console.log('call EditListController.updateList');
    console.log('call updateList with payload: ' + JSON.stringify($scope.list));
    SearchService.updateList($scope.list).then(function(response) {
      SharedProperties.setShowFlag(true);
      $location.path("/lists/" + response.data.id);
    });
  }

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
    deleteList: function(listId) {
      console.log('call DELETE /lists/' + listId);
      return $http.delete('/lists/' + listId);
    },
    createItem: function(listId, itemName) {
      console.log('call POST /lists/' + listId + '/items payload: ' + itemName);
      return $http.post('/lists/' + listId + '/items', itemName);
    },
    completeTask: function(listId, itemId) {
      console.log('call PUT /lists/' + listId + '/items/' + itemId);
      return $http.put('/lists/' + listId + '/items/' + itemId, 'true');
    },
    uncompleteTask: function(listId, itemId) {
      console.log('call PUT /lists/' + listId + '/items/' + itemId);
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
