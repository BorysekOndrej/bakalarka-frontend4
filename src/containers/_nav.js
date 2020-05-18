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
        _name: 'CSidebarNavTitle',
        icon: 'cil-puzzle',
        _children: ['Reports'],
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Dashboard',
        to: '/dashboardcustom',
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
        name: 'Login or register',
        to: '/login',
      },
    ]
  }
]