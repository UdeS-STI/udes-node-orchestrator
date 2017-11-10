import { ResponseFormatter } from 'udes-node-orchestrator'

/**
 * Handles response data formatting.
 */
export default class DataFormatter extends ResponseFormatter {
  /**
   * Format response data based on a set of rules.
   * @param {Object} data - Response data.
   * @returns {Object} Formatted data.
   */
  format = (data) => {
    if (!Object.keys(data).length) {
      return {}
    }

    return Object.keys(data).reduce((acc, cur) => {
      const currentData = data[cur]
      const { meta } = currentData
      delete currentData.meta

      return {
        ...acc,
        [cur]: {
          ...meta,
          data: currentData.data || currentData,
        },
      }
    }, {})
  }
}
