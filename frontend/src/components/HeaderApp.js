import TopNavigation from '@cloudscape-design/components/top-navigation';
import { Authenticator } from "@aws-amplify/ui-react";
import { configuration } from '../pages/Configs';

export default function App() {

    const i18nStrings = {
      searchIconAriaLabel: 'Search',
      searchDismissIconAriaLabel: 'Close search',
      overflowMenuTriggerText: 'More',
      overflowMenuTitleText: 'All',
      overflowMenuBackIconAriaLabel: 'Back',
      overflowMenuDismissIconAriaLabel: 'Close menu',
    };

    const profileActions = [
      { type: 'button', id: 'profile', text: 'AppVersion : ' + configuration["apps-settings"]["version"]},
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
      { type: 'button', id: 'signout', text: 'Sign out' },
    ];
    
   
  return (
    
    
    <Authenticator >
          {({ signOut, user }) => (
            
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
                  text:  user.signInUserSession.idToken.payload.email,
                  iconName: 'user-profile',
                  items: profileActions,
                  onItemClick : signOut
                },
                {
                  type: 'button',
                  text: 'Sign out',
                  onClick : signOut,
                  variant : "primary-button"
                },
              ]}
            />
        
        
          )}
          
    </Authenticator>

  );
}



    
                                                