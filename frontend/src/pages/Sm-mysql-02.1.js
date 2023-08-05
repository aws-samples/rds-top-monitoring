import { useState,useEffect,useRef } from 'react';
import Axios from 'axios'
import { useSearchParams } from 'react-router-dom';

import CustomHeader from "../components/Header";
import CustomLayout from "../components/Layout";
import { configuration } from './Configs';
import {customFormatNumber} from '../components/Functions';

import Container from "@cloudscape-design/components/container";
import Tabs from "@cloudscape-design/components/tabs";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Textarea from "@cloudscape-design/components/textarea";
import Badge from "@cloudscape-design/components/badge";
import ProgressBar from "@cloudscape-design/components/progress-bar";

import ChartLine  from '../components/ChartLine01';
import CLWChart  from '../components/ChartCLW01';
import CompMetric  from '../components/Metric01';

import Table from "@cloudscape-design/components/table";
import Header from "@cloudscape-design/components/header";
import Button from "@cloudscape-design/components/button";

import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Toggle from "@cloudscape-design/components/toggle";
import { SplitPanel } from '@cloudscape-design/components';

import { applyMode,  Mode } from '@cloudscape-design/global-styles';

export const splitPanelI18nStrings: SplitPanelProps.I18nStrings = {
  preferencesTitle: 'Split panel preferences',
  preferencesPositionLabel: 'Split panel position',
  preferencesPositionDescription: 'Choose the default split panel position for the service.',
  preferencesPositionSide: 'Side',
  preferencesPositionBottom: 'Bottom',
  preferencesConfirm: 'Confirm',
  preferencesCancel: 'Cancel',
  closeButtonAriaLabel: 'Close panel',
  openButtonAriaLabel: 'Open panel',
  resizeHandleAriaLabel: 'Resize split panel',
};


var CryptoJS = require("crypto-js");

