using Umbraco.Cms.Core.DeliveryApi;

namespace LinkDev.GAFI.EgyptReady.Web.Handlers.BlogsCategoryHandlers
{
    public class BlogCategoryFilterHandler : IFilterHandler
    {

        private const string CategorySpecifier = "category:";
        private const string FieldName = "blogCategory";


        public bool CanHandle(string query)
        {
            // Check if the query starts with the specified prefix
            return query.StartsWith(CategorySpecifier, StringComparison.OrdinalIgnoreCase);
        }

        public FilterOption BuildFilterOption(string filter)
        {
            // Extract the category ID from the filter query
            var categoryId = filter.Substring(CategorySpecifier.Length);

            // There might be several values for the filter
            var values = categoryId.Split(',');

            return new FilterOption
            {
                FieldName = FieldName,
                Values = values,
                Operator = FilterOperation.Is
            };
        }
     
    }
}
