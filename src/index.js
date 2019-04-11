// ref:
// - https://umijs.org/plugin/develop.html
import fs from 'fs';
import path from 'path';
import randomstring from 'randomstring'
import { findJS } from 'umi-utils';

export default function (api, options) {
  const { paths } = api;
  api.registerCommand(
    'cnintl',
    {
      hide: true,
    },
    args => {
      let file = args._[0];
      const wordArr = [];
      if (!file) {
        console.error('⚠️ ⚠️ ⚠️ the file path must be required');
        process.exit();
      }

      const pathArr = []
      const readDir = (path) => {
        const exists = fs.existsSync(path);
        const stat = fs.statSync(path);
        if (exists && stat) {
          if (stat.isFile()) {
            pathArr.push(path)
            return;
          }

          const handleFile = fs.readdirSync(path);
          if (handleFile && handleFile.length) {
            handleFile.forEach(item => {
              readDir(`${path}/${item}`)
            })
          }
        }
      }

      readDir(`${process.cwd()}/${file}`)

      const write = [];
      pathArr.forEach((item, i) => {
        if (!(['.js', '.jsx'].indexOf(path.extname(item)) > -1)) return;
        let pathStr;
        let ext = ['.js', '.jsx'][['.js', '.jsx'].indexOf(path.extname(item))];
        pathStr = path.basename(item, ext)
        if (pathStr === 'index') {
          pathStr = (((path.parse(item)).dir).split(path.sep)).pop();
        }

        const data = fs.readFileSync(item, "utf8");
        if (!/umi-plugin-react\/locale/.test(data)) {
          let gData = filterText(data, pathStr);
          gData = "import { formatMessage } from 'umi-plugin-react/locale';\n" + gData;
          fs.writeFileSync(item, gData, 'utf8');
        }
      })


      if (pathArr.length) {
        console.log();
        console.log(' ✅ 国际化文件替换成功');
        wordArr.forEach((o) => {
          const value = `'${o.key}': '${o.value}',`
          write.push(value)
        });
        const zhCN = findJS(paths.absSrcPath, 'locales/zh-CN');
        if (zhCN) {
          let data = fs.readFileSync(zhCN, "utf8");
          const keyValue = write.join("\n");
          data = `${data.substring(0, data.lastIndexOf('}'))}\n${keyValue}\n};`
          fs.writeFileSync(zhCN, data, 'utf8');
        } else {
          const str = `export default {\n ${write.join("\n")} };`
          fs.writeFileSync('src/locales/zh-CN.js', str, 'utf8');
        }

        console.log();
        console.log(' ✅ 国际化词条整理成功');
      }

      function filterText(text, objName) {
        let pattern = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)|((=)?(\s+)?(|`|"|')?(\s+)?([\u4e00-\u9faf]|\uFF1F|\u3002|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u300A|\u300B|\u3008|\u3009)+('|"|`)?)/g

        return text.replace(pattern, (word) => {
          if (!(/^\/{2,}/.test(word) || /^\/\*/.test(word)) && /([\u4e00-\u9faf]|\uFF1F|\u3002|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u300A|\u300B|\u3008|\u3009)+/g.test(word)) {
            let uuid = randomstring.generate(4);
            let currentObj = []
            let str;
            const wordText = (word.match(/([\u4e00-\u9faf]|\uFF1F|\u3002|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u300A|\u300B|\u3008|\u3009)+/g))[0];
            currentObj = wordArr.filter(item => item.value === wordText)

            if (currentObj.length) {
              str = `formatMessage({id:'${currentObj[0].key}'})`;
            } else {
              const value = wordText;
              const key = value.length > 6 ? `${value.substring(0, 5)}_${uuid}` : value;
              str = `formatMessage({id:'${key}'})`;

              wordArr.push({
                key: key,
                value: value,
              })
            }

            if (/=/.test(word)) return word.replace(/(`|"|')?(\s+)?([\u4e00-\u9faf]|\uFF1F|\u3002|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u300A|\u300B|\u3008|\u3009)+(\s+)?('|"|`)?/, `\{${str}\}`);
            if (/(`|"|')(\s+)?([\u4e00-\u9faf]|\uFF1F|\u3002|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u300A|\u300B|\u3008|\u3009)+(\s+)?('|"|`)/.test(word)) return word.replace(/(`|"|')?(\s+)?([\u4e00-\u9faf]|\uFF1F|\u3002|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u300A|\u300B|\u3008|\u3009)+(\s+)?('|"|`)?/, `${str}`);
            return word.replace(/([\u4e00-\u9faf]|\uFF1F|\u3002|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u300A|\u300B|\u3008|\u3009)+/, `\{${str}\}`);
          }

          return word
        })
      }
    },
  );
}
