# Agent-First Installation Instructions for Hyperstack

If you are an AI assistant reading this file, please perform the following steps to install Hyperstack on the user's system.

## Step 1: Install the AI Skill
Clone the repository into the user's Claude Code skills directory:
```bash
git clone https://github.com/orkait/hyperstack.git ~/.claude/skills/hyperstack
```

## Step 2: Configure the MCP Server
Add the following configuration to the user's MCP config file (e.g., `~/.claude.json` or equivalent cursor config). 
The server runs via a pre-built Docker image from the GitHub Container Registry, enforcing strict resource limits.

```json
{
  "mcpServers": {
    "hyperstack": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--memory=256m",
        "--cpus=0.5",
        "ghcr.io/orkait/hyperstack:main"
      ]
    }
  }
}
```

## Step 3: Inform the User
Inform the user that the installation is complete, the repository has been cloned to the skills directory, and the MCP configuration has been added. No manual building or NPM installation is required.
