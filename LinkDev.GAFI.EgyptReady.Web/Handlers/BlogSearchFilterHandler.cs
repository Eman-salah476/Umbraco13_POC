using Umbraco.Cms.Core.DeliveryApi;

namespace LinkDev.GAFI.EgyptReady.Web.Handlers
{
    public class BlogSearchFilterHandler : IFilterHandler
    {
        private const string SearchTextSpecifier = "searchText:";
        private const string SearchFieldName = "blogSearchFields";


        public bool CanHandle(string query)
        {
            return query.StartsWith(SearchTextSpecifier, StringComparison.OrdinalIgnoreCase);
        }

        public FilterOption BuildFilterOption(string filter)
        {
            var searchText = filter.Substring(SearchTextSpecifier.Length);

            return new FilterOption
            {
                FieldName = SearchFieldName, 
                Values = new[] { searchText },
                Operator = FilterOperation.Contains
            };
        }

    }
}
