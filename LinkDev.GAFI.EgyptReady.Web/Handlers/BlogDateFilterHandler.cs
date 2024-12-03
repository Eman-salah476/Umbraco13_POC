using Umbraco.Cms.Core.DeliveryApi;

namespace LinkDev.GAFI.EgyptReady.Web.Handlers
{
    public class BlogDateFilterHandler : IFilterHandler
    {
        private const string DateFromSpecifier = "dateFrom:";
        private const string DateToSpecifier = "dateTo:";
        private const string dateFieldName = "blogDate";


        public bool CanHandle(string query)
        {
            return query.StartsWith(DateFromSpecifier, StringComparison.OrdinalIgnoreCase)
                || query.StartsWith(DateToSpecifier, StringComparison.OrdinalIgnoreCase);
        }

        public FilterOption BuildFilterOption(string filter)
        {

            if (filter.StartsWith(DateFromSpecifier, StringComparison.OrdinalIgnoreCase))
            {
                var dateFrom = filter.Substring(DateFromSpecifier.Length);

                if (DateTime.TryParse(dateFrom, out var fromDate))
                {
                    return new FilterOption
                    {
                        FieldName = dateFieldName, 
                        Values = new[] { fromDate.ToString("yyyy-MM-dd") }, 
                        Operator = FilterOperation.GreaterThanOrEqual 
                    };
                }
            }
            else if (filter.StartsWith(DateToSpecifier, StringComparison.OrdinalIgnoreCase))
            {
                var dateTo = filter.Substring(DateToSpecifier.Length);

                if (DateTime.TryParse(dateTo, out var toDate))
                {
                    return new FilterOption
                    {
                        FieldName = dateFieldName, 
                        Values = new[] { toDate.ToString("yyyy-MM-dd") }, 
                        Operator = FilterOperation.LessThanOrEqual 
                    };
                }
            }
            return null;
        }


    }
}
