using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Actions;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models.Trees;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Trees;
using Umbraco.Cms.Web.BackOffice.Trees;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Cms.Web.Common.ModelBinders;


namespace LinkDev.GAFI.EgyptReady.Web.Controllers.BackOffice.SurveyBuilder
{
    [PluginController("SurveyTemplates")]
    [ExcludeFromCodeCoverage]
    [Tree("surveyBuilder", "SurveyTemplatesAlias",
         TreeTitle = "Templates", TreeGroup = "surveyTemplatesGroup", SortOrder = 7)]
    public class SurveyTemplatesTreeController : TreeController
    {
        private readonly HttpClient _httpClient;
        private readonly string formIOAPIURL;
        private readonly IMenuItemCollectionFactory _menuItemCollectionFactory;
        private readonly IConfiguration _configuration;

        public SurveyTemplatesTreeController(ILocalizedTextService localizedTextService,
            UmbracoApiControllerTypeCollection umbracoApiControllerTypeCollection,
            IEventAggregator eventAggregator, IMenuItemCollectionFactory menuItemCollectionFactory,
             HttpClient httpClient, IConfiguration configuration)
            : base(localizedTextService, umbracoApiControllerTypeCollection, eventAggregator)
        {
            _httpClient = httpClient;
            _menuItemCollectionFactory = menuItemCollectionFactory;
            _configuration = configuration;
            formIOAPIURL = _configuration.GetValue<string>("appSettings:FormIODesignerAPI") ?? string.Empty;
        }

        protected override ActionResult<MenuItemCollection> GetMenuForNode(string id, [ModelBinder(typeof(HttpQueryStringModelBinder))] FormCollection queryStrings)
        {
            // create a Menu Item Collection to return so people can interact with the nodes in your tree
            var menu = _menuItemCollectionFactory.Create();

            if (id == Constants.System.Root.ToInvariantString())
            {

                var createMenuItem = menu.Items.Add<ActionNew>(LocalizedTextService, false, opensDialog: false)!;
                createMenuItem.Name = "Create";
                createMenuItem.NavigateToRoute($"/surveyBuilder/{TreeAlias}/CreateTemplate");

                // add refresh menu item (note no dialog)
                menu.Items.Add(new RefreshNode(LocalizedTextService, false));
            }
            else
            {
                //Child nodes of the root node
                // add a delete action to each individual item
                var editMenuItem = menu.Items.Add<ActionUpdate>(LocalizedTextService, false, opensDialog: false)!;
                editMenuItem.Name = "Edit";
                editMenuItem.NavigateToRoute($"/surveyBuilder/{TreeAlias}/EditTemplate?tableName={id}");

                // add a delete action to each individual item
                menu.Items.Add<ActionDelete>(LocalizedTextService, false, opensDialog: true);
            }

            return menu;
        }

        protected override ActionResult<TreeNodeCollection> GetTreeNodes(string id, [ModelBinder(typeof(HttpQueryStringModelBinder))] FormCollection queryStrings)
        {
            Guid correlationID = Guid.NewGuid();
            var nodes = new TreeNodeCollection();
            try
            {
                // check if we're rendering the root node's children
                if (id == Constants.System.Root.ToInvariantString())
                {
                    if (!string.IsNullOrEmpty(formIOAPIURL))
                    {
                        string tableListURL = $"{formIOAPIURL}/Query/Tables";
                        List<TableConfiguration>? result = _httpClient.GetFromJsonAsync<List<TableConfiguration>>(tableListURL).Result;

                        if (result is not null)
                        {
                            // loop through our table and create a tree item for each one
                            foreach (var table in result)
                            {
                                // add each node to the tree collection using the base CreateTreeNode method
                                // it has several overloads, using here unique Id of tree item,
                                // -1 is the Id of the parent node to create, eg the root of this tree is -1 by convention
                                // - the querystring collection passed into this route
                                // - the name of the tree node
                                // - css class of icon to display for the node
                                // - and whether the item has child nodes
                                if (!string.IsNullOrEmpty(table.TableName))
                                {
                                    var node = CreateTreeNode(table.TableName.ToString(), "-1", queryStrings, table.TableName, "icon-grid", false);
                                    node.RoutePath = $"surveyBuilder/{TreeAlias}/ListView/{table.TableName}";
                                    nodes.Add(node);
                                }
                            }
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine("Error", ex.Message);
            }
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
            root!.RoutePath = $"/surveyBuilder/{TreeAlias}/Templates";
            // set the icon
            root!.Icon = "icon-grid";
            // could be set to false for a custom tree with a single node.
            root.HasChildren = true;

            return root;
        }
   
    
    
    }

    public class TableConfiguration
    {
        public int Id { get; set; }
        public string TableName { get; set; }
    }
}
