/**
 * ÉCLAT - 用户认证系统
 * 处理用户注册、登录、登出和个人资料管理
 */

// ===== 认证状态管理 =====
const authStore = {
  user: null,
  token: null,
  isAuthenticated: false,

  init() {
    // 从 localStorage 恢复认证状态
    const savedToken = localStorage.getItem('eclat_token');
    const savedUser = localStorage.getItem('eclat_user');

    if (savedToken && savedUser) {
      this.token = savedToken;
      this.user = JSON.parse(savedUser);
      this.isAuthenticated = true;
      this.updateUI();
    }

    // 验证 token 是否有效
    if (this.token) {
      this.verifyToken();
    }
  },

  async verifyToken() {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      if (!response.ok) {
        this.logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  },

  async login(email, password) {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        this.user = data.user;
        this.token = data.token;
        this.isAuthenticated = true;
        localStorage.setItem('eclat_token', this.token);
        localStorage.setItem('eclat_user', JSON.stringify(this.user));
        this.updateUI();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: '网络错误，请稍后重试' };
    }
  },

  async register(name, email, password) {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      return { success: false, message: '网络错误，请稍后重试' };
    }
  },

  async logout() {
    try {
      if (this.token) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('eclat_token');
      localStorage.removeItem('eclat_user');
      this.updateUI();
    }
  },

  updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const authButtons = document.querySelectorAll('.auth-buttons');

    if (this.isAuthenticated && this.user) {
      // 显示用户菜单，隐藏登录/注册按钮
      authButtons.forEach(btn => {
        btn.classList.remove('logged-in');
        btn.classList.add('logged-out');
      });

      if (userMenu) {
        userMenu.classList.add('logged-in');
        if (userName) {
          userName.textContent = this.user.name;
        }
      }

      if (loginBtn) loginBtn.style.display = 'none';
      if (registerBtn) registerBtn.style.display = 'none';
    } else {
      // 显示登录/注册按钮，隐藏用户菜单
      authButtons.forEach(btn => {
        btn.classList.remove('logged-out');
        btn.classList.add('logged-in');
      });

      if (userMenu) {
        userMenu.classList.remove('logged-in');
      }

      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (registerBtn) registerBtn.style.display = 'inline-flex';
    }
  }
};

// ===== 模态窗口管理 =====
function openAuthModal(type) {
  const overlay = document.getElementById(`${type}Modal`);
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAuthModal(type) {
  const overlay = document.getElementById(`${type}Modal`);
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';

    // 清除表单
    const form = overlay.querySelector('form');
    if (form) form.reset();

    // 隐藏错误消息
    const errorDiv = overlay.querySelector('.auth-form-error');
    if (errorDiv) {
      errorDiv.classList.remove('show');
    }

    // 隐藏成功/错误消息
    const messageDiv = overlay.querySelector('.auth-message');
    if (messageDiv) {
      messageDiv.classList.remove('show');
    }
  }
}

// ===== 表单验证 =====
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  if (input) input.classList.add('error');
  if (error) {
    error.textContent = message;
    error.classList.add('show');
  }
}

function hideError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  if (input) input.classList.remove('error');
  if (error) {
    error.classList.remove('show');
  }
}

function showMessage(modalId, message, type = 'error') {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const messageDiv = modal.querySelector('.auth-message');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `auth-message ${type} show`;
  }
}

// ===== 登录处理 =====
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  // 验证
  let hasError = false;

  if (!email) {
    showError('loginEmail', 'loginEmailError', '请输入邮箱');
    hasError = true;
  } else if (!validateEmail(email)) {
    showError('loginEmail', 'loginEmailError', '邮箱格式不正确');
    hasError = true;
  }

  if (!password) {
    showError('loginPassword', 'loginPasswordError', '请输入密码');
    hasError = true;
  }

  if (hasError) return;

  // 登录
  const result = await authStore.login(email, password);

  if (result.success) {
    showMessage('loginModal', result.message, 'success');
    setTimeout(() => {
      closeAuthModal('login');
      showSuccess('登录成功！欢迎回来');
    }, 1000);
  } else {
    showMessage('loginModal', result.message, 'error');
  }
}

// ===== 注册处理 =====
async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;

  // 验证
  let hasError = false;

  if (!name) {
    showError('registerName', 'registerNameError', '请输入姓名');
    hasError = true;
  }

  if (!email) {
    showError('registerEmail', 'registerEmailError', '请输入邮箱');
    hasError = true;
  } else if (!validateEmail(email)) {
    showError('registerEmail', 'registerEmailError', '邮箱格式不正确');
    hasError = true;
  }

  if (!password) {
    showError('registerPassword', 'registerPasswordError', '请输入密码');
    hasError = true;
  } else if (password.length < 6) {
    showError('registerPassword', 'registerPasswordError', '密码至少6位');
    hasError = true;
  }

  if (!confirmPassword) {
    showError('registerConfirmPassword', 'registerConfirmPasswordError', '请确认密码');
    hasError = true;
  } else if (password !== confirmPassword) {
    showError('registerConfirmPassword', 'registerConfirmPasswordError', '两次密码不一致');
    hasError = true;
  }

  if (hasError) return;

  // 注册
  const result = await authStore.register(name, email, password);

  if (result.success) {
    showMessage('registerModal', result.message, 'success');
    setTimeout(() => {
      closeAuthModal('register');
      // 自动打开登录模态窗口
      setTimeout(() => openAuthModal('login'), 300);
      showSuccess('注册成功！请登录');
    }, 1000);
  } else {
    showMessage('registerModal', result.message, 'error');
  }
}

// ===== 登出处理 =====
async function handleLogout() {
  await authStore.logout();
  showInfo('已登出');
}

// ===== 初始化 =====
function initAuth() {
  // 初始化认证状态
  authStore.init();

  // 登录表单实时验证
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');

  if (loginEmail) {
    loginEmail.addEventListener('input', () => hideError('loginEmail', 'loginEmailError'));
  }
  if (loginPassword) {
    loginPassword.addEventListener('input', () => hideError('loginPassword', 'loginPasswordError'));
  }

  // 注册表单实时验证
  const registerName = document.getElementById('registerName');
  const registerEmail = document.getElementById('registerEmail');
  const registerPassword = document.getElementById('registerPassword');
  const registerConfirmPassword = document.getElementById('registerConfirmPassword');

  if (registerName) {
    registerName.addEventListener('input', () => hideError('registerName', 'registerNameError'));
  }
  if (registerEmail) {
    registerEmail.addEventListener('input', () => hideError('registerEmail', 'registerEmailError'));
  }
  if (registerPassword) {
    registerPassword.addEventListener('input', () => {
      hideError('registerPassword', 'registerPasswordError');
      if (registerConfirmPassword && registerConfirmPassword.value) {
        hideError('registerConfirmPassword', 'registerConfirmPasswordError');
      }
    });
  }
  if (registerConfirmPassword) {
    registerConfirmPassword.addEventListener('input', () => hideError('registerConfirmPassword', 'registerConfirmPasswordError'));
  }

  // 点击模态窗口外部关闭
  document.querySelectorAll('.auth-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        const modalId = overlay.id;
        const type = modalId.replace('Modal', '');
        closeAuthModal(type);
      }
    });
  });

  // ESC 键关闭模态窗口
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.auth-modal-overlay.active');
      if (activeModal) {
        const modalId = activeModal.id;
        const type = modalId.replace('Modal', '');
        closeAuthModal(type);
      }
    }
  });
}

// DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
