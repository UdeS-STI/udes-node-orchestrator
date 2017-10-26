import Orchestrator from 'udes-node-orchestrator'
import config from './config'

const getPostInfo = async (responseHelper) => {
  const { post } = responseHelper.getQueryParameters()
  const options = {
    method: 'GET',
    url: `/posts/${post}`,
  }

  try {
    const data = await responseHelper.fetch(options)
    responseHelper.handleResponse({ data })
  } catch (err) {
    responseHelper.handleError(err)
  }
}

const routes = [
  { method: 'GET', url: '/post*', fn: getPostInfo },
]

const orchestrator = new Orchestrator(config)
orchestrator.setRoutes(routes)
