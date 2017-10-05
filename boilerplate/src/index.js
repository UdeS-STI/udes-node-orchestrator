import config from './config';
import { getPostInfo } from './auth';
import { Orchestrator } from '../../distribution/index';

const routes = [
  { method: 'GET', url: '/post*', fn: getPostInfo },
];

const orchestrator = new Orchestrator(config);
orchestrator.setRoutes(routes);
