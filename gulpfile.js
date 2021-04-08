const { src, dest, parallel, series, watch } = require('gulp')
const browserSync = require('browser-sync').create()
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default
const less = require('gulp-less')
// const stylus = require('gulp-stylus')
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

function pug2html() {
  return src('src/pages/*.pug')
    .pipe(pugLinter({ reporter: 'default', failAfterError: true }))
    .pipe(pug())
    .pipe(dest('src/'))
  // failAfterError остановит сборку
}

function browsersync() {
  browserSync.init({
    server: { baseDir: 'src/' },
    notify: false,
    online: true,
  })
}

function styles() {
  return src('src/styles/main.less') // .styl
    .pipe(less()) // .pipe(stylus())
    .pipe(concat('app.min.css'))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } /* format: 'beautify' */ }))
    .pipe(dest('src/styles/'))
    .pipe(browserSync.stream())
}

function images() {
  return src('src/assets/src/**/*')
    .pipe(newer('src/assets/dest/'))
    .pipe(imagemin())
    .pipe(dest('src/assets/dest/'))
}

function cleanimg() {
  return del('app/assets/dest/**/*', { force: true })
}

function scripts() {
  // return src(['src/js/jquery-3.5.1.min.js', 'src/js/main.js'])
  return src('src/js/main.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(terser())
    .pipe(sourcemaps.write())
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(dest('src/js/'))
    .pipe(browserSync.stream())
}

function startWatch() {
  watch('src/styles/**/*.less', styles) // 'app/style/**/*.styl'
  watch(['src/**/*.js', '!src/**/*.min.js'], scripts)
  // watch('src/**/*.html').on('change', browserSync.reload)
  watch('src/**/*.pug', pug2html).on('change', browserSync.reload)
  watch('src/assets/src/**/*', images)
}

function buildcopy() {
  return src(
    ['src/css/**/*.min.css', 'src/js/**/*.min.js', 'src/assets/dest/**/*', 'src/**/*.html'],
    { base: 'src' }
  ).pipe(dest('build'))
}

function cleandist() {
  return del('build/**/*', { force: true })
}

exports.browsersync = browsersync
exports.styles = styles
exports.images = images
exports.cleanimg = cleanimg // удалим все картинки
exports.scripts = scripts
exports.buildcopy = buildcopy
exports.pug2html = pug2html

exports.default = parallel(pug2html, styles, scripts, browsersync, startWatch)
exports.build = series(cleandist, styles, scripts, images, buildcopy)
