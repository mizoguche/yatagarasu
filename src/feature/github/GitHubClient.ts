import { Octokit } from 'octokit';
import { Endpoints } from '@octokit/types';
import logger from '../../logger.js';
import { type AppError, createError } from '../../common/error.js';
import { fromPromise, ResultAsync } from 'neverthrow';

const gitHubClient: Octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export const fetchIssues = (): ResultAsync<
  Endpoints['GET /repos/{owner}/{repo}/issues']['response'],
  AppError
> => {
  logger.debug('Calling GitHub API to fetch issues');

  return fromPromise(gitHubClient.rest.issues.list(), (error) => {
    logger.error('Failed to fetch issues from GitHub', error);
    return createError(
      'GITHUB_API_ERROR',
      'Failed to fetch issues from GitHub',
    );
  });
};
