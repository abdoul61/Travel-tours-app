class APIFeatures {
  constructor(queryString, query) {
    this.queryString = queryString;
    this.query = query;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['limit', 'page', 'sort', 'fields'];
    excludeFields.forEach((element) => {
      delete queryObj[element];
    });
    //1b)here is advence filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    //{ difficulty: 'easy', duration: { gte: '5' } }
    //{difficulty:'easy',duration:{$gte:'5'}}
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitsFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
