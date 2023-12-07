resource "azurerm_resource_group" "stageResources" {
   name     = "netzkriecher-${var.stage}"
   location = var.location
}

data "azurerm_resource_group" "commonInfrastructure" {
  name     = "netzkriecher-commonInfrastructure"
}