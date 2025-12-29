// === Allowed fields for sorting ===
export const USER_SORTING_FILEDS = {
  id: "id",
  first_name: "first_name",
  last_name: "last_name",
  last_login_date: "last_login_date",
  status: "status",
  email: "email",
  created_at: "created_at",
  full_name: "full_name",
};

export const ALLOW_SORTED_FIELDS = Object.values(USER_SORTING_FILEDS);

export const ALLOWED_ADDITIONAL_STATUS_FILTER = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};
