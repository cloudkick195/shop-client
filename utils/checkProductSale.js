const logger = require('./../utils/logger');

const {
    getSales } = require('./../repositories/sale.repo');

const { formatWithCommas } = require('./../helpers/currency.helper');
const { convertStringToArray } = require('./../helpers/function');
const { reqValidator } = require('./../utils/validators/request.validate');
const { QueryConstant } = require('./../constants/query.constant');

const checkProductSale = (product, sales) => {
    let prioritize;
    
    if(!sales || sales.length < 1) return;
    if(sales.all.active){
        
        prioritize = sales.all.prioritize;
        changeProductSale[sales.all.type](product, sales.all.value);
    }
     
    const saleProductId = sales.product[product.product_id];
    if(saleProductId){
        if(!prioritize || saleProductId.prioritize < prioritize){
            changeProductSale[saleProductId.type](product, saleProductId.value)
        }
    }
    
    const saleCategoryId = sales.category[product.category_id];
    if(saleCategoryId){
        if(!prioritize || saleCategoryId.prioritize < prioritize){
            changeProductSale[saleCategoryId.type](product, saleCategoryId.value)
        }
    }

}

const changeProductSale = {
    percen: (product, value) => {
        product.price_sale = product.price - product.price * (value/100);
    },
    minus_amount: (product, value) => {
        product.price_sale = product.price - value;
    },
    same_amount: (product, value) => {
        product.price_sale = value;
    }
}

const convertSales = (sales) => {
   
    const saleConvert = {
        all: {
            active: false
        },
        product: {

        },
        category: {

        }
    }
    sales.forEach(item => {
        
        convertTypeSelect[item.type_select](item, saleConvert);
    });
    
    return saleConvert;
}

const convertTypeSelect = {
    all: (item, saleConvert) => {
        if(!saleConvert.all.prioritize || saleConvert.all.prioritize > item.prioritize){
            saleConvert.all = {
                active: true,
                type: item.type,
                prioritize: item.prioritize,
                value: item.value
            }
        }
    },
    product: (item, saleConvert) => {
        const elements = convertStringToArray(item.product_select);
        if(!elements || !Array.isArray(elements)){
            return;
        }
      
        elements.forEach(element => {
            if(!saleConvert.product[element] || saleConvert.product[element].prioritize > item.prioritize){
                saleConvert.product[element] = {
                    type: item.type,
                    prioritize: item.prioritize,
                    value: item.value
                }
            }
        });
    },
    category: (item, saleConvert) => {
        const elements = convertStringToArray(item.category_select);
        if(!elements || !Array.isArray(elements)){
            return;
        }
      
        elements.forEach(element => {
            if(!saleConvert.category[element] || saleConvert.category[element].prioritize > item.prioritize){
                saleConvert.category[element] = {
                    type: item.type,
                    prioritize: item.prioritize,
                    value: item.value
                }
            }
        });
    }
}


module.exports = { checkProductSale, convertSales };