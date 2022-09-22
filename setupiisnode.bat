@echo off

REM Check to make sure we are running in an admin window
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo #### ERROR ####
    echo This script must be run as an administrator to work properly. Please re-run with an admin prompt.
    exit /b 1
)

set iisappcmd=%windir%\system32\inetsrv\appcmd.exe

echo Make sure IIS is started...
iisreset /start

set poolName=CoordinatorPool
set siteName=CoordinatorSite
set siteDirectory=%CD%

echo Adding .NET 4.5 App Pool called %poolName%...
%iisappcmd% delete apppool "%poolName%"
%iisappcmd% add apppool /name:"%poolName%" /managedRuntimeVersion:v4.0 /managedPipelineMode:Integrated

REM Create a fresh site to work with, and delete the old one if it's still there
echo Deleting existing %siteName% site (if it exists)...
%iisappcmd% delete site "%siteName%"

echo Creating %siteName% site...
%iisappcmd% add site /name:"%siteName%" /physicalPath:"%siteDirectory%"
%iisappcmd% set site /site.name:"%siteName%" /+bindings.[protocol='http',bindingInformation='*:80:']
%iisappcmd% set site /site.name:"%siteName%" /+bindings.[protocol='https',bindingInformation='*:443:']
%iisappcmd% set site /site.name:"%siteName%" /[path='/'].applicationPool:"%poolName%"

echo Starting %siteName% site...
%iisappcmd% start apppool "%poolName%"
%iisappcmd% start site "%siteName%"

echo Successfully created site! Go to http://localhost to view the site.
