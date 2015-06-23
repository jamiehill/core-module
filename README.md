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
