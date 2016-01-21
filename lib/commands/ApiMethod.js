'use strict';

var ApiMethodService = require('../service/ApiMethod/ApiMethodService');
var ApiMethodEvent = require('../service/ApiMethod/ApiMethodEvent');
var CloudFormationResourceTracker = require('../service/CloudFormationResourceTracker');

var pub = {};

pub._getHttpMethodFromResourceId = function (resourceId) {
    return resourceId.split("/")[1];
};

pub.getParameters = function (event) {
    return ApiMethodEvent.getParameters(event);
};

pub.createResource = function createResource(event, context, eventParams, callback) {
    ApiMethodService.createMethod(eventParams, function (error) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, eventParams.params.restApiId, eventParams.params.resourceId, eventParams.params.method.httpMethod, callback);
    });
};

pub.deleteResource = function deleteResource(event, context, eventParams, callback) {
    var httpMethod = pub._getHttpMethodFromResourceId(event.PhysicalResourceId);
    ApiMethodService.deleteMethod(eventParams.params.restApiId, eventParams.params.resourceId, httpMethod, function (deleteError) {
        if (deleteError) {
            return callback(deleteError);
        }
        return callback();
    });
};

pub.updateResource = function updateResource(event, context, eventParams, callback) {
    pub.deleteResource(event, context, eventParams, function (error) {
        if (error) {
            return callback(error);
        }
        return pub.createResource(event, context, eventParams, callback);
    });
};

module.exports = pub;

/* eslint max-params: 0 */
function getForResponse(event, context, restApiId, resourceId, httpMethod, callback) {
    ApiMethodService.getForResponse(restApiId, resourceId, httpMethod, function (getError, apiMethod) {
        if (getError) {
            return callback(getError);
        }
        apiMethod.physicalResourceId = resourceId + '/' + httpMethod;
        return callback(null, apiMethod);
    });
}
