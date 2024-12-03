using LinkDev.GAFI.EgyptReady.Web.Handlers;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DeliveryApi;

namespace LinkDev.GAFI.EgyptReady.Web.Composers
{
    public class CustomFilterComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            // Register the custom filter handler
            builder.Services.AddSingleton<IFilterHandler, BlogCategoryFilterHandler>();
            builder.Services.AddSingleton<IFilterHandler, BlogSearchFilterHandler>();

            // Register the custom index handler
            builder.Services.AddSingleton<IContentIndexHandler, BlogIndexHandler>();
            //builder.Services.AddSingleton<IContentIndexHandler, BlogSearchIndexHandler>();

        }
    }
}
