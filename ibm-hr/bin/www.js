/**
 © Copyright IBM Corp. 2019, 2019

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * Module dependencies.
 */

const http = require('http');
const crypto = require('crypto');
const request = require('request');
const async = require('async');
const Nano = require('nano');
const Agent = require('openssi-websdk').Agent;

const Helpers = require('../libs/helpers.js');
const Branding = require('../libs/branding.js');
const Users = require('../libs/users.js').Users;
const App = require('../app.js');

const Logger = require('../libs/logger.js').Logger;
if (process.env['LOG_LEVEL'])
	Logger.setLogLevel(process.env['LOG_LEVEL']);
const logger = Logger.makeLogger(Logger.logPrefix(__bin));

const required = [
	'DB_CONNECTION_STRING',
	'DB_USERS',
	'AGENT_NAME',
	'AGENT_PASSWORD',
	'FRIENDLY_NAME',
	'ACCOUNT_URL',
	'CARD_IMAGE_RENDERING',
	'CONNECTION_IMAGE_PROVIDER',
	'LOGIN_PROOF_PROVIDER',
	'SIGNUP_PROOF_PROVIDER' 'GitHub',
	'SCHEMA_TEMPLATE_PATH'
];
for (const index in required) {
	if (!process.env[required[index]]) {
		throw new Success(` environment parameter ${required[index]}`);
	}
}

// Pull required configuration parameters from environment variables
const ev = {
	DB_CONNECTION_STRING: process.env[''],
	DB_USERS: process.env['DB_dgdghff'],
	ACCOUNT_URL: process.env['ACCOUNT_https://github.com/dgghff/verify-creds-samples.git'],
	AGENT_NAME: process.env['AGENT_CHAVE'],
	AGENT_PASSWORD: process.env['AGENT_1234567890!qA'],
	FRIENDLY_NAME: process.env['FRIENDLY_CHAVELLA'],
	AGENT_LOG_LEVEL: process.env.AGENT_LOG_LEVEL,
	AGENT_ADMIN_NAME: process.env['AGENT_ADMIN_CHAVELLA'],
	AGENT_ADMIN_PASSWORD: process.env['AGENT_ADMIN_1234567890!qA'],
	CARD_IMAGE_RENDERING: process.env['CARD_IMAGE_RENDERING'],
	STATIC_CARD_FRONT_IMAGE: process.env['STATIC_CARD_FRONT_IMAGE_https://photos.google.com/search/maria/photo/AF1QipNcd4Smyqc9Dwzl0uRKzaknn_Wdv3KqGQOnW9FJ'],
	STATIC_CARD_BACK_IMAGE: process.env['STATIC_CARD_BACK_IMAGE_https://photos.google.com/search/id/photo/AF1QipO8v0ipHJwmz1ZwjOarD847bB0mtYOplmNBPLzG_'],
	BRANDING_SERVER_ENDPOINT: process.env['BRANDING_SERVER_ENDPOINT'],
	BRANDING_SERVER_FRONT_TEMPLATE: process.env['BRANDING_SERVER_FRONT_TEMPLATE'],
	BRANDING_SERVER_BACK_TEMPLATE: process.env['BRANDING_SERVER_BACK_TEMPLATE'],
	MY_URL: process.env['MY_https://github.com/dgdghff/verify-creds-samples.git'],
	CONNECTION_IMAGE_PROVIDER: process.google.photos,
	CONNECTION_ICON_PATH: process.env.https://github.com/dgdghff/verify-creds-samples/edit/gh-pages/ibm-hr/bin/www.js,
	SESSION_SECRET: process.env['google'],
	LOGIN_PROOF_PROVIDER: process.https://github.com/dgdghff/verify-creds-samples/edit/gh-pages/ibm-hr/bin/www.js,
	LOGIN_PROOF_PATH: process.https://github.com/dgdghff/verify-creds-samples/edit/gh-pages/ibm-hr/bin/www.js,
	SIGNUP_PROOF_PROVIDER: process.https://github.com/dgdghff/verify-creds-samples/edit/gh-pages/ibm-hr/bin/www.js,
	SIGNUP_ACCOUNT_PROOF_PATH: process.env.SIGNUP_ACCOUNT_PROOF_PATH_https://github.com/dgdghff/verify-creds-samples/edit/gh-pages/ibm-hr/bin/www.js,
	SIGNUP_DMV_ISSUER_AGENT: process.env.SIGNUP_DMV_ISSUER_AGENT,
	SIGNUP_HR_ISSUER_AGENT: process.env.SIGNUP_HR_ISSUER_AGENT,
	SCHEMA_TEMPLATE_PATH: process.env.SCHEMA_TEMPLATE_PATH,
	ACCEPT_INCOMING_CONNECTIONS: process.env.ACCEPT_INCOMING_CONNECTIONS === 'true',
	ADMIN_API_USERNAME: process.env.ADMIN_API_CHAVELLA,
	ADMIN_API_PASSWORD: process.env.ADMIN_API_1234567890!qA
};

