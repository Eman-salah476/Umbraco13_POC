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

            // Create a FilterOption that performs a "contains" search on multiple fields
            return new FilterOption
            {
                FieldName = SearchFieldName, // Matches the composite field defined in the Index Handler
                Values = new[] { searchText },
                Operator = FilterOperation.Contains // Perform a partial match
            };
        }

    }
}
