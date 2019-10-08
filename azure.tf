provider "azurerm" {
	version 		= "=1.27.0"
	subscription_id	= "af5c3d81-0e91-44e6-8f47-1dc25fedb3ac"
}

resource "azurerm_resource_group" "myrg" {
	name		= "a_rg_made_with_tf"
	location	= "uksouth"
}

resource "azurerm_app_service_plan" "test-deploy" {
	name				= "test-app-serice-plan-deployment"
	location			= "${azurerm_resource_group.myrg.location}"
	resource_group_name	= "${azurerm_resource_group.myrg.name}"
	sku {
		tier = "Standard"
		size = "S1"
	}
}

resource "azurerm_app_service" "tf-deployed-aps" {
	name                = "example-app-service"
	location            = "${azurerm_resource_group.myrg.location}"
	resource_group_name = "${azurerm_resource_group.myrg.name}"
	app_service_plan_id = "${azurerm_app_service_plan.test-deploy.id}"
}