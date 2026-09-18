using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AgriSaarthi.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/disease-detection")]
    public class DiseaseDetectionController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<DiseaseDetectionController> _logger;

        public DiseaseDetectionController(IHttpClientFactory httpClientFactory, ILogger<DiseaseDetectionController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpPost("predict")]
        public async Task<IActionResult> PredictDisease(IFormFile image)
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest(new { message = "No image file provided." });
            }

            if (image.Length > 10 * 1024 * 1024)
            {
                return BadRequest(new { message = "File too large. Maximum size is 10MB." });
            }

            if (!image.ContentType.StartsWith("image/"))
            {
                return BadRequest(new { message = "Invalid file type. Please upload an image." });
            }

            try
            {
                using var memoryStream = new MemoryStream();
                await image.CopyToAsync(memoryStream);
                memoryStream.Position = 0;

                using var content = new MultipartFormDataContent();
                var streamContent = new StreamContent(memoryStream);
                streamContent.Headers.ContentType = new MediaTypeHeaderValue(image.ContentType);
                content.Add(streamContent, "file", image.FileName);

                var aiClient = _httpClientFactory.CreateClient("AiService");
                var response = await aiClient.PostAsync("/predict/disease", content);

                if (!response.IsSuccessStatusCode)
                {
                    if (response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable)
                    {
                        return StatusCode(502, new { message = "Disease detection service is currently unavailable." });
                    }
                    if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                    {
                        return BadRequest(new { message = "Invalid image submitted for analysis." });
                    }
                    return StatusCode(502, new { message = "Error communicating with AI service." });
                }

                var result = await response.Content.ReadFromJsonAsync<object>();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to predict disease.");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }
    }
}
