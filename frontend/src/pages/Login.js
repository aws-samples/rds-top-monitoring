import {useState,useEffect} from 'react'
import { createSearchParams } from "react-router-dom";
import Axios from 'axios'
import { configuration, SideMainLayoutHeader,SideMainLayoutMenu, breadCrumbs } from './Configs';

import CustomHeader from "../components/HeaderApp";
import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from '@cloudscape-design/components/side-navigation';


import { StatusIndicator } from '@cloudscape-design/components';
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Table from "@cloudscape-design/components/table";
import Header from "@cloudscape-design/components/header";
import Box from "@cloudscape-design/components/box";
import ColumnLayout from "@cloudscape-design/components/column-layout";


import '@aws-amplify/ui-react/styles.css';

import { SplitPanel } from '@cloudscape-design/components';

import { applyMode,  Mode } from '@cloudscape-design/global-styles';

// Apply a color mode
//applyMode(Mode.Dark);
applyMode(Mode.Light);


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




//-- Encryption
var CryptoJS = require("crypto-js");

function Login() {
  
    //-- Variable for Split Panels
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [selectedItems,setSelectedItems] = useState([{ identifier: "" }]);
    
    //-- Variables RDS Table
    const [dataRds,setDataRds] = useState([]);
    const columnsRds=[
                    { id: "identifier",header: "DB identifier",cell: item => item['identifier'] || "-",sortingField: "identifier",isRowHeader: true, width: 250, },
                    { id: "status",header: "Status",cell: item => ( <> <StatusIndicator type={item.status === 'available' ? 'success' : 'error'}> {item.status} </StatusIndicator> </> ),sortingField: "status",isRowHeader: true },
                    { id: "size",header: "Size",cell: item => item['size'] || "-",sortingField: "size",isRowHeader: true },
                    { id: "engine",header: "Engine",cell: item => item['engine'] || "-",sortingField: "engine",isRowHeader: true },
                    { id: "version",header: "Engine Version",cell: item => item['version'] || "-",sortingField: "version",isRowHeader: true },
                    { id: "az",header: "Region & AZ",cell: item => item['az'] || "-",sortingField: "az",isRowHeader: true },
                    { id: "multiaz",header: "MultiAZ",cell: item => item['multiaz'] || "-",sortingField: "multiaz",isRowHeader: true },
                    ];
    
    
    
    //-- Variable for textbox components
    const [txtUser, settxtUser] = useState('');
    const [txtPassword, settxtPassword] = useState('');
  
    const [modalConnectVisible, setModalConnectVisible] = useState(false);

    //-- Add Header Cognito Token
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    Axios.defaults.withCredentials = true;
    
    //-- Handle Click Events
    const handleClickLogin = () => {
    
            // Add CSRF Token
            Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");

            // Get Authentication
            Axios.post(`${configuration["apps-settings"]["api_url"]}/api/security/rds/auth/`,{
                params: { 
                          host: selectedItems[0]['endpoint'], 
                          port: selectedItems[0]['port'], 
                          username: txtUser, 
                          password: txtPassword, 
                          engine: selectedItems[0]['engine']
                  
                }
            }).then((data)=>{
                if (data.data.result === "auth1") {
                     sessionStorage.setItem(data.data.session_id, data.data.session_token );
                     var session_id = CryptoJS.AES.encrypt(JSON.stringify({
                                                                            session_id : data.data.session_id,
                                                                            rds_id : selectedItems[0]['identifier'],
                                                                            rds_user : txtUser, 
                                                                            rds_host : selectedItems[0]['endpoint'], 
                                                                            rds_engine : selectedItems[0]['engine'], 
                                                                            rds_class : selectedItems[0]['size'], 
                                                                            rds_az : selectedItems[0]['az'], 
                                                                            rds_version : selectedItems[0]['version'],
                                                                            rds_resource_id : selectedItems[0]['resourceId'],
                                                                            rds_storage : selectedItems[0]['storage'],
                                                                            rds_storage_size : selectedItems[0]['storageSize']
                                                                            }), 
                                                            data.data.session_id
                                                            ).toString();
                                                            
                                                            
                     var path_name = "";
                     switch (selectedItems[0]['engine']) {
                          case "mysql":
                            path_name = "/sm-mysql-01";
                            break;
                            
                          case "mariadb":
                            path_name = "/sm-mysql-01";
                            break;
                            
                          case "aurora-mysql":
                            path_name = "/sm-mysql-02";
                            break;
                            
                          case "postgres":
                            path_name = "/sm-postgresql-01";
                            break;
                            
                          case "aurora-postgresql":
                            path_name = "/sm-postgresql-02";
                            break;
                            
                          default:
                             break;
                            
                          
                    }
                    
                    setModalConnectVisible(false);
                    settxtUser('');
                    settxtPassword('');
                    window.open(path_name + '?' + createSearchParams({
                                session_id: session_id,
                                code_id: data.data.session_id
                                }).toString() ,'_blank');
                    
    
                }
                else {
                 

                }
                  

            })
            .catch((err) => {
                
                console.log('Timeout API Call : /api/security/auth/');
                console.log(err)
            });
            
            
    };
    
    
    
   //-- Call API to gather instances
   async function gatherInstances (){

        //--- GATHER INSTANCES
        var rdsItems=[];
        
        try{
        
            const { data } = await Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aws/rds/instance/region/list/`);
            sessionStorage.setItem("x-csrf-token", data.csrfToken );
            data.data.DBInstances.forEach(function(item) {
                          if (item['Engine']==='mysql' || item['Engine']==='postgres' || item['Engine']==='mariadb' || item['Engine']==='aurora-mysql' || item['Engine']==='aurora-postgresql'  /* || item['Engine']==='docdb' */  ){
                            
                            try{
                                  rdsItems.push({
                                                identifier: item['DBInstanceIdentifier'],
                                                engine: item['Engine'] ,
                                                version: item['EngineVersion'] ,
                                                az: item['AvailabilityZone'],
                                                size: item['DBInstanceClass'],
                                                status: item['DBInstanceStatus'],
                                                multiaz: item['MultiAZ'],
                                                pi: item['PerformanceInsightsEnabled'],
                                                resourceId: item['DbiResourceId'],
                                                storage: item['StorageType'],
                                                storageSize:  item['AllocatedStorage'],
                                                username: item['MasterUsername'], 
                                                endpoint: item['Endpoint']['Address'], 
                                                port: item['Endpoint']['Port']
                                                
                                  });
                                  
                            }
                            catch{
                              console.log('Timeout API error : /api/aws/rds/instance/region/list/');                  
                            }
                            
                          }
                          
            })
            
        }
        catch{
          console.log('Timeout API error : /api/aws/rds/instance/region/list/');                  
        }
        
        setDataRds(rdsItems);
        if (rdsItems.length > 0 ) {
          setSelectedItems([rdsItems[0]]);
          setsplitPanelShow(true);
        }

    }
    
    
    //-- Handle Object Events KeyDown
    const handleKeyDowntxtLogin= (event) => {
      if (event.detail.key === 'Enter') {
        handleClickLogin();
      }
    }
    
    
    
    
    
    //-- Init Function
      
    // eslint-disable-next-line
    useEffect(() => {
        gatherInstances();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    
  return (
    <div style={{"background-color": "#f2f3f3"}}>
        <CustomHeader/>
        <AppLayout
            breadCrumbs={breadCrumbs}
            navigation={<SideNavigation items={SideMainLayoutMenu} header={SideMainLayoutHeader} activeHref={"/login"} />}
            splitPanelOpen={splitPanelShow}
            onSplitPanelToggle={() => setsplitPanelShow(false)}
            splitPanelSize={350}
            splitPanel={
                      <SplitPanel  
                          header={
                          
                              <Header
                                      variant="h3"
                                      actions={
                                              <SpaceBetween
                                                direction="horizontal"
                                                size="xs"
                                              >
                                                <Button variant="primary" disabled={selectedItems[0].identifier === "" ? true : false} onClick={() => {setModalConnectVisible(true);}}>Connect</Button>
                                              </SpaceBetween>
                                      }
                                      
                                    >
                                     {"Instance : " + selectedItems[0].identifier}
                                    </Header>
                            
                          } 
                          i18nStrings={splitPanelI18nStrings} closeBehavior="hide"
                          onSplitPanelToggle={({ detail }) => {
                                        console.log(detail);
                                        }
                                      }
                      >
                          
                        <ColumnLayout columns="4" variant="text-grid">
                             <div>
                                  <Box variant="awsui-key-label">DB Identifier</Box>
                                  {selectedItems[0]['identifier']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Engine</Box>
                                  {selectedItems[0]['engine']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Version</Box>
                                  {selectedItems[0]['version']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Region & AZ</Box>
                                  {selectedItems[0]['az']}
                              </div>
                            </ColumnLayout>
                            <br /> 
                            <br />
                            <ColumnLayout columns="4" variant="text-grid">
                              <div>
                                  <Box variant="awsui-key-label">Master User</Box>
                                  {selectedItems[0]['username']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Endpoint</Box>
                                  {selectedItems[0]['endpoint']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Port</Box>
                                  {selectedItems[0]['port']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Size</Box>
                                  {selectedItems[0]['size']}
                              </div>
                            
                            </ColumnLayout>
                            <br /> 
                            <br />
                            <ColumnLayout columns="4" variant="text-grid">
                              <div>
                                  <Box variant="awsui-key-label">ResourceID</Box>
                                  {selectedItems[0]['resourceId']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Storage Type</Box>
                                  {selectedItems[0]['storage']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Storage Size(GB)</Box>
                                  {selectedItems[0]['storageSize']}
                              </div>
                              
                            </ColumnLayout>
                            
                            
                      </SplitPanel>
            }
            contentType="table"
            content={
                <>
                      <br/>
                      <Table
                          stickyHeader
                          columnDefinitions={columnsRds}
                          items={dataRds}
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
                        resizableColumns
                        header={
                                    <Header
                                      variant="h3"
                                      counter={"(" + dataRds.length + ")"}
                                      actions={
                                              <SpaceBetween
                                                direction="horizontal"
                                                size="xs"
                                              >
                                                <Button variant="primary" disabled={selectedItems[0].identifier === "" ? true : false} onClick={() => {setModalConnectVisible(true);}}>Connect</Button>
                                                <Button variant="primary" onClick={() => {gatherInstances();}}>Refresh</Button>
                                              </SpaceBetween>
                                      }
                                      
                                    >
                                     Instances
                                    </Header>
                                  }
                                  
          
                        />
                        
                        
                        <Modal
                            onDismiss={() => setModalConnectVisible(false)}
                            visible={modalConnectVisible}
                            closeAriaLabel="Close modal"
                            footer={
                              <Box float="right">
                                <SpaceBetween direction="horizontal" size="xs">
                                  <Button variant="primary" onClick={() => setModalConnectVisible(false)}>Cancel</Button>
                                  <Button variant="primary" onClick={handleClickLogin}>Connect</Button>
                                </SpaceBetween>
                              </Box>
                            }
                            header={
                                  <Header
                                      variant="h3"
                                  >  
                                         {"Instance : " + selectedItems[0].identifier }
                                  </Header> 
                              
                            }
                          >
                                <FormField
                                  label="Username"
                                >
                                  <Input value={txtUser} onChange={event =>settxtUser(event.detail.value)}
                                  
                                  />
                                </FormField>
                                
                                <FormField
                                  label="Password"
                                >
                                  <Input value={txtPassword} onChange={event =>settxtPassword(event.detail.value)} onKeyDown={handleKeyDowntxtLogin}
                                         type="password"
                                  />
                                </FormField>
                                
                                
                          </Modal>
                                                      
                  
                </>
                
            }
          />
        
    </div>
  );
}

export default Login;
