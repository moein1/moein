angular.module('productApp').service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function (data, uploadUrl) {
        var fd = new FormData();
        console.log('data is ' + data);
        angular.forEach(data, function (value, key) {
            console.log('key is ' + key);
            console.log('value is ' + value);
            fd.append(key, value);
        });
        console.log('fd is' + fd);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        })
        .success(function (retObj) {
            console.log(retObj);
        })
        .error(function (retObj) {
            console.log(retObj);
        });
    }
}]);