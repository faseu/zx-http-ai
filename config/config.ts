import { defineConfig } from '@umijs/max';
import routes from './routes';

export default defineConfig({
  // history: { type: 'hash' },
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {
    dataField: 'data',
  },
  proxy: {
    '/api': {
      // target: 'http://192.168.1.69:8092/',
      target: 'http://120.26.6.243:80/',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
  layout: {
    title: '即插智联',
  },
  routes,
  npmClient: 'yarn',
  // base: '/admin/',
  // publicPath: '/admin/',
});
