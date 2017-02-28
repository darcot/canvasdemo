var app = angular.module('dragPane', ['ngRoute','720kb.datepicker','ui.tree','ngDraggable']);

app.config(function($routeProvider) {
  $routeProvider

      // route for the home page
      .when('/', {
          templateUrl : 'grid.html',
          label: 'Home'
      })

      .when('/drag', {
          templateUrl : 'drag.html',
          label: 'Drag'
      })

      .when('/grid', {
          templateUrl : 'grid.html',
          label: 'Products Catalog',
      })

      .when('/offer-studio', {
          templateUrl : 'offer-studio.html',
          label: 'Offers Studio',
      })

      .otherwise({ redirectTo: '/' });
      
});



app.service('offersService', ['$http','$rootScope', function($http, $rootScope) { 
  var self = this;
  self.user = {};

  self.loadConfiguration = function () {
      $http.get('offers.json').then(function (result) {
          self.user = result.data;
          $rootScope.$broadcast('offersService:getUserConfigSuccess');
      });
  };

  self.loadConfiguration();
  
}]);
app.directive('bgSplitter', function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      orientation: '@'
    },      
    template: '<div class="split-panes {{orientation}}" ng-transclude></div>',
    controller: ['$scope', function ($scope) {
      $scope.panes = [];
      
      this.addPane = function(pane){
        if ($scope.panes.length > 1) 
          throw 'splitters can only have two panes';
        $scope.panes.push(pane);
        return $scope.panes.length;
      };
    }],
    link: function(scope, element, attrs) {
      var handler = angular.element('<div class="split-handler"></div>');
      var pane1 = scope.panes[0];
      var pane2 = scope.panes[1];
      var vertical = scope.orientation == 'vertical';
      var pane1Min = pane1.minSize || 0;
      var pane2Min = pane2.minSize || 0;
      var drag = false;
      
      pane1.elem.after(handler);
      
      element.bind('mousemove', function (ev) {
        if (!drag) return;
        
        var bounds = element[0].getBoundingClientRect();
        var pos = 0;
        
        if (vertical) {

          var height = bounds.bottom - bounds.top;
          pos = ev.clientY - bounds.top;

          if (pos < pane1Min) return;
          if (height - pos < pane2Min) return;

          handler.css('top', pos + 'px');
          pane1.elem.css('height', pos + 'px');
          pane2.elem.css('top', pos + 'px');
    
        } else {

          var width = bounds.right - bounds.left;
          pos = ev.clientX - bounds.left;

          if (pos < pane1Min) return;
          if (width - pos < pane2Min) return;

          handler.css('left', pos + 'px');
          pane1.elem.css('width', pos + 'px');
          pane2.elem.css('left', pos + 'px');
        }
      });
  
      handler.bind('mousedown', function (ev) { 
        ev.preventDefault();
        drag = true; 
      });
  
      angular.element(document).bind('mouseup', function (ev) {
        drag = false;
      });
    }
  };
})

app.directive('bgPane', function () {
  return {
    restrict: 'E',
    require: '^bgSplitter',
    replace: true,
    transclude: true,
    scope: {
      minSize: '='
    },
    template: '<div class="split-pane{{index}}" ng-transclude></div>',
    link: function(scope, element, attrs, bgSplitterCtrl) {
      scope.elem = element;
      scope.index = bgSplitterCtrl.addPane(scope);
    }
  };
})

app.directive("csrHeader", function(){
  return{
    restrict: 'E',
    templateUrl: "csr-header.html" 
  }
});

app.controller('myCtrl', function($scope) {

    $scope.submit = function($event) {
      // our function body
      $event.preventDefault();
      name = $scope.name;
      desc = $scope.desc;
      available = $scope.available;
      effective = $scope.effective;

      var myEl = angular.element(document.querySelector('.right-pane'));
      myEl.append('<div class="col-md-12 contact-list">Name: '+name+'<br>Description: '+desc+'<br>Available: '+available+'<br>Effective: '+effective+'</div>'); 
    }

    $scope.clear = function($event) {
      // our function body
      $event.preventDefault();
      var myEl = angular.element(document.querySelector('.right-pane'));
      myEl.html('');
    }
})

app.controller('ConnectedTreesCtrl', function($scope) {
    $scope.remove = function (scope) {
      scope.remove();
    };

    $scope.toggle = function (scope) {
      scope.toggle();
    };

    $scope.newSubItem = function (scope) {
      var nodeData = scope.$modelValue;
      nodeData.nodes.push({
        id: nodeData.id * 10 + nodeData.nodes.length,
        title: nodeData.title + '.' + (nodeData.nodes.length + 1),
        nodes: []
      });
    };

    $scope.tree1 = [{
      'id': 1,
      'title': 'tree1 - item1',
      'nodes': []
    }, {
      'id': 2,
      'title': 'tree1 - item2',
      'nodes': []
    }, {
      'id': 3,
      'title': 'tree1 - item3',
      'nodes': []
    }, {
      'id': 4,
      'title': 'tree1 - item4',
      'nodes': []
    }];
    $scope.tree2 = [{
      'id': 1,
      'title': 'tree2 - item1',
      'nodes': []
    }, {
      'id': 2,
      'title': 'tree2 - item2',
      'nodes': []
    }, {
      'id': 3,
      'title': 'tree2 - item3',
      'nodes': []
    }, {
      'id': 4,
      'title': 'tree2 - item4',
      'nodes': []
    }];
})

