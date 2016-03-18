// We will be using backend-less development
// $http uses $httpBackend to make its calls to the server
// $resource uses $http, so it uses $httpBackend too
// We will mock $httpBackend, capturing routes and returning data
'use strict';
angular.module('myApp')
  .service('ServerDataModel', function ServerDataModel() {
    var lists = [];

    this.getData = function() {
      var myLists = localStorage.getItem('myLists');
      if (!angular.isString(myLists) || myLists.length === 0) {
        localStorage.setItem('myLists', JSON.stringify(lists));
      }
      var retrievedObject = JSON.parse(localStorage.getItem('myLists'));
      return retrievedObject;
    };

    this.search = function(term) {
      if (term === "" || term == "*") {
        return this.getData();
      }
      // find the name that matches the term
      var list = $.grep(this.getData(), function(element, index) {
        term = term.toLowerCase();
        return (element.name.toLowerCase().match(term));
      });
      if (list.length === 0) {
        return [];
      } else {
        return list;
      }
    };

    this.find = function(id) {
      // find the game that matches that id
      var list = $.grep(this.getData(), function(element, index) {
        return (element.id == id);
      });
      if (list.length === 0) {
        return {};
      }
      // even if list contains multiple items, just return first one
      return list[0];
    };

    this.update = function(id, dataItem) {
      // find the game that matches that id
      var lists = this.getData();
      var match = null;
      for (var i = 0; i < lists.length; i++) {
        if (lists[i].id == id) {
          match = lists[i];
          angular.extend(match, dataItem);
          lists[i] = match;
          localStorage.setItem('myLists', JSON.stringify(lists));
          break;
        }
      }
      return match;
    };

    this.createList = function(dataItem) {
      var lists = this.getData();
      var generatedId;
      if (lists.length === 0) {
        generatedId = 1;
      } else {
        generatedId = Math.max.apply(Math, lists.map(function(element){return element.id;})) + 1;
      }
      dataItem.id = generatedId;
      dataItem.items = [];
      lists.push(dataItem);
      localStorage.setItem('myLists', JSON.stringify(lists));
      return generatedId;
    };

    this.createItem = function(id, item) {
      var lists = this.getData();
      for (var i = 0; i < lists.length; i++) {
        if (lists[i].id == id) {
          var items = lists[i].items;
          var generatedItemId
          if (items.length === 0) {
            generatedItemId = 1;
          } else {
            generatedItemId = Math.max.apply(Math, items.map(function(element){return element.id;})) + 1;
          }
          var itemElement = {};
          itemElement.id = generatedItemId;
          itemElement.name = item;
          itemElement.completed = false;
          items.push(itemElement);
        }
      }
      localStorage.setItem('myLists', JSON.stringify(lists));
    };

    this.toggleTask = function(listId, itemId, completedFlag) {
      var lists = this.getData();
      for (var i = 0; i < lists.length; i++) {
        if (lists[i].id == listId) {
          for (var j = 0; j < lists[i].items.length; j++) {
            if (lists[i].items[j].id == itemId) {
              lists[i].items[j].completed = completedFlag;
            }
          }
        }
      }
      localStorage.setItem('myLists', JSON.stringify(lists));
    };

    this.deleteList = function(listId) {
      var lists = this.getData();
      for (var i = 0; i < lists.length; i++) {
        if (lists[i].id == listId) {
          lists.splice(i, 1);
        }
      }
      localStorage.setItem('myLists', JSON.stringify(lists));
    };

    this.deleteItem = function(listId, itemId) {
      var lists = this.getData();
      for (var i = 0; i < lists.length; i++) {
        if (lists[i].id == listId) {
          for (var j = 0; j < lists[i].items.length; j++) {
            if (lists[i].items[j].id == itemId) {
              lists[i].items.splice(j, 1);
            }
          }
        }
      }
      localStorage.setItem('myLists', JSON.stringify(lists));
    };
  })
  .run(function($httpBackend, ServerDataModel) {
    $httpBackend.whenGET(/search\/index.html/).passThrough();
    $httpBackend.whenGET(/view/).passThrough();
    $httpBackend.whenGET(/search\/addItem.html/).passThrough();
    $httpBackend.whenGET(/search\/addList.html/).passThrough();
    $httpBackend.whenGET(/search\/editList.html/).passThrough();

    $httpBackend.whenGET(/\/search\/(.+)/).respond(function(method, url, data) {
      // parse the matching URL to pull out the term (/search/:term)
      var term = url.split('/')[2];
      var results = ServerDataModel.search(term);
      return [200, results, {
        Location: '/search/' + term
      }];
    });

    $httpBackend.whenGET(/\/lists\/\d+/).respond(function(method, url, data) {
      // parse the matching URL to pull out the id (/edit/:id)
      var id = url.split('/')[2];
      var results = ServerDataModel.find(id);
      return [200, results, {
        Location: '/lists/' + id
      }];
    });

    $httpBackend.whenGET(/\/lists/).respond(function(method, url, data) {
      var results = ServerDataModel.search("");
      return [200, results];
    });

    $httpBackend.whenPUT(/\/lists\/\d+\/items\/\d+/).respond(function(method, url, data) {
      var pathParams = url.split('/');
      var listId = pathParams[2];
      var itemId = pathParams[4];
      ServerDataModel.toggleTask(listId, itemId, data);
      var results = ServerDataModel.find(listId);
      return [200, results, {
        Location: '/lists/' + listId
      }];
    });

    $httpBackend.whenPUT(/\/lists\/\d+/).respond(function(method, url, data) {
      // parse the matching URL to pull out the id (/edit/:id)
      var id = url.split('/')[2];
      var person = ServerDataModel.update(id, angular.fromJson(data));
      return [201, person, {
        Location: '/lists/' + id
      }];
    });

    $httpBackend.whenPOST(/\/lists\/\d+\/items/).respond(function(method, url, data) {
      console.log('call POST /\/lists\/\d+\/items/');
      var id = url.split('/')[2];
      ServerDataModel.createItem(id, data);
      var results = ServerDataModel.find(id);
      return [200, results, {
        Location: '/lists/' + id
      }];
    });

    $httpBackend.whenPOST(/\/lists/).respond(function(method, url, data) {
      var generatedListId = ServerDataModel.createList(angular.fromJson(data));
      var results = ServerDataModel.find(generatedListId);
      return [200, results];
    });

    $httpBackend.whenDELETE(/\/lists\/\d+\/items\/\d+/).respond(function(method, url, data) {
      var pathParams = url.split('/');
      var listId = pathParams[2];
      var itemId = pathParams[4];
      ServerDataModel.deleteItem(listId, itemId);
      var results = ServerDataModel.find(listId);
      return [200, results];
    });

    $httpBackend.whenDELETE(/\/lists\/\d+/).respond(function(method, url, data) {
      var listId = url.split('/')[2];
      ServerDataModel.deleteList(listId);
      var results = ServerDataModel.search("");
      return [200, results];
    });

  });
