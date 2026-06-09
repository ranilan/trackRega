import { supabase } from '@/lib/supabaseClient';
import budgetsSeed from '../../seed-data/Budget.json';
import categoriesSeed from '../../seed-data/Category.json';
import financialSourcesSeed from '../../seed-data/FinancialSource.json';
import transactionsSeed from '../../seed-data/Transaction.json';

const tableByEntity = {
  Budget: 'budgets',
  Category: 'categories',
  FinancialSource: 'financial_sources',
  Transaction: 'transactions',
};

const seedDataByEntity = {
  Budget: budgetsSeed,
  Category: categoriesSeed,
  FinancialSource: financialSourcesSeed,
  Transaction: transactionsSeed,
};

const localUser = {
  id: 'local-user',
  email: 'benygeula@gmail.com',
  full_name: 'TrackRega',
  role: 'admin',
  active_budget_group_name: budgetsSeed[0]?.budget_group_name,
};

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const randomId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const applyFilters = (query, filters = {}) => {
  return Object.entries(filters).reduce((currentQuery, [key, value]) => {
    if (value === undefined) return currentQuery;
    if (value === null) return currentQuery.is(key, null);
    return currentQuery.eq(key, value);
  }, query);
};

const matchesFilters = (item, filters = {}) => {
  return Object.entries(filters).every(([key, value]) => {
    if (value === undefined) return true;
    if (value === null) return item[key] === null || item[key] === undefined;
    return item[key] === value;
  });
};

const sortRows = (rows, sort) => {
  if (!sort) return rows;
  const ascending = !sort.startsWith('-');
  const column = ascending ? sort : sort.slice(1);

  return [...rows].sort((a, b) => {
    const left = a[column];
    const right = b[column];
    if (left === right) return 0;
    if (left === undefined || left === null) return 1;
    if (right === undefined || right === null) return -1;
  return (left > right ? 1 : -1) * (ascending ? 1 : -1);
  });
};

const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    throw new Error('User is not authenticated');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role, plan, access_status, active_budget_group_name')
    .eq('email', user.email)
    .maybeSingle();

  if (!profile) {
    await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
        avatar_url: user.user_metadata?.avatar_url,
        access_code_id: user.user_metadata?.access_code_id || null,
        plan: 'free',
        access_status: 'active',
        role: 'user',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' },
    );
  }

  const isConfiguredAdmin = adminEmails.includes(user.email.toLowerCase());

  return {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || user.user_metadata?.full_name || user.email,
    picture: profile?.avatar_url || user.user_metadata?.avatar_url,
    role: profile?.role || (isConfiguredAdmin ? 'admin' : 'user'),
    plan: profile?.plan || 'free',
    access_status: profile?.access_status || 'active',
    active_budget_group_name:
      profile?.active_budget_group_name || user.user_metadata?.active_budget_group_name,
  };
};

const getLocalRows = (entityName) => {
  const storageKey = `trackrega_${entityName}`;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore broken local cache and fall back to the original imported seed data.
  }

  return seedDataByEntity[entityName] ?? [];
};

const setLocalRows = (entityName, rows) => {
  localStorage.setItem(`trackrega_${entityName}`, JSON.stringify(rows));
};

const filterLocalRows = (entityName, filters, sort, limit) => {
  const rows = sortRows(getLocalRows(entityName).filter((item) => matchesFilters(item, filters)), sort);
  return limit ? rows.slice(0, limit) : rows;
};

const applySort = (query, sort) => {
  if (!sort) return query;
  const ascending = !sort.startsWith('-');
  const column = ascending ? sort : sort.slice(1);
  return query.order(column, { ascending });
};

export const createEntityClient = (entityName) => {
  const table = tableByEntity[entityName];

  if (!table) {
    throw new Error(`Unknown entity: ${entityName}`);
  }

  return {
    async filter(filters = {}, sort, limit) {
      let query = supabase.from(table).select('*');
      query = applyFilters(query, filters);
      query = applySort(query, sort);

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) {
        console.warn(`Using local ${entityName} export because Supabase is not ready yet.`, error);
        const localFilters = {
          ...filters,
          created_by: filters.created_by || localUser.email,
        };
        return filterLocalRows(entityName, localFilters, sort, limit);
      }
      return data ?? [];
    },

    async create(values) {
      const currentUser = await getCurrentUser();
      const now = new Date().toISOString();
      const payload = {
        id: values.id || randomId(),
        created_by: values.created_by || currentUser.email,
        created_date: values.created_date || now,
        updated_date: values.updated_date || now,
        ...values,
      };

      const { data, error } = await supabase.from(table).insert(payload).select('*').single();
      if (error) {
        const rows = [payload, ...getLocalRows(entityName)];
        setLocalRows(entityName, rows);
        return payload;
      }
      return data;
    },

    async bulkCreate(valuesList) {
      if (!Array.isArray(valuesList) || valuesList.length === 0) {
        return [];
      }

      const currentUser = await getCurrentUser();
      const now = new Date().toISOString();
      const payloads = valuesList.map((values) => ({
        id: values.id || randomId(),
        created_by: values.created_by || currentUser.email,
        created_date: values.created_date || now,
        updated_date: values.updated_date || now,
        ...values,
      }));

      const { data, error } = await supabase.from(table).insert(payloads).select('*');
      if (error) {
        const rows = [...payloads, ...getLocalRows(entityName)];
        setLocalRows(entityName, rows);
        return payloads;
      }
      return data ?? [];
    },

    async update(id, values) {
      const { data, error } = await supabase
        .from(table)
        .update({ ...values, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        const rows = getLocalRows(entityName).map((row) =>
          row.id === id ? { ...row, ...values, updated_date: new Date().toISOString() } : row,
        );
        setLocalRows(entityName, rows);
        return rows.find((row) => row.id === id);
      }
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        setLocalRows(entityName, getLocalRows(entityName).filter((row) => row.id !== id));
        return true;
      }
      return true;
    },
  };
};

export const User = {
  async me() {
    return getCurrentUser();
  },

  async login() {
    return getCurrentUser();
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async updateMyUserData(values) {
    const currentUser = await getCurrentUser();
    const payload = {
      id: currentUser.id,
      email: currentUser.email,
      full_name: values.full_name ?? currentUser.full_name,
      avatar_url: values.avatar_url ?? currentUser.picture,
      active_budget_group_name:
        values.active_budget_group_name ?? currentUser.active_budget_group_name,
      role: currentUser.role,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'email' })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },
};

export const entities = Object.fromEntries(
  Object.keys(tableByEntity).map((entityName) => [entityName, createEntityClient(entityName)]),
);
