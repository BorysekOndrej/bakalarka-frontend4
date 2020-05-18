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
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Add target Test Modal',
        to: '/addTargetTestModal',
      },

      {
        _name: 'CSidebarNavTitle',
        icon: 'cil-puzzle',
        _children: ['Reports'],
      },
      {
        _name: 'CSidebarNavItem',
        name: 'List of targets',
        to: '/listTargets',
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Login or register',
        to: '/login',
      },
      {
        _name: 'CSidebarNavItem',
        name: 'User profile',
        to: '/profile',
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Dashboard',
        to: '/dashboardcustom',
        icon: 'cil-speedometer',
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Single certificate',
        to: '/singlecertificate',
      },

    ]
  }
]