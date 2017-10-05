import config from './config';
import { ResponseHelper } from '../../distribution/index';

export const getPostInfo = async (req, res) => {
  console.log('USER_AGENT', req.headers['user-agent']);
  const responseHelper = new ResponseHelper(req, res, config);
  const { post } = responseHelper.getQueryParameters();
  const options = {
    method: 'GET',
    url: `${config.apiUrl}/posts/${post}`,
  };

  try {
    const data = await responseHelper.fetch(options);
    responseHelper.handleResponse({ data });
  } catch (err) {
    responseHelper.handleError(err);
  }
};
