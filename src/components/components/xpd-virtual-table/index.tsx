import type { FilterListType, LogicOperatorType } from './dynamic-filter/const';
import type { VirtualTablePropsType } from './virtual-table/const';
import Grouping from './grouping';
import VirtualTable from './virtual-table';
import GroupVirtualTable from './virtual-table/group-table';
import styles from './index.less';

/** XPD表格属性 */
export type XpdTablePropsType = VirtualTablePropsType & {
  filter?: {
    /** 筛选条件发生变化回调 */
    onChange?: (
      filterList: FilterListType[],
      logicalOperator: LogicOperatorType,
    ) => void;
  };
  grouping?: {
    /** 分组值 */
    value?: string;
    /** 分组字段发生变化回调 */
    onChange?: (grouping?: string) => void;
  };
};

/** XPD表格 */
const XpdVirtualTable = (props: XpdTablePropsType) => {
  return (
    <div className={styles['xpd-table-wrap']}>
      <div className={styles.header}>
        {props.filter && null}
        {props.grouping && (
          <Grouping
            columns={props.columns}
            value={props.grouping.value}
            onChange={props.grouping.onChange || (() => {})}
          />
        )}
      </div>
      {(props.grouping?.value && (
        <GroupVirtualTable {...props} groupField={props.grouping.value} />
      )) || <VirtualTable {...props} />}
    </div>
  );
};

export default XpdVirtualTable;
