{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_22
  ];
  idx = {
    extensions = [
      "google.gemini-cli-vscode-ide-companion"
      "dbaeumer.vscode-eslint"
      "orta.vscode-jest"
    ];
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };
}
