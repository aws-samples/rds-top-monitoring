import TopNavigation from '@cloudscape-design/components/top-navigation';
import { useNavigate } from 'react-router-dom';

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
      { type: 'button', id: 'preferences', text: 'Preferences' },
      {
        type: 'menu-dropdown',
        id: 'support-group',
        text: 'Support',
        items: [
          {
            id: 'documentation',
            text: 'Documentation',
            href: '#',
            external: true,
            externalIconAriaLabel: ' (opens in new tab)',
          },
          { id: 'feedback', text: 'Feedback', href: '#', external: true, externalIconAriaLabel: ' (opens in new tab)' },
          { id: 'support', text: 'Customer support' },
        ],
      },
      { type: 'button', id: 'signout', text: 'Disconnect' },
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



    
                                                