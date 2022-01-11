const filterQuery = (model, populate) => async (req, res, next) => {
  const reqQuery = { ...req.query };
  let query;

  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach((param) => {
    delete reqQuery[param];
  });
  let queryString = JSON.stringify(reqQuery);
  query = model.find(JSON.parse(queryString));
  // Select fields
  if (req.query.select) {
    // query select takes the values with space
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }
  // Sort query by date
  if (req.query.sort) {
    const sortBy = req.query.select.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  // Add pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const _index = (page - 1) * limit;
  const _endIndex = page * limit;
  const collectionAll = await model.countDocuments();
  const pages = Math.ceil(collectionAll / limit);
  query = query.skip(_index).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  /**              Execute Query              */
  const queryResult = await query;
  // Pagination result
  const pagination = {};
  if (_endIndex < collectionAll) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  console.log(_index);

  if (_index > 0 && _index < collectionAll) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  res.filterQuery = {
    success: true,
    total: collectionAll,
    pages,
    pagination,
    data: queryResult,
  };
  next();
};

module.exports = filterQuery;
