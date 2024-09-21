import XpdVirtualTable from '@/components/components/xpd-virtual-table';
import styles from './index.less';
import { VirtualColumnsType } from '@/components/components/xpd-virtual-table/virtual-table/const';
import { useEffect, useState } from 'react';

/** 测试性能表格组件 */
const VirtualTableTest = () => {
    /** 列配置 */
    const columns: VirtualColumnsType[] = [
        {
            title: '序号', dataIndex: 'index', width: 60,
            render: (text, record, index) => index
        },
        {
            title: '姓名', dataIndex: 'name', width: 120,
            render: (text, record, index) => <div>ai{text}</div>
        },
        { title: '性别', dataIndex: 'sex', width: 120 },
        { title: '身高', dataIndex: 'height', width: 120 },
        { title: '体重', dataIndex: 'weight', width: 120 },
        { title: '住址', dataIndex: 'address', width: 200 },
        { title: '爱好', dataIndex: 'hobby', width: 200 },
        { title: '上班地址', dataIndex: 'workingLocation ', width: 200 },
        { title: '工龄', dataIndex: 'seniority', width: 120 },
    ]
    /** 数据 */
    const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        const newArr = [];
        new Array(1000).fill(0).forEach((item, index) => {
            newArr.push({
                id: index,
                name: "孙安",
                sex: "男",
                height: 170,
                weight: 60.88,
                address: "海南省昌江黎族自治县昌华镇育才六巷3号",
                hobby: "喜欢钓鱼",
                workingLocation: "广州市",
                seniority: "3年",
            })
        })
    }, []);

    return <div className={styles.virtualTableTestwrap}>
        <XpdVirtualTable
            columns={columns}
            dataSource={dataSource}
            rowHeight={40}
            scroll={{ y: 400 }}
        />
    </div>
}

export default VirtualTableTest;