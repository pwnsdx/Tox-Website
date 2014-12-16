# Grunt CSS Url Rewrite

This task provides a way to rewrite all URL's found within a stylesheet (those within a url( ... ) declaration), to improve cache-invalidation or to reference a CDN or something like that.

## Getting Started

Install this plugin with the command:

```js
npm install grunt-css-url-rewrite
```

Next, add this line to your project's grunt file:

```js
grunt.loadNpmTasks("grunt-css-url-rewrite");
```

Lastly, add configuration settings to your grunt.js file (see below).

## Documentation

This task has two required properties, `src` and `dest`. `src` is the path to your stylesheet and `dest` is the file this task will write to (relative to the grunt.js file). If this file already exists **it will be overwritten**.

An example configuration looks like this:

```js
grunt.initConfig({
  cssUrlRewrite: {
    dist: {
      src: "css/styles.css",
      dest: "css/output.css",
      options: {
        skipExternal: true,
        rewriteUrl: function(url, options, dataURI) {
          var path = url.replace(options.baseDir, '');
          var hash = require('crypto').createHash('md5').update(dataURI).digest('hex');
          return '/v-' + hash + '/' + path;
        }
      }
    }
  }
});
```

```css
/* styles.css */

.local {
  /* local images */
  background-image: url('../images/test.png');
}

.skip {
  /* skip images using a querystring directive */
  background-image: url('../images/test.gif?gruntCssUrlRewrite=skip');
}

.external {
  /* external images don't really work, yet */
  background-image: url('https://raw.github.com/jpunt/grunt-css-url-rewrite/master/example/images/test.png');
  border-width: 1px;
  border-style: solid;
  border-color: black;
}

@font-face {
  font-family: 'tar_bkregular';
  src: url('../fonts/chunkfive-webfont.eot');
  src: url('../fonts/chunkfive-webfont.eot?#iefix') format('embedded-opentype'),
       url('../fonts/chunkfive-webfont.woff') format('woff'),
       url('../fonts/chunkfive-webfont.ttf') format('truetype'),
       url('../fonts/chunkfive-webfont.svg#tar_bkregular') format('svg');
  font-weight: normal;
  font-style: normal;
}
```

```css
/* output.css */

.local {
  /* local images */
  background-image: url("/v-c673f2e6e65779f0f23c8b96d35e4118/images/test.png");
}

.skip {
  /* skip images using a querystring directive */
  background-image: url("../images/test.gif");
}

.external {
  /* external images don't really work, yet */
  background-image: url("https://raw.github.com/jpunt/grunt-css-url-rewrite/master/example/images/test.png");
  border-width: 1px;
  border-style: solid;
  border-color: black;
}

@font-face {
  font-family: 'tar_bkregular';
  src: url("/v-4dcb54828bb2a94b6259d2c738191f5e/fonts/chunkfive-webfont.eot");
  src: url("/v-4dcb54828bb2a94b6259d2c738191f5e/fonts/chunkfive-webfont.eot?#iefix") format('embedded-opentype'),
       url("/v-700acb7385ecf3df057af8fba100a1b7/fonts/chunkfive-webfont.woff") format('woff'),
       url("/v-752d9880e832fa7bcfe8a101d56c51f9/fonts/chunkfive-webfont.ttf") format('truetype'),
       url("/v-6ebd8105448deb58f622caa3a37feb35/fonts/chunkfive-webfont.svg#tar_bkregular") format('svg');
  font-weight: normal;
  font-style: normal;
}
```

### Optional Configuration Properties

CssUrlRewrite can be customized by specifying the following options:

* `baseDir`: If you have absolute image paths in your stylesheet, the path specified in this option will be used as the base directory.
* `stripParameters`: Remove querystring-parameters from url's.
* `skipExternal`: Skip external url's. Rewriting external url's doesn't always work yet, so this could be necessary for good results.
* `parallel`: true to execute the rewrite asynchronously for each file. Default value is true.

### Skipping Images

Specify that an image should be skipped by adding the following querystring *after* the image:

```css
background: url(image.gif?gruntCssUrlRewrite=skip);
```

## Compatibility

This plugin is compatible with Grunt 0.4.x.

## License

Copyright (c) 2014 Jasper Haggenburg (@jpunt)
Licensed under the MIT License.
