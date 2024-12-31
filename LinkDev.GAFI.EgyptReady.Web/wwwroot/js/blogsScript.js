$(document).ready(function () {
    const pageSize = 3; 
    let currentPage = 1;


    loadCategories();
    loadBlogs();


    $('#applyFilters').click(function () {
        currentPage = 1;
        loadBlogs();
    });

    $('#resetFilters').click(function () {
        $('#filterForm')[0].reset();
        currentPage = 1;
        loadBlogs();
    });

    // Function to fetch blogs from the Content Delivery API
    function loadBlogs() {
        const container = document.getElementById('blog-posts');
        container.innerHTML = "";

        var queryParams = BuildQuery();
        const url = `${baseUrl}?${queryParams.join("&")}`;

        $.ajax({
            url: url,
            method: "GET",
            headers: {
                "Accept-Language": acceptLanguage,
                "Api-Key": ApiKey
            },
            success: function (response) {
                renderBlogs(response.items);
                renderPagination(response.total || 0);
                scrollToTop()
            },
            error: function (error) {
                console.error("Failed to fetch blogs", error);
            }
        });

    }

    function BuildQuery() {
        const fetchChildren = "blogs";

        let filters = [];
        const searchText = $('#searchText').val();
        const dateFrom = $('#dateFrom').val();
        const dateTo = $('#dateTo').val();
        const category = $('#category').val();

        if (searchText) {
            filters.push(`filter=searchText:${encodeURIComponent(searchText)}`);
        }
        if (dateFrom) {
            filters.push(`filter=dateFrom:${encodeURIComponent(dateFrom)}`);
        }
        if (dateTo) {
            filters.push(`filter=dateTo:${encodeURIComponent(dateTo)}`);
        }
        if (category) {
            filters.push(`filter=category:${encodeURIComponent(category)}`);
        }
        const skip = (currentPage - 1) * pageSize;
        const queryParams = [
            `fetch=children:${fetchChildren}`,
            ...filters,
            "sort=blogDate:desc",
            `skip=${skip}`,
            `take=${pageSize}`,
            "expand=properties[blogCategory]",
            "fields=properties[$all]"
        ];
        return queryParams;
    }

    // Function to render blogs 
    function renderBlogs(blogs) {
        const container = document.getElementById('blog-posts');

        if (blogs && blogs.length) {
            blogs.forEach(blog => {
                const blogHtml = `
                    <div class="post-preview">
                    <h4 class="btn btn-warning">${blog.properties.blogCategory.properties.title}</h4>
                        <a href="${blog.route.path}">
                            <h2 class="post-title">${blog.properties.title}</h2>
                        </a>
                        <p class="post-subtitle">${blog.properties.brief}</p>
                        <p class="post-meta">
                            ${new Date(blog.properties.blogDate).toLocaleDateString()}
                        </p>
                    </div>
                    <hr class="my-4" />
                `;
                container.insertAdjacentHTML('beforeend', blogHtml);
            });
        }
        else {
            container.append("No blogs found");
        }
    }

    function loadCategories() {

        var url = `${baseUrl}?fetch=children:categories`;
        $.ajax({
            url: url,
            method: "GET",
            headers: {
                "Accept-Language": acceptLanguage,
                "Api-Key": ApiKey
            },
            success: function (response) {
                BindCategories(response.items);
            },
            error: function (error) {
                console.error("Failed to fetch categories", error);
            }
        });


    }

    function BindCategories(categories) {
        if (categories && categories.length) {
            const categorySelect = $('#category');
            categories.forEach(category => {
                categorySelect.append(`<option value="${category.id}">${category.properties.title}</option>`);
            });
        }
    }

    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / pageSize);
        const paginationContainer = $('#paginationContainer .pagination');
        paginationContainer.empty();

        if (totalPages > 1) {
            for (let page = 1; page <= totalPages; page++) {
                const isActive = page === currentPage ? "active" : "";
                const pageButton = `
                        <li class="page-item ${isActive}">
                            <a class="page-link" href="#" data-page="${page}">${page}</a>
                        </li>
                    `;
                paginationContainer.append(pageButton);
            }

            // Add click event for pagination buttons
            $('.page-link').click(function (e) {
                console.log("Clicked", e);
                e.preventDefault();
                const page = $(this).data('page');
                if (page !== currentPage) {
                    currentPage = page;
                    loadBlogs();
                }
            });
        }
    }

    function scrollToTop() {
        $('#blogFilters').animate({ scrollTop: 0 }, "slow");
    }
});
