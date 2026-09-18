using AgriSaarthi.Api.DTOs;
using AgriSaarthi.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace AgriSaarthi.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/crop-advisory")]
    public class CropAdvisoryController : ControllerBase
    {
        private readonly IAiService _aiService;

        public CropAdvisoryController(IAiService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("recommend")]
        public async Task<IActionResult> RecommendCrop([FromBody] CropRecommendationRequestDto request)
        {
            try
            {
                var result = await _aiService.GetCropRecommendationAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(503, new { message = ex.Message });
            }
        }
    }
}
