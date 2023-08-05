import {useState,useEffect,useRef} from 'react'

function Metric({metric,title,type,precision,format=1}) {

    var time_now = new Date();
    const [countervalue,setCountervalue] = useState(0);
    const init_component = useRef(0);
    const countervalue_old = useRef(0);
    const counterdate = useRef(0);
    
    
    function updateMetrics(){
      var value=0;
      try {
      
          if(Object.hasOwn(metric, 'Value')) {
            
           
             if (init_component.current === 0) {
                var time_first = new Date();
                init_component.current=1
                countervalue_old.current=metric['Value']
                counterdate.current=time_first.getTime();
             }

            switch (type) {
              case 1:
                value = ( (metric['Value'] - countervalue_old.current) / (Math.abs( time_now.getTime() - counterdate.current) / 1000) );
                break;
              case 2:
                value = (metric['Value']);
                break;
              
            }

            switch (format) {
              case 1:
                setCountervalue(CustomFormatNumberRaw(value,precision));
                break;
                
              case 2:
                setCountervalue(CustomFormatNumberData(value,precision));
                break;
              
              case 3:
                setCountervalue(CustomFormatNumberRawInteger(value,0));
                break;
              
            }
            
             countervalue_old.current = metric['Value'];
             counterdate.current=time_now.getTime();
             
             
            
          }
      }
      catch{
        
        console.log('error');
      }
        
       
    }
    
    // eslint-disable-next-line
    useEffect(() => {
      updateMetrics();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metric]);
    
    
    
    function CustomFormatNumberData(value,decimalLength) {
        if(value == 0) return '0';
        if(value < 1024) return parseFloat(value).toFixed(decimalLength);
        
        var k = 1024,
        sizes = ['', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZT', 'YB'],
        i = Math.floor(Math.log(value) / Math.log(k));
        return parseFloat((value / Math.pow(k, i)).toFixed(decimalLength)) + ' ' + sizes[i];
    }
    
    
    function CustomFormatNumberRaw(value,decimalLength) {
        if (value < 100 && decimalLength == 0 )
          decimalLength=2;
       
        if (value==0)
          decimalLength=0;

        return value.toLocaleString('en-US', {minimumFractionDigits:decimalLength, maximumFractionDigits:decimalLength}); 

    }
    
    function CustomFormatNumberRawInteger(value,decimalLength) {
        return value.toLocaleString('en-US', {minimumFractionDigits:decimalLength, maximumFractionDigits:decimalLength}); 
    }
    
    return (
            <div>
                <div style={{"font-size": "22px", "font-weight": "500","font-family": "Orbitron", "color": "orange"}}>
                    {countervalue}
                </div>
                <div style={{"font-size": "11px", "color": "#C6C2C1", "font-weight": "450" }}>
                    {title}
                </div>
          
            </div>
           )
}

export default Metric
