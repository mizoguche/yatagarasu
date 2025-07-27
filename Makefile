.PHONY: container-up container-rebuild claude

container-up:
	devcontainer up --workspace-folder .

container-rebuild:
	devcontainer up --workspace-folder . --remove-existing-container

claude:
	devcontainer exec --workspace-folder . claude --dangerously-skip-permissions

