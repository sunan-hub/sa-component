import CommonVirtualTable from "@/components/components/common-virtual-table";
import styles from "./index.less";
import { VirtualColumnsType } from "@/components/components/common-virtual-table/virtual-table/const";
import { useEffect, useState } from "react";

/** 测试性能表格组件 */
const VirtualTableTest = () => {
    /** 列配置 */
    const columns: VirtualColumnsType[] = [
        {
            title: "序号",
            dataIndex: "index",
            width: 60,
            fixed: "left",
            render: (text, record, index) => index,
        },
        {
            title: "姓名",
            dataIndex: "name",
            width: 120,
            fixed: "left",
            render: (text, record, index) => <div>ai{text}</div>,
        },
        { title: "性别", dataIndex: "sex", width: 120 },
        { title: "身高", dataIndex: "height", width: 120 },
        { title: "体重", dataIndex: "weight", width: 120 },
        { title: "住址", dataIndex: "address", width: 200 },
        { title: "爱好", dataIndex: "hobby", width: 200 },
        { title: "上班地址", dataIndex: "workingLocation ", width: 200 },
        { title: "工龄", dataIndex: "seniority", width: 120, fixed: "right" },
    ];
    /** 数据 */
    const [dataSource, setDataSource] = useState([]);
    /** 分组 */
    const [grouping, setGrouping] = useState<string>();

    useEffect(() => {
        const newArr: any = [];
        new Array(1000).fill(0).forEach((item, index) => {
            newArr.push({
                index,
                id: index,
                name: "孙安",
                sex: "男",
                height: 170,
                weight: 60.88,
                address: "海南省昌江黎族自治县昌华镇育才六巷3号",
                hobby: "喜欢钓鱼",
                workingLocation: "广州市",
                seniority: "3年",
            });
        });
        setDataSource(newArr);
    }, []);

    return (
        <div className={styles.virtualTableTestwrap}>
            <CommonVirtualTable
                fixedHeader
                headerHeight={40}
                columns={columns}
                dataSource={dataSource}
                rowHeight={40}
                scroll={{ x: "100%", y: 400 }}
                grouping={{
                    value: grouping,
                    onChange: (grouping) => {
                        setGrouping(grouping);
                    },
                }}
            />
        </div>
    );
};

export default VirtualTableTest;
