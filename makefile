.PHONY: test run build

# Variables for the commands to run the binaries
# Keep variable definition as is (it's correct for the command watch should run)
SERVER_CMD = watch -n 1 echo "Server is running..."
CLIENT_CMD = watch -n 2 echo "Client is running..."

test:
	@echo "Running tests..."

run:
	@echo "Starting server and client..."
	# Use single quotes around the variable substitution
	# This ensures the entire command string is passed literally to parallel
	parallel --line-buffer ::: '$(SERVER_CMD)' '$(CLIENT_CMD)'

build:
	@echo "Building the project..."
	cd project/mono && bun --filter=api run build

