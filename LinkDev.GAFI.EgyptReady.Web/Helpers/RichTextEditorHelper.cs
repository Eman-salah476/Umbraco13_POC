using HtmlAgilityPack;
using Umbraco.Cms.Core;

namespace LinkDev.GAFI.EgyptReady.Web.Helpers
{
    public class RichTextEditorHelper
    {
        public static string GetInnerText(string htmlString)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(htmlString))
                {
                    return string.Empty;
                }
                HtmlDocument doc = new HtmlDocument();
                doc.LoadHtml(htmlString);
                if(doc.DocumentNode is not null && !string.IsNullOrEmpty(doc.DocumentNode.InnerText) )
                {
                    return System.Net.WebUtility.HtmlDecode(doc.DocumentNode.InnerText)?.Trim();
                }
                return string.Empty;
            }
            catch (Exception)
            {
                return string.Empty;
            }
        }

        public static RichTextEditorValue? DeserializeToRichTextEditorValue(string value)
        {
            return string.IsNullOrEmpty(value)
                ? null
                : Newtonsoft.Json.JsonConvert.DeserializeObject<RichTextEditorValue>(value);

        }
    }
}
