export default [
  {
    _name: 'CSidebarNav',
    _children: [
      {
        _name: 'CSidebarNavTitle',
        icon: 'cil-puzzle',
        _children: ['Actions'],
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Add target',
        to: '/addTarget',
        icon: 'cil-cursor',
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Add target - Super Easy Mode',
        to: '/addTargetSuperEasyMode',
        icon: 'cil-cursor',
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Certificate Transparency',
        to: '/certificateTransparency',
        icon: 'cil-cursor',
      },

      {
        _name: 'CSidebarNavTitle',
        icon: 'cil-puzzle',
        _children: ['Reports'],
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Dashboard',
        to: '/dashboard',
        icon: 'cil-speedometer',
      },
      {
        _name: 'CSidebarNavItem',
        name: 'List of targets',
        to: '/listTargets',
        icon: 'cil-grid',
      },
      {
        _name: 'CSidebarNavItem',
        name: 'List of certificates',
        to: '/certificatesTable',
        icon: 'cil-grid',
      },
    ]
  }
]