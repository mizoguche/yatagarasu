import { Octokit } from 'octokit';

const gitHubClient = new Octokit({ auth: process.env.GITHUB_TOKEN });

export const fetchIssues = async () => {
  return await gitHubClient.rest.issues.list();
};