.controller('TabsCtrl', ['$scope', function ($scope) {
    $scope.tabs = [{
            title: 'Offers',
            url: 'offers.html'
        }, {
            title: 'Products',
            url: 'products.html'
        }];

    $scope.currentTab = 'offers.html';

    $scope.onClickTab = function (tab) {
        $scope.currentTab = tab.url;
    }
    
    $scope.isActiveTab = function(tabUrl) {
        return tabUrl == $scope.currentTab;
    }

    angular.element(document).ready(function() { 
      $('[data-toggle="tooltip"]').tooltip();   
    });
}])

.controller('offersCtrl', ['$scope','$http', function ($scope, $http) {
    $http.get("offers.json").then(function (response) 
    {
      $scope.offers = response.data.offers;
    });
    angular.element(document).ready(function() { 
      $('.grid').on('click', function(){
        $('.view').attr('class','view');
        $('.view').addClass('col-md-3 col-sm-4 col-xs-12 col-lg-3');
        $('.view').find('.offer').removeClass("list-view");
      });
      $('.list').on('click', function(){
        $('.view').attr('class','view');
        $('.view').addClass('col-md-12 col-sm-12 col-xs-12 col-lg-12');
        $('.view').find('.offer').addClass("list-view");
      });
    });
}])

.controller('productsCtrl', ['$scope','$http', function ($scope, $http) {
    $http.get("products.json").then(function (response) 
    {
      $scope.products = response.data.products;
    });
    
}])


.controller('offerStudioCtrl', ['$scope','$http', 'offersService', function ($scope, $http, offersService){
  $scope.tabs = [{
      title: 'Offers',
      url: 'studio-offers.html'
  }, {
      title: 'Products',
      url: 'studio-products.html'
  }];

  $scope.currentTab = 'studio-offers.html';
  
  $scope.onClickTab = function (tab) {
      $scope.currentTab = tab.url;
  }
  
  $scope.isActiveTab = function(tabUrl) {
      return tabUrl == $scope.currentTab;
  }

  $scope.result = [];

  $http({
    method: 'GET',
    url: 'offers.json'
}).success(function(result) {
    $scope.result = result.data; // This works
    this.result = result.data; // Should also work now
}.bind(this));

  

  $scope.centerAnchor = true;
  $scope.toggleCenterAnchor = function () {$scope.centerAnchor = !$scope.centerAnchor}
  $scope.draggableObjects = $scope.result;
  $scope.droppedObjects1 = [];
  $scope.droppedObjects2= [];
  $scope.onDropComplete1=function(data,evt){
      // console.log('fired 1');
      var index = $scope.droppedObjects1.indexOf(data);
      if (index == -1)
      $scope.droppedObjects1.push(data);

      var p = $('#menu');
      var position = p.position();

      var p2 = $('button#opt-menu0');
      var position2 = p2.position();

       var canvas = document.getElementById("myCanvas");
       var ctx = canvas.getContext("2d");
	   ctx.beginPath();
       ctx.moveTo(0,0);
       ctx.lineTo(evt.tx,position.top);
	   ctx.lineTo(0,0);
      
	   ctx.strokeStyle="blue";
       ctx.stroke();
      
	  console.log(evt);
  }
  $scope.onDragSuccess1=function(data,evt){
      // console.log("133","$scope","onDragSuccess1", "", evt);
      // console.log(data);
      // var index = $scope.droppedObjects1.indexOf(data);
      // if (index > -1) {
      //     $scope.droppedObjects1.splice(index, 1);
      // }
      
      angular.element(document).ready(function() { 
        $(".edit").click(function(){
            $("#editModal").modal('show');
        });

      })
  }
  $scope.onDragSuccess2=function(data,evt){
/*      var index = $scope.droppedObjects2.indexOf(data);
      if (index > -1) {
          $scope.droppedObjects2.splice(index, 1);
      }*/
      angular.element(document).ready(function() { 
        $(".edit").click(function(){
            $("#editModal").modal('show');
        });
      })
      $("[id*='opt-menu']").connections();
  }
  $scope.onDropComplete2=function(data,evt){
    console.log('fired');
      var index = $scope.droppedObjects2.indexOf(data);
      if (index == -1) {
          $scope.droppedObjects2.push(data);
      }

  }
  var inArray = function(array, obj) {
      var index = array.indexOf(obj);
  }

  angular.element(document).ready(function() { 
    $('#myModal').modal('show');
    $('#offer_menu').hide();

    $(".edit").click(function(){
        $("#editModal").modal('show');
    });
    $("#accordion").accordion({
      collapsible: true,
      heightStyle: "content"
    });
    $('#availableDate').datepicker({
        format: "dd/mm/yyyy"
    }); 
    $('#endDate').datepicker({
        format: "dd/mm/yyyy"
    }); 
  })


  // service interaction
  $scope.status = "";
  $scope.offer_create = function(){
    $scope.offer_name = $scope.offerName;
    $("#offer_menu").show();

    var Offer = {
    "title": $scope.offer_name     
    }
   // console.log(Offer);
    //$http.post("http://localhost:8080/MeatraTech/webresources/offers", Offer).success(function (response) {
   //    $scope.status = response.status
   //  });  
  }

  
  $scope.save = function () {
    var Offer = {
      "title": $scope.offer_name,
    "description":$scope.offerDescription,
    "availableDate":$scope.availableDate,
    "endDate":$scope.endDate
    }
    console.log(Offer);
    // $http.put("http://localhost:8080/MeatraTech/webresources/offers", Offer).success(function (response) {
    //   $scope.status = response.status
    // }); 
  }

  $scope.delete = function () {
    var Offer = {
      "title": $scope.offer_name,
    "description":$scope.offerDescription,
    "availableDate":$scope.availableDate,
    "endDate":$scope.endDate
    }
    console.log(Offer);
    //$http.delete("http://localhost:8080/MeatraTech/webresources/offers", Offer).success(function (response) {
    //   $scope.status = response.status
    // });
  }
  
}]);