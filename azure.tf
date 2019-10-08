variable az-cl-id {}
variable az-cl-sec {}
variable az-tenant-id {}
variable az-sub-id {}

provider "azurerm" {
	version 		= "=1.34.0"
	client_id       = "${var.az-cl-id}"
	client_secret   = "${var.az-cl-sec}"
	subscription_id = "${var.az-sub-id}"
	tenant_id       = "${var.az-tenant-id}"
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
	name                = "ets-super-example-app-service"
	location            = "${azurerm_resource_group.myrg.location}"
	resource_group_name = "${azurerm_resource_group.myrg.name}"
	app_service_plan_id = "${azurerm_app_service_plan.test-deploy.id}"
}