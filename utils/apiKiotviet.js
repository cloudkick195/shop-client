require('dotenv').config();
const axios = require('axios');
var qs = require('qs');
let token;
const cron = require('node-cron');

(async () => {
  console.log('alo')
  cron.schedule("0 0 */12 * * *", async function() {
    try {
      const data = {
        "client_id": process.env.CLIENT_ID,
        "client_secret": process.env.CLIENT_SECRET,
        "grant_type": process.env.GRANT_TYPE,
        "scopes": process.env.SCOPES,
      }
    
      const newToken = await axios.post(process.env.KIOTVIET_URL_TOKEN, qs.stringify(data), {
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      token = res.data.access_token
    } catch (error) {
      console.log(error)
    }
  });
})()


// (async () => {
//   try {
//       const data = {
//           "client_id": process.env.CLIENT_ID,
//           "client_secret": process.env.CLIENT_SECRET,
//           "grant_type": process.env.GRANT_TYPE,
//           "scopes": process.env.SCOPES,
//       }
  
//       const res = await axios.post(process.env.KIOTVIET_URL_TOKEN, qs.stringify(data), {
//           headers: {
//           'Content-Type': 'application/x-www-form-urlencoded'
//           }
//       })

//       token = res.data.access_token
//   } catch (error) {
//     console.log(error);
//     return error
//   }
// })()

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