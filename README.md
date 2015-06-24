Base Module
===========

The building blocks for creating a new self contained - and runnable - module, to be consumed by the Sportsbook shell.


Creating a new module from scratch
----------------------------------

Clone the repository, changing the remote origin to point to the new module's repository location

    $ git clone https://github.com/jamiehill/base-module.git mynew-module
    $ cd mynew-module
    $ git remote rename origin upstream
    $ git remote add origin URL_TO_GITHUB_REPO
    $ git push origin master

You'll now have a copy of the base-module in your new module repository, which should be pre-configured to run out-of-the-box.


Setup
-----

***NB If simply creating a library component, rather than a loadable, view module, the following steps are not required.***


**1. Renaming the module**

The `name` field, in `package.json`, should be updated to reflect the name of the new module.  Lowercase/No whitespace.


**2. Renaming the packages**

Inside the `./src/module/js` folder in the new module, is a folder called `base`.  This folder name dictates hows the module should be namespaced, to avoid import collisions from other modules.  As such, it's name should be changed, to something appropriate for the module.

The are several other files in the root of `./src/module/js`.  These are files required to boot the module up independantly of a shell application, and shouldn't be modify or removed.

When importing a module into a shell application, the only files visible to the application are what's inside the namespace folder we renamed earlier.


**3. Configure entrypoint**

If the module is a view module, we need to configure the top level class for the module to be displayed.  This should added to the `'main'` field in `package.json`.

If the top level view to be displayed has the path `src/module/js/mymodule/MyModuleView.js`, we'd add that entry into `package.json` as such:

```
{
	"name": "my-module",
	"main": "src/module/js/mymodule/MyModuleView.js"
}
```

This is picked up by the module loader, in order to correctly bootstrap and render the module.


**4. Change repository endpoint**

The `repository` url, `homepage` field, and `bugs` url, in `package.json`, should be updated to reflect the new repository housing the module.


Using
-----

To use a module in a shell/parent application, it simply needs to be declared as a git submodule.  The module repo will then be linked as a nested repo, inside of the parent application.

**1. Add module to parent application***

First we need to add the repo of the module we require, as a submodule in our application, specifying in which directory the submodule should be added.  For consistency sake, the directory the submodule is added to, should be in a the root `modules` folder

`modules/my-module`

for example:

`git submodule add https://github.com/jamiehill/core-module.git modules/core-module`

**2. Pulling submodule source, when cloning the parent**

When a contributor clones the parent application, the submodule directories are not populated by default.  To pull down their source, you should:

`git submodule init` then `git submodule update`

**3. Mapping the included module in the parent application**

Once imported into the parent application, the module's root content folder - as defined above in `Setup #2` - needs adding to the systemjs configuration, so that the dependecies the module includes, can be used in the application.

Inside `config.js` under the `"paths"` object, map the name we want the dependency paths starting with, to the actual location in the parent application, ie:

```
System.config({
  "baseURL": "./js"
  },
  "paths": {
    "*": "*.js",
    "github:*": "../../vendor/github/*.js",
    "npm:*": "../../vendor/npm/*.js",
    "base*":"../../../modules/my-module/src/js/base*",
  }
});
```

If we now wanted to import, say, `src/js/base/BaseView.js` into the parent application, we can simply say:

`import BaseView from 'base/BaseView'`

**Voila!**



