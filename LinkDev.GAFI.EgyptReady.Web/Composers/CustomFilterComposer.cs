using LinkDev.GAFI.EgyptReady.Web.Handlers.BlogsCategoryHandlers;
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

            // Register the custom index handler
            builder.Services.AddSingleton<IContentIndexHandler, BlogCategoryIndexHandler>();

        }
    }
}
