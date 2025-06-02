<template>
    <div class="toolbox-container" @paste="handlePaste">
        <a-card title="工具箱" class="toolbox-card">
            <a-tabs v-model:activeKey="activeKey">
                <!-- Base64 转换工具 -->
                <a-tab-pane key="1" tab="Base64 转换">
                    <div class="tool-section">
                        <h3>文件转 Base64</h3>
                        <p class="paste-tip">您可以直接粘贴图片（Ctrl+V）到此区域</p>
                        <a-upload :file-list="fileList" :before-upload="beforeFileToBase64Upload"
                            @remove="handleFileToBase64Remove">
                            <a-button type="primary">
                                <upload-outlined /> 选择文件
                            </a-button>
                        </a-upload>
                        <div v-if="fileToBase64Result" class="result-container">
                            <a-alert type="success" message="转换成功" />
                            <a-textarea v-model:value="fileToBase64Result" :rows="6"
                                :auto-size="{ minRows: 3, maxRows: 10 }" readonly />
                            <a-button type="primary" @click="copyToClipboard(fileToBase64Result)">
                                <copy-outlined /> 复制到剪贴板
                            </a-button>
                        </div>
                    </div>

                    <a-divider />

                    <div class="tool-section">
                        <h3>Base64 转文件</h3>
                        <a-textarea v-model:value="base64ToFileInput" placeholder="请输入Base64编码" :rows="6"
                            :auto-size="{ minRows: 3, maxRows: 10 }" />
                        <div class="button-group">
                            <a-button type="primary" @click="convertBase64ToFile" :disabled="!base64ToFileInput">
                                <download-outlined /> 转换并下载
                            </a-button>
                            <a-input v-model:value="base64ToFileName" placeholder="文件名（含扩展名）"
                                style="width: 200px; margin-left: 8px;" />
                        </div>
                    </div>
                </a-tab-pane>

                <!-- 二维码工具 -->
                <a-tab-pane key="2" tab="二维码工具">
                    <div class="tool-section">
                        <h3>生成二维码</h3>
                        <a-input v-model:value="qrcodeContent" placeholder="请输入要生成二维码的内容" :rows="4"
                            :auto-size="{ minRows: 2, maxRows: 6 }" />
                        <div class="button-group">
                            <a-button type="primary" @click="generateQrcode" :disabled="!qrcodeContent">
                                <qrcode-outlined /> 生成二维码
                            </a-button>
                            <a-select v-model:value="qrcodeSize" style="width: 120px; margin-left: 8px;">
                                <a-select-option value="128">小 (128px)</a-select-option>
                                <a-select-option value="256">中 (256px)</a-select-option>
                                <a-select-option value="512">大 (512px)</a-select-option>
                            </a-select>
                        </div>
                        <div v-if="qrcodeImageUrl" class="qrcode-result">
                            <img :src="qrcodeImageUrl" :width="qrcodeSize" :height="qrcodeSize" />
                            <a-button type="primary" @click="downloadQrcode">
                                <download-outlined /> 下载二维码
                            </a-button>
                        </div>
                    </div>

                    <a-divider />

                    <div class="tool-section">
                        <h3>解析二维码</h3>
                        <p class="paste-tip">您可以直接粘贴二维码图片（Ctrl+V）到此区域</p>
                        <a-upload :file-list="qrcodeFileList" :before-upload="beforeQrcodeUpload"
                            @remove="handleQrcodeFileRemove">
                            <a-button type="primary">
                                <upload-outlined /> 上传二维码图片
                            </a-button>
                        </a-upload>
                        <div v-if="qrcodeDecodeResult" class="result-container">
                            <a-alert type="success" message="解析成功" />
                            <a-textarea v-model:value="qrcodeDecodeResult" :rows="4"
                                :auto-size="{ minRows: 2, maxRows: 6 }" readonly />
                            <a-button type="primary" @click="copyToClipboard(qrcodeDecodeResult)">
                                <copy-outlined /> 复制到剪贴板
                            </a-button>
                        </div>
                    </div>
                </a-tab-pane>

                <!-- Oracle长字符串转换工具 -->
                <a-tab-pane key="3" tab="Oracle长字符串转换">
                    <div class="tool-section">
                        <h3>Oracle长字符串转换</h3>
                        <p>将长字符串转换为Oracle TO_CLOB格式，适用于Oracle数据库中处理超长字符串</p>
                        <a-textarea v-model:value="oracleLongString" placeholder="请输入需要转换的长字符串" :rows="6"
                            :auto-size="{ minRows: 3, maxRows: 10 }" />
                        <div class="button-group">
                            <a-button type="primary" @click="convertToOracleClob" :disabled="!oracleLongString">
                                <code-outlined /> 转换
                            </a-button>
                            <a-input-number v-model:value="groupSize" :min="500" :max="10000" placeholder="分组大小"
                                style="width: 150px; margin-left: 8px;" />
                            <span style="margin-left: 8px;">分组大小</span>
                        </div>
                        <div v-if="oracleResult" class="result-container">
                            <a-alert type="success" message="转换成功" />
                            <a-textarea v-model:value="oracleResult" :rows="6" :auto-size="{ minRows: 3, maxRows: 10 }"
                                readonly />
                            <a-button type="primary" @click="copyToClipboard(oracleResult)">
                                <copy-outlined /> 复制到剪贴板
                            </a-button>
                        </div>
                    </div>
                </a-tab-pane>
            </a-tabs>
        </a-card>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { UploadOutlined, DownloadOutlined, CopyOutlined, QrcodeOutlined, CodeOutlined } from '@ant-design/icons-vue';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

