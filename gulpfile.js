const { src, dest, parallel, series, watch } = require('gulp')
const browserSync = require('browser-sync').create()
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default
const sass = require('gulp-dart-sass')
const autoprefixer = require('gulp-autoprefixer')
const cleancss = require('gulp-clean-css')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const del = require('del')
const pug = require('gulp-pug')
const pugLinter = require('gulp-pug-linter')
const eslint = require('gulp-eslint')
const babel = require('gulp-babel')
const terser = require('gulp-terser')
const sourcemaps = require('gulp-sourcemaps')

const WEB_URL = 'web_server/'
const BUILD_URL = 'build/'
const SOURCE_URL = 'src/'

function pug2html() {
  return src(SOURCE_URL + '/pages/*.pug')
    .pipe(pugLinter({ reporter: 'default', failAfterError: true }))
    .pipe(pug())
    .pipe(dest(WEB_URL))
  // failAfterError остановит сборку
}

function browsersync() {
  browserSync.init({
    server: { baseDir: WEB_URL },
    notify: false,
    online: true,
  })
}

function styles() {
  return src(SOURCE_URL + 'styles/main.scss') 
    .pipe(sass())
    .pipe(concat('app.min.css'))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } /* format: 'beautify' */ }))
    .pipe(dest(WEB_URL + 'css/'))
    .pipe(browserSync.stream())
}

function images() {
  return src(SOURCE_URL + 'assets/**/*')
    .pipe(newer(WEB_URL + 'assets/'))
    .pipe(imagemin())
    .pipe(dest(WEB_URL + 'assets/'))
}

function cleanimg() {
  return del('app/assets/dest/**/*', { force: true })
}

function scripts() {
  // return src(['src/js/jquery-3.5.1.min.js', 'src/js/main.js'])
  return src([SOURCE_URL + 'js/jquery-3.6.0.min.js', SOURCE_URL + 'js/main.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(terser())
    .pipe(sourcemaps.write())
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(dest(WEB_URL + 'js/'))
    .pipe(browserSync.stream())
}

function startWatch() {
  watch(SOURCE_URL + 'styles/**/*.scss', styles)
  watch([SOURCE_URL + '**/*.js', '!' + SOURCE_URL + '**/*.min.js'], scripts)
  // watch('src/**/*.html').on('change', browserSync.reload)
  watch(SOURCE_URL + 'pages/**/*.pug', pug2html).on('change', browserSync.reload)
  watch(SOURCE_URL + 'assets/src/**/*', images)
}

function buildcopy() {
  return src(
    [
      WEB_URL + 'css/**/*.min.css',
      WEB_URL + 'js/**/*.min.js',
      WEB_URL + 'assets/**/*',
      WEB_URL + '**/*.html',
    ],
    { base: WEB_URL }
  ).pipe(dest(BUILD_URL))
}

function cleanbuild() {
  return del(BUILD_URL + '**/*', { force: true })
}

exports.browsersync = browsersync
exports.styles = styles
exports.images = images
exports.cleanimg = cleanimg // удалим все картинки
exports.scripts = scripts
exports.buildcopy = buildcopy
exports.pug2html = pug2html
exports.cleanbuild = cleanbuild

exports.default = parallel(pug2html, styles, scripts, browsersync, startWatch)
exports.build = series(cleanbuild, styles, scripts, images, buildcopy)
