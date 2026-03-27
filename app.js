// GitHub 仓库展示页面 - 动态加载 Markdown
// 自动解析 GitHub仓库整理_带更新时间.md 并渲染

const MARKDOWN_URL = 'GitHub仓库整理_带更新时间.md';

// 分类映射
const categoryMap = {
    'python': { name: 'Python', icon: '🐍' },
    'java': { name: 'Java', icon: '☕' },
    'ai': { name: 'AI / LLM', icon: '🤖' },
    'algorithm': { name: '算法', icon: '📐' },
    'deeplearning': { name: '深度学习 / CV', icon: '🧠' },
    'rust': { name: 'Rust', icon: '⚙️' },
    'frontend': { name: '前端', icon: '🌐' },
    'database': { name: '数据库', icon: '🗄️' },
    'backend': { name: '后端 / 系统', icon: '🖥️' },
    'resources': { name: '资源 / 工具', icon: '📚' },
    'macos': { name: 'macOS', icon: '🍎' },
    'admin': { name: '后台框架', icon: '🎛️' },
    'weapp': { name: '小程序 / UniApp', icon: '📱' },
    'other': { name: '其他', icon: '📦' }
};

// 解析 Markdown 内容
function parseMarkdown(content) {
    const repos = [];
    const lines = content.split('\n');
    let currentCategory = '';
    let currentCategoryName = '';
    
    function getCategoryKey(name) {
        const lower = name.toLowerCase();
        if (lower.includes('python')) return 'python';
        if (lower.includes('java')) return 'java';
        if (lower.includes('ai') || lower.includes('llm') || name.includes('大模型')) return 'ai';
        if (name.includes('算法') || name.includes('数据结构')) return 'algorithm';
        if (name.includes('深度学习') || lower.includes('cv')) return 'deeplearning';
        if (lower.includes('rust')) return 'rust';
        if (name.includes('前端') && !name.includes('框架')) return 'frontend';
        if (name.includes('数据库') || lower.includes('sql')) return 'database';
        if (name.includes('后端') || name.includes('系统')) return 'backend';
        if (name.includes('资源') || name.includes('工具') || name.includes('导航')) return 'resources';
        if (lower.includes('macos') || lower.includes('mac')) return 'macos';
        if (name.includes('框架') || name.includes('后台')) return 'admin';
        if (name.includes('小程序') || name.includes('uni-app') || name.includes('微信')) return 'weapp';
        return 'other';
    }
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 检测分类标题
        if (line.startsWith('## ')) {
            currentCategoryName = line.substring(3).trim();
            currentCategory = getCategoryKey(currentCategoryName);
            continue;
        }
        
        // 检测仓库条目
        if (line.startsWith('**') && line.includes('**:')) {
            const parts = line.split(':**', 2);
            if (parts.length === 2) {
                const name = parts[0].substring(2).trim();
                const title = parts[1].trim();
                
                const repo = {
                    name: name,
                    title: title,
                    category: currentCategory,
                    categoryName: currentCategoryName,
                    github: '',
                    author: name.includes('/') ? name.split('/')[0] : '',
                    stars: '-',
                    forks: '-',
                    updated: '-',
                    comment: '',
                    intro: title,
                    website: ''
                };
                
                // 解析后续行
                let j = i + 1;
                while (j < lines.length) {
                    const l = lines[j].trim();
                    
                    // 遇到新的仓库或分类或分隔符，停止
                    if ((l.startsWith('**') && l.includes('**:')) || 
                        l.startsWith('## ') || 
                        l === '---') {
                        break;
                    }
                    
                    if (l.startsWith('- GitHub：')) {
                        const match = l.match(/https:\/\/github\.com\/[^\s]+/);
                        if (match) repo.github = match[0];
                    } else if (l.startsWith('- 官网：')) {
                        const url = l.substring(5).trim();
                        if (url && url !== '无') repo.website = url;
                    } else if (l.startsWith('- 作者：')) {
                        let author = l.substring(5).trim();
                        author = author.replace(/[（(].*?[）)]/g, '').trim();
                        repo.author = author;
                    } else if (l.includes('⭐ Star：')) {
                        const match = l.match(/⭐ Star：(.+)/);
                        if (match) repo.stars = match[1].trim();
                    } else if (l.includes('🍴 Fork：')) {
                        const match = l.match(/🍴 Fork：(.+)/);
                        if (match) {
                            const v = match[1].trim();
                            repo.forks = v !== '待补充' ? v : '-';
                        }
                    } else if (l.includes('🕒 最近更新：')) {
                        const match = l.match(/🕒 最近更新：(.+)/);
                        if (match) repo.updated = match[1].trim();
                    } else if (l.includes('💬 评价：')) {
                        const match = l.match(/💬 评价：(.+)/);
                        if (match) repo.comment = match[1].trim();
                    } else if (l.includes('📖 简介：')) {
                        const match = l.match(/📖 简介：(.+)/);
                        if (match) repo.intro = match[1].trim();
                    }
                    
                    j++;
                }
                
                if (!repo.comment) repo.comment = repo.intro;
                repos.push(repo);
            }
        }
    }
    
    return repos;
}

