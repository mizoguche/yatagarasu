import { Args, Flags } from '@oclif/core';
import { fetchIssues } from '../feature/github/GitHubClient.js';
import logger from '../logger.js';
import { BaseCommand } from './base.js';

export default class Serve extends BaseCommand {
  static override args = {
    file: Args.string({ description: 'file to read' }),
  };
  static override description = 'describe the command here';
  static override examples = ['<%= config.bin %> <%= command.id %>'];
  static override flags = {
    ...BaseCommand.baseFlags,
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: 'f' }),
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({ char: 'n', description: 'name to print' }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Serve);

    logger.info('Fetching GitHub issues...');
    const issuesResult = await fetchIssues();

    issuesResult.match(
      (issues) => {
        logger.info(JSON.stringify(issues.data, null, 2));
        issues.data.forEach((issue) =>
          logger.info(JSON.stringify(issue, null, 2)),
        );
        logger.info(`Fetched ${issues.data.length} issues`);
      },
      (error) => {
        logger.error(
          `Failed to fetch issues: ${error.type} - ${error.message}`,
        );
        this.error(`GitHub API Error: ${error.message}`);
      },
    );

    const name = flags.name ?? 'world';
    logger.info(`Hello ${name} from serve command`);
    if (args.file && flags.force) {
      logger.info(`Force flag enabled with file: ${args.file}`);
    }
  }
}
