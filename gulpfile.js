'use strict';

const argv                 = require('yargs').argv;
const gulp                 = require('gulp');
const cache                = require('gulp-cached');
const connect              = require('gulp-connect');
const rollup               = require('rollup');
const rollup_commonjs      = require('@rollup/plugin-commonjs');
const rollup_resolve       = require('@rollup/plugin-node-resolve');
const rollup_terser        = require('rollup-plugin-terser');
const rollup_license       = require('rollup-plugin-license');
const jshint               = require('gulp-jshint');
const fs                   = require('fs');
const pkg                  = JSON.parse(fs.readFileSync('./package.json'));

let rollup_cache;
// ### Rollup
// `gulp rollup`
gulp.task('rollup', async function () {
  let bundle = await rollup.rollup({
    input: './src/main.js',
    context: 'window',
    plugins: [
      rollup_resolve.nodeResolve({
        main: false,
        mainFields: ['browser', 'module'],
        extensions: ['.js'],
        customResolveoptsions: {
          package: {},
          moduleDirectory: ['node_modules']
        }
      }),
      rollup_commonjs({
        include: 'node_modules/**'
      }),
      argv.production && rollup_terser.terser(),
      rollup_license({
        banner: `jquery.youtube-background v<%= pkg.version %> | Nikola Stamatovic <@stamat> | MIT`
      })
    ]
  });

  let opts = {
    file: './jquery.youtube-background.js',
    format: 'iife',
    sourcemap: false
  };

  if (argv.production) {
    opts.file = './jquery.youtube-background.min.js';
  }

  if (argv.sourcemap) {
    opts.sourcemap = true;
  }

  await bundle.write(opts).then(() => {
    gulp.src([
      './*.js'
    ])
    .pipe(connect.reload());
  });
});

// ### JSHint
// `gulp jshint`
gulp.task('lint-js', function() {
  return gulp.src(['./src/*.js'])
    .pipe(cache('lint-js'))
    .pipe(jshint({
      "esversion": 10
    }))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('server', async function () {
  connect.server({
    port: 4040,
    livereload: true
  });
});

gulp.task('watch', async function () {
  gulp.watch(['./src/**/*.js'], gulp.series('lint-js', 'rollup'));
  gulp.watch([
    './*.html'
  ], connect.reload());
});

// ### Build
// `gulp build`
gulp.task('build', gulp.series('rollup'));

// ### Serve
// `gulp serve`
gulp.task('serve', gulp.series('lint-js', 'rollup', 'server', 'watch'));

gulp.task('default', gulp.series('serve'));
