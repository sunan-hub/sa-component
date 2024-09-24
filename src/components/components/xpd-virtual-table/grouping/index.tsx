import { useEffect, useState } from 'react';
import { Tooltip, Select } from 'antd';
import styles from './index.less';

/** 分组组件属性 */
type GroupingPropsType = {
  columns: Columns;
  value?: string;
  onChange: (grouping?: string) => void;
};

/** 分组组件属性 */
type Columns = {
  title: React.ReactNode;
  dataIndex: string;
}[];

/** 获取展示内容 */
const getShowContent = (columns: Columns, grouping?: string) => {
  let text = '分组';
  const column = columns.find((item) => item.dataIndex === grouping);
  if (column) text += ' · ' + column.title;
  return text;
};

/** 分组组件 */
const Grouping = (props: GroupingPropsType) => {
  const { value, columns, onChange } = props;

  // 是否显示筛选弹窗
  const [open, setOpen] = useState(false);
  // 分组的字段
  const [grouping, setGrouping] = useState<string>();

  // 清空分组
  const clearGrouping = () => {
    setGrouping(undefined);
    onChange();
  };

  // 筛选弹窗
  const showFilterModalContent = (
    <div className={styles.groupingWrap}>
      {/* 头部 */}
      <div className={styles.title}>
        设置分组条件
        <div className={styles.infoIcon} />
      </div>
      <div className={`${styles.contentWrap} input-border-radius`}>
        <Select
          value={grouping}
          placeholder="请选择分组字段"
          style={{ width: 200 }}
          dropdownStyle={{ zIndex: 9999 }}
          onChange={(value) => {
            setGrouping(value);
            onChange(value);
          }}
          options={columns.map((item) => ({
            label: item.title,
            value: item.dataIndex,
          }))}
        />
        <div className={styles.deleteIcon} onClick={clearGrouping} />
      </div>
      <div className={styles.clearAll} onClick={clearGrouping}>
        清空全部条件
      </div>
    </div>
  );

  // 打开弹窗
  const showGroupingModal = () => {
    setOpen(true);
  };

  useEffect(() => {
    setGrouping(value);
  }, [value]);

  return (
    <Tooltip
      open={open}
      placement="bottomLeft"
      color="#fff"
      title={showFilterModalContent}
      trigger={['click']}
      onOpenChange={(state) => setOpen(state)}
      getPopupContainer={(triggerNode) => triggerNode}
      overlayStyle={{
        zIndex: 9998,
        maxWidth: 'max-content',
        cursor: 'default',
      }}
    >
      <div
        onClick={showGroupingModal}
        className={`${styles.btn} ${grouping ? styles.active : ''}`}
      >
        <div className={styles.groupingIcon} />
        <div className={styles.text}>{getShowContent(columns, grouping)}</div>
      </div>
    </Tooltip>
  );
};

export default Grouping;
