import { ShowNodeDataType } from "./js_plumb_mixins";

/** 根据y从上到下，同一层级再根据levelSort排序从左到右 */
export const sortData = (pa: {
    dataList: ShowNodeDataType[];
    levelSort?: (a: any, b: any) => number;
}) => {
    const { dataList, levelSort } = pa;
    const newData = [...dataList];
    // 先根据y坐标排序
    newData.sort((a, b) => a.y - b.y);
    // 拆分成多个层级
    const levelMap: Record<string, ShowNodeDataType[]> = {};
    newData.forEach((item) => {
        if (!levelMap[item.y]) levelMap[item.y] = [];
        levelMap[item.y].push(item);
    });
    // 每层再根据levelSort排序
    if (levelSort)
        Object.keys(levelMap).forEach((key) => {
            levelMap[key].sort((a, b) => levelSort(a, b));
        });
    // 拼接成新的数组
    const result: ShowNodeDataType[] = [];
    Object.keys(levelMap).forEach((key) => {
        result.push(...levelMap[key]);
    });
    return result;
};
