function getFormattedDate(todayTime) {

    if(!todayTime) return null;
    let dd = todayTime.getDate();

    let mm = todayTime.getMonth()+1; 
    let yyyy = todayTime.getFullYear();
    if(dd<10) 
    {
        dd='0'+dd;
    } 

    if(mm<10) 
    {
        mm='0'+mm;
    } 
    
  
    return dd+'/'+mm+'/'+yyyy;

}
module.exports = { getFormattedDate };