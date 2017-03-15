Readme.md

Celestial-insurance-company (Node.js)


NODE Server  (index.js)------------------------------------------------------------------------------------------

The node application is structured in the following way

+ home
   - index.js				- main node program,  basically a router for requests via express.
   - config.yaml	        - yaml config file for configuration of entire application.
   - package.json			- node package.json
   - demodb.db              - A sqlite database used by application to store data.
   + js
     - config.js 			- module that reads and supplies configuration information from yaml file.