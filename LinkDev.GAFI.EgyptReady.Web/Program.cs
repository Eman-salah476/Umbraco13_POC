using LinkDev.GAFI.EgyptReady.Web.EventHandlers;
using LinkDev.GAFI.EgyptReady.Web.Filters;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);


//services.AddControllersWithViews(options =>
//{
//    options.Filters.Add<UnpublishValidationFilter>();
//});

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .AddNotificationHandler<ContentUnpublishingNotification, ContentUnpublishingHandler>()
    .AddNotificationHandler<SendingContentNotification, CustomContentAppHandler>()
    .Build();

WebApplication app = builder.Build();

await app.BootUmbracoAsync();


app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseInstallerEndpoints();
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();
