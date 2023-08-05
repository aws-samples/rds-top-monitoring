import {useState,useEffect,useRef} from 'react';
import Chart from 'react-apexcharts';

function ChartLine({series,history, height, width="100%", title, colors=[], border=2, timestamp}) {

    var options = {
              chart: {
                height: height,
                type: 'line',
                foreColor: '#C6C2C1',
                zoom: {
                  enabled: false
                },
                animations: {
                    enabled: false,
                },
                dynamicAnimation :
                {
                    enabled: true,
                },
                 toolbar: {
                    show: false,
                 }

              },
              markers: {
                  size: 4,
                  strokeColors: '#29313e',
              },
              dataLabels: {
                enabled: false
              },
              colors: colors,
              stroke: {
                curve: 'straight',
                 width: border
              },
              title: {
                text : title,
                align: "center",
                show: false,
                style: {
                  fontSize:  '13px',
                  fontWeight:  'bold',
                  fontFamily:  undefined,
                  color : "#C6C2C1"
                }
                
              },
              grid: {
                show: false,
                yaxis: {
                    lines: {
                        show: false
                    }
                },   
              },
              tooltip: {
                    theme: "dark",
              },
              xaxis: {
                labels: {
                          show: false,
                 },
                 
              },
              yaxis: {
                 tickAmount: 5,
                 axisTicks: {
                      show: true,
                 },
                 axisBorder: {
                      show: true,
                      color: '#78909C',
                      offsetX: 0,
                      offsetY: 0
                 },
                 min : 0,
                 labels : {
                            formatter: function(val, index) {
                                        
                                        if(val === 0) return '0';
                                        if(val < 1000) return parseFloat(val).toFixed(1);
                                        
                                        var k = 1000,
                                        sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
                                        i = Math.floor(Math.log(val) / Math.log(k));
                                        return parseFloat((val / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        
                                        },    
                            style: {
                                  colors: ['#C6C2C1'],
                                  fontSize: '12px',
                                  fontFamily: 'Helvetica, Arial, sans-serif',
                             },
                 },
                 
              }
    };
    
    
    return (
            <div>
                <Chart options={options} series={series} type="line" width={width} height={height} />
            </div>
           );
}

export default ChartLine;
