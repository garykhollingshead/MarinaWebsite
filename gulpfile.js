"use strict";

var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var lazypipe = require("lazypipe");
var del = require("del");
var runSequence = require("run-sequence");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var fs = require("fs");
var sass = require("gulp-sass");
var inject = require("gulp-inject");
var browserSync = require("browser-sync").create();
var rename = require("gulp-rename");
var buffer = require("vinyl-buffer");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");

var appDirs = {
  root: "app",
  scripts: "app/scripts",
  styles: "app/styles",
  fonts: "app/fonts",
  views: "app/views",
  images: "app/images"
};

var distDirs = {
  root: "dist",
  scripts: "dist/scripts",
  views: "dist/views",
  images: "dist/images",
  styles: "dist/styles",
  fonts: "dist/fonts"
};

var outputDir = "output";
var appFiles = {
  allScripts: appDirs.scripts + "/**/*.js",
  allSass: appDirs.styles + "/**/*.scss",
  allCss: appDirs.styles + "/**/*.css",
  allViews: appDirs.views + "/**/*.html",
  allImages: appDirs.images + "/**/*",
  allFonts: [
    appDirs.fonts + "/**/*.eot",
    appDirs.fonts + "/**/*.otf",
    appDirs.fonts + "/**/*.svg",
    appDirs.fonts + "/**/*.ttf",
    appDirs.fonts + "/**/*.woff",
    appDirs.fonts + "/**/*.woff2"
  ],
  index: appDirs.root + "/index.html",
  vendorStyles: appDirs.styles + "/vendorStyles.json",
  app: appDirs.scripts + "/app.js",
  mainSass: appDirs.root + "/main.scss",
  vendorFonts: appDirs.fonts + "/vendorFonts.json"
};
var distFiles = {
  allFiles: distDirs.root + "/**/*",
  gitIgnore: distDirs + "/.gitignore"
};

var vendorStyles = require("./" + appFiles.vendorStyles);
var vendorFonts = require("./" + appFiles.vendorFonts);

////////////////////////
// Reusable pipelines //
////////////////////////

var lintScripts = lazypipe()
  .pipe($.jshint, ".jshintrc")
  .pipe($.jshint.reporter, "jshint-stylish");

///////////
// Tasks //
///////////

gulp.task("browserSync", ["watch"], function(cb) {
  browserSync.init({
    proxy: "localhost/foo"
  }, cb);
});

gulp.task("watch", ["build"], function () {
  gulp.watch(appFiles.allSass, ["sass"]);
  gulp.watch(appFiles.allCss, ["css"]);
  gulp.watch(appFiles.allViews, ["views"]);
  gulp.watch(appFiles.allImages, ["images"]);
  gulp.watch(appFiles.allFonts, ["fonts"]);
  gulp.watch(appFiles.allScripts, ["browserify"]);
  gulp.watch(appFiles.index, ["index"]);
});

gulp.task("styles", ["sass", "css", "fonts"]);

gulp.task("sass", function () {
  var sassFiles = vendorStyles.filter(function (item) {
    return item.endsWith(".scss");
  }).concat(appFiles.allSass);

  var injectAppFiles = gulp.src(sassFiles, {read: false, base: "."});
 
  function transformFilepath(filepath) {
    return "@import \"" + filepath + "\";";
  }
 
  var injectAppOptions = {
    transform: transformFilepath,
    starttag: "// inject:app",
    endtag: "// endinject",
    addRootSlash: false
  };
  
  return gulp.src(appFiles.mainSass)
    .pipe(inject(injectAppFiles, injectAppOptions))
    .pipe(sass())
    .pipe(rename("compiledSass.css"))
    .pipe(gulp.dest(distDirs.styles))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task("css", function () {
  var cssFiles = vendorStyles.filter(function (item) {
    return item.endsWith(".css");
  }).concat(appFiles.allCss);

  return gulp.src(cssFiles)
    .pipe(rename("compiledCss.css"))
    .pipe(gulp.dest(distDirs.styles))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task("fonts", function () {
  vendorFonts.forEach(function (item) {
    gulp.src(item.src)
    .pipe(gulp.dest(distDirs.fonts + "/" + item.fontsSubfolder))
    .pipe(browserSync.reload({
      stream: true
    }));
  });
  
  return gulp.src(appFiles.allFonts)
    .pipe(gulp.dest(distDirs.fonts))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task("lint-scripts", function () {
  return gulp.src(appFiles.allScripts)
    .pipe(lintScripts());
});

gulp.task("clean", function () {
  return del([distFiles.allFiles, "!" + distDirs.gitIgnore]);
});

gulp.task("index", function () {
  return gulp.src(appFiles.index)
    .pipe(gulp.dest(distDirs.root));
});

gulp.task("views", function () {
  return gulp.src(appFiles.allViews)
    .pipe(gulp.dest(distDirs.views));
});

gulp.task("images", function () {
  return gulp.src(appFiles.allImages)
    .pipe($.cache($.imagemin({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest(distDirs.images));
});

gulp.task("build", ["clean"], function (cb) {
  runSequence(["lint-scripts", "images", "views", "index", "styles", "browserify"], cb);
});

gulp.task("browserify",  function() {
  return browserify({entries: appFiles.app, debug: true})
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(distDirs.scripts))
    .pipe(browserSync.reload({
      stream: true,
      debug: true
    }));
});

gulp.task("clean-output", function () {
  return del(outputDir);
});

gulp.task("default", ["build"]);
