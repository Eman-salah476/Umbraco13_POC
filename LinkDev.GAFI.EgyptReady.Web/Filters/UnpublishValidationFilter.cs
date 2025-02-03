using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace LinkDev.GAFI.EgyptReady.Web.Filters
{
    public class UnpublishValidationFilter : IActionFilter
    {
        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (context.HttpContext.Response.Headers.ContainsKey("X-Unpublish-Canceled"))
            {
                // Modify the status code to 400 Bad Request
                //context.Result = new BadRequestObjectResult("Unpublishing operation canceled.");
                context.HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                var parsedObject = (ObjectResult)context.Result;
                parsedObject.StatusCode = StatusCodes.Status400BadRequest;
                context.Result = parsedObject;
            }
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            
        }
    }
}
