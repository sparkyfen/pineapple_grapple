Pineapple Grapple
============

WiFi MITM Backend Detector Service

Authors
-------
* [Adam Schodde](mailto:aaschodd@asu.edu)
* [Lester Penning](mailto:Lester.Penning@asu.edu)
* [Lincoln Turley](mailto:llturley@asu.edu)

Demo
-----
[https://pagrapple.com/](https://pagrapple.com/)

API Docs
--------
* [Code](/client/docs/)
* [Output](https://pagrapple.com/docs/)


TODO
-----
[Here](TODO.md)

Dependencies
------------

* [NodeJS](http://nodejs.org/)
* [CouchDB](http://couchdb.apache.org/)
* [Redis (For production)](http://redis.io/)
* WHOIS Command

Development
-----------

```bash
$ git clone <repo url> /path/to/dump/repo
$ cd /path/to/repo

# Start up DB
$ couchdb

# Set environment variable for development
$ export NODE_ENV=development

# Install server-side dependencies
$ npm install

# Don't forget to edit your configuration files at server/config/environment

# Install client-side dependencies
$ bower install

# Development server startup
$ grunt serve
```

Standardize Development
------------------------

```bash
# Install Yeoman (http://yeoman.io)
$ npm install -g yo

# Install the fullstack generator
$ npm install -g generator-angular-fullstack

# Utilize generators for endpoints and routes
$ yo angular-fullstack:endpoint myEndpoint
$ yo angular-fullstack:route myRoute

# See https://github.com/DaftMonk/generator-angular-fullstack#generators for full list.
```

Testing
------

```bash
$ grunt test
```

Production
----------

```bash
# Build for Production
$ grunt
$ mv ./dist /path/to/production/location && cd /path/to/production/location

# Install dependencies
$ npm install

# Set environment variable for production
$ export NODE_ENV=production

# Use Node to run for production
$ export IP=127.0.0.1
$ export PORT=9000
$ node server.js

# Or use forever for production (https://github.com/nodejitsu/forever)
$ export IP=127.0.0.1
$ export PORT=9000
$ forever start server.js
```

Heroku Production
----------------

```bash
# Build for Production
$ grunt
$ cd dist

# Create Heroku application via https://dashboard.heroku.com/apps
# Add Redis To-Go to application.

# Add git remote to distribution folder
$ git remote add heroku git@heroku.com:app-name.git

# Edit production settings file
$ vim server/config/environment/production.js

# Add config variables to Heroku config list
heroku config:add NODE_ENV=production
heroku config:add DOMAIN=app-name.herokuapp.com
heroku config:add HEROKU_COOKIE_SECRET=MYSECRET
heroku config:add HEROKU_COUCHDB_URL=http://my-couchdb-server:5984

# Add files, commit and push
git add ./*
git commit -m "My message"
git push heroku master

# View Site! :)
```