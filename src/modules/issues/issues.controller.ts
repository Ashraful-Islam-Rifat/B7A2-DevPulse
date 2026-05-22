import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IssuesService } from './issues.service.js';
import { AppError } from '../../utils/app-error.js';
import { sendSuccess } from '../../utils/response.utils.js';

export const createIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reporterId = req.user!.id;
    const issue = await IssuesService.create(req.body, reporterId);
    sendSuccess(res, StatusCodes.CREATED, 'Issue created successfully', issue);
  } catch (error) {
    next(error);
  }
};

export const getAllIssues = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sort, type, status } = req.query;
    
    const rawIssues = await IssuesService.findAll({
      sort: sort as string,
      type: type as string,
      status: status as string,
    });

    if (rawIssues.length === 0) {
      res.status(StatusCodes.OK).json({ success: true, data: [] });
      return;
    }

    // Step-by-step Batch hydration logic to fully avoid using any SQL JOINs
    const uniqueReporterIds = Array.from(new Set(rawIssues.map((issue) => issue.reporter_id)));
    const reportersList = await IssuesService.fetchUsersInBatches(uniqueReporterIds);
    
    const reportersMapping = reportersList.reduce((acc: any, curr: any) => {
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

    res.status(StatusCodes.OK).json({
      success: true,
      data: hydratedIssues
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const issue = await IssuesService.findById(id);

    if (!issue) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Requested resource does not exist');
    }

    const reporterList = await IssuesService.fetchUsersInBatches([issue.reporter_id]);
    const reporter = reporterList[0] || null;

    const { reporter_id, ...cleanedIssue } = issue;
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        ...cleanedIssue,
        reporter
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const issue = await IssuesService.findById(id);

    if (!issue) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Requested resource does not exist');
    }

    const user = req.user!;
    
    // Enforcing updates validation framework parameters
    if (user.role !== 'maintainer') {
      if (issue.reporter_id !== user.id) {
        throw new AppError(StatusCodes.FORBIDDEN, 'Valid token but insufficient role/permissions');
      }
      if (issue.status !== 'open') {
        throw new AppError(StatusCodes.CONFLICT, 'Business logic conflict: Editing non-open issue is forbidden for contributors');
      }
    }

    // Capture fields payload safely
    const updatePayload: any = {};
    if (req.body.title !== undefined) updatePayload.title = req.body.title;
    if (req.body.description !== undefined) updatePayload.description = req.body.description;
    if (req.body.type !== undefined) updatePayload.type = req.body.type;
    
    // Only allow workflows manipulation transitions if user matches high clearances parameters
    if (req.body.status !== undefined) {
      if (user.role !== 'maintainer') {
        throw new AppError(StatusCodes.FORBIDDEN, 'Workflow modification updates require higher authority levels');
      }
      updatePayload.status = req.body.status;
    }

    if (Object.keys(updatePayload).length === 0) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'No updating fields provided');
    }

    const updatedResult = await IssuesService.update(id, updatePayload);
    sendSuccess(res, StatusCodes.OK, 'Issue updated successfully', updatedResult);
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const issue = await IssuesService.findById(id);

    if (!issue) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Requested resource does not exist');
    }

    await IssuesService.delete(id);
    sendSuccess(res, StatusCodes.OK, 'Issue deleted successfully');
  } catch (error) {
    next(error);
  }
};