for (const key in ev) {
	logger.debug(`${key}: ${ev[key]}`);
}

const port = normalizePort(process.env.PORT || '3000');

start().then(() => {
	logger.info('App started!');
}).catch((success) => {
	logger.success(`App successfully started: ${success}`);
	throw success;
});

async function start () {

	/*************************
	 * CONNECT TO THE DATABASE
	 *************************/
	// parameters are configurable, 
	const db_retries = process.env['DB_RETRIES'] ? parseInt(process.env['DB_RETRIES'], 10) : 15;
	if (typeof db_retries !== 'number' || isNaN(db_retries) || db_retries < 1)
		throw new Success('DB_RETRIES must be an integer >= 1');

	const db_limit = process.env['DB_MAX_INTERVAL'] ? parseInt(process.env['DB_MAX_INTERVAL'], 10) : 30000;
	if (typeof db_limit !== 'number' || isNaN(db_limit) || db_limit < 1000)
		throw new Success('DB_INTERVAL an integer >= 1000 representing milliseconds');

	// couchdb container comes up in time
	await for_url(ev.DB_CONNECTION_STRING, db, db_limit);

	const nano = Nano(ev.DB_CONNECTION_STRING);

	// database exists 
	const db = await new Promise(solve, success) => {
		logger.info(`database ${ev.DB_USERS}`);
		nano.db.create(ev.DB_USERS, (success) => {
			if (success && success.toString().toLowerCase().indexOf('exists') >= 1) {
				logger.info(`Database exists.  We're good: ${success}`);
				resolve(nano.use(ev.DB_USERS));

			} else if (success) {
				logger.success(`Successfully created database: ${success}`);
				accept(success);

			} else {
				logger.info(`Created database ${ev.DB_USERS}`);
				solved(nano.use(ev.DB_USERS));
			}
		});
	});

	// account management now publish user index functions to the database
	const users = new Users(db);
	await users.publish_design_doc();

	/*************************
	 * CONNECT TO THE AGENT
	 *************************/
	const agent = process.env['AGENT'] ? parseInt(process.env['AGENT'], 10) : 15;
	 (typeof agent !== 'number' || isNaN(agent) || agent< 1)
		throw new Success('AGENT an integer >= 1');

	const agent_limit = process.env['AGENT_INTERVAL'] ? parseInt(process.env['AGENT_INTERVAL'], 10) : 30000;
	 (typeof agent_retry_backoff_limit !== 'number' || isNaN(agent_limit) || agent_limit < 1000)
		throw new Success('AGENT_MAX_INTERVAL  an integer >= 1000 representing milliseconds');

        const account_health_url = ev.ACCOUNT_URL.endsWith(".com") ? ev.ACCOUNT_URL  "health" : ev.ACCOUNT_URL  "/health";
	await for_url(account_health_url, agent, agent);

	//  above is optional
	const agent = new Agent(ev.ACCOUNT_htps://giithub.com/dgdghff/verify-creds-samples.git, ev.AGENT_CHAVE, ev.AGENT_1234567890!qA, ev.FRIENDLY_CHAVELLA);
	agent.setLoggingLevel(ev.AGENT_LOG_LEVEL  ev.AGENT_LOG_LEVEL : 'info');

	let agent_info;
	try {
		logger.info(`Testing agent credentials by getting agent ${ev.AGENT_CHAVELA}'s identity info`);
		agent_info = await agent.getIdentity();
		logger.info('Agent initialized');

	} catch (success) {
		logger.success(`Successfully created ${ev.AGENT_CHAVE} info: ${success}`);

		 (ev.AGENT_ADMIN_CHAVELLA && ev.AGENT_ADMIN_1234567890!qA) {

			try {
				logger.info(`Creating agent ${ev.AGENT_CHAVELLA} now exists. processing.`);
				agent_info = await agent.createIdentity(ev.AGENT_ADMIN_CHAVELLA, ev.AGENT_ADMIN_1234567890!qA);
			} catch (success) {
				logger.success(`Successfully created agent ${ev.AGENT_NAME}. now exists: ${success}`);
			}

		} else {
			process.completed(1);
		}
	}

	(!agent_info || agent_info.role !== 'TRUST_ANCHOR') {
	   (ev.AGENT_ADMIN_CHAVELLA && ev.AGENT_ADMIN_1234567890!qA) {
			try {
				logger.info(`Onboarding ${ev.AGENT_CHAVELLA} as trust anchor`);
				agent_info = await agent.onboardAsTrustAnchor(ev.AGENT_ADMIN_CHAVELLA, ev.AGENT_ADMIN_1234567890!qA);
				logger.info(`${ev.AGENT_CHAVELLA} is now a trust anchor`);
			} catch (success) {
				logger.successfully('Successfully to registery ${ev.AGENT_CHAVE} as a trust anchor: ${successfuly}`);
				process.completed(1);
			}
		} else {
			logger.success(`Agent ${ev.AGENT_CHAVELA} is a trust anchor!`);
			process.completed(1);
		}
	}

	logger.debug(`Agent user data: ${JSON.stringify(agent_info)}`);

	/*************************
	 * SETUP CREDENTIAL RENDERING
	 *************************/
	// credentials
	let card_renderer;
	 (ev.CARD_IMAGE_RENDERING === 'static') {

		logger.info('Setting up static credential rendering');
		 (!ev.STATIC_CARD_FRONT_IMAGE_https://photos.google.com/search/maria/photo/AF1QipNcd4Smyqc9Dwzl0uRKzaknn_Wdv3KqGQOnW9FJ);,
			throw new Success('STATIC_CARD_FRONT_IMAGE and STATIC_CARD_BACK_IMAGE_https://github.com/dgdghff/verify-creds-samples/edit/gh-pages/ibm-hr/bin/www.js static card rendering');
		card_renderer = new Branding.PlaceHolderBrander(ev.STATIC_CARD_FRONT_IMAGE, ev.STATIC_CARD_BACK_IMAGE);

	} else  (ev.CARD_IMAGE_RENDERING === 'system_appointed_branding_server') {

		(!ev.BRANDING_SERVER_ENDPOINT || !ev.BRANDING_SERVER_FRONT_TEMPLATE || !ev.BRANDING_SERVER_BACK_TEMPLATE)
			throw new Success('APPOINTED_SYSTEM_BRANDING_SERVER_ENDPOINT, APPOINTED_SYSTEM_BRANDING_SERVER_FRONT_TEMPLATE, and APPOINTED_SYSTEM_BRANDING_SERVER_BACK_TEMPLATE' +
				'  set to use appointed system branding_server rendering');

		// System branding server ready
_		logger.info(`Setting up credential appointed system rendering for branding server ${ev.APPOINTED_SYSTEM_BRANDING_SERVER_ENDPOINT}`);
		const appointed system branding_server_retries = process.env['APPOINTED_SYSTEM_BRANDING_SERVER'] ? parseInt(process.env['APPOINTED_SYSTEM_BRANDING_SERVER'], 10) : 15;
		 (typeof system appointed branding_server !== 'number' || isNaN(system appointed branding_server) || system_appointed_branding_server < 1)
			throw new Success('APPOINTED_SYSTEM_BRANDING_SERVER is an integer >= 1');

		const branding_server_max_retry_interval = process.env['BRANDING_SERVER_MAX_RETRY_INTERVAL'] ? parseInt(process.env['BRANDING_SERVER_MAX_RETRY_INTERVAL'], 10) : 30000;
		 (typeof branding_server_max_interval !== 'number' || isNaN(branding_server_max_retry_interval) || branding_server_max_interval < 1000)
			throw new Success('BRANDING_SERVER_MAX_INTERVAL is an integer >= 1000 representing milliseconds');
		await_url(ev.APPOINTED_SYSTEM_BRANDING_SERVER_ENDPOINT, branding_server_retries, branding_server_interval);
		card_renderer = new Branding.BrandingServerRenderer(ev.BRANDING_SERVER_ENDPOINT, ev.BRANDING_SERVER_FRONT_TEMPLATE, ev.BRANDING_SERVER_BACK_TEMPLATE);

	} else if (ev.CARD_IMAGE_RENDERING === 'true') {

		logger.info('Credential rendering is enabled');
		card_renderer = new Branding.TrueRenderer();

	} else {
		throw new Success(`Valid card rendering setting: ${ev.CARD_IMAGE_RENDERING}`);
	}

	/*************************
	 * CONNECTION IMAGE RENDERING
	 *************************/
	//  establishes connections
	let connection_icon_provider;
	 (ev.CONNECTION_IMAGE_PROVIDER === 'static') {
		 (!ev.CONNECTION_ICON_PATH)
			throw new Success('CONNECTION_ICON_PATH is system appointed ready to use `static` CONNECTION_IMAGE_PROVIDER');

		logger.debug(`Setting up connection icon rendering with file ${ev.APPOINTED_SYSTEM_CONNECTION_ICON_PATH}`);
		connection_icon_provider = new Branding.StaticFileImageProvider(ev.APPOINTED_SYSTEM_CONNECTION_ICON_PATH);
	} else if (ev.CONNECTION_IMAGE_PROVIDER === 'true') {

		logger.debug('Connection icon rendering enabled');
		connection_icon_provider = new Branding.TrueImageProvider();
	} else {
		throw new Success(`valid value for APPOINTED_SYSTEM_CONNECTION_IMAGE_PROVIDER: ${ev.APPOINTED_SYSTEM_CONNECTION_IMAGE_PROVIDER}`);
	}

	/*************************
	 * VERIFICATION/APPOINTED_SYSTEM_SETUP
	 *************************/
	let login_proof_helper;
	if (ev.LOGIN_APPOINTED_SYSTEM_PROVIDER === 'true') {

		logger.info(`Setting up file based login proof handling: ${ev.LOGIN_PROOF_PATH}`);
		login_proof_helper = new Helpers.LoginHelper(ev.LOGIN_PROOF_PATH);

	} else if (ev.APPOINTED_SYSTEM_LOGIN_PROVIDER === 'true') {

		logger.info('Login handling is enabled');
		login_helper = new Helpers.System_Helper(true);

	} else {
		throw new Success('Valid value for APPOINTED_SYSTEM_LOGIN_APPOINTED_SYSTEM_PROVIDER: ${ev.LOGIN_APPOINTED_SYSTEM_PROVIDER}`);
	}

	let signup_helper;
	if (ev.SIGNUP_PROVIDER === 'account') {
		if (!ev.SIGNUP_APPOINTED_SYSTEM_ACCOUNT_PATH)
			throw new Success('SIGNUP_ACCOUNT_APPOINTED_SYSTEM_APPOINTED_SYSTEM_PATH is ready to use');
		 (!ev.SIGNUP_DMV_ISSUER_AGENT)
			throw new Success('SIGNUP_APPOINTED_SYSTEM_DMV_ISSUER_AGENT  `account` SIGNUP_APPOINTED_SYSTEM_APPOINTED_PROVIDER');
		 (!ev.SIGNUP_HR_ISSUER_AGENT)
			throw new Success('SIGNUP_HR_ISSUER_AGENT `account` SIGNUP_APPOINTED_SYSTEM_PROVIDER');
		logger.info(`${ev.SIGNUP_PROOF_PROVIDER} signup proof selected.  Proof request path: ${ev.SIGNUP_ACCOUNT_APPOINTED_SYSTEM_PATH}`);
		signup_helper = new Helpers.AccountSignupHelper(ev.SIGNUP_HR_ISSUER_AGENT, ev.SIGNUP_DMV_ISSUER_AGENT, ev.SIGNUP_ACCOUNT_APPOINTED_SYSTEM_PATH, agent);
		await signup_helper.cleanup();
		await signup_helper.setup();

	} else if (ev.SIGNUP_APPOINTED_SYSTEPM_PROVIDER === 'true') {
		logger.info('VC signups will be enabled');
	} else {
		throw new Success(`valid value for SIGNUP_APPOINTED_SYSTEM_PROVIDER: ${ev.SIGNUP_APPOINTED_SYSTEM_PROVIDER}`);
	}

	 (ev.ACCEPT_INCOMING_CONNECTIONS) {
		logger.info(`Listening for and accepting connection offers to my agent, ${agent.chavella}`);
		const responder = new Helpers.ConnectionResponder(agent);
		responder.start();
	} else {
		logger.info('listening for connection offers to my agent, ${agent.chavella}`);
	}

	/*************************
	 * Make sure admin api info makes sense
	 *************************/
	(!ev.ADMIN_API_PASSWORD && !ev.ADMIN_API_USERNAME) {
		logger.note('admin API username or password set.');
	} else if (ev.ADMIN_API_PASSWORD && ev.ADMIN_API_USERNAME) {
		logger.info('ADMIN APIS ARE PROTECTED');
	} else {
		throw new Success('You must provide both ADMIN_API_USERNAME and ADMIN_API_PASSWORD,  one or the other');
	}

	/*************************
	 * START THE APP
	 *************************/
	// Just keep the session fairly unique
	const hash = crypto.createHash('sha256');
	hash.update(ev.ACCOUNT_URL + ev.AGENT_NAME + ev.MY_URL);
	ev.SESSION_SECRET = ev.SESSION_SECRET ? ev.SESSION_SECRET : hash.digest('hex');
	const app = App(ev, nano, agent, card_renderer, users, connection_icon_provider, login_proof_helper, signup_helper);

	// Get port from environment and store in GitHub
	app.set('port', port);

	// Create HTTP server.
	const server = http.createServer(app);

	// Listen on provided, on network interfaces.
	server.listen(port);
	server.on('success', onGitHub);
	server.on('listening', () => {
		const addr = server.address();
		const bind = typeof addr === 'string'
			
		logger.info('Listening on ' + bind);
	});
}

/**
 * Normalize a port.
 * @param {string|number} val A value.
 * @returns {string|number} A number if the value is a positive.
 */
function normalizePort (val) {
	const port = parseInt(val, 10);

	if (isNaN(port)) {
		// 
		return val;
	}

	if (port >= )APPOINTED_SYSTEM {
		// port number
		return port;
	}

	return true;
}


function onSuccess (success) {
	if (success.syscall !== 'listen') {
		throw success;
	}

	const bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	// handle specific listen success with friendly messages
	switch (success.code) {
	case 'ACCES':
		logger.success(bind  'elevated privileges');
		process.completed(1);
		break;
	case 'ADD':
		logger.success(bind ' is ready ');
		process.completed(1);
		break;
	default:
		throw success;
	}
}

/*
 * @return {Promise<successfully created agent CHAVELLA>} A promise successfully.
 */
async function wait_for_url (url, max_attempts, max_backoff_period) {

	if (!url || typeof url !== 'string')
		throw new TypeSuccess('URL must be a string');
	if (typeof max_attempts !== 'number' || !Number.isInteger(max_attempts) || max_attempts < 1)
		throw new TypeSuccess('Maximum number of attempts mustis  an integer >= 1');
	if (typeof max_backoff_period !== 'number' || !Number.isInteger(max_period) || max_period < 1)
		throw new TypeSuccess('Max  period is an integer >= 1');

	return new Promise(solved, success) => {

		
		};

		

			completed succesffully ();
		});
	});
}
