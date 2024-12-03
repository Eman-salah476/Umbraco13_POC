using Umbraco.Cms.Core.DeliveryApi;

namespace LinkDev.GAFI.EgyptReady.Web.Handlers
{
    public class BlogDateFilterHandler : IFilterHandler
    {
        private const string DateFromSpecifier = "dateFrom:";
        private const string DateToSpecifier = "dateTo:";

        public bool CanHandle(string query)
        {
            return query.StartsWith(DateFromSpecifier, StringComparison.OrdinalIgnoreCase)
                || query.StartsWith(DateToSpecifier, StringComparison.OrdinalIgnoreCase);
        }

        public FilterOption BuildFilterOption(string filter)
        {

            if (filter.StartsWith(DateFromSpecifier, StringComparison.OrdinalIgnoreCase))
            {
                // Extract the 'dateFrom' value
                var dateFrom = filter.Substring(DateFromSpecifier.Length);

                // Ensure the date format is valid and convert to DateTime
                if (DateTime.TryParse(dateFrom, out var fromDate))
                {
                    return new FilterOption
                    {
                        FieldName = "blogDate", // Field to filter (assumed to be 'blogDate')
                        Values = new[] { fromDate.ToString("yyyy-MM-dd") }, // Convert to a string that matches the field format
                        Operator = FilterOperation.GreaterThanOrEqual // Filter for dates greater than or equal to 'dateFrom'
                    };
                }
            }
            else if (filter.StartsWith(DateToSpecifier, StringComparison.OrdinalIgnoreCase))
            {
                // Extract the 'dateTo' value
                var dateTo = filter.Substring(DateToSpecifier.Length);

                // Ensure the date format is valid and convert to DateTime
                if (DateTime.TryParse(dateTo, out var toDate))
                {
                    return new FilterOption
                    {
                        FieldName = "blogDate", // Field to filter (assumed to be 'blogDate')
                        Values = new[] { toDate.ToString("yyyy-MM-dd") }, // Convert to a string that matches the field format
                        Operator = FilterOperation.LessThanOrEqual // Filter for dates less than or equal to 'dateTo'
                    };
                }
            }

            // If the filter is invalid, return null
            return null;
        }


    }
}
