using Microsoft.Extensions.Options;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Sync;
using Umbraco.Cms.Core.Webhooks;

namespace LinkDev.GAFI.EgyptReady.Web.Webhooks
{
    [WebhookEvent("Content Published Logged Event", Constants.WebhookEvents.Types.Content)]
    public class ContentPublishedLoggedEvent : WebhookEventContentBase<ContentPublishedNotification, IContent>
    {
        private readonly IPublishedSnapshotAccessor _publishedSnapshotAccessor;
        private readonly IApiContentBuilder _apiContentBuilder;
        public ContentPublishedLoggedEvent(IWebhookFiringService webhookFiringService,
                IWebhookService webhookService,
                IOptionsMonitor<WebhookSettings> webhookSettings,
                IServerRoleAccessor serverRoleAccessor,
                IPublishedSnapshotAccessor publishedSnapshotAccessor,
                IApiContentBuilder apiContentBuilder) : base(webhookFiringService, webhookService, webhookSettings, serverRoleAccessor)
        {
            _publishedSnapshotAccessor = publishedSnapshotAccessor;
            _apiContentBuilder = apiContentBuilder;
        }


        //The property that must be overridden to provide a unique identifier for your webhook event.
        //If you want to use the default event, you can use the alias "Umbraco.ContentPublish"
        public override string Alias => "ContentPublishedLogged";

        protected override object? ConvertEntityToRequestPayload(IContent entity)
        {
            if (_publishedSnapshotAccessor.TryGetPublishedSnapshot(out IPublishedSnapshot? publishedSnapshot) is false ||
                 publishedSnapshot?.Content is null)
            {
                return null;
            }

            IPublishedContent? publishedContent = publishedSnapshot.Content.GetById(entity.Id);
            if (publishedContent is null)
            {
                return null;
            }
            var content = _apiContentBuilder.Build(publishedContent);
            var payload = new
            {
                Message = $"A {publishedContent.ContentType.Alias} was published",
                ContentName = publishedContent.Name,
                ContentAsJson= content
            };
            return payload;

        }

        protected override IEnumerable<IContent> GetEntitiesFromNotification(ContentPublishedNotification notification)
            => notification.PublishedEntities;

    }
}
