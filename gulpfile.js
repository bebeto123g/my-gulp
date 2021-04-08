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

function browsersync() {
  browserSync.init({
    server: { baseDir: 'app/' },
    notify: false,
    online: true,
  })
}

function styles() {
  return src('app/style/main.less') // .styl
    .pipe(less()) // .pipe(stylus())
    .pipe(concat('app.min.css'))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } /* format: 'beautify' */ }))
    .pipe(dest('app/style/'))
    .pipe(browserSync.stream())
}

function images() {
  return src('app/assets/src/**/*')
    .pipe(newer('app/assets/dest/'))
    .pipe(imagemin())
    .pipe(dest('app/assets/dest/'))
}

function cleanimg() {
  return del('app/assets/dest/**/*', { force: true })
}

function scripts() {
  return src(['app/js/jquery-3.5.1.min.js', 'app/js/main.js'])
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js/'))
    .pipe(browserSync.stream())
}

function startWatch() {
  watch('app/style/**/*.less', styles) // 'app/style/**/*.styl'
  watch(['app/**/*.js', '!app/**/*.min.js'], scripts)
  watch('app/**/*.html').on('change', browserSync.reload)
  watch('app/assets/src/**/*', images)
}

function buildcopy() {
  return src(
    ['app/css/**/*.min.css', 'app/js/**/*.min.js', 'app/assets/dest/**/*', 'app/**/*.html'],
    { base: 'app' }
  ).pipe(dest('dist'))
}

function cleandist() {
	return del('dist/**/*', { force: true })
}

exports.browsersync = browsersync
exports.styles = styles
exports.images = images
exports.cleanimg = cleanimg // удалим все картинки
exports.scripts = scripts
exports.buildcopy = buildcopy

exports.default = parallel(styles, scripts, browsersync, startWatch)
exports.build = series(cleandist, styles, scripts, images, buildcopy)