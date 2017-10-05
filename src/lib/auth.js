/**
 * Get current user information from CAS.
 * @private
 * @param {Object} [req] - HTTP request.
 * @returns {Object} User.
 */
export const getUser = (req) => {
  if (req && req.session && req.session.cas && req.session.cas.user) {
    return req.session.cas.user;
  }

  return {};
};

/**
 * Get CAS attributes.
 * @private
 * @param {Object} req - HTTP request.
 * @returns {Object} Attributes.
 */
export const getAttributes = (req) => {
  if (req && req.session && req.session.cas && req.session.cas.attributes) {
    const { attributes } = req.session.cas;
    return Object.keys(attributes).reduce((acc, key) => {
      const accumulation = acc;
      const attribute = attributes[key];
      const getValue = Array.isArray(attribute) && attribute.length === 1;

      accumulation[key] = getValue ? attribute[0] : attribute;

      return accumulation;
    }, {});
  }

  return {};
};
