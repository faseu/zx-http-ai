import { defineConfig } from '@umijs/max';
import routes from './routes';

export default defineConfig({
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
      target: 'http://1.14.59.102:8000/',
      changeOrigin: true,
      pathRewrite: { '^/api': '/api' },
    },
  },
  layout: {
    title: '即插智联',
  },
  routes,
  npmClient: 'yarn',
});
