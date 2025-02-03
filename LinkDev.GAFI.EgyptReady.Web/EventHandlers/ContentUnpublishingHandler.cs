using Microsoft.Extensions.Caching.Distributed;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services.Changes;
using static Umbraco.Cms.Core.Cache.ContentCacheRefresher;

namespace LinkDev.GAFI.EgyptReady.Web.EventHandlers
{
    public class ContentUnpublishingHandler : INotificationHandler<ContentUnpublishingNotification>
    {
        private IDistributedCache distributedCache;
        private ContentCacheRefresher contentCacheRefresher;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ContentUnpublishingHandler( IDistributedCache distributedCache,
            ContentCacheRefresher contentCacheRefresher, IHttpContextAccessor httpContextAccessor)
        {
            this.distributedCache = distributedCache;
            this.contentCacheRefresher = contentCacheRefresher;
            _httpContextAccessor = httpContextAccessor; 
        }

        public void Handle(ContentUnpublishingNotification notification)
        {
            foreach (var unPublishedEntity in notification.UnpublishedEntities)
            {
                if (unPublishedEntity == null)
                {
                    continue;
                }
                if (unPublishedEntity.ContentType.Alias == "bLogs")
                {
                    notification.CancelOperation(new EventMessage("NotAllowed", $"Cannot unpublish content with name ({unPublishedEntity.Name}).", EventMessageType.Error));
                    break;
                }
            }
            if (notification.Cancel)
            {
                // Add a custom header to indicate the operation was canceled
                if (_httpContextAccessor.HttpContext is not null)
                {
                    _httpContextAccessor.HttpContext.Response.Headers.Append("X-Unpublish-Canceled", "true");
                    return;
                }
            }


        }



    }


}
