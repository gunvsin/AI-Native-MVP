{ pkgs, ... }: {
  # To learn more about how to use Nix to configure your environment
  # see: https://developers.google.com/idx/guides/customize-idx-env
  channel = "stable-24.11"; # Which nixpkgs channel to use.

  # Use https://search.nixos.org/packages to find packages.
  packages = [
    pkgs.nodejs_22
    pkgs.nodePackages.npm
    # Added firebase-tools to run the emulators
    pkgs.firebase-tools 
  ];

  # Sets environment variables in the workspace.
  env = {};

  idx = {
    # Search for extensions on https://open-vsx.org/.
    extensions = [
      "google.gemini-cli-vscode-ide-companion",
      "dbaeumer.vscode-eslint"
    ];

    # The web preview configuration.
    previews = {
      enable = true;
      previews = {
        web = {
          # This command starts the Next.js development server from the `client` directory
          command = ["npm", "run", "dev", "--prefix", "client", "--", "--port", "$PORT"];
          manager = "web";
        };
      };
    };

    # Workspace lifecycle hooks.
    workspace = {
      # Runs when a workspace is first created.
      onCreate = {
        # Install dependencies for both the functions and client.
        npm-install-functions = "npm install --prefix functions";
        npm-install-client = "npm install --prefix client";
      };
      # Runs every time the workspace is (re)started.
      onStart = {
        # Start the Firebase emulators and the Next.js dev server.
        start-emulators = "npm run serve --prefix functions";
        start-next-dev = "npm run dev --prefix client";
      };
    };
  };
}
