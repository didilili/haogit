// 应用逻辑
class RepoApp {
    constructor() {
        this.repos = reposData;
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // 搜索框事件
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });

        // 分类筛选事件
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // 更新激活状态
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 更新分类并重新渲染
                this.currentCategory = btn.dataset.category;
                this.render();
            });
        });
    }

    filterRepos() {
        return this.repos.filter(repo => {
            // 分类筛选
            if (this.currentCategory !== 'all' && repo.category !== this.currentCategory) {
                return false;
            }

            // 搜索筛选
            if (this.searchQuery) {
                const searchFields = [
                    repo.name,
                    repo.title,
                    repo.intro,
                    repo.comment,
                    repo.categoryName,
                    repo.author
                ].join(' ').toLowerCase();
                
                return searchFields.includes(this.searchQuery);
            }

            return true;
        });
    }

    render() {
        const container = document.getElementById('reposSection');
        const filteredRepos = this.filterRepos();

        if (filteredRepos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p>没有找到匹配的仓库</p>
                    <p>试试其他关键词或分类</p>
                </div>
            `;
            return;
        }

        const html = `
            <div class="repos-grid">
                ${filteredRepos.map(repo => this.createRepoCard(repo)).join('')}
            </div>
        `;

        container.innerHTML = html;
    }

    createRepoCard(repo) {
        const websiteLink = repo.website ? `
            <a href="${repo.website}" target="_blank" class="repo-link secondary">官网</a>
        ` : '';

        return `
            <article class="repo-card" data-category="${repo.category}">
                <div class="repo-header">
                    <span class="category-tag">${repo.categoryName}</span>
                    <a href="${repo.github}" target="_blank" class="repo-name">${repo.name}</a>
                    <div class="repo-title">${repo.title}</div>
                </div>
                
                <div class="repo-stats">
                    <span class="repo-stat">⭐ ${repo.stars}</span>
                    <span class="repo-stat">🍴 ${repo.forks}</span>
                    <span class="repo-stat">🕒 ${repo.updated}</span>
                </div>
                
                <div class="repo-intro">
                    📖 ${repo.intro}
                </div>
                
                <div class="repo-desc">
                    💬 ${repo.comment}
                </div>
                
                <div class="repo-footer">
                    <span class="repo-author">👤 ${repo.author}</span>
                    <div class="repo-links">
                        ${websiteLink}
                        <a href="${repo.github}" target="_blank" class="repo-link primary">GitHub →</a>
                    </div>
                </div>
            </article>
        `;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new RepoApp();
});

// 添加平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
