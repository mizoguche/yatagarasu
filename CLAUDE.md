# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yatagarasu is an orchestrator for agentic coding built with TypeScript and the Oclif CLI framework. It integrates Claude AI with Slack through a serve command that listens for app mentions and responds with AI-generated content.

## Common Development Commands

### Testing
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting
- `npm run typecheck` - Run TypeScript type checking
- `npm run check` - Run all checks (tests, lint, format check)

### Running the Application
- `yatagarasu serve` - Start the Slack bot server (requires environment variables)

### DevContainer Management
- `make container-up` - Start the devcontainer
- `make container-rebuild` - Rebuild and start the devcontainer
- `make claude` - Execute Claude CLI in the devcontainer

## High-Level Architecture

### Core Components

1. **Command Structure** (Oclif-based)
   - All commands extend `BaseCommand` (src/commands/base.ts:4)
   - Base command provides verbose logging flag
   - Commands are automatically discovered in src/commands/

2. **Serve Command** (src/commands/serve.ts:9)
   - Main entry point for the Slack bot
   - Uses `@slack/bolt` for Slack integration
   - Listens for app mentions and streams Claude responses
   - Handles multiple response types: thinking, text, system info

3. **Claude API Integration** (src/services/claude-api.ts:126)
   - Streams responses from Claude using devcontainer exec
   - Parses JSON stream events (assistant, user, system, result)
   - Supports all Claude tools (Task, Bash, File operations, Web tools, etc.)

4. **Logging System**
   - Centralized Winston logger (src/logger.ts)
   - Log level can be dynamically set with verbose flag

### Key Design Patterns

- **Event Streaming**: Claude responses are streamed as JSON events, allowing real-time updates in Slack
- **Type Safety**: Comprehensive TypeScript types for all Claude events and tool usage
- **Modular Commands**: Each command is a separate module extending the base command class

### Environment Requirements

For the serve command:
- `SLACK_BOT_TOKEN` - Slack bot user OAuth token
- `SLACK_APP_TOKEN` - Slack app-level token (for socket mode)