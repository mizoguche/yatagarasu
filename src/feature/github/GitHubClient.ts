import { Octokit } from 'octokit';
import logger from '../../logger.js';

const gitHubClient = new Octokit({ auth: process.env.GITHUB_TOKEN });

export const fetchIssues = async () => {
  try {
    logger.debug('Calling GitHub API to fetch issues');
    const response = await gitHubClient.rest.issues.list();
    logger.debug(`GitHub API returned ${response.data.length} issues`);
    return response;
  } catch (error) {
    logger.error('Failed to fetch issues from GitHub', error);
    throw error;
  }
};
