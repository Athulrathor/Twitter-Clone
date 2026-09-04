export type AccountStatus = {
  deleteAt?: string | Date | null;
  deletedAt?: string | Date | null;
  isDeleted?: boolean;
  scheduledDeleteAt?: string | Date | null;
  restoreAt?: string | Date | null;
};
