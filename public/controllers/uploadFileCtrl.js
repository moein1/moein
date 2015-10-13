angular.module('productApp').
    controller("uploadFileController", ['$scope', '$location', '$upload', function ($scope, $location, $upload) {
    $scope.title = $location;

        //https://github.com/danialfarid/angular-file-upload
    //$scope.saveMiscs = function() {
    $scope.submit = function () {
        console.log("saving miscs");
        var file_1 = $scope.formfile1;
        var file_2 = $scope.formfile2;

        //console.log('file is ', JSON.stringify(file_regole), " + " + JSON.stringify(file_statuto));
        $scope.upload = $upload.upload({
            url: '/api/misc/filupload1', //upload.php script, node.js route, or servlet url
            file: file_1,       // or list of files ($files) for html5 only
        }).progress(function (evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function (data, status, headers, config) {
            // file is uploaded successfully
            console.log("upload completed: ", data);
        });
    };


    $scope.onFileSelect = function ($files) {
        $scope.files = angular.copy($files);
        console.log($scope.files); // Returns my object
    }


    $scope.setFiles = function (element) {
        $scope.$apply(function ($scope) {
            console.log(element.files);
            if (element.id == "form__file1")
                file_1 = element.files;
            else if (element.id == "form__file2")
                file_2 = element.files;
        });
    };

}]);