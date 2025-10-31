
terraform {
  required_providers {
    render = {
      source = "render-oss/render"
      version = "0.1.10"
    }
  }
}
provider "render" {}
resource "render_service" "api" {
  name = "mafia-api"
  type = "web_service"
  branch = "main"
  repo = "https://github.com/your/repo.git"
  build_command = "cd api && npm ci && npm run build"
  start_command = "node api/dist/main.js"
  env = "node"
}
