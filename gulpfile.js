var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    jasmine = require('gulp-jasmine'),
    plumber = require('gulp-plumber'),
    tslint = require('gulp-tslint'),
    tsconfig = require('./tsconfig.json');

var tsProj = ts.createProject('tsconfig.json'),
    outDir = tsconfig.compilerOptions.outDir || 'dist',
    srcGlob = ['src/**/*.ts', 'tests/**/*.ts'];

gulp.task('build', ['lint'], () => {
    return tsProj.src()
        .pipe(ts(tsProj))
        .pipe(gulp.dest(outDir));
});

gulp.task('lint', () => {
  return gulp.src(srcGlob)
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('test', ['build'], () => {
    gulp.src('dist/tests/**/*.js')
        .pipe(jasmine());
});

gulp.task('watch-continue-on-error', ['build'], () => {
    gulp.src(srcGlob)
        .pipe(plumber({
          errorHandler: (err) => {
            console.log('\n\nGulp Error:', err.message, err.stack, '\n\n');
        }}))
        .pipe(jasmine());
});

gulp.task('watch', ['watch-continue-on-error'], () => {
    gulp.watch(srcGlob, ['watch-continue-on-errord']);
});
