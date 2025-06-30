using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Trees;
using Umbraco.Cms.Web.BackOffice.Trees;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Cms.Web.Common.ModelBinders;

namespace LinkDev.GAFI.EgyptReady.Web.Controllers.BackOffice.SurveyBuilder
{
    [PluginController("Surveys")]
    [ExcludeFromCodeCoverage]
    [Tree("surveyBuilder", "SurveyAlias",
         TreeTitle = "Surveys", TreeGroup = "SurveyGroup", SortOrder = 5)]
    public class SurveyTreeController : TreeController
    {
        private readonly IMenuItemCollectionFactory _menuItemCollectionFactory;


        public SurveyTreeController(ILocalizedTextService localizedTextService,
            UmbracoApiControllerTypeCollection umbracoApiControllerTypeCollection,
            IEventAggregator eventAggregator,
            IMenuItemCollectionFactory menuItemCollectionFactory)
            : base(localizedTextService, umbracoApiControllerTypeCollection, eventAggregator)
        {
            _menuItemCollectionFactory = menuItemCollectionFactory;
        }

        protected override ActionResult<MenuItemCollection> GetMenuForNode(string id, [ModelBinder(typeof(HttpQueryStringModelBinder))] FormCollection queryStrings)
        {
            // create a Menu Item Collection to return so people can interact with the nodes in your tree
            var menu = _menuItemCollectionFactory.Create();
            return menu;
        }

        protected override ActionResult<TreeNodeCollection> GetTreeNodes(string id, [ModelBinder(typeof(HttpQueryStringModelBinder))] FormCollection queryStrings)
        {
            var nodes = new TreeNodeCollection();

            return nodes;
        }

        //You can customise the Root Node [first node in the tree] by overriding this method.
        protected override ActionResult<TreeNode?> CreateRootNode(FormCollection queryStrings)
        {
            var rootResult = base.CreateRootNode(queryStrings);
            if (!(rootResult.Result is null))
            {
                return rootResult;
            }

            var root = rootResult.Value;

            root!.RoutePath = $"/surveyBuilder/{TreeAlias}/SurveysList";

            // could be set to false for a custom tree with a single node.
            root!.HasChildren = false;
            // set the icon
            root!.Icon = "icon-application-window";

            root!.MenuUrl = null;

            return root;
        }
    }
}
