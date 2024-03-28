// pass the factor to function
// spit the formatted date



const getForexFactoryFormattedDate = (weekFactor) => {
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec"
    ];

    var curr = new Date; // Thu Mar 18 2024 11:44:44 GMT-0500 (Eastern Standard Time)
    curr.getDate() // 18
    curr.getDay() // 4

    var first = curr.getDate() - curr.getDay(); 
   
    var firstday = new Date(curr.setDate(first-(weekFactor*7)));
    
    var month = monthNames[firstday.getMonth()]
    var day = firstday.getDate()
    var year = firstday.getFullYear()

    var formattedDate = `${month}${day}.${year}`
    
    
    
    console.log(new Date(curr.setDate(first)))
    console.log(monthNames[month]);
    console.log(day);
    console.log(year);
    console.log(formattedDate)

    return formattedDate
}


