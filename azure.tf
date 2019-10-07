provider "azurerm" {
	version = "=1.27.0"
	subscription_id = ""
	client_id = "${var.AZURE_CLIENT_ID}"
	client_secret = "${var.AZURE_CLIENT_SECRET}"
	tenant_id = ""
}

resource "azurerm_resource_group" "myrg" {
	name		= "a_rg_made_with_tf"
	location	= "uksouth"
}
