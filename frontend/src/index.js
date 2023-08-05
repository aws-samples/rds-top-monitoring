import { render } from "react-dom";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

//-- Libraries
import '@cloudscape-design/global-styles/index.css';
import { Amplify } from "aws-amplify";
import { AmplifyProvider, Authenticator } from "@aws-amplify/ui-react";
import { StrictMode } from "react";
import Axios from "axios";

//-- Pages
import Authentication from "./pages/Authentication";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import SmMysql01 from "./pages/Sm-mysql-01";
import SmMysql02 from "./pages/Sm-mysql-02";
import SmPostgresql01 from "./pages/Sm-postgresql-01";
import SmPostgresql02 from "./pages/Sm-postgresql-02";

//-- Components
import ProtectedDb from "./components/ProtectedDb";
import ProtectedApp from "./components/ProtectedApp";

//import { applyMode,  Mode } from '@cloudscape-design/global-styles';

// Apply a color mode
//applyMode(Mode.Dark);
//applyMode(Mode.Light);



Axios.get(`/aws-exports.json`,).then((data)=>{

    var configData = data.data;
    Amplify.configure({
                    Auth: {
                      region: configData.aws_region,
                      userPoolId: configData.aws_cognito_user_pool_id,
                      userPoolWebClientId: configData.aws_cognito_user_pool_web_client_id,
                    },
    });
                  
    const rootElement = document.getElementById("root");
    render(
      <StrictMode>
        <AmplifyProvider>
          <Authenticator.Provider>
              <BrowserRouter>
                <Routes>
                    <Route path="/" element={<ProtectedApp><Home /> </ProtectedApp>} />
                    <Route path="/authentication" element={<Authentication />} />
                    <Route path="/login" element={<ProtectedApp><Login /> </ProtectedApp>} />
                    <Route path="/logout" element={<ProtectedApp><Logout /> </ProtectedApp>} />
                    <Route path="/sm-mysql-01" element={<ProtectedApp><ProtectedDb> <SmMysql01 /> </ProtectedDb> </ProtectedApp>}  />
                    <Route path="/sm-mysql-02" element={<ProtectedApp><ProtectedDb> <SmMysql02 /></ProtectedDb> </ProtectedApp>} />
                    <Route path="/sm-postgresql-01" element={<ProtectedApp><ProtectedDb> <SmPostgresql01 /></ProtectedDb> </ProtectedApp>} />
                    <Route path="/sm-postgresql-02" element={<ProtectedApp><ProtectedDb> <SmPostgresql02 /></ProtectedDb> </ProtectedApp>} />
                </Routes>
              </BrowserRouter>
          </Authenticator.Provider>
        </AmplifyProvider>
      </StrictMode>,
      rootElement
    );

})
.catch((err) => {
    console.log('API Call error : ./aws-exports.json' );
    console.log(err)
});
              
              