export default function App() {
  

    //--######## Global Settings
  
    //-- Apply Theme
    applyMode(Mode.Dark);
    
    //-- Variable for Active Tabs
    const [activeTabId, setActiveTabId] = useState("tab01");
    const currentTabId = useRef("tab01");
    
    
    //-- Gather Parameters
    const [params]=useSearchParams();
    
    const parameter_code_id=params.get("code_id");  
    const parameter_id=params.get("session_id");  
    var parameter_object_bytes = CryptoJS.AES.decrypt(parameter_id, parameter_code_id);
    var parameter_object_values = JSON.parse(parameter_object_bytes.toString(CryptoJS.enc.Utf8));
    
    
    //-- Configuration variables
    const cnf_connection_id=parameter_object_values["session_id"];  
    const cnf_rds_id=parameter_object_values["rds_id"];  
    const cnf_rds_host=parameter_object_values["rds_host"];  
    const cnf_rds_engine=parameter_object_values["rds_engine"];
    const cnf_rds_resource_id=parameter_object_values["rds_resource_id"];
    
    
    //-- Add token header
    Axios.defaults.headers.common['x-token'] = sessionStorage.getItem(cnf_connection_id);
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    
    //-- Set Page Title
    document.title = configuration["apps-settings"]["application_title"] + ' - ' + cnf_rds_host;
   
   
    
    //--######## RealTime Metric Features
    
    //-- Variable for Split Panels
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [selectedItems,setSelectedItems] = useState([{ identifier: "" }]);
    
    
    //-- Variable for Pause Collection
    const pauseCollection = useRef(true);
    const [collectionState, setcollectionState] = useState(true);
    
    //-- Performance Counters
    const datacounters_old = useRef({});
    const init_process = useRef(0);
    const counterdate = useRef(0);
    
    
    //-- Chart init variables
    
    const [dataMetricRealTime,setDataMetricRealTime] = useState({
                                                                  Queries : [null],
                                                                  Operations : [null,null,null,null],
                                                                  dataSessions: [],
                                                                  dataCounters: [],
                                                                  timestamp : 0
                                                                });
    
    const [dataMetricRealTimeSession,setDataMetricRealTimeSession] = useState({
                                                                  SessionsTotal : [null],
                                                                  Sessions : [],
                                                                  timestamp : 0
                                                                });
    
    const [confMetricRealTime,setConfMetricRealTime] = useState({ 
                                                                  Queries: [{name: "Queries",data: Array(50).fill(null)}],
                                                                  Operations: [{name: "Com_select",data: Array(50).fill(null)},{name: "Com_insert",data: Array(50).fill(null)},{name: "Com_update",data: Array(50).fill(null)},{name: "Com_delete",data: Array(50).fill(null)}],
                                                                  Sessions: [{name: "Sessions",data: Array(50).fill(null)}]
                                                                });
    
    
    
    const dataSessionQuery = "SELECT ID as 'ThreadID',USER as 'Username',HOST as 'Host',DB as 'Database',COMMAND as 'Command',SEC_TO_TIME(TIME) as 'Time',STATE as 'State',INFO as 'SQLText' FROM INFORMATION_SCHEMA.PROCESSLIST WHERE COMMAND <> 'Sleep' AND CONNECTION_ID()<> ID ORDER BY TIME DESC";
    const dataSessionColumns=[
                    { id: "ThreadID",header: "ThreadID",cell: item => item['ThreadID'] || "-",sortingField: "ThreadID",isRowHeader: true },
                    { id: "Username",header: "Username",cell: item => item['Username'] || "-",sortingField: "Username",isRowHeader: true },
                    { id: "Host",header: "Host",cell: item => item['Host'] || "-",sortingField: "Host",isRowHeader: true },
                    { id: "Database",header: "Database",cell: item => item['Database'] || "-",sortingField: "Database",isRowHeader: true },
                    { id: "Command",header: "Command",cell: item => item['Command'] || "-",sortingField: "Command",isRowHeader: true },
                    { id: "ElapsedTime",header: "ElapsedTime",cell: item => item['Time'] || "-",sortingField: "Time",isRowHeader: true },
                    { id: "State",header: "State",cell: item => item['State'] || "-",sortingField: "State",isRowHeader: true },
                    { id: "SQLText",header: "SQLText",cell: item => item['SQLText'] || "-",sortingField: "SQLText",isRowHeader: true } 
                    ];
    
    
    //--######## Enhanced Monitoring Feature
    const dataColsProcessList=[
                    { id: "id",header: "PID",cell: item => item['id'] || "-",sortingField: "id",isRowHeader: true },
                    { id: "parentID",header: "ParentPID",cell: item => item['parentID'] || "-",sortingField: "parentID",isRowHeader: true },
                    { id: "name",header: "Name",cell: item => item['name'] || "-",sortingField: "name",isRowHeader: true },
                    { id: "cpuUsedPc",header: "CPU",cell: item => item['cpuUsedPc'] || "-",sortingField: "cpuUsedPc",isRowHeader: true },
                    { id: "memoryUsedPc",header: "Memory",cell: item => item['memoryUsedPc'] || "-",sortingField: "memoryUsedPc",isRowHeader: true },
                    { id: "rss",header: "RSS",cell: item => item['rss'] || "-",sortingField: "rss",isRowHeader: true },
                    { id: "vmlimit",header: "VMLimit",cell: item => item['vmlimit'] || "-",sortingField: "vmlimit",isRowHeader: true },
                    { id: "vss",header: "VSS",cell: item => item['vss'] || "-",sortingField: "vss",isRowHeader: true },
                    { id: "tgid",header: "TGID",cell: item => item['tgid'] || "-",sortingField: "tgid",isRowHeader: true }
                    ];
    
    
    const [confEnhancedMonitorChart,setConfEnhancedMonitorChart] = useState({ 
                                                                  cpu: [
                                                                        {name: "total",data: Array(50).fill(null)},
                                                                        {name: "user",data: Array(50).fill(null)},
                                                                        {name: "system",data: Array(50).fill(null)},
                                                                        {name: "wait",data: Array(50).fill(null)},
                                                                        {name: "irq",data: Array(50).fill(null)},
                                                                        {name: "guest",data: Array(50).fill(null)},
                                                                        {name: "steal",data: Array(50).fill(null)},
                                                                        {name: "nice",data: Array(50).fill(null)}
                                                                        ],
                                                                    memory : [
                                                                        {name: "total",data: Array(50).fill(null)},
                                                                        {name: "active",data: Array(50).fill(null)},
                                                                        {name: "inactive",data: Array(50).fill(null)},
                                                                        {name: "free",data: Array(50).fill(null)},
                                                                        ],
                                                                    reads : [
                                                                        {name: "rsdev",data: Array(50).fill(null)},
                                                                        {name: "filesystem",data: Array(50).fill(null)}
                                                                        ],
                                                                    writes : [
                                                                        {name: "rsdev",data: Array(50).fill(null)},
                                                                        {name: "filesystem",data: Array(50).fill(null)}
                                                                        ],
                                                                    network_tx : [
                                                                        {name: "network_tx",data: Array(50).fill(null)}
                                                                        ],
                                                                    network_rx : [
                                                                        {name: "network_rx",data: Array(50).fill(null)}
                                                                        ]
                                                                });
                                                    
    const [dataEnhancedMonitor,setdataEnhancedMonitor] = useState({
                                            counters : { 
                                                        cpu: [{name:'pct_usage',value:0},{name:'total_vcpu', value: 0}],
                                                        cpu_detail : [
                                                              {name:'user', value: 0},
                                                              {name:'system', value: 0},
                                                              {name:'wait', value: 0},
                                                              {name:'irq', value: 0},
                                                              {name:'guest', value: 0},
                                                              {name:'steal', value: 0},
                                                              {name:'nice', value: 0}
                                                          ],
                                                        memory : [{name:'pct_usage',value:0}, {name:'total',value:0}, {name:'free',value:0}, {name:'active',value:0}], 
                                                        memory_detail : [
                                                              {name:'total', value: 0},
                                                              {name:'active', value: 0},
                                                              {name:'inactive', value: 0},
                                                              {name:'free', value: 0}
                                                          ],
                                                        io_reads: [{name:'rdsdev',value:0}, {name:'filesystem',value:0}],
                                                        io_writes: [{name:'rdsdev',value:0}, {name:'filesystem',value:0}], 
                                                        tps: [{name:'total_tps',value:0}], 
                                                        io_queue: [{name:'avg_queue',value:0}], 
                                                        network: [{name:'tx',value:0}, {name:'rx',value:0}],
                                                        processlist : [],
                                                        timestamp : 0
                                              },
                                              charts : {
                                                                  cpu : [null,null,null,null,null,null,null,null],
                                                                  memory : [null,null,null,null],
                                                                  reads : [null,null],
                                                                  writes : [null,null],
                                                                  network_tx : [null,null],
                                                                  network_rx : [null,null],
                                                                  timestamp : 0
                                              }
                                              
                                            });
    
        
    
    //--######## SQL Query Feature
    const [txtSQL, settxtSQL] = useState('');
    const [dataQuery,setdataQuery] = useState({columns: [], dataset: []});

     
     
    //--######## Functions and Events

    //-- Function Gather Metrics
    const fetchMetrics = () => {
        switch(currentTabId.current) {
              case "tab01":
                        fetchRealTimeMetricsCounters();
                        fetchRealTimeMetricsSessions();
                        fetchEnhancedMonitoring();
                        break;
                  
              case "tab02":
                        break;
                  
              case "tab03":
                        fetchEnhancedMonitoring();
                        break;
        
        }     
      
    }



    //-- Function Gather RealTime Metrics
    const fetchRealTimeMetricsCounters = () => {
      
        //--- API Call Performance Counters
        var api_params = {
                      connection: cnf_connection_id,
                      sql_statement: "SHOW GLOBAL STATUS"
                      };

        
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/mysql/sql/`,{
              params: api_params
              }).then((data)=>{

                  var time_now = new Date();
                  var counter_list = convertArrayToObject(data.data,'Variable_name');
                  
                  if (init_process.current===0){
                    datacounters_old.current=counter_list;
                    init_process.current=1;
                    counterdate.current=time_now.getTime();
                  }
                  
                  setDataMetricRealTime({ 
                                        Queries:[(counter_list['Queries']['Value'] - datacounters_old.current['Queries']['Value']) /  (Math.abs( time_now.getTime() - counterdate.current) / 1000)],
                                        Operations : [
                                                      (counter_list['Com_select']['Value'] - datacounters_old.current['Com_select']['Value']) /  (Math.abs( time_now.getTime() - counterdate.current) / 1000),
                                                      (counter_list['Com_update']['Value'] - datacounters_old.current['Com_update']['Value']) /  (Math.abs( time_now.getTime() - counterdate.current) / 1000),
                                                      (counter_list['Com_delete']['Value'] - datacounters_old.current['Com_delete']['Value']) /  (Math.abs( time_now.getTime() - counterdate.current) / 1000),
                                                      (counter_list['Com_insert']['Value'] - datacounters_old.current['Com_insert']['Value']) /  (Math.abs( time_now.getTime() - counterdate.current) / 1000)
                                                      ],
                                        Network : [ 
                                                  (counter_list['Bytes_received']['Value'] - datacounters_old.current['Bytes_received']['Value']) /  (Math.abs( time_now.getTime() - counterdate.current) / 1000),
                                                  (counter_list['Bytes_sent']['Value'] - datacounters_old.current['Bytes_sent']['Value']) /  (Math.abs( time_now.getTime() - counterdate.current) / 1000)
                                                  ],
                                        dataCounters : counter_list,
                                        timestamp : time_now.getTime()
                  });

                  datacounters_old.current=counter_list;
                  counterdate.current=time_now.getTime();
    
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/mysql/sql/' );
                  console.log(err)
                    
              });
              
              
              
        

              
            
    
    }
   
   
    //-- Function Gather RealTime Metrics
    const fetchRealTimeMetricsSessions = () => {
      
        if (pauseCollection.current==false)
          return;
      
        //--- API Call Gather Sessions
        var api_params = {
                      connection: cnf_connection_id,
                      sql_statement: dataSessionQuery
                      };
    
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/mysql/sql/`,{
              params: api_params
              }).then((data)=>{
                  
                  var time_now = new Date();
                  setDataMetricRealTimeSession({ 
                                        Sessions : data.data,
                                        SessionsTotal : [data.data.length],
                                        timestamp : time_now.getTime()
                                        
                  });
                  
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/mysql/sql/' );
                  console.log(err)
                  
              });
    
    
    }
   
   //-- Function Gather EnhancedMetrics Metrics
   const fetchEnhancedMonitoring = () => {
    
            // Enhanced monitoring
            Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aws/clw/region/logs/`,{
                params: { resource_id : cnf_rds_resource_id }
            }).then((data)=>{
              
                var time_now = new Date();
                var message=JSON.parse(data.data.events[0].message);
                
                setdataEnhancedMonitor({
                                          counters : {
                                                    cpu : [{name:'pct_usage', value: Math.trunc(message.cpuUtilization.total)},{name:'total_vcpu', value: message.numVCPUs}],
                                                    cpu_detail : [
                                                                  {name:'user', value: message.cpuUtilization.user},
                                                                  {name:'system', value: message.cpuUtilization.system},
                                                                  {name:'wait', value: message.cpuUtilization.wait},
                                                                  {name:'irq', value: message.cpuUtilization.irq},
                                                                  {name:'guest', value: message.cpuUtilization.guest},
                                                                  {name:'steal', value: message.cpuUtilization.steal},
                                                                  {name:'nice', value: message.cpuUtilization.nice}
                                                    ],
                                                    memory : [{name: 'pct_usage', value : Math.trunc(( (message.memory.total-message.memory.free) / message.memory.total) * 100) } , {name:'total', value: message.memory.total*1024 }, {name : 'free', value: message.memory.free }, {name: 'active', value: message.memory.active}],
                                                    memory_detail : [
                                                                  {name:'total', value: message.memory.total},
                                                                  {name:'active', value: message.memory.active},
                                                                  {name:'inactive', value: message.memory.inactive},
                                                                  {name:'free', value: message.memory.free}
                                                    ],
                                                    io_reads : [{name:'filesystem', value: message.diskIO[0].readIOsPS}, {name:'rdstemp', value: message.diskIO[1].readIOsPS}],
                                                    io_writes : [{name:'filesystem', value: message.diskIO[0].writeIOsPS}, {name:'rdstemp', value: message.diskIO[1].writeIOsPS}],
                                                    network : [{name:'tx', value: message.network[0].tx}, {name:'rx', value: message.network[0].rx}],
                                                    tps: [{name:'total_tps',value: message.diskIO[1].tps }], 
                                                    io_queue: [{name:'avg_queue',value:  message.diskIO[1].avgQueueLen }], 
                                                    processlist : message.processList,
                                                    timestamp : message.timestamp 
                                          },
                                          charts: {
                                                   cpu : [
                                                            message.cpuUtilization.total,
                                                            message.cpuUtilization.user,
                                                            message.cpuUtilization.system,
                                                            message.cpuUtilization.wait,
                                                            message.cpuUtilization.irq,
                                                            message.cpuUtilization.guest,
                                                            message.cpuUtilization.steal,
                                                            message.cpuUtilization.nice
                                                            ], 
                                                    memory : [
                                                            message.memory.total * 1024,
                                                            message.memory.active * 1024,
                                                            message.memory.inactive * 1024,
                                                            message.memory.free * 1024
                                                      ],
                                                    reads : [
                                                            message.diskIO[0].readIOsPS,
                                                            message.diskIO[1].readIOsPS,
                                                      ],
                                                    writes : [
                                                            message.diskIO[0].writeIOsPS,
                                                            message.diskIO[1].writeIOsPS,
                                                      ],
                                                    network_tx : [
                                                            message.network[0].tx
                                                                                                      ],
                                                    network_rx : [
                                                            message.network[0].rx
                                                      ],
                                                    timestamp : time_now.getTime()
                                          }
                                            
                });
                
                
            })
            .catch((err) => {
                console.log('Timeout API Call : /api/aws/clw/region/logs/');
                console.log(err)
            });
            
            
            
  
   }
   
   
   //-- Function Handle Logout
   const handleClickMenu = ({detail}) => {
          
            switch (detail.id) {
              case 'signout':
                  closeDatabaseConnection();
                break;
                
              case 'other':
                break;
                
              
            }

    };
    
    //-- Function Handle Logout
   const handleClickDisconnect = () => {
          
          closeDatabaseConnection();

    };
    
    
    //-- Close Database Connection
    
    const closeDatabaseConnection = () => {
        
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/security/rds/disconnect/`,{
                      params: { session_id: cnf_connection_id, engine: cnf_rds_engine}
                  }).then((data)=>{
                      closeTabWindow();
                      sessionStorage.removeItem(parameter_code_id);
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/security/mysql/disconnect/');
                      console.log(err)
                  });
                  
  
      
    }
       
    //-- Close TabWindow
    const closeTabWindow = () => {
              window.opener = null;
              window.open("", "_self");
              window.close();
      
    }
    
    
    
    
    
    //-- Function Run Query
    const handleClickRunQuery = () => {
    
        
        //--- API Call Gather Sessions
        var api_params = {
                      connection: cnf_connection_id,
                      sql_statement:txtSQL
          
        };
    
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/mysql/sql/`,{
              params: api_params
              }).then((data)=>{
                  
                  var colInfo=[];
                  try{
                    
                        if (Array.isArray(data.data)){
                            var columns = Object.keys(data.data[0]);
                            columns.forEach(function(colItem) {
                                colInfo.push({ id: colItem, header: colItem,cell: item => item[colItem] || "-",sortingField: colItem,isRowHeader: true });
                            })
                        }
                    
                  }
                  catch {
                    
                    colInfo = [];
                    
                  }
                  
                  setdataQuery({columns:colInfo, dataset: data.data, result_code:0, result_info: ""});
                
                
              })
              .catch((err) => {
                  console.log(err)
                  setdataQuery({columns:[], dataset: [], result_code:1, result_info: err.response.data.sqlMessage});
                  
              });
              
              
              
              
    };
    
    
   
    
    //-- Startup Function
    
    // eslint-disable-next-line
    useEffect(() => {
        fetchMetrics();
        const id = setInterval(fetchMetrics, configuration["apps-settings"]["refresh-interval"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    
    
    //-- Function Convert Array to Type Object
    
    const convertArrayToObject = (array, key) => 
      array.reduce((acc, curr) =>(acc[curr[key]] = curr, acc), {});
  


  return (
    <>
      
      <CustomHeader
        onClickMenu={handleClickMenu}
        onClickDisconnect={handleClickDisconnect}
        sessionInformation={parameter_object_values}
      />
      <CustomLayout
        contentType="table"
        splitPanelOpen={splitPanelShow}
        onSplitPanelToggle={() => setsplitPanelShow(false)}
        splitPanelSize={250}
        splitPanel={
                  <SplitPanel  header={"Session Details (" + selectedItems[0].ThreadID + ")"} i18nStrings={splitPanelI18nStrings} closeBehavior="hide"
                    onSplitPanelToggle={({ detail }) => {
                                    console.log(detail);
                                    }
                                  }
                  >
                      
                    <ColumnLayout columns="4" variant="text-grid">
                         <div>
                              <Box variant="awsui-key-label">ThreadID</Box>
                              {selectedItems[0]['ThreadID']}
                          </div>
                          <div>
                              <Box variant="awsui-key-label">Username</Box>
                              {selectedItems[0]['Username']}
                          </div>
                          <div>
                              <Box variant="awsui-key-label">Host</Box>
                              {selectedItems[0]['Host']}
                          </div>
                          <div>
                              <Box variant="awsui-key-label">Database</Box>
                              {selectedItems[0]['Database']}
                          </div>
                        </ColumnLayout>
                
                        <ColumnLayout columns="4" variant="text-grid">
                         <div>
                              <Box variant="awsui-key-label">Time</Box>
                              {selectedItems[0]['Time']}
                          </div>
                          <div>
                              <Box variant="awsui-key-label">State</Box>
                              {selectedItems[0]['State']}
                          </div>
                          <div>
                              <Box variant="awsui-key-label">SQLText</Box>
                              {selectedItems[0]['SQLText']}
                          </div>
                        
                        </ColumnLayout>
                        
                        
                  </SplitPanel>
        }
        pageContent={
            <>
                  <Tabs
                    onChange={({ detail }) => {
                          setActiveTabId(detail.activeTabId);
                          currentTabId.current=detail.activeTabId;
                      }
                    }
                    activeTabId={activeTabId}
                    tabs={[
                      {
                        label: "RealTime Metrics",
                        id: "tab01",
                        content: 
                          
                          <>
                          
                          <table style={{"width":"100%", "padding": "1em"}}>
                                <tr>  
                                   <td>        
                                        <Container>
                                              
                                                <table style={{"width":"100%"}}>
                                                    <tr>  
                                                      <td style={{"width":"12.5%","padding-left": "1em"}}>  
                                                          <CompMetric 
                                                            metric={{Value: dataEnhancedMonitor['counters']['cpu'][0]['value']}}
                                                            title={"CPU Usage (%)"}
                                                            type={2}
                                                            precision={0}
                                                            format={3}
                                                          />
                                                          <ProgressBar value={dataEnhancedMonitor['counters']['cpu'][0]['value']}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                          <CompMetric 
                                                            metric={{Value: dataEnhancedMonitor['counters']['memory'][0]['value']}}
                                                            title={"Memory Usage(%)"}
                                                            type={2}
                                                            precision={0}
                                                            format={3}
                                                          />
                                                          <ProgressBar value={dataEnhancedMonitor['counters']['memory'][0]['value']}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                          <CompMetric 
                                                            metric={{Value: dataEnhancedMonitor['counters']['tps'][0]['value']}}
                                                            title={"I/O TPS"}
                                                            type={2}
                                                            precision={0}
                                                            format={3}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                          <CompMetric 
                                                            metric={{Value: dataEnhancedMonitor['counters']['io_queue'][0]['value']}}
                                                            title={"DiskQueue"}
                                                            type={2}
                                                            precision={2}
                                                            format={2}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                          <CompMetric 
                                                            metric={{Value: dataEnhancedMonitor['counters']['io_reads'][0]['value'] + dataEnhancedMonitor['counters']['io_reads'][1]['value']}}
                                                            title={"Reads (IOPS)"}
                                                            type={2}
                                                            precision={0}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                          <CompMetric 
                                                            metric={{Value: dataEnhancedMonitor['counters']['io_writes'][0]['value'] + dataEnhancedMonitor['counters']['io_writes'][1]['value']}}
                                                            title={"Write (IOPS)"}
                                                            type={2}
                                                            precision={0}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                          <CompMetric 
                                                            metric={{Value: dataEnhancedMonitor['counters']['network'][0]['value']}}
                                                            title={"Network TX(Bytes/sec)"}
                                                            type={2}
                                                            precision={0}
                                                            format={2}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                          <CompMetric 
                                                            metric={{Value: dataEnhancedMonitor['counters']['network'][1]['value'] }}
                                                            title={"Network RX(Bytes/sec)"}
                                                            type={2}
                                                            precision={0}
                                                            format={2}
                                                          />
                                                      </td>
                                                      
                                                </tr>  
                                              
                                              </table>  
                                              <br />  
                                              <br />  
                                              <table style={{"width":"100%"}}>
                                                  <tr>  
                                                    <td style={{"width":"12.5%","padding-left": "1em"}}> 
                                                        <CompMetric 
                                                          metric={dataMetricRealTime.dataCounters['Queries']}
                                                          title={"Queries/sec"}
                                                          type={1}
                                                          precision={0}
                                                        />
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                        <CompMetric 
                                                          metric={dataMetricRealTime.dataCounters['Com_select']}
                                                          title={"Selects/sec"}
                                                          type={1}
                                                          precision={0}
                                                        />
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                        <CompMetric 
                                                          metric={dataMetricRealTime.dataCounters['Com_insert']}
                                                          title={"Insert/sec"}
                                                          type={1}
                                                          precision={0}
                                                        />
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                        <CompMetric 
                                                          metric={dataMetricRealTime.dataCounters['Com_update']}
                                                          title={"Update/sec"}
                                                          type={1}
                                                          precision={0}
                                                        />
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                        <CompMetric 
                                                          metric={dataMetricRealTime.dataCounters['Com_delete']}
                                                          title={"Delete/sec"}
                                                          type={1}
                                                          precision={0}
                                                        />
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                        <CompMetric 
                                                          metric={dataMetricRealTime.dataCounters['Threads_connected']}
                                                          title={"Threads"}
                                                          type={2}
                                                          precision={0}
                                                        />
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                        <CompMetric 
                                                          metric={dataMetricRealTime.dataCounters['Bytes_received']}
                                                          title={"BytesReceived/sec"}
                                                          type={1}
                                                          precision={0}
                                                          format={2}
                                                        />
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid #e3e5e7", "padding-left": "1em"}}>
                                                        <CompMetric 
                                                          metric={dataMetricRealTime.dataCounters['Bytes_sent']}
                                                          title={"BytesSent/sec"}
                                                          type={1}
                                                          precision={0}
                                                          format={2}
                                                        />
                                                    </td>
                                                   
                                              </tr>  
                                              
                                              </table>  
                                               
                                              
                                              <br />
                                              <table style={{"width":"100%"}}>
                                                  <tr>  
                                                    <td style={{"width":"25%","padding-left": "1em"}}> 
                                                        <ChartLine series={confMetricRealTime['Sessions']} serie={dataMetricRealTimeSession['SessionsTotal']} timestamp={dataMetricRealTimeSession['timestamp']} title={"Active Sessions"} history="50" height="200px" />
                                                    </td>
                                                    <td style={{"width":"25%","padding-left": "1em"}}> 
                                                        <ChartLine series={confMetricRealTime['Queries']} serie={dataMetricRealTime['Queries']} timestamp={dataMetricRealTime['timestamp']} title={"Queries/sec"} history="50" height="200px" />
                                                    </td>
                                                    <td style={{"width":"50%","padding-left": "1em"}}> 
                                                        <ChartLine series={confMetricRealTime['Operations']} serie={dataMetricRealTime['Operations']} timestamp={dataMetricRealTime['timestamp']} title={"Operations/sec"} history="50" height="200px" border={2}/>
                                                    </td>
                                                  </tr>
                                              </table>
                                          
                                        </Container>
                                        <br/>
                                    </td>  
                                </tr>
                              
                                <tr>  
                                   <td>
                                        <Container>
                                            <Table
                                                    stickyHeader
                                                    columnDefinitions={dataSessionColumns}
                                                    items={dataMetricRealTimeSession['Sessions']}
                                                    loadingText="Loading records"
                                                    sortingDisabled
                                                    variant="embedded"
                                                    selectionType="single"
                                                    onSelectionChange={({ detail }) => {
                                                      setSelectedItems(detail.selectedItems);
                                                      setsplitPanelShow(true);
                                                      }
                                                    }
                                                    selectedItems={selectedItems}
                                                    empty={
                                                      <Box textAlign="center" color="inherit">
                                                        <b>No records</b>
                                                        <Box
                                                          padding={{ bottom: "s" }}
                                                          variant="p"
                                                          color="inherit"
                                                        >
                                                          No records to display.
                                                        </Box>
                                                      </Box>
                                                    }
                                                    filter={
                                                     <Header variant="h3" counter={"(" + dataMetricRealTimeSession['Sessions'].length + ")"}
                                                      >
                                                        Active sessions
                                                    </Header>
                                                    }
                                                    
                                                    pagination={
                                                      
                                                      <Toggle
                                                          onChange={({ detail }) =>{
                                                              setcollectionState(detail.checked);
                                                              pauseCollection.current=detail.checked;
                                                            }
                                                          }
                                                          checked={collectionState}
                                                        >
                                                          Auto-Refresh
                                                        </Toggle>
                                                        
                                                    }
                                                  resizableColumns
                                                  />
                          
                                          </Container>
            
                                    </td>  
                                </tr>
                            </table>       
                          
                          </>
                          
                          
                        
                        
                      },
                      {
                        label: "CloudWatch Metrics",
                        id: "tab02",
                        content: 
                        <>
                        <table style={{"width":"100%", "padding": "1em"}}>
                                <tr>  
                                   <td> 
                                        <Container>
                                            
                                            <ColumnLayout columns={2} variant="text-grid" >
                                                        <div style={{"text-align":"center"}}>
                                                            <CLWChart 
                                                                              title="CPU" 
                                                                              subtitle="Usage(%)" 
                                                                              height="180px" 
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="CPUUtilization"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={3}
                                                                            />
                                             
                                                        </div>
                                                        <div style={{"text-align":"center" }}>
                                                              <CLWChart 
                                                                              title="FreeableMemory" 
                                                                              subtitle="Total" 
                                                                              height="180px" 
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="FreeableMemory"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                            />
                                                                            
                                                        
                                                        </div>
                                                        
                                              </ColumnLayout>
                                          </Container>
                                          <br/>
                                          <Container>
                                              <ColumnLayout columns={2} variant="text-grid">
                                                        <div style={{"text-align":"center"}}>
                                                            <CLWChart 
                                                                              title="NetworkReceive" 
                                                                              subtitle="Bytes/Second" 
                                                                              height="180px"
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="NetworkReceiveThroughput"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                          />
                                             
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="NetworkTransmit" 
                                                                              subtitle="Bytes/Second" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="NetworkTransmitThroughput"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                          />
                                                                            
                                                        
                                                        </div>
                                                        
                                              </ColumnLayout>
                                          </Container>
                                          <br/>
                                          <Container>
                                              <ColumnLayout columns={2} variant="text-grid">
                                                        <div style={{"text-align":"center"}}>
                                                            <CLWChart 
                                                                              title="StorageReceiveThroughput" 
                                                                              subtitle="Bytes/Second" 
                                                                              height="180px"
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="StorageNetworkReceiveThroughput"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                          />
                                             
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="StorageTransmitThroughput" 
                                                                              subtitle="Bytes/Second" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="StorageNetworkTransmitThroughput"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                          />
                                                                            
                                                        
                                                        </div>
                                                        
                                              </ColumnLayout>
                                           </Container>
                                          <br />
                                          
                                          <Container>
                                            
                                            <ColumnLayout columns={2} variant="text-grid" >
                                                           <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                            title="CommitThroughput" 
                                                                            subtitle="Count/sec" 
                                                                            height="180px"
                                                                            color="orange" 
                                                                            namespace="AWS/RDS" 
                                                                            dimension_name={"DBInstanceIdentifier"}
                                                                            dimension_value={cnf_rds_id}
                                                                            metric_name="CommitThroughput"
                                                                            stat_type="Average"
                                                                            period={60} 
                                                                            interval={(60*1) * 60000}
                                                                            metric_per_second={0}
                                                                            metric_precision={0}
                                                                            format={1}
                                                                          />
                                                                            
                                                        
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="CommitLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="CommitLatency"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={1}
                                                                          />
                                                                            
                                                        
                                                        </div>
                                                       
                                              </ColumnLayout>
                                          </Container>
                                          <br />
                                          <Container>
                                              <ColumnLayout columns={2} variant="text-grid">
                                                        <div style={{"text-align":"center"}}>
                                                            <CLWChart 
                                                                              title="SelectThroughput" 
                                                                              subtitle="Count/sec" 
                                                                              height="180px"
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="SelectThroughput"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                          />
                                             
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="SelectLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="SelectLatency"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                          />
                                                          
                                                        </div>
                                                      
                                              </ColumnLayout>
                                          </Container>
                                          <br />
                                          <Container>
                                              <ColumnLayout columns={2} variant="text-grid">
                                                        <div style={{"text-align":"center"}}>
                                                            <CLWChart 
                                                                              title="UpdateThroughput" 
                                                                              subtitle="Count/sec" 
                                                                              height="180px"
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="UpdateThroughput"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                          />
                                             
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="UpdateLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="UpdateLatency"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                          />
                                                          
                                                        </div>
                                                      
                                              </ColumnLayout>
                                          </Container>
                                          <br />
                                          <Container>
                                              <ColumnLayout columns={2} variant="text-grid">
                                                        <div style={{"text-align":"center"}}>
                                                            <CLWChart 
                                                                              title="InsertThroughput" 
                                                                              subtitle="Count/sec" 
                                                                              height="180px"
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="InsertThroughput"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                          />
                                             
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="InsertLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="InsertLatency"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                          />
                                                          
                                                        </div>
                                                      
                                              </ColumnLayout>
                                          </Container>
                                          <br />
                                          <Container>
                                              <ColumnLayout columns={2} variant="text-grid">
                                                        <div style={{"text-align":"center"}}>
                                                            <CLWChart 
                                                                              title="DeleteThroughput" 
                                                                              subtitle="Count/sec" 
                                                                              height="180px"
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="DeleteThroughput"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                          />
                                             
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="DeleteLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="DeleteLatency"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                          />
                                                          
                                                        </div>
                                                      
                                              </ColumnLayout>
                                          </Container>
                                          <br/>
                                          <Container>
                                              <ColumnLayout columns={2} variant="text-grid">
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="ReadLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px"
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="ReadLatency"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={2}
                                                                              format={3}
                                                                          />
                                                                            
                                                        
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="WriteLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="WriteLatency"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={2}
                                                                              format={3}
                                                                          />
                                                                            
                                                        
                                                        </div>
                                                       
                                              </ColumnLayout>
                                          </Container>
                                          <br />
                                          <Container>
                                              <ColumnLayout columns={2} variant="text-grid">
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="DBLoadNonCPU" 
                                                                              subtitle="Total" 
                                                                              height="180px"
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="DBLoadNonCPU"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={2}
                                                                              format={1}
                                                                          />
                                                          
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="DBLoad" 
                                                                              subtitle="Total" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="DBLoad"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={2}
                                                                              format={1}
                                                                          />
                                                          
                                                        </div>
                                                           
                                                       
                                              </ColumnLayout>
                                          </Container>
                                    </td>  
                                </tr>
                          </table>  
                                   
                          </>
                          
                        
                                                        
                        
                        
                      },
                      {
                        label: "Enhanced Monitoring",
                        id: "tab03",
                        content: 
                        <>
                            <table style={{"width":"100%", "padding": "1em"}}>
                                <tr>  
                                   <td> 
                        
                                      <Container>
                                      <table style={{"width":"100%"}}>
                                          <tr>  
                                             <td style={{"width":"15%", "text-align":"center"}}>        
                                                    <Box variant="h4">CPU Usage</Box>
                                                    <CompMetric 
                                                      metric={{Value: dataEnhancedMonitor['counters']['cpu'][0]['value']}}
                                                      title={"( % )"}
                                                      type={2}
                                                      precision={0}
                                                      format={3}
                                                    />
                                              </td>
                                              <td style={{"width":"25%", "text-align":"center", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                                    
                                                    <ColumnLayout columns={4} variant="text-grid">
                                                      <div>
                                                          <div style={{"font-size": "18px", "font-weight": "500","font-family": "Orbitron", "color": "orange"}}>{dataEnhancedMonitor['counters']['cpu_detail'][0]['value']}</div>
                                                          <div style={{"font-size": "12px", "color": "#C6C2C1", "font-weight": "450" }}>
                                                              User
                                                          </div>
                                                      </div>
                                                      <div>
                                                          <div style={{"font-size": "18px", "font-weight": "500","font-family": "Orbitron", "color": "orange"}}>{dataEnhancedMonitor['counters']['cpu_detail'][1]['value']}</div>
                                                          <div style={{"font-size": "12px", "color": "#C6C2C1", "font-weight": "450" }}>
                                                              System
                                                          </div>
                                                      </div>
                                                      <div>
                                                          <div style={{"font-size": "18px", "font-weight": "500","font-family": "Orbitron", "color": "orange"}}>{dataEnhancedMonitor['counters']['cpu_detail'][2]['value']}</div>
                                                          <div style={{"font-size": "12px", "color": "#C6C2C1", "font-weight": "450" }}>
                                                              Wait
                                                          </div>
                                                      </div>
                                                      <div>
                                                          <div style={{"font-size": "18px", "font-weight": "500","font-family": "Orbitron", "color": "orange"}}>{dataEnhancedMonitor['counters']['cpu_detail'][5]['value']}</div>
                                                          <div style={{"font-size": "12px", "color": "#C6C2C1", "font-weight": "450" }}>
                                                              Steal
                                                          </div>
                                                      </div>
                                                      <div>
                                                          <div style={{"font-size": "18px", "font-weight": "500","font-family": "Orbitron", "color": "orange"}}>{dataEnhancedMonitor['counters']['cpu_detail'][6]['value']}</div>
                                                          <div style={{"font-size": "12px", "color": "#C6C2C1", "font-weight": "450" }}>
                                                              Nice
                                                          </div>
                                                      </div>
                                                      <div>
                                                          <div style={{"font-size": "18px", "font-weight": "500","font-family": "Orbitron", "color": "orange"}}>{dataEnhancedMonitor['counters']['cpu_detail'][4]['value']}</div>
                                                          <div style={{"font-size": "12px", "color": "#C6C2C1", "font-weight": "450" }}>
                                                              Guest
                                                          </div>
                                                      </div>
                                                    </ColumnLayout>
                                                    
                                              </td>
                                              
                                              <td style={{"width":"60%"}}>        
                                                  <ChartLine 
                                                      series={confEnhancedMonitorChart['cpu']} 
                                                      serie={dataEnhancedMonitor['charts']['cpu']} 
                                                      timestamp={dataEnhancedMonitor['charts']['timestamp']} 
                                                      title={"CPU Usage (%)"} history="50" height="180px" 
                                                  />
                                
                                              </td>
                                          </tr>
                                      </table>
                                      </Container>
                                      <br/>
                                      <Container>
                                      <table style={{"width":"100%"}}>
                                          <tr>  
                                             <td style={{"width":"15%", "text-align":"center"}}>        
                                                     <Box variant="h4">Memory Usage</Box>
                                                    <CompMetric 
                                                      metric={{Value: dataEnhancedMonitor['counters']['memory'][0]['value']}}
                                                      title={"( % )"}
                                                      type={2}
                                                      precision={0}
                                                      format={3}
                                                    />
                                              </td>
                                              <td style={{"width":"25%", "text-align":"center", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                                    
                                                    <ColumnLayout columns={4} variant="text-grid">
                                                      <div>
                                                          <div style={{"font-size": "18px", "font-weight": "500","font-family": "Orbitron", "color": "orange"}}>{customFormatNumber(dataEnhancedMonitor['counters']['memory_detail'][0]['value']*1024,0)}</div>
                                                          <div style={{"font-size": "12px", "color": "#C6C2C1", "font-weight": "450" }}>
                                                              Total
                                                          </div>
                                                      </div>
                                                      <div>
                                                          <div style={{"font-size": "18px", "font-weight": "500","font-family": "Orbitron", "color": "orange"}}>{customFormatNumber(dataEnhancedMonitor['counters']['memory_detail'][1]['value']*1024,0)}</div>
                                                          <div style={{"font-size": "12px", "color": "#C6C2C1", "font-weight": "450" }}>
                                                              Active
                                                          </div>
                                                      </div>
                                                      <div>
                                                          <div style={{"font-size": "18px", "font-weight": "500","font-family": "Orbitron", "color": "orange"}}>{customFormatNumber(dataEnhancedMonitor['counters']['memory_detail'][2]['value']*1024,0)}</div>
                                                          <div style={{"font-size": "12px", "color": "#C6C2C1", "font-weight": "450" }}>
                                                              Inactive
                                                          </div>
                                                      </div>
                                                      <div>
                                                          <div style={{"font-size": "18px", "font-weight": "500","font-family": "Orbitron", "color": "orange"}}>{customFormatNumber(dataEnhancedMonitor['counters']['memory_detail'][3]['value']*1024,0)}</div>
                                                          <div style={{"font-size": "12px", "color": "#C6C2C1", "font-weight": "450" }}>
                                                              Free
                                                          </div>
                                                      </div>
                                                      
                                                    </ColumnLayout>
                                                    
                                              </td>
                                              <td style={{"width":"60%"}}>        
                                                  <ChartLine 
                                                      series={confEnhancedMonitorChart['memory']} 
                                                      serie={dataEnhancedMonitor['charts']['memory']} 
                                                      timestamp={dataEnhancedMonitor['charts']['timestamp']} 
                                                      title={"Memory Usage (GB)"} history="50" height="180px" 
                                                  />
                                              </td>
                                          </tr>
                                      </table>
                                      </Container>
                                      <br/>
                                      <Container>
                                      <table style={{"width":"100%"}}>
                                          <tr>  
                                          
                                              <td style={{"width":"15%", "text-align":"center"}}>      
                                                  
                                                  <Box variant="h4">I/O Reads</Box>
                                                  <CompMetric 
                                                    metric={{Value: dataEnhancedMonitor['counters']['io_reads'][0]['value'] + dataEnhancedMonitor['counters']['io_reads'][1]['value']}}
                                                    title={"IOPS"}
                                                    type={2}
                                                    precision={0}
                                                  />
                                              </td>
                                             
                                              <td style={{"width":"15%", "text-align":"center", "border-left": "2px solid red"}}>  
                                                  <Box variant="h4">I/O Writes</Box>
                                                  <CompMetric 
                                                    metric={{Value: dataEnhancedMonitor['counters']['io_writes'][0]['value'] + dataEnhancedMonitor['counters']['io_writes'][1]['value']}}
                                                    title={"IOPS"}
                                                    type={2}
                                                    precision={0}
                                                  />
                                              </td>
                              
                                              <td style={{"width":"35%"}}>    
                                                  <ChartLine 
                                                      series={confEnhancedMonitorChart['reads']} 
                                                      serie={dataEnhancedMonitor['charts']['reads']} 
                                                      timestamp={dataEnhancedMonitor['charts']['timestamp']} 
                                                      title={"I/O Reads"} history="50" height="180px" 
                                                  />
                                              </td>
                                              
                                              <td style={{"width":"35%", "padding-left": "1em"}}>        
                                                  <ChartLine 
                                                      series={confEnhancedMonitorChart['writes']} 
                                                      serie={dataEnhancedMonitor['charts']['writes']} 
                                                      timestamp={dataEnhancedMonitor['charts']['timestamp']} 
                                                      title={"I/O Writes"} history="50" height="180px" 
                                                  />
                                              </td>
                                            
                                          </tr>
                                      </table>
                                      </Container>
                                      <br/>
                                      <Container>
                                      <table style={{"width":"100%"}}>
                                          <tr>  
                                          
                                              <td style={{"width":"15%", "text-align":"center"}}>        
                                                  <Box variant="h4">Network(TX)</Box>
                                                  <CompMetric 
                                                    metric={{Value: dataEnhancedMonitor['counters']['network'][0]['value']}}
                                                    title={"Bytes/sec"}
                                                    type={2}
                                                    precision={0}
                                                    format={2}
                                                  />
                                              </td>
                                             
                                              <td style={{"width":"15%", "text-align":"center", "border-left": "2px solid red"}}>  
                                                  <Box variant="h4">Network(RX)</Box>
                                                  <CompMetric 
                                                    metric={{Value: dataEnhancedMonitor['counters']['network'][1]['value'] }}
                                                    title={"Bytes/sec"}
                                                    type={2}
                                                    precision={0}
                                                    format={2}
                                                  />
                                              </td>
                              
                                              <td style={{"width":"35%"}}>        
                                                  <ChartLine 
                                                      series={confEnhancedMonitorChart['network_tx']} 
                                                      serie={dataEnhancedMonitor['charts']['network_tx']} 
                                                      timestamp={dataEnhancedMonitor['charts']['timestamp']} 
                                                      title={"Network(TX)"} history="50" height="180px" 
                                                  />
                                              </td>
                                              
                                              <td style={{"width":"35%", "padding-left": "1em"}}>        
                                                  <ChartLine 
                                                      series={confEnhancedMonitorChart['network_rx']} 
                                                      serie={dataEnhancedMonitor['charts']['network_rx']} 
                                                      timestamp={dataEnhancedMonitor['charts']['timestamp']} 
                                                      title={"Network(RX)"} history="50" height="180px" 
                                                  />
                                              </td>
                                            
                                          </tr>
                                      </table>
                                      </Container>
                                      <br/>
                                      <Container>
                                      <table style={{"width":"100%"}}>
                                          <tr>  
                                              <td style={{"width":"100%"}}>
                                                    
                                                    <Table
                                                        stickyHeader
                                                        columnDefinitions={dataColsProcessList}
                                                        items={dataEnhancedMonitor['counters']['processlist']}
                                                        loadingText="Loading records"
                                                        sortingDisabled
                                                        variant="embedded"
                                                        selectionType="single"
                                                        onSelectionChange={({ detail }) => {
                                                          setSelectedItems(detail.selectedItems);
                                                          }
                                                        }
                                                        selectedItems={selectedItems}
                                                        empty={
                                                          <Box textAlign="center" color="inherit">
                                                            <b>No records</b>
                                                            <Box
                                                              padding={{ bottom: "s" }}
                                                              variant="p"
                                                              color="inherit"
                                                            >
                                                              No records to display.
                                                            </Box>
                                                            <Button>Create resource</Button>
                                                          </Box>
                                                        }
                                                        filter={
                                                         <Header counter={"(" + dataEnhancedMonitor['counters']['processlist'].length + ")"}
                                                          >
                                                            ProcessList
                                                        </Header>
                                                        }
                                                        
                                                        pagination={
                                                          
                                                          <Toggle
                                                              onChange={({ detail }) =>{
                                                                  setcollectionState(detail.checked);
                                                                  pauseCollection.current=detail.checked;
                                                                  console.log('value checked:' + detail.checked);
                                                                }
                                                              }
                                                              checked={collectionState}
                                                            >
                                                              Auto-Refresh
                                                            </Toggle>
                                                            
                                                        }
                                                      resizableColumns
                                                      />
                                          
                                          
                                              </td>
                                          </tr>
                                      </table>
                                      </Container>
                                      
                                  </td>
                            </tr>
                        </table>  
                                    
                               
                                    
                        </>
                          
                        ,
                      },
                      {
                        label: "Query Editor",
                        id: "tab04",
                        content: 
                        <>
                       
                        <table style={{"width":"100%", "padding": "1em"}}>
                            <tr>  
                               <td> 
                    
                                  <Container>
                                    <table style={{"width":"100%"}}>
                                        <tr>  
                                           <td style={{"width":"100%", "text-align":"left"}}>     
                                                <Header variant="h3">
                                                        SQL Query {(dataQuery.result_code=="0") && <Badge color="green">Execution successful</Badge> }
                                                      {(dataQuery.result_code=="1") && <Badge color="red">Execution failed</Badge>}
                                                </Header>
                                                <Textarea
                                                    onChange={({ detail }) => settxtSQL(detail.value)}
                                                    value={txtSQL}
                                                    placeholder="SQL Query Text"
                                                    rows={"10"}
                                                  />
                                                  <br/>
                                                  <SpaceBetween direction="horizontal" size="xs">
                                                      <Button variant="primary" onClick={handleClickRunQuery}>Run Query</Button>
                                                      <Button onClick={() => settxtSQL("")}>Clear</Button>
                                                  </SpaceBetween>
                                              
                                           </td>
                                        </tr>
                                        <tr>  
                                           <td style={{"width":"100%", "text-align":"center"}}>     
                                               <br/>
                                              <Table
                                                    stickyHeader
                                                    columnDefinitions={dataQuery.columns}
                                                    items={dataQuery.dataset}
                                                    loadingText="Loading records"
                                                    sortingDisabled
                                                    variant="embedded"
                                                    selectionType="single"
                                                    onSelectionChange={({ detail }) => {
                                                      setSelectedItems(detail.selectedItems);
                                                      }
                                                    }
                                                    selectedItems={selectedItems}
                                                    empty={
                                                      <Box textAlign="center" color="inherit">
                                                        <b>No records</b>
                                                        <Box
                                                          padding={{ bottom: "s" }}
                                                          variant="p"
                                                          color="inherit"
                                                        >
                                                          No records to display.
                                                        </Box>
                                                       
                                                      </Box>
                                                    }
                                                    filter={
                                                     <Header variant="h3" counter={"(" + dataQuery.dataset.length + ")"}
                                                      >
                                                        Result Items
                                                    </Header>
                                                    }
                                                    
                                                   
                                                  resizableColumns
                                                  />
                                          </td>
                                        </tr>
                                    </table> 
                                  </Container> 
                                  
                                </td>
                              </tr>
                        </table> 
                        
                        
                         </>
                        ,
                        
                      },
                      {
                        label: "Instance Configuration",
                        id: "tab05",
                        content: 
                        <>
                          
                          <table style={{"width":"100%", "padding": "1em"}}>
                            <tr>  
                                <td> 
                    
                                      <Container header={<Header variant="h3">General Information</Header>}>
                                        <ColumnLayout columns={4} variant="text-grid">
                                          <div>
                                            <Box variant="awsui-key-label">Instance name</Box>
                                            <div>{parameter_object_values['rds_id']}</div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">DB instance class</Box>
                                            <div><div>{parameter_object_values['rds_class']}</div></div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Availability Zone</Box>
                                            <div><div>{parameter_object_values['rds_az']}</div></div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Engine Type</Box>
                                            <div><div>{parameter_object_values['rds_engine']}</div></div>
                                          </div>
                                        </ColumnLayout>
                                        <br/>
                                        <br/>
                                        <ColumnLayout columns={4} variant="text-grid">
                                          <div>
                                            <Box variant="awsui-key-label">Endpoint</Box>
                                            <div>{parameter_object_values['rds_host']}</div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Resource ID</Box>
                                            <div><div>{parameter_object_values['rds_resource_id']}</div></div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Session ID</Box>
                                            <div><div>{parameter_object_values['session_id']}</div></div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Engine version</Box>
                                            <div><div>{parameter_object_values['rds_version']}</div></div>
                                          </div>
                                          
                                        </ColumnLayout>
                                        <br/>
                                        <br/>
                                        <ColumnLayout columns={4} variant="text-grid">
                                         
                                          <div>
                                            <Box variant="awsui-key-label">vCPUs</Box>
                                            <div><div>{dataEnhancedMonitor['counters']['cpu'][1]['value']}</div></div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Memory</Box>
                                            <div><div>{(dataEnhancedMonitor['counters']['memory'][1]['value']/1024/1024/1024).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} GB</div></div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Storage Type</Box>
                                            <div>{parameter_object_values['rds_storage']}</div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Storage Size(GB)</Box>
                                            <div>{parameter_object_values['rds_storage_size']}</div>
                                          </div>
                                          
                                        </ColumnLayout>
                                        <br/>
                                        <br/>
                                      </Container>
                                  
                                </td>
                            </tr>
                          </table>
                                
                                
                        
                        </>
                        ,
                        }
                    ]}
                  />
                  
     
            </>
            
        }
      />
      
    </>
    
  );
}
