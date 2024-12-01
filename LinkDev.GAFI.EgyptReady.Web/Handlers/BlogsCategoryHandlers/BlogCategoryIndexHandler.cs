using Umbraco.Cms.Core;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models;

namespace LinkDev.GAFI.EgyptReady.Web.Handlers.BlogsCategoryHandlers
{
    public class BlogCategoryIndexHandler : IContentIndexHandler
    {
        private const string CategorySpecifier = "category:";
        private const string FieldName = "blogCategory";

        public IEnumerable<IndexField> GetFields()
        {
            // Define the field to be added to the index
            return new[]
            {
            new IndexField
            {
                FieldName = FieldName,  // This must match the field name used in the FilterHandler
                FieldType = FieldType.StringRaw, // Use StringRaw for exact matching
                VariesByCulture = false
            }
        };
        }

        public IEnumerable<IndexFieldValue> GetFieldValues(IContent content, string? culture)
        {

            // Ensure the content is of type 'blog' and has a blogCategory property
            if (!content.ContentType.Alias.Equals("blog") || !content.HasProperty("blogCategory"))
            {
                return Enumerable.Empty<IndexFieldValue>();
            }

            // Get the category ID (assuming it is stored as a GUID UDI)
            var category = content.GetValue<GuidUdi>("blogCategory");
            if (category == null)
            {
                return Enumerable.Empty<IndexFieldValue>();
            }

            // Add the category ID to the index
            return new[]
            {
            new IndexFieldValue
            {
                FieldName = FieldName,
                Values = new object[] { category.Guid } // Store the GUID in the index
            }
        };
        }
    }
}