// 当前激活的标签页
const activeKey = ref('1');

// Base64 转换相关
const fileList = ref([]);
const fileToBase64Result = ref('');
const base64ToFileInput = ref('');
const base64ToFileName = ref('download.txt');

// 二维码相关
const qrcodeContent = ref('');
const qrcodeSize = ref('256');
const qrcodeImageUrl = ref('');
const qrcodeFileList = ref([]);
const qrcodeDecodeResult = ref('');

// 文件转 Base64
// 文件转 Base64
const beforeFileToBase64Upload = (file) => {
    fileList.value = [file];
    fileToBase64Result.value = '';

    const reader = new FileReader();
    reader.onload = (e) => {
        // 移除 data:application/octet-stream;base64, 等前缀
        const base64String = e.target.result.split(',')[1];
        fileToBase64Result.value = base64String;
    };
    reader.readAsDataURL(file);

    return false; // 阻止自动上传
};

const handleFileToBase64Remove = () => {
    fileList.value = [];
    fileToBase64Result.value = '';
};

// Base64 转文件
const convertBase64ToFile = () => {
    try {
        // 检查是否是有效的 Base64
        const base64Regex = /^[A-Za-z0-9+/=]+$/;
        const base64String = base64ToFileInput.value.trim();

        if (!base64Regex.test(base64String)) {
            message.error('无效的 Base64 编码');
            return;
        }

        // 创建 Blob 对象
        const byteCharacters = atob(base64String);
        const byteArrays = [];

        for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
        }

        const byteArray = new Uint8Array(byteArrays);
        const blob = new Blob([byteArray]);

        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = base64ToFileName.value || 'download.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        message.success('文件已生成，正在下载...');
    } catch (error) {
        console.error('Base64 转文件失败:', error);
        message.error('转换失败，请检查 Base64 编码是否正确');
    }
};

// 生成二维码
const generateQrcode = async () => {
    try {
        const options = {
            width: parseInt(qrcodeSize.value),
            margin: 1,
            errorCorrectionLevel: 'H'
        };

        const dataUrl = await QRCode.toDataURL(qrcodeContent.value, options);
        qrcodeImageUrl.value = dataUrl;
    } catch (error) {
        console.error('生成二维码失败:', error);
        message.error('生成二维码失败');
    }
};

// 下载二维码图片
const downloadQrcode = () => {
    if (!qrcodeImageUrl.value) return;

    const link = document.createElement('a');
    link.href = qrcodeImageUrl.value;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// 解析二维码
// 解析二维码
const beforeQrcodeUpload = (file) => {
    qrcodeFileList.value = [file];
    qrcodeDecodeResult.value = '';

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // 创建 canvas 来处理图像
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, img.width, img.height);

            // 获取图像数据
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            // 使用 jsQR 解析二维码
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                qrcodeDecodeResult.value = code.data;
            } else {
                message.error('未能识别二维码，请尝试上传清晰的二维码图片');
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);

    return false; // 阻止自动上传
};

