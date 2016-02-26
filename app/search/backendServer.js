// We will be using backend-less development
// $http uses $httpBackend to make its calls to the server
// $resource uses $http, so it uses $httpBackend too
// We will mock $httpBackend, capturing routes and returning data
'use strict';
angular.module('myApp')
  .service('ServerDataModel', function ServerDataModel() {
    var lists = [{
      id: 1,
      name: "Blank list",
      description: "This is a template list",
      items: [
        {
          name: "Fourth task",
          completed: false
        },
        {
          name: "Third task",
          completed: false
        },
        {
          name: "First task",
          completed: true
        },
        {
          name: "Second task",
          completed: true
        }
      ]
    }];

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

    this.save = function(dataItem) {
      var lists = this.getData();
      var generatedId = Math.max.apply(Math, lists.map(function(element){return element.id;})) + 1;
      dataItem.id = generatedId;
      lists.push(dataItem);
      localStorage.setItem('myLists', JSON.stringify(lists));
    };

    this.addItem = function(id, item) {
      var lists = this.getData();
      for (var i = 0; i < lists.length; i++) {
        if (lists[i].id == id) {
          var itemElement = {};
          itemElement.name = item;
          itemElement.completed = false;
          lists[i].items.push(itemElement);
        }
      }
      localStorage.setItem('myLists', JSON.stringify(lists));
    };
  })
  .run(function($httpBackend, ServerDataModel) {
    console.log('call the run function');
    $httpBackend.whenGET(/search\/index.html/).passThrough();
    $httpBackend.whenGET(/view/).passThrough();
    $httpBackend.whenGET(/search\/edit.html/).passThrough();
    $httpBackend.whenGET(/search\/add.html/).passThrough();

    $httpBackend.whenGET(/\/search\/(.+)/).respond(function(method, url, data) {
      console.log('call /\/search\/(.+)/');
      // parse the matching URL to pull out the term (/search/:term)
      var term = url.split('/')[2];
      var results = ServerDataModel.search(term);
      return [200, results, {
        Location: '/search/' + term
      }];
    });

    $httpBackend.whenGET(/\/lists\/\d+/).respond(function(method, url, data) {
      console.log('call /\/lists\/\d+/');
      // parse the matching URL to pull out the id (/edit/:id)
      var id = url.split('/')[2];
      var results = ServerDataModel.find(id);
      console.log('results: ' + JSON.stringify(results));
      return [200, results, {
        Location: '/lists/' + id
      }];
    });

    $httpBackend.whenGET(/\/lists/).respond(function(method, url, data) {
      console.log('call /\/lists/');
      var results = ServerDataModel.search("");
      return [200, results];
    });

    $httpBackend.whenPUT(/\/lists\/\d+/).respond(function(method, url, data) {
      console.log('call /\/lists\/\d+/');
      // parse the matching URL to pull out the id (/edit/:id)
      var id = url.split('/')[2];
      var person = ServerDataModel.update(id, angular.fromJson(data));
      return [201, person, {
        Location: '/lists/' + id
      }];
    });

    $httpBackend.whenPOST(/\/lists\/\d+\/items/).respond(function(method, url, data) {
      console.log('call /\/lists\/\d+\/items/');
      var id = url.split('/')[2];
      ServerDataModel.addItem(id, data);
      var results = ServerDataModel.find(id);
      return [200, results, {
        Location: '/lists/' + id
      }];
    });

    $httpBackend.whenPOST(/\/lists/).respond(function(method, url, data) {
      console.log('call /\/lists/');
      ServerDataModel.save(angular.fromJson(data));
      var results = ServerDataModel.search("");
      return [200, results];
    });

  });
