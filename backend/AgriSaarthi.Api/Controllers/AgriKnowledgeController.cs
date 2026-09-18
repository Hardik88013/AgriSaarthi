using System.Threading.Tasks;
using AgriSaarthi.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System;
using Microsoft.Extensions.Logging;

namespace AgriSaarthi.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/agri-knowledge")]
    public class AgriKnowledgeController : ControllerBase
    {
        private readonly IAgriKnowledgeService _knowledgeService;
        private readonly ILogger<AgriKnowledgeController> _logger;

        public AgriKnowledgeController(IAgriKnowledgeService knowledgeService, ILogger<AgriKnowledgeController> logger)
        {
            _knowledgeService = knowledgeService;
            _logger = logger;
        }

        [HttpGet("crops")]
        public async Task<IActionResult> GetCrops()
        {
            try
            {
                var result = await _knowledgeService.GetCropsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get crops knowledge.");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpGet("diseases")]
        public async Task<IActionResult> GetDiseases([FromQuery] string crop = null)
        {
            try
            {
                var result = await _knowledgeService.GetDiseasesAsync(crop);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get diseases knowledge.");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpGet("pests")]
        public async Task<IActionResult> GetPests([FromQuery] string crop = null)
        {
            try
            {
                var result = await _knowledgeService.GetPestsAsync(crop);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get pests knowledge.");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpGet("disease/{id}")]
        public async Task<IActionResult> GetDiseaseById(string id)
        {
            try
            {
                var result = await _knowledgeService.GetDiseaseByIdAsync(id);
                if (result == null) return NotFound(new { message = "Disease not found." });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get disease knowledge.");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpGet("pest/{id}")]
        public async Task<IActionResult> GetPestById(string id)
        {
            try
            {
                var result = await _knowledgeService.GetPestByIdAsync(id);
                if (result == null) return NotFound(new { message = "Pest not found." });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get pest knowledge.");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpGet("advisory")]
        public async Task<IActionResult> GetWeatherAdvisory()
        {
            try
            {
                var farmerIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(farmerIdStr, out int farmerId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                var result = await _knowledgeService.GetWeatherAdvisoryAsync(farmerId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate weather advisory.");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }
    }
}
