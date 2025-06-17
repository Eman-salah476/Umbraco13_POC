using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Security;

namespace LinkDev.GAFI.EgyptReady.Web.EventHandlers
{
    public class CustomContentAppHandler : INotificationHandler<SendingContentNotification>
    {
        private readonly IBackOfficeSecurity _backOfficeSecurity;
        private readonly IConfiguration _configuration;
        string uRLInspectionContentAppAlias = "urlInspectionTool";
        string AllowedUserGroupAliases;
        bool isEnabled;
          
        public CustomContentAppHandler(IBackOfficeSecurity backOfficeSecurity, IConfiguration configuration)
        {
            _backOfficeSecurity = backOfficeSecurity;
            _configuration = configuration;
            AllowedUserGroupAliases = _configuration.GetValue<string>("Umbraco:CMS:Integrations:SEO:GoogleSearchConsole:Settings:AllowedUserGroupAliases") ?? string.Empty;
            isEnabled = _configuration.GetValue<bool>("Umbraco:CMS:Integrations:SEO:GoogleSearchConsole:Settings:Enabled");

        }

        public void Handle(SendingContentNotification notification)
        {
            if (!isEnabled)
            {
                notification.Content.ContentApps = notification.Content.ContentApps.Where(x => x.Alias != uRLInspectionContentAppAlias);
                return;
            }

            var userGroupeAliases = AllowedUserGroupAliases.Split(',')
                .Select(x => x.Trim())
                .Where(x => !string.IsNullOrEmpty(x))
                .ToList();

            var currentUser = _backOfficeSecurity.CurrentUser;
            if (currentUser is not null && userGroupeAliases.Any() &&
                currentUser.Groups.Any(x => userGroupeAliases.Any(a => a.ToLower() == x.Alias.ToLower())))
                return;

            notification.Content.ContentApps = notification.Content.ContentApps.Where(x => x.Alias != uRLInspectionContentAppAlias);
            
        }
    }
}
