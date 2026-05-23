DevPulse

Internal Issue & Feature Tracker for Software Teams


 Live API: https://b7a2-devpulse-2.onrender.com


 Features

Feature                                        	Who Can Use

Register / Login	                            Everyone
Create bugs & feature requests	                Contributors + Maintainers
View all issues(filter + sort)	                Everyone
Update issues	                                Owners (open issues) + Maintainers
Change issue status                         	Maintainers only
Delete issues	                                Maintainers only
View system metrics                           	Maintainers only

 Tech 

Node.js + TypeScript
Express.js
PostgreSQL
JWT + bcrypt
Raw SQL (no ORM)
Render / Vercel / Railway


 API Endpoints


 Authentication

Action	            Method	                 Endpoint
Register         	POST	                 /api/auth/signup
Login	            POST                     /api/auth/login

 Issues

Action                 	Method           	Endpoint             	Access
Create	                POST	           /api/issues	            Auth required
List all             	GET	               /api/issues	            Public
Get one	                GET                /api/issues/:id	        Public
Update	                PATCH	           /api/issues/:id	        Owner or Maintainer
Update status	        PATCH	           /api/issues/:id/status	 Maintainer only
Delete	                DELETE	           /api/issues/:id	         Maintainer only
Metrics               	GET	               /api/issues/metrics	    Maintainer only

  JWT token required in Authorization header

 Query Parameters (GET /api/issues)

Param         	Values                         	Default
sort	        newest, oldest	                newest
type	        bug, feature_request          	all
status	        open, in_progress, resolved 	all

Example: GET /api/issues?sort=oldest&type=bug&status=open

 Database Schema

Table 1: users

Column                   	Type	               Rules
id	                        SERIAL	               Primary key
name	                    VARCHAR(255)	       Required
email	                    VARCHAR(255)	       Required, unique
password	                VARCHAR(255)	       Required, hashed
role	                    VARCHAR(50)        	   contributor or maintainer
created_at	                TIMESTAMP	           Auto
updated_at	                TIMESTAMP	           Auto


Table 2: issues


Column	                      Type	                   Rules
id                         	  SERIAL	               Primary key
title	                      VARCHAR(150)	           Required, max 150 chars
description	                  TEXT	                   Required, min 20 chars
type	                      VARCHAR(50)              bug or feature_request
status	                      VARCHAR(50)	           open, in_progress, resolved
reporter_id	                  INTEGER	               References users.id
created_at	                  TIMESTAMP	               Auto
updated_at	                  TIMESTAMP	               Auto
