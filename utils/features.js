class Features {
  constructor(products, queryString) {
    this.products = products;
    this.queryString = queryString;
  }

  sort() {
    const sort = this.queryString.sort;

    if (sort == "true") {
      this.products.sort((a, b) => {
        return a.price - b.price;
      });
    }
    return this.products;
  }
}

module.exports = Features;
