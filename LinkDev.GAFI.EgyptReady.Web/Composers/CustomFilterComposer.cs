using LinkDev.GAFI.EgyptReady.Web.Handlers;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DeliveryApi;

namespace LinkDev.GAFI.EgyptReady.Web.Composers
{
    public class CustomFilterComposer : IComposer
    {
        /// <summary>
        /// We register handler and indexer classes in the Startup or Composer file to ensure that Umbraco's Dependency Injection (DI) container
        /// is aware of these classes and can use them during the Content Delivery API's runtime operations. 
        /// </summary>
        public void Compose(IUmbracoBuilder builder)
        {
            // Register the custom filter handler
            builder.Services.AddSingleton<IFilterHandler, BlogCategoryFilterHandler>();
            builder.Services.AddSingleton<IFilterHandler, BlogSearchFilterHandler>();
            builder.Services.AddSingleton<IFilterHandler, BlogDateFilterHandler>();
            builder.Services.AddSingleton<ISortHandler, BlogDateSortHandler>();

            // Register the custom index handler
            builder.Services.AddSingleton<IContentIndexHandler, BlogIndexHandler>();

        }
    }
}
