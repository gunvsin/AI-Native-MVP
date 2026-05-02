
{ pkgs, ... }: {
  # The Nix packages available in your workspace
  # Search for packages on https://search.nixos.org/packages
  packages = [
    pkgs.nodejs_22
    pkgs.firebase-tools
  ];

  # Sets environment variables in the workspace.
  env = {};

  idx = {
    # Search for extensions on https://open-vsx.org/.
    extensions = [
      "google.gemini-cli-vscode-ide-companion"
      "dbaeumer.vscode-eslint"
    ];

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        install-client = "cd client && npm install";
        install-functions = "cd functions && npm install";
      };
      # Runs on every workspace start
      onStart = {};
    };

    # Web-based previews
    previews = {
      enable = true;
      previews = {
        # The web preview for the Next.js client application
        web = {
          command = [
            "npm"
            "run"
            "dev"
            "--"
            "--port"
            "$PORT"
            "--hostname"
            "0.0.0.0"
          ];
          cwd = "client";
          manager = "web";
        };
      };
    };
  };
}
