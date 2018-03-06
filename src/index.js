import './jsDocs'; // Import type definitions for jsDoc.
import AuthHandler from './lib/AuthHandler';
import { getAttributes, getUser } from './lib/auth';
import Orchestrator from './server/Orchestrator';
import ResponseFormatter from './lib/ResponseFormatter';
import { ResponseHelper } from './lib/ResponseHelper';
import Utils from './lib/Utils';

const AuthUtils = {
  getAttributes,
  getUser,
};

export default Orchestrator;
export {
  AuthHandler,
  AuthUtils,
  Orchestrator,
  ResponseHelper,
  ResponseFormatter,
  Utils,
};
