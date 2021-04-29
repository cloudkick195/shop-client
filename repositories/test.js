require('dotenv').config();
const axios = require('axios');
const cron = require('node-cron');

(async function (){
  // axios.get(`${process.env.KIOTVIET_PUBLIC_API}/Products`, {
  //   headers: {
  //       'Authorization': `Bearer ${process.env.KIOTVIET_ACCESS_TOKEN}`,
  //       'Retailer': process.env.RETAIL_ID
  //   }
  // })
  // .then((res) => {
  //   console.log('****** data: ', res.data)
  // })
  // .catch((error) => {
  //   console.error(error)
  // })
  try {
    const dataCustomer = {
      branchId: process.env.BRANCH_ID,
      name: 'test 3',
      contactNumber: '09998886465',
      address: 'test 2',
      code: `KH000324324254534`,
    }
    const url = `${process.env.KIOTVIET_PUBLIC_API}/customers`
    const dataCustomerSend = JSON.stringify(dataCustomer)
    const res = await axios.post(url, dataCustomerSend, {
      headers: {
        'Authorization': `Bearer ${process.env.KIOTVIET_ACCESS_TOKEN}`,
        'Retailer': process.env.RETAIL_ID,
        'Content-Type': 'application/json'
      }
    })
  
    console.log(res.data);
  } catch (error) {
    console.log(error);
  }

  
})()




