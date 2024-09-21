import React from 'react';
import type { UploadProps } from 'antd';
import { CloseOutlined, FileUnknownOutlined, DownloadOutlined } from '@ant-design/icons';
import { Upload, message, Popconfirm } from "antd";
import { getRuntimeENV } from '@/utils';
import OSS from "ali-oss";
import * as service from './service';
import './index.less';

export const handleDownLoad = async (file: { uid: string }) => {
    const { success, data, msg }: any = await service.getDownloadUrl(file.uid);
    if (!success || !file.uid) message.error(msg || '获取文件地址失败，无法下载，请刷新页面重试');
    else if (data) {
        const url = JSON.parse(data).url;
        const a = document.createElement('a');
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

// 根据url或name获取后缀名
export const getStrSuffix = (str: string) => {
    let suffix = '';
    if (str) {
        suffix = str.substring(str.lastIndexOf('.') + 1);
    }
    return suffix;
};

// 自定义渲染附件列表参数类型
export type RenderFileListParamsType = {
    fileList: FileObjType[];
    uploadingFileList: FileObjType[];
    handleDelete: (file: FileObjType) => void;
    handleDownLoad: (file: FileObjType) => void;
    renderNoData: () => React.ReactNode;
    renderFileItem: (file: FileObjType) => React.ReactNode;
    renderFileList: (arg: {
        uploadingFileList: FileObjType[];
        fileList: FileObjType[];
        renderFileItem: (file: FileObjType) => React.ReactNode;
        noData: () => React.ReactNode;
    }) => React.ReactNode;
};

export type FileObjType = {
    id?: string;
    uid: string;
    fileName: string;
    status: 'done' | 'uploading' | 'fail';
    fileType: string;
    fileSize?: number;
    percent?: number;
    cancelUpload?: any;
    icon?: React.ReactNode;
};

const { Dragger } = Upload;
const APP_CODE = 'xpd-task-manage';
const allowFile = [
    'doc',
    'docx',
    'gif',
    'jpeg',
    'jpg',
    'png',
    'mp4',
    'pdf',
    'ppt',
    'pptx',
    'rar',
    'txt',
    'xls',
    'xlsx',
    'zip',
];

// 附件icon
export const getFileIcon = (file: FileObjType) => {
    if (allowFile.includes(getStrSuffix(file.fileName))) {
        return (
            <img
                style={{
                    width: 24,
                    height: 24,
                }}
                src={require(`./icons/upload-type/${getStrSuffix(file.fileName)}.png`)}
            />
        );
    } else return <FileUnknownOutlined rev={'false'} />;
};
interface PropsType {
    value?: any[]; // 文件列表
    closeEdit?: boolean; // 是否关闭编辑
    accept?: string; // 允许上传的文件类型
    reportParams?: any; // 上报附加参数
    showDownload?: boolean; // 是否显示下载按钮
    showDelete?: boolean; // 是否显示删除按钮
    clickName?: (arg: any) => void; // 点击文件名称回调(默认下载)
    onRemove?: (arg: any) => void; // 删除文件回调
    onChange?: (
        pa: (oldList: FileObjType[]) => {
            arg: FileObjType[];
            type: 'add' | 'delete' | 'err';
            changeFile: FileObjType;
        },
    ) => void; // 文件列表变化回调上传文件成功或失败回调
    // 自定义渲染附件列表
    renderFileList?: (arg: RenderFileListParamsType) => React.ReactNode;
    // 上传最大文件数量限制
    maxFileLen?: number;
    // 渲染提示语
    renderTips?: (arg: { maxFileLen?: number }) => React.ReactNode;
    // 进度条钩子
    progressHook?: (arg: { file: FileObjType; percent: number }) => void;
}

const OssUpload = (props: PropsType) => {
    const { maxFileLen, renderTips, progressHook } = props;
    // 正在上传的文件
    const [uploadingFile, setUploadingFile] = React.useState<FileObjType[]>([]);
    // 已上传的文件
    const [uploadedFile, setUploadedFile] = React.useState<FileObjType[]>(props.value || []);
    //文件上传参数
    const uploadProps: UploadProps = {
        name: 'file',
        maxCount: maxFileLen,
        accept: props.accept,
        multiple: true,
        showUploadList: false,
        customRequest: async (pa: any) => {
            const { file } = pa;
            if (file.size / 1024 / 1024 > 1024 * 2) {
                message.error('上传文件不能超过2GB');
                return;
            }
            try {
                // 上传中虚拟数据
                const newFile: FileObjType = {
                    uid: file.uid,
                    fileName: file.name,
                    status: 'uploading',
                    fileType: file.type,
                    percent: Math.round(0.01 * 100),
                };
                let flag = false;
                setUploadingFile((pre) => {
                    if (maxFileLen && pre.length >= maxFileLen) {
                        flag = true;
                        return pre;
                    }
                    return [...pre, newFile];
                });
                if (flag) return message.warn(`最多上传${maxFileLen}个文件`);
                // 获取签名
                const res: any = await service.getOssSign({
                    fileExtName: getStrSuffix(file.name),
                    storeLocation: 1,
                    appId: APP_CODE,
                });
                if (res) {
                    const { signedURL, ossKey, tempAccessKeyId, tempAccessKeySecret, bucket } = res;
                    const arr = signedURL.split('&');
                    const stsToken = decodeURIComponent(
                        arr
                            .find((el: string) => el.includes('security-token'))
                            .replace('security-token=', ''),
                    );
                    // 上传至oss
                    const obj = {
                        endpoint: 'https://oss-cn-hangzhou.aliyuncs.com',
                        accessKeyId: tempAccessKeyId,
                        accessKeySecret: tempAccessKeySecret,
                        stsToken,
                        bucket:
                            getRuntimeENV() === 'PROD' ? 'xp-xpd-experience' : 'xp-xpd-experience',
                    };
                    const client = new OSS(obj);
                    const stsInfo = await client.multipartUpload(ossKey, file, {
                        progress: (percentage: number) => {
                            // 更新进度
                            setUploadingFile((pre) => {
                                return pre.map((item: FileObjType) => {
                                    if (item.uid === file.uid)
                                        return { ...item, percent: Math.round(percentage * 100) };
                                    return item;
                                });
                            });
                        },
                        // cancelToken: new Promise((resolve, reject) => {
                        //     // 保存取消方法
                        //     setUploadingFile((pre) => {
                        //         return pre.map((item: FileObjType) => {
                        //             if (item.uid === file.uid)
                        //                 return { ...item, cancelUpload: reject };
                        //             return item;
                        //         });
                        //     });
                        // }),
                    });
                    if (stsInfo.res.status === 200) {
                        // 上报
                        const reportRes: any = await service.fileMapping({
                            ...(props.reportParams || {}),
                            fileId: '',
                            fileExtName: getStrSuffix(file.name),
                            fileName: file.name,
                            fileSize: file.size,
                            type: 0, // 0附件 1飞书
                            ossKey,
                            storeLocation: 1,
                            objectAcl: 1,
                            needPreview: 0,
                            // appId: localStorage.getItem('app_id'),
                            appId: APP_CODE,
                        });
                        const fileId = reportRes.data ? JSON.parse(reportRes.data).fileId : '';
                        if (reportRes.success) {
                            // 更新上传中文件
                            setUploadingFile((pre) => {
                                return pre.filter((item: FileObjType) => item.uid !== file.uid);
                            });
                            setUploadedFile((pre) => [
                                ...pre,
                                {
                                    ...file,
                                    uid: fileId,
                                    fileId: fileId,
                                    fileName: file.name,
                                    fileSize: file.size,
                                },
                            ]);
                            // 表单上传
                            const fileObj = {
                                uid: fileId,
                                fileName: file.name,
                                fileSize: file.size,
                                status: 'done',
                                fileExtName: getStrSuffix(file.name),
                                fileType: file.type,
                                fileId: fileId,
                                ossKey: ossKey,
                                appId: APP_CODE,
                            };
                            props.onChange?.((oldList) => {
                                return {
                                    arg: [...oldList, fileObj] as FileObjType[],
                                    type: 'add',
                                    changeFile: file,
                                };
                            });
                            message.success(file.name + '，上传成功');
                        } else {
                            setUploadingFile((pre) => {
                                return pre.filter((item: FileObjType) => item.uid !== file.uid);
                            });
                            // 表单上传
                            const fileObj = {
                                uid: fileId,
                                fileName: file.name,
                                status: 'fail',
                                fileType: file.type,
                            };
                            props.onChange?.((oldList) => {
                                return {
                                    arg: [...oldList, fileObj] as FileObjType[],
                                    type: 'err',
                                    changeFile: file,
                                };
                            });
                            message.error(file.name + '上传失败，请重试！' + (reportRes.msg || ''));
                        }
                    }
                } else {
                    setUploadingFile((pre) => {
                        return pre.filter((item: FileObjType) => item.uid !== file.uid);
                    });
                    message.error(file.name + '上传失败，请重试！' + (res.msg || ''));
                }
            } catch (e) {
                console.log(e, '上传失败');
                message.error(file.name + '上传失败，请重试！');
            }
        },
    };

    // 删除
    const handleDelete = async (file: any) => {
        if (file.cancelUpload) {
            file.cancelUpload();
            setUploadingFile((pre) => {
                return pre.filter((item: FileObjType) => item.uid !== file.uid);
            });
            message.info('已取消上传');
        } else {
            // 当前文件列表
            const _currentfileList = uploadedFile.filter(
                (item: FileObjType) => item.uid !== file.uid,
            );
            if (!!props.onChange) {
                props.onChange?.((oldList) => {
                    return {
                        arg: _currentfileList,
                        type: 'delete',
                        changeFile: file,
                    };
                });
            }
            if (!!props.onRemove) props.onRemove(file);
            setUploadedFile(_currentfileList);
        }
    };

    // 渲染暂无数据
    const renderNoData = () => {
        return (
            <div className="no-data-wrap">
                <div className="no-data-icon" />
                暂无数据
            </div>
        );
    };

    // 渲染单个文件
    const renderFileItemFn = (
        file: FileObjType,
        renderIcon?: (file: FileObjType) => React.ReactNode,
    ) => {
        return (
            <div className="file-box" key={file.uid ? file.uid : file.id}>
                <div className="icon-name">
                    {/* icon */}
                    {(renderIcon && renderIcon(file)) || getFileIcon(file)}
                    {/* 文件名 */}
                    <div
                        className="file-name"
                        onClick={() => {
                            if (!!props.clickName) props.clickName(file);
                            else handleDownLoad(file);
                        }}
                    >
                        {file.fileName}
                    </div>
                </div>
                <div className="file-operate">
                    {props.showDownload && (
                        <span className="operate-icon" onClick={() => handleDownLoad(file)}>
                            <DownloadOutlined rev={'false'} />
                        </span>
                    )}
                    {props.showDelete && !(file.status === 'uploading' && !file.cancelUpload) && (
                        <Popconfirm
                            title="确定删除该文件吗？"
                            onConfirm={() => handleDelete(file)}
                            okText="是"
                            cancelText="否"
                        >
                            <span className="operate-icon">
                                <CloseOutlined rev={'false'} />
                            </span>
                        </Popconfirm>
                    )}
                </div>
                {/* 进度条 */}
                {file.status === 'uploading' && (
                    <div className="progress">
                        <div className="progress-inner" style={{ width: file.percent + '%' }} />
                    </div>
                )}
            </div>
        );
    };

    // 渲染文件列表
    const renderFileListFn = (pa: {
        uploadingFileList: FileObjType[];
        fileList: FileObjType[];
        renderFileItem: (file: FileObjType) => React.ReactNode;
        noData: () => React.ReactNode;
    }) => {
        const { uploadingFileList, fileList, renderFileItem, noData } = pa;
        return (
            <div className="file-list">
                {uploadingFileList
                    .concat(fileList)
                    .map((file: FileObjType) => renderFileItem(file))}
                {!uploadingFileList.concat(fileList)?.length && noData()}
            </div>
        );
    };

    // 对已上传的文件进行处理
    const handleFileData = () => {
        return uploadedFile.map((file) => ({
            ...file,
            status: 'done',
            icon: getFileIcon(file),
        })) as FileObjType[];
    };

    return (
        <div className="pn-upload">
            {!props.closeEdit && (
                <Dragger
                    {...uploadProps}
                    disabled={
                        !!maxFileLen && !!props.value?.length && props.value?.length >= maxFileLen
                    }
                >
                    <div className="upload-icon" />
                    <div className="explain">点击或拖拽文件到此处上传</div>
                    {renderTips ? (
                        renderTips({ maxFileLen })
                    ) : (
                        <div className="tips">
                            ⽀持扩展名：word、jpg、pdf、png等，最多上传50份，单份文件仅限2GB以内
                        </div>
                    )}
                </Dragger>
            )}

            {/* 文件展示 */}
            {(!!props.renderFileList &&
                props.renderFileList({
                    fileList: handleFileData() || [],
                    uploadingFileList: uploadingFile || [],
                    handleDelete,
                    handleDownLoad,
                    renderNoData,
                    renderFileItem: renderFileItemFn,
                    renderFileList: renderFileListFn,
                })) ||
                renderFileListFn({
                    uploadingFileList: uploadingFile || [],
                    fileList: handleFileData() || [],
                    renderFileItem: renderFileItemFn,
                    noData: () => (<></>),
                })}
        </div>
    );
};

export default OssUpload;
