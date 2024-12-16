using Umbraco.Cms.Core;
using Umbraco.Cms.Core.DeliveryApi;

namespace LinkDev.GAFI.EgyptReady.Web.Handlers
{
    public class BlogDateSortHandler : ISortHandler
    {

        private const string SortOptionSpecifier = "blogDate:";
        private const string DateFieldName = "blogDate";

        public bool CanHandle(string query)
        {
            return query.StartsWith(SortOptionSpecifier, StringComparison.OrdinalIgnoreCase);
        }

        public SortOption BuildSortOption(string sort)
        {

            var sortDirection = sort.Substring(SortOptionSpecifier.Length);

            return new SortOption
            {
                FieldName = DateFieldName,
                Direction = sortDirection.StartsWith("asc", StringComparison.OrdinalIgnoreCase)
                    ? Direction.Ascending
                    : Direction.Descending
            };
        }

    }
}
