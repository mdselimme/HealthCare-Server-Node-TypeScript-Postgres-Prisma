export interface IOptions {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: string;
}

interface IOptionsResult {
  page: number;
  limit: number;
  sortBy: string;
  skip: number;
  sortOrder: string;
}

export const calculatePagination = (options: IOptions): IOptionsResult => {
  const page: number = Number(options.page) || 1;
  const limit: number = Number(options.limit) || 10;
  const skip: number = (Number(page) - 1) * limit;
  const sortBy: string = options.sortBy || "createdAt";
  const sortOrder: string = options.sortOrder || "desc";
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};
