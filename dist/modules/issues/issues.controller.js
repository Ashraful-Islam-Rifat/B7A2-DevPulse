"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIssue = exports.updateIssue = exports.getSingleIssue = exports.getAllIssues = exports.createIssue = void 0;
const http_status_codes_1 = require("http-status-codes");
const issues_service_js_1 = require("./issues.service.js");
const app_error_js_1 = require("../../utils/app-error.js");
const response_utils_js_1 = require("../../utils/response.utils.js");
const createIssue = async (req, res, next) => {
    try {
        const reporterId = req.user.id;
        const issue = await issues_service_js_1.IssuesService.create(req.body, reporterId);
        (0, response_utils_js_1.sendSuccess)(res, http_status_codes_1.StatusCodes.CREATED, 'Issue created successfully', issue);
    }
    catch (error) {
        next(error);
    }
};
exports.createIssue = createIssue;
const getAllIssues = async (req, res, next) => {
    try {
        const { sort, type, status } = req.query;
        const rawIssues = await issues_service_js_1.IssuesService.findAll({
            sort: sort,
            type: type,
            status: status,
        });
        if (rawIssues.length === 0) {
            res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, data: [] });
            return;
        }
        // Step-by-step Batch hydration logic to fully avoid using any SQL JOINs
        const uniqueReporterIds = Array.from(new Set(rawIssues.map((issue) => issue.reporter_id)));
        const reportersList = await issues_service_js_1.IssuesService.fetchUsersInBatches(uniqueReporterIds);
        const reportersMapping = reportersList.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
        }, {});
        const hydratedIssues = rawIssues.map((issue) => {
            const { reporter_id, ...cleanedIssue } = issue;
            return {
                ...cleanedIssue,
                reporter: reportersMapping[reporter_id] || null
            };
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            data: hydratedIssues
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllIssues = getAllIssues;
const getSingleIssue = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const issue = await issues_service_js_1.IssuesService.findById(id);
        if (!issue) {
            throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested resource does not exist');
        }
        const reporterList = await issues_service_js_1.IssuesService.fetchUsersInBatches([issue.reporter_id]);
        const reporter = reporterList[0] || null;
        const { reporter_id, ...cleanedIssue } = issue;
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            data: {
                ...cleanedIssue,
                reporter
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSingleIssue = getSingleIssue;
const updateIssue = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const issue = await issues_service_js_1.IssuesService.findById(id);
        if (!issue) {
            throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested resource does not exist');
        }
        const user = req.user;
        // Enforcing updates validation framework parameters
        if (user.role !== 'maintainer') {
            if (issue.reporter_id !== user.id) {
                throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.FORBIDDEN, 'Valid token but insufficient role/permissions');
            }
            if (issue.status !== 'open') {
                throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.CONFLICT, 'Business logic conflict: Editing non-open issue is forbidden for contributors');
            }
        }
        // Capture fields payload safely
        const updatePayload = {};
        if (req.body.title !== undefined)
            updatePayload.title = req.body.title;
        if (req.body.description !== undefined)
            updatePayload.description = req.body.description;
        if (req.body.type !== undefined)
            updatePayload.type = req.body.type;
        // Only allow workflows manipulation transitions if user matches high clearances parameters
        if (req.body.status !== undefined) {
            if (user.role !== 'maintainer') {
                throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.FORBIDDEN, 'Workflow modification updates require higher authority levels');
            }
            updatePayload.status = req.body.status;
        }
        if (Object.keys(updatePayload).length === 0) {
            throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'No updating fields provided');
        }
        const updatedResult = await issues_service_js_1.IssuesService.update(id, updatePayload);
        (0, response_utils_js_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK, 'Issue updated successfully', updatedResult);
    }
    catch (error) {
        next(error);
    }
};
exports.updateIssue = updateIssue;
const deleteIssue = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const issue = await issues_service_js_1.IssuesService.findById(id);
        if (!issue) {
            throw new app_error_js_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested resource does not exist');
        }
        await issues_service_js_1.IssuesService.delete(id);
        (0, response_utils_js_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK, 'Issue deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteIssue = deleteIssue;
