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
            var searchTerm = filter.Substring(SearchTextSpecifier.Length);
            var searchTexts = searchTerm.Split(" ", StringSplitOptions.RemoveEmptyEntries).Select(x => x.Trim()).ToArray();
            

            return new FilterOption
            {
                FieldName = SearchFieldName, 
                Values = searchTexts,
                Operator = FilterOperation.Contains
            };
        }

    }
}
