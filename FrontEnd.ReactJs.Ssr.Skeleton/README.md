# shop-in-3d.Coordinator  

![Team](https://img.shields.io/badge/rex-shop--in--3d-blue)
[![Contact](Engineering - Shop-In-3D squad)]( <f0a533ff.microsoft.com@amer.teams.ms>)

The Coordinator is a ReactJS FE server, running on NodeJS, which powers the Shop-In-3d experience across Microsoft partners and Vendor.

## References

* [ShopIn3d - Widget Architecture](https://microsoft.sharepoint.com/:w:/t/shop-in-3d-babylonjs-vendors/EazCziImcChLlXdyjTBlLSEBoyPvehvr9alUNg8mRbRm_g?e=ufYQw8)
* [ShopIn3d - FE Coordinator Spec](https://microsoft.sharepoint.com/:w:/t/shop-in-3d-babylonjs-vendors/Eb6XftNXJWJHlQ2VYabqcEgB7o2oo4yOrlmX_iF7Ua7v9w?e=be953W)

# Deployment

The coordinator service supports 3 different environments:
 - DEV: Changes commit to master are automatically deployed to the dev environment
 - PPE: Typically used for demos, or cross-teams testing builds.
 - PROD: Production code. Requires approval for deployment.

## A note regarding node services in Azure

Node services can be run in Windows or Linux machines on Azure.
In our project, we use Windows images, however, windows node servers are hidden behind IIS services (iisnode), which imposes additional configuration steps.

There are 2 files in our project which controls specific settings on iis for our service:
- [iisnode.yml](/ShopIn3d.Coordinator/iisnode.yml)
- [web.config](/ShopIn3d.Coordinator/web.config)

Beware that there is little documentation iisnode. In general, we found that settings applied to web.config iis services apply equally to iisnode.
Also, note that IIS upfronts all traffic to our node service. Meaning it might actually prevent requests from reaching our service, if improperly configured.

# Git repo

The coordinator source can be found in the [CSME-Stores-DM-ISE-TheeDProductsCore](https://microsoftit.visualstudio.com/OneITVSO/_git/CSME-Stores-DM-ISE-ThreeDProductsCore?version=GBmaster&_a=contents) repository. Navigate to the `ShopIn3d.Coordinator` folder to access the source.

## Build pipeline
Our [azure build pipeline script](/ShopIn3d.Coordinator/coordinator-build.yml) lists a set of steps to produce the coordinator artifacts. 

Generally, our build pipeline performs the following steps:
- go to the coordinator root
- npm install: installs all node dependencies
- npm run build: produces 6 webpack bundles
    * si3d-coordinator-client.js
    * si3d-coordinator-server.js
    * si3d-coordinator-client.ppe.js
    * si3d-coordinator-server.ppe.js
    * si3d-coordinator-client.prod.js
    * si3d-coordinator-server.prod.js
- Run all tests.
- Publishes the code coverage.
- Download SI3D player artifact to the project folder. This is produces the by ShopIn3d.Player project, when commiting to master.
- Unzip the 3D player artifact locally.
- Rename the player bundle, to its corresponding to each environment (e.g., si3d.player.bundle.dev.js for the dev environment).
- Copies the 3d player bundle to the /dist folder. 
- Copies .env files from the player to the local /dist folder (required player static assets).
- Copies .css files from the player to the local /dist folder (required player static assets).
- Zip all files as the DEV artifact.
- Overwrites the si3d-coordinator.server.js with the content of si3d-coordinator-server.ppe.js. This is required because our npm start command looks for the bundle named si3d-coordinator-server.js, regardless the environment.
- Zip all files as the PPE artifact.
- Overwrites the si3d-coordinator.server.js with the content of si3d-coordinator-server.prod.js.
- Zip all files as the PROD artifact.
- Publish all artifacts.

You can verify all build runs for coordianator in the [Azure build pipeline](https://microsoftit.visualstudio.com/OneITVSO/_build?view=runs)

# Development
The coordinator is node service, running ReactJS + redux, with SSR (Server-Side rendering).

To develop the service locally, first, you will need to install [nodeJS](https://nodejs.org/en/).
Use [Visual Studio Code](https://code.visualstudio.com/download) as your IDE.

During our build, we use webpack to produce the client and the server bundles. 
In our webpack scripts, we use the npm [dot-env](https://www.npmjs.com/package/dotenv) to define a set of variables for each environment:
- .azure.dev: environment variables for the local and azure:dev environments (we use the same file for both)
- .azure.ppe: environment variables for the ppe environment
- .azure.prod: environment variables for the prod environment

When running the server, the server bundle is passed as an input parameter  via "npm run start" script to the node process. 
The server then uses server-side rendereing to pre-fetch the core-api experience data and pre-produce the returned HTML.

The returned HTML is defined by the [rendered.js](/ShopIn3d.Coordinator/src/helpers/renderer.js), and contains an HTML script tag which loads the client bundle.

## Local dev .NPMRC updates

We now consume the 1DS npm package which required you to connect to our nuget feed from your machine. You will need to run the following commands to both install the tools in addition to configuring your local environment. The vsts-npm-auth tool only works on windows, you will need to manually perform the steps on linux/mac.

```
//Install Tools
npm install --location=global vsts-npm-auth --registry https://registry.npmjs.com --always-auth false

//Configure package feed
vsts-npm-auth -config .npmrc

//Force refresh the local credentials
vsts-npm-auth -F -config .npmrc
```
## Local

To run this project:

```
npm i
npm run server:dev
```

## Local (in StoryBook)

This repo is configured to use [Storybook](https://storybook.js.org/docs/basics/introduction/). You can update ShopIn3d.Coordinator and visualize your changes dynamically, without having to run this or any other services locally.

```
npm i
npm run storybook
```

## Local (using IIS)
To more closely mimic how we run in Azure, you can run using iisnode and IIS locally:
1. [Install IIS](https://docs.microsoft.com/en-us/iis/application-frameworks/scenario-build-an-aspnet-website-on-iis/configuring-step-1-install-iis-and-asp-net-modules)
2. Open an admin command prompt and run `setupiisnode.bat`
3. Go to http://localhost in the browser to view the site - it's running port 80/443 (though HTTPS may not work properly without some extra setup steps)

### Adding new stories

To add new stories, create a new file with a `.stories.js` extension within the `\./stories` folder. Refer to commited stories for examples on usage.

# Unit-Testing

To run unit tests:

```
npm i 
npm run test
```

To run unit tests, and output a code coverage report:

```
npm run test:coverage
```
# Running eslint

To run eslint locally and fix automatically all minor issues:

```
npm i 
npm run lint:fix
```

# Typechecking

To run a static check on the code for types:

```
npm i 
npm run typecheck
```
