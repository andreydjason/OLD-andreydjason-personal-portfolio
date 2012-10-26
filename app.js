// Base
var SERVERNAME = 'localhost';


//------------------------------------------------------------
// AppFog.com Cloud Server env-variables
if (typeof(process.env.SERVERNAME) != 'undefined') {
	SERVERNAME = process.env.SERVERNAME;
}

if (typeof(process.env.VCAP_APP_PORT) != 'undefined') {
	var VCAP_APP_PORT = process.env.VCAP_APP_PORT;
}

if (typeof(process.env.VCAP_SERVICES) != 'undefined') {
	var VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);
	SERVERNAME = 'appfog';
}
//------------------------------------------------------------


// Server
var Server = {};

Server.global = {}
Server.config = {}


// Set global configuration based on execution location of this app
if (SERVERNAME == 'localhost') {
	Server.global.port =  3000;
}
else {
	switch(SERVERNAME) {
		case 'appfog': // AppFog.com
			Server.global.port = (VCAP_APP_PORT || 80);
			break;

		case 'another': // just prepared for other/diferent servers/cases
			Server.global.port = (ANOTHER_SERVER_ENV_PORT || 80);
			break;

		default:
			Server.global.port = 8080;
	}
}

//------------------------------------------------------------


/**
 * Module dependencies
 */

 var util = require("util") // (#sys)
	, fs = require('fs')
	, os = require('os')
	, path = require("path")
	, express = require('express')
	, mongoose = require('mongoose')
	, Resource = require('express-resource')
	, params = require('express-params')
	, expose = require('express-expose')
	// , models = require("./models") // ?
	// , controllers = require("./controllers") // ?
	, routes = require('./config/routes')
	, application_root = __dirname
	, public_root = __dirname + '/public'
	, mongodb_info;


// global App
global.app = module.exports = express.createServer(
	express.bodyParser(),

	express.cookieParser('ADVSKey'),
	express.session({secret: 'ADVSKey'})
);


// Server
Server.root = application_root;

// Server paths
Server.paths = {
	root:         application_root,
	public_root:  path.join(application_root, "public"),
	models:       path.join(application_root, "app/models"),
	controllers:  path.join(application_root, "app/controllers"),
	views:        path.join(application_root, "app/views"),
}

// CloudServer/Localhost database connection # MongoDB/Mongoose
Server.cloud = {
	valid: function() {
		return false;
	}
}


// Cloud Server/Local MongoDB connection details
if (typeof(VCAP_SERVICES) != 'undefined') {
	try {
		mongodb_info = VCAP_SERVICES['mongodb-1.8'][0]['credentials'];
	} catch(e) {
		mongodb_info = {
			sername: '?',
			password: '?',
			hostname: '?',
			port: '?',
			db: '?'
		}
	}
}
else if ( Server.cloud.valid() ) { // another Cloud Server
	mongodb_info = {
		sername: '?',
		password: '?',
		hostname: '?',
		port: '?',
		db: '?'
	}
}
else { // Localhost
	mongodb_info = {
		username: '?',
		password: '?',
		hostname: '?',
		port: '?',
		db: '?'
	};
}

// MongoDB Connection
var mongo_conn = "mongodb://" + mongodb_info.username + ":" + mongodb_info.password + "@" + mongodb_info.hostname + ":" + mongodb_info.port + "/" + mongodb_info.db;

global.db = mongoose.connect(mongo_conn);


// # @TODO: (how to use this rightly?) # make works
// require("./models.js").autoload(db);
// require("./controllers.js").autoload(app);
// require("./routes.js").draw(app);


// Assets
// - common config -> /public


// Application Informartions/Details
app_info = {
	name:   "Andrey Djason's Portfolio",
	title:  "Andrey Djason Viana's Portfolio | Professional Web Worker"
}


// App Configuration
app.configure(function(){
	app.set('views', __dirname + '/app/views');
	app.set('view engine', 'ejs');

	app.use(express.logger());
	
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	
	app.use(app.router);

	app.use(express.cookieParser());
	app.use(express.session({ secret: "o2i43hyt937gyh928yt97o4p3yh94yoi7e5ytpw75y9245yjy9ghopqw3t5836t7" }));
	
	app.use(require('express-mongoose'));
});


// Development
app.configure('development', function(){
	Server.config.prototype = {
		host: '127.0.0.1'
	}

	app.use(express.static(__dirname + '/public'));
	
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


// Production
app.configure('production', function(){
	var oneYear = 31557600000;

	Server.config.prototype = {
		host: 'cname01.us01.aws.af.cm'
	}
	
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));

	app.use(express.errorHandler());
});


// Dynamic Helpers
app.dynamicHelpers({
	messages: require('express-messages'),
});


// Routes
app.get('/sobre', routes.sobre);

app.get('/', routes.index); // root_path


// App Listening
app.listen(Server.global.port, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
