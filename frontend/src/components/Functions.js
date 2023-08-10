export function customFormatNumber(value,decimalLength) {
        if(value == 0) return '0';
        if(value < 1024) return parseFloat(value).toFixed(decimalLength);
        
        var k = 1024,
        sizes = ['', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(value) / Math.log(k));
        return parseFloat((value / Math.pow(k, i)).toFixed(decimalLength)) + ' ' + sizes[i];
}




export class classMetric {

          
          constructor(arrayMetrics) { 
                    
                    this.dataHistory = {};
                    
                    arrayMetrics.forEach(metric => {
                    
                        this.dataHistory =  {...this.dataHistory, [metric.name]: { name : metric.name, history : metric.history, data : Array(50).fill(null) } }
                        
                    });
                    
                    
          }
          
          init(currentObject,currentTime,oldObject,oldTime) {
                    this.currentObject = currentObject;
                    this.currentTime = currentTime;
                    this.oldObject = oldObject;
                    this.oldTime = oldTime;
          }
          
          newSnapshot(currentObject,currentTime) {
                    
                    this.oldObject = this.currentObject;
                    this.oldTime = this.currentTime;
                    
                    this.currentObject = currentObject;
                    this.currentTime = currentTime;
                    
          }

         
          getDelta(propertyName) { 
              try
              {
                    return ( 
                                    (
                                            (this.currentObject[propertyName]['Value'] - this.oldObject[propertyName]['Value']) / 
                                            (Math.abs(this.currentTime - this.oldTime) / 1000)
                                    ) || 0
                    ) ;
              } 
              catch(e) {
                        return 0;       
            }
          }
          
          getDeltaByValue(propertyName,propertyValue) { 
              try
              {
                    return ( 
                                    (
                                            (this.currentObject[propertyName][propertyValue] - this.oldObject[propertyName][propertyValue]) / 
                                            (Math.abs(this.currentTime - this.oldTime) / 1000)
                                    ) || 0
                    ) ;
              } 
              catch(e) {
                        return 0;       
            }
          }
          
          getDeltaByIndex(propertyName) { 
              try
              {
                    return ( 
                                    (
                                            (this.currentObject[propertyName] - this.oldObject[propertyName]) / 
                                            (Math.abs(this.currentTime - this.oldTime) / 1000)
                                    ) || 0
                    ) ;
              } 
              catch(e) {
                        return 0;       
            }
          }
          
          getValue(propertyName) { 
          try
              {
                    return (this.currentObject[propertyName]['Value']) ;
              } 
              catch(e) {
                        return 0;       
            }
          }
          
          getValueByValue(propertyName,propertyValue) { 
          try
              {
                    return (this.currentObject[propertyName][propertyValue]) ;
              } 
              catch(e) {
                        return 0;       
            }
          }
          
          getValueByIndex(propertyName) { 
          try
              {
                    return (this.currentObject[propertyName]) ;
              } 
              catch(e) {
                        return 0;       
            }
          }
          
          addProperty(propertyName)
          {
                  this.dataHistory =  {...this.dataHistory, [propertyName]: Array(50).fill(null) }
          }
          
          getPropertyValues (propertyName){
                  return this.dataHistory[propertyName];
          }
          
          
          addPropertyValue (propertyName,propertyValue){
                  this.dataHistory[propertyName].data.push(propertyValue);
                  this.dataHistory[propertyName].data = this.dataHistory[propertyName].data.slice(this.dataHistory[propertyName].data.length-this.dataHistory[propertyName].history);
                  
          }

}
