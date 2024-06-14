const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const replace = require('gulp-replace');

// Paths for vendor scripts, styles, and fonts
const paths = {
    css: [
        'node_modules/bootstrap/dist/css/bootstrap.min.css',
        // Add other CSS files here
    ],
    js: [
        'node_modules/jquery/dist/jquery.js', // jQuery
        'node_modules/bootstrap/dist/js/bootstrap.bundle.js', // Includes Popper for Bootstrap
        'node_modules/animejs/lib/anime.js',
        // Add other JS files here
    ],
    iconCSS: [
        'node_modules/bootstrap-icons/font/bootstrap-icons.css',  // Bootstrap Icons CSS
        'node_modules/@fortawesome/fontawesome-free/css/all.css',  // Font Awesome CSS
    ]
};

// Task to handle icon CSS and fonts
gulp.task('icons', function() {
    // Copy icon CSS and adjust font URL paths
    return gulp.src(paths.iconCSS)
        .pipe(sourcemaps.init())  // Start sourcemaps recording
        .pipe(concat('icons.css'))
        .pipe(replace('./fonts/', '../fonts/'))  // Adjusting paths relative to the dist directory
        .pipe(replace('../webfonts/', '../fonts/'))  // Adjusting paths relative to the dist directory
        .pipe(gulp.dest('css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(sourcemaps.write('./'))  // Write sourcemaps to the same directory
        .pipe(gulp.dest('css'));
});

// Task to concatenate and copy vendor CSS
gulp.task('vendors-css', function () {
    return gulp.src(paths.css)
        .pipe(sourcemaps.init())  // Start sourcemaps recording
        .pipe(concat('vendors.css'))
        .pipe(gulp.dest('css'))  // Adjust path as necessary
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('./'))  // Write sourcemaps to the same directory
        .pipe(gulp.dest('css'));  // Output both minified and regular as same file, adjust if needed
});

// Task to concatenate, generate sourcemaps, and copy vendor JS
gulp.task('vendors-js', function () {
    return gulp.src(paths.js)
        .pipe(sourcemaps.init())  // Start sourcemaps recording
        .pipe(concat('vendors.js'))
        .pipe(gulp.dest('js'))  // Adjust path as necessarygulp
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())  // Minifying the JS
        .pipe(sourcemaps.write('./'))  // Write sourcemaps to the same directory
        .pipe(gulp.dest('js'));  // Adjust path as necessary
});

// Create a Gulp task for compiling SASS to CSS, generating sourcemaps, and outputting both minified and raw CSS
gulp.task('sass', function () {
    return gulp.src('sass/**/*.scss')  // Source folder containing the SASS files
        .pipe(sourcemaps.init())  // Initialize sourcemap generation
        .pipe(sass().on('error', sass.logError))  // Compiling SASS to CSS and logging errors
        .pipe(gulp.dest('css'))  // Output raw (unminified) CSS
        .pipe(cleanCSS({compatibility: 'ie8'}))  // Minifying the CSS
        .pipe(rename({suffix: '.min'}))  // Append ".min" to the filename
        .pipe(sourcemaps.write('./'))  // Writing sourcemaps to the same directory as the CSS output
        .pipe(gulp.dest('css'))  // Output minified CSS
        .pipe(browserSync.stream());  // Injecting changes via BrowserSync
});

// Initialize BrowserSync with a server to serve the files
gulp.task('serve', function() {
    browserSync.init({
        server: "./"  // Serve files from the root directory
    });

    gulp.watch('sass/**/*.scss', gulp.series('sass'));  // Watch SASS files for changes
    gulp.watch('./*.html').on('change', browserSync.reload);  // Reload on HTML file changes
});

// Default task that can be called using just 'gulp' in the terminal
gulp.task('default', gulp.series('sass', 'vendors-css', 'vendors-js', 'icons', 'serve'));
