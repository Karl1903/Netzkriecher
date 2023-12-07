resource "azurerm_container_registry" "containerregistry" {
  name                = "netzkriecheracr"
  resource_group_name = data.azurerm_resource_group.commonInfrastructure.name
  location            = data.azurerm_resource_group.commonInfrastructure.location
  sku                 = "Standard"
  admin_enabled       = true
}

resource "azurerm_role_assignment" "acrpull_role" {
  scope                             = azurerm_container_registry.containerregistry.id
  role_definition_name              = "AcrPull"
  principal_id                      = data.azurerm_user_assigned_identity.aksAppManagedId.principal_id
  skip_service_principal_aad_check  = true
}