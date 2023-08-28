class Features {
  constructor( query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }


  search() {
    const search = this.queryString.search;
    if(keyword){
      this.query = this.query.find({name : search});
    }
    return this.query;
  }

  sort() {
    const sort =this.queryString.sort;
    if(sort=='true'){
      this.query.sort('price');
    }
    return this.query;
  }
}

module.exports = Features;
