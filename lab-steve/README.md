# Lab 41 - Oauth

**Author**: Steve Carpenter
**Version**: 1.0.0

## Overview
This is a RESTful HTTP server that utilizes both basic authentication as well
as Bearer tokenized authentication for access to any of its `/api/v1/car`
routes. It supports the three following route types:
- `signup`
- `signin`
- `oauth/google`
- `car`

## Getting Started
The user needs to do the following to use this RESTful HTTP API:
- Clone the repository from github [here](https://github.com/stevegcarpenter/41-oauth)
- Install all the necessary `npm` packages by executing `npm install` as well as `npm install -D`
- To run the `linter` check execute `npm run lint`
- Alternatively, run `npm run lint:test` to first run the linter and then the test suite

## Architecture
- NodeJS
- npm
- JavaScript

## Change Log
```
2018-03-06 Update README.md
2018-03-12 Adding previous backend from lab 17 for oauth lab
2018-03-12 Oauth is now working with creating a new user
2018-03-12 Added functionality to find previously created users using oauth
2018-03-12 Cosmetic cleanup
```

## Credits and Collaborations
- [NodeJS](https://nodejs.org)
- [npm](https://www.npmjs.com/)
- [JavaScript](https://www.javascript.com/)
