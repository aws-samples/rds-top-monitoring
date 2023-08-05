
export const configuration = 
{
    "apps-settings": {
        "refresh-interval": 10*1000,
        "refresh-interval-clw": 10*1000,
        "api_url": "",
        "version" : "0.1.0",
        "application_title": "RDSTop Monitoring"
    }
};

export const SideMainLayoutHeader = { text: 'Service', href: '#/' };

export const SideMainLayoutMenu = [
    {
      text: 'Explore resources',
      type: 'section',
      defaultExpanded: true,
      items: [
        { type: 'link', text: 'Home', href: '/' },
        { type: 'link', text: 'Instances', href: '/login' },
        { type: 'link', text: 'Settings', href: '/settings' },
        { type: 'link', text: 'Logout', href: '/logout' }
      ],
    }
  ];


export const breadCrumbs = [{text: 'Service',href: '#',},{text: 'Resource search',href: '#',},];
  