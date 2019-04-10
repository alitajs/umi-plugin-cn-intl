import { join } from 'path';

export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        locale: {
          enable: true, // default false
          default: 'zh-CN', // default zh-CN
          baseNavigator: true, // default true, when it is true, will use `navigator.language` overwrite default
        },
      },
    ],
    join(__dirname, '..', require('../package').main || 'index.js'),
  ],
}
