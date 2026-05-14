/**
 * ÉCLAT - 产品数据加载模块
 * 从 API 动态加载产品数据并渲染到页面
 */

const ProductStore = {
  products: [],
  currentPage: 1,
  limit: 12,
  totalPages: 1,
  currentCategory: 'all',
  currentSort: 'default',
  searchQuery: '',

  // 加载产品数据
  async loadProducts(page = 1, category = 'all', sort = 'default', search = '') {
    try {
      this.currentPage = page;
      this.currentCategory = category;
      this.currentSort = sort;
      this.searchQuery = search;

      // 显示加载状态
      this.showLoading(true);

      // 构建 API URL
      let url = `/api/products?page=${page}&limit=${this.limit}`;
      if (category && category !== 'all') url += `&category=${category}`;
      if (sort && sort !== 'default') url += `&sort=${sort}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        this.products = data.products;
        this.totalPages = data.pagination.totalPages;
        this.renderProducts(data.products);
        this.renderPagination(data.pagination);
      } else {
        this.showError('加载产品失败');
      }
    } catch (error) {
      console.error('Load products error:', error);
      this.showError('网络错误，请稍后重试');
    } finally {
      this.showLoading(false);
    }
  },

  // 渲染产品列表
  renderProducts(products) {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;

    // 清空现有内容
    grid.innerHTML = '';

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.4;">🛍️</div>
          <p>未找到相关产品</p>
        </div>
      `;
      return;
    }

    // 渲染每个产品
    products.forEach(product => {
      const card = this.createProductCard(product);
      grid.appendChild(card);
    });

    // 添加动画效果
    this.animateCards();
  },

  // 创建产品卡片
  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;

    const isNewTag = product.isNew ? '<span class="product-tag">新品</span>' : '';
    const isBestsellerTag = product.isBestseller ? '<span class="product-tag">畅销</span>' : '';
    const originalPrice = product.originalPrice
      ? `<span style="text-decoration: line-through; color: var(--text-dim); font-size: 0.9rem; margin-right: 0.5rem;">¥${product.originalPrice.toLocaleString()}</span>`
      : '';

    card.innerHTML = `
      <div class="product-img">
        <img src="${product.img}" alt="${product.name}" loading="lazy">
        ${isNewTag}
        ${isBestsellerTag}
        <div class="product-quick-view" onclick="openPreview('${product.id}')">
          <span>快速预览</span>
          <span>👁️</span>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${this.getCategoryName(product.category)}</div>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-footer">
          <div>
            <div class="product-price">
              ${originalPrice}
              ¥${product.price.toLocaleString()}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 0.3rem;">
              ⭐ ${product.rating} (${product.reviews} 评价)
            </div>
          </div>
          <button class="wish-btn" onclick="toggleWishlist('${product.id}')">♡</button>
          <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">🛒</button>
        </div>
      </div>
    `;

    // 点击卡片打开预览
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.wish-btn') && !e.target.closest('.add-to-cart-btn')) {
        openPreview(product.id);
      }
    });

    return card;
  },

  // 获取分类名称
  getCategoryName(category) {
    const names = {
      'jewelry': '珠宝',
      'perfume': '香水',
      'bag': '手袋'
    };
    return names[category] || category;
  },

  // 渲染分页
  renderPagination(pagination) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    if (pagination.totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let html = `
      <button class="page-btn" onclick="ProductStore.goToPage(${pagination.page - 1})" ${pagination.page <= 1 ? 'disabled' : ''}>‹</button>
      <div class="page-numbers">
    `;

    for (let i = 1; i <= pagination.totalPages; i++) {
      if (i === 1 || i === pagination.totalPages || Math.abs(i - pagination.page) <= 2) {
        html += `<button class="page-number ${i === pagination.page ? 'active' : ''}" onclick="ProductStore.goToPage(${i})">${i}</button>`;
      } else if (Math.abs(i - pagination.page) === 3) {
        html += `<span style="color: var(--text-dim);">...</span>`;
      }
    }

    html += `
      </div>
      <button class="page-btn" onclick="ProductStore.goToPage(${pagination.page + 1})" ${pagination.page >= pagination.totalPages ? 'disabled' : ''}>›</button>
    `;

    paginationContainer.innerHTML = html;
  },

  // 跳转到指定页
  goToPage(page) {
    if (page < 1 || page > this.totalPages) return;
    this.loadProducts(page, this.currentCategory, this.currentSort, this.searchQuery);
  },

  // 按分类筛选
  filterByCategory(category) {
    this.loadProducts(1, category, this.currentSort, this.searchQuery);
  },

  // 排序
  sortBy(sort) {
    this.loadProducts(1, this.currentCategory, sort, this.searchQuery);
  },

  // 搜索
  search(query) {
    this.loadProducts(1, this.currentCategory, this.currentSort, query);
  },

  // 显示/隐藏加载状态
  showLoading(show) {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;

    if (show) {
      grid.innerHTML = `
        <div class="loading-products" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto 1rem; border: 2px solid var(--purple); border-radius: 4px; transform: rotate(45deg); animation: loadingPulse 1.2s ease-in-out infinite;"></div>
          <p style="color: var(--text-muted);">加载中...</p>
        </div>
      `;
    }
  },

  // 显示错误
  showError(message) {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;

    grid.innerHTML = `
      <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #e74c3c;">
        <div style="font-size: 2.5rem; margin-bottom: 1rem;">⚠️</div>
        <p>${message}</p>
        <button onclick="ProductStore.loadProducts()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: var(--purple-dim); border: 1px solid var(--purple); border-radius: 50px; color: var(--text); cursor: pointer;">重试</button>
      </div>
    `;
  },

  // 卡片动画
  animateCards() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 50);
    });
  }
};

// 全局函数（供 HTML onclick 调用）
window.openPreview = async function(productId) {
  try {
    const response = await fetch(`/api/product?id=${productId}`);
    const data = await response.json();

    if (data.success) {
      const product = data.product;
      // 这里可以打开预览模态窗口，显示产品详情
      console.log('Open preview for product:', product);
      // TODO: 实现预览模态窗口
      showInfo(`预览功能即将上线：${product.name}`);
    }
  } catch (error) {
    console.error('Open preview error:', error);
  }
};

// 购物车/收藏功能在 index.html 中已定义，这里不覆盖

// 页面加载时初始化产品数据
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ProductStore.loadProducts();
  });
} else {
  ProductStore.loadProducts();
}
