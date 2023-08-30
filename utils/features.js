class Features {
  constructor( products, queryString) {
    this.products = products;
    this.queryString = queryString;
  }


  search() {
    const keyword = this.queryString.keyword;
   
    if(keyword){
      const filter = this.products.filter( (prod)=>{
         return prod.name==keyword;
      }) 
      this.products=filter;
    }
    return this.products
  }

  sort() {
    const sort =this.queryString.sort;
    
    if(sort=='true'){
     
       this.products.sort((a,b)=>{
         return a.price-b.price;
      })
     
    }
    return this.products;
  }
}

module.exports = Features;
