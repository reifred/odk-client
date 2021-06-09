import faker from 'faker';
import { omit } from 'ramda';

import { dataStore, view } from './data-store';
import { fakePastDate } from '../util/date-time';
import { standardRoles } from './roles';

const verbsByRole = (system) => {
  if (system === 'none') return [];
  const role = standardRoles.sorted().find(r => r.system === system);
  if (role == null) throw new Error('role not found');
  return role.verbs;
};

export const extendedUsers = dataStore({
  factory: ({
    inPast,
    id,
    lastCreatedAt,

    displayName = faker.name.findName(),
    email = `${faker.random.uuid()}@getodk.org`,
    // Sitewide role
    role = 'admin',
    verbs = verbsByRole(role)
  }) => ({
    id,
    displayName,
    email,
    verbs,
    createdAt: inPast
      ? fakePastDate([lastCreatedAt])
      : new Date().toISOString(),
    updated: null
  }),
  sort: (administrator1, administrator2) =>
    administrator1.email.localeCompare(administrator2.email)
});

export const standardUsers = view(extendedUsers, omit(['verbs']));

// Deprecated.
export const administrators = standardUsers;
