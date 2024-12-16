using LinkDev.GAFI.EgyptReady.Web.Helpers;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models;

namespace LinkDev.GAFI.EgyptReady.Web.Handlers
{
    public class BlogIndexHandler : IContentIndexHandler
    {
        private const string CategoryFieldName = "blogCategory";
        private const string dateFieldName = "blogDate";
        private const string SearchFieldName = "blogSearchFields";


        public IEnumerable<IndexField> GetFields()
        {
            return new[]
            {
            new IndexField
            {
                FieldName = CategoryFieldName,  
                FieldType = FieldType.StringRaw, // Use StringRaw for exact matching
                VariesByCulture = false
            },
            new IndexField
            {
                FieldName = SearchFieldName,
                FieldType = FieldType.StringAnalyzed, //Use StringAnalyzed for full-text search functionality, as it allows the field to be tokenized and analyzed for partial matches
                VariesByCulture = true
            },
            new IndexField
            {
                FieldName = dateFieldName,  
                FieldType = FieldType.Date,
                VariesByCulture = false
            }
        };
        }

        public IEnumerable<IndexFieldValue> GetFieldValues(IContent content, string? culture)
        {

            if (!content.ContentType.Alias.Equals("blog"))
            {
                return Enumerable.Empty<IndexFieldValue>();
            }

            var indexFieldValues = new List<IndexFieldValue>();

            // Add Index with Category ID
            var categoryIndexField = GenerateCategoryIndexField(content);
            if (categoryIndexField is not null)
            {
                indexFieldValues.Add(categoryIndexField);
            }

            // Combine title, brief, and description into one searchable field and Add index with it.
            var searchTextIndexField = GenerateSearchTextIndexField(content, culture);
            if (searchTextIndexField is not null)
            {
                indexFieldValues.Add(searchTextIndexField);
            };

            //Add Index with BlogDate
            var dateIndexField = GenerateDateIndexField(content);
            if (dateIndexField is not null)
            {
                indexFieldValues.Add(dateIndexField);
            };

            return indexFieldValues;
        }


        #region Helpers
        private IndexFieldValue? GenerateSearchTextIndexField(IContent content, string? culture)
        {

            var title = content.GetValue<string>("title", culture) ?? string.Empty;
            var brief = content.GetValue<string>("brief", culture) ?? string.Empty;
            var descriptionHtml = content.GetValue<string>("description", culture) ?? string.Empty;
            var descriptionEditorValue = RichTextEditorHelper.DeserializeToRichTextEditorValue(descriptionHtml);


            if (string.IsNullOrEmpty(title) && string.IsNullOrEmpty(brief) && string.IsNullOrEmpty(descriptionHtml))
            {
                return null;
            }
            else
            {
                string description = string.Empty;
                if(descriptionEditorValue is not null)
                    description = RichTextEditorHelper.GetInnerText(descriptionEditorValue.Markup.ToString());

                var combinedText = $"{title} {brief} {description}";
                return new IndexFieldValue
                {
                    FieldName = SearchFieldName,
                    Values = new object[] { combinedText }
                };
            }
        }

        private IndexFieldValue? GenerateCategoryIndexField(IContent content)
        {
            var category = content.GetValue<GuidUdi>(CategoryFieldName);
            if (category is not null)
            {
                return new IndexFieldValue
                {
                    FieldName = CategoryFieldName,
                    Values = new object[] { category.Guid } // Store the GUID in the index
                };
            }
            return null;
        }

        private IndexFieldValue GenerateDateIndexField(IContent content)
        {
            var blogDate = content.GetValue<DateTime>(dateFieldName);

            return new IndexFieldValue
            {
                FieldName = dateFieldName,
                Values = new object[] { blogDate.ToString("yyyy-MM-dd") }
            };

        }
        #endregion
    }
}
