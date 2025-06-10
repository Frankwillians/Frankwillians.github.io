let AuthInstance;
let PortfolioInstance;

document.addEventListener('DOMContentLoaded', () => {
    AuthInstance = new Auth();
    PortfolioInstance = new Portfolio();
    setupFiltersAndSearch();
});

function setupFiltersAndSearch() {
    const searchInput = document.getElementById('search-posts');
    const filterCategory = document.getElementById('filter-category');
    if (searchInput) {
        searchInput.addEventListener('input', filterPosts);
    }
    if (filterCategory) {
        filterCategory.addEventListener('change', filterPosts);
    }
}

function filterPosts() {
    const searchInput = document.getElementById('search-posts');
    const filterCategory = document.getElementById('filter-category');
    const postsGrid = document.getElementById('posts-grid');
    if (
        !searchInput ||
        !filterCategory ||
        !postsGrid ||
        !PortfolioInstance ||
        !PortfolioInstance.data ||
        !Array.isArray(PortfolioInstance.data.items)
    ) {
        return;
    }
    const searchTerm = searchInput.value.toLowerCase();
    const categoryFilter = filterCategory.value;
    const postCards = postsGrid.querySelectorAll('.post-card');
    postCards.forEach(card => {
        const postId = card.getAttribute('data-id');
        const post = PortfolioInstance.data.items.find(item => item.id === postId);
        if (!post) {
            card.style.display = 'none';
            return;
        }
        const titleMatches = post.title.toLowerCase().includes(searchTerm);
        const descriptionMatches = post.description.toLowerCase().includes(searchTerm);
        const categoryMatches = categoryFilter === 'all' || post.category === categoryFilter;
        if ((titleMatches || descriptionMatches) && categoryMatches) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}