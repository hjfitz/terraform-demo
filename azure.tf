provider "azurerm" {
	version = "=1.27.0"
}

resource "azurerm_resource_group" "myrg" {
	name		= "a_rg_made_with_tf"
	location	= "uksouth"
}