const handleQrcodeFileRemove = () => {
    qrcodeFileList.value = [];
    qrcodeDecodeResult.value = '';
};

// 复制到剪贴板
const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
        .then(() => {
            message.success('已复制到剪贴板');
        })
        .catch(() => {
            message.error('复制失败，请手动复制');
        });
};

// 处理粘贴事件
// 在 handlePaste 函数中添加对二维码标签页的支持
const handlePaste = (event) => {
    // 根据当前激活的标签页处理粘贴事件
    if (activeKey.value !== '1' && activeKey.value !== '2') return;

    const items = event.clipboardData && event.clipboardData.items;
    if (!items || !items.length) return;

    let file = null;

    // 检索剪贴板中的图片
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            file = items[i].getAsFile();
            break;
        }
    }

    // 如果找到图片文件，根据当前标签页处理它
    if (file) {
        if (activeKey.value === '1') {
            // 处理 Base64 转换
            fileList.value = [file];
            fileToBase64Result.value = '';

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64String = e.target.result.split(',')[1];
                fileToBase64Result.value = base64String;
                message.success('已从剪贴板粘贴并转换图片');
            };
            reader.readAsDataURL(file);
        } else if (activeKey.value === '2') {
            // 处理二维码解析
            qrcodeFileList.value = [file];
            qrcodeDecodeResult.value = '';

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // 创建 canvas 来处理图像
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    context.drawImage(img, 0, 0, img.width, img.height);

                    // 获取图像数据
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

                    // 使用 jsQR 解析二维码
                    const code = jsQR(imageData.data, imageData.width, imageData.height);

                    if (code) {
                        qrcodeDecodeResult.value = code.data;
                        message.success('已从剪贴板粘贴并解析二维码');
                    } else {
                        message.error('未能识别二维码，请尝试上传清晰的二维码图片');
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
};

// Oracle长字符串转换相关
const oracleLongString = ref('');
const oracleResult = ref('');
const groupSize = ref(2000); // 默认分组大小为2000

// Oracle长字符串转换函数
const convertToOracleClob = () => {
    try {
        if (!oracleLongString.value) {
            message.error('请输入需要转换的字符串');
            return;
        }

        // 将长字符串分割成多个子字符串
        const groups = splitStringToGroups(oracleLongString.value, groupSize.value);

        // 使用StringBuilder拼接处理后的字符串
        let result = '';

        for (let i = 0; i < groups.length; i++) {
            if (i === 0) {
                result += `(${groups[i]}')`;
            } else if (i === groups.length - 1) {
                result += `('${groups[i]})`;
            } else {
                result += `('${groups[i]}')`;
            }

            if (i !== groups.length - 1) {
                result += ' || TO_CLOB';
            }
        }

        // 输出最终结果
        oracleResult.value = 'TO_CLOB' + result;
        message.success('转换成功');
    } catch (error) {
        console.error('Oracle长字符串转换失败:', error);
        message.error('转换失败，请检查输入字符串');
    }
};

// 将原始字符串按照指定大小分组
const splitStringToGroups = (originalString, size) => {
    const groups = [];
    let start = 0;

    while (start < originalString.length) {
        const end = Math.min(start + size, originalString.length);
        groups.push(originalString.substring(start, end));
        start = end;
    }

    return groups;
};
</script>

<style scoped>
.toolbox-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.toolbox-card {
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
}

.tool-section {
    margin-bottom: 20px;
}

.tool-section h3 {
    margin-bottom: 16px;
    font-size: 16px;
    color: #333;
}

.button-group {
    margin-top: 16px;
    display: flex;
    align-items: center;
}

.result-container {
    margin-top: 16px;
}

.result-container .ant-alert {
    margin-bottom: 16px;
}

.result-container .ant-btn {
    margin-top: 8px;
}

.qrcode-result {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.qrcode-result img {
    margin-bottom: 16px;
    border: 1px solid #eee;
}

.paste-tip {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    font-style: italic;
}
</style>