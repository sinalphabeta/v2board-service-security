declare class CaptchaPng {
  width: number
  height: number
  depth: number
  dispNumber: string
  widthAverage: number
  buffer: Buffer
  
  /**
   * 创建验证码图片
   * @param width 图片宽度
   * @param height 图片高度
   * @param dispNumber 验证码数字
   */
  constructor(width: number, height: number, dispNumber: number);
  
  index(x: number, y: number): number;
  
  /**
   * 设置颜色（RGBA格式）
   * @param r 红色通道 (0-255)
   * @param g 绿色通道 (0-255)
   * @param b 蓝色通道 (0-255)
   * @param a 透明度 (0-255)
   */
  color(r: number, g: number, b: number, a: number): void;
  
  /**
   * 获取Base64编码的图片数据
   */
  getBase64(): string;
  
  getDump(): string;
}

export = CaptchaPng;