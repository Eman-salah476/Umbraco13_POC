$(document).ready(function () {
    const baseUrl = "https://localhost:44392/umbraco/delivery/api/v2/content";
    // Detect language from URL
    const isArabic = window.location.href.includes("/ar/");
    const acceptLanguage = isArabic ? "ar-eg" : "en-us";

    loadCategories();
    loadBlogs();


    $('#applyFilters').click(function () {
        loadBlogs();
    });

    // Function to fetch blogs from the Content Delivery API
    function loadBlogs() {

        var queryParams = BuildQuery();
        const url = `${baseUrl}?${queryParams.join("&")}`;

        $.ajax({
            url: url,
            method: "GET",
            headers: {
                "Accept-Language": acceptLanguage
            },
            success: function (response) {
                renderBlogs(response.items);
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
        const queryParams = [
            `fetch=children:${fetchChildren}`,
            ...filters,
            "sort=sortOrder:asc",
            "skip=0",
            "take=3",
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
                            Posted by ${blog.creatorName || 'Unknown Author'} on ${new Date(blog.properties.blogDate).toLocaleDateString()}
                        </p>
                    </div>
                    <hr class="my-4" />
                `;
                container.insertAdjacentHTML('beforeend', blogHtml);
            });
        }
        else {
            container.append("<p>No blogs found.</p>");
        }
    }

    // Load categories 
    function loadCategories() {

        var url = `${baseUrl}?fetch=children:categories`;
        $.ajax({
            url: url,
            method: "GET",
            headers: {
                "Accept-Language": acceptLanguage
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


});
