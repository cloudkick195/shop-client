const pageConfig = require('../configs/page.config'); 
const linkIdList = (slug, params = {}, newParams = {}) => {
    return revertSlugToUrl(`/san-pham/${ slug }`, {...params, ...newParams });
}
const linkId = (slug, params = {}) => {
    return revertSlugToUrl(`/san-pham/${ slug }`, params);
}
const linkCategoryIdList = (slug, params = {}, newParams = {}) => {
    return revertSlugToUrl(`/danh-muc/${ slug }`, {...params, ...newParams });
}
const linkCategoryId = (slug, params = {}) => {
    return revertSlugToUrl(`/danh-muc/${ slug }`, params);
}

const linkSearchList= (slug, params = {}, newParams = {}) => {
    return revertSlugToUrl(`${ slug }`, {...params, ...newParams });
}

const linkIdFull = (slug, params = {}) => {
    return revertSlugToUrl(pageConfig().baseUrl + `/san-pham/${ slug }`, params);
}

const linkProduct = () => {
    return `/san-pham`;
}

const linkSearch = () => {
    return `/san-pham`;
}

const linkCategory = () => {
    return `/danh-muc`;
}

const linkSaleProduct = () => {
    return `/giam-gia`;
}

const linkPolicyAndReturn = () => {
    return `chinh-sach-huong-dan`;
};

const linkIdPolicyAndReturn = (slug) => {
    return `/page/${ slug }`;
};

const encodeData = (data) => {
    return Object.keys(data).map(function(key) {
        return [key, data[key]].map(encodeURIComponent).join("=");
    }).join("&");
}

const checkEmptyObject = (object) => {
    return Object.keys(object).length === 0 && object.constructor === Object;
}


const revertSlugToUrl = (endPointUrl, slugParamsObject = {}) => {
    return `${ !checkEmptyObject(slugParamsObject) ? endPointUrl + '?' + encodeData(slugParamsObject) : endPointUrl }`
}

const convertStringToArray = (str) => {
    if(str && JSON.parse(str)){
        return JSON.parse(str);
    }
    return;
}

module.exports = { linkIdList, linkId, linkProduct, linkSaleProduct, linkPolicyAndReturn, linkIdPolicyAndReturn,
    linkIdFull, linkCategoryIdList, linkCategoryId, linkCategory, linkSearch, linkSearchList, convertStringToArray };
