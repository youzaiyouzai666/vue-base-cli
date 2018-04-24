const Metalsmith = require('metalsmith')
const multimatch = require('multimatch')
const path = require('path')
const async = require('async')
const render = require('consolidate').handlebars.render //handlebars模板处理
/**
 * 
 * @param {*} name 
 * @param {*} src 
 * @param {*} dest 
 * @param {*} done 
 */
module.exports = function generate(name, src, dest, done){

    const metalsmith = Metalsmith(path.join(src, 'template'))//创建目录

 
    const data = Object.assign(metalsmith.metadata(), {
        destDirName: name,
        inPlace: dest === process.cwd(),
        noEscape: true
      })//处理全局数据

    //   renderTemplateFiles(opts.skipInterpolation)
    
      metalsmith.use(renderTemplateFiles())
      console.log('generate======into22222');
      metalsmith.clean(false)
      .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
      .destination(dest)
      .build((err, files) => {
          if(err){
              console.log('err',err);
            done(err)
          }else{
            console.log('files',files)
          }
       
      
      })

      return data

}

/**
 * 
 * @param {*} skipInterpolation 
 */
function renderTemplateFiles (skipInterpolation) {
    console.log('skipInterpolation', skipInterpolation);
    skipInterpolation = typeof skipInterpolation === 'string'
      ? [skipInterpolation]
      : skipInterpolation
    return (files, metalsmith, done) => {
        console.log('files::',files);
      const keys = Object.keys(files)
      const metalsmithMetadata = metalsmith.metadata()
      async.each(keys, (file, next) => {
        // skipping files with skipInterpolation option
        console.log('metalsmithMetadata',metalsmithMetadata);
        if (skipInterpolation && multimatch([file], skipInterpolation, { dot: true }).length) {
          return next()
        }
        console.log('22222');
        const str = files[file].contents.toString()
        // do not attempt to render files that do not have mustaches
        if (!/{{([^{}]+)}}/g.test(str)) {
          return next()
        }
        render(str, metalsmithMetadata, (err, res) => {
          if (err) {
            err.message = `[${file}] ${err.message}`
            return next(err)
          }
          files[file].contents = new Buffer(res)
          next()
        })
      }, done)
    }
  }