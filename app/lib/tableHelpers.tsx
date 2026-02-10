import { Empty } from "antd";

export const emptyStateConfig = {
  emptyText: (
    <Empty
      description="No data found"
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  ),
};

export const getEmptyState = (description: string) => ({
  emptyText: (
    <Empty
      description={description}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  ),
});


