// Player titles are assigned in order: logins, nations, privileges
export const titles = {
  /** Pairs of login and title where the title is assigned to the specified login */
  logins: {
    'login': 'title'
  },
  /** Pairs of country and title where the title is assigned to every player from the specified country (country codes work too) */
  countries: {
    'country': 'title',
    'CODE': 'title' // country code
  },
  /** Pairs of privilege and title where the title is assigned to every player with the specified privilege level */
  privileges: {
    0: 'Player',
    1: 'Operator',
    2: 'Admin',
    3: 'Masteradmin',
    4: 'Server Owner'
  }
}