import request from '@/common/request';
import Qs from 'qs';
const service = '';

// 通过启明链接下载附件，获取下载地址
export async function getDownloadUrl(fileId: string) {
    const res = await request.get(`${service}/oss/file/download`, {
        params: { fileId },
    });
    return res;
}

// 获取oss上传签名链接
// @Parameter(name = "fileExtName", example = ".txt,.jpg", description = "文件扩展名，不同文件用不同的扩展名.txt,.jpg"),
// @Parameter(name = "storeLocation", example = "1", description = "存储环境 1存储到阿里云 2存储到Amazon S3"),
// @Parameter(name = "appCode", example = "workflow", description = "appCode"),
export async function getOssSign(params: {
    fileExtName: string;
    storeLocation?: number;
    appId?: string;
    objectAcl?: number;
    businessDirectory?: string;
}) {
    const res = await request.post(`${service}/oss/file/generateSignedUrl`, Qs.stringify(params), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }
    });
    return res;
}

// 附件上传后，上报附件信息获取启明链接
// @Parameter(name = "fileExtName", example = ".txt,.jpg", description = "文件扩展名，不同文件用不同的扩展名.txt,.jpg"),
// @Parameter(name = "storeLocation", example = "1", description = "存储环境 1存储到阿里云 2存储到Amazon S3"),
// @Parameter(name = "appCode", example = "workflow", description = "appCode"),
// @Parameter(name = "objectAcl", example = "1", description = "文件权限：1 集成bucket，2 私有，3公共读（当文件不需授权可以访问时，设置为3），4公共读写"),
// @Parameter(name = "businessDirectory", description = "指定上传目录，默认放在appcode/日期/businessDirectory/时间目录下面"),
// @Parameter(name = "useIntranet", description = "是否使用内容上传，适合服务器上传文件，不适合前端上传"),
export async function fileMapping(params: any) {
    const data = { ...params, fileName: params.fileName?.replaceAll(/[%\|[\]{}]/g, '') };
    const res = await request.post(`${service}/oss/file/uploadByGenerateUrl`, data);
    return res;
}
