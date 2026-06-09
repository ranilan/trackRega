import { entities, User } from '@/entities/all';

export const base44 = {
  entities,
  auth: {
    me: User.me,
    login: User.login,
    logout: User.logout,
    redirectToLogin: User.login,
  },
};
