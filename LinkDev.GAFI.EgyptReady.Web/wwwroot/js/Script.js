$(document).ready(function () {

    loadMenu();


    function loadMenu() {
        const container = document.getElementById('navbarListing');
        container.innerHTML = "";

        const url = `${baseUrl}/item/menu?expand=properties[redirectTo]`;
        $.ajax({
            url: url,
            method: "GET",
            headers: {
                "Accept-Language": acceptLanguage,
                "Api-Key": ApiKey
            },
            success: function (response) {
                renderMenu(response);
            },
            error: function (error) {
                console.error("Failed to fetch menu", error);
            }
        });
    }

    function renderMenu(menu) {
        const container = document.getElementById('navbarListing');

        if (menu && menu.properties.redirectTo && menu.properties.redirectTo.length) {
            menu.properties.redirectTo.forEach(content => {
                let contentProperties = content.properties;
                const contentHtml = `
                 <li class="nav-item"><a class="nav-link px-lg-3 py-3 py-lg-4" href="${content.route.path}">${content.properties.title}</a></li>
                `;
                container.insertAdjacentHTML('beforeend', contentHtml);
            });
        }
    }

});