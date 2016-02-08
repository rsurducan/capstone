// We will be using backend-less development
// $http uses $httpBackend to make its calls to the server
// $resource uses $http, so it uses $httpBackend too
// We will mock $httpBackend, capturing routes and returning data
angular.module('myApp')
    .service('ServerDataModel', function ServerDataModel() {
        var lists = [
            {
                id: 1,
                name: "Blank list",
                description: "This is a template list"
            }
        ];

        this.getData = function () {
          var myLists = localStorage.getItem('myLists');
          if(!angular.isString(myLists) || myLists.length == 0) {
            localStorage.setItem('myLists', JSON.stringify(lists));
          }
          var retrievedObject = JSON.parse(localStorage.getItem('myLists'));
          console.log('myLists: ' + JSON.stringify(retrievedObject));
          return retrievedObject;
        };

        this.search = function (term) {
            if (term == "" || term == "*") {
                return this.getData();
            }
            // find the name that matches the term
            var list = $.grep(this.getData(), function (element, index) {
                term = term.toLowerCase();
                return (element.name.toLowerCase().match(term));
            });

            if (list.length === 0) {
                return [];
            } else {
                return list;
            }
        };

        this.find = function (id) {
            // find the game that matches that id
            var list = $.grep(this.getData(), function (element, index) {
                return (element.id == id);
            });
            if (list.length === 0) {
                return {};
            }
            // even if list contains multiple items, just return first one
            return list[0];
        };

        this.update = function (id, dataItem) {
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
          var people = JSON.parse(localStorage.getItem('myData'));
          people.push({"id": 4, "name": "Ricardo Montolivo"});
        };
    })
    .run(function ($httpBackend, ServerDataModel) {

        $httpBackend.whenGET(/\/search\/\w+/).respond(function (method, url, data) {
            // parse the matching URL to pull out the term (/search/:term)
            var term = url.split('/')[2];
            console.log('term:' + term);

            var results = ServerDataModel.search(term);
            console.log('results:' + JSON.stringify(results));

            return [200, results, {Location: '/search/' + term}];
        });

        $httpBackend.whenGET(/search\/index.html/).passThrough();
        $httpBackend.whenGET(/view/).passThrough();

        $httpBackend.whenGET(/\/search/).respond(function (method, url, data) {
            var results = ServerDataModel.search("");

            return [200, results];
        });

        $httpBackend.whenGET(/\/edit\/\d+/).respond(function (method, url, data) {
            // parse the matching URL to pull out the id (/edit/:id)
            var id = url.split('/')[2];

            var results = ServerDataModel.find(id);

            return [200, results, {Location: '/edit/' + id}];
        });

        $httpBackend.whenPUT(/\/edit\/\d+/).respond(function(method, url, data) {
          console.log('data:' + JSON.stringify(data));
          
            var params = angular.fromJson(data);

            // parse the matching URL to pull out the id (/edit/:id)
            var id = url.split('/')[2];

            var person = ServerDataModel.update(id, params);
            console.log('person:' + JSON.stringify(person));
            return [201, person, { Location: '/edit/' + id }];
        });

        $httpBackend.whenGET(/search\/edit.html/).passThrough();
    });
