
terraform {
  required_providers {
    railway = {
      source = "railwayapp/railway"
      version = "1.11.2"
    }
  }
}
provider "railway" {}
resource "railway_project" "proj" { name = "mafia" }
