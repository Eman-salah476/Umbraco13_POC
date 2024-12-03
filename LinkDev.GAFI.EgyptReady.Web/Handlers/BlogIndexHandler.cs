using Umbraco.Cms.Core;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models;

namespace LinkDev.GAFI.EgyptReady.Web.Handlers
{
    public class BlogIndexHandler : IContentIndexHandler
    {
        private const string CategoryFieldName = "blogCategory";
        private const string SearchFieldName = "blogSearchFields";


        public IEnumerable<IndexField> GetFields()
        {
            // Define the field to be added to the index
            return new[]
            {
            new IndexField
            {
                FieldName = CategoryFieldName,  // This must match the field name used in the FilterHandler
                FieldType = FieldType.StringRaw, // Use StringRaw for exact matching
                VariesByCulture = false
            },
              new IndexField
            {
                FieldName = SearchFieldName,
                FieldType = FieldType.StringAnalyzed,
                VariesByCulture = false
            }
        };
        }

        public IEnumerable<IndexFieldValue> GetFieldValues(IContent content, string? culture)
        {

            // Ensure the content is of type 'blog' and has a blogCategory property
            if (!content.ContentType.Alias.Equals("blog"))
            {
                return Enumerable.Empty<IndexFieldValue>();
            }

            var indexFieldValues  = new List<IndexFieldValue>();

            // Get the category ID (assuming it is stored as a GUID UDI)
            var category = content.GetValue<GuidUdi>("blogCategory");
            if (category is not null)
            {
                indexFieldValues.Add(new IndexFieldValue
                {
                    FieldName = CategoryFieldName,
                    Values = new object[] { category.Guid } // Store the GUID in the index
                });
            }
            // Combine title, brief, and description into one searchable field
            var title = content.GetValue<string>("title") ?? string.Empty;
            var brief = content.GetValue<string>("brief") ?? string.Empty;
            var description = content.GetValue<string>("description") ?? string.Empty;

            var combinedText = $"{title} {brief} {description}";
            indexFieldValues.Add(new IndexFieldValue
            {
                FieldName = SearchFieldName,
                Values = new object[] { combinedText }
            });

            return indexFieldValues;
        }
    }
}
