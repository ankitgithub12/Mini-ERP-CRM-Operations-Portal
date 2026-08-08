const success = (res, message, data = null, statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) {
    if (data.pagination) {
      response.data = data.data;
      response.pagination = data.pagination;
    } else {
      response.data = data;
    }
  }
  return res.status(statusCode).json(response);
};

const created = (res, message, data = null) => {
  return success(res, message, data, 201);
};

const error = (res, message, statusCode = 500, errors = []) => {
  const response = { success: false, message };
  if (errors.length > 0) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

module.exports = { success, created, error };
