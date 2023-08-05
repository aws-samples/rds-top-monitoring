import TopNavigation from '@cloudscape-design/components/top-navigation';
import { useNavigate } from 'react-router-dom';
import { configuration } from '../pages/Configs';

export default function App({sessionInformation,onClickMenu, onClickDisconnect}) {

    //-- Navigate Component
    const navigate = useNavigate();
    
    //-- Navigation settings
    const i18nStrings = {
      searchIconAriaLabel: 'Search',
      searchDismissIconAriaLabel: 'Close search',
      overflowMenuTriggerText: 'More',
      overflowMenuTitleText: 'All',
      overflowMenuBackIconAriaLabel: 'Back',
      overflowMenuDismissIconAriaLabel: 'Close menu',
    };

    //-- Navigate Profiling
    const profileActions = [
      { type: 'button', id: 'profile', text: 'SessionID : ' + sessionInformation["session_id"]},
      { id: 'version', text: 'AppVersion : ' + configuration["apps-settings"]["version"]},
      { type: 'button', id: 'preferences', text: 'Preferences' },
      {
        type: 'menu-dropdown',
        id: 'support-group',
        text: 'Support',
        items: [
          {id: 'documentation',text: 'Documentation'},
          { id: 'feedback', text: 'Feedback'},
          { id: 'support', text: 'Customer support' },
        ],
      }
    ];
    
   
   
  return (
    <TopNavigation
          i18nStrings={i18nStrings}
          identity={{
            href: '#',
            title: 'RDSTop Monitoring Solution'
          }}
          
          utilities={[
            {
              type: 'button',
              iconName: 'notification',
              ariaLabel: 'Notifications',
              badge: true,
              disableUtilityCollapse: true,
            },
            { type: 'button', iconName: 'settings', title: 'Settings', ariaLabel: 'Settings' },
            {
              type: 'menu-dropdown',
              text: sessionInformation["rds_user"] + " : " + sessionInformation["rds_id"] + " (" + sessionInformation["rds_engine"] + ")",
              iconName: 'user-profile',
              items: profileActions,
              onItemClick : onClickMenu
            },
            {
              type: 'button',
              text: 'Disconnect',
              onClick : onClickDisconnect,
              variant : "primary-button"
            },
          ]}
        />

  );
}



    
                                                