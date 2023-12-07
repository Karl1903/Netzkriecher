data "azurerm_user_assigned_identity" "aksAppManagedId" {
  name                = "${azurerm_kubernetes_cluster.k8s.name}-agentpool"
  resource_group_name = "MC_${azurerm_resource_group.stageResources.name}_k8s-${azurerm_resource_group.stageResources
  .name}_${azurerm_resource_group.stageResources.location}"
}