{ pkgs, ... }: {
  channel = "unstable";
  packages = [
    pkgs.nodejs_22
    pkgs.pre-commit
    pkgs.firebase-tools
  ];
  env = {
    GCLOUD_PROJECT = "Startup Worth";
    FIREBASE_PROJECT_ID = "gen-lang-client-0217353744";
    FIREBASE_API_KEY = "AIzaSyDWvlVwGQkcvWVtAuoEO6AQgULLo6uWRlc";
    FIREBASE_AUTH_DOMAIN = "gen-lang-client-0217353744.firebaseapp.com";
    FIREBASE_DATABASE_URL = "https://firestore.googleapis.com/v1/projects/gen-lang-client-0217353744/databases/ai-financial-mvp";
    FIREBASE_STORAGE_BUCKET = "gen-lang-client-0217353744.firebasestorage.app";
    FIREBASE_MESSAGING_SENDER_ID = "874651269010";
    FIREBASE_APP_ID = "1:874651269010:web:f9a8e5c96b5c9fdede734b";
    FIREBASE_MEASUREMENT_ID = "your-firebase-measurement-id";

    # Set the path to your service account key for server-side authentication
    GOOGLE_APPLICATION_CREDENTIALS = "/workspace/serviceAccountKey.json";
  };
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
          command = ["npm" "run" "dev" "--prefix" "client" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };
}
