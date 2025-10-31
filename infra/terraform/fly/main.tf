
terraform {
  required_providers {
    fly = {
      source = "fly-apps/fly"
      version = "~> 0.0.23"
    }
  }
}
provider "fly" {}
variable "app_name" { default = "mafia-api-demo" }
variable "region"   { default = "ams" }
resource "fly_app" "api" {
  name = var.app_name
  org  = "personal"
}
