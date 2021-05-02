require('dotenv').config();
const axios = require('axios');
var qs = require('qs');

exports.createApiKiotviet = async function (url, data){
  try {
    const res = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${process.env.KIOTVIET_ACCESS_TOKEN}`,
        'Retailer': process.env.RETAIL_ID,
        'Content-Type': 'application/json'
      }
    })
    return res.data.data;
  } catch (error) {
    return error
  }
}
exports.createOrderApiKiotviet = async function (url, data){
  try {
    const res = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${process.env.KIOTVIET_ACCESS_TOKEN}`,
        'Retailer': process.env.RETAIL_ID,
        'Content-Type': 'application/json'
      }
    })
    console.log(345, res);
    return res.data;
  } catch (error) {
    console.log(3456, error);
    return error
  }
}

exports.getApiKiotviet = async function (url){
  try {
    const res = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${process.env.KIOTVIET_ACCESS_TOKEN}`,
        'Retailer': process.env.RETAIL_ID
      }
    })
    return res.data.data;
  } catch (error) {
    return error
  }
}