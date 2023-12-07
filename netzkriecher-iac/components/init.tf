terraform {
  backend "azurerm" {
    container_name       = "terraformstate"
  }
}

provider "azurerm" {
    # configured by env
  features {}

  use_msi = true
}

module "netzkriecherComponents" {
  source               = "./resources"
  stage                = var.stage
  location             = "germanywestcentral"
}

variable "stage" { }