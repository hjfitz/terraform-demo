const request = require('request-promise')
const tar = require('tar')
const fs = require('fs')

const zippedConfig = 'out.tar.gz'

function getEnv() {
	const env = process.env.NODE_ENV || 'development'
	const isDevelopment = env !== 'production'
	if (isDevelopment) {
		return require('./config')
	}
	return {
		tf_access_token: process.env.TF_ACCESS_TOKEN
	}
}

async function main() {
	const {tf_access_token} = getEnv()
	const headers = {
		'Authorization': `Bearer ${tf_access_token}`,
		'Content-Type': 'application/vnd.api+json'
	}

	const [,,file, orgWS] = process.argv
	if (!file || !orgWS) {
		console.error("Usage: $0 <path_to_content_directory> <organization>/<workspace>")
		process.exit(1)
	}
	const [org, workspace] = orgWS.split('/')

	// 1. compress the template
	await tar.c({file: zippedConfig}, [file])

	// 2. get the workspace ID
	const wsResp = await request.get(`https://app.terraform.io/api/v2/organizations/${org}/workspaces/${workspace}`, {
		headers,
	})
	const {data: {id: workspaceID}} = JSON.parse(wsResp)


	// 3. Create a new config version
	const configResp = await request.post(`https://app.terraform.io/api/v2/workspaces/${workspaceID}/configuration-versions`, {
		headers,
		body: JSON.stringify({data: {type: 'configuration-version'}})
	})
	const {data: {attributes}} = JSON.parse(configResp)
	const uploadUrl = attributes['upload-url']


	// 4. Upload the config content (causing a new run to occur)
	const openFile = fs.readFileSync(zippedConfig)
	console.log(openFile)
	const createResp = await request.put(uploadUrl, {
		headers: {'Content-Type': 'application/octet-stream'},
		body: openFile
	})

	console.log(createResp)
}

main()