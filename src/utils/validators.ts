/**
 * 共享的输入验证工具
 * 用于结算面板、地址簿等所有需要表单验证的地方
 */

export interface PhoneValidationResult {
  ok: boolean;
  error?: string;
}

/**
 * 验证中国大陆手机号
 * 规则：1[3-9] 开头 + 9 位数字，共 11 位
 */
export function validatePhone(phone: string): PhoneValidationResult {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { ok: false, error: '请输入联系电话' };
  }
  if (!/^1[3-9]\d{9}$/.test(trimmed)) {
    return { ok: false, error: '请输入有效的 11 位手机号' };
  }
  return { ok: true };
}

/**
 * 验证邮箱
 */
export function validateEmail(email: string): PhoneValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { ok: false, error: '请输入邮箱' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: '邮箱格式不正确' };
  }
  return { ok: true };
}

/**
 * 验证姓名（必填且非空）
 */
export function validateName(name: string, fieldLabel = '姓名'): PhoneValidationResult {
  if (!name.trim()) {
    return { ok: false, error: `请输入${fieldLabel}` };
  }
  return { ok: true };
}

/**
 * 验证收货信息（含姓名/电话/地址）
 */
export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
}

export interface ShippingErrors {
  name?: string;
  phone?: string;
  address?: string;
}

export function validateShipping(info: ShippingInfo): ShippingErrors {
  const errors: ShippingErrors = {};
  const nameResult = validateName(info.name, '收货人姓名');
  if (!nameResult.ok) errors.name = nameResult.error;
  const phoneResult = validatePhone(info.phone);
  if (!phoneResult.ok) errors.phone = phoneResult.error;
  if (!info.address.trim()) {
    errors.address = '请输入详细收货地址';
  }
  return errors;
}
