using LinkDev.GAFI.EgyptReady.Web.Webhooks;
using Umbraco.Cms.Core.Composing;

namespace LinkDev.GAFI.EgyptReady.Web.Composers
{
    //Used to extend the list of available webhook events
    public class CustomWebhookComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.WebhookEvents()
                .Clear()
            //.AddCms(false); //Only Default = false
            .Add<ContentPublishedLoggedEvent>()
            .AddCms(cmsBuilder =>
            {
                cmsBuilder
                .AddDefault()
                .AddMember()
                ;
            });
        }
    }
}
