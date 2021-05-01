require('dotenv').config();
const axios = require('axios');
var qs = require('qs');

const getAccessTokenKiotviet = async () => {
  try {
      const data = {
          "client_id": process.env.CLIENT_ID,
          "client_secret": process.env.CLIENT_SECRET,
          "grant_type": process.env.GRANT_TYPE,
          "scopes": process.env.SCOPES,
      }
  
      const res = await axios.post(process.env.KIOTVIET_URL_TOKEN, qs.stringify(data), {
          headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          }
      })

      return res.data.access_token
  } catch (error) {
      return error
  }
}

exports.createApiKiotviet = async function (url, data){
  try {
    console.log(2, url, data);
    const accessTokenKiotviet = await getAccessTokenKiotviet();
    const res = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${accessTokenKiotviet}`,
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
    console.log(39999);
    const accessTokenKiotviet = await getAccessTokenKiotviet();
    const res = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${accessTokenKiotviet}`,
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
    const accessTokenKiotviet = await getAccessTokenKiotviet();
    const res = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessTokenKiotviet}`,
        'Retailer': process.env.RETAIL_ID
      }
    })
    return res.data.data;
  } catch (error) {
    return error
  }
}