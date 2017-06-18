
var app=angular.module('controller',[]);
app.controller('homeCtrl',function ($scope,$sce) {
   $scope.html=$sce.trustAsHtml('<h1>谁都不欢迎！ 谢谢惠顾！</h1>');
});
app.controller('addCtrl',function ($scope,Books,$location) {
    $scope.addBook=function () {
        var obj={
            bookName:$scope.bookName,
            bookPrice:$scope.bookPrice,
            bookCover:$scope.bookCover
        };
        Books.save(obj).$promise.then(function () {
            $location.path('/list');
        })
    }
});
app.controller('listCtrl',function ($scope,Books) {
   $scope.books=Books.query();
});
app.controller('detailCtrl',function ($scope,$routeParams,Books,$location) {
    var id=$routeParams.id;
    $scope.book=Books.get({id});
    $scope.remove=function () {
        Books.delete({id:id}).$promise.then(function () {
            $location.path('/list');
        })
    };
    $scope.flag=true;
    $scope.changeFlag=function () {
        $scope.flag=false;
        $scope.temp=JSON.parse(JSON.stringify($scope.book));
    };
    $scope.cancel=function () {
        $scope.flag=true;
    };
    $scope.update=function () {
        Books.update({id},$scope.temp).$promise.then(function () {
            $scope.flag=true;
            $scope.book=$scope.temp;
        })
    }
});