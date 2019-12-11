const request = require('request-promise')
const targz = require('targz')
const fs = require('fs')

const zippedConfig = 'out.tar.gz'

const doGz = (src, dest) => new Promise((res, rej) => {
	targz.compress({src, dest}, (err) => err ? rej(err) : res())
})

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

	const [,, orgWS] = process.argv
	if (!orgWS) {
		console.error("Usage: node api-driven.js <organization>/<workspace>")
		process.exit(1)
	}
	const [org, workspace] = orgWS.split('/')

	// 2. get the workspace ID
	console.log('getting workspace: ', {org, workspace})
	const wsResp = await request.get(`https://app.terraform.io/api/v2/organizations/${org}/workspaces/${workspace}`, {
		headers,
	})
	const {data: {id: workspaceID}} = JSON.parse(wsResp)


	// 3. Create a new config version
	console.log('creating new config version', {workspaceID})
	const configResp = await request.post(`https://app.terraform.io/api/v2/workspaces/${workspaceID}/configuration-versions`, {
		headers,
		body: JSON.stringify({data: {type: 'configuration-version'}})
	})
	const {data: {attributes}} = JSON.parse(configResp)
	const uploadUrl = attributes['upload-url']


	// 4. Upload the config content (causing a new run to occur)
	console.log('zipping and uploading', {zippedConfig, uploadUrl})
	await doGz(`${__dirname}/conf/`, zippedConfig)
	const openFile = fs.readFileSync(zippedConfig)
	const createResp = await request.put(uploadUrl, {
		headers: {'Content-Type': 'application/octet-stream'},
		body: openFile
	})

	console.log(createResp)
		
}

main()