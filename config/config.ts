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
    '/admin': {
      // target: 'http://192.168.1.69:8092/',
      target: 'http://121.40.161.20/',
      changeOrigin: true,
      pathRewrite: { '^/admin': '/admin' },
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