// 渲染仓库卡片
function renderRepoCard(repo) {
    const categoryInfo = categoryMap[repo.category] || categoryMap.other;
    
    return `
        <div class="repo-card" data-category="${repo.category}">
            <div class="repo-header">
                <div class="repo-title">
                    <a href="${repo.github}" target="_blank" rel="noopener">${repo.name}</a>
                </div>
                <span class="repo-category">${categoryInfo.icon} ${categoryInfo.name}</span>
            </div>
            <div class="repo-desc">${repo.title}</div>
            <div class="repo-intro">📖 ${repo.intro}</div>
            <div class="repo-meta">
                <div class="meta-item">
                    <span class="meta-icon">⭐</span>
                    <span>${repo.stars}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">🍴</span>
                    <span>${repo.forks}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">🕒</span>
                    <span>${repo.updated}</span>
                </div>
            </div>
            ${repo.comment ? `<div class="repo-comment">💬 ${repo.comment}</div>` : ''}
            <div class="repo-links">
                <a href="${repo.github}" target="_blank" rel="noopener" class="repo-link">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    GitHub
                </a>
                ${repo.website ? `
                <a href="${repo.website}" target="_blank" rel="noopener" class="repo-link">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    官网
                </a>
                ` : ''}
            </div>
        </div>
    `;
}

// 渲染分类筛选器
function renderCategoryFilters(categories) {
    const container = document.getElementById('categoryFilters');
    const allCount = window.allRepos.length;
    
    let html = `<button class="category-btn active" data-category="all">全部 (${allCount})</button>`;
    
    categories.forEach(cat => {
        const info = categoryMap[cat.key] || categoryMap.other;
        html += `<button class="category-btn" data-category="${cat.key}">${info.icon} ${info.name} (${cat.count})</button>`;
    });
    
    container.innerHTML = html;
    
    // 绑定点击事件
    container.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterRepos(btn.dataset.category);
        });
    });
}

// 筛选仓库
function filterRepos(category) {
    const cards = document.querySelectorAll('.repo-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    document.getElementById('resultCount').textContent = `显示 ${visibleCount} 个仓库`;
}

// 搜索仓库
function searchRepos(keyword) {
    const cards = document.querySelectorAll('.repo-card');
    const lowerKeyword = keyword.toLowerCase();
    let visibleCount = 0;
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(lowerKeyword)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    document.getElementById('resultCount').textContent = `显示 ${visibleCount} 个仓库`;
}

// 加载并渲染
async function loadRepos() {
    const loadingEl = document.getElementById('loading');
    const reposContainer = document.getElementById('reposContainer');
    
    try {
        loadingEl.style.display = 'block';
        reposContainer.innerHTML = '';
        
        // 添加随机参数防止缓存
        const response = await fetch(`${MARKDOWN_URL}?t=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const content = await response.text();
        const repos = parseMarkdown(content);
        window.allRepos = repos;
        
        // 统计分类
        const categoryCount = {};
        repos.forEach(repo => {
            categoryCount[repo.category] = (categoryCount[repo.category] || 0) + 1;
        });
        
        const categories = Object.entries(categoryCount)
            .map(([key, count]) => ({ key, count }))
            .sort((a, b) => b.count - a.count);
        
        // 渲染分类筛选器
        renderCategoryFilters(categories);
        
        // 渲染仓库卡片
        reposContainer.innerHTML = repos.map(renderRepoCard).join('');
        
        // 更新统计
        document.getElementById('resultCount').textContent = `共 ${repos.length} 个仓库`;
        document.getElementById('updateTime').textContent = new Date().toLocaleString('zh-CN');
        
        loadingEl.style.display = 'none';
        
    } catch (error) {
        loadingEl.innerHTML = `
            <div class="error">
                <p>❌ 加载失败: ${error.message}</p>
                <p>请确保 Markdown 文件已推送到仓库</p>
                <button onclick="loadRepos()" class="retry-btn">重试</button>
            </div>
        `;
        console.error('加载失败:', error);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadRepos();
    
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchRepos(e.target.value);
        }, 300);
    });
    
    // 刷新按钮
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadRepos();
    });
});
