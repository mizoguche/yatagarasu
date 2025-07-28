# Yatagarasu

An orchestrator for agentic coding powered by Claude AI.

## Installation

```bash
npm install -g yatagarasu
```

## Usage

### Serve Command

Start the Slack bot server to integrate Claude AI with your Slack workspace:

```bash
yatagarasu serve
```

#### Environment Variables

The serve command requires the following environment variables:

- `SLACK_BOT_TOKEN` - Slack bot user OAuth token
- `SLACK_APP_TOKEN` - Slack app-level token (for socket mode)
- `YATAGARASU_PROMPTER` - (Optional) Slack member ID allowed to use the bot

## Development

### Prerequisites

- Node.js 18 or higher
- npm

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

## License

MIT